// src/api/Thulabaram.js

const API_BASE = import.meta.env.VITE_API_URL

// GET ALL: http://localhost:3000/rate
export async function getAllRates() {
  const res = await fetch(`${API_BASE}/rate`);
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to fetch rates");
  }
  return res.json();
}

// CREATE: POST http://localhost:3000/rate
export async function createRate(date, rate, isActive = true) {
  const res = await fetch(`${API_BASE}/rate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, rate, isActive }),
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to create rate");
  }
  return res.json();
}

// UPDATE: PATCH http://localhost:3000/rate/{id}
export async function updateRate(id, data) {
  const res = await fetch(`${API_BASE}/rate/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to update rate");
  }
  return res.json();
}

// DELETE: DELETE http://localhost:3000/rate/{id}
export async function deleteRate(id) {
  const res = await fetch(`${API_BASE}/rate/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Failed to delete rate");
  }
  return res.json();
}

// GET SINGLE: GET http://localhost:3000/rate/{id}
export async function getRate(id) {
  const res = await fetch(`${API_BASE}/rate/${id}`);
  if (!res.ok) throw new Error("Failed to fetch rate");
  return res.json();
}