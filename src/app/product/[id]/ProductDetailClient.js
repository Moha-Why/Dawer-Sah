"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import Image from "next/image"
import RelatedProducts from "../../RelatedProducts"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  tap: { scale: 0.98 }
}

// Hex mapping for car color names
const colorHexMap = {
  "pearl white": "#F5F5F0",
  "metallic gray": "#8E8E8E",
  "champagne gold": "#F7E7CE",
  "midnight blue": "#191970",
  "racing red": "#FF0000",
  "forest green": "#228B22",
  "deep black": "#0A0A0A",
  "silver": "#C0C0C0",
  "charcoal": "#36454F",
  "bronze": "#CD7F32",
  "navy": "#000080",
  "maroon": "#800000",
}
const getColorValue = (color) => colorHexMap[color] || color

export default function ProductDetailClient({
  productId,
  initialProduct,
  initialRelatedProducts = []
}) {
  const [product, setProduct] = useState(initialProduct)
  const [selectedColor, setSelectedColor] = useState("")
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Compute images to display based on selected color
  const currentImages = useMemo(() => {
    if (product?.color_images && selectedColor && product.color_images[selectedColor]) {
      return product.color_images[selectedColor]
    }
    return product?.pictures || []
  }, [product, selectedColor])

  // Initialize selected color
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0])
      }
    }
  }, [product, selectedColor])

  const handleColorSelect = (color) => {
    setSelectedColor(color)
    setActiveImageIndex(0)
  }

  // Handle WhatsApp inquiry for this vehicle
  const handleWhatsAppInquiry = () => {
    if (!product) return

    const currentPrice = product.newprice || product.price
    const hasDiscount = product.newprice && product.newprice < product.price

    let message = `🚗 *Dawer Sah - Vehicle Inquiry*\n\n`
    message += `*Vehicle:* ${product.name}\n`
    if (product.brand) message += `*Brand:* ${product.brand}\n`
    if (product.year) message += `*Year:* ${product.year}\n`
    if (product.mileage) message += `*Mileage:* ${product.mileage.toLocaleString()} km\n`
    if (product.transmission) message += `*Transmission:* ${product.transmission}\n`
    if (product.fuelType) message += `*Fuel Type:* ${product.fuelType}\n`
    if (product.engineSize) message += `*Engine:* ${product.engineSize}\n`
    if (selectedColor) message += `*Color:* ${selectedColor}\n`
    if (hasDiscount) {
      message += `*Price:* ${currentPrice.toLocaleString()} EGP (was ${product.price.toLocaleString()} EGP)\n`
    } else {
      message += `*Price:* ${currentPrice.toLocaleString()} EGP\n`
    }
    message += `\nI'm interested in this vehicle. Please provide more details.`

    const whatsappNumber = "20XXXXXXXXXX"
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, "_blank")
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Not Found</h1>
          <p className="text-gray-600">The vehicle you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const currentPrice = product.newprice || product.price
  const originalPrice = product.price
  const hasDiscount = product.newprice && product.newprice < product.price
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - product.newprice) / originalPrice) * 100)
    : 0

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      suppressHydrationWarning
    >
      {/* Breadcrumb */}
      <motion.nav
        className="mb-8 text-sm text-gray-600"
        variants={itemVariants}
      >
        <span>Home</span> / <span>Vehicles</span> / <span className="text-gray-900">{product.name}</span>
      </motion.nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Main Image Display */}
          <div className="relative rounded-2xl overflow-hidden bg-white aspect-[4/5] w-full">
            <Image
              src={currentImages[activeImageIndex] || currentImages[0] || '/fallback.png'}
              alt={`${product.name} - Image ${activeImageIndex + 1}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                e.target.src = '/fallback.png'
              }}
            />

            {/* Discount Badge */}
            {hasDiscount && (
              <motion.div
                className="absolute top-4 left-4 bg z-10 text-white px-3 py-1 rounded-full text-sm font-bold"
                initial={{ scale: 0, rotate: -12 }}
                animate={{ scale: 1, rotate: -12 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {discountPercentage}% OFF
              </motion.div>
            )}

            {/* Navigation Arrows for Images */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev =>
                    prev === 0 ? currentImages.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                >
                  ←
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev =>
                    prev === currentImages.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                >
                  →
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {currentImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        activeImageIndex === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {currentImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentImages.map((image, index) => (
                <motion.button
                  key={index}
                  className={`flex-shrink-0 w-20 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImageIndex === index
                      ? 'border-black'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveImageIndex(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    width={80}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/fallback.png'
                    }}
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Product Name */}
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            <p className="text-gray-600 capitalize">{product.type}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {currentPrice?.toLocaleString()} EGP
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {originalPrice?.toLocaleString()} EGP
                </span>
                <span className="bg text-white px-2 py-1 rounded text-sm font-medium">
                  Save {(originalPrice - product.newprice)?.toLocaleString()} EGP
                </span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Vehicle Specs */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Vehicle Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {product.year && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Year</span>
                  <span className="block text-sm font-semibold text-gray-900">{product.year}</span>
                </div>
              )}
              {product.mileage != null && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Mileage</span>
                  <span className="block text-sm font-semibold text-gray-900">{product.mileage?.toLocaleString()} km</span>
                </div>
              )}
              {product.transmission && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Transmission</span>
                  <span className="block text-sm font-semibold text-gray-900">{product.transmission}</span>
                </div>
              )}
              {product.fuelType && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Fuel Type</span>
                  <span className="block text-sm font-semibold text-gray-900">{product.fuelType}</span>
                </div>
              )}
              {product.engineSize && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Engine</span>
                  <span className="block text-sm font-semibold text-gray-900">{product.engineSize}</span>
                </div>
              )}
              {product.brand && (
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Brand</span>
                  <span className="block text-sm font-semibold text-gray-900">{product.brand}</span>
                </div>
              )}
            </div>
          </div>

          {/* Features List */}
          {product.features && product.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Features</h3>
              <div className="flex flex-wrap gap-2">
                {product.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full border border-gray-200"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Color: <span className="font-normal capitalize">{selectedColor}</span>
              </h3>
              <div className="flex gap-3 flex-wrap">
                {product.colors.map((color) => (
                  <motion.button
                    key={color}
                    className={`w-12 h-12 rounded-full border-4 transition-all ${
                      selectedColor === color
                        ? 'border-black shadow-lg'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: getColorValue(color) }}
                    onClick={() => handleColorSelect(color)}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  />
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Inquiry Button */}
          <div className="space-y-4 pt-6">
            <motion.button
              className="w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all bg-green-600 text-white hover:bg-green-700"
              onClick={handleWhatsAppInquiry}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
            >
              <span className="flex items-center justify-center gap-2">
                Inquire via WhatsApp - {currentPrice?.toLocaleString()} EGP
              </span>
            </motion.button>

            <motion.button
              className="w-full py-3 px-6 rounded-lg font-semibold text-lg transition-all bg-[#1B2A4A] text-white hover:bg-[#2C3E6B]"
              onClick={() => window.open("tel:+20XXXXXXXXXX")}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
            >
              <span className="flex items-center justify-center gap-2">
                Call Us About This Vehicle
              </span>
            </motion.button>

            {/* Car Benefits */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>&#128736;</span>
                <span>Full Service History</span>
              </div>
              <div className="flex items-center gap-2">
                <span>&#128663;</span>
                <span>Test Drive Available</span>
              </div>
              <div className="flex items-center gap-2">
                <span>&#9989;</span>
                <span>Certified Pre-Owned</span>
              </div>
              <div className="flex items-center gap-2">
                <span>&#128260;</span>
                <span>Trade-In Welcome</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <RelatedProducts currentProduct={product} initialRelated={initialRelatedProducts} />
    </motion.div>
  )
}
