import React, { useEffect, useState, useMemo } from "react";
import { PlusCircle, Pencil, Trash2, X, ChevronLeft, ChevronRight, RefreshCcw } from "lucide-react";
import { toast } from "react-toastify";
import { createRate, deleteRate, getAllRates, updateRate } from "../api/Rate";



// --- Helpers ---
const fmtDateForInput = (d = new Date()) => {
  const date = new Date(d);
  if (isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
};

const formatShortDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

const inr = (n) =>
  `₹ ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// --- Modal Component ---
const RateModal = ({ isOpen, onClose, onSubmit, initialData, loading }) => {
  const [form, setForm] = useState({ date: fmtDateForInput(), rate: "" });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          date: fmtDateForInput(initialData.date),
          rate: initialData.rate,
        });
      } else {
        setForm({ date: fmtDateForInput(), rate: "" });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.rate || isNaN(form.rate)) {
      toast.error("Please enter a valid rate");
      return;
    }
    onSubmit({
      date: form.date,
      rate: parseFloat(form.rate),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center px-5 py-4 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-800">
            {initialData ? "Edit Rate" : "Add Daily Rate"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Rate (per g)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="e.g. 120.50"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              value={form.rate}
              onChange={(e) => setForm({ ...form, rate: e.target.value })}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : initialData ? "Update Rate" : "Save Rate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main List Component ---
export default function ThulabaramRateList() {
  const [allRecords, setAllRecords] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  const [page, setPage] = useState(1);
  const itemsPerPage = 10; 

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchRates = async () => {
    try {
      setLoading(true);
      const res = await getAllRates();
      let list = Array.isArray(res) ? res : (res?.data || []);
      // Using Backend Sort Order (Assuming Backend sends correct order)
      setAllRecords(list);
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to fetch rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return allRecords.slice(start, start + itemsPerPage);
  }, [allRecords, page]);

  const totalPages = Math.ceil(allRecords.length / itemsPerPage) || 1;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) setPage(newPage);
  };

  const handleAddClick = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    try {
      setSubmitting(true);
      if (editingItem) {
        const idToUpdate = editingItem.id || editingItem._id;
        await updateRate(idToUpdate, {
          date: formData.date,
          rate: formData.rate
        });
        toast.success("Rate updated successfully");
      } else {
        await createRate(formData.date, formData.rate, true);
        toast.success("Rate added successfully");
      }
      setIsModalOpen(false);
      fetchRates(); 
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Operation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this rate?")) return;
    try {
      const idToDelete = item.id || item._id;
      await deleteRate(idToDelete);
      toast.success("Deleted successfully");
      if (paginatedRows.length === 1 && page > 1) {
        setPage(p => p - 1);
      }
      fetchRates();
    } catch (e) {
      console.error(e);
      toast.error(e.message || "Failed to delete");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thulabaram Rate List</h1>
          <p className="text-sm text-slate-500">Manage daily rates per gram</p>
        </div>

        <div className="flex gap-2">
           
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <PlusCircle size={18} />
            <span>Add Rate</span>
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-700 font-medium border-b">
              {/* REMOVED text-right from Rate, ADDED uniform padding (px-6 py-4) */}
              <tr>
                <th className="px-6 py-4 text-left w-20">S.No</th>
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-left">Rate (₹)</th>
                <th className="px-6 py-4 text-right w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && allRecords.length === 0 ? (
                 <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : allRecords.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No rates found</td></tr>
              ) : (
                paginatedRows.map((row, index) => (
                  <tr key={row.id || row._id || index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {(page - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {formatShortDate(row.date)}
                    </td>
                    {/* Aligned to LEFT to sit next to Date */}
                    <td className="px-6 py-4 text-left font-mono text-slate-700">
                      {inr(row.rate)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(row)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(row)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {allRecords.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t bg-slate-50">
            <div className="text-xs text-slate-500">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-1.5 border rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 border rounded-md hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <RateModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        initialData={editingItem}
        loading={submitting}
      />
    </div>
  );
}