"use client";

import { useState, useEffect, useMemo } from "react";
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
    boxShadow: "0 0 0 3px rgba(27, 42, 74, 0.1)",
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
  const [savingEdit, setSavingEdit] = useState(false);

  // Car-specific edit fields
  const [editBrand, setEditBrand] = useState("");
  const [editYear, setEditYear] = useState("");
  const [editMileage, setEditMileage] = useState("");
  const [editTransmission, setEditTransmission] = useState("");
  const [editFuelType, setEditFuelType] = useState("");
  const [editEngineSize, setEditEngineSize] = useState("");
  const [editFeatures, setEditFeatures] = useState("");

  // Color-image mapping for edit: { "black": { existingUrls: [...], newUrls: "" } }
  const [editColorImageMap, setEditColorImageMap] = useState({});
  const [showEditColorPicker, setShowEditColorPicker] = useState(false);

  // Confirmation modal state
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const colorOptions = [
    "black", "white", "silver", "gray", "red", "blue", "green", "brown", "beige", "navy", "maroon"
  ];
  const popularColorOptions = [
    "pearl white", "metallic gray", "champagne gold", "midnight blue", "racing red",
    "charcoal", "bronze", "deep black"
  ];
  const colorHexMap = {
    "black": "#000000",
    "white": "#FFFFFF",
    "silver": "#C0C0C0",
    "gray": "#808080",
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#008000",
    "brown": "#8B4513",
    "beige": "#F5F5DC",
    "navy": "#000080",
    "maroon": "#800000",
    "pearl white": "#F0EAD6",
    "metallic gray": "#A9A9A9",
    "champagne gold": "#F7E7CE",
    "midnight blue": "#191970",
    "racing red": "#D40000",
    "charcoal": "#36454F",
    "bronze": "#CD7F32",
    "deep black": "#0A0A0A",
  };
  const getColorValue = (color) => colorHexMap[color] || color;

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || data || []);
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Error loading vehicles: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

      setMessage("Vehicle deleted successfully! Pages will update shortly.");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Error deleting vehicle: " + error.message);
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
    setEditBrand(prod.brand || "");
    setEditYear(prod.year || "");
    setEditMileage(prod.mileage || "");
    setEditTransmission(prod.transmission || "");
    setEditFuelType(prod.fuelType || "");
    setEditEngineSize(prod.engineSize || "");
    setEditFeatures(Array.isArray(prod.features) ? prod.features.join(", ") : (prod.features || ""));

    // Build color-image map from product data
    if (prod.color_images && typeof prod.color_images === "object" && Object.keys(prod.color_images).length > 0) {
      const map = {};
      for (const [color, urls] of Object.entries(prod.color_images)) {
        map[color] = { existingUrls: [...urls], newUrls: "" };
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
      setEditColorImageMap(prev => ({ ...prev, [color]: { existingUrls: [], newUrls: "" } }));
    }
    setShowEditColorPicker(false);
  };

  const removeEditColor = (color) => {
    setEditColorImageMap(prev => {
      const newMap = { ...prev };
      delete newMap[color];
      return newMap;
    });
  };

  const removeEditExistingImage = (color, index) => {
    setEditColorImageMap(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        existingUrls: prev[color].existingUrls.filter((_, i) => i !== index)
      }
    }));
  };

  const handleEditColorUrlChange = (color, value) => {
    setEditColorImageMap(prev => ({
      ...prev,
      [color]: {
        ...prev[color],
        newUrls: value
      }
    }));
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
      setSavingEdit(true);
      setMessage("Saving vehicle...");

      // Build final color_images: combine existing URLs with new pasted URLs
      const colorImagesResult = {};
      for (const [color, entry] of Object.entries(editColorImageMap)) {
        const urls = [...entry.existingUrls];

        // Parse new URLs from the text area (one per line)
        if (entry.newUrls && entry.newUrls.trim()) {
          const newUrlList = entry.newUrls
            .split("\n")
            .map(u => u.trim())
            .filter(u => u.length > 0);
          urls.push(...newUrlList);
        }

        if (urls.length > 0) {
          colorImagesResult[color] = urls;
        }
      }

      // Parse features from comma-separated string
      const featuresArray = editFeatures
        ? editFeatures.split(",").map(f => f.trim()).filter(f => f.length > 0)
        : [];

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          price: Number(editPrice),
          newprice: editNewPrice ? Number(editNewPrice) : null,
          color_images: colorImagesResult,
          colors: Object.keys(colorImagesResult),
          pictures: Object.values(colorImagesResult).flat(),
          brand: editBrand.trim() || null,
          year: editYear ? Number(editYear) : null,
          mileage: editMileage ? Number(editMileage) : null,
          transmission: editTransmission.trim() || null,
          fuelType: editFuelType.trim() || null,
          engineSize: editEngineSize.trim() || null,
          features: featuresArray,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update vehicle");
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

      setEditingProduct(null);
      setMessage("Vehicle updated successfully!");
      fetchProducts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Update error:", error);
      setMessage("Error updating vehicle: " + error.message);
      setTimeout(() => setMessage(""), 5000);
    } finally {
      setSavingEdit(false);
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
        Manage Vehicles
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
            placeholder=" Search vehicles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#1B2A4A] transition-all duration-200"
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
                ? `No vehicles found for "${searchTerm}"`
                : `Found ${filteredProducts.length} vehicle${filteredProducts.length !== 1 ? 's' : ''} for "${searchTerm}"`
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
            className="w-8 h-8 border-4 border-gray-300 border-t-[#1B2A4A] rounded-full mb-4"
            variants={loadingVariants}
            animate="animate"
          />
          <p className="text-center">Loading vehicles...</p>
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
            {searchTerm ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
          <p className="text-gray-500">
            {searchTerm
              ? `Try searching for something else or clear the search to see all vehicles.`
              : 'Add your first vehicle to get started!'
            }
          </p>
          {searchTerm && (
            <motion.button
              onClick={clearSearch}
              className="mt-4 px-4 py-2 bg-[#1B2A4A] text-white rounded hover:bg-[#2C3E6B] transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Show All Vehicles
            </motion.button>
          )}
        </motion.div>
      ) : (
        /* Vehicles Grid */
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
                className="font-semibold text-lg text-center mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
              >
                {prod.name}
              </motion.h2>

              {/* Car specs */}
              <motion.div
                className="text-xs text-gray-500 text-center mb-2 space-y-0.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.15 }}
              >
                {(prod.year || prod.mileage || prod.transmission) && (
                  <p>
                    {prod.year && <span>{prod.year}</span>}
                    {prod.year && prod.mileage && <span> &middot; </span>}
                    {prod.mileage && <span>{Number(prod.mileage).toLocaleString()} km</span>}
                    {(prod.year || prod.mileage) && prod.transmission && <span> &middot; </span>}
                    {prod.transmission && <span className="capitalize">{prod.transmission}</span>}
                  </p>
                )}
              </motion.div>

              <motion.div
                className="text-center mb-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
              >
                <p className="text-gray-600 font-medium">{prod.price} EGP</p>
                {prod.newprice && <p className="text-gray-500 font-medium">New: {prod.newprice} EGP</p>}
              </motion.div>

              <motion.div
                className="flex gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
              >
                <motion.button
                  onClick={() => openEditModal(prod)}
                  className="px-3 py-1 bg-[#1B2A4A] text-white rounded transition hover:bg-[#2C3E6B]"
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
                <h3 className="text-xl font-bold text-gray-800 mb-2">Delete Vehicle?</h3>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to delete
                </p>
                <p className="font-semibold text-gray-800">&quot;{productToDelete.name}&quot;?</p>
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
                Edit Vehicle
              </motion.h2>

              <motion.input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Vehicle Name *"
                className="w-full mb-3 p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <motion.input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Price (EGP) *"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.15 }}
                />
                <motion.input
                  type="number"
                  value={editNewPrice}
                  onChange={(e) => setEditNewPrice(e.target.value)}
                  placeholder="New Price (EGP, Optional)"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                />
              </div>

              {/* Car-specific fields */}
              <motion.div
                className="mb-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.25 }}
              >
                <h3 className="text-sm font-semibold mb-2 text-gray-700">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    placeholder="Brand (e.g. Toyota)"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                  />
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(e.target.value)}
                    placeholder="Year (e.g. 2022)"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                  />
                  <input
                    type="number"
                    value={editMileage}
                    onChange={(e) => setEditMileage(e.target.value)}
                    placeholder="Mileage (km)"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                  />
                  <select
                    value={editTransmission}
                    onChange={(e) => setEditTransmission(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  >
                    <option value="">Transmission</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                  </select>
                  <select
                    value={editFuelType}
                    onChange={(e) => setEditFuelType(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A] bg-white"
                  >
                    <option value="">Fuel Type</option>
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="electric">Electric</option>
                    <option value="natural gas">Natural Gas</option>
                  </select>
                  <input
                    type="text"
                    value={editEngineSize}
                    onChange={(e) => setEditEngineSize(e.target.value)}
                    placeholder="Engine Size (e.g. 1.6L)"
                    className="w-full p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                  />
                </div>
                <input
                  type="text"
                  value={editFeatures}
                  onChange={(e) => setEditFeatures(e.target.value)}
                  placeholder="Features (comma-separated, e.g. Sunroof, Leather Seats, ABS)"
                  className="w-full mt-3 p-3 border rounded-lg focus:outline-none focus:border-[#1B2A4A]"
                />
              </motion.div>

              {/* Colors & Images */}
              <motion.div
                className="mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold">Colors & Images:</h3>
                  <button
                    type="button"
                    onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                    className="px-3 py-1 bg-[#1B2A4A] text-white rounded-full text-xs font-medium hover:bg-[#2C3E6B] transition"
                  >
                    + Add Color
                  </button>
                </div>

                {/* Color Picker */}
                <AnimatePresence>
                  {showEditColorPicker && (
                    <motion.div
                      className="mb-3 border border-[#1B2A4A]/20 rounded-lg p-2 bg-white shadow max-h-48 overflow-y-auto"
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
                            <span className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: getColorValue(color) }}></span>
                            {color}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Popular Car Colors</p>
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

                {/* No color_images warning for old vehicles */}
                {Object.keys(editColorImageMap).length === 0 && editingProduct && !editingProduct.color_images && (
                  <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800">
                    This vehicle has no color-image links. Add colors and paste image URLs for each to set up the mapping.
                  </div>
                )}

                {/* Color Cards */}
                <div className="space-y-3">
                  {Object.entries(editColorImageMap).map(([color, entry]) => (
                    <div key={color} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full border border-gray-300" style={{ backgroundColor: getColorValue(color) }}></span>
                          <span className="font-medium capitalize text-sm">{color}</span>
                          <span className="text-xs text-gray-400">
                            ({entry.existingUrls.length + (entry.newUrls ? entry.newUrls.split("\n").filter(u => u.trim()).length : 0)})
                          </span>
                        </div>
                        <button type="button" onClick={() => removeEditColor(color)} className="text-red-500 hover:text-red-700 text-xs font-medium">Remove</button>
                      </div>

                      {/* Existing images */}
                      {entry.existingUrls.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {entry.existingUrls.map((img, idx) => (
                            <div key={`existing-${idx}`} className="relative group">
                              <Image src={img} alt={`${color} ${idx + 1}`} width={80} height={80} className="rounded object-cover w-full h-16" />
                              <button onClick={() => removeEditExistingImage(color, idx)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                x
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* URL input for this color */}
                      <div className="border border-dashed border-gray-300 rounded p-2 hover:border-[#1B2A4A] transition">
                        <textarea
                          value={entry.newUrls}
                          onChange={(e) => handleEditColorUrlChange(color, e.target.value)}
                          placeholder={`Paste image URLs for ${color} (one per line)`}
                          className="w-full text-xs p-2 border-none outline-none resize-y min-h-[60px] bg-transparent focus:ring-0"
                          rows={3}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Enter one image URL per line</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Modal Actions */}
              <motion.div
                className="flex justify-end gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
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
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
