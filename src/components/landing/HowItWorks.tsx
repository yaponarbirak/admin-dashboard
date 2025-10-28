"use client";

import { motion } from "framer-motion";
import { FaUserPlus, FaFileAlt, FaWrench } from "react-icons/fa";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    icon: FaUserPlus,
    title: "1. Üye Ol",
    description:
      "YAPONARBIRAK'a üye olmak çok kolay. Telefon numaran veya e-posta adresinle saniyeler içinde hesap aç, hemen ilan vermeye başla.",
    image: "/homepage/images/feature-images/002.png",
  },
  {
    icon: FaFileAlt,
    title: "2. İlan Aç",
    description:
      "İlan açarak aracının arızasını veya ihtiyacını yaz. Ustalar sana teklif göndersin. Karşılaştır, seç ve kolayca hizmet al.",
    image: "/homepage/images/feature-images/001.png",
  },
  {
    icon: FaWrench,
    title: "3. Ustanı Bul",
    description:
      "Tüm ustalar sistemde kayıtlıdır. Fiyatları gör, yorumları incele, işini gönül rahatlığıyla teslim et ve aracını kısa sürede hazır et.",
    image: "/homepage/images/feature-images/004.png",
  },
];

export default function HowItWorks() {
  return (
    <section id="works-section" className="py-20 bg-(--landing-card-bg)">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-(--landing-text) mb-4">
            Nasıl Çalışır ?
          </h2>
          <p className="text-xl text-(--landing-text-muted) max-w-3xl mx-auto">
            YAPONARBIRAK ile aracını kolayca tamir ettir. İlanını aç, ihtiyacını
            yaz, birkaç dakika içinde ustalardan teklif al. Teklifleri
            karşılaştır, en uygununu seç ve aracını güvenle yaptır.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-24">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isEven = index % 2 === 0;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                  isEven ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg shrink-0"
                      style={{
                        background:
                          "linear-gradient(to bottom right, var(--brand-primary), var(--brand-primary-light))",
                      }}
                    >
                      <Icon className="text-3xl text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-(--landing-text)">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-lg text-(--landing-text-muted) leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Feature highlights */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                      ></div>
                      <p className="text-(--landing-text-muted)">
                        Güvenilir ustalarla buluşturmak, şeffaf fiyatlarla hızlı
                        çözümler sunmak
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div
                        className="w-2 h-2 rounded-full mt-2 shrink-0"
                        style={{ backgroundColor: "var(--brand-primary)" }}
                      ></div>
                      <p className="text-(--landing-text-muted)">
                        Üyelik ücretsizdir. Tüm hizmet geçmişin her an
                        erişilebilir
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image */}
                <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                  <div className="relative w-full max-w-md mx-auto aspect-square">
                    <div
                      className="absolute inset-0 blur-2xl"
                      style={{
                        background:
                          "linear-gradient(to bottom right, rgba(156, 27, 39, 0.1), rgba(197, 36, 51, 0.01))",
                      }}
                    ></div>
                    <div className="relative">
                      <Image
                        src={step.image}
                        alt={step.title}
                        width={400}
                        height={400}
                        className="object-contain w-full h-full max-h-96"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
