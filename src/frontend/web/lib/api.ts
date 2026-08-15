const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Shop ───
export const fetchDrugs = (search?: string, category?: string) => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", category);
  return apiFetch(`/shop/drugs?${params.toString()}`);
};

export const fetchCategories = () => apiFetch("/shop/categories");

// ─── Orders ───
export const placeOrder = (data: any) => apiFetch("/orders/checkout", {
  method: "POST",
  body: JSON.stringify(data),
});

export const fetchOrders = () => apiFetch("/orders/");
export const fetchOrder = (id: number) => apiFetch(`/orders/${id}`);

// ─── Customers ───
export const registerCustomer = (data: any) => apiFetch("/customers/register", {
  method: "POST",
  body: JSON.stringify(data),
});

export const loginCustomer = (data: any) => apiFetch("/customers/login", {
  method: "POST",
  body: JSON.stringify(data),
});

// Aliases for pages that use old names
export const customerLogin = loginCustomer;
export const customerRegister = registerCustomer;

export const fetchCustomer = () => apiFetch("/customers/me");
export const fetchCustomerOrders = () => apiFetch("/customers/orders");

// ─── Auth Token Helpers ───
export const getCustomerToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token");
};

export const setCustomerToken = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("customer_token", token);
  }
};

export const removeCustomerToken = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("customer_token");
  }
};

// Admin
const res = await fetch(url, { 
    method: "PATCH",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

export const updateOrderStatus = async (id: number, status: string) => {
  const url = `${BASE_URL}/orders/${id}/status?status=${encodeURIComponent(status)}`;
  const res = await fetch(url, { method: "PATCH" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
};

