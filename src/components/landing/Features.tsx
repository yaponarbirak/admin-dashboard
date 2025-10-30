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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
  },
};

export default function Features() {
  return (
    <section id="feature-section" className="py-20 bg-gray-50 dark:bg-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-light text-gray-900 dark:text-white mb-4">
            Uygulama Özellikleri
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="p-8 flex gap-6"
              >
                {/* Icon */}
                <div className="mb-6">
                  <div className="w-14 h-14 rounded-full flex border border-red-600/10 dark:border-red-600/60 items-center justify-center">
                    <Icon className="text-2xl text-red-600" />
                  </div>
                </div>
                <div>
                  {/* Title */}
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
