"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { FaFilter, FaFilterCircleXmark, FaFire } from "react-icons/fa6"

// Animation variants - مبسطة للأداء
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, staggerChildren: 0.02 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
}

/**
 * Store Component محسن للـ SSG بدون Hydration Issues
 */
export default function StoreSSG({ 
  initialProducts = [], 
  initialSaleProducts = [], 
  initialCategories = [] 
}) {
  // States للفلاتر
  const [typeFilter, setTypeFilter] = useState("")
  const [colorFilter, setColorFilter] = useState("")
  const [sizeFilter, setSizeFilter] = useState("")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [hoveredId, setHoveredId] = useState(null)

  // Hex mapping for non-standard CSS color names (laptop colors)
  const colorHexMap = {
    "space gray": "#717378",
    "midnight": "#1B1B3A",
    "starlight": "#F5E6D3",
    "rose gold": "#B76E79",
    "graphite": "#53565A",
    "sierra blue": "#69ABD8",
    "deep purple": "#56445D",
    "alpine green": "#505F4E",
    "platinum": "#E5E4E2",
    "matte black": "#28282B",
    "pearl white": "#F0EAD6",
  }
  const getColorValue = (color) => colorHexMap[color] || color

  // Extract unique colors from all products for dynamic filter
  const availableColors = useMemo(() => {
    const colorSet = new Set()
    initialProducts.forEach(product => {
      product.colors?.forEach(c => colorSet.add(c))
    })
    return Array.from(colorSet).sort()
  }, [initialProducts])

  console.log(`🏪 StoreSSG rendered with ${initialProducts.length} products`)

  // Product Image Component مع fallback محسن بدون hydration issues
  const ProductImage = ({ product, isHovered, className, priority = false }) => {
    const [imageSrc, setImageSrc] = useState(product.pictures?.[0] || "/placeholder.png")
    const [imageError, setImageError] = useState(false)

    useEffect(() => {
      if (isHovered && product.pictures?.[1]) {
        setImageSrc(product.pictures[1])
      } else if (product.pictures?.[0]) {
        setImageSrc(product.pictures[0])
      }
    }, [isHovered, product.pictures])

    const handleError = () => {
      if (!imageError) {
        setImageSrc('https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png')
        setImageError(true)
      }
    }

    return (
      <Image
        src={imageSrc}
        alt={product.name}
        fill
        className={className}
        onError={handleError}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={priority}
      />
    )
  }

  // Filtered products - محسوب في الclient
  const filteredProducts = useMemo(() => {
    let filtered = initialProducts.filter((product) => {
      return (
        (!typeFilter || product.type === typeFilter) &&
        (!colorFilter || product.colors?.includes(colorFilter)) &&
        (!sizeFilter || product.sizes?.includes(sizeFilter)) &&
        (!minPrice || (product.newprice || product.price) >= parseFloat(minPrice)) &&
        (!maxPrice || (product.newprice || product.price) <= parseFloat(maxPrice)) &&
        (!searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.colors?.some(c => c.toLowerCase().includes(searchTerm.toLowerCase())))
      )
    })

    // Sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (a.newprice || a.price) - (b.newprice || b.price)
        case "price-high":
          return (b.newprice || b.price) - (a.newprice || a.price)
        case "name":
          return a.name.localeCompare(b.name)
        default:
          return b.id - a.id // newest first
      }
    })
  }, [initialProducts, typeFilter, colorFilter, sizeFilter, minPrice, maxPrice, searchTerm, sortBy])

  const clearAllFilters = () => {
    setTypeFilter("")
    setColorFilter("")
    setSizeFilter("")
    setMinPrice("")
    setMaxPrice("")
    setSortBy("newest")
    setSearchTerm("")
  }

  const handleCategoryClick = (categoryKey) => {
    setTypeFilter(categoryKey)
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const getDiscountPercentage = (originalPrice, salePrice) => {
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100)
  }

  // ✅ إزالة الـ loading state المسبب للـ hydration mismatch
  // Show content directly بدلاً من الـ mounted check
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen"
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Our Collection</h1>
          <p className="text-xl text-gray-600 mb-8">Discover the latest trends and timeless classics</p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-center"
            />
          </div>
        </motion.div>

        {/* Sale Section */}
        {initialSaleProducts.length > 0 && (
          <motion.div variants={containerVariants} className="mb-16">
            <motion.div variants={itemVariants} className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg text-white px-6 py-3 rounded-full mb-4">
                <FaFire className="text-xl text-black" />
                <span className="text-lg font-bold  text-black">SALE UP TO 50% OFF</span>
                <FaFire className="text-xl text-black" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Hot Deals</h2>
              <p className="text-gray-600">Limited time offers on selected items</p>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {initialSaleProducts.map((product, index) => (
                <Link href={`/product/${product.id}`} key={`sale-${product.id}`}>
                  <motion.div
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="group rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 relative cursor-pointer"
                    onMouseEnter={() => setHoveredId(`sale-${product.id}`)}
                    onMouseLeave={() => setHoveredId(null)}
                  >
                    {/* Hot Deal Badge */}
                    <div className="absolute top-3 left-3 bg text-black px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
                      <FaFire className="text-xs" />
                      {getDiscountPercentage(product.price, product.newprice)}% OFF
                    </div>

                    {/* Image */}
                    <div className="relative overflow-hidden bg-white h-96">
                      <ProductImage
                        product={product}
                        isHovered={hoveredId === `sale-${product.id}`}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        priority={index < 2}
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg font-bold text">
                          {product.newprice} LE
                        </span>
                        <span className="text-sm text-gray-900 line-through">
                          {product.price} LE
                        </span>
                      </div>

                      <div className="w-full bg text-black py-2 rounded-lg text-center text-sm font-medium transition-all">
                        Shop Now
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {/* Categories Section */}
        <motion.div variants={containerVariants} className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Shop by Category</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {initialCategories.map((category) => (
              <motion.div
                key={category.key}
                variants={itemVariants}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-lg"
                onClick={() => handleCategoryClick(category.key)}
              >
                <div className="relative h-80 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  
                  <div className="absolute inset-0 bg-gray-900/30 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
                  
                  <div className="absolute inset-0 flex items-center justify-center text-center text-white z-10 p-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.count} items</p>
                    </div>
                  </div>
                  
                  {typeFilter === category.key && (
                    <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                      Active
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Products Section */}
        <div id="products-section">
          {/* Filters */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6 mb-8">
            {/* Active Category Display */}
            {typeFilter && (
              <div className="mb-4 p-4 bg-white rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Filtering by:</span>
                    <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-medium">
                      {initialCategories.find(c => c.key === typeFilter)?.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setTypeFilter("")}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                  >
                    Clear Category
                  </button>
                </div>
              </div>
            )}

            {/* Filter Controls */}
<div className="flex flex-wrap items-center gap-3 mb-4">
  {/* Accessible label for select */}
  <label htmlFor="sort" className="sr-only">
    Sort products
  </label>
  <select
    id="sort"
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black"
  >
    <option value="newest">Newest First</option>
    <option value="price-low">Price: Low to High</option>
    <option value="price-high">Price: High to Low</option>
    <option value="name">Name A-Z</option>
  </select>

  <div className="ml-auto flex gap-3">
    <button
      type="button"
      aria-label="Clear all filters"
      className="px-6 py-3 rounded-full text-sm font-medium bg-white text-gray-700 hover:bg-gray-200 transition-all"
      onClick={clearAllFilters}
    >
      Clear All
    </button>



                
                <button
                  className="p-3 rounded-full hover:bg-white transition-colors"
                  onClick={() => setShowFilters(!showFilters)}
                  aria-label="Open menu"
                >
                  {showFilters ? <FaFilterCircleXmark className="w-5 h-5" /> : <FaFilter className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                    <select
                      value={colorFilter}
                      onChange={(e) => setColorFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black capitalize"
                    >
                      <option value="">All Colors</option>
                      {availableColors.map((color) => (
                        <option key={color} value={color} className="capitalize">
                          {color}
                        </option>
                      ))}
                    </select>

                    <select
                      value={sizeFilter}
                      onChange={(e) => setSizeFilter(e.target.value)}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="">All Sizes</option>
                      <option value="S">Small</option>
                      <option value="M">Medium</option>
                      <option value="L">Large</option>
                      <option value="XL">Extra Large</option>
                    </select>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">Price:</span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-24 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <span className="text-gray-500">—</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-24 px-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Results Counter */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filteredProducts.length}</span> of <span className="font-semibold">{initialProducts.length}</span> products
              {typeFilter && (
                <span className="ml-2 text-sm">
                  in <span className="font-semibold">{initialCategories.find(c => c.key === typeFilter)?.name}</span>
                </span>
              )}
              {searchTerm && (
                <span className="ml-2 text-sm">
                  for "<span className="font-semibold">{searchTerm}</span>"
                </span>
              )}
            </p>
          </div>

          {/* Product Grid */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredProducts.map((product, index) => (
              <Link href={`/product/${product.id}`} key={product.id}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="group rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-white h-96">
                    <ProductImage
                      product={product}
                      isHovered={hoveredId === product.id}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      priority={index < 8}
                    />

                    {/* Sale Badge */}
                    {product.newprice && (
                      <div className="absolute top-3 left-3 bg text-black px-3 py-1 rounded-full text-xs font-bold">
                        SALE
                      </div>
                    )}

                    {/* Color Dots */}
                    {product.colors?.length > 1 && (
                      <div className="absolute bottom-3 right-3 flex gap-1">
                        {product.colors.slice(0, 4).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: getColorValue(color) }}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <div className="w-4 h-4 rounded-full bg-gray-600 border-2 border-white shadow-sm flex items-center justify-center">
                            <span className="text-white text-xs font-bold">+</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-5">
                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      {product.newprice ? (
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-semibold text-gray-900">
                            {product.newprice} LE
                          </span>
                          <span className="text-sm text-gray-900 line-through">
                            {product.price} LE
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-semibold text-gray-900">
                          {product.price} LE
                        </span>
                      )}
                    </div>

                    {/* Available Sizes - Hidden for bags */}
                    {product.sizes && product.sizes.length > 0 && product.type?.toLowerCase() !== "bag" && (
                      <div className="flex gap-1 mb-4">
                        <span className="text-xs text-gray-900 mr-2">Sizes:</span>
                        {product.sizes.slice(0, 4).map((size, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-white text-gray-600 px-2 py-1 rounded font-medium"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </motion.div>

          {/* No Results State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}