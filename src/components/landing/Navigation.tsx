"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHome } from "react-icons/fa";

const navItems = [
  { id: "home-section", label: "Ana Sayfa" },
  { id: "feature-section", label: "Özellikler" },
  { id: "compatibility-section", label: "Uyumluluk" },
  { id: "works-section", label: "Nasıl Çalışır" },
  { id: "screenshots-section", label: "Ekran Görüntüleri" },
  { id: "partners-section", label: "Partnerler" },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home-section");

  useEffect(() => {
    const handleScroll = () => {
      // Determine active section
      const sections = navItems.map((item) => item.id);
      let currentSection = "home-section";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (
            rect.top <= window.innerHeight / 3 &&
            rect.bottom >= window.innerHeight / 3
          ) {
            currentSection = sectionId;
            break;
          }
        }
      }

      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed right-6 top-6 z-50 hidden lg:block"
    >
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex flex-col items-center gap-3">
          {/* Home Icon */}
          <button
            onClick={() => scrollToSection("home-section")}
            className={`p-3 rounded-full transition-all duration-300 ${
              activeSection === "home-section"
                ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
            aria-label="Ana Sayfa"
          >
            <FaHome className="w-5 h-5" />
          </button>

          {/* Navigation Dots */}
          {navItems.slice(1).map((item) => {
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-4 h-4 rounded-full transition-all duration-300 relative group ${
                  isActive
                    ? "bg-red-600 shadow-lg shadow-red-600/30 scale-125"
                    : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
                aria-label={item.label}
              >
                {/* Tooltip */}
                <span className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  <span className="bg-gray-900 dark:bg-gray-700 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
                    {item.label}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
