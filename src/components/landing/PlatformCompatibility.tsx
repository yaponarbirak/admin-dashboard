"use client";

import { motion } from "framer-motion";
import { FaCheckCircle } from "react-icons/fa";
import Image from "next/image";

const features = [
  "İlanını aç ve ihtiyaçlarını yaz",
  "Farklı ustalardan teklifler al",
  "Teklifleri karşılaştır ve en uygununu seç",
  "Güvenilir hizmet ve hızlı sonuç",
  "Online sanayi cebinde",
  "Zaman ve bütçe tasarrufu",
  "Kullanıcı yorumları ile güven",
  "Adım adım kolay kullanım",
  "Aracın kısa sürede hazır",
  "Tüm süreci tek platformda yönet",
];

export default function PlatformCompatibility() {
  return (
    <section id="compatibility-section" className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-black px-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-4 sm:mb-6">
              Android & IOS Uyumlu
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed">
              YAPONARBIRAK, tüm mobil cihazlarda tam uyumlu. İster IOS kullan,
              ister Andorid, ilanlarını yönet, teklifler al ve aracın için en uygun ustayı
              kolayca seç.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="flex items-start gap-2 sm:gap-3"
                >
                  <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm lg:text-base text-gray-700 dark:text-gray-300">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Phone Mockups */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex items-center justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl h-[500px] sm:h-[600px] lg:h-[700px]">
              <Image
                src="/homepage/images/feature-images/002.png"
                alt="Android & IOS Uyumlu"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
