"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const screenshots = [
  {
    id: 1,
    image: "/portfolio/001.jpg",
    alt: "Ana Ekran",
  },
  {
    id: 2,
    image: "/portfolio/002.jpg",
    alt: "İlanlar",
  },
  {
    id: 3,
    image: "/portfolio/003.jpg",
    alt: "İş Fırsatları",
  },
  {
    id: 4,
    image: "/portfolio/004.jpg",
    alt: "Teklifler",
  },
  {
    id: 5,
    image: "/portfolio/005.jpg",
    alt: "Profil",
  },
];

export default function Screenshots() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    slidesToScroll: 1,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section
      id="screenshots-section"
      className="py-16 sm:py-20 lg:py-24 bg-gray-50 dark:bg-black"
    >
      <div className="container mx-auto md:px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20  px-8 md:px-0">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-gray-900 dark:text-white mb-4 sm:mb-6">
            Uygulama Ekran Görüntüleri
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-gray-500 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed px-4">
            YAPONARBIRAK'ın kullanıcı dostu arayüzünü keşfet. İlan açma, teklif
            alma ve ustayı seçme adımlarını görsellerle incele, uygulamanın
            kolay kullanımını deneyimle.
          </p>
        </div>

        {/* Embla Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-4 sm:gap-6 lg:gap-8 pr-4 sm:pr-6 lg:pr-8">
              {screenshots.map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="flex-[0_0_80%] sm:flex-[0_0_60%] md:flex-[0_0_45%] lg:flex-[0_0_30%] xl:flex-[0_0_23%] min-w-0 flex items-center justify-center"
                >
                  <div className="relative w-full h-[500px] sm:h-[560px] lg:h-[600px] xl:h-[640px]">
                    <Image
                      src={screenshot.image}
                      alt={screenshot.alt}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Buttons - Hidden on mobile, positioned outside on desktop */}
          <button
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            className="hidden md:flex absolute -left-6 lg:-left-16 xl:-left-20 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white dark:bg-gray-800 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700 dark:text-gray-200" />
          </button>

          <button
            onClick={scrollNext}
            disabled={!canScrollNext}
            className="hidden md:flex absolute -right-6 lg:-right-16 xl:-right-20 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-white dark:bg-gray-800 shadow-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 lg:w-7 lg:h-7 text-gray-700 dark:text-gray-200" />
          </button>

          {/* Dots Indicator - Dinamik (scrollSnaps'e göre) */}
          <div className="flex items-center justify-center gap-2 mt-8 sm:mt-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => emblaApi?.scrollTo(index)}
                className={`transition-all duration-300 ${
                  index === selectedIndex
                    ? "w-8 sm:w-10 h-2.5 bg-red-800 rounded-full"
                    : "w-2.5 h-2.5 bg-gray-300 rounded-full hover:bg-gray-400"
                }`}
                aria-label={`Sayfa ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
