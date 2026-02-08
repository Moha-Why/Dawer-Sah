"use client";
import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from 'next/link';

export default function NavT() {
  return (
    <>
      <div className="sticky top-0 bg border-2 z-50 border-[#1B2A4A]">
        <div className="h-16 flex items-center justify-between text-2xl font-bold text-gray-800">
          <Link href="/" className="ml-8 text-white tracking-tight">
            Dawer <span className="text-blue-400">Sah</span>
          </Link>

          <div className="flex items-center gap-2 lg:gap-4 mr-4 lg:mr-9">
            <div>
              <Link href="tel:+20XXXXXXXXXX" className="m-2" aria-label="Call us">
                <FontAwesomeIcon className="text-white w-7 text-2xl" icon={faPhone} />
              </Link>

              <Link href="https://wa.me/+20XXXXXXXXXX" className='m-2' aria-label="Contact us on WhatsApp">
                <FontAwesomeIcon className="text-white text-3xl" icon={faWhatsapp} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
