"use client";

import { motion } from "framer-motion";
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
    <>
      {/* CTA Section */}

      <footer className="bg-gray-50 text-gray-800 py-16 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                YAPONARBIRAK
              </h3>
              <p className="text-gray-600 mb-6">
                Online oto sanayi platformu. Aracın için en uygun ustayı kolayca
                bul.
              </p>
              <div className="flex gap-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--brand-primary)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "var(--brand-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <FaFacebook />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--brand-primary)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "var(--brand-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <FaTwitter />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--brand-primary)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "var(--brand-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <FaInstagram />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 bg-white rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-gray-700"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--brand-primary)";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.borderColor = "var(--brand-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.borderColor = "";
                  }}
                >
                  <FaLinkedin />
                </motion.a>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Hızlı Bağlantılar
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#home-section"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Ana Sayfa
                  </a>
                </li>
                <li>
                  <a
                    href="#feature-section"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Özellikler
                  </a>
                </li>
                <li>
                  <a
                    href="#works-section"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Nasıl Çalışır
                  </a>
                </li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Yasal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Kullanım Koşulları
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    KVKK
                  </a>
                </li>
              </ul>
            </div>{" "}
            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Yasal
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    Kullanım Koşulları
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-(--brand-primary) transition-colors"
                  >
                    KVKK
                  </a>
                </li>
              </ul>
            </div>
            {/* Download */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900">
                Uygulamayı İndir
              </h4>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg transition-all shadow-sm hover:shadow-md text-gray-700 w-full"
                >
                  <FaApple className="text-2xl" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">YAKINDA</div>
                    <div className="font-semibold">App Store</div>
                  </div>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg transition-all shadow-sm hover:shadow-md text-gray-700 w-full"
                >
                  <FaAndroid className="text-2xl" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">YAKINDA</div>
                    <div className="font-semibold">Google Play</div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-200 pt-8 text-center text-gray-600">
            <p>
              &copy; {new Date().getFullYear()} YAPONARBIRAK. Tüm hakları
              saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
