import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const slides = [
  {
    title: "Ayushman Bharat Scheme",
    icon: (
      <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
    ),
    text: "National Health Protection Scheme providing coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    btn: "View More",
    link: "https://abdm.gov.in/",
    bgClass: "from-blue-50 to-slate-50",
    iconBg: "bg-blue-300"
  },
  {
    title: "HIRKANI Maternal Care",
    icon: (
      <svg className="w-24 h-24 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
    ),
    text: "Dedicated municipal support framework for expectant mothers, integrating digital records, smart reminders, and emergency SOS services.",
    btn: "View More",
    link: "/hirkani",
    bgClass: "from-rose-50 to-slate-50",
    iconBg: "bg-rose-300"
  },
  {
    title: "Divyangjan Swasthya Yojana",
    icon: (
      <svg className="w-24 h-24 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
    ),
    text: "Ensuring accessible healthcare infrastructure, assistive devices provisioning, and continuous therapy support for persons with disabilities.",
    btn: "View More",
    link: "https://divyangsahayak.maharashtra.gov.in/",
    bgClass: "from-indigo-50 to-slate-50",
    iconBg: "bg-indigo-300"
  },
  {
    title: "National Immunization Schedule",
    icon: (
      <svg className="w-24 h-24 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
      </svg>
    ),
    text: "Universal Immunization Program tracking. Register to get timely reminders for children and adult vaccination drives in your municipality.",
    btn: "View More",
    link: "https://nhm.maharashtra.gov.in/scheme/%E0%A4%A8%E0%A4%BF%E0%A4%AF%E0%A4%AE%E0%A4%BF%E0%A4%A4-%E0%A4%B2%E0%A4%B8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%AE/",
    bgClass: "from-emerald-50 to-slate-50",
    iconBg: "bg-emerald-300"
  }
];

export default function Slideshow() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // Slower interval for readability
    return () => clearInterval(interval);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  const handleRedirect = (link) => {
    if (link.startsWith('/')) {
      navigate(link);
      window.scrollTo(0, 0);
    } else {
      window.open(link, '_blank');
    }
  };

  return (
    <div className="w-full mt-6 mb-16 px-4 md:px-10 font-sans">
      <div 
        className="max-w-[1280px] mx-auto relative overflow-hidden bg-white rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100" 
        style={{ minHeight: '440px' }}
      >
        

        {slides.map((slide, i) => (
          <div 
            key={i}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bgClass} flex items-center justify-center transition-all duration-1000 ease-in-out ${i === index ? 'opacity-100 z-10 translate-y-0 scale-100' : 'opacity-0 z-0 translate-y-4 scale-95 pointer-events-none'}`}
          >
            <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-12 py-12 md:py-0">
              <div className="grid grid-cols-1 md:grid-cols-2 items-center justify-center gap-10 md:gap-16 w-full">
                
                {/* Text Info Side */}
                <div className="flex flex-col justify-center items-center md:items-start text-center md:text-left order-last md:order-first">
                  <span className="inline-block px-4 py-1.5 bg-white border border-slate-200 text-slate-500 text-[0.7rem] font-bold tracking-widest uppercase mb-6 rounded-full shadow-sm">
                    Official Initiative
                  </span>
                  <h2 className="text-3xl md:text-[2.75rem] font-extrabold text-slate-900 mb-6 leading-[1.15] tracking-tight">
                    {slide.title}
                  </h2>
                  <p className="text-base md:text-lg text-slate-600 leading-relaxed mb-8 md:mb-10 font-medium max-w-lg">
                    {slide.text}
                  </p>
                  
                  <div 
                    onClick={() => handleRedirect(slide.link)} 
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-full cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 w-fit"
                  >
                    {slide.btn}
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </div>

                {/* Visual/Icon Side */}
                <div className="relative flex items-center justify-center w-full aspect-square max-w-[280px] md:max-w-[320px] mx-auto order-first md:order-last">
                   {/* Soft blurred background for aesthetic glassmorphism feel */}
                   <div className={`absolute inset-0 rounded-full blur-[60px] opacity-40 mix-blend-multiply transition-colors duration-1000 ${slide.iconBg}`}></div>
                   {/* Main Crisp Icon Circle */}
                   <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 bg-white/70 backdrop-blur-xl border border-white/80 rounded-full shadow-2xl flex items-center justify-center transform transition-transform duration-700 hover:scale-[1.03]">
                     {slide.icon}
                   </div>
                </div>

              </div>
            </div>
          </div>
        ))}

        {/* Minimal Control Navigation Arrows */}
        <button onClick={prev} className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-all duration-300 z-20 hover:bg-white hover:text-slate-900 hover:shadow-xl hover:scale-110 group shadow-sm opacity-0 md:opacity-100 focus:outline-none">
          <svg className="w-5 h-5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button onClick={next} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md border border-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-all duration-300 z-20 hover:bg-white hover:text-slate-900 hover:shadow-xl hover:scale-110 group shadow-sm opacity-0 md:opacity-100 focus:outline-none">
          <svg className="w-5 h-5 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"></path></svg>
        </button>
        
        {/* Soft Modern Progress Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setIndex(i)} 
              className={`h-2 rounded-full transition-all duration-500 ease-out focus:outline-none ${i === index ? 'w-10 bg-slate-800' : 'w-2 bg-slate-300 hover:bg-slate-400'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
