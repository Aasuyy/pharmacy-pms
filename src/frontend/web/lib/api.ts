const API_URL = "https://pharmacy-pms.onrender.com";

function extractError(errData: any): string {
  if (errData == null) return "Something went wrong";
  if (typeof errData.detail === "string") return errData.detail;
  if (Array.isArray(errData.detail)) {
    return errData.detail.map((d: any) => d.msg || String(d)).join(", ");
  }
  if (errData.message) return errData.message;
  return "Something went wrong";
}

// ─── AUTH ───
export async function customerLogin(email: string, password: string) {
  const res = await fetch(API_URL + "/customer/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  const data = await res.json();
  localStorage.setItem("pharma_customer_token", data.access_token);
  localStorage.setItem("pharma_user_id", data.customer_id || "cust_1");
  return data;
}

export async function customerRegister(name: string, email: string, password: string, phone?: string) {
  const res = await fetch(API_URL + "/customer/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: name, email, password, phone }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  return res.json();
}

// Staff/Admin use OAuth2 form login at /auth/login
async function formLogin(username: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);
  const res = await fetch(API_URL + "/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  return res.json();
}

export async function staffLogin(username: string, password: string) {
  const data = await formLogin(username, password);
  localStorage.setItem("pharma_staff_token", data.access_token);
  return data;
}

export async function adminLogin(username: string, password: string) {
  const data = await formLogin(username, password);
  localStorage.setItem("pharma_admin_token", data.access_token);
  return data;
}

export function getCustomerToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("pharma_customer_token") || "";
}

export function getStaffToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("pharma_staff_token") || "";
}

export function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("pharma_admin_token") || "";
}

export function getUserRole() {
  if (typeof window === "undefined") return null;
  const token = getAdminToken() || getStaffToken() || getCustomerToken();
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.role || "customer";
  } catch {
    return "customer";
  }
}

export function logoutCustomer() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pharma_customer_token");
  localStorage.removeItem("pharma_user_id");
}

export function logoutStaff() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pharma_staff_token");
}

export function logoutAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("pharma_admin_token");
}

export function clearAdminAuth() { logoutAdmin(); }
export function clearStaffAuth() { logoutStaff(); }
export function clearCustomerAuth() { logoutCustomer(); }

function getToken() {
  if (typeof window === "undefined") return "";
  return getCustomerToken() || getStaffToken() || getAdminToken();
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
    "x-user-id": typeof window === "undefined" ? "guest" : (localStorage.getItem("pharma_user_id") || "guest"),
  };
}

// ─── SHOP / MEDICINES ───
export async function fetchMedicines(params?: { category?: string; search?: string; page?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.append("search", params.search);
  if (params?.category) qs.append("category", params.category);
  const res = await fetch(API_URL + "/shop/drugs?" + qs.toString());
  if (!res.ok) throw new Error("Failed to fetch medicines");
  const data = await res.json();
  return data.drugs || [];
}

export async function fetchMedicine(id: string) {
  const res = await fetch(API_URL + "/shop/drugs/" + id);
  if (!res.ok) throw new Error("Medicine not found");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(API_URL + "/shop/categories");
  const data = await res.json();
  const cats = data.categories || [];
  return cats.map((name: string) => ({ id: name, name }));
}

export async function fetchRelated(id: string) {
  const drugs = await fetchMedicines();
  return drugs.filter((d: any) => d.id !== id).slice(0, 4);
}

// ─── CART ───
export async function getCart() {
  const res = await fetch(API_URL + "/cart/", { headers: { Authorization: "Bearer " + getToken() } });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(medicine_id: string, quantity: number = 1) {
  const res = await fetch(API_URL + "/cart/add", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ drug_id: parseInt(medicine_id), quantity }),
  });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function updateCart(medicine_id: string, quantity: number) {
  const res = await fetch(API_URL + "/cart/update-drug/" + medicine_id, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!res.ok) throw new Error("Failed to update cart");
  return res.json();
}

export async function removeFromCart(medicine_id: string) {
  const res = await fetch(API_URL + "/cart/remove-drug/" + medicine_id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() },
  });
  if (!res.ok) throw new Error("Failed to remove from cart");
  return res.json();
}

export async function clearCart() {
  const res = await fetch(API_URL + "/cart/clear", {
    method: "DELETE",
    headers: { Authorization: "Bearer " + getToken() },
  });
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
}

export async function checkInteractions() {
  return { interactions: [], safe: true };
}

// ─── PRESCRIPTIONS ───
export async function uploadPrescription(file: File, notes: string = "") {
  const form = new FormData();
  form.append("file", file);
  form.append("notes", notes);
  const res = await fetch(API_URL + "/prescriptions/upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + getToken() },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function getMyPrescriptions() {
  const res = await fetch(API_URL + "/prescriptions/", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch prescriptions");
  return res.json();
}

// ─── ORDERS ───
export async function placeOrder(payload: any) {
  const res = await fetch(API_URL + "/orders/checkout", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      payment_method: payload.payment_method || "cash",
      shipping_address: payload.shipping_address || "",
      discount: payload.discount || 0,
    }),
  });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}

export async function getMyOrders(status?: string) {
  const res = await fetch(API_URL + "/customer/auth/orders", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch orders");
  const data = await res.json();
  if (status) return data.filter((o: any) => o.status === status);
  return data;
}

export async function getOrder(id: string) {
  const res = await fetch(API_URL + "/orders/" + id, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function cancelOrder(id: string) {
  const res = await fetch(API_URL + "/orders/" + id + "/cancel", {
    method: "POST",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to cancel order");
  return res.json();
}

// ─── STAFF API ───
function staffHeaders(): Record<string, string> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + (localStorage.getItem("pharma_staff_token") || ""),
  };
}

export async function staffApi(endpoint: string, options: RequestInit = {}) {
  const url = API_URL + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
  const res = await fetch(url, {
    ...options,
    headers: { ...staffHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractError(err));
  }
  return res.json();
}

// ─── ADMIN API ───
function adminHeaders(): Record<string, string> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + (localStorage.getItem("pharma_admin_token") || ""),
  };
}

export async function adminApi(endpoint: string, options: RequestInit = {}) {
  const url = API_URL + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
  const res = await fetch(url, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractError(err));
  }
  return res.json();
}

// ─── CUSTOMER API ───
function customerHeaders(): Record<string, string> {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + (localStorage.getItem("pharma_customer_token") || ""),
    "x-user-id": localStorage.getItem("pharma_user_id") || "guest",
  };
}

export async function customerApi(endpoint: string, options: RequestInit = {}) {
  const url = API_URL + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
  const res = await fetch(url, {
    ...options,
    headers: { ...customerHeaders(), ...(options.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(extractError(err));
  }
  return res.json();
}
