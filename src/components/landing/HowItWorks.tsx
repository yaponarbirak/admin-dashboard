"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaBullseye, FaHeadphones } from "react-icons/fa";
import Image from "next/image";

const tabs = [
  {
    id: "install",
    label: "Nasıl Kullanılır",
    title: "Nasıl Kullanılır ?",
    description:
      "İlan açarak aracının arızasını veya ihtiyacını yaz. Ustalar sana teklif göndersin. Karşılaştır, seç ve kolayca hizmet al.",
    image: "/homepage/images/feature-images/002.png",
    imagePosition: "right",
    features: [
      {
        icon: FaBullseye,
        title: "Misyonumuz",
        description:
          "Aracını güvenilir ustalarla buluşturmak, şeffaf fiyatlarla hızlı çözümler sunmak ve online oto sanayiyi cebine getirmek.",
      },
      {
        icon: FaHeadphones,
        title: "Güvenilir Hizmet",
        description:
          "Tüm ustalar sistemde kayıtlıdır. Fiyatları gör, yorumları incele, işini gönül rahatlığıyla teslim et ve aracını kısa sürede hazır et.",
      },
    ],
  },
  {
    id: "login",
    label: "Nasıl Üye Olunur",
    title: "Nasıl Üye Olunur ?",
    description:
      "YAPONARBIRAK'a üye olmak çok kolay. Telefon numaran veya e-posta adresinle saniyeler içinde hesap aç, hemen ilan vermeye başla.",
    image: "/homepage/images/feature-images/002.png",
    imagePosition: "left",
    features: [
      {
        icon: FaBullseye,
        title: "Misyonumuz",
        description:
          "Her araç sahibini doğru ustayla buluşturmak. Kolay kayıt, hızlı erişim ve güvenilir hizmet bizim için en önemli ilke.",
      },
      {
        icon: FaHeadphones,
        title: "Kolay Kayıt",
        description:
          "Üyelik ücretsizdir. Bilgilerini gir, hesabını doğrula ve teklifleri görmeye başla. Aracın için en uygun çözüme hemen ulaş.",
      },
    ],
  },
  {
    id: "share",
    label: "Nasıl İlan Açılır",
    title: "Nasıl İlan Açılır ?",
    description:
      "İlanını aç, ihtiyacını yaz. Kısa sürede birçok ustadan teklif gelsin. Sen karşılaştır, en güvenilir ve uygun ustayı kolayca seç.",
    image: "/homepage/images/feature-images/002.png",
    imagePosition: "right",
    features: [
      {
        icon: FaBullseye,
        title: "Misyonumuz",
        description:
          "Aracını doğru ustayla en kısa sürede buluşturmak. Güvenilir hizmet, şeffaf fiyat ve müşteri memnuniyeti önceliğimizdir.",
      },
      {
        icon: FaHeadphones,
        title: "Kolay Seçim",
        description:
          "Teklifleri incele, yorumları oku ve bütçene en uygun ustayı belirle. Böylece aracın emin ellerde olur.",
      },
    ],
  },
  {
    id: "friend",
    label: "Usta Nasıl Bulunur",
    title: "Usta Nasıl Bulunur ?",
    description:
      "İlanını aç, ihtiyacını yaz. Kısa sürede birçok ustadan teklif gelsin. Sen karşılaştır, en güvenilir ve uygun ustayı kolayca seç.",
    image: "/homepage/images/feature-images/002.png",
    imagePosition: "left",
    features: [
      {
        icon: FaBullseye,
        title: "Misyonumuz",
        description:
          "Aracını doğru ustayla en kısa sürede buluşturmak. Güvenilir hizmet, şeffaf fiyat ve müşteri memnuniyeti önceliğimizdir.",
      },
      {
        icon: FaHeadphones,
        title: "Kolay Seçim",
        description:
          "Teklifleri incele, yorumları oku ve bütçene en uygun ustayı belirle. Böylece aracın emin ellerde olur.",
      },
    ],
  },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section id="works-section" className="py-20 bg-white dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-3 sm:mb-4">
            Nasıl Çalışır ?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto px-4">
            OTATAMİ ile aracını kolayca tamir ettir. İlanını aç, ihtiyacını yaz,
            birkaç dakika içinde ustalardan teklif al. Teklifleri karşılaştır,
            en uygununu seç ve aracını güvenle yaptır. Online oto sanayi artık
            cebinde!
          </p>
        </motion.div>

        {/* Tabs Navigation - Slider Style */}
        <div className="relative mb-8 sm:mb-12 px-8 sm:px-12">
          {/* Progress Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-600">
            <motion.div
              className="h-full bg-red-700"
              initial={{ width: "0%" }}
              animate={{
                width: `${(activeTab / (tabs.length - 1)) * 100}%`,
              }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className="flex flex-col items-center gap-2 sm:gap-3 group relative z-10"
              >
                {/* Circle */}
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                    activeTab === index
                      ? "bg-red-800 shadow-lg scale-110"
                      : index < activeTab
                      ? "bg-gray-300 dark:bg-gray-600"
                      : "bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <span
                    className={`text-base sm:text-xl font-semibold ${
                      activeTab === index || index < activeTab
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  >
                    {index < activeTab ? "✓" : index + 1}
                  </span>
                </div>

                {/* Label */}
                <span
                  className={`text-[10px] sm:text-xs lg:text-sm font-medium text-center max-w-20 sm:max-w-30 transition-colors duration-300 ${
                    activeTab === index
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 dark:bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-12"
          >
            <div
              className={`grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center`}
            >
              {/* Image - Show first on mobile */}
              <div
                className={`order-1 lg:order-${
                  tabs[activeTab].imagePosition === "left" ? "1" : "2"
                }`}
              >
                <div className="relative w-full max-w-60 sm:max-w-xs lg:max-w-sm mx-auto aspect-3/4 mb-6 lg:mb-0">
                  <Image
                    src={tabs[activeTab].image}
                    alt={tabs[activeTab].title}
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
              </div>

              {/* Content */}
              <div
                className={`order-2 lg:order-${
                  tabs[activeTab].imagePosition === "left" ? "2" : "1"
                }`}
              >
                <h3 className="text-lg sm:text-2xl lg:text-3xl font-light text-gray-900 dark:text-white mb-2 sm:mb-3 lg:mb-4">
                  {tabs[activeTab].title}
                </h3>
                <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-white mb-4 sm:mb-6 lg:mb-8 leading-relaxed">
                  {tabs[activeTab].description}
                </p>

                {/* Features */}
                <div className="space-y-3 sm:space-y-4 lg:space-y-6">
                  {tabs[activeTab].features.map((feature, idx) => {
                    const Icon = feature.icon;
                    return (
                      <div key={idx} className="flex gap-2.5 sm:gap-3 lg:gap-4">
                        <div className="shrink-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-red-800 flex items-center justify-center">
                            <Icon className="text-base sm:text-lg lg:text-xl text-white" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-900 dark:text-white/80 mb-0.5 sm:mb-1 lg:mb-2">
                            {feature.title}
                          </h4>
                          <p className="text-[11px] sm:text-xs lg:text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
