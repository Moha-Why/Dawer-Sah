"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { supabase } from '@/lib/supabaseClient'
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

export default function RelatedProducts({ currentProduct }) {
  const [related, setRelated] = useState([])
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    if (!currentProduct) return
    const fetchRelated = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("type", currentProduct.type)
        .neq("id", currentProduct.id)

      if (error) return console.error(error)

      const sorted = data
        .map((p) => ({ ...p, priceDiff: Math.abs(p.price - currentProduct.price) }))
        .sort((a, b) => a.priceDiff - b.priceDiff)
        .slice(0, 8) // نقلل العدد للتصميم الأفضل

      setRelated(sorted)
    }

    fetchRelated()
  }, [currentProduct])

  if (related.length === 0) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-12 mx-auto"
    >
      {/* Header بنفس ستايل StorePage */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white rounded-xl shadow-sm p-6 mb-8"
      >
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">
          You Might Also Like
        </h3>
        <p className="text-gray-600 text-sm">
          Similar products based on your current selection
        </p>
      </motion.div>
      
      {/* Grid بنفس تصميم StorePage */}
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
            {/* صورة المنتج */}
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

              {/* Badge للمنتجات المخفضة */}
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

              {/* نقاط الألوان */}
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
                      style={{ backgroundColor: color }}
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

            {/* معلومات المنتج */}
            <div className="p-5">
              <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                {product.name.length > 40
                  ? product.name.slice(0, 40) + "..."
                  : product.name}
              </h3>
              
              {/* السعر */}
              <div className="flex items-center justify-between mb-4">
                {product.newprice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {product.newprice} LE
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {product.price} LE
                    </span>
                  </div>
                ) : (
                  <span className="text-lg font-semibold text-gray-900">
                    {product.price} LE
                  </span>
                )}
              </div>

              {/* المقاسات المتاحة */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="flex gap-1 mb-4">
                  {product.sizes.slice(0, 4).map((size, idx) => (
                    <motion.span
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="text-xs bg-white text-gray-600 px-2 py-1 rounded"
                    >
                      {size}
                    </motion.span>
                  ))}
                </div>
              )}

              {/* زرار المشاهدة */}
              <Link href={`/product/${product.id}`}>
                <motion.button 
                  className="w-full bg text-black py-2.5 rounded-lg  transition-colors text-sm font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Shop now
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* زرار عرض المزيد */}
      {related.length >= 8 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center mt-8"
        >
          <Link href="/store">
            <motion.button
              className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-black hover:text-black transition-colors font-medium"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              View More Products
            </motion.button>
          </Link>
        </motion.div>
      )}
    </motion.div>
  )
}