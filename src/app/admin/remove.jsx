"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.05
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

const backdropVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  idle: {
    scale: 1
  },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.95
  }
};

const messageVariants = {
  hidden: {
    opacity: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const loadingVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

const searchVariants = {
  focus: {
    scale: 1.02,
    boxShadow: "0 0 0 3px rgba(168, 85, 247, 0.1)",
    transition: {
      duration: 0.2
    }
  }
};

const confirmationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.7,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.7,
    y: 50,
    transition: {
      duration: 0.2,
      ease: "easeIn"
    }
  }
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editNewPrice, setEditNewPrice] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);

  // Color-image mapping for edit: { "burgundy": { existingUrls: [...], newFiles: [], newPreviews: [] } }
  const [editColorImageMap, setEditColorImageMap] = useState({});
  const [showEditColorPicker, setShowEditColorPicker] = useState(false);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const colorOptions = [
    "white","black","red","fuchsia","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ];
  const popularColorOptions = [
    "rose gold","blush pink","coral","dusty rose","mauve","burgundy",
    "wine","champagne","ivory","cream","nude","camel","tan","taupe",
    "khaki","mint","sage","emerald","forest green","lavender","lilac",
    "periwinkle","cobalt","powder blue","baby blue","rust","terracotta",
    "peach","apricot","mustard","off white","charcoal","hot pink",
    "crimson","copper","bronze","plum","seafoam","sky blue"
  ];
  const colorHexMap = {
    "rose gold": "#B76E79",
    "blush pink": "#F4C2C2",
    "coral": "#FF7F50",
    "dusty rose": "#DCAE96",
    "mauve": "#E0B0FF",
    "burgundy": "#800020",
    "wine": "#722F37",
    "champagne": "#F7E7CE",
    "ivory": "#FFFFF0",
    "cream": "#FFFDD0",
    "nude": "#E3BC9A",
    "camel": "#C19A6B",
    "tan": "#D2B48C",
    "taupe": "#483C32",
    "khaki": "#C3B091",
    "mint": "#98FF98",
    "sage": "#BCB88A",
    "emerald": "#50C878",
    "forest green": "#228B22",
    "lavender": "#E6E6FA",
    "lilac": "#C8A2C8",
    "periwinkle": "#CCCCFF",
    "cobalt": "#0047AB",
    "powder blue": "#B0E0E6",
    "baby blue": "#89CFF0",
    "rust": "#B7410E",
    "terracotta": "#E2725B",
    "peach": "#FFCBA4",
    "apricot": "#FBCEB1",
    "mustard": "#FFDB58",
    "off white": "#FAF9F6",
    "charcoal": "#36454F",
    "hot pink": "#FF69B4",
    "crimson": "#DC143C",
    "copper": "#B87333",
    "bronze": "#CD7F32",
    "plum": "#8E4585",
    "seafoam": "#93E9BE",
    "sky blue": "#87CEEB",
  };
  const getColorValue = (color) => colorHexMap[color] || color;

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [products, searchTerm]);

  const checkStorageSetup = async () => {
    try {
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error('Storage check error:', error);
        setMessage('Call 01028518754');
        return;
      }

      const bucketExists = data.some(bucket => bucket.name === 'product-images');
      
    } catch (error) {
      console.error('Storage setup check failed:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error(error);
        setMessage("Error loading products: " + error.message);
      } else {
        setProducts(data || []);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Error loading products: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStorageSetup();
    fetchProducts();
  }, []);

  const showDeleteConfirmation = (product) => {
    setProductToDelete(product);
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setProductToDelete(null);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete.id}`, { method: "DELETE" });
      
      if (!res.ok) {
        let errorMessage = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          try {
            const errorText = await res.text();
            errorMessage = errorText || errorMessage;
          } catch (textError) {
            // Keep the HTTP status message
          }
        }
        
        setMessage(errorMessage);
        setTimeout(() => setMessage(""), 5000);
        return;
      }

      // Trigger revalidation for SSG/ISR pages
      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', productId: productToDelete.id })
        });
      } catch (revError) {
        console.warn('Revalidation request failed:', revError);
      }

      setMessage("Product deleted successfully! Pages will update shortly.");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Error deleting product: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setDeleting(false);
      setShowConfirmation(false);
      setProductToDelete(null);
    }
  };

  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditPrice(prod.price);
    setEditNewPrice(prod.newprice || "");

    // Build color-image map from product data
    if (prod.color_images && typeof prod.color_images === "object" && Object.keys(prod.color_images).length > 0) {
      const map = {};
      for (const [color, urls] of Object.entries(prod.color_images)) {
        map[color] = { existingUrls: [...urls], newFiles: [], newPreviews: [] };
      }
      setEditColorImageMap(map);
    } else {
      // Old product without color_images - admin must re-link
      setEditColorImageMap({});
    }
    setShowEditColorPicker(false);
  };

  const addEditColor = (color) => {
    if (!editColorImageMap[color]) {
      setEditColorImageMap(prev => ({ ...prev, [color]: { existingUrls: [], newFiles: [], newPreviews: [] } }));
    }
    setShowEditColorPicker(false);
  };

  const removeEditColor = (color) => {
    setEditColorImageMap(prev => {
      const newMap = { ...prev };
      newMap[color]?.newPreviews.forEach(url => URL.revokeObjectURL(url));
      delete newMap[color];
      return newMap;
    });
  };

  const removeEditExistingImage = async (color, index) => {
    const imageUrl = editColorImageMap[color].existingUrls[index];
    try {
      if (imageUrl && imageUrl.includes('/product-images/')) {
        const urlParts = imageUrl.split('/product-images/');
        const fileName = urlParts[urlParts.length - 1];
        await supabase.storage.from('product-images').remove([fileName]);
      }
    } catch (error) {
      console.error('Storage delete error:', error);
    }
    setEditColorImageMap(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        existingUrls: prev[color].existingUrls.filter((_, i) => i !== index)
      }
    }));
  };

  const removeEditNewImage = (color, index) => {
    setEditColorImageMap(prev => {
      URL.revokeObjectURL(prev[color].newPreviews[index]);
      return {
        ...prev,
        [color]: {
          ...prev[color],
          newFiles: prev[color].newFiles.filter((_, i) => i !== index),
          newPreviews: prev[color].newPreviews.filter((_, i) => i !== index)
        }
      };
    });
  };

  // Image resize function
  const resizeImage = (file, targetWidth = 768, targetHeight = 950) => {
    return new Promise((resolve) => {
      // Create image element properly for browser environment
      const img = document.createElement('img');
      const reader = new FileReader();

      reader.onload = (e) => { 
        img.src = e.target.result; 
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { 
            type: file.type,
            lastModified: Date.now()
          });
          resolve(resizedFile);
        }, file.type, 0.8); // 0.8 quality for better compression
      };

      reader.readAsDataURL(file);
    });
  };

  const handleEditColorImageUpload = async (color, event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setMessage("Processing images...");

    try {
      const resizedFiles = [];
      const previews = [];

      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5242880) {
          setMessage(`File ${file.name} is too large (max 5MB)`);
          continue;
        }
        const resizedFile = await resizeImage(file);
        resizedFiles.push(resizedFile);
        previews.push(URL.createObjectURL(resizedFile));
      }

      setEditColorImageMap(prev => ({
        ...prev,
        [color]: {
          ...prev[color],
          newFiles: [...prev[color].newFiles, ...resizedFiles],
          newPreviews: [...prev[color].newPreviews, ...previews]
        }
      }));
      setMessage("");
    } catch (error) {
      console.error('Image processing error:', error);
      setMessage("Error processing images: " + error.message);
    } finally {
      setUploadingImages(false);
      event.target.value = '';
    }
  };

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editPrice) {
      setMessage("Name and price are required!");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    const colorNames = Object.keys(editColorImageMap);
    if (colorNames.length === 0) {
      setMessage("Please add at least one color with images.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    try {
      setUploadingImages(true);
      setMessage("Uploading new images...");

      // Build final color_images: upload new files, combine with existing URLs
      const colorImagesResult = {};
      for (const [color, entry] of Object.entries(editColorImageMap)) {
        const urls = [...entry.existingUrls];

        // Upload new files for this color
        for (const file of entry.newFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const { error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, { cacheControl: '3600', upsert: false });
          if (error) {
            console.error('Upload error:', error);
            continue;
          }
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          if (urlData?.publicUrl) urls.push(urlData.publicUrl);
        }

        if (urls.length > 0) {
          colorImagesResult[color] = urls;
        }
      }

      setMessage("Saving product...");

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          newprice: editNewPrice ? Number(editNewPrice) : null,
          color_images: colorImagesResult,
          colors: Object.keys(colorImagesResult),
          pictures: Object.values(colorImagesResult).flat()
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      try {
        await fetch('/api/revalidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', productId: editingProduct.id })
        });
      } catch (revError) {
        console.warn('Revalidation request failed:', revError);
      }

      // Clean up preview URLs
      Object.values(editColorImageMap).forEach(entry =>
        entry.newPreviews.forEach(url => URL.revokeObjectURL(url))
      );

      setEditingProduct(null);
      setMessage("Product updated successfully!");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Error updating product: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setUploadingImages(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const closeEditModal = () => {
    setEditingProduct(null);
  };

  return (
    <motion.div 
      className="p-6 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-6 text-center"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        Manage Products
      </motion.h1>

      {/* Search Bar */}
      <motion.div 
        className="mb-6 max-w-md mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="relative">
          <motion.input
            type="text"
            placeholder=" Search products by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-fuchsia-600 transition-all duration-200"
            variants={searchVariants}
            whileFocus="focus"
          />
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            !
          </div>
          <AnimatePresence>
            {searchTerm && (
              <motion.button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                X
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        
        {/* Search Results Info */}
        <AnimatePresence>
          {searchTerm && (
            <motion.p 
              className="text-sm text-gray-600 mt-2 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {filteredProducts.length === 0 
                ? `No products found for "${searchTerm}"` 
                : `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`
              }
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.p 
            className={`text-center mb-4 p-3 rounded ${
              message.includes("successfully") ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"
            }`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Loading State */}
      {loading ? (
        <motion.div
          className="flex flex-col items-center justify-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className="w-8 h-8 border-4 border-gray-300 border-t-purple-600 rounded-full mb-4"
            variants={loadingVariants}
            animate="animate"
          />
          <p className="text-center">Loading products...</p>
        </motion.div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <motion.div 
          className="text-center py-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-6xl mb-4">X</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? `Try searching for something else or clear the search to see all products.` 
              : 'Add your first product to get started!'
            }
          </p>
          {searchTerm && (
            <motion.button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Show All Products
            </motion.button>
          )}
        </motion.div>
      ) : (
        /* Products Grid */
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          key={searchTerm}
        >
          {filteredProducts.map((prod, index) => (
            <motion.div
              key={prod.id}
              className="border rounded-xl p-4 relative flex flex-col items-center shadow hover:shadow-lg transition"
              variants={cardVariants}
              whileHover="hover"
              custom={index}
              layout
            >
              <motion.div
                className="lg:w-full h-72 lg:h-58 mb-3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Image
                  src={prod.pictures?.[0] || "/placeholder.png"}
                  alt={prod.name}
                  width={400}
                  height={550}
                  className="rounded object-cover w-full h-full"
                />
              </motion.div>

              <motion.h2 
                className="font-semibold text-lg text-center mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              >
                {prod.name}
              </motion.h2>

              <motion.div
                className="text-center mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                <p className="text-gray-600 font-medium">{prod.price} LE</p>
                {prod.newprice && <p className="text-gray-500 font-medium">New: {prod.newprice} LE</p>}
              </motion.div>

              <motion.div 
                className="flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
              >
                <motion.button
                  onClick={() => openEditModal(prod)}
                  className="px-3 py-1 bg-fuchsia-600 text-white rounded transition hover:bg-fuchsia-700"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Edit
                </motion.button>
                <motion.button
                  onClick={() => showDeleteConfirmation(prod)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Delete
                </motion.button>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && productToDelete && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={cancelDelete}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
              variants={confirmationVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-6xl mb-4">Warning</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Product?</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="font-semibold text-gray-800">"{productToDelete.name}"?</p>
                <p className="text-sm text-red-500 mt-2">
                  This action cannot be undone!
                </p>
              </motion.div>

              <motion.div
                className="flex gap-3 justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.button
                  onClick={cancelDelete}
                  className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition disabled:opacity-50"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!deleting ? "hover" : {}}
                  whileTap={!deleting ? "tap" : {}}
                  disabled={deleting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={confirmDelete}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover={!deleting ? "hover" : {}}
                  whileTap={!deleting ? "tap" : {}}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        variants={loadingVariants}
                        animate="animate"
                      />
                      Deleting...
                    </span>
                  ) : (
                    "Delete"
                  )}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingProduct && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={closeEditModal}
          >
            <motion.div
              className="bg-white p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.h2 
                className="text-xl font-bold mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                Edit Product
              </motion.h2>

              <motion.input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Product Name *"
                className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:border-fuchsia-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />

              <motion.input
                type="number"
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                placeholder="Price *"
                className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:border-fuchsia-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />

              <motion.input
                type="number"
                value={editNewPrice}
                onChange={(e) => setEditNewPrice(e.target.value)}
                placeholder="New Price (Optional)"
                className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:border-fuchsia-600"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              />

              {/* Colors & Images */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Colors & Images:</h3>
                  <button
                    type="button"
                    onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                    className="px-3 py-1 bg-fuchsia-600 text-white rounded-full text-xs font-medium hover:bg-fuchsia-700 transition"
                  >
                    + Add Color
                  </button>
                </div>

                {/* Color Picker */}
                <AnimatePresence>
                  {showEditColorPicker && (
                    <motion.div
                      className="mb-3 border border-fuchsia-200 rounded-lg p-2 bg-white shadow max-h-48 overflow-y-auto"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">General</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {colorOptions.filter(c => !editColorImageMap[c]).map((color) => (
                          <button key={color} type="button" onClick={() => addEditColor(color)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-100 transition capitalize">
                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: color }}></span>
                            {color}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Popular</p>
                      <div className="flex flex-wrap gap-1">
                        {popularColorOptions.filter(c => !editColorImageMap[c]).map((color) => (
                          <button key={color} type="button" onClick={() => addEditColor(color)}
                            className="flex items-center gap-1 px-2 py-1 rounded text-xs hover:bg-gray-100 transition capitalize">
                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: getColorValue(color) }}></span>
                            {color}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* No color_images warning for old products */}
                {Object.keys(editColorImageMap).length === 0 && editingProduct && !editingProduct.color_images && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                    This product has no color-image links. Add colors and upload images for each to set up the mapping.
                  </div>
                )}

                {/* Color Cards */}
                <div className="space-y-3">
                  {Object.entries(editColorImageMap).map(([color, entry]) => {
                    const inputId = `edit-upload-${color.replace(/\s+/g, '-')}`;
                    return (
                      <div key={color} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: getColorValue(color) }}></span>
                            <span className="font-medium capitalize text-sm">{color}</span>
                            <span className="text-xs text-gray-400">({entry.existingUrls.length + entry.newFiles.length})</span>
                          </div>
                          <button type="button" onClick={() => removeEditColor(color)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                        </div>

                        {/* Existing images */}
                        {(entry.existingUrls.length > 0 || entry.newPreviews.length > 0) && (
                          <div className="grid grid-cols-4 gap-2 mb-2">
                            {entry.existingUrls.map((img, idx) => (
                              <div key={`existing-${idx}`} className="relative group">
                                <Image src={img} alt={`${color} ${idx + 1}`} width={80} height={80} className="rounded object-cover w-full h-16" />
                                <button onClick={() => removeEditExistingImage(color, idx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                  ×
                                </button>
                              </div>
                            ))}
                            {entry.newPreviews.map((url, idx) => (
                              <div key={`new-${idx}`} className="relative group">
                                <img src={url} alt={`${color} new ${idx + 1}`} className="rounded object-cover w-full h-16 border border-fuchsia-300" />
                                <button onClick={() => removeEditNewImage(color, idx)}
                                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Upload for this color */}
                        <div className="border border-dashed border-gray-300 rounded p-2 text-center hover:border-fuchsia-400 transition">
                          <input type="file" accept="image/*" multiple onChange={(e) => handleEditColorImageUpload(color, e)}
                            className="hidden" id={inputId} disabled={uploadingImages} />
                          <label htmlFor={inputId}
                            className={`cursor-pointer text-fuchsia-600 hover:text-fuchsia-700 font-medium text-xs ${uploadingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploadingImages ? 'Processing...' : `Add images for ${color}`}
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Modal Actions */}
              <motion.div 
                className="flex justify-end gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <motion.button
                  onClick={closeEditModal}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  disabled={uploadingImages}
                >
                  {uploadingImages ? 'Processing...' : 'Save Changes'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}