"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const partners = [
  {
    id: 1,
    image: "/homepage/images/moreapps/001.png",
    alt: "Partner 1",
  },
  {
    id: 2,
    image: "/homepage/images/moreapps/002.png",
    alt: "Partner 2",
  },
  {
    id: 3,
    image: "/homepage/images/moreapps/003.png",
    alt: "Partner 3",
  },
  {
    id: 4,
    image: "/homepage/images/moreapps/004.png",
    alt: "Partner 4",
  },
  {
    id: 5,
    image: "/homepage/images/moreapps/005.png",
    alt: "Partner 5",
  },
  {
    id: 6,
    image: "/homepage/images/moreapps/006.png",
    alt: "Partner 6",
  },
  {
    id: 7,
    image: "/homepage/images/moreapps/007.png",
    alt: "Partner 7",
  },
  {
    id: 8,
    image: "/homepage/images/moreapps/008.png",
    alt: "Partner 8",
  },
];

export default function Partners() {
  // Logoları 2 kez tekrar et (sonsuz döngü için)
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section
      id="partners-section"
      className=" px-4 md:px-0 py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-black"
    >
      <div>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 dark:text-white mb-4 sm:mb-6">
            Güçlü Altyapı & İş Ortaklarımız
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            YAPONARBIRAK, aracını güvenle yaptırman için sağlam ve güvenilir
            altyapılarla çalışır. Tüm işlemler hızlı, güvenli ve şeffaf.
          </p>
        </motion.div>

        {/* Partners Carousel - Continuous Infinite Scroll */}
        <div className="relative overflow-hidden select-none pointer-events-none">
          <motion.div
            className="flex gap-8 sm:gap-12 lg:gap-16"
            animate={{
              x: [0, `-${partners.length * 180}px`],
            }}
            transition={{
              repeat: Infinity,
              repeatType: "loop",
              duration: 30,
              ease: "linear",
            }}
          >
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.id}-${index}`}
                className="shrink-0 flex items-center justify-center"
              >
                <div className="relative w-32 h-20 sm:w-40 sm:h-24 lg:w-44 lg:h-28">
                  <Image
                    src={partner.image}
                    alt={partner.alt}
                    width={176}
                    height={112}
                    className="w-full h-full object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                    draggable={false}
                    priority={index < partners.length}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
