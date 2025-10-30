"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { FaApple, FaAndroid } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    title: "YAPONARBIRAK'a Hoş Geldiniz !",
    description:
      "Aracın için en uygun ustayı tek ilanla bul. Teklifleri karşılaştır, güvenilir tamir ve yedek parça hizmeti hemen yanında...",
    image: "/homepage/images/slider/001.png",
    backgroundImage: "/homepage/images/slider/1-1920x1200.jpg",
  },
  {
    title: "İlanını Aç, Ustayı Bul",
    description:
      "Arıza veya ihtiyacını yaz, tamirciler sana teklif versin. En uygun çözümü seç, aracını kolayca yaptır.",
    image: "/homepage/images/slider/002.png",
    backgroundImage: "/homepage/images/slider/2-1920x1200.jpg",
  },
  {
    title: "Çok Yakında",
    subtitle: "YAPONARBIRAK Uygulaması Yayında",
    description:
      "Online oto sanayi cebinde! Yeni nesil tamir ve yedek parça uygulamasıyla araç işlerini kolaylaştır.",
    image: "/homepage/images/slider/003.png",
    backgroundImage: "/homepage/images/slider/3-1920x1200.jpg",
  },
];

export default function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 10000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <section
      id="home-section"
      className="select-none relative w-full bg-linear-to-br from-gray-900 via-black to-gray-900 overflow-hidden"
    >
      {/* Carousel Container */}
      <div className="embla flex" ref={emblaRef}>
        <div className="embla__container h-full flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="embla__slide flex-[0_0_100%] min-w-0 relative"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.backgroundImage}
                  alt=""
                  fill
                  className="object-cover"
                  priority={index === 0}
                  quality={90}
                />
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/80" />
              </div>

              {/* Content Container */}
              <div className="relative h-full flex items-start justify-center px-4 sm:px-6 lg:px-8 pt-[15vh]">
                <div className="w-full max-w-7xl mx-auto flex">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Text Content */}
                    <div className="text-white text-center lg:text-left space-y-6 max-w-2xl mx-auto lg:mx-0 order-2 lg:order-1">
                      <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight font-light">
                        {slide.title}
                      </h1>

                      {slide.subtitle && (
                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white">
                          {slide.subtitle}
                        </h2>
                      )}

                      <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed">
                        {slide.description}
                      </p>

                      {/* Download Buttons */}
                      <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center lg:justify-start pt-4 pb-12 lg:pb-4">
                        <Link href="/" className="group">
                          <div className="bg-red-600 text-white transition-all duration-300 inline-flex items-center justify-center gap-3 px-8 py-2 rounded-xl hover:bg-slate-800 w-xs">
                            <FaApple className="text-3xl" />
                            <div className="text-left">
                              <div className="text-xs uppercase tracking-wide opacity-90">
                                Yakında !
                              </div>
                              <div className="text-lg font-bold">App Store</div>
                            </div>
                          </div>
                        </Link>

                        <Link href="/" className="group">
                          <div className="bg-red-600 text-white transition-all duration-300 inline-flex items-center justify-center gap-3 px-8 py-2 rounded-xl hover:bg-slate-800 w-xs">
                            <FaAndroid className="text-3xl" />
                            <div className="text-left">
                              <div className="text-xs uppercase tracking-wide opacity-90">
                                Yakında !
                              </div>
                              <div className="text-lg font-bold">
                                Google Play
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>

                    {/* Phone Mockup */}
                    <div className="relative flex items-center justify-center order-1 lg:order-2 mb-4 lg:-mb-48">
                      <div className="relative w-[280px] lg:w-[400px] h-[560px] sm:h-[640px] lg:h-[800px]">
                        <Image
                          src={slide.image}
                          alt={slide.title}
                          fill
                          className="object-contain drop-shadow-2xl"
                          priority={index === 0}
                          quality={90}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 lg:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 bg-red-600"
                : "w-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
