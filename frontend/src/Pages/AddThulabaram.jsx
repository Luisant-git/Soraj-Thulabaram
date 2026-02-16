import React, { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { toast } from "react-toastify";

import { createThulabaramEstimate } from "../api/Thulabaram";
import { getAllRates } from "../api/Rate";
import { Button, TextInput } from "../component/FormFiled";

/* ================= Helpers ================= */
const fmtDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const fmtTime = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`;

const defaultForm = (rate = "") => ({
  date: fmtDate(),
  time: fmtTime(),
  weight: "",
  touch: "",
  rate,
  amount: "",
});

/* ========= Numeric Guards ========= */
const allowOnlyDecimalNumbers = (e) => {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter"];
  if (allowedKeys.includes(e.key)) return;

  if (!/^[0-9.]$/.test(e.key)) e.preventDefault();
  if (e.key === "." && e.currentTarget.value.includes(".")) e.preventDefault();
};

const sanitizeDecimal = (v = "") => {
  v = String(v).replace(/[^0-9.]/g, "");
  const parts = v.split(".");
  if (parts.length <= 2) return v;
  return parts[0] + "." + parts.slice(1).join("");
};

export default function ThulabaramEstimate() {
  const [latestRate, setLatestRate] = useState("");
  const [rateLoading, setRateLoading] = useState(true);

  const [form, setForm] = useState(defaultForm(""));
  const [loading, setLoading] = useState(false);

  const rateToastShownRef = useRef(false);

  /* ========= Fetch Latest Rate ========= */
  useEffect(() => {
    (async () => {
      try {
        setRateLoading(true);

        const rates = await getAllRates();

        if (!rates?.length) {
          setLatestRate("");
          setForm((p) => ({ ...p, rate: "", amount: "" }));
          if (!rateToastShownRef.current) {
            toast.error("Rate is not available. Please add Rate first.");
            rateToastShownRef.current = true;
          }
          return;
        }

        const latest = rates.reduce((a, b) => (b.id > a.id ? b : a));
        const baseRate = Number(latest?.rate);

        if (!baseRate || Number.isNaN(baseRate) || baseRate <= 0) {
          setLatestRate("");
          setForm((p) => ({ ...p, rate: "", amount: "" }));
          if (!rateToastShownRef.current) {
            toast.error("Rate is not available. Please fix Rate first.");
            rateToastShownRef.current = true;
          }
          return;
        }

        setLatestRate(String(baseRate));
        setForm((p) => ({ ...p, rate: String(baseRate) }));
      } catch {
        setLatestRate("");
        setForm((p) => ({ ...p, rate: "", amount: "" }));
        if (!rateToastShownRef.current) {
          toast.error("Failed to fetch rate. Please try again.");
          rateToastShownRef.current = true;
        }
      } finally {
        setRateLoading(false);
      }
    })();
  }, []);

  /* ========= MAIN LOGIC ========= */
  const onChange = (e) => {
    const { name } = e.target;
    let { value } = e.target;

    if (name === "weight" || name === "touch") value = sanitizeDecimal(value);

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      const baseRate = parseFloat(latestRate);
      if (!baseRate || Number.isNaN(baseRate) || baseRate <= 0) {
        updated.rate = "";
        updated.amount = "";
        return updated;
      }

      const weight = parseFloat(updated.weight) || 0;
      const touch = parseFloat(updated.touch) || 0;

      const finalRate = touch ? (baseRate * touch) / 100 : baseRate;
      updated.rate = finalRate ? finalRate.toFixed(2) : "";
      updated.amount = weight && finalRate ? (weight * finalRate).toFixed(2) : "";

      return updated;
    });
  };

  /* ========= PDF helpers ========= */
  const fetchPdfBlob = async (id) => {
    const url = `${import.meta.env.VITE_API_URL}/thulabaram-estimates/download-pdf/${id}`;
    const resp = await fetch(url);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Unable to print (PDF ${resp.status}): ${text?.slice(0, 120) || resp.statusText}`);
    }

    const ct = resp.headers.get("content-type") || "";
    if (!ct.includes("pdf")) {
      const text = await resp.text().catch(() => "");
      throw new Error(`Unable to print (Not PDF: ${ct}) ${text?.slice(0, 120)}`);
    }

    return resp.blob();
  };

  // ✅ Download + Print with NO preview / NO new tab
  const downloadAndPrintPdfBlob = (blob, fileName) =>
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);

      // 1) Download (silent)
      try {
        const a = document.createElement("a");
        a.href = objectUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (e) {
        // download fail should not stop print; continue
      }

      // 2) Print via hidden iframe
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = objectUrl;

      let done = false;

      const cleanup = () => {
        try { URL.revokeObjectURL(objectUrl); } catch {}
        try { iframe.remove(); } catch {}
      };

      const ok = () => {
        if (done) return;
        done = true;
        window.removeEventListener("afterprint", onAfterPrintWindow);
        cleanup();
        resolve(true);
      };

      const fail = (err) => {
        if (done) return;
        done = true;
        window.removeEventListener("afterprint", onAfterPrintWindow);
        cleanup();
        reject(err);
      };

      // Some browsers fire afterprint on parent window
      const onAfterPrintWindow = () => ok();
      window.addEventListener("afterprint", onAfterPrintWindow);

      iframe.onload = () => {
        try {
          const w = iframe.contentWindow;
          if (!w) throw new Error("Print window not available");

          // Some browsers fire afterprint on iframe window
          w.onafterprint = () => ok();

          w.focus();
          w.print();
        } catch (e) {
          fail(e);
        }
      };

      iframe.onerror = () => fail(new Error("Unable to load PDF for printing"));

      document.body.appendChild(iframe);

      // If print dialog blocked/not opened, afterprint won't fire
      setTimeout(() => {
        if (!done) fail(new Error("Unable to print (print dialog not opened)"));
      }, 20000);
    });

  /* ========= Save ========= */
  const save = async () => {
    const baseRate = parseFloat(latestRate);
    if (!baseRate || Number.isNaN(baseRate) || baseRate <= 0) {
      return toast.error("Rate is missing. Please add/fix Rate first.");
    }

    if (!form.weight) return toast.error("Weight is required");
    if (!form.touch) return toast.error("Touch is required");

    const payload = {
      date: form.date,
      time: form.time,
      weight: parseFloat(form.weight),
      touch: parseFloat(form.touch),
      rate: parseFloat(form.rate),
      amount: parseFloat(form.amount),
    };

    try {
      setLoading(true);

      // 1) Save
      const res = await createThulabaramEstimate(payload);
      const newId = res?.id || res?.data?.id;
      if (!newId) throw new Error("Unable to print (ID not returned)");

      // 2) Fetch PDF
      const pdfBlob = await fetchPdfBlob(newId);

      // 3) Download + Print (no preview)
      await downloadAndPrintPdfBlob(pdfBlob, `thulabaram-${newId}.pdf`);

      toast.success("Printed successfully");
      setForm(defaultForm(latestRate));
    } catch (e) {
      toast.error(e?.message || "Unable to print");
    } finally {
      setLoading(false);
    }
  };

  /* ========= UI ========= */
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-3 sm:p-6">
      <div className="w-full max-w-3xl">
        <h1 className="text-xl sm:text-2xl font-semibold mb-4">
          Thulabaram Estimate
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="bg-white p-4 sm:p-6 rounded-xl shadow"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <TextInput label="Date" type="date" name="date" value={form.date} onChange={onChange} />
            <TextInput label="Time" type="time" name="time" value={form.time} onChange={onChange} />

            <TextInput
              label="Weight (g)"
              name="weight"
              type="text"
              inputMode="decimal"
              placeholder="Eg: 5.250"
              value={form.weight}
              onKeyDown={allowOnlyDecimalNumbers}
              onChange={onChange}
              required
            />

            <TextInput
              label="Touch (%)"
              name="touch"
              type="text"
              inputMode="decimal"
              placeholder="Eg: 99.9 or 85.5"
              value={form.touch}
              onKeyDown={allowOnlyDecimalNumbers}
              onChange={onChange}
              required
            />

            <TextInput label="Rate (₹)" name="rate" value={form.rate} disabled />
            <TextInput label="Amount (₹)" name="amount" value={form.amount} disabled />
          </div>

          <div className="mt-5 sm:mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={loading || rateLoading}
              icon={<Printer className="w-4 h-4" />}
              full
              size="md"
              className="sm:w-auto"
            >
              {loading ? "Printing..." : "Add & Print"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}