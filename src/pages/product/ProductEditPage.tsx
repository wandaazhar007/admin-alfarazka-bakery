// import { useEffect, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import styles from "./ProductCreatePage.module.scss"; // Reuse style tambah produk

// import {
//   fetchProductById,
//   updateProduct,
//   uploadProductImages,
//   type UpdateProductPayload,
//   type Product,
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

// const ProductEditPage: React.FC = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();

//   const [initialProduct, setInitialProduct] = useState<Product | null>(null);
//   const [isLoadingProduct, setIsLoadingProduct] = useState(true);
//   const [loadError, setLoadError] = useState<string | null>(null);

//   const [name, setName] = useState("");
//   const [price, setPrice] = useState("");
//   const [description, setDescription] = useState("");

//   // CATEGORY
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [categoryId, setCategoryId] = useState("");
//   const [isCategoryLoading, setIsCategoryLoading] = useState(false);
//   const [categoryLoadError, setCategoryLoadError] = useState<string | null>(
//     null
//   );

//   // IMAGES
//   const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
//   const [files, setFiles] = useState<File[]>([]);
//   const [previewUrls, setPreviewUrls] = useState<string[]>([]);

//   const [errors, setErrors] = useState<FieldErrors>({});
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [submitError, setSubmitError] = useState<string | null>(null);
//   const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

//   // LOAD CATEGORIES & PRODUCT
//   useEffect(() => {
//     const load = async () => {
//       if (!id) return;

//       setIsLoadingProduct(true);
//       setLoadError(null);
//       setCategoryLoadError(null);
//       setIsCategoryLoading(true);

//       try {
//         const [categoriesRes, productRes] = await Promise.all([
//           fetchCategories(),
//           fetchProductById(id),
//         ]);

//         setCategories(categoriesRes);

//         if (!productRes) {
//           setLoadError("Produk tidak ditemukan.");
//           return;
//         }

//         setInitialProduct(productRes);

//         // isi form
//         setName(productRes.name);
//         setPrice(productRes.price.toString());
//         setDescription(productRes.description || "");

//         // ----- preselect kategori -----
//         let matchedCategoryId = "";

//         if (categoriesRes.length > 0) {
//           const matchById = productRes.categoryId
//             ? categoriesRes.find((c) => c.id === productRes.categoryId)
//             : undefined;

//           const matchBySlug = productRes.categoryId
//             ? categoriesRes.find((c: any) => c.slug === productRes.categoryId)
//             : undefined;

//           const matchByName = productRes.categoryName
//             ? categoriesRes.find((c) => c.name === productRes.categoryName)
//             : undefined;

//           const matched = matchById || matchBySlug || matchByName;

//           if (matched) {
//             matchedCategoryId = matched.id;
//           }
//         }

//         setCategoryId(matchedCategoryId);

//         // ----- gambar lama -----
//         const existing =
//           productRes.imageUrls && productRes.imageUrls.length > 0
//             ? productRes.imageUrls
//             : productRes.imageUrl
//               ? [productRes.imageUrl]
//               : [];

//         setExistingImageUrls(existing);
//       } catch (err: any) {
//         console.error("Gagal memuat data produk:", err);
//         setLoadError(
//           err?.response?.data?.message ||
//           err?.message ||
//           "Gagal memuat data produk."
//         );
//       } finally {
//         setIsLoadingProduct(false);
//         setIsCategoryLoading(false);
//       }
//     };

//     load();
//   }, [id]);

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

//     // hapus preview lama
//     previewUrls.forEach((url) => URL.revokeObjectURL(url));

//     const previews = selectedFiles.map((file) =>
//       URL.createObjectURL(file)
//     );
//     setPreviewUrls(previews);
//   };

//   // hapus 1 foto lama
//   const handleRemoveExistingImage = (index: number) => {
//     setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
//   };

//   // hapus 1 foto baru (preview)
//   const handleRemoveNewImage = (index: number) => {
//     setPreviewUrls((prev) => {
//       const copy = [...prev];
//       const url = copy[index];
//       if (url) URL.revokeObjectURL(url);
//       copy.splice(index, 1);
//       return copy;
//     });

//     setFiles((prev) => {
//       const copy = [...prev];
//       copy.splice(index, 1);
//       return copy;
//     });
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

//     if (existingImageUrls.length === 0 && files.length === 0) {
//       newErrors.images = "Minimal 1 foto produk harus tersedia.";
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
//     if (!id) return;

//     setSubmitError(null);
//     setSubmitSuccess(null);

//     if (!validate()) return;

//     setIsSubmitting(true);

//     try {
//       let finalImageUrls = [...existingImageUrls];

//       // upload foto baru (jika ada)
//       if (files.length > 0) {
//         const uploaded = await uploadProductImages(files);
//         if (uploaded.length > 0) {
//           finalImageUrls = [...existingImageUrls, ...uploaded];
//         }
//       }

//       const selectedCategory = categories.find(
//         (cat) => cat.id === categoryId
//       );

//       const payload: UpdateProductPayload = {
//         name: name.trim(),
//         description: description.trim(),
//         price: Number(price),
//         categoryName: selectedCategory?.name || "",
//         categoryId:
//           selectedCategory?.slug ||
//           selectedCategory?.id ||
//           slugify(selectedCategory?.name || ""),
//         imageUrls: finalImageUrls,
//       };

//       await updateProduct(id, payload);

//       setSubmitSuccess("Perubahan produk berhasil disimpan.");
//       setTimeout(() => {
//         navigate("/products");
//       }, 900);
//     } catch (err: any) {
//       console.error("Gagal menyimpan perubahan produk:", err);
//       setSubmitError(
//         err?.response?.data?.message ||
//         err?.message ||
//         "Terjadi kesalahan saat menyimpan perubahan."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const fieldClass = (hasError?: string) =>
//     hasError ? `${styles.input} ${styles.inputError}` : styles.input;

//   if (isLoadingProduct) {
//     return (
//       <div className={styles.page}>
//         <header className={styles.header}>
//           <h1>Edit Produk</h1>
//         </header>
//         <section className={styles.formSection}>
//           <div className={styles.formCard}>
//             <p>Sedang memuat data produk…</p>
//           </div>
//         </section>
//       </div>
//     );
//   }

//   if (loadError || !initialProduct) {
//     return (
//       <div className={styles.page}>
//         <header className={styles.header}>
//           <h1>Edit Produk</h1>
//         </header>
//         <section className={styles.formSection}>
//           <div className={styles.formCard}>
//             <p className={styles.alertError}>
//               {loadError || "Produk tidak ditemukan."}
//             </p>
//             <button
//               type="button"
//               className={styles.secondaryButton}
//               onClick={() => navigate("/products")}
//             >
//               Kembali ke daftar
//             </button>
//           </div>
//         </section>
//       </div>
//     );
//   }

//   return (
//     <div className={styles.page}>
//       <header className={styles.header}>
//         <div>
//           <h1>Edit Produk</h1>
//           <p>Perbarui informasi produk roti unyil Alfarazka Bakery.</p>
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

//               {/* KATEGORI */}
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

//                 {/* gambar lama */}
//                 {existingImageUrls.length > 0 && (
//                   <div className={styles.previewGrid}>
//                     {existingImageUrls.map((url, idx) => (
//                       <div key={idx} className={styles.previewItem}>
//                         <img src={url} alt={`Foto lama ${idx + 1}`} />
//                         <button
//                           type="button"
//                           className={styles.removeImageButton}
//                           onClick={() => handleRemoveExistingImage(idx)}
//                         >
//                           Hapus
//                         </button>
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 <input
//                   id="images"
//                   type="file"
//                   multiple
//                   accept="image/*"
//                   className={errors.images ? styles.inputErrorFile : ""}
//                   onChange={handleFilesChange}
//                 />
//                 <p className={styles.helperText}>
//                   Kamu boleh menambahkan foto baru. Foto lama yang tidak
//                   dihapus akan tetap digunakan.
//                 </p>
//                 {errors.images && (
//                   <p className={styles.errorText}>{errors.images}</p>
//                 )}

//                 {/* preview foto baru */}
//                 {previewUrls.length > 0 && (
//                   <div className={styles.previewGrid}>
//                     {previewUrls.map((url, idx) => (
//                       <div key={idx} className={styles.previewItem}>
//                         <img src={url} alt={`Foto baru ${idx + 1}`} />
//                         <button
//                           type="button"
//                           className={styles.removeImageButton}
//                           onClick={() => handleRemoveNewImage(idx)}
//                         >
//                           Batalkan
//                         </button>
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
//                 {isSubmitting ? "Menyimpan… mohon tunggu" : "Simpan Perubahan"}
//               </button>
//             </div>
//           </form>
//         </div>
//       </section>
//     </div>
//   );
// };

// export default ProductEditPage;




// src/pages/product/ProductEditPage.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import styles from "./ProductCreatePage.module.scss";

import {
  fetchProductById,
  updateProduct,
  uploadProductImages,
  type UpdateProductPayload,
  type Product,
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

const ProductEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [initialProduct, setInitialProduct] = useState<Product | null>(null);
  const [isLoadingProduct, setIsLoadingProduct] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  // deskripsi juga HTML dari TinyMCE
  const [description, setDescription] = useState("");

  // CATEGORY
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [categoryLoadError, setCategoryLoadError] = useState<string | null>(
    null
  );

  // IMAGES
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  // LOAD CATEGORIES & PRODUCT
  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setIsLoadingProduct(true);
      setLoadError(null);
      setCategoryLoadError(null);
      setIsCategoryLoading(true);

      try {
        const [categoriesRes, productRes] = await Promise.all([
          fetchCategories(),
          fetchProductById(id),
        ]);

        setCategories(categoriesRes);

        if (!productRes) {
          setLoadError("Produk tidak ditemukan.");
          return;
        }

        setInitialProduct(productRes);

        // isi form
        setName(productRes.name);
        setPrice(productRes.price.toString());
        setDescription(productRes.description || "");

        // ----- preselect kategori -----
        let matchedCategoryId = "";

        if (categoriesRes.length > 0) {
          const matchById = productRes.categoryId
            ? categoriesRes.find((c) => c.id === productRes.categoryId)
            : undefined;

          const matchBySlug = productRes.categoryId
            ? categoriesRes.find((c: any) => c.slug === productRes.categoryId)
            : undefined;

          const matchByName = productRes.categoryName
            ? categoriesRes.find((c) => c.name === productRes.categoryName)
            : undefined;

          const matched = matchById || matchBySlug || matchByName;

          if (matched) {
            matchedCategoryId = matched.id;
          }
        }

        setCategoryId(matchedCategoryId);

        // ----- gambar lama -----
        const existing =
          productRes.imageUrls && productRes.imageUrls.length > 0
            ? productRes.imageUrls
            : productRes.imageUrl
              ? [productRes.imageUrl]
              : [];

        setExistingImageUrls(existing);
      } catch (err: any) {
        console.error("Gagal memuat data produk:", err);
        setLoadError(
          err?.response?.data?.message ||
          err?.message ||
          "Gagal memuat data produk."
        );
      } finally {
        setIsLoadingProduct(false);
        setIsCategoryLoading(false);
      }
    };

    load();
  }, [id]);

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

    // hapus preview lama
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    const previews = selectedFiles.map((file) =>
      URL.createObjectURL(file)
    );
    setPreviewUrls(previews);
  };

  // hapus 1 foto lama
  const handleRemoveExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // hapus 1 foto baru (preview)
  const handleRemoveNewImage = (index: number) => {
    setPreviewUrls((prev) => {
      const copy = [...prev];
      const url = copy[index];
      if (url) URL.revokeObjectURL(url);
      copy.splice(index, 1);
      return copy;
    });

    setFiles((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
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

    const plainDescription = description
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!plainDescription) {
      newErrors.description = "Deskripsi singkat produk wajib diisi.";
    }

    if (existingImageUrls.length === 0 && files.length === 0) {
      newErrors.images = "Minimal 1 foto produk harus tersedia.";
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
    if (!id) return;

    setSubmitError(null);
    setSubmitSuccess(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      let finalImageUrls = [...existingImageUrls];

      // upload foto baru (jika ada)
      if (files.length > 0) {
        const uploaded = await uploadProductImages(files);
        if (uploaded.length > 0) {
          finalImageUrls = [...existingImageUrls, ...uploaded];
        }
      }

      const selectedCategory = categories.find(
        (cat) => cat.id === categoryId
      );

      const payload: UpdateProductPayload = {
        name: name.trim(),
        // simpan HTML
        description: description.trim(),
        price: Number(price),
        categoryName: selectedCategory?.name || "",
        categoryId:
          selectedCategory?.slug ||
          selectedCategory?.id ||
          slugify(selectedCategory?.name || ""),
        imageUrls: finalImageUrls,
      };

      await updateProduct(id, payload);

      setSubmitSuccess("Perubahan produk berhasil disimpan.");
      setTimeout(() => {
        navigate("/products");
      }, 900);
    } catch (err: any) {
      console.error("Gagal menyimpan perubahan produk:", err);
      setSubmitError(
        err?.response?.data?.message ||
        err?.message ||
        "Terjadi kesalahan saat menyimpan perubahan."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass = (hasError?: string) =>
    hasError ? `${styles.input} ${styles.inputError}` : styles.input;

  if (isLoadingProduct) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Edit Produk</h1>
        </header>
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            <p>Sedang memuat data produk…</p>
          </div>
        </section>
      </div>
    );
  }

  if (loadError || !initialProduct) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1>Edit Produk</h1>
        </header>
        <section className={styles.formSection}>
          <div className={styles.formCard}>
            <p className={styles.alertError}>
              {loadError || "Produk tidak ditemukan."}
            </p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => navigate("/products")}
            >
              Kembali ke daftar
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1>Edit Produk</h1>
          <p>Perbarui informasi produk roti unyil Alfarazka Bakery.</p>
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

              {/* KATEGORI */}
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
                    apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
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

                {/* gambar lama */}
                {existingImageUrls.length > 0 && (
                  <div className={styles.previewGrid}>
                    {existingImageUrls.map((url, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <img src={url} alt={`Foto lama ${idx + 1}`} />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => handleRemoveExistingImage(idx)}
                        >
                          Hapus
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  id="images"
                  type="file"
                  multiple
                  accept="image/*"
                  className={errors.images ? styles.inputErrorFile : ""}
                  onChange={handleFilesChange}
                />
                <p className={styles.helperText}>
                  Kamu boleh menambahkan foto baru. Foto lama yang tidak
                  dihapus akan tetap digunakan.
                </p>
                {errors.images && (
                  <p className={styles.errorText}>{errors.images}</p>
                )}

                {/* preview foto baru */}
                {previewUrls.length > 0 && (
                  <div className={styles.previewGrid}>
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className={styles.previewItem}>
                        <img src={url} alt={`Foto baru ${idx + 1}`} />
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => handleRemoveNewImage(idx)}
                        >
                          Batalkan
                        </button>
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
                {isSubmitting ? "Menyimpan… mohon tunggu" : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default ProductEditPage;