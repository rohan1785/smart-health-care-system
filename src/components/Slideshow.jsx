import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion"; // For smooth animations
import { useNavigate } from "react-router-dom";

const SLIDES = [
  {
    id: 0,
    title: "Ayushman Bharat Scheme",
    subtitle: "Healthcare for All",
    description:
      "Coverage up to ₹5 lakh per family per year for hospitalization across 25,000+ hospitals.",
    cta: "View Details",
    link: "https://abdm.gov.in/",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&fit=crop",
    gradient: "from-sky-50 via-white to-blue-50",
    icon: "🏥",
  },
  {
    id: 1,
    title: "HIRKANI Maternal Care",
    subtitle: "Care for Expectant Mothers",
    description:
      "Comprehensive maternal health support with reminders, nutrition tracking & emergency SOS services.",
    cta: "Get Started",
    link: "/hirkani",
    image:
      "https://images.unsplash.com/photo-1575321755462-9d58baca58c3?w=800&fit=crop",
    gradient: "from-rose-50 via-white to-pink-50",
    icon: "🤰",
  },
  {
    id: 2,
    title: "Divyangjan Swasthya Yojana",
    subtitle: "Accessible Healthcare",
    description:
      "Specialized care and assistive support for differently-abled citizens with priority services.",
    cta: "Explore Services",
    link: "https://divyangsahayak.maharashtra.gov.in/",
    image:
      "https://images.unsplash.com/photo-1582213782170-e120ce5e6228?w=800&fit=crop",
    gradient: "from-indigo-50 via-white to-violet-50",
    icon: "♿",
  },
  {
    id: 3,
    title: "National Immunization Program",
    subtitle: "Vaccination for Life",
    description:
      "Complete vaccination tracking for children & adults with schedule reminders and certificates.",
    cta: "View Schedule",
    link: "https://nhm.maharashtra.gov.in/",
    image:
      "https://images.unsplash.com/photo-1589006664254-d5cf6dd20b44?w=800&fit=crop",
    gradient: "from-teal-50 via-white to-emerald-50",
    icon: "💉",
  },
];

export default function Slideshow() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [direction, setDirection] = useState(0);
  const navigate = useNavigate();

  // Auto-slide logic (2 seconds) - Always running even when scrolled out of view
  useEffect(() => {
    const interval = setInterval(() => {
      if (!hovered) goToNext();
    }, 2000);
    return () => clearInterval(interval);
  }, [current, hovered]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = useCallback(
    (index) => {
      setDirection(index > current ? 1 : -1);
      setCurrent(index);
    },
    [current],
  );

  const slideVariants = {
    hidden: (dir) => ({
      x: dir > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: "spring", stiffness: 300, damping: 30 },
        opacity: { duration: 0.5 },
      },
    },
    exit: (dir) => ({
      x: dir < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: { duration: 0.4 },
    }),
  };

  return (
    <div className="relative w-full mt-12">
      {/* Full Width Main Carousel Container - Reduced Height */}
      <div
        className="relative h-[300px] md:h-[350px] lg:h-[400px] overflow-hidden shadow-xl rounded-2xl"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Background Image */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={current}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${SLIDES[current].image})`,
              backgroundSize: "cover",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </AnimatePresence>

        {/* Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${SLIDES[current].gradient} opacity-[0.93] mix-blend-screen bg-blend-soft-light`}
        />

        {/* Direct Info Content - No Glass Box, Clean Overlay Text */}
        <AnimatePresence custom={direction}>
          <motion.div
            key={current}
            variants={slideVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            custom={direction}
            className="absolute inset-0 flex flex-col items-center justify-center text-center text-slate-800 px-6 md:px-12 lg:px-20 py-8 backdrop-blur-md bg-white/70 cursor-pointer"
            onClick={(e) => {
              if (e.target.closest("button")) return; // ignore CTA button clicks which are handled separately
              if (SLIDES[current].link.startsWith("http")) {
                window.open(SLIDES[current].link, "_blank");
              } else {
                navigate(SLIDES[current].link);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
          >
            {/* Icon */}
            <motion.div
              className="text-4xl md:text-6xl mb-4 opacity-100 drop-shadow-md bg-white/50 p-4 rounded-full border border-white/60"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {SLIDES[current].icon}
            </motion.div>

            {/* Title */}
            <motion.h2
              className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 mb-3 bg-gradient-to-r from-slate-900 via-teal-800 to-slate-900 bg-clip-text text-transparent leading-tight max-w-lg mx-auto"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {SLIDES[current].title}
            </motion.h2>

            {/* Subtitle */}
            <motion.p
              className="text-lg md:text-xl font-bold text-teal-700 mb-4 max-w-md mx-auto leading-relaxed"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {SLIDES[current].subtitle}
            </motion.p>

            {/* Description */}
            <motion.p
              className="text-base md:text-lg text-slate-700 mb-10 leading-relaxed max-w-2xl mx-auto font-medium"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {SLIDES[current].description}
            </motion.p>

            {/* CTA Button FIXED */}
            <motion.button
              onClick={() => {
                if (SLIDES[current].link.startsWith("http")) {
                  window.open(SLIDES[current].link, "_blank");
                } else {
                  navigate(SLIDES[current].link);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="group inline-flex items-center px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-teal-500 cursor-pointer"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                {SLIDES[current].cta}
                <svg
                  className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </div>
            </motion.button>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrev}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/60 hover:bg-white/90 backdrop-blur-xl rounded-full border border-slate-200 text-slate-800 text-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 z-10"
          aria-label="Previous slide"
        >
          ‹
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-white/60 hover:bg-white/90 backdrop-blur-xl rounded-full border border-slate-200 text-slate-800 text-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95 z-10"
          aria-label="Next slide"
        >
          ›
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 md:w-1/2 bg-slate-200/50 backdrop-blur-xl rounded-full h-2 overflow-hidden shadow-inner z-10">
          <div
            className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-transparent rounded-full shadow-md transition-all duration-1000"
            style={{ width: `${((Date.now() % 2000) / 2000) * 100}%` }}
          />
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === current
                  ? "w-10 bg-teal-600 shadow-md scale-110"
                  : "w-2.5 bg-slate-400 hover:bg-teal-400 hover:scale-125"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
