// import { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import styles from "./ProductCreatePage.module.scss";
// import {
//   createProduct,
//   uploadProductImages,
//   type CreateProductPayload,
// } from "../../services/productService";
// import {
//   fetchCategories,
//   type Category,
// } from "../../services/categoryService";

// type FieldErrors = {
//   name?: string;
//   categoryId?: string;
//   price?: string;
//   description?: string;
//   images?: string;
// };

// const ProductCreatePage: React.FC = () => {
//   const navigate = useNavigate();

//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");

//   // CATEGORY STATE
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryId, setCategoryId] = useState("");
//   const [isCategoryLoading, setIsCategoryLoading] = useState(false);
//   const [categoryLoadError, setCategoryLoadError] = useState<string | null>(
//     null
//   );

//   // IMAGES
//   const [files, setFiles] = useState<File[]>([]);
//   const [previewUrls, setPreviewUrls] = useState<string[]>([]);

//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

//   // LOAD CATEGORIES
//   useEffect(() => {
//     const loadCategories = async () => {
//       setIsCategoryLoading(true);
//       setCategoryLoadError(null);
//       try {
//         const list = await fetchCategories();
//         setCategories(list);
//       } catch (err: any) {
//         console.error("Gagal memuat kategori:", err);
//         setCategoryLoadError(
//           err?.response?.data?.message ||
//           err?.message ||
//           "Gagal memuat kategori. Coba refresh halaman."
//         );
//       } finally {
//         setIsCategoryLoading(false);
//       }
//     };

//     loadCategories();
//   }, []);

//   // cleanup object URL
//   useEffect(() => {
//     return () => {
//       previewUrls.forEach((url) => URL.revokeObjectURL(url));
//     };
//   }, [previewUrls]);

//   const handleFilesChange = (
//     event: React.ChangeEvent<HTMLInputElement>
//   ) => {
//     const fileList = event.target.files;
//     if (!fileList) return;

//     const selectedFiles = Array.from(fileList);
//     setFiles(selectedFiles);

//     const previews = selectedFiles.map((file) =>
//       URL.createObjectURL(file)
//     );
//     setPreviewUrls(previews);
//   };

//   const validate = (): boolean => {
//     const newErrors: FieldErrors = {};

//     if (!name.trim()) {
//       newErrors.name = "Nama produk wajib diisi.";
//     }

//     if (!categoryId) {
//       newErrors.categoryId = "Kategori produk wajib dipilih.";
//     }

//     if (!price.trim()) {
//       newErrors.price = "Harga produk wajib diisi.";
//     } else if (Number.isNaN(Number(price)) || Number(price) <= 0) {
//       newErrors.price = "Harga harus berupa angka lebih dari 0.";
//     }

//     if (!description.trim()) {
//       newErrors.description = "Deskripsi singkat produk wajib diisi.";
//     }

//     if (files.length === 0) {
//       newErrors.images = "Minimal unggah 1 foto produk.";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const slugify = (value: string) =>
//     value
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, "")
//       .replace(/\s+/g, "-");

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setSubmitError(null);
//     setSubmitSuccess(null);

//     if (!validate()) return;

//     setIsSubmitting(true);

//     try {
//       // 1️⃣ Upload images ke backend (Firebase Storage lewat API)
//       const imageUrls = await uploadProductImages(files);

//       const selectedCategory = categories.find(
//         (cat) => cat.id === categoryId
//       );

//       // 2️⃣ Kirim payload lengkap ke /products
//       const payload: CreateProductPayload = {
//         name: name.trim(),
//         description: description.trim(),
//         price: Number(price),
//         categoryName: selectedCategory?.name || "",
//         // kalau backend kamu pakai slug sebagai categoryId,
//         // kita kirim slug atau fallback ke slugify dari nama kategori
//         categoryId:
//           selectedCategory?.slug ||
//           selectedCategory?.id ||
//           slugify(selectedCategory?.name || ""),
//         imageUrls, // 🔥 sekarang ini berisi array url hasil upload
//       };

//       await createProduct(payload);

//       setSubmitSuccess("Produk berhasil disimpan.");
//       setTimeout(() => {
//         navigate("/products");
//       }, 900);
//     } catch (err: any) {
//       console.error("Gagal menyimpan produk:", err);
//       setSubmitError(
//         err?.response?.data?.message ||
//         err?.message ||
//         "Terjadi kesalahan saat menyimpan produk."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const fieldClass = (hasError?: string) =>
//     hasError ? `${styles.input} ${styles.inputError}` : styles.input;

//   return (
//     <div className={styles.page}>
//       <header className={styles.header}>
//         <div>
//           <h1>Tambah Produk</h1>
//           <p>Isi detail produk roti unyil dan upload foto yang menarik.</p>
//         </div>

//         <button
//           type="button"
//           className={styles.backButton}
//           onClick={() => navigate("/products")}
//           disabled={isSubmitting}
//         >
//           Kembali ke daftar
//         </button>
//       </header>

//       <section className={styles.formSection}>
//         <div className={styles.formCard}>
//           {submitError && (
//             <div className={styles.alertError}>{submitError}</div>
//           )}
//           {submitSuccess && (
//             <div className={styles.alertSuccess}>{submitSuccess}</div>
//           )}

//           {categoryLoadError && (
//             <div className={styles.alertError}>{categoryLoadError}</div>
//           )}

//           <form onSubmit={handleSubmit} noValidate>
//             <div className={styles.formGrid}>
//               {/* NAMA */}
//               <div className={styles.formField}>
//                 <label htmlFor="name">Nama Produk</label>
//                 <input
//                   id="name"
//                   type="text"
//                   className={fieldClass(errors.name)}
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   placeholder="Contoh: Roti Unyil Seribuan Coklat"
//                 />
//                 {errors.name && (
//                   <p className={styles.errorText}>{errors.name}</p>
//                 )}
//               </div>

//               {/* KATEGORI (SELECT) */}
//               <div className={styles.formField}>
//                 <label htmlFor="categoryId">Kategori</label>
//                 <select
//                   id="categoryId"
//                   className={fieldClass(errors.categoryId)}
//                   value={categoryId}
//                   onChange={(e) => setCategoryId(e.target.value)}
//                   disabled={isCategoryLoading || !!categoryLoadError}
//                 >
//                   <option value="">
//                     {isCategoryLoading
//                       ? "Memuat kategori..."
//                       : "Pilih kategori produk"}
//                   </option>
//                   {categories.map((cat) => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.name}
//                     </option>
//                   ))}
//                 </select>
//                 {errors.categoryId && (
//                   <p className={styles.errorText}>{errors.categoryId}</p>
//                 )}
//               </div>

//               {/* HARGA */}
//               <div className={styles.formField}>
//                 <label htmlFor="price">Harga (dalam rupiah)</label>
//                 <input
//                   id="price"
//                   type="number"
//                   min={0}
//                   className={fieldClass(errors.price)}
//                   value={price}
//                   onChange={(e) => setPrice(e.target.value)}
//                   placeholder="Contoh: 1000"
//                 />
//                 {errors.price && (
//                   <p className={styles.errorText}>{errors.price}</p>
//                 )}
//               </div>

//               {/* DESKRIPSI */}
//               <div className={styles.formFieldFull}>
//                 <label htmlFor="description">Deskripsi Singkat</label>
//                 <textarea
//                   id="description"
//                   className={fieldClass(errors.description)}
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   rows={4}
//                   placeholder="Tuliskan deskripsi singkat, rasa, dan cocok untuk acara apa."
//                 />
//                 {errors.description && (
//                   <p className={styles.errorText}>
//                     {errors.description}
//                   </p>
//                 )}
//               </div>

//               {/* GAMBAR */}
//               <div className={styles.formFieldFull}>
//                 <label htmlFor="images">Foto Produk</label>
//                 <input
//                   id="images"
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   className={errors.images ? styles.inputErrorFile : ""}
//                   onChange={handleFilesChange}
//                 />
//                 <p className={styles.helperText}>
//                   Kamu bisa upload lebih dari satu foto. Minimal 1 foto
//                   wajib diisi.
//                 </p>
//                 {errors.images && (
//                   <p className={styles.errorText}>{errors.images}</p>
//                 )}

//                 {previewUrls.length > 0 && (
//                   <div className={styles.previewGrid}>
//                     {previewUrls.map((url, idx) => (
//                       <div key={idx} className={styles.previewItem}>
//                         <img src={url} alt={`Preview ${idx + 1}`} />
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className={styles.actions}>
//               <button
//                 type="button"
//                 className={styles.secondaryButton}
//                 onClick={() => navigate("/products")}
//                 disabled={isSubmitting}
//               >
//                 Batal
//               </button>
//               <button
//                 type="submit"
//                 className={styles.primaryButton}
//                 disabled={isSubmitting}
//               >
//                 {isSubmitting ? "Menyimpan… mohon tunggu" : "Simpan Produk"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ProductCreatePage;




// src/pages/product/ProductCreatePage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./ProductCreatePage.module.scss";
import {
  createProduct,
  uploadProductImages,
  type CreateProductPayload,
} from "../../services/productService";
import {
  fetchCategories,
  type Category,
} from "../../services/categoryService";

type FieldErrors = {
  name?: string;
  categoryId?: string;
  price?: string;
  description?: string;
  images?: string;
};

const ProductCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  // sekarang description akan menyimpan HTML dari TinyMCE
  const [description, setDescription] = useState("");

  // CATEGORY STATE
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState<string | null>(
    null
  );

  // IMAGES
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // LOAD CATEGORIES
  useEffect(() => {
    const loadCategories = async () => {
      setIsCategoryLoading(true);
      setCategoryLoadError(null);
      try {
        const list = await fetchCategories();
        setCategories(list);
      } catch (err: any) {
        console.error("Gagal memuat kategori:", err);
        setCategoryLoadError(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat kategori. Coba refresh halaman."
        );
      } finally {
        setIsCategoryLoading(false);
      }
    };

    loadCategories();
  }, []);

  // cleanup object URL
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const selectedFiles = Array.from(fileList);
    setFiles(selectedFiles);

    const previews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls(previews);
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) {
      newErrors.name = "Nama produk wajib diisi.";
    }

    if (!categoryId) {
      newErrors.categoryId = "Kategori produk wajib dipilih.";
    }

    if (!price.trim()) {
      newErrors.price = "Harga produk wajib diisi.";
    } else if (Number.isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Harga harus berupa angka lebih dari 0.";
    }

    // strip tag HTML supaya validasi bener-bener cek teksnya
    const plainDescription = description
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!plainDescription) {
      newErrors.description = "Deskripsi singkat produk wajib diisi.";
    }

    if (files.length === 0) {
      newErrors.images = "Minimal unggah 1 foto produk.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 1️⃣ Upload images ke backend (Firebase Storage lewat API)
      const imageUrls = await uploadProductImages(files);

      const selectedCategory = categories.find(
        (cat) => cat.id === categoryId
      );

      // 2️⃣ Kirim payload lengkap ke /products
      const payload: CreateProductPayload = {
        name: name.trim(),
        // simpan HTML dari TinyMCE apa adanya
        description: description.trim(),
        price: Number(price),
        categoryName: selectedCategory?.name || "",
        categoryId:
          selectedCategory?.slug ||
          selectedCategory?.id ||
          slugify(selectedCategory?.name || ""),
        imageUrls,
      };

      await createProduct(payload);

      setSubmitSuccess("Produk berhasil disimpan.");
      setTimeout(() => {
        navigate("/products");
      }, 900);
    } catch (err: any) {
      console.error("Gagal menyimpan produk:", err);
      setSubmitError(
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat menyimpan produk."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (hasError?: string) =>
    hasError ? `${styles.input} ${styles.inputError}` : styles.input;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Tambah Produk</h1>
          <p>Isi detail produk roti unyil dan upload foto yang menarik.</p>
        </div>

        <button
          type="button"
          className={styles.backButton}
          onClick={() => navigate("/products")}
          disabled={isSubmitting}
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

          {categoryLoadError && (
            <div className={styles.alertError}>{categoryLoadError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={styles.formGrid}>
              {/* NAMA */}
              <div className={styles.formField}>
                <label htmlFor="name">Nama Produk</label>
                <input
                  id="name"
                  type="text"
                  className={fieldClass(errors.name)}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Roti Unyil Seribuan Coklat"
                />
                {errors.name && (
                  <p className={styles.errorText}>{errors.name}</p>
                )}
              </div>

              {/* KATEGORI (SELECT) */}
              <div className={styles.formField}>
                <label htmlFor="categoryId">Kategori</label>
                <select
                  id="categoryId"
                  className={fieldClass(errors.categoryId)}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={isCategoryLoading || !!categoryLoadError}
                >
                  <option value="">
                    {isCategoryLoading
                      ? "Memuat kategori..."
                      : "Pilih kategori produk"}
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className={styles.errorText}>{errors.categoryId}</p>
                )}
              </div>

              {/* HARGA */}
              <div className={styles.formField}>
                <label htmlFor="price">Harga (dalam rupiah)</label>
                <input
                  id="price"
                  type="number"
                  min={0}
                  className={fieldClass(errors.price)}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Contoh: 1000"
                />
                {errors.price && (
                  <p className={styles.errorText}>{errors.price}</p>
                )}
              </div>

              {/* DESKRIPSI (TinyMCE) */}
              <div className={styles.formFieldFull}>
                <label htmlFor="description">Deskripsi Singkat</label>
                <div
                  className={`${styles.editorWrapper} ${errors.description ? styles.editorWrapperError : ""
                    }`}
                >
                  <Editor
                    id="description"
                    apiKey="YOUR_TINYMCE_API_KEY"
                    value={description}
                    onEditorChange={(content) => setDescription(content)}
                    init={{
                      height: 260,
                      menubar: false,
                      statusbar: false,
                      plugins: [
                        "advlist",
                        "autolink",
                        "lists",
                        "link",
                        "charmap",
                        "preview",
                        "anchor",
                        "searchreplace",
                        "visualblocks",
                        "code",
                        "fullscreen",
                        "insertdatetime",
                        "table",
                        "help",
                        "wordcount",
                      ],
                      toolbar:
                        "undo redo | bold italic underline | bullist numlist | link removeformat",
                      branding: false,
                      content_style:
                        "body { font-family: -apple-system,BlinkMacSystemFont,system-ui,sans-serif; font-size:14px; }",
                    }}
                  />
                </div>
                {errors.description && (
                  <p className={styles.errorText}>{errors.description}</p>
                )}
              </div>

              {/* GAMBAR */}
              <div className={styles.formFieldFull}>
                <label htmlFor="images">Foto Produk</label>
                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  className={errors.images ? styles.inputErrorFile : ""}
                  onChange={handleFilesChange}
                />
                <p className={styles.helperText}>
                  Kamu bisa upload lebih dari satu foto. Minimal 1 foto wajib
                  diisi.
                </p>
                {errors.images && (
                  <p className={styles.errorText}>{errors.images}</p>
                )}

                {previewUrls.length > 0 && (
                  <div className={styles.previewGrid}>
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <img src={url} alt={`Preview ${idx + 1}`} />
                      </div>
                    ))}
                  </div>
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
                {isSubmitting ? "Menyimpan… mohon tunggu" : "Simpan Produk"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProductCreatePage;