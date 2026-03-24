import { useState, useEffect } from "react";

const slides = [
  {
    title: "Ayushman Bharat Scheme",
    icon: (
      <svg className="w-20 h-20 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
    ),
    text: "National Health Protection Scheme providing coverage up to ₹5 lakh per family per year for secondary and tertiary care hospitalization.",
    btn: "View More",
    link: "https://abdm.gov.in/",
    bgClass: "from-slate-900 to-blue-900"
  },
  {
    title: "HIRKANI Maternal Care",
    icon: (
      <svg className="w-20 h-20 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
      </svg>
    ),
    text: "Dedicated municipal support framework for expectant mothers, integrating digital records, smart reminders, and emergency SOS services.",
    btn: "View More",
    link: "/hirkani",
    bgClass: "from-slate-900 to-slate-800"
  },
  {
    title: "Divyangjan Swasthya Yojana",
    icon: (
      <svg className="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
      </svg>
    ),
    text: "Ensuring accessible healthcare infrastructure, assistive devices provisioning, and continuous therapy support for persons with disabilities.",
    btn: "View More",
    link: "https://divyangsahayak.maharashtra.gov.in/",
    bgClass: "from-blue-900 to-indigo-900"
  },
  {
    title: "National Immunization Schedule",
    icon: (
      <svg className="w-20 h-20 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
      </svg>
    ),
    text: "Universal Immunization Program tracking. Register to get timely reminders for children and adult vaccination drives in your municipality.",
    btn: "View More",
    link: "https://nhm.maharashtra.gov.in/scheme/%E0%A4%A8%E0%A4%BF%E0%A4%AF%E0%A4%AE%E0%A4%BF%E0%A4%A4-%E0%A4%B2%E0%A4%B8%E0%A5%80%E0%A4%95%E0%A4%B0%E0%A4%A3-%E0%A4%95%E0%A4%BE%E0%A4%B0%E0%A5%8D%E0%A4%AF%E0%A4%95%E0%A5%8D%E0%A4%B0%E0%A4%AE/",
    bgClass: "from-slate-800 to-teal-900"
  }
];

export default function Slideshow() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 6000); // Slower interval for readability
    return () => clearInterval(interval);
  }, []);

  const next = () => setIndex((prev) => (prev + 1) % slides.length);
  const prev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="w-full max-w-[1400px] mx-auto mt-4 mb-16 px-10 font-sans">
      <div 
        className="relative overflow-hidden bg-white border border-gray-300 shadow-md" 
        style={{ minHeight: '360px', borderRadius: '4px' }}
      >
        {/* Subtle top indicator line representing Government/India's colors */}
        <div className="absolute top-0 left-0 w-full h-1.5 flex z-20">
            <div className="h-full bg-orange-500" style={{flex: 1}}></div>
            <div className="h-full bg-white" style={{flex: 1}}></div>
            <div className="h-full bg-green-600" style={{flex: 1}}></div>
        </div>

        {slides.map((slide, i) => (
          <div 
            key={i}
            className={`absolute inset-0 bg-gradient-to-br ${slide.bgClass} flex items-center transition-opacity duration-700 ease-in-out ${i === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            
            
            <div className="relative z-10 p-10 md:p-16 w-full flex flex-col md:flex-row items-center md:items-center justify-between gap-10">
              
              {/* Text Info Side */}
              <div className="flex-1 text-center md:text-left md:pl-8">
                <span className="inline-block px-3 py-1 bg-white/10 text-white/90 border border-white/20 text-xs font-bold tracking-[0.15em] uppercase mb-4 rounded-sm">
                  Official Initiative
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                  {slide.title}
                </h2>
                <p className="text-lg text-gray-300 max-w-2xl leading-relaxed mb-8">
                  {slide.text}
                </p>
                
                <div 
                  onClick={() => window.location.href = slide.link} 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm uppercase tracking-wider cursor-pointer transition-colors border-2 border-transparent hover:border-blue-400 shadow-lg rounded-sm"
                >
                  {slide.btn}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>

              {/* Icon Side */}
              <div className="hidden md:flex shrink-0 w-56 h-56 bg-white/5 border border-white/10 backdrop-blur-md items-center justify-center rounded-sm md:mr-10 shadow-inner">
                 {slide.icon}
              </div>

            </div>
          </div>
        ))}

        {/* Industrial Solid Controls */}
        <button onClick={prev} className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-blue-700 text-white w-12 h-20 flex items-center justify-center transition-colors z-20 border-r border-white/10 group">
          <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
        </button>
        <button onClick={next} className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-blue-700 text-white w-12 h-20 flex items-center justify-center transition-colors z-20 border-l border-white/10 group">
          <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
        
        {/* Progress indicators bottom */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`h-1.5 transition-all duration-300 rounded-none border border-white/20 ${i === index ? 'w-10 bg-blue-500 border-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'w-5 bg-white/20 hover:bg-white/40'}`}></button>
          ))}
        </div>
      </div>
    </div>
  );
}
