const BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Generic pagination API helper
 * Works with NestJS pagination response
 */
export const getPaginatedData = async (
  endpoint,
  { page = 1, limit = 10, search = "" } = {}
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

  return {
    data: result.data || [],
    meta: {
      page: result.page || 1,
      limit: result.limit || limit,
      total: result.total || 0,
      totalPages: result.totalPages || 1,
    },
  };
};