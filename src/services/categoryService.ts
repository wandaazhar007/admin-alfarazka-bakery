// src/services/categoryService.ts
import apiClient from "../lib/apiClient";

export type Category = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await apiClient.get("/categories", {
    params: {
      isActive: true, // kalau backend kamu pakai filter aktif
    },
  });

  const raw = res.data;

  const items =
    raw?.data?.categories ||
    raw?.data?.items ||
    raw?.categories ||
    raw?.items ||
    raw?.data ||
    raw ||
    [];

  return (items as any[]).map((item) => ({
    id: item.id || item._id || item.slug || "",
    name: item.name || "",
    slug: item.slug,
    description: item.description,
    isActive: item.isActive,
  }));
}