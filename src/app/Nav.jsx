"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-500
        ${scrolled ? "bg-white/90 text-white shadow-lg" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center text-black">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.2 }}>
            <Link href="/" className={`text-2xl font-bold tracking-tight ${scrolled ? "text-[#1B2A4A]" : "text-white"}`}>
              Dawer <span className="text-blue-400">Sah</span>
            </Link>
          </motion.div>

          {/* Links */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 lg:gap-4 lg:mr-9">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="tel:+20XXXXXXXXXX" className="m-2" aria-label="Call us">
                  <FontAwesomeIcon
                    className={`text-2xl w-8 ${
                      scrolled ? "bgg" : "text-white"
                    } shadow-2xl shadow-black`}
                    icon={faPhone}
                  />
                </Link>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="https://wa.me/+20XXXXXXXXXX" aria-label="Contact us on WhatsApp" className="m-2">
                  <FontAwesomeIcon
                    className={`text-3xl w-9 ${
                      scrolled ? "bgg" : "text-white"
                    } shadow-2xl shadow-black`}
                    icon={faWhatsapp}
                  />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{ backgroundImage: "url('/bg.png')" }}
        className="w-full bg-cover bg-center bg-no-repeat flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-full min-h-screen bg-black/60 flex flex-col items-center justify-center text-center p-4"
        >
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="font-bold text-5xl md:text-7xl text-white mb-4"
          >
            Dawer <span className="text-blue-400">Sah</span>
          </motion.h1>
          <motion.h2
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="font-bold text-3xl md:text-5xl text-white"
          >
            Find Your Perfect <span className="text-blue-400">Used Car</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="text-lg md:text-xl text-gray-200 mt-4"
          >
            Quality Pre-Owned Vehicles at the Best Prices
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-8 flex gap-4"
          >
            {/* <Link
              href="https://wa.me/+20XXXXXXXXXX"
              className="border-2 border-white text-white hover:bg-white hover:text-[#1B2A4A] font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              Contact Us
            </Link> */}
          </motion.div>
        </motion.div>
      </motion.section>
    </>
  );
}
