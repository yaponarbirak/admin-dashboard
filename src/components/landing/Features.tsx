"use client";

import { motion } from "framer-motion";
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
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function Features() {
  return (
    <section id="feature-section" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Uygulama Özellikleri
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
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
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-linear-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
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
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
