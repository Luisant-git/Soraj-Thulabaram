// src/component/AppSidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { Scale, PlusCircle, List, ChevronDown, ScrollText } from "lucide-react"; // Added ScrollText

export default function AdminSidebar({
  collapsed = false,
  mobileOpen = false,
  onCloseMobile = () => {},
}) {
  const [thulabaramOpen, setThulabaramOpen] = useState(true);

  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 border",
      isActive
        ? "text-blue-700 bg-blue-50 border-blue-200 shadow-sm font-semibold"
        : "text-slate-600 border-transparent hover:text-blue-700 hover:bg-slate-50",
    ].join(" ");

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 sm:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={[
          "fixed top-16 bottom-0 left-0 z-50 bg-white border-r border-slate-200 shadow-sm",
          "transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0",
          collapsed ? "w-16" : "w-72",
        ].join(" ")}
      >
        <nav className="h-full overflow-y-auto px-2 py-3">
          {/* Thulabaram group */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => !collapsed && setThulabaramOpen((v) => !v)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition hover:bg-slate-50`}
              aria-expanded={thulabaramOpen}
              title={collapsed ? "Thulabaram" : undefined}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-slate-100 flex items-center justify-center rounded-xl">
                  <Scale size={18} className="text-blue-600" />
                </div>
                {!collapsed && (
                  <span className="font-semibold text-slate-800 text-sm">
                    Thulabaram
                  </span>
                )}
              </div>
              {!collapsed && (
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${
                    thulabaramOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </button>

            {/* Expanded submenu (sidebar open) */}
            {!collapsed && thulabaramOpen && (
              <ul className="pl-12 mt-2 space-y-2">
                <li>
                  <NavLink to="/admin/thulabaram/add" className={linkClass} onClick={onCloseMobile}>
                    <PlusCircle size={16} className="shrink-0" />
                    <span>Add Thulabaram</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/thulabaram/list" className={linkClass} onClick={onCloseMobile}>
                    <List size={16} className="shrink-0" />
                    <span>Thulabaram List</span>
                  </NavLink>
                </li>
                {/* Rate List Item */}
                <li>
                  <NavLink to="/admin/thulabaram/rates" className={linkClass} onClick={onCloseMobile}>
                    <ScrollText size={16} className="shrink-0" />
                    <span>Rate List</span>
                  </NavLink>
                </li>
              </ul>
            )}

            {/* Flyout submenu (when collapsed) */}
            {collapsed && (
              <div className="absolute left-full top-2 ml-2 hidden group-hover:block">
                <div className="w-56 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-xl p-2">
                  <p className="px-2 pt-1 pb-2 text-xs font-semibold text-slate-500">
                    Thulabaram
                  </p>
                  <ul className="space-y-1">
                    <li>
                      <NavLink to="/admin/thulabaram/add" className={linkClass}>
                        <PlusCircle size={16} className="shrink-0" />
                        <span>Add Thulabaram</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/admin/thulabaram/list" className={linkClass}>
                        <List size={16} className="shrink-0" />
                        <span>Thulabaram List</span>
                      </NavLink>
                    </li>
                    {/* Rate List Item in Flyout */}
                    <li>
                      <NavLink to="/admin/thulabaram/rates" className={linkClass}>
                        <ScrollText size={16} className="shrink-0" />
                        <span>Rate List</span>
                      </NavLink>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}