// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./component/Login";
import AdminLayout from "./component/AdminLayout";

import AddThulabaram from "./Pages/AddThulabaram";
import ThularamList from "./Pages/ThularamList";
import ThulabaramRateList from "./Pages/RateList";

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="thulabaram/add" />} />
          <Route path="thulabaram/add" element={<AddThulabaram />} />
          <Route path="thulabaram/list" element={<ThularamList/>} />
          <Route path="thulabaram/rates" element={<ThulabaramRateList />} />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}