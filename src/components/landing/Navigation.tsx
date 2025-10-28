"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHome, FaStar, FaCog } from "react-icons/fa";

const navItems = [
  { id: "home-section", label: "YAPONARBIRAK", icon: FaHome },
  { id: "feature-section", label: "ÖZELLİKLER", icon: FaStar },
  { id: "works-section", label: "NASIL ÇALIŞIR", icon: FaCog },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState("home-section");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show navigation after initial scroll
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Determine active section
      const sections = navItems.map((item) => item.id);
      let currentSection = "home-section";

      for (const sectionId of sections) {
        const element = document.getElementById(sectionId);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (
            rect.top <= window.innerHeight / 2 &&
            rect.bottom >= window.innerHeight / 2
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
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed right-8 top-1/2 -translate-y-1/2 z-50 hidden lg:block"
        >
          <ul className="space-y-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <li key={item.id}>
                  <motion.button
                    onClick={() => scrollToSection(item.id)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative"
                    aria-label={item.label}
                  >
                    {/* Dot */}
                    <div
                      className={`w-4 h-4 rounded-full transition-all duration-300 ${
                        isActive ? "shadow-lg scale-125" : "bg-gray-400"
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: "var(--brand-primary)",
                              boxShadow:
                                "0 10px 15px -3px rgba(156, 27, 39, 0.5)",
                            }
                          : {}
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor =
                            "var(--brand-primary-light)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = "";
                        }
                      }}
                    />

                    {/* Tooltip */}
                    <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap shadow-xl">
                        <Icon className="inline mr-2" />
                        {item.label}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                          <div className="w-0 h-0 border-t-8 border-t-transparent border-l-8 border-l-gray-900 border-b-8 border-b-transparent"></div>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
