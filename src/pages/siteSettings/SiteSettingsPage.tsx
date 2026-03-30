import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SiteSettingsPage.module.scss";
import {
  getSiteSettings,
  updateSiteSettings,
  type SiteSettings,
} from "../../services/siteSettingsService";

type FieldErrors = {
  phoneNumberDisplay?: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  mapsUrl?: string;
  embedMapUrl?: string;
  businessName?: string;
  email?: string;
  addressLabel?: string;
  serviceAreaText?: string;
};

const SiteSettingsPage: React.FC = () => {
  const navigate = useNavigate();

  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [phoneNumberDisplay, setPhoneNumberDisplay] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [mapsUrl, setMapsUrl] = useState("");
  const [embedMapUrl, setEmbedMapUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [addressLabel, setAddressLabel] = useState("");
  const [serviceAreaText, setServiceAreaText] = useState("");

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoadingInitial(true);
      setLoadError(null);

      try {
        const data: SiteSettings = await getSiteSettings();

        setPhoneNumberDisplay(data.phoneNumberDisplay || "");
        setWhatsappNumber(data.whatsappNumber || "");
        setInstagramUrl(data.instagramUrl || "");
        setMapsUrl(data.mapsUrl || "");
        setEmbedMapUrl(data.embedMapUrl || "");
        setBusinessName(data.businessName || "");
        setEmail(data.email || "");
        setAddressLabel(data.addressLabel || "");
        setServiceAreaText(data.serviceAreaText || "");
      } catch (err: any) {
        console.error("Gagal memuat site settings:", err);
        setLoadError(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat pengaturan bisnis."
        );
      } finally {
        setIsLoadingInitial(false);
      }
    };

    load();
  }, []);

  const validateUrl = (value: string) => {
    if (!value.trim()) return true;
    try {
      const url = new URL(value.trim());
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const validateEmail = (value: string) => {
    if (!value.trim()) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!phoneNumberDisplay.trim()) {
      newErrors.phoneNumberDisplay = "Nomor telepon display wajib diisi.";
    }

    if (!whatsappNumber.trim()) {
      newErrors.whatsappNumber = "Nomor WhatsApp wajib diisi.";
    } else if (!/^\d+$/.test(whatsappNumber.trim())) {
      newErrors.whatsappNumber =
        "Nomor WhatsApp hanya boleh berisi angka tanpa spasi atau simbol.";
    }

    if (!businessName.trim()) {
      newErrors.businessName = "Nama bisnis wajib diisi.";
    }

    if (!addressLabel.trim()) {
      newErrors.addressLabel = "Alamat singkat wajib diisi.";
    }

    if (!serviceAreaText.trim()) {
      newErrors.serviceAreaText = "Area layanan wajib diisi.";
    }

    if (instagramUrl.trim() && !validateUrl(instagramUrl)) {
      newErrors.instagramUrl =
        "Instagram URL tidak valid. Gunakan format http:// atau https://";
    }

    if (mapsUrl.trim() && !validateUrl(mapsUrl)) {
      newErrors.mapsUrl =
        "Maps URL tidak valid. Gunakan format http:// atau https://";
    }

    if (embedMapUrl.trim() && !validateUrl(embedMapUrl)) {
      newErrors.embedMapUrl =
        "Embed Map URL tidak valid. Gunakan format http:// atau https://";
    }

    if (email.trim() && !validateEmail(email)) {
      newErrors.email = "Email tidak valid.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fieldClass = (hasError?: string) =>
    hasError ? `${styles.input} ${styles.inputError}` : styles.input;

  const textareaClass = (hasError?: string) =>
    hasError ? `${styles.textarea} ${styles.inputError}` : styles.textarea;

  const previewWhatsappLink = useMemo(() => {
    if (!whatsappNumber.trim()) return "";
    return `https://wa.me/${whatsappNumber.trim()}`;
  }, [whatsappNumber]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const result = await updateSiteSettings({
        phoneNumberDisplay: phoneNumberDisplay.trim(),
        whatsappNumber: whatsappNumber.trim(),
        instagramUrl: instagramUrl.trim(),
        mapsUrl: mapsUrl.trim(),
        embedMapUrl: embedMapUrl.trim(),
        businessName: businessName.trim(),
        email: email.trim(),
        addressLabel: addressLabel.trim(),
        serviceAreaText: serviceAreaText.trim(),
      });

      setSubmitSuccess(result.message);
    } catch (err: any) {
      console.error("Gagal menyimpan site settings:", err);

      const backendErrors = err?.response?.data?.errors;
      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        setSubmitError(backendErrors.join(" "));
      } else {
        setSubmitError(
          err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat menyimpan pengaturan bisnis."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingInitial}>Memuat pengaturan bisnis…</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1>Pengaturan Bisnis</h1>
            <p>Kelola nomor telepon, WhatsApp, dan informasi kontak website.</p>
          </div>
        </header>

        <section className={styles.formSection}>
          <div className={styles.formCard}>
            <div className={styles.alertError}>{loadError}</div>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate("/products")}
              >
                Kembali
              </button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Pengaturan Bisnis</h1>
          <p>
            Ubah informasi kontak bisnis agar frontend website mengambil data
            terbaru secara dinamis.
          </p>
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/products")}
          disabled={isSubmitting}
        >
          Kembali ke dashboard
        </button>
      </header>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          {submitError && <div className={styles.alertError}>{submitError}</div>}
          {submitSuccess && (
            <div className={styles.alertSuccess}>{submitSuccess}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label htmlFor="businessName">
                  Nama Bisnis <span className={styles.required}>*</span>
                </label>
                <input
                  id="businessName"
                  type="text"
                  className={fieldClass(errors.businessName)}
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Contoh: Alfarazka Bakery"
                />
                {errors.businessName && (
                  <p className={styles.errorText}>{errors.businessName}</p>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="phoneNumberDisplay">
                  Nomor Telepon Display <span className={styles.required}>*</span>
                </label>
                <input
                  id="phoneNumberDisplay"
                  type="text"
                  className={fieldClass(errors.phoneNumberDisplay)}
                  value={phoneNumberDisplay}
                  onChange={(e) => setPhoneNumberDisplay(e.target.value)}
                  placeholder="Contoh: 0821-9422-8282"
                />
                {errors.phoneNumberDisplay && (
                  <p className={styles.errorText}>
                    {errors.phoneNumberDisplay}
                  </p>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="whatsappNumber">
                  Nomor WhatsApp <span className={styles.required}>*</span>
                </label>
                <input
                  id="whatsappNumber"
                  type="text"
                  inputMode="numeric"
                  className={fieldClass(errors.whatsappNumber)}
                  value={whatsappNumber}
                  onChange={(e) =>
                    setWhatsappNumber(e.target.value.replace(/[^\d]/g, ""))
                  }
                  placeholder="Contoh: 6282194228282"
                />
                <p className={styles.helperText}>
                  Simpan tanpa tanda +, tanpa spasi, dan tanpa strip.
                </p>
                {previewWhatsappLink && (
                  <p className={styles.previewText}>
                    Preview link: <span>{previewWhatsappLink}</span>
                  </p>
                )}
                {errors.whatsappNumber && (
                  <p className={styles.errorText}>{errors.whatsappNumber}</p>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="email">Email Bisnis</label>
                <input
                  id="email"
                  type="email"
                  className={fieldClass(errors.email)}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: admin@alfarazkabakery.com"
                />
                {errors.email && (
                  <p className={styles.errorText}>{errors.email}</p>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="instagramUrl">Instagram URL</label>
                <input
                  id="instagramUrl"
                  type="url"
                  className={fieldClass(errors.instagramUrl)}
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/alfarazkabakery"
                />
                {errors.instagramUrl && (
                  <p className={styles.errorText}>{errors.instagramUrl}</p>
                )}
              </div>

              <div className={styles.formField}>
                <label htmlFor="mapsUrl">Google Maps URL</label>
                <input
                  id="mapsUrl"
                  type="url"
                  className={fieldClass(errors.mapsUrl)}
                  value={mapsUrl}
                  onChange={(e) => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
                {errors.mapsUrl && (
                  <p className={styles.errorText}>{errors.mapsUrl}</p>
                )}
              </div>

              <div className={styles.formFieldFull}>
                <label htmlFor="embedMapUrl">Embed Map URL</label>
                <input
                  id="embedMapUrl"
                  type="url"
                  className={fieldClass(errors.embedMapUrl)}
                  value={embedMapUrl}
                  onChange={(e) => setEmbedMapUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                />
                <p className={styles.helperText}>
                  Dipakai kalau nanti frontend ingin menampilkan iframe peta.
                </p>
                {errors.embedMapUrl && (
                  <p className={styles.errorText}>{errors.embedMapUrl}</p>
                )}
              </div>

              <div className={styles.formFieldFull}>
                <label htmlFor="addressLabel">
                  Alamat Singkat <span className={styles.required}>*</span>
                </label>
                <input
                  id="addressLabel"
                  type="text"
                  className={fieldClass(errors.addressLabel)}
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                  placeholder="Contoh: Ciputat, Tangerang Selatan, Banten"
                />
                {errors.addressLabel && (
                  <p className={styles.errorText}>{errors.addressLabel}</p>
                )}
              </div>

              <div className={styles.formFieldFull}>
                <label htmlFor="serviceAreaText">
                  Teks Area Layanan <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="serviceAreaText"
                  rows={4}
                  className={textareaClass(errors.serviceAreaText)}
                  value={serviceAreaText}
                  onChange={(e) => setServiceAreaText(e.target.value)}
                  placeholder="Contoh: Ciputat, Pamulang, UIN Jakarta, Gintung, Legoso, BSD tertentu, dan sekitarnya."
                />
                {errors.serviceAreaText && (
                  <p className={styles.errorText}>{errors.serviceAreaText}</p>
                )}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate("/products")}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Menyimpan… mohon tunggu" : "Simpan Pengaturan"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SiteSettingsPage;