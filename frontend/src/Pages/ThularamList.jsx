import React, { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { getPaginatedData } from "../api/Pagination";

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

/* ---------- Component ---------- */
export default function ThulabaramList() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchData = async (pageNo = 1, q = search) => {
    try {
      setLoading(true);
      const res = await getPaginatedData("/thulabaram-estimates", {
        page: pageNo,
        limit: meta.limit,
        search: q,
      });

      // Only set rows from paginated data
      const data = res?.data || [];
      const metaData = res?.meta || {
        page: 1,
        limit: meta.limit,
        total: data.length,
        totalPages: 1,
      };

      setRows(data);
      setMeta(metaData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      setRows([]);
      setMeta({ page: 1, limit: 5, total: 0, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    fetchData(1, value);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Thulabaram Estimates
          </h1>
          <p className="text-sm text-slate-500">
            View all thulabaram calculations
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            value={search}
            onChange={onSearchChange}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
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
                <th className="px-6 py-4 text-right">Weight (Kg)</th>
                <th className="px-6 py-4 text-right">Rate</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No records found
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {(meta.page - 1) * meta.limit + i + 1}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatDate(r.date)}</td>
                    <td className="px-6 py-4 font-mono text-slate-600">{formatTime(r.time)}</td>
                    <td className="px-6 py-4 text-right font-mono">{r.weight || 0}</td>
                    <td className="px-6 py-4 text-right font-mono">
                      {inr(r.rate?.rate || (r.weight ? r.amount / r.weight : 0))}
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-semibold">{inr(r.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
            <span className="text-xs text-slate-500">
              Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong>
            </span>

            <div className="flex gap-2">
              <button
                disabled={meta.page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 border rounded-md disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>

              <button
                disabled={meta.page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border rounded-md disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
