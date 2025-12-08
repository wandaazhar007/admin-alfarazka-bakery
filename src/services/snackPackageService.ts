// import apiClient from "../lib/apiClient";

// export type SnackPackage = {
//   id: string;
//   name: string;
//   shortDescription: string;
//   price: number;
//   fitFor?: string;
//   point1?: string;
//   point2?: string;
//   point3?: string;
//   isActive: boolean;
//   createdAt?: string | null;
//   updatedAt?: string | null;
// };

// export type SnackPackageListResponse = {
//   items: SnackPackage[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// };

// function normalizeListResponse(raw: any): SnackPackageListResponse {
//   const dataArray =
//     raw?.data?.items ||
//     raw?.data?.packages ||
//     raw?.items ||
//     raw?.packages ||
//     raw?.data ||
//     [];

//   const pagination = raw?.pagination || raw?.meta || {};

//   const total =
//     pagination.total ||
//     pagination.totalItems ||
//     raw?.total ||
//     dataArray.length;

//   const page = pagination.page || pagination.currentPage || raw?.page || 1;
//   const limit =
//     pagination.limit || pagination.perPage || raw?.limit || dataArray.length;
//   const totalPages =
//     pagination.totalPages ||
//     pagination.totalPage ||
//     (limit ? Math.max(1, Math.ceil(total / limit)) : 1);

//   const items: SnackPackage[] = (dataArray as any[]).map((item) => ({
//     id: item.id || item._id || "",
//     name: item.name || "",
//     shortDescription: item.shortDescription || "",
//     price: Number(item.price || 0),
//     fitFor: item.fitFor || "",
//     point1: item.point1 || "",
//     point2: item.point2 || "",
//     point3: item.point3 || "",
//     isActive: Boolean(
//       item.isActive === undefined ? true : item.isActive
//     ),
//     createdAt: item.createdAt || null,
//     updatedAt: item.updatedAt || null,
//   }));

//   return {
//     items,
//     total,
//     page,
//     limit,
//     totalPages,
//   };
// }

// export async function fetchSnackPackages(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
//   status?: "all" | "active" | "inactive";
// }) {
//   const { page = 1, limit = 10, search, status = "all" } = params;

//   const res = await apiClient.get("/snack-packages", {
//     params: {
//       page,
//       limit,
//       search: search || undefined,
//       isActive:
//         status === "all" ? undefined : status === "active" ? true : false,
//     },
//   });

//   return normalizeListResponse(res.data);
// }

// export type CreateSnackPackagePayload = {
//   name: string;
//   shortDescription: string;
//   price: number;
//   fitFor?: string;
//   point1?: string;
//   point2?: string;
//   point3?: string;
//   isActive: boolean;
// };

// export type UpdateSnackPackagePayload = Partial<CreateSnackPackagePayload>;

// export async function createSnackPackage(payload: CreateSnackPackagePayload) {
//   const res = await apiClient.post("/snack-packages", payload);
//   return res.data;
// }

// export async function getSnackPackageById(id: string) {
//   const res = await apiClient.get(`/snack-packages/${id}`);
//   return res.data?.data || res.data;
// }

// export async function updateSnackPackage(
//   id: string,
//   payload: UpdateSnackPackagePayload
// ) {
//   const res = await apiClient.put(`/snack-packages/${id}`, payload);
//   return res.data;
// }

// export async function deleteSnackPackage(id: string) {
//   const res = await apiClient.delete(`/snack-packages/${id}`);
//   return res.data;
// }




// src/services/snackPackageService.ts
import apiClient from "../lib/apiClient";

export type SnackPackage = {
  id: string;
  name: string;
  shortDescription: string;
  price: number;
  fitFor?: string;
  point1?: string;
  point2?: string;
  point3?: string;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SnackPackageListResponse = {
  items: SnackPackage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function normalizeListResponse(raw: any): SnackPackageListResponse {
  // backend: { success: true, data: { items, total, page, limit, totalPages } }
  const dataArray =
    raw?.data?.items ||
    raw?.data?.packages ||
    raw?.items ||
    raw?.packages ||
    raw?.data ||
    [];

  const pagination = raw?.data || raw?.pagination || raw?.meta || {};

  const total =
    pagination.total ||
    pagination.totalItems ||
    raw?.total ||
    dataArray.length;

  const page = pagination.page || pagination.currentPage || raw?.page || 1;
  const limit =
    pagination.limit || pagination.perPage || raw?.limit || dataArray.length;
  const totalPages =
    pagination.totalPages ||
    pagination.totalPage ||
    (limit ? Math.max(1, Math.ceil(total / limit)) : 1);

  const items: SnackPackage[] = (dataArray as any[]).map((item) => ({
    id: item.id || item._id || "",
    name: item.name || "",
    shortDescription: item.shortDescription || "",
    price: Number(item.price || 0),
    fitFor: item.fitFor || "",
    point1: item.point1 || "",
    point2: item.point2 || "",
    point3: item.point3 || "",
    isActive:
      item.isActive === undefined ? true : Boolean(item.isActive),
    createdAt: item.createdAt || null,
    updatedAt: item.updatedAt || null,
  }));

  return {
    items,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function fetchSnackPackages(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: "all" | "active" | "inactive";
}) {
  const { page = 1, limit = 10, search, status = "all" } = params;

  const res = await apiClient.get("/snack-packages", {
    params: {
      page,
      limit,
      search: search?.trim() || undefined,
      // ⬇️ kirim status ke backend (all | active | inactive)
      status,
    },
  });

  return normalizeListResponse(res.data);
}

export type CreateSnackPackagePayload = {
  name: string;
  shortDescription: string;
  price: number;
  fitFor?: string;
  point1?: string;
  point2?: string;
  point3?: string;
  isActive: boolean;
};

export type UpdateSnackPackagePayload = Partial<CreateSnackPackagePayload>;

export async function createSnackPackage(payload: CreateSnackPackagePayload) {
  const res = await apiClient.post("/snack-packages", payload);
  return res.data;
}

export async function getSnackPackageById(id: string) {
  const res = await apiClient.get(`/snack-packages/${id}`);
  return res.data?.data || res.data;
}

export async function updateSnackPackage(
  id: string,
  payload: UpdateSnackPackagePayload
) {
  const res = await apiClient.put(`/snack-packages/${id}`, payload);
  return res.data;
}

export async function deleteSnackPackage(id: string) {
  const res = await apiClient.delete(`/snack-packages/${id}`);
  return res.data;
}
