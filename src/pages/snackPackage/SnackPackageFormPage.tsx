// src/pages/snackPackage/SnackPackageFormPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./SnackPackageFormPage.module.scss";
import {
  createSnackPackage,
  getSnackPackageById,
  updateSnackPackage,
  type SnackPackage,
} from "../../services/snackPackageService";

type FieldErrors = {
  name?: string;
  shortDescription?: string;
  price?: string;
  fitFor?: string;
  point1?: string;
  point2?: string;
  point3?: string;
};

const MAX_NAME = 30;
const MAX_SHORT = 60;

const SnackPackageFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [initialLoaded, setInitialLoaded] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);

  const [name, setName] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState<string>("");
  const [fitFor, setFitFor] = useState("");
  const [point1, setPoint1] = useState("");
  const [point2, setPoint2] = useState("");
  const [point3, setPoint3] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // LOAD DATA SAAT EDIT
  useEffect(() => {
    const loadDetail = async () => {
      if (!isEditMode || !id) {
        setInitialLoaded(true);
        return;
      }

      setLoadingInitial(true);
      try {
        const data: SnackPackage = await getSnackPackageById(id);

        setName(data.name || "");
        setShortDescription(data.shortDescription || "");
        setPrice(data.price != null ? String(data.price) : "");
        setFitFor(data.fitFor || "");
        setPoint1(data.point1 || "");
        setPoint2(data.point2 || "");
        setPoint3(data.point3 || "");
        setIsActive(data.isActive ?? true);
      } catch (err: any) {
        console.error("Gagal memuat detail paket:", err);
        setSubmitError(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat detail paket snack."
        );
      } finally {
        setLoadingInitial(false);
        setInitialLoaded(true);
      }
    };

    loadDetail();
  }, [id, isEditMode]);

  const fieldClass = (hasError?: string) =>
    hasError ? `${styles.input} ${styles.inputError}` : styles.input;

  const textAreaClass = (hasError?: string) =>
    hasError ? `${styles.textarea} ${styles.inputError}` : styles.textarea;

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama paket wajib diisi.";
    } else if (name.trim().length > MAX_NAME) {
      newErrors.name = `Nama paket tidak boleh lebih dari ${MAX_NAME} karakter.`;
    }

    if (!shortDescription.trim()) {
      newErrors.shortDescription = "Deskripsi singkat wajib diisi.";
    } else if (shortDescription.trim().length > MAX_SHORT) {
      newErrors.shortDescription = `Tidak boleh lebih dari ${MAX_SHORT} karakter.`;
    }

    if (!price.trim()) {
      newErrors.price = "Harga paket wajib diisi.";
    } else if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Harga harus berupa angka lebih dari 0.";
    }

    if (fitFor.trim().length > MAX_SHORT) {
      newErrors.fitFor = `Tidak boleh lebih dari ${MAX_SHORT} karakter.`;
    }
    if (point1.trim().length > MAX_SHORT) {
      newErrors.point1 = `Tidak boleh lebih dari ${MAX_SHORT} karakter.`;
    }
    if (point2.trim().length > MAX_SHORT) {
      newErrors.point2 = `Tidak boleh lebih dari ${MAX_SHORT} karakter.`;
    }
    if (point3.trim().length > MAX_SHORT) {
      newErrors.point3 = `Tidak boleh lebih dari ${MAX_SHORT} karakter.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        shortDescription: shortDescription.trim(),
        price: Number(price),
        fitFor: fitFor.trim() || undefined,
        point1: point1.trim() || undefined,
        point2: point2.trim() || undefined,
        point3: point3.trim() || undefined,
        isActive,
      };

      if (isEditMode && id) {
        await updateSnackPackage(id, payload);
        setSubmitSuccess("Paket snack berhasil diperbarui.");
      } else {
        await createSnackPackage(payload);
        setSubmitSuccess("Paket snack baru berhasil ditambahkan.");
        // reset form ringan
        setName("");
        setShortDescription("");
        setPrice("");
        setFitFor("");
        setPoint1("");
        setPoint2("");
        setPoint3("");
        setIsActive(true);
      }

      setTimeout(() => {
        navigate("/snack-packages");
      }, 900);
    } catch (err: any) {
      console.error("Gagal menyimpan paket:", err);
      setSubmitError(
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat menyimpan paket snack."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialLoaded && loadingInitial) {
    return (
      <div className={styles.page}>
        <div className={styles.loadingInitial}>Memuat data paket…</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>{isEditMode ? "Edit Paket Snack" : "Tambah Paket Snack"}</h1>
          <p>
            Lengkapi detail paket snack agar bisa tampil di website dan memudahkan
            pelanggan memilih paket untuk acara mereka.
          </p>
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/snack-packages")}
        >
          Kembali ke daftar
        </button>
      </header>

      <section className={styles.formSection}>
        <div className={styles.formCard}>
          {submitError && (
            <div className={styles.alertError}>{submitError}</div>
          )}
          {submitSuccess && (
            <div className={styles.alertSuccess}>{submitSuccess}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>
              {/* NAMA PAKET */}
              <div className={styles.formField}>
                <label htmlFor="name">
                  Nama Paket <span className={styles.required}>*</span>
                </label>
                <input
                  id="name"
                  type="text"
                  className={fieldClass(errors.name)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Paket Pengajian & Arisan"
                />
                <div className={styles.charInfo}>
                  <span
                    className={
                      name.trim().length > MAX_NAME
                        ? styles.charInfoError
                        : undefined
                    }
                  >
                    {name.trim().length}/{MAX_NAME}
                  </span>
                </div>
                {errors.name && (
                  <p className={styles.errorText}>{errors.name}</p>
                )}
              </div>

              {/* SHORT DESCRIPTION */}
              <div className={styles.formField}>
                <label htmlFor="shortDescription">
                  Deskripsi Singkat <span className={styles.required}>*</span>
                </label>
                <textarea
                  id="shortDescription"
                  className={textAreaClass(errors.shortDescription)}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Cocok untuk pengajian rutin, arisan RT, dan kajian kecil."
                />
                <div className={styles.charInfo}>
                  <span
                    className={
                      shortDescription.trim().length > MAX_SHORT
                        ? styles.charInfoError
                        : undefined
                    }
                  >
                    {shortDescription.trim().length}/{MAX_SHORT}
                  </span>
                </div>
                {errors.shortDescription && (
                  <p className={styles.errorText}>
                    {errors.shortDescription}
                  </p>
                )}
              </div>

              {/* HARGA */}
              <div className={styles.formField}>
                <label htmlFor="price">
                  Harga Paket (Rp) <span className={styles.required}>*</span>
                </label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  className={fieldClass(errors.price)}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 100000"
                />
                {errors.price && (
                  <p className={styles.errorText}>{errors.price}</p>
                )}
              </div>

              {/* FIT FOR */}
              <div className={styles.formField}>
                <label htmlFor="fitFor">Cocok Untuk (opsional)</label>
                <textarea
                  id="fitFor"
                  className={textAreaClass(errors.fitFor)}
                  value={fitFor}
                  onChange={(e) => setFitFor(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Ideal untuk 25–40 orang (tergantung kombinasi roti)."
                />
                <div className={styles.charInfo}>
                  <span
                    className={
                      fitFor.trim().length > MAX_SHORT
                        ? styles.charInfoError
                        : undefined
                    }
                  >
                    {fitFor.trim().length}/{MAX_SHORT}
                  </span>
                </div>
                {errors.fitFor && (
                  <p className={styles.errorText}>{errors.fitFor}</p>
                )}
              </div>

              {/* POINT 1 */}
              <div className={styles.formField}>
                <label htmlFor="point1">Poin 1 (opsional)</label>
                <input
                  id="point1"
                  type="text"
                  className={fieldClass(errors.point1)}
                  value={point1}
                  onChange={(e) => setPoint1(e.target.value)}
                  placeholder="Contoh: Roti unyil @1.000 & @2.000 (campur manis & gurih)."
                />
                <div className={styles.charInfo}>
                  <span
                    className={
                      point1.trim().length > MAX_SHORT
                        ? styles.charInfoError
                        : undefined
                    }
                  >
                    {point1.trim().length}/{MAX_SHORT}
                  </span>
                </div>
                {errors.point1 && (
                  <p className={styles.errorText}>{errors.point1}</p>
                )}
              </div>

              {/* POINT 2 */}
              <div className={styles.formField}>
                <label htmlFor="point2">Poin 2 (opsional)</label>
                <input
                  id="point2"
                  type="text"
                  className={fieldClass(errors.point2)}
                  value={point2}
                  onChange={(e) => setPoint2(e.target.value)}
                  placeholder="Contoh: Bisa mix 3–5 varian rasa."
                />
                <div className={styles.charInfo}>
                  <span
                    className={
                      point2.trim().length > MAX_SHORT
                        ? styles.charInfoError
                        : undefined
                    }
                  >
                    {point2.trim().length}/{MAX_SHORT}
                  </span>
                </div>
                {errors.point2 && (
                  <p className={styles.errorText}>{errors.point2}</p>
                )}
              </div>

              {/* POINT 3 */}
              <div className={styles.formField}>
                <label htmlFor="point3">Poin 3 (opsional)</label>
                <input
                  id="point3"
                  type="text"
                  className={fieldClass(errors.point3)}
                  value={point3}
                  onChange={(e) => setPoint3(e.target.value)}
                  placeholder="Contoh: Opsional pizza mini untuk tamu khusus."
                />
                <div className={styles.charInfo}>
                  <span
                    className={
                      point3.trim().length > MAX_SHORT
                        ? styles.charInfoError
                        : undefined
                    }
                  >
                    {point3.trim().length}/{MAX_SHORT}
                  </span>
                </div>
                {errors.point3 && (
                  <p className={styles.errorText}>{errors.point3}</p>
                )}
              </div>

              {/* STATUS */}
              <div className={styles.formFieldInline}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <span>Tampilkan paket ini di website (aktif)</span>
                </label>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => navigate("/snack-packages")}
                disabled={isSubmitting}
              >
                Batal
              </button>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? "Menyimpan… mohon tunggu"
                  : isEditMode
                    ? "Simpan Perubahan"
                    : "Simpan Paket Baru"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default SnackPackageFormPage;