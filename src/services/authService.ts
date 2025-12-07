import apiClient from "../lib/apiClient";

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role?: string;
};

export type LoginResponse = {
  token: string;
  admin: AdminUser;
};

export async function loginAdmin(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await apiClient.post("/auth/login", { email, password });
  const data = res.data;

  console.log("Login response data dari backend:", data);

  // Kalau backend kirim success: false
  if (data?.success === false) {
    throw new Error(data.message || "Email atau password salah.");
  }

  // Coba cari token & admin di beberapa kemungkinan key
  const envelope = data.data ?? data; // support { data: { ... } } atau langsung {...}

  const token =
    envelope.token || envelope.accessToken || envelope.jwt || envelope.idToken;

  const rawAdmin =
    envelope.admin || envelope.adminUser || envelope.user || null;

  // Token wajib ada, kalau tidak → error
  if (!token) {
    throw new Error(
      data.message || "Login response tidak valid dari server (token kosong)."
    );
  }

  // Admin boleh kosong, kita kasih default supaya tidak crash
  const admin: AdminUser = rawAdmin
    ? {
      id: rawAdmin.id || rawAdmin.uid || "",
      name: rawAdmin.name || rawAdmin.fullName || "",
      email: rawAdmin.email || "",
      role: rawAdmin.role || "admin",
    }
    : {
      id: "",
      name: "Admin",
      email,
      role: "admin",
    };

  return { token, admin };
}