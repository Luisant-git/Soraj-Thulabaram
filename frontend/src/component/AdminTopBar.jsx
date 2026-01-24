// src/component/AppTopbar.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  LogOut,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  User as UserIcon
} from "lucide-react";

export default function AppTopbar({
  collapsed = false,
  onToggleSidebar = () => {},
  onOpenMobileSidebar = () => {},
}) {
  const [userOpen, setUserOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here (clear tokens, etc.)
    localStorage.removeItem('authToken');
    navigate('/');
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100 shadow-sm">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-700 bg-white/70 hover:bg-slate-50 transition-colors sm:hidden"
            onClick={onOpenMobileSidebar}
            title="Menu"
            aria-label="Menu"
          >
            <Menu size={18} />
          </button>

          {/* Desktop collapse toggle */}
          <button
            className="hidden sm:inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-700 bg-white/70 hover:bg-slate-50 transition-colors"
            onClick={onToggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white grid place-items-center font-semibold shadow-sm">
              S
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Soraj
              </p>
              <h1 className="text-sm font-semibold text-slate-900">
                Thulabaram Panel
              </h1>
            </div>
          </div>
        </div>

        {/* Center (search) */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="w-full relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search for anything..."
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg border-slate-200 bg-white/70 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center justify-center p-2 rounded-lg border border-slate-200 text-slate-700 bg-white/70 hover:bg-slate-50 transition-colors relative"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] grid place-items-center font-medium">
              3
            </span>
          </button>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserOpen((v) => !v)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white/70 hover:bg-slate-50 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 grid place-items-center shadow-inner">
                <User size={18} className="text-blue-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700">
                Admin
              </span>
              <ChevronDown size={14} className="hidden sm:block text-slate-400" />
            </button>

            {userOpen && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-xl shadow-lg py-1.5 z-50"
                onMouseLeave={() => setUserOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-800">Admin</p>
                  <p className="text-xs text-slate-500">admin@example.com</p>
                </div>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  onClick={() => navigate('/profile')}
                >
                  <UserIcon size={14} className="text-slate-500" />
                  Profile
                </button>
                <button
                  className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 flex items-center gap-2.5 transition-colors"
                  onClick={() => navigate('/settings')}
                >
                  <Settings size={14} className="text-slate-500" />
                  Settings
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
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