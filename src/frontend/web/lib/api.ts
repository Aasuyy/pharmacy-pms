const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://pharmacy-pms.onrender.com";

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token") || localStorage.getItem("token");
};

export const getCustomerToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("customer_token") || localStorage.getItem("token");
};

export const logoutAdmin = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("token");
    window.location.href = "/admin/login";
  }
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAdminToken() || getCustomerToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "API Request Failed");
  }

  return response.json();
}

export const staffLogin = async (...args: any[]) => {
  const body = args.length === 1 && typeof args[0] === "object" ? args[0] : { username: args[0], password: args[1] };
  return apiFetch("/auth/staff/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const customerLogin = async (credentials: Record<string, any>) => {
  return apiFetch("/auth/customer/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
};

export const customerRegister = async (...args: any[]) => {
  const body = args.length === 1 && typeof args[0] === "object" 
    ? args[0] 
    : { name: args[0], email: args[1], password: args[2], phone: args[3] };
  return apiFetch("/auth/customer/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
};

export const fetchCustomer = async () => apiFetch("/customers/me");
export const fetchCustomerOrders = async () => apiFetch("/orders/my-orders");
export const fetchOrder = async (id: string | number) => apiFetch(`/orders/${id}`);
export const placeOrder = async (orderData: Record<string, any>) => {
  return apiFetch("/orders", {
    method: "POST",
    body: JSON.stringify(orderData),
  });
};

export const fetchOrders = async () => apiFetch("/admin/orders");
export const updateOrderStatus = async (id: string | number, status: string) => {
  return apiFetch(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const adminApi = {
  getLogs: async () => apiFetch("/admin/audit-logs"),
  getUsers: async () => apiFetch("/admin/users"),
  getMetrics: async () => apiFetch("/admin/metrics"),
};
