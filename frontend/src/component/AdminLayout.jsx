// src/component/AdminLayout.jsx
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import AdminTopbar from "./AdminTopBar";
import AdminSidebar from "./AdminSidebar";

const STORAGE_KEY = "app_sidebar_collapsed";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? false;
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
  }, [collapsed]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminTopbar
        collapsed={collapsed}
        onToggleSidebar={() => setCollapsed((v) => !v)}
        onOpenMobileSidebar={() => setMobileOpen(true)}
      />

      <AdminSidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <main
        className={[
          "pt-20 px-4 sm:px-6 transition-all duration-200",
          collapsed ? "sm:ml-16" : "sm:ml-72",
        ].join(" ")}
      >
        <Outlet />
      </main>
    </div>
  );
}