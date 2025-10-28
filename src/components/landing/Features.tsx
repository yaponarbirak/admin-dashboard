"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import {
  FaClock,
  FaBullseye,
  FaInbox,
  FaMoneyBillWave,
  FaHeadphones,
  FaCoffee,
} from "react-icons/fa";

const features = [
  {
    icon: FaClock,
    title: "Ömür Boyu Ücretsiz",
    description:
      "İlan açmak tamamen ücretsiz. Tüm hizmet geçmişin ve teklifler her an erişilebilir. Sen sadece aracını düşün.",
    delay: 0.1,
  },
  {
    icon: FaBullseye,
    title: "Misyonumuz",
    description:
      "Aracını en hızlı şekilde doğru ustayla buluşturmak. Güvenilir, şeffaf ve kolay bir tamir süreci sunmak.",
    delay: 0.2,
  },
  {
    icon: FaInbox,
    title: "Ustanı Bul",
    description:
      "Arıza ve ihtiyacını yaz, birkaç dakika içinde tamirciler teklif versin. Sen seç, hemen harekete geç.",
    delay: 0.3,
  },
  {
    icon: FaMoneyBillWave,
    title: "Masrafını Hesapla",
    description:
      "İlan aç, fiyat tekliflerini karşılaştır. En uygun hizmeti seçerek bütçeni kontrol altında tut.",
    delay: 0.4,
  },
  {
    icon: FaHeadphones,
    title: "Güvenli İşlemler",
    description:
      "Tüm ustalar sistemimizde kayıtlı. Güvenilir hizmet al, işini gönül rahatlığıyla teslim et.",
    delay: 0.5,
  },
  {
    icon: FaCoffee,
    title: "Zamanını Geri Kazan",
    description:
      "Sanayi sanayi dolaşma. Tek tıkla ilan aç, teklifleri cebine gelsin. Aracın kısa sürede hazır olsun.",
    delay: 0.6,
  },
];

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.1,
      duration: 0.6,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0},
  visible: {
    opacity: 1,
  },
};

export default function Features() {
  return (
    <section id="feature-section" className="py-20 bg-(--landing-bg)">
      <div className="container mx-auto px-4 space-y-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-(--landing-text) mb-4">
            Uygulama Özellikleri
          </h2>
          <p className="text-xl text-(--landing-text-muted) max-w-3xl mx-auto">
            Aracın için en uygun ustayı kolayca bul. Tek ilan aç, onlarca
            tamirciden teklif al. Online oto sanayi her zaman yanında!
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-(--landing-card-bg) p-8 rounded-2xl transition-all duration-300 border border-(--landing-border) shadow-sm hover:shadow-lg"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
                    style={{
                      background:
                        "linear-gradient(to bottom right, var(--brand-primary), var(--brand-primary-light))",
                    }}
                  >
                    <Icon className="text-3xl text-white" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-(--landing-text) mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-(--landing-text-muted) leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group relative px-8 py-4 overflow-hidden rounded-2xl  cursor-pointer"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-linear-to-r from-(--brand-primary) to-(--brand-primary-light)" />

            {/* Animated shine effect */}
            <motion.div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
              }}
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />

            {/* Content */}
            <div className="relative flex items-center gap-3 text-white font-semibold text-lg">
              <span>Hemen Başla</span>
              <motion.div
                animate={{
                  x: [0, 4, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <ArrowRight
                  size={20}
                  className="group-hover:-rotate-45 group-hover:translate-x-4 transition-transform duration-300"
                />
              </motion.div>
            </div>

            {/* Hover glow effect */}
            <motion.div
              className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow:
                  "0 0 20px rgba(156, 27, 39, 0.5), 0 0 40px rgba(197, 36, 51, 0.3)",
              }}
            />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
