"use client";
import { useState } from "react";
import { useMyContext } from "../../context/CartContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 1 }, // ✅ FIXED: إزالة الإخفاء الأولي
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const formVariants = {
  hidden: { 
    opacity: 1, // ✅ FIXED: إزالة الإخفاء الأولي
    y: 0 // ✅ FIXED: إزالة الحركة الأولية
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const inputVariants = {
  hidden: { 
    opacity: 1, // ✅ FIXED: إزالة الإخفاء الأولي
    x: 0 // ✅ FIXED: إزالة الحركة الأولية
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

const errorVariants = {
  hidden: { 
    opacity: 0, 
    y: -10,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants = {
  hidden: { 
    opacity: 1, // ✅ FIXED: إزالة الإخفاء الأولي
    y: 0 // ✅ FIXED: إزالة الحركة الأولية
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

export default function CheckoutPage() {
  const { cart, clearCart } = useMyContext();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleSendWhatsApp = () => {
    setErrorMessage("");

    if (cart.length === 0) {
      setErrorMessage("Your cart is empty. Please add at least one product.");
      return;
    }

    if (!name || !address || !phone) {
      setErrorMessage("Please fill in all fields.");
      return;
    }

    if (!phone.startsWith("01")) {
      setErrorMessage("Phone number must start with 01.");
      return;
    }
    if (phone.length < 11) {
      setErrorMessage("Phone number must be at least 11 digits.");
      return;
    }

    let cartDetails = "";
    let totalAmount = 0;
    let totalSavings = 0;

    cart.forEach((item) => {
      // ✅ FIXED: استخدام السعر الصحيح
      const itemPrice = item.effectivePrice || item.newprice || item.price;
      const originalPrice = item.price;
      const itemTotal = itemPrice * item.quantity;
      const itemSavings = item.newprice ? (originalPrice - item.newprice) * item.quantity : 0;

      cartDetails += `${item.name}\n`;
      cartDetails += `Quantity: ${item.quantity}\n`;

      if (item.selectedColor && item.selectedColor.trim() !== "") {
        cartDetails += `Color: ${item.selectedColor}\n`;
      }

      if (item.selectedSize && item.selectedSize.trim() !== "") {
        cartDetails += `Size: ${item.selectedSize}\n`;
      }

      // عرض السعر مع الخصم إذا موجود
      if (item.newprice && item.newprice < originalPrice) {
        cartDetails += `Price: ${itemPrice} LE (was ${originalPrice} LE) 🔥\n`;
        cartDetails += `You saved: ${(originalPrice - item.newprice)} LE per item!\n`;
      } else {
        cartDetails += `Price: ${itemPrice} LE\n`;
      }
      
      cartDetails += `Subtotal: ${itemTotal.toLocaleString()} LE\n`;
      cartDetails += "-------------------------\n";

      totalAmount += itemTotal;
      totalSavings += itemSavings;
    });

    // إنشاء رسالة WhatsApp
    let message = `🛍️ *WN Store Order*\n\n`;
    message += `👤 *Customer Details:*\n`;
    message += `Name: ${name}\n`;
    message += `Address: ${address}\n`;
    message += `Phone: ${phone}\n\n`;
    message += `🛒 *Order Items:*\n${cartDetails}`;
    message += `💰 *Order Summary:*\n`;
    message += `Total Amount: ${totalAmount.toLocaleString()} EGP\n`;
    
    if (totalSavings > 0) {
      message += `🎉 Total Savings: ${totalSavings.toLocaleString()} EGP\n`;
      message += `💫 Original Total: ${(totalAmount + totalSavings).toLocaleString()} EGP\n`;
    }
    
    message += `\n✨ Thank you for choosing WN Store!`;

    const yourWhatsAppNumber = "201211661802";
    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/${yourWhatsAppNumber}?text=${encodedMessage}`, "_blank");

    clearCart();
    router.push("/succses");
  };

  // ✅ FIXED: حساب المجموع الصحيح
  const total = cart.reduce((acc, item) => {
    const itemPrice = item.effectivePrice || item.newprice || item.price;
    return acc + (itemPrice * item.quantity);
  }, 0);

  const totalSavings = cart.reduce((savings, item) => {
    if (item.newprice && item.price > item.newprice) {
      return savings + ((item.price - item.newprice) * item.quantity);
    }
    return savings;
  }, 0);

  return (
    <motion.div 
      className="max-w-lg min-h-screen mx-auto p-4 justify-center"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 
        className="text-2xl font-bold mb-6 text-center"
        variants={formVariants}
      >
        Checkout
      </motion.h1>

      {/* Order Summary */}
      {cart.length > 0 && (
        <motion.div
          className="bg-white rounded-lg p-4 mb-6"
          variants={formVariants}
        >
          <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {cart.map((item, index) => {
              const itemPrice = item.effectivePrice || item.newprice || item.price;
              return (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x{item.quantity}</span>
                  <span className="font-medium">{(itemPrice * item.quantity).toLocaleString()} LE</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-200 mt-3 pt-3">
            {totalSavings > 0 && (
              <div className="flex justify-between text-green-600 text-sm mb-1">
                <span>Total Savings:</span>
                <span>-{totalSavings.toLocaleString()} LE</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>{total.toLocaleString()} LE</span>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm"
            variants={errorVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            ⚠️ {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={(e) => { e.preventDefault(); handleSendWhatsApp(); }} variants={formVariants}>
        <motion.input
          type="text"
          placeholder="Full Name *"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={name}
          onChange={(e) => setName(e.target.value)}
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
          required
        />
        
        <motion.input
          type="tel"
          placeholder="Phone Number (01xxxxxxxxx) *"
          className="border border-gray-300 p-3 w-full mb-4 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
          required
        />
        
        <motion.textarea
          placeholder="Delivery Address *"
          className="border border-gray-300 p-3 w-full h-24 mb-6 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          variants={inputVariants}
          whileFocus={{
            scale: 1.01,
            borderColor: "#8b5cf6",
            transition: { duration: 0.2 }
          }}
          required
        />

        <motion.button
          type="submit"
          className="w-full bg text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all"
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          🚀 Confirm Order via WhatsApp
        </motion.button>

        <motion.p
          className="text-sm text-gray-600 mt-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          💬 Your order will be sent to WhatsApp for quick confirmation and delivery arrangement.
        </motion.p>
      </motion.form>
    </motion.div>
  );
}