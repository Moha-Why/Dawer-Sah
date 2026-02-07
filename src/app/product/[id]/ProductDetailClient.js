"use client"

import { useState, useEffect } from "react"
import { useMyContext } from "../../../context/CartContext"
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

// Hex mapping for non-standard CSS color names
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

export default function ProductDetailClient({
  productId,
  initialProduct,
  initialRelatedProducts = []
}) {
  const { addToCart } = useMyContext()
  const [product, setProduct] = useState(initialProduct)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [loading, setLoading] = useState(false)

  // Initialize selected color and size
  useEffect(() => {
    if (product) {
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        setSelectedColor(product.colors[0])
      }
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        setSelectedSize(product.sizes[0])
      }
    }
  }, [product, selectedColor, selectedSize])

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return

    // Validation
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      toast.error("Please select a color")
      return
    }

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size")
      return
    }

    setLoading(true)

    try {
      const productToAdd = {
        ...product,
        selectedColor,
        selectedSize,
        quantity
      }

      await addToCart(productToAdd)
      toast.success(`Added ${quantity}x ${product.name} to cart!`)

      // Reset quantity
      setQuantity(1)
      
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <p className="text-gray-600">The product you're looking for doesn't exist.</p>
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
        <span>Home</span> / <span>Products</span> / <span className="text-gray-900">{product.name}</span>
      </motion.nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Product Images - Fixed without Swiper for SSR compatibility */}
        <motion.div variants={itemVariants} className="space-y-4">
          {/* Main Image Display */}
          <div className="relative rounded-2xl overflow-hidden bg-white aspect-[4/5] w-full">
            <Image
              src={product.pictures?.[activeImageIndex] || product.pictures?.[0] || 'https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png'}
              alt={`${product.name} - Image ${activeImageIndex + 1}`}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                e.target.src = 'https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png'
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
            {product.pictures && product.pictures.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex(prev => 
                    prev === 0 ? product.pictures.length - 1 : prev - 1
                  )}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                >
                  ←
                </button>
                <button
                  onClick={() => setActiveImageIndex(prev => 
                    prev === product.pictures.length - 1 ? 0 : prev + 1
                  )}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                >
                  →
                </button>

                {/* Image Indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {product.pictures.map((_, index) => (
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
          {product.pictures && product.pictures.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.pictures.map((image, index) => (
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
                      e.target.src = 'https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png'
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
              {currentPrice} LE
            </span>
            {hasDiscount && (
              <>
                <span className="text-xl text-gray-500 line-through">
                  {originalPrice} LE
                </span>
                <span className="bg text-white px-2 py-1 rounded text-sm font-medium">
                  Save {originalPrice - product.newprice} LE
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
                    onClick={() => setSelectedColor(color)}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Size: <span className="font-normal">{selectedSize}</span>
              </h3>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 text-gray-700 hover:border-gray-400'
                    }`}
                    onClick={() => setSelectedSize(size)}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900">Quantity</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <motion.button
                  className="px-4 py-2 hover:bg-white transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  whileTap={{ scale: 0.95 }}
                >
                  -
                </motion.button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <motion.button
                  className="px-4 py-2 hover:bg-white transition-colors"
                  onClick={() => setQuantity(quantity + 1)}
                  whileTap={{ scale: 0.95 }}
                >
                  +
                </motion.button>
              </div>
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-4 pt-6">
            <motion.button
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              onClick={handleAddToCart}
              disabled={loading}
              variants={buttonVariants}
              initial="idle"
              whileHover={!loading ? "hover" : {}}
              whileTap={!loading ? "tap" : {}}
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
                      Adding to Cart...
                    </>
                  ) : (
                    `Add to Cart - ${(currentPrice * quantity).toLocaleString()} LE`
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            {/* Product Features */}
            <div className="grid grid-cols-2 gap-4 pt-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span>✨</span>
                <span>High Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🚚</span>
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💯</span>
                <span>Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <span>🔄</span>
                <span>Easy Returns</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Related Products */}
      <RelatedProducts currentProduct={product} />
    </motion.div>
  )
}