// src/services/userService.ts
import apiClient from "../lib/apiClient";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt?: string; // ISO string dari backend
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  // Asumsi backend: GET /api/admin-users
  const res = await apiClient.get("/admin-users");

  const rawList =
    res.data?.data?.users ||
    res.data?.data ||
    res.data?.users ||
    res.data ||
    [];

  if (!Array.isArray(rawList)) return [];

  return rawList.map((u: any) => ({
    id: u.id || u._id || "",
    name: u.name || "",
    email: u.email || "",
    role: u.role || "admin",
    createdAt:
      u.createdAt ||
      u.created_at ||
      u.created ||
      null,
  }));
}

export async function updateAdminUser(
  id: string,
  payload: { name: string; role?: string }
): Promise<AdminUser> {
  const res = await apiClient.put(`/admin-users/${id}`, payload);

  const raw =
    res.data?.data?.user ||
    res.data?.data ||
    res.data?.user ||
    res.data;

  return {
    id: raw.id || raw._id || "",
    name: raw.name || "",
    email: raw.email || "",
    role: raw.role || "admin",
    createdAt:
      raw.createdAt ||
      raw.created_at ||
      raw.created ||
      null,
  };
}

export async function deleteAdminUser(id: string): Promise<void> {
  await apiClient.delete(`/admin-users/${id}`);
}