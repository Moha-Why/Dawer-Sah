"use client"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      staggerChildren: 0.08
    }
  }
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// Hex mapping for car color names
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
  "pearl white": "#F0EAD6",
  "metallic gray": "#A8A9AD",
  "champagne gold": "#F7E7CE",
  "navy": "#000080",
  "maroon": "#800000",
}
const getColorValue = (color) => colorHexMap[color] || color

export default function RelatedProducts({ currentProduct, initialRelated = [] }) {
  const [hoveredId, setHoveredId] = useState(null);

  // Use initialRelated passed from server component (ProductDetailClient passes it)
  // If not available, we don't fetch - the server already provided related products
  const related = initialRelated.length > 0 ? initialRelated : []

  if (related.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-12 mx-auto"
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-8"
      >
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          Similar Vehicles
        </h3>
        <p className="text-gray-600 text-sm">
          Similar vehicles based on your current selection
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {related.map((product) => (
          <motion.div
            key={product.id}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            onMouseEnter={() => setHoveredId(product.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <div className="relative overflow-hidden bg-white">
              <Image
                src={
                  hoveredId === product.id
                    ? product.pictures?.[1] || product.pictures?.[0]
                    : product.pictures?.[0] || "/placeholder.png"
                }
                alt={product.name}
                className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                width={300}
                height={400}
              />

              {product.newprice && (
                <motion.div
                  initial={{ scale: 0, rotate: -12 }}
                  animate={{ scale: 1, rotate: -12 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute top-3 left-3 bg text-white px-2 py-1 rounded-full text-xs font-medium"
                >
                  Sale
                </motion.div>
              )}

              {product.colors?.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="absolute bottom-3 right-3 flex gap-1"
                >
                  {product.colors.slice(0, 3).map((color, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: 0.2,
                        delay: 0.3 + (idx * 0.1),
                        ease: "easeOut"
                      }}
                      whileHover={{ scale: 1.3 }}
                      className="w-3 h-3 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: getColorValue(color) }}
                    />
                  ))}
                  {product.colors.length > 3 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2, delay: 0.6 }}
                      className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white shadow-sm flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">+</span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="p-5">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {product.name.length > 40
                  ? product.name.slice(0, 40) + "..."
                  : product.name}
              </h3>

              {/* Car Specs */}
              {product.year && (
                <div className="text-xs text-gray-500 mb-2">
                  {product.year} | {product.mileage?.toLocaleString()} km | {product.transmission}
                </div>
              )}

              <div className="flex flex-col mb-4">
                {product.newprice ? (
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-gray-900">
                      {product.newprice} EGP
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.price} EGP
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-gray-900">
                    {product.price} EGP
                  </span>
                )}
              </div>

              <Link href={`/product/${product.id}`}>
                <motion.button
                  className="w-full bg-[#1B2A4A] text-white py-2.5 rounded-lg transition-colors text-sm font-medium hover:bg-[#2C3E6B]"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Details
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {related.length >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-8"
        >
          <Link href="/">
            <motion.button
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-[#1B2A4A] hover:text-[#1B2A4A] transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse More Vehicles
            </motion.button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}
