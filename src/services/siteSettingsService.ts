import apiClient from "../lib/apiClient";

export type SiteSettings = {
  id?: string;
  phoneNumberDisplay: string;
  whatsappNumber: string;
  instagramUrl: string;
  mapsUrl: string;
  embedMapUrl: string;
  businessName: string;
  email: string;
  addressLabel: string;
  serviceAreaText: string;
  updatedAt?: string | null;
};

export type UpdateSiteSettingsPayload = {
  phoneNumberDisplay: string;
  whatsappNumber: string;
  instagramUrl: string;
  mapsUrl: string;
  embedMapUrl: string;
  businessName: string;
  email: string;
  addressLabel: string;
  serviceAreaText: string;
};

function normalizeSiteSettings(raw: any): SiteSettings {
  const data = raw?.data || raw || {};

  return {
    id: data.id || "main",
    phoneNumberDisplay: data.phoneNumberDisplay || "",
    whatsappNumber: data.whatsappNumber || "",
    instagramUrl: data.instagramUrl || "",
    mapsUrl: data.mapsUrl || "",
    embedMapUrl: data.embedMapUrl || "",
    businessName: data.businessName || "",
    email: data.email || "",
    addressLabel: data.addressLabel || "",
    serviceAreaText: data.serviceAreaText || "",
    updatedAt: data.updatedAt || null,
  };
}

export async function getSiteSettings() {
  const res = await apiClient.get("/site-settings");
  return normalizeSiteSettings(res.data);
}

export async function updateSiteSettings(
  payload: UpdateSiteSettingsPayload
) {
  const res = await apiClient.put("/site-settings", payload);
  return {
    message: res.data?.message || "Pengaturan bisnis berhasil diperbarui.",
    data: normalizeSiteSettings(res.data?.data),
  };
}