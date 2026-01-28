"use client";
import { useMyContext } from "../../context/CartContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
};

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const totalVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

const buttonVariants = {
  hidden: { 
    opacity: 0, 
    y: 30 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: {
    scale: 0.98
  }
};

const emptyCartVariants = {
  hidden: {
    opacity: 0,
    y: 30
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

export default function Cart() {
  const { cart, removeFromCart, cartTotal } = useMyContext();
  const router = useRouter();

  // ✅ FIXED: حساب المجموع باستخدام السعر الصحيح
  const total = cart.reduce((acc, item) => {
    // استخدم effectivePrice إذا متاح، وإلا newprice، وإلا price
    const itemPrice = item.effectivePrice || item.newprice || item.price;
    return acc + (itemPrice * item.quantity);
  }, 0);

  const goToCheckout = () => {
    router.push("/checkout");
  };

  return (
    <motion.div 
      className="max-w-2xl mx-auto p-6 mt-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-4"
        variants={itemVariants}
      >
        Your Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
      </motion.h1>

      {cart.length === 0 ? (
        <motion.div
          variants={emptyCartVariants}
          initial="hidden"
          animate="visible"
          className="text-center py-12"
        >
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to get started!</p>
          <motion.button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Continue Shopping
          </motion.button>
        </motion.div>
      ) : (
        <>
          <motion.ul 
            className="space-y-4"
            variants={containerVariants}
          >
            {cart.map((item, index) => {
              const colorIndex = item.colors?.indexOf(item.selectedColor) ?? 0;
              const imgSrc = item.pictures?.[colorIndex] || item.pictures?.[0] || "/fallback.png";
              
              // ✅ FIXED: حساب السعر الصحيح للعنصر
              const itemPrice = item.effectivePrice || item.newprice || item.price;
              const originalPrice = item.price;
              const hasDiscount = item.newprice && item.newprice < originalPrice;

              return (
                <motion.li
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="bg-white rounded-lg shadow-sm border p-4 flex gap-4"
                  variants={itemVariants}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                  layout
                >
                  {/* Product Image */}
                  <motion.div
                    className="flex-shrink-0"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <div className="w-24 h-32 relative rounded-lg overflow-hidden bg-white">
                      <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                        onError={(e) => {
                          e.target.src = 'https://dfurfmrwpyotjfrryatn.supabase.co/storage/v1/object/public/product-images/casual.png'
                        }}
                      />
                    </div>
                  </motion.div>

                  {/* Product Details */}
                  <motion.div 
                    className="flex-grow"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: index * 0.1 + 0.1,
                      ease: "easeOut"
                    }}
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{item.name}</h3>
                    
                    {/* Price Display */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-gray-900">
                        {itemPrice} LE
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-gray-500 line-through">
                          {originalPrice} LE
                        </span>
                      )}
                      {hasDiscount && (
                        <span className="bg text-white px-2 py-1 rounded text-xs font-medium">
                          {Math.round(((originalPrice - item.newprice) / originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Product Options */}
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Quantity: <span className="font-medium">{item.quantity}</span></p>
                      
                      {item.selectedColor && (
                        <p className="flex items-center gap-2">
                          Color: 
                          <span
                            style={{ backgroundColor: item.selectedColor }}
                            className="inline-block w-4 h-4 rounded-full border-2 border-gray-300"
                          ></span>
                          <span className="capitalize font-medium">{item.selectedColor}</span>
                        </p>
                      )}

                      {item.selectedSize && (
                        <p>Size: <span className="font-medium">{item.selectedSize}</span></p>
                      )}
                    </div>

                    {/* Subtotal */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-lg font-semibold text-gray-900">
                        Subtotal: {(itemPrice * item.quantity).toLocaleString()} LE
                      </p>
                    </div>

                    {/* Remove Button */}
                    <motion.button
                      className="mt-3 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                      onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                      whileHover={{ 
                        scale: 1.05,
                        transition: { duration: 0.2 }
                      }}
                      whileTap={{ scale: 0.9 }}
                    >
                      🗑️ Remove from cart
                    </motion.button>
                  </motion.div>
                </motion.li>
              );
            })}
          </motion.ul>

          {/* Cart Summary */}
          <motion.div 
            className="mt-8 bg-white rounded-lg p-6"
            variants={totalVariants}
          >
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 mb-4">
              <span>Total:</span>
              <span>{total.toLocaleString()} LE</span>
            </div>
            
            {/* Savings Display */}
            {cart.some(item => item.newprice) && (
              <motion.div 
                className="text-sm text-green-600 mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🎉 You're saving {cart.reduce((savings, item) => {
                  if (item.newprice && item.price > item.newprice) {
                    return savings + ((item.price - item.newprice) * item.quantity);
                  }
                  return savings;
                }, 0).toLocaleString()} LE!
              </motion.div>
            )}

            <motion.button
              className="w-full bg text-white font-bold py-4 px-6 rounded-lg hover:bg-opacity-90 transition-all"
              onClick={goToCheckout}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Proceed to Checkout
            </motion.button>
            
            <motion.p
              className="text-sm text-gray-600 mt-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Your order details will be sent to WhatsApp for quick confirmation.
            </motion.p>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}