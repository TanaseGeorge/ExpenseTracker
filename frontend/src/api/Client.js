const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${API_BASE}${path}`, opts);

  if (res.status === 204) return null;

  const data = await res.json();

  if (!res.ok) {
    const msg =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
        ? data.detail.map((d) => d.msg).join(", ")
        : "Something went wrong";

    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  delete: (path) => request("DELETE", path),
};

export const usersApi = {
  create: (data) => api.post("/users/", data),
  getById: (id) => api.get(`/users/${id}`),
  login: (data) => api.post("/users/login", data),
};

export const categoriesApi = {
  list: (userId) => api.get(`/categories/?user_id=${userId}`),
  create: (data) => api.post("/categories/", data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const expensesApi = {
  list: (userId, params = {}) => {
    const q = new URLSearchParams({ user_id: userId, ...params });
    return api.get(`/expenses/?${q.toString()}`);
  },
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses/", data),
  update: (id, data) => api.patch(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  summary: (userId) => api.get(`/expenses/summary/${userId}`),
  getAiInsight: (userId) => api.get(`/expenses/ai-insight/${userId}`),
};