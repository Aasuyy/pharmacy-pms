export function getStaffToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pharma_staff_token");
}
export function getUserRole(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("pharma_user_role");
}
export function logoutStaff() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("pharma_staff_token");
    localStorage.removeItem("pharma_user_role");
  }
}
