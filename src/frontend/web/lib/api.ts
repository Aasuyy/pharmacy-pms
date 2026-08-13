const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function extractError(errData: any): string {
  if (errData == null) return "Something went wrong";
  if (typeof errData.detail === "string") return errData.detail;
  if (Array.isArray(errData.detail)) {
    return errData.detail.map((d: any) => d.msg || String(d)).join(", ");
  }
  if (errData.message) return errData.message;
  return "Something went wrong";
}

export async function customerLogin(email: string, password: string) {
  const res = await fetch(API_URL + "/customer/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  const data = await res.json();
  localStorage.setItem("pharma_customer_token", data.token);
  localStorage.setItem("pharma_user_id", data.sub || "cust_1");
  return data;
}

export async function staffLogin(username: string, password: string) {
  const res = await fetch(API_URL + "/staff/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  const data = await res.json();
  localStorage.setItem("pharma_staff_token", data.token);
  return data;
}

export async function adminLogin(username: string, password: string) {
  const res = await fetch(API_URL + "/admin/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  const data = await res.json();
  localStorage.setItem("pharma_admin_token", data.token);
  return data;
}

export async function customerRegister(name: string, email: string, password: string, phone?: string) {
  const res = await fetch(API_URL + "/customer/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, phone }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  return res.json();
}

export async function staffRegister(name: string, username: string, password: string, department?: string) {
  const res = await fetch(API_URL + "/staff/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password, department }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  return res.json();
}

export async function adminRegister(name: string, username: string, password: string) {
  const res = await fetch(API_URL + "/admin/auth/register", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, username, password }),
  });
  if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(extractError(err)); }
  return res.json();
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
  const token = localStorage.getItem("pharma_admin_token") || localStorage.getItem("pharma_staff_token") || localStorage.getItem("pharma_customer_token") || "";
  if (token === "") return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.role || null;
  } catch {
    return null;
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
  return localStorage.getItem("pharma_customer_token") || "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + getToken(),
    "x-user-id": typeof window === "undefined" ? "guest" : (localStorage.getItem("pharma_user_id") || "guest"),
  };
}

export async function fetchMedicines(params?: { category?: string; search?: string; page?: number }) {
  const qs = new URLSearchParams(params as any).toString();
  const res = await fetch(API_URL + "/api/v1/medicines?" + qs);
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
}

export async function fetchMedicine(id: string) {
  const res = await fetch(API_URL + "/api/v1/medicines/" + id);
  if (!res.ok) throw new Error("Medicine not found");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(API_URL + "/api/v1/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchRelated(id: string) {
  const res = await fetch(API_URL + "/api/v1/medicines/related/" + id);
  if (!res.ok) throw new Error("Failed to fetch related");
  return res.json();
}

export async function getCart() {
  const res = await fetch(API_URL + "/api/v1/cart", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch cart");
  return res.json();
}

export async function addToCart(medicine_id: string, quantity: number = 1) {
  const res = await fetch(API_URL + "/api/v1/cart/add", { method: "POST", headers: authHeaders(), body: JSON.stringify({ medicine_id, quantity }) });
  if (!res.ok) throw new Error("Failed to add to cart");
  return res.json();
}

export async function updateCart(medicine_id: string, quantity: number) {
  const res = await fetch(API_URL + "/api/v1/cart/update/" + medicine_id + "?quantity=" + quantity, { method: "PUT", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to update cart");
  return res.json();
}

export async function removeFromCart(medicine_id: string) {
  const res = await fetch(API_URL + "/api/v1/cart/remove/" + medicine_id, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to remove from cart");
  return res.json();
}

export async function clearCart() {
  const res = await fetch(API_URL + "/api/v1/cart/clear", { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to clear cart");
  return res.json();
}

export async function checkInteractions() {
  const res = await fetch(API_URL + "/api/v1/cart/check-interactions", { headers: authHeaders() });
  if (!res.ok) throw new Error("Check failed");
  return res.json();
}

export async function uploadPrescription(file: File, notes: string = "") {
  const form = new FormData();
  form.append("file", file);
  form.append("notes", notes);
  const res = await fetch(API_URL + "/api/v1/prescriptions/upload", {
    method: "POST",
    headers: { Authorization: "Bearer " + getToken(), "x-user-id": typeof window === "undefined" ? "guest" : (localStorage.getItem("pharma_user_id") || "guest") },
    body: form,
  });
  if (!res.ok) throw new Error("Upload failed");
  return res.json();
}

export async function getMyPrescriptions() {
  const res = await fetch(API_URL + "/api/v1/prescriptions", { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch prescriptions");
  return res.json();
}

export async function placeOrder(payload: any) {
  const res = await fetch(API_URL + "/api/v1/orders", { method: "POST", headers: authHeaders(), body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Failed to place order");
  return res.json();
}

export async function getMyOrders(status?: string) {
  const qs = status ? "?status=" + status : "";
  const res = await fetch(API_URL + "/api/v1/orders" + qs, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(API_URL + "/api/v1/orders/" + id, { headers: authHeaders() });
  if (!res.ok) throw new Error("Failed to fetch order");
  return res.json();
}

export async function cancelOrder(id: string) {
  const res = await fetch(API_URL + "/api/v1/orders/" + id + "/cancel", { method: "POST", headers: authHeaders() });
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
    headers: { ...staffHeaders(), ...(options.headers || {}) } ,
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
