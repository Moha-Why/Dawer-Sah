"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { motion, AnimatePresence } from "framer-motion"

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
}

const inputVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

export default function AddProductWithRevalidation() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [sizes, setSizes] = useState([])
  const [type, setType] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [newprice, setNewprice] = useState("")
  const [uploadingImages, setUploadingImages] = useState(false)

  // Color-image mapping: { "burgundy": { files: [File], previews: ["blob:..."] }, ... }
  const [colorImageMap, setColorImageMap] = useState({})
  const [showColorPicker, setShowColorPicker] = useState(false)

  const colorOptions = [
    "white","black","red","blue","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ]
  const popularColorOptions = [
    "rose gold","blush pink","coral","dusty rose","mauve","burgundy",
    "wine","champagne","ivory","cream","nude","camel","tan","taupe",
    "khaki","mint","sage","emerald","forest green","lavender","lilac",
    "periwinkle","cobalt","powder blue","baby blue","rust","terracotta",
    "peach","apricot","mustard","off white","charcoal","hot pink",
    "crimson","copper","bronze","plum","seafoam","sky blue"
  ]
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
  }
  const getColorValue = (color) => colorHexMap[color] || color

  const sizeOptions = ["S", "M", "L", "XL"]
  const typeOptions = ["dress", "casual", "bag"]

  const isBag = type.toLowerCase() === "bag"

  const handleTypeChange = (newType) => {
    setType(newType)
    if (newType.toLowerCase() === "bag") {
      setSizes([])
    }
  }

  const handleSizeToggle = (size) => {
    setSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size])
  }

  // Color-image helpers
  const addColor = (color) => {
    if (!colorImageMap[color]) {
      setColorImageMap(prev => ({ ...prev, [color]: { files: [], previews: [] } }))
    }
    setShowColorPicker(false)
  }

  const removeColor = (color) => {
    setColorImageMap(prev => {
      const newMap = { ...prev }
      newMap[color]?.previews.forEach(url => URL.revokeObjectURL(url))
      delete newMap[color]
      return newMap
    })
  }

  // Image resize function
  const resizeImage = (file, targetWidth = 768, targetHeight = 950) => {
    return new Promise((resolve) => {
      const img = new Image()
      const reader = new FileReader()
      reader.onload = (e) => { img.src = e.target.result }
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        canvas.width = targetWidth
        canvas.height = targetHeight
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
        canvas.toBlob((blob) => {
          const resizedFile = new File([blob], file.name, { type: file.type, lastModified: Date.now() })
          resolve(resizedFile)
        }, file.type, 0.8)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleColorFileChange = async (color, e) => {
    const selectedFiles = Array.from(e.target.files)
    if (selectedFiles.length === 0) return

    setUploadingImages(true)
    setMessage("Processing images...")

    try {
      const resizedFiles = []
      const previews = []

      for (let file of selectedFiles) {
        if (!file.type.startsWith('image/')) continue
        if (file.size > 5242880) {
          setMessage(`File ${file.name} is too large (max 5MB)`)
          continue
        }
        const resizedFile = await resizeImage(file)
        resizedFiles.push(resizedFile)
        previews.push(URL.createObjectURL(resizedFile))
      }

      setColorImageMap(prev => ({
        ...prev,
        [color]: {
          files: [...prev[color].files, ...resizedFiles],
          previews: [...prev[color].previews, ...previews]
        }
      }))
      setMessage("")
    } catch (error) {
      console.error('Image processing error:', error)
      setMessage("Error processing images: " + error.message)
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  const removeImageFromColor = (color, index) => {
    setColorImageMap(prev => {
      const entry = prev[color]
      URL.revokeObjectURL(entry.previews[index])
      return {
        ...prev,
        [color]: {
          files: entry.files.filter((_, i) => i !== index),
          previews: entry.previews.filter((_, i) => i !== index)
        }
      }
    })
  }

  const uploadFilesToStorage = async (files) => {
    const urls = []
    for (let file of files) {
      try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`
        const { error } = await supabase.storage
          .from("product-images")
          .upload(fileName, file, { cacheControl: '3600', upsert: false })
        if (error) {
          console.error('Upload error:', error)
          continue
        }
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        if (urlData?.publicUrl) urls.push(urlData.publicUrl)
      } catch (error) {
        console.error(`Error uploading ${file.name}:`, error)
      }
    }
    return urls
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const colorNames = Object.keys(colorImageMap)
    const totalFiles = Object.values(colorImageMap).reduce((sum, entry) => sum + entry.files.length, 0)

    if (!name || !price || colorNames.length === 0 || totalFiles === 0 || (!isBag && sizes.length === 0) || !type) {
      setMessage("Please fill in all required fields. Each color needs at least one image.")
      setLoading(false)
      return
    }

    try {
      setMessage("Uploading images...")

      // Upload images per color and build the color_images map
      const colorImagesResult = {}
      for (const [color, entry] of Object.entries(colorImageMap)) {
        if (entry.files.length === 0) continue
        const urls = await uploadFilesToStorage(entry.files)
        if (urls.length > 0) {
          colorImagesResult[color] = urls
        }
      }

      if (Object.keys(colorImagesResult).length === 0) {
        setMessage("No images were uploaded successfully. Please try again.")
        setLoading(false)
        return
      }

      setMessage("Creating product...")

      const product = {
        name,
        price: Number(price),
        newprice: newprice ? Number(newprice) : null,
        description: description || "",
        color_images: colorImagesResult,
        colors: Object.keys(colorImagesResult),
        pictures: Object.values(colorImagesResult).flat(),
        sizes: isBag ? [] : sizes,
        type,
        owner_id: "dev-user-123"
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })

      const result = await res.json()

      if (res.ok) {
        // Clean preview URLs from memory
        Object.values(colorImageMap).forEach(entry =>
          entry.previews.forEach(url => URL.revokeObjectURL(url))
        )

        // Reset form
        setName("")
        setPrice("")
        setNewprice("")
        setDescription("")
        setColorImageMap({})
        setSizes([])
        setType("")

        setMessage(`✅ "${name}" saved to database successfully!

🚨 IMPORTANT: Go back to Dashboard tab and click "Update Website" button to make this product visible to customers.

The product is saved but NOT live yet - you control when it goes public.`)

        setTimeout(() => setMessage(""), 15000)
      } else {
        setMessage("Error: " + (result.error || "Error adding product"))
        setTimeout(() => setMessage(""), 5000)
      }
    } catch (err) {
      console.error(err)
      setMessage("Error: " + err.message)
      setTimeout(() => setMessage(""), 5000)
    }

    setLoading(false)
  }

  const selectedColors = Object.keys(colorImageMap)
  const availableGeneralColors = colorOptions.filter(c => !colorImageMap[c])
  const availablePopularColors = popularColorOptions.filter(c => !colorImageMap[c])

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 max-w-lg mx-auto"
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
        Add New Product
      </motion.h1>

      {/* Manual Update Notice */}
      <motion.div
        className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800"
        variants={inputVariants}
      >
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>💡</span>
          Manual Update System Active
        </h4>
        <ul className="space-y-1 text-xs">
          <li>• Product will be saved to database</li>
          <li>• <strong>NOT visible to customers yet</strong></li>
          <li>• Click "Update Website" in Dashboard to publish</li>
          <li>• You have full control over when changes go live</li>
        </ul>
      </motion.div>

      {/* Product Name */}
      <motion.input
        type="text"
        placeholder="Product Name *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        required
        variants={inputVariants}
      />

      {/* Price */}
      <motion.input
        type="number"
        placeholder="Price *"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        required
        variants={inputVariants}
      />

      {/* New Price */}
      <motion.input
        type="number"
        placeholder="Sale Price (optional)"
        value={newprice}
        onChange={(e) => setNewprice(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        variants={inputVariants}
      />

      {/* Description */}
      <motion.textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-vertical"
        variants={inputVariants}
      />

      {/* Type */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold text-gray-700">Type (required) *:</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <motion.button
              key={t}
              type="button"
              onClick={() => handleTypeChange(t)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                type === t
                  ? "bg-purple-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Sizes */}
      <AnimatePresence>
        {!isBag && (
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
          >
            <p className="mb-2 font-semibold text-gray-700">Sizes (required) *:</p>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((size) => (
                <motion.button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                    sizes.includes(size)
                      ? "bg-purple-600 text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {size}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Color & Images Section */}
      <motion.div variants={inputVariants}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-700">Colors & Images *:</p>
          <motion.button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-4 py-2 bg-purple-600 text-white rounded-full text-sm font-medium hover:bg-purple-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            + Add Color
          </motion.button>
        </div>

        {/* Color Picker Dropdown */}
        <AnimatePresence>
          {showColorPicker && (
            <motion.div
              className="mb-4 border-2 border-purple-200 rounded-lg p-3 bg-white shadow-lg max-h-60 overflow-y-auto"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {availableGeneralColors.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">General Colors</p>
                  <div className="grid grid-cols-4 gap-1.5 mb-3">
                    {availableGeneralColors.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        onClick={() => addColor(color)}
                        className="flex items-center gap-1.5 p-1.5 rounded hover:bg-gray-100 transition-colors text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: color }}></span>
                        <span className="capitalize text-xs truncate">{color}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
              {availablePopularColors.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Popular Colors</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {availablePopularColors.map((color) => (
                      <motion.button
                        key={color}
                        type="button"
                        onClick={() => addColor(color)}
                        className="flex items-center gap-1.5 p-1.5 rounded hover:bg-gray-100 transition-colors text-left"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: getColorValue(color) }}></span>
                        <span className="capitalize text-xs truncate">{color}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Color Cards */}
        {selectedColors.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
            No colors added yet. Click "Add Color" to start.
          </p>
        )}

        <div className="space-y-4">
          {selectedColors.map((color) => {
            const entry = colorImageMap[color]
            const inputId = `color-upload-${color.replace(/\s+/g, '-')}`
            return (
              <motion.div
                key={color}
                className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Color Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: getColorValue(color) }}
                    ></span>
                    <span className="font-semibold capitalize text-gray-800">{color}</span>
                    <span className="text-xs text-gray-500">({entry.files.length} image{entry.files.length !== 1 ? 's' : ''})</span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => removeColor(color)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Remove
                  </motion.button>
                </div>

                {/* Image Previews */}
                {entry.previews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {entry.previews.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`${color} ${i + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                        />
                        <motion.button
                          type="button"
                          onClick={() => removeImageFromColor(color, i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ×
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <div className="border border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleColorFileChange(color, e)}
                    className="hidden"
                    id={inputId}
                    disabled={uploadingImages}
                  />
                  <label
                    htmlFor={inputId}
                    className={`cursor-pointer text-purple-600 hover:text-purple-700 font-medium text-sm ${
                      uploadingImages ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {uploadingImages ? 'Processing...' : `📷 Add images for ${color}`}
                  </label>
                  <p className="text-xs text-gray-400 mt-1">Max 5MB each, auto-resized to 768x950px</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            className={`p-4 rounded-lg text-center font-medium whitespace-pre-line ${
              message.includes("successfully") || message.includes("✅")
                ? "text-green-700 bg-green-50 border border-green-200"
                : message.includes("Processing") || message.includes("Uploading") || message.includes("Creating")
                ? "text-blue-700 bg-blue-50 border border-blue-200"
                : "text-red-700 bg-red-50 border border-red-200"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={loading || uploadingImages}
        className={`mt-4 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
          loading || uploadingImages
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl"
        }`}
        variants={inputVariants}
        whileHover={!loading && !uploadingImages ? { scale: 1.02, y: -2 } : {}}
        whileTap={!loading && !uploadingImages ? { scale: 0.98 } : {}}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={loading ? "loading" : "idle"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                Adding Product...
              </>
            ) : uploadingImages ? (
              "Processing Images..."
            ) : (
              "💾 Save Product to Database"
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      {/* Bottom Warning */}
      <motion.div
        className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"
        variants={inputVariants}
      >
        <div className="flex items-start gap-2">
          <span className="text-lg">⚠️</span>
          <div>
            <div className="font-medium mb-1">Remember:</div>
            <div>Product will be saved to database but <strong>NOT visible to customers</strong> until you click "Update Website" in the Dashboard.</div>
          </div>
        </div>
      </motion.div>
    </motion.form>
  )
}
