"use client";

import { Facebook, Instagram, Mail } from "lucide-react"; 
import { motion } from "framer-motion";

const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: 10,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: {
    scale: 0.9
  }
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export default function Footer() {
  return (
    <div>
    <motion.footer 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="text-white p-6 w-full bg"
      style={{

        minHeight: "80px"
      }}
    >
      <div className="container mx-auto flex flex-col bg  w-full md:flex-row items-center justify-between">
        
        <motion.div 
          variants={itemVariants}
          className="text-lg font-semibold mb-4 md:mb-0 text-white"
        >
          © {new Date().getFullYear()} Dawer Sah
        </motion.div>

        <motion.div 
          variants={itemVariants}
          className="flex space-x-6"
        >
          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="https://facebook.com/dawersah"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-blue-300 transition-colors duration-200"
            aria-label="Visit our Facebook page"
          >
            <Facebook size={22} />
          </motion.a>

          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="https://www.instagram.com/dawersah/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-pink-300 transition-colors duration-200"
            aria-label="Visit our Instagram page"
          >
            <Instagram size={22} />
          </motion.a>

          <motion.a
            variants={iconVariants}
            whileHover="hover"
            whileTap="tap"
            href="mailto:your@email.com"
            className="text-white hover:text-green-300 transition-colors duration-200"
            aria-label="Send us an email"
          >
            <Mail size={22} />
          </motion.a>
        </motion.div>
      </div >
            <p className="text-center bg w-full mt-3 text-white/60 text-sm">
        Powered by Dawer Sah
      </p>
    </motion.footer>
    </div>
  );
}