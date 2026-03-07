import React, { useEffect, useState } from "react";
import { Eye, Search, X } from "lucide-react";
import { getPaginatedData } from "../api/Pagination";

import { Button } from "../component/FormFiled";
import TextButton from "../component/Button";

/* ---------- Helpers ---------- */
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return `${String(d.getDate()).padStart(2, "0")}/${String(
    d.getMonth() + 1
  ).padStart(2, "0")}/${d.getFullYear()}`;
};

const formatTime = (t) => {
  if (!t) return "-";
  const [h = "00", m = "00"] = t.split(":");
  let hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${m} ${period}`;
};

const inr = (n) =>
  `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;


const limitOptions = [10, 20, 50, 100, 150, 200];
/* ---------- Component ---------- */
export default function ThulabaramList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [openView, setOpenView] = useState(false);
const [selected, setSelected] = useState(null);

const openModal = (row) => {
  setSelected(row);
  setOpenView(true);
};

const closeModal = () => {
  setOpenView(false);
  setSelected(null);
};

  const fetchData = async (pageNo = 1, q = search, limit = meta.limit) => {
    try {
      setLoading(true);
  
      const res = await getPaginatedData("/thulabaram-estimates", {
        page: pageNo,
        limit: limit,
        search: q,
      });
  
      const data = res?.data || [];
  
      const metaData = res?.meta || {
        page: 1,
        limit: limit,
        total: data.length,
        totalPages: 1,
      };
  
      setRows(data);
      setMeta(metaData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setRows([]);
      setMeta({ page: 1, limit: limit, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, search, meta.limit);
  }, [page]);
  const onSearchChange = (value) => {
    setSearch(value);
    setPage(1);
    fetchData(1, value);
  };

  const handleLimitChange = (e) => {
    const value = Number(e.target.value);
  
    setPage(1);
  
    fetchData(1, search, value);
  };

  function DetailRow({ label, value, mono, strong }) {
    return (
      <div className="flex items-center justify-between gap-6 py-3">
        <div className="text-sm text-slate-600">{label}</div>
        <div
          className={[
            "text-sm text-slate-900 text-right",
            strong ? "font-semibold" : "font-medium",
            mono ? "font-mono" : "",
          ].join(" ")}
        >
          {value ?? "-"}
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thulabaram List
          </h1>
          <p className="text-sm text-slate-500">
            View all thulabaram calculations
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row items-center gap-3">

          {/* Entries Dropdown */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Show</span>

            <select
              value={meta.limit}
              onChange={handleLimitChange}
              className="border rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <span className="text-slate-600">entries</span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
  <input
    type="date"
    value={search}
    onChange={(e) => onSearchChange(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
    className="w-full pl-3 pr-8 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
  />

  {search && (
    <button
      type="button"
      onClick={() => onSearchChange("")}
      className="absolute right-2 top-2.5 text-slate-400 hover:text-red-500"
    >
      <X size={16} />
    </button>
  )}
</div>

        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-slate-700 font-medium">
              <tr>
                <th className="px-6 py-4 text-left w-16">S.No</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Time</th>
                <th className="px-6 py-4 text-right">Weight (g)</th>
                <th className="px-6 py-4 text-right">Touch (%)</th>
                <th className="px-6 py-4 text-right">Rate</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
  {loading ? (
    <tr>
      {/* you have 8 columns now */}
      <td colSpan="8" className="py-8 text-center text-slate-400">Loading...</td>
    </tr>
  ) : rows.length === 0 ? (
    <tr>
      <td colSpan="8" className="py-8 text-center text-slate-400">No records found</td>
    </tr>
  ) : (
    rows.map((r, i) => (
      <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
        <td className="px-6 py-4 text-slate-500">
          {(page - 1) * meta.limit + i + 1}
        </td>
        <td className="px-6 py-4 font-medium">{formatDate(r.date)}</td>
        <td className="px-6 py-4 font-mono text-slate-600">{formatTime(r.time)}</td>
        <td className="px-6 py-4 text-right font-mono">{r.weight || 0}</td>
        <td className="px-6 py-4 text-right font-mono">{r.touch || 0}</td>
        <td className="px-6 py-4 text-right font-mono">
          {inr(((r.rate?.rate || 0) * (r.touch || 0)) / 100)}
        </td>
        <td className="px-6 py-4 text-right font-mono font-semibold">{inr(r.amount)}</td>

        <td className="px-6 py-4 text-right">
  <button
    type="button"
    onClick={() => openModal(r)}
    title="View"
    className="inline-flex h-9 w-9 items-center justify-center 
              text-blue-600
               focus:outline-none "
  >
    <Eye size={18} />
  </button>
</td>
      </tr>
    ))
  )}
</tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.total > 0 && (
          <div className="flex items-center justify-center gap-4 px-6 py-4 border-t bg-slate-50">

            <Button
             className="px-3 py-1.5 border rounded-md text-sm bg-white  disabled:opacity-50 disabled:cursor-not-allowed"
             
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>

            <span className="text-sm font-medium text-slate-700">
              Page {page} of {meta.totalPages}
            </span>

            <Button
             className="px-3 py-1.5 border rounded-md text-sm bg-white  disabled:opacity-50 disabled:cursor-not-allowed"
             
              disabled={page === meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>

          </div>
        )}
      </div>
      {openView && (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    {/* Backdrop (click to close) */}
    <button
      type="button"
      onClick={closeModal}
      className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      aria-label="Close modal backdrop"
    />

    {/* Dialog */}
    <div
      className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-2xl"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b bg-white px-6 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Thulabaram Details
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View calculation summary
          </p>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body (form-like) */}
      {/* Body (view look) */}
<div className="bg-white px-6 py-5">
  <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
    <div className="px-5 divide-y divide-slate-100">
      <DetailRow label="Date" value={formatDate(selected?.date)} />
      <DetailRow label="Time" value={formatTime(selected?.time)} mono />
      <DetailRow label="Weight (g)" value={selected?.weight ?? 0} mono />
      <DetailRow label="Touch (%)" value={selected?.touch ?? 0} mono />
      <DetailRow label="Base Rate" value={inr(selected?.rate?.rate ?? 0)} mono />
      <DetailRow
        label="Calculated Rate"
        value={inr(((selected?.rate?.rate || 0) * (selected?.touch || 0)) / 100)}
        mono
      />
    </div>

    <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Total Amount</span>
        <span className="text-base font-semibold text-slate-900 font-mono">
          {inr(selected?.amount ?? 0)}
        </span>
      </div>
    </div>
  </div>
</div>

    </div>
  </div>
)}
    </div>
  );
}
