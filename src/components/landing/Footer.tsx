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
    <footer className="bg-gray-50 text-gray-500 py-8 text-center border-t flex gap-10 justify-center">
      <span>
        &copy; {new Date().getFullYear()} YAPONARBIRAK. Tüm hakları saklıdır.
      </span>
      <Link
        href="/gizlilik-ve-guvenlik"
        target="_blank"
        className="text-gray-400 hover:text-gray-700 hover:underline"
      >
        Gizlilik ve Güvenlik Politikası
      </Link>
    </footer>
  );
}
