import React, { useEffect, useRef, useState } from "react";
import { Printer } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import {
  createThulabaramEstimate,
  getThulabaramEstimateById,
  updateThulabaramEstimate,
} from "../api/Thulabaram";
import { getAllRates } from "../api/Rate";

import { Button, TextInput } from "../component/FormFiled";

// --- Helpers ---
const fmtDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const fmtTime = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0"
  )}`;

const toInputDate = (s) => {
  if (!s) return fmtDate();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split("T")[0];
  const d = new Date(s);
  if (isNaN(d.getTime())) return fmtDate();
  return fmtDate(d);
};

const toInputTime = (t) => {
  if (!t) return fmtTime();
  const [h = "00", m = "00"] = String(t).split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

// default form now accepts a rate so reset keeps the latest rate
const defaultForm = (rate = "") => ({
  date: fmtDate(),
  time: fmtTime(),
  weight: "",
  touch: "", // just display
  rate: rate ? String(rate) : "",
  amount: "",
});

export default function ThulabaramEstimate() {
  const [latestRate, setLatestRate] = useState(""); // <-- keep latest master rate
  const [form, setForm] = useState(() => defaultForm(""));
  const [loading, setLoading] = useState(false);
  const [rateOptions, setRateOptions] = useState([]);
  const formRef = useRef(null);

  const [sp] = useSearchParams();
  const id = sp.get("id");
  const isEdit = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Fetch master rates ---
  useEffect(() => {
    (async () => {
      try {
        const rates = await getAllRates();
        setRateOptions(rates);

        if (rates.length) {
          const latest = rates.reduce(
            (prev, curr) => (curr.id > prev.id ? curr : prev),
            rates[0]
          );

          const lr = String(latest.rate ?? "");
          setLatestRate(lr);

          // For new record: set rate immediately if empty
          if (!isEdit) {
            setForm((p) => ({ ...p, rate: p.rate || lr }));
          }
        }
      } catch {
        toast.error("Failed to fetch master rates");
      }
    })();
  }, [isEdit]);

  // --- Prefill form for edit ---
  useEffect(() => {
    if (!isEdit) return;

    const stateRow = location.state;
    if (stateRow?.id && String(stateRow.id) === String(id)) {
      setForm({
        date: toInputDate(stateRow.date),
        time: toInputTime(stateRow.time),
        weight: String(stateRow.weight ?? ""),
        touch: String(stateRow.touch ?? ""),
        rate: String(stateRow.rate ?? ""),
        amount: String(stateRow.amount ?? ""),
      });
      return;
    }

    (async () => {
      try {
        const row = await getThulabaramEstimateById(id);
        setForm({
          date: toInputDate(row.date),
          time: toInputTime(row.time),
          weight: String(row.weight ?? ""),
          touch: String(row.touch ?? ""),
          rate: String(row.rate ?? ""),
          amount: String(row.amount ?? ""),
        });
      } catch {
        toast.error("Record not found");
        navigate("/admin/thulabaram/list");
      }
    })();
  }, [isEdit, id, location.state, navigate]);

  // --- Handle input changes ---
  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate amount if weight or rate changed
      if (
        (name === "weight" || name === "rate") &&
        updated.weight &&
        updated.rate
      ) {
        const w = parseFloat(updated.weight) || 0;
        const r = parseFloat(updated.rate) || 0;
        updated.amount = (w * r).toFixed(2);
      }

      return updated;
    });
  };

  // reset but keep latest rate (no manual refresh needed)
  const resetForm = () => setForm(defaultForm(latestRate));

  // --- Open receipt ---
  const openReceiptInNewTab = (estimateId) => {
    const receiptUrl = `${import.meta.env.VITE_API_URL
      }/thulabaram-estimates/download/${estimateId}`;
    window.open(receiptUrl, "_blank");
  };

  // --- Save form ---
  const save = async () => {
    if (!form.weight) return toast.error("Please enter the Weight");
    if (!form.rate) return toast.error("Please enter the Rate");
    if (!form.amount) return toast.error("Please enter the Amount");

    const el = formRef.current;
    if (el && !el.checkValidity()) {
      el.reportValidity();
      return;
    }

    const payload = {
      date: form.date,
      time: form.time,
      weight: parseFloat(form.weight),
      touch: parseFloat(form.touch || 0),
      rate: parseFloat(form.rate),
      amount: parseFloat(form.amount),
    };

    try {
      setLoading(true);
      let response;

      if (isEdit) {
        response = await updateThulabaramEstimate(id, payload);
        toast.success("Updated Successfully");
      } else {
        response = await createThulabaramEstimate(payload);
        toast.success("Added Successfully!");
      }

      // --- Open receipt automatically ---
      const newId = response?.id || response?.data?.id;
      if (newId) openReceiptInNewTab(newId);

      // reset only for add, but keep latest rate
      if (!isEdit) resetForm();
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    save();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          {isEdit ? "Edit Thulabaram" : "Thulabaram Estimate"}
        </h1>

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="bg-white border rounded-xl shadow-sm p-5"
          noValidate
        >
          <h3 className="text-base font-semibold mb-4 text-slate-900">
            {isEdit ? "Update Details" : "Estimate Details"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Date"
              name="date"
              type="date"
              value={form.date}
              onChange={onChange}
            />
            <TextInput
              label="Time"
              name="time"
              type="time"
              value={form.time}
              onChange={onChange}
            />

            <TextInput
              label="Weight (g)"
              name="weight"
              type="number"
              step="0.001"
              min="0.001"
              placeholder="Enter weight in grams"
              value={form.weight}
              onChange={onChange}
              required
            />

            <TextInput
              label="Touch (%)"
              name="touch"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Enter touch (optional)"
              value={form.touch}
              onChange={onChange}
            />

            <TextInput
              label="Rate (₹)"
              name="rate"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter rate or use latest"
              value={form.rate}
              onChange={onChange}
              required
            />

            <TextInput
              label="Amount (₹)"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Auto-calculated"
              value={form.amount}
              onChange={onChange}
              required
            />
          </div>

          <div className="flex justify-end mt-5">
            <Button
              type="submit"
              icon={<Printer className="w-4 h-4" />}
              disabled={loading}
            >
              {isEdit ? "Update" : "Add & Print"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}