// src/component/AppTopbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon,
} from "lucide-react";

export default function AppTopbar({
  collapsed = false,
  onToggleSidebar = () => {},
  onOpenMobileSidebar = () => {},
}) {
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 bg-white/80 hover:bg-slate-50 transition-colors sm:hidden"
            onClick={onOpenMobileSidebar}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            className="hidden sm:inline-flex items-center justify-center p-2 rounded-xl border border-slate-200 text-slate-700 bg-white/80 hover:bg-slate-50 transition-colors"
            onClick={onToggleSidebar}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white grid place-items-center font-semibold shadow-sm">
              V
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Velan
              </p>
              <h1 className="text-sm font-semibold text-slate-900 tracking-tight">
                Thulabaram 
              </h1>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-white/80 hover:bg-slate-50 transition-colors shadow-sm"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center shadow-inner">
                <UserIcon size={18} className="text-blue-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-800">
                Admin
              </span>
            </button>

            {userOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 z-50"
                onMouseLeave={() => setUserOpen(false)}
              >
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                  onClick={handleLogout}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}