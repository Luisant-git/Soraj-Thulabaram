import React, { useEffect, useMemo, useRef, useState } from "react";
import { PlusCircle, Printer } from "lucide-react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";

import { 
  createThulabaramEstimate, 
  getThulabaramEstimateById, 
  updateThulabaramEstimate 
} from "../api/Thulabaram";
import { downloadThulabaramReceipt } from "../api/Receipt";
import { getAllRates } from "../api/Rate"; // fetch master rates

// Helper functions
const fmtDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

const fmtTime = (d = new Date()) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

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

const defaultForm = () => ({ date: fmtDate(), time: fmtTime(), weight: "", rateId: "" });

export default function ThulabaramEstimate() {
  const [form, setForm] = useState(defaultForm());
  const [loading, setLoading] = useState(false);
  const [rateOptions, setRateOptions] = useState([]);
  const formRef = useRef(null);

  const [sp] = useSearchParams();
  const id = sp.get("id");
  const isEdit = Boolean(id);
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch rates from master table
  useEffect(() => {
    (async () => {
      try {
        const rates = await getAllRates();
        setRateOptions(rates);
      } catch (err) {
        toast.error("Failed to load rates");
      }
    })();
  }, []);

  // Prefill form when editing
  useEffect(() => {
    if (!isEdit) return;

    const stateRow = location.state;
    if (stateRow?.id && String(stateRow.id) === String(id)) {
      setForm({
        date: toInputDate(stateRow.date),
        time: toInputTime(stateRow.time),
        weight: String(stateRow.weight ?? ""),
        rateId: String(stateRow.rateId ?? ""),
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
          rateId: String(row.rateId ?? ""),
        });
      } catch {
        toast.error("Record not found");
        navigate("/admin/thulabaram/list");
      }
    })();
  }, [isEdit, id, location.state, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => setForm(defaultForm());

  // Auto-calculate amount based on weight * selected rate
  const amount = useMemo(() => {
    const w = parseFloat(form.weight);
    const selectedRate = rateOptions.find((r) => String(r.id) === form.rateId);
    const r = selectedRate?.rate ?? 0;
    const val = !isNaN(w) && !isNaN(r) ? w * r : 0;
    return Math.round(val * 100) / 100;
  }, [form.weight, form.rateId, rateOptions]);

  const save = async () => {
    const el = formRef.current;
    if (el && !el.checkValidity()) {
      el.reportValidity();
      return;
    }

    const payload = {
      date: form.date,
      time: form.time,
      weight: parseFloat(form.weight),
      rateId: parseInt(form.rateId),
      amount,
    };

    try {
      setLoading(true);
      if (isEdit) {
        await updateThulabaramEstimate(id, payload);
        toast.success("Updated Successfully");
      } else {
        const response = await createThulabaramEstimate(payload);
        const newId = response?.id || response?.data?.id;
        if (newId) {
          toast.success("Added! Downloading receipt...");
          await downloadThulabaramReceipt(newId);
          resetForm();
        } else {
          toast.warning("Added, but could not retrieve ID for printing.");
          resetForm();
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Failed to process request");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await save();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center px-4 py-6">
      <div className="w-full max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {isEdit ? "Edit Thulabaram" : "Thulabaram Estimate"}
          </h1>
          <p className="text-sm text-slate-500">
            Enter date, time, weight and select a rate. Amount is auto-calculated.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="bg-white border rounded-xl shadow-sm p-5" noValidate>
          <h3 className="text-base font-semibold mb-4 text-slate-900">
            {isEdit ? "Update Details" : "Estimate Details"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <p className="text-xs mb-1 text-slate-600">Date</p>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 text-sm border-slate-300 outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Time */}
            <div>
              <p className="text-xs mb-1 text-slate-600">Time</p>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={onChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 text-sm border-slate-300 outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Weight */}
            <div>
              <p className="text-xs mb-1 text-slate-600">Weight (kg)</p>
              <input
                type="number"
                name="weight"
                step="0.001"
                min="0.001"
                placeholder="e.g. 1.250"
                value={form.weight}
                onChange={onChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 text-sm border-slate-300 outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            {/* Rate dropdown */}
            <div>
              <p className="text-xs mb-1 text-slate-600">Rate (per kg)</p>
              <select
                name="rateId"
                value={form.rateId}
                onChange={onChange}
                required
                disabled={loading}
                className="w-full border rounded-lg px-3 py-2 text-sm border-slate-300 outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="">Select Rate</option>
                {rateOptions.map((r) => (
                  <option key={r.id} value={r.id}>
                  ₹  {r.rate}  
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="sm:col-span-2">
              <p className="text-xs mb-1 text-slate-600">Amount (₹)</p>
              <input
                type="text"
                value={`₹ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                readOnly
                className="w-full bg-slate-50 border rounded-lg px-3 py-2 text-sm border-slate-200 text-slate-800 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="flex justify-end mt-5">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white bg-[var(--primary,#0ea5e9)] hover:brightness-95 disabled:opacity-60"
            >
              {loading ? (
                <span>Processing...</span>
              ) : isEdit ? (
                <>
                  <PlusCircle className="w-4 h-4" /> Update
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" /> Add & Print
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
