const API_BASE_URL = "http://localhost:3000/thulabaram-estimates";

export async function downloadThulabaramReceipt(id) {
  const res = await fetch(`${API_BASE_URL}/download/${id}`);
  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `thulabaram_${id}.html`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}
