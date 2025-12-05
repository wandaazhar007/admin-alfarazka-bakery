
// // src/services/productService.ts
// import apiClient from "../lib/apiClient";

// export type Product = {
//   id: string;
//   name: string;
//   category?: string;
//   price: number;
//   imageUrl?: string;
//   imageUrls?: string[];
// };

// export type ProductListResponse = {
//   products: Product[];
//   total: number;
//   page: number;
//   limit: number;
//   totalPages: number;
// };

// function normalizeProductListResponse(raw: any): ProductListResponse {
//   const dataArray =
//     raw?.data?.products ||
//     raw?.data?.items ||
//     raw?.products ||
//     raw?.items ||
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

//   const products: Product[] = (dataArray as any[]).map((item) => ({
//     id: item.id || item._id || "",
//     name: item.name || "",
//     category: item.category || item.categoryName || "",
//     price: Number(item.price || 0),
//     imageUrl:
//       item.imageUrl ||
//       (Array.isArray(item.imageUrls) ? item.imageUrls[0] : undefined),
//     imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : undefined,
//   }));

//   return {
//     products,
//     total,
//     page,
//     limit,
//     totalPages,
//   };
// }

// export async function fetchProducts(params: {
//   page?: number;
//   limit?: number;
//   search?: string;
// }) {
//   const { page = 1, limit = 10, search } = params;

//   const res = await apiClient.get("/products", {
//     params: {
//       page,
//       limit,
//       search: search || undefined,
//     },
//   });

//   return normalizeProductListResponse(res.data);
// }

// // ---------- Tambah Produk & Upload Gambar ----------

// export type CreateProductPayload = {
//   name: string;
//   description?: string;
//   price: number;
//   categoryId?: string;
//   categoryName?: string;
//   imageUrls?: string[];
// };

// export async function uploadProductImages(files: File[]): Promise<string[]> {
//   if (!files.length) return [];

//   const formData = new FormData();
//   files.forEach((file) => formData.append("images", file));

//   const res = await apiClient.post("/upload/images", formData, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

//   const data = res.data;

//   const urls: string[] =
//     data?.imageUrls ||
//     data?.urls ||
//     data?.data?.imageUrls ||
//     data?.data?.urls ||
//     [];

//   return urls;
// }

// export async function createProduct(payload: CreateProductPayload) {
//   const res = await apiClient.post("/products", payload);
//   return res.data;
// }

// src/services/productService.ts
import apiClient from "../lib/apiClient";

export type Product = {
  id: string;
  name: string;
  category?: string;
  price: number;
  imageUrl?: string;
  imageUrls?: string[];
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

function normalizeProductListResponse(raw: any): ProductListResponse {
  const dataArray =
    raw?.data?.products ||
    raw?.data?.items ||
    raw?.products ||
    raw?.items ||
    raw?.data ||
    [];

  const pagination = raw?.pagination || raw?.meta || {};

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

  const products: Product[] = (dataArray as any[]).map((item) => ({
    id: item.id || item._id || "",
    name: item.name || "",
    category: item.category || item.categoryName || "",
    price: Number(item.price || 0),
    imageUrl:
      item.imageUrl ||
      (Array.isArray(item.imageUrls) ? item.imageUrls[0] : undefined),
    imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : undefined,
  }));

  return {
    products,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function fetchProducts(params: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const { page = 1, limit = 10, search } = params;

  const res = await apiClient.get("/products", {
    params: {
      page,
      limit,
      search: search || undefined,
    },
  });

  return normalizeProductListResponse(res.data);
}

// ---------- Tambah Produk & Upload Gambar ----------

export type CreateProductPayload = {
  name: string;
  description?: string;
  price: number;
  categoryId?: string;
  categoryName?: string;
  imageUrls?: string[];
};

export async function uploadProductImages(files: File[]): Promise<string[]> {
  if (!files.length) return [];

  const formData = new FormData();
  files.forEach((file) => formData.append("images", file)); // "images" sesuai backend

  const res = await apiClient.post("/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = res.data;

  // Response saat ini:
  // {
  //   success: true,
  //   data: [
  //     { fileName: "...", url: "https://..." },
  //     { fileName: "...", url: "https://..." }
  //   ]
  // }
  const items = data?.data || [];

  const urls: string[] = Array.isArray(items)
    ? items
      .map((item: any) => item?.url)
      .filter(
        (u: any): u is string => typeof u === "string" && u.trim().length > 0
      )
    : [];

  return urls;
}

export async function createProduct(payload: CreateProductPayload) {
  const res = await apiClient.post("/products", payload);
  return res.data;
}