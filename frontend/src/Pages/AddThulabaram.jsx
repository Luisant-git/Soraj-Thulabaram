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

/* ========= NUMERIC INPUT GUARD ========= */
const allowOnlyDecimalNumbers = (e) => {
  const allowedKeys = [
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "Tab",
  ];

  if (allowedKeys.includes(e.key)) return;

  if (!/^[0-9.]$/.test(e.key)) {
    e.preventDefault();
  }

  if (e.key === "." && e.target.value.includes(".")) {
    e.preventDefault();
  }
};

/* ================= Component ================= */

export default function ThulabaramEstimate() {
  const [latestRate, setLatestRate] = useState("");
  const [form, setForm] = useState(defaultForm(""));
  const [loading, setLoading] = useState(false);
  const formRef = useRef(null);

  /* ========= Fetch Latest Rate ========= */
  useEffect(() => {
    (async () => {
      try {
        const rates = await getAllRates();
        if (!rates?.length) return;

        const latest = rates.reduce((a, b) => (b.id > a.id ? b : a));
        const baseRate = String(latest.rate);

        setLatestRate(baseRate);
        setForm((p) => ({ ...p, rate: baseRate }));
      } catch {
        toast.error("Failed to fetch rate");
      }
    })();
  }, []);

  /* ========= MAIN LOGIC ========= */
  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      const weight = parseFloat(updated.weight) || 0;
      const touch = parseFloat(updated.touch) || 0;
      const baseRate = parseFloat(latestRate) || 0;

      // ✅ Always calculate: rate = baseRate * (touch / 100)
      const finalRate = touch ? (baseRate * touch) / 100 : baseRate;

      updated.rate = finalRate ? finalRate.toFixed(2) : "";

      if (weight && finalRate) {
        updated.amount = (weight * finalRate).toFixed(2);
      } else {
        updated.amount = "";
      }

      return updated;
    });
  };

  /* ========= Save ========= */
  const save = async () => {
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
      const res = await createThulabaramEstimate(payload);
      toast.success("Added Successfully");

      const newId = res?.id || res?.data?.id;
      if (newId) {
        window.open(
          `${import.meta.env.VITE_API_URL}/thulabaram-estimates/download/${newId}`,
          "_blank"
        );
      }

      setForm(defaultForm(latestRate));
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  /* ========= UI ========= */
  return (
    <div className="min-h-screen bg-slate-50 flex justify-center p-6">
      <div className="w-full max-w-4xl">
        <h1 className="text-2xl font-semibold mb-4">Thulabaram Estimate</h1>

        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="bg-white p-6 rounded-xl shadow"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextInput
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={onChange}
            />
            <TextInput
              label="Time"
              type="time"
              name="time"
              value={form.time}
              onChange={onChange}
            />

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

            <TextInput
              label="Rate (₹)"
              name="rate"
              placeholder="Auto from touch"
              value={form.rate}
              disabled
            />
            <TextInput
              label="Amount (₹)"
              name="amount"
              placeholder="Auto calculated"
              value={form.amount}
              disabled
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button
              type="submit"
              disabled={loading}
              icon={<Printer className="w-4 h-4" />}
            >
              Add & Print
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}