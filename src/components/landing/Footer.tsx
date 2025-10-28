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
    <>
      {/* CTA Section */}
      <footer className="text-(--landing-text) py-16 border-t border-(--landing-border)">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div>
              <h3 className="text-2xl font-bold mb-4 text-(--landing-text)">
                YAPONARBIRAK
              </h3>
              <p className="text-(--landing-text-muted) mb-6">
                Online oto sanayi platformu. Aracın için en uygun ustayı kolayca
                bul.
              </p>
              <div className="flex gap-4">
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-(--landing-card-bg) border border-(--landing-border) rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-(--landing-text-muted) cursor-pointer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--brand-primary)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor =
                        "var(--brand-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <FaFacebook />
                  </motion.div>
                </Link>
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-(--landing-card-bg) border border-(--landing-border) rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-(--landing-text-muted) cursor-pointer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--brand-primary)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor =
                        "var(--brand-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <FaTwitter />
                  </motion.div>
                </Link>
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-(--landing-card-bg) border border-(--landing-border) rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-(--landing-text-muted) cursor-pointer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--brand-primary)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor =
                        "var(--brand-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <FaInstagram />
                  </motion.div>
                </Link>
                <Link href="/">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="w-10 h-10 bg-(--landing-card-bg) border border-(--landing-border) rounded-lg flex items-center justify-center transition-all shadow-sm hover:shadow-md text-(--landing-text-muted) cursor-pointer"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "var(--brand-primary)";
                      e.currentTarget.style.color = "white";
                      e.currentTarget.style.borderColor =
                        "var(--brand-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "";
                      e.currentTarget.style.color = "";
                      e.currentTarget.style.borderColor = "";
                    }}
                  >
                    <FaLinkedin />
                  </motion.div>
                </Link>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-(--landing-text)">
                Hızlı Bağlantılar
              </h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#home-section"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Ana Sayfa
                  </a>
                </li>
                <li>
                  <a
                    href="#feature-section"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Özellikler
                  </a>
                </li>
                <li>
                  <a
                    href="#works-section"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Nasıl Çalışır
                  </a>
                </li>
              </ul>
            </div>
            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-(--landing-text)">
                Yasal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    KVKK
                  </Link>
                </li>
              </ul>
            </div>{" "}
            {/* Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-(--landing-text)">
                Yasal
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    Kullanım Koşulları
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="text-(--landing-text-muted) hover:text-(--brand-primary) transition-colors"
                  >
                    KVKK
                  </Link>
                </li>
              </ul>
            </div>
            {/* Download */}
            <div>
              <h4 className="text-lg font-semibold mb-4 text-(--landing-text)">
                Uygulamayı İndir
              </h4>
              <div className="space-y-3">
                <motion.button className="flex items-center gap-3 px-4 py-3 bg-(--landing-card-bg) border border-(--landing-border) rounded-lg transition-all shadow-sm hover:shadow-md text-(--landing-text-muted) w-full cursor-pointer active:bg-(--landing-card-bg)/80">
                  <FaApple className="text-2xl" />
                  <div className="text-left">
                    <div className="text-xs text-(--landing-text-muted)">
                      YAKINDA
                    </div>
                    <div className="font-semibold text-(--landing-text)">
                      App Store
                    </div>
                  </div>
                </motion.button>
                <motion.button className="flex items-center gap-3 px-4 py-3 bg-(--landing-card-bg) border border-(--landing-border) rounded-lg transition-all shadow-sm hover:shadow-md text-(--landing-text-muted) w-full cursor-pointer active:bg-(--landing-card-bg)/80">
                  <FaAndroid className="text-2xl" />
                  <div className="text-left">
                    <div className="text-xs text-(--landing-text-muted)">
                      YAKINDA
                    </div>
                    <div className="font-semibold text-(--landing-text)">
                      Google Play
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-(--landing-border) pt-8 text-center text-(--landing-text-muted)">
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
