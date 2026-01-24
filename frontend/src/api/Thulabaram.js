// src/api/thulabaram.js
const API_BASE_URL = "http://localhost:3000/thulabaram-estimates";

/* CREATE */
export const createThulabaramEstimate = async (dto) => {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to create estimate");
  return res.json();
};

/* UPDATE */
export const updateThulabaramEstimate = async (id, dto) => {
  const res = await fetch(`${API_BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error((await res.text()) || "Failed to update estimate");
  return res.json();
};

/* GET BY ID */
export const getThulabaramEstimateById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch estimate");
  return res.json();
};

/* GET ALL ACTIVE */
export const getActiveThulabaramEstimates = async () => {
  const res = await fetch(API_BASE_URL);
  if (!res.ok) throw new Error("Failed to fetch active estimates");
  return res.json();
};

/* GET ALL INACTIVE */
export const getInactiveThulabaramEstimates = async () => {
  const res = await fetch(`${API_BASE_URL}/inactive`);
  if (!res.ok) throw new Error("Failed to fetch inactive estimates");
  return res.json();
};

/* SOFT DELETE (ACTIVE → FALSE) */
export const softDeleteThulabaramEstimate = async (id) => {
  const res = await fetch(`${API_BASE_URL}/${id}/inactive`, { method: "PATCH" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to deactivate estimate");
  return res.json();
};