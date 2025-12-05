// // src/services/userService.ts
// import apiClient from "../lib/apiClient";

// export type AdminUser = {
//   id: string;
//   name: string;
//   email: string;
//   role?: string;
//   isActive?: boolean;
//   createdAt?: string | null;
//   updatedAt?: string | null;
// };

// export async function fetchAdminUsers(): Promise<AdminUser[]> {
//   // Backend: GET /api/admin-users
//   const res = await apiClient.get("/admin-users");

//   const rawList =
//     res.data?.data?.users ||
//     res.data?.data ||
//     res.data?.users ||
//     res.data ||
//     [];

//   if (!Array.isArray(rawList)) {
//     return [];
//   }

//   return rawList.map((u: any) => ({
//     id: u.id || u._id || "",
//     name: u.name || "",
//     email: u.email || "",
//     role: u.role || "admin",
//     isActive: u.isActive !== undefined ? u.isActive : true,
//     createdAt:
//       u.createdAt ||
//       u.created_at ||
//       u.created ||
//       null,
//     updatedAt:
//       u.updatedAt ||
//       u.updated_at ||
//       u.updated ||
//       null,
//   }));
// }

// export async function updateAdminUser(
//   id: string,
//   payload: { name: string; role?: string }
// ): Promise<AdminUser> {
//   // Backend: PUT /api/admin-users/:id
//   const res = await apiClient.put(`/admin-users/${id}`, payload);

//   const raw =
//     res.data?.data?.user ||
//     res.data?.data ||
//     res.data?.user ||
//     res.data;

//   return {
//     id: raw.id || raw._id || "",
//     name: raw.name || "",
//     email: raw.email || "",
//     role: raw.role || "admin",
//     isActive: raw.isActive !== undefined ? raw.isActive : true,
//     createdAt:
//       raw.createdAt ||
//       raw.created_at ||
//       raw.created ||
//       null,
//     updatedAt:
//       raw.updatedAt ||
//       raw.updated_at ||
//       raw.updated ||
//       null,
//   };
// }

// export async function deleteAdminUser(id: string): Promise<void> {
//   // Backend: DELETE /api/admin-users/:id
//   await apiClient.delete(`/admin-users/${id}`);
// }


// src/services/userService.ts
import apiClient from "../lib/apiClient";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
  isActive?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  // Backend: GET /api/admin-users
  const res = await apiClient.get("/admin-users");

  const rawList =
    res.data?.data?.users ||
    res.data?.data ||
    res.data?.users ||
    res.data ||
    [];

  if (!Array.isArray(rawList)) {
    return [];
  }

  return rawList.map((u: any) => ({
    id: u.id || u._id || "",
    name: u.name || "",
    email: u.email || "",
    role: u.role || "admin",
    isActive: u.isActive !== undefined ? u.isActive : true,
    createdAt:
      u.createdAt ||
      u.created_at ||
      u.created ||
      null,
    updatedAt:
      u.updatedAt ||
      u.updated_at ||
      u.updated ||
      null,
  }));
}

export async function updateAdminUser(
  id: string,
  payload: { name: string; role?: string }
): Promise<AdminUser> {
  // Backend: PUT /api/admin-users/:id
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
    isActive: raw.isActive !== undefined ? raw.isActive : true,
    createdAt:
      raw.createdAt ||
      raw.created_at ||
      raw.created ||
      null,
    updatedAt:
      raw.updatedAt ||
      raw.updated_at ||
      raw.updated ||
      null,
  };
}

export async function deleteAdminUser(id: string): Promise<void> {
  // Backend: DELETE /api/admin-users/:id
  await apiClient.delete(`/admin-users/${id}`);
}

// ---------- CREATE ADMIN USER ----------

export type CreateAdminUserPayload = {
  name: string;
  email: string;
  password: string;
  role?: string;
};

export async function createAdminUser(
  payload: CreateAdminUserPayload
): Promise<AdminUser> {
  // Backend: POST /api/admin-users
  const res = await apiClient.post("/admin-users", payload);

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
    isActive: raw.isActive !== undefined ? raw.isActive : true,
    createdAt:
      raw.createdAt ||
      raw.created_at ||
      raw.created ||
      null,
    updatedAt:
      raw.updatedAt ||
      raw.updated_at ||
      raw.updated ||
      null,
  };
}