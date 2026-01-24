const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Generic pagination API helper using fetch
 * Always returns { data, meta: { page, limit, total, totalPages } }
 *
 * @param {string} endpoint - API endpoint, e.g., "/thulabaram-estimates"
 * @param {object} options - { page, limit, search }
 * @returns {Promise<{data: Array, meta: {page, limit, total, totalPages}}>}
 */
export const getPaginatedData = async (
  endpoint,
  {
    page = 1,
    limit = 10,
    search = "",
  } = {}
) => {
  const params = new URLSearchParams({
    page,
    limit,
    search,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to fetch data");
  }

  const result = await response.json();

  // Standardize output to always include data & meta
  const data = result.thulabaramEstimate || result.data || (Array.isArray(result) ? result : []);
  const meta = result.meta || {
    page,
    limit,
    total: Array.isArray(result) ? result.length : data.length,
    totalPages: 1,
  };

  return { data, meta };
};
