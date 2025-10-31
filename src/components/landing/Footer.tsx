"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  FaApple,
  FaAndroid,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-50 text-gray-500 py-8 text-center border-t">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 justify-center items-center">
        <span>
          &copy; {new Date().getFullYear()} YAPONARBIRAK. Tüm hakları saklıdır.
        </span>
        <div className="flex gap-6">
          <Link
            href="/gizlilik-ve-guvenlik"
            target="_blank"
            className="text-gray-400 hover:text-gray-700 hover:underline"
          >
            Gizlilik Politikası
          </Link>
          <Link
            href="/hesap-sil"
            className="text-gray-400 hover:text-red-600 hover:underline"
          >
            Hesabımı Sil
          </Link>
        </div>
      </div>
    </footer>
  );
}
