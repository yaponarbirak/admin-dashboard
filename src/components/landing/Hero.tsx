"use client";

import { useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion } from "framer-motion";
import { FaApple, FaAndroid } from "react-icons/fa";
import Image from "next/image";

const slides = [
  {
    title: "YAPONARBIRAK'a Hoş Geldiniz !",
    description:
      "Aracın için en uygun ustayı tek ilanla bul. Teklifleri karşılaştır, güvenilir tamir ve yedek parça hizmeti hemen yanında...",
    image: "/homepage/images/slider/001.png",
    backgroundImage: "/homepage/images/slider/1-1920x1200.jpg",
    imagePosition: "right",
  },
  {
    title: "İlanını Aç, Ustayı Bul",
    description:
      "Arıza veya ihtiyacını yaz, tamirciler sana teklif versin. En uygun çözümü seç, aracını kolayca yaptır.",
    image: "/homepage/images/slider/002.png",
    backgroundImage: "/homepage/images/slider/2-1920x1200.jpg",
    imagePosition: "left",
  },
  {
    title: "Çok Yakında",
    subtitle: "YAPONARBIRAK Uygulaması Yayında",
    description:
      "Online oto sanayi cebinde! Yeni nesil tamir ve yedek parça uygulamasıyla araç işlerini kolaylaşt.",
    image: "/homepage/images/slider/003.png",
    backgroundImage: "/homepage/images/slider/3-1920x1200.jpg",
    imagePosition: "right",
  },
];

export default function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      // Optional: Add any select logic here
    };

    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      id="home-section"
      className="relative min-h-[600px] sm:min-h-[650px] md:h-[72vh] bg-linear-to-b from-gray-900/20 via-gray-800/50 to-gray-900/80 overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px]"></div>
      </div>

      <div className="embla relative h-full select-none" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide flex-[0_0_100%] min-w-0 relative select-none"
            >
              {/* Background Image */}
              <Image
                src={slide.backgroundImage}
                alt=""
                fill
                className="object-cover z-0"
                priority={index === 0}
              />

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-black/70 z-1" />

              <div className="container mx-auto px-4 py-8 md:py-12 h-full flex items-center relative z-10">
                <div className="w-full max-w-7xl mx-auto">
                  <div
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center ${
                      slide.imagePosition === "left"
                        ? "lg:flex-row-reverse"
                        : ""
                    }`}
                  >
                    {/* Text Content */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className={`text-white ${
                        slide.imagePosition === "left"
                          ? "lg:order-2"
                          : "lg:order-1"
                      }`}
                    >
                      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 md:mb-4 leading-tight">
                        {slide.title}
                      </h1>
                      {slide.subtitle && (
                        <h2
                          className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold mb-3 md:mb-4"
                          style={{ color: "var(--brand-primary-light)" }}
                        >
                          {slide.subtitle}
                        </h2>
                      )}
                      <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mb-4 md:mb-6 lg:mb-8 leading-relaxed">
                        {slide.description}
                      </p>

                      {/* Download Buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <motion.a
                          href="javascript:void(0)"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-sm md:text-base"
                        >
                          <FaApple className="text-xl md:text-2xl" />
                          <div className="text-left">
                            <div className="text-xs opacity-80">YAKINDA !</div>
                            <div className="text-sm md:text-base">
                              App Store
                            </div>
                          </div>
                        </motion.a>

                        <motion.a
                          href="javascript:void(0)"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="inline-flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 lg:px-8 py-3 md:py-4 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl text-sm md:text-base"
                          style={{
                            background:
                              "linear-gradient(to right, var(--brand-primary), var(--brand-primary-light))",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(to right, var(--brand-primary-hover), var(--brand-primary))";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background =
                              "linear-gradient(to right, var(--brand-primary), var(--brand-primary-light))";
                          }}
                        >
                          <FaAndroid className="text-xl md:text-2xl" />
                          <div className="text-left">
                            <div className="text-xs opacity-80">YAKINDA !</div>
                            <div className="text-sm md:text-base">
                              Google Play
                            </div>
                          </div>
                        </motion.a>
                      </div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4, duration: 0.6 }}
                      className={`relative hidden sm:block ${
                        slide.imagePosition === "left"
                          ? "lg:order-1"
                          : "lg:order-2"
                      }`}
                    >
                      <div className="relative w-full max-w-[200px] sm:max-w-[280px] md:max-w-md mx-auto aspect-3/4">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-contain drop-shadow-2xl"
                          priority={index === 0}
                        />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Dots Navigation */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className="w-3 h-3 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300 hover:scale-125"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 1,
          duration: 0.6,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full p-1">
          <div className="w-1.5 h-2 bg-white rounded-full mx-auto animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  );
}
