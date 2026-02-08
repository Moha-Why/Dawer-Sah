"use client"

import { useState } from "react"
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

export default function AddVehicle() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [newprice, setNewprice] = useState("")

  // Car-specific fields
  const [brand, setBrand] = useState("")
  const [year, setYear] = useState("")
  const [mileage, setMileage] = useState("")
  const [transmission, setTransmission] = useState("")
  const [fuelType, setFuelType] = useState("")
  const [engineSize, setEngineSize] = useState("")
  const [features, setFeatures] = useState("")

  // Color-image mapping: { "black": { urls: ["https://..."] }, ... }
  const [colorImageMap, setColorImageMap] = useState({})
  const [showColorPicker, setShowColorPicker] = useState(false)

  const colorOptions = [
    "black", "white", "silver", "gray", "red", "blue",
    "green", "brown", "beige", "navy", "maroon"
  ]
  const popularColorOptions = [
    "pearl white", "metallic gray", "champagne gold", "midnight blue",
    "racing red", "charcoal", "bronze", "deep black"
  ]
  const colorHexMap = {
    "black": "#000000",
    "white": "#FFFFFF",
    "silver": "#C0C0C0",
    "gray": "#808080",
    "red": "#FF0000",
    "blue": "#0000FF",
    "green": "#006400",
    "brown": "#8B4513",
    "beige": "#F5F5DC",
    "navy": "#000080",
    "maroon": "#800000",
    "pearl white": "#F0EAD6",
    "metallic gray": "#A8A9AD",
    "champagne gold": "#F7E7CE",
    "midnight blue": "#191970",
    "racing red": "#D40000",
    "charcoal": "#36454F",
    "bronze": "#CD7F32",
    "deep black": "#0A0A0A",
  }
  const getColorValue = (color) => colorHexMap[color] || color

  const typeOptions = ["sedan", "suv", "hatchback", "truck", "coupe", "van"]
  const brandOptions = [
    "Toyota", "BMW", "Mercedes-Benz", "Honda", "Hyundai",
    "Kia", "Nissan", "Chevrolet", "Ford", "Volkswagen"
  ]
  const transmissionOptions = ["Automatic", "Manual"]
  const fuelTypeOptions = ["Gasoline", "Diesel", "Hybrid", "Electric"]

  // Color-image helpers
  const addColor = (color) => {
    if (!colorImageMap[color]) {
      setColorImageMap(prev => ({ ...prev, [color]: { urls: [] } }))
    }
    setShowColorPicker(false)
  }

  const removeColor = (color) => {
    setColorImageMap(prev => {
      const newMap = { ...prev }
      delete newMap[color]
      return newMap
    })
  }

  const handleColorUrlChange = (color, text) => {
    const urls = text
      .split("\n")
      .map(u => u.trim())
      .filter(u => u.length > 0)
    setColorImageMap(prev => ({
      ...prev,
      [color]: { urls }
    }))
  }

  const getColorUrlText = (color) => {
    return (colorImageMap[color]?.urls || []).join("\n")
  }

  const removeImageFromColor = (color, index) => {
    setColorImageMap(prev => {
      const entry = prev[color]
      return {
        ...prev,
        [color]: {
          urls: entry.urls.filter((_, i) => i !== index)
        }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    const colorNames = Object.keys(colorImageMap)
    const totalUrls = Object.values(colorImageMap).reduce((sum, entry) => sum + entry.urls.length, 0)

    if (!name || !price || !type || !brand || !year || !mileage || colorNames.length === 0 || totalUrls === 0) {
      setMessage("Please fill in all required fields (name, price, type, brand, year, mileage) and add at least one color with images.")
      setLoading(false)
      return
    }

    try {
      setMessage("Saving vehicle...")

      // Build color_images map from URLs
      const colorImagesResult = {}
      for (const [color, entry] of Object.entries(colorImageMap)) {
        if (entry.urls.length === 0) continue
        colorImagesResult[color] = entry.urls
      }

      if (Object.keys(colorImagesResult).length === 0) {
        setMessage("Each color must have at least one image URL. Please add image URLs.")
        setLoading(false)
        return
      }

      // Parse features from comma-separated string to array
      const featuresArray = features
        ? features.split(",").map(f => f.trim()).filter(f => f.length > 0)
        : []

      const vehicle = {
        name,
        price: Number(price),
        newprice: newprice ? Number(newprice) : null,
        description: description || "",
        color_images: colorImagesResult,
        colors: Object.keys(colorImagesResult),
        pictures: Object.values(colorImagesResult).flat(),
        type,
        brand,
        year: Number(year),
        mileage: Number(mileage),
        transmission,
        fuelType,
        engineSize,
        features: featuresArray,
        owner_id: "dev-user-123"
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicle),
      })

      const result = await res.json()

      if (res.ok) {
        // Reset form
        setName("")
        setPrice("")
        setNewprice("")
        setDescription("")
        setColorImageMap({})
        setType("")
        setBrand("")
        setYear("")
        setMileage("")
        setTransmission("")
        setFuelType("")
        setEngineSize("")
        setFeatures("")

        setMessage(`"${name}" saved to database successfully!\n\nIMPORTANT: Go back to Dashboard tab and click "Update Website" button to make this vehicle visible to customers.\n\nThe vehicle is saved but NOT live yet - you control when it goes public.`)

        setTimeout(() => setMessage(""), 15000)
      } else {
        setMessage("Error: " + (result.error || "Error adding vehicle"))
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
        Add New Vehicle
      </motion.h1>

      {/* Manual Update Notice */}
      <motion.div
        className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800"
        variants={inputVariants}
      >
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          <span>Dawer Sah - Vehicle Inventory</span>
        </h4>
        <ul className="space-y-1 text-xs">
          <li>Vehicle will be saved to database</li>
          <li><strong>NOT visible to customers yet</strong></li>
          <li>Click &quot;Update Website&quot; in Dashboard to publish</li>
          <li>You have full control over when changes go live</li>
        </ul>
      </motion.div>

      {/* Vehicle Name */}
      <motion.input
        type="text"
        placeholder="Vehicle Name * (e.g. Toyota Camry 2020)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
        required
        variants={inputVariants}
      />

      {/* Brand */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold text-gray-700">Brand *:</p>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent bg-white"
          required
        >
          <option value="">Select Brand</option>
          {brandOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </motion.div>

      {/* Year & Mileage Row */}
      <motion.div className="grid grid-cols-2 gap-3" variants={inputVariants}>
        <div>
          <p className="mb-2 font-semibold text-gray-700 text-sm">Year *:</p>
          <input
            type="number"
            placeholder="e.g. 2020"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
            required
            min="1990"
            max="2030"
          />
        </div>
        <div>
          <p className="mb-2 font-semibold text-gray-700 text-sm">Mileage (km) *:</p>
          <input
            type="number"
            placeholder="e.g. 45000"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
            required
            min="0"
          />
        </div>
      </motion.div>

      {/* Transmission & Fuel Type Row */}
      <motion.div className="grid grid-cols-2 gap-3" variants={inputVariants}>
        <div>
          <p className="mb-2 font-semibold text-gray-700 text-sm">Transmission:</p>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
            className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent bg-white"
          >
            <option value="">Select</option>
            {transmissionOptions.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <p className="mb-2 font-semibold text-gray-700 text-sm">Fuel Type:</p>
          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent bg-white"
          >
            <option value="">Select</option>
            {fuelTypeOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Engine Size */}
      <motion.input
        type="text"
        placeholder="Engine Size (e.g. 2.5L)"
        value={engineSize}
        onChange={(e) => setEngineSize(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
        variants={inputVariants}
      />

      {/* Price */}
      <motion.input
        type="number"
        placeholder="Price *"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
        required
        variants={inputVariants}
      />

      {/* Sale Price */}
      <motion.input
        type="number"
        placeholder="Sale Price (optional)"
        value={newprice}
        onChange={(e) => setNewprice(e.target.value)}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
        variants={inputVariants}
      />

      {/* Description */}
      <motion.textarea
        placeholder="Vehicle Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent resize-vertical"
        variants={inputVariants}
      />

      {/* Features */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold text-gray-700">Features (comma-separated):</p>
        <input
          type="text"
          placeholder="e.g. Sunroof, Leather Seats, Bluetooth, Backup Camera"
          value={features}
          onChange={(e) => setFeatures(e.target.value)}
          className="p-3 border rounded-md w-full focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent"
        />
      </motion.div>

      {/* Type */}
      <motion.div variants={inputVariants}>
        <p className="mb-2 font-semibold text-gray-700">Vehicle Type (required) *:</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <motion.button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 ${
                type === t
                  ? "bg-[#1B2A4A] text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-[#1B2A4A]"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Color & Images Section */}
      <motion.div variants={inputVariants}>
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-gray-700">Colors & Images *:</p>
          <motion.button
            type="button"
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="px-4 py-2 bg-[#1B2A4A] text-white rounded-full text-sm font-medium hover:bg-[#2C3E6B] transition-colors"
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
              className="mb-4 border-2 border-[#1B2A4A]/20 rounded-lg p-3 bg-white shadow-lg max-h-60 overflow-y-auto"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {availableGeneralColors.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Standard Colors</p>
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
                        <span className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" style={{ backgroundColor: getColorValue(color) }}></span>
                        <span className="capitalize text-xs truncate">{color}</span>
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
              {availablePopularColors.length > 0 && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Popular Car Colors</p>
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
            No colors added yet. Click &quot;Add Color&quot; to start.
          </p>
        )}

        <div className="space-y-4">
          {selectedColors.map((color) => {
            const entry = colorImageMap[color]
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
                    <span className="text-xs text-gray-500">({entry.urls.length} image{entry.urls.length !== 1 ? "s" : ""})</span>
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

                {/* Image URL Previews */}
                {entry.urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {entry.urls.map((url, i) => (
                      <div key={i} className="relative group">
                        <img
                          src={url}
                          alt={`${color} ${i + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => { e.target.src = ""; e.target.alt = "Invalid URL" }}
                        />
                        <motion.button
                          type="button"
                          onClick={() => removeImageFromColor(color, i)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          x
                        </motion.button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL Input */}
                <div className="border border-dashed border-gray-300 rounded-lg p-3 hover:border-[#1B2A4A] transition-colors">
                  <p className="text-xs font-medium text-[#1B2A4A] mb-1">Paste image URLs (one per line):</p>
                  <textarea
                    rows={3}
                    value={getColorUrlText(color)}
                    onChange={(e) => handleColorUrlChange(color, e.target.value)}
                    placeholder={"https://example.com/car-front.jpg\nhttps://example.com/car-side.jpg"}
                    className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-[#1B2A4A] focus:border-transparent resize-vertical"
                  />
                  <p className="text-xs text-gray-400 mt-1">Enter one image URL per line</p>
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
              message.includes("successfully")
                ? "text-green-700 bg-green-50 border border-green-200"
                : message.includes("Saving")
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
        disabled={loading}
        className={`mt-4 py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
          loading
            ? "bg-gray-400 text-gray-200 cursor-not-allowed"
            : "bg-[#1B2A4A] hover:bg-[#2C3E6B] text-white shadow-lg hover:shadow-xl"
        }`}
        variants={inputVariants}
        whileHover={!loading ? { scale: 1.02, y: -2 } : {}}
        whileTap={!loading ? { scale: 0.98 } : {}}
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
                Adding Vehicle...
              </>
            ) : (
              "Save Vehicle"
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
          <div>
            <div className="font-medium mb-1">Remember:</div>
            <div>Vehicle will be saved to database but <strong>NOT visible to customers</strong> until you click &quot;Update Website&quot; in the Dashboard.</div>
          </div>
        </div>
      </motion.div>
    </motion.form>
  )
}
