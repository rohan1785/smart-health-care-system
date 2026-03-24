import React from "react";

const Footer = () => {
  return (
<footer className="bg-[#0b1120] text-gray-300 py-[80px] font-sans border-t border-gray-800 h-80px">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-16 lg:gap-24 mb-16">
        {/* Address Grid */}
        <div>
          <h3 className="text-white text-xl font-bold mb-8">Address</h3>
          <ul className="space-y-6 text-[0.95rem] font-medium text-gray-400">
            <li className="flex items-start gap-4">
              <span className="text-xl bg-gray-800 p-2 rounded-lg text-emerald-400">
                📍
              </span>
              <span className="mt-1 flex-1 leading-relaxed">
                Municipal Corporation Main Office,
                <br />
                Shivaji Nagar, Pune 411005
              </span>
            </li>
          </ul>
        </div>

        {/* Follow Us Grid */}
        <div>
          <h4 className="text-white font-bold mb-5 tracking-wide">
            Follow Us
          </h4>
          <div className="flex gap-5">
            <a
              href="#"
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all hover:scale-110 cursor-pointer text-base font-bold shadow-lg"
            >
              f
            </a>
            <a
              href="#"
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-500 hover:text-white transition-all hover:scale-110 cursor-pointer text-base font-bold shadow-lg"
            >
              in
            </a>
            <a
              href="#"
              className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-sky-400 hover:text-white transition-all hover:scale-110 cursor-pointer text-base font-bold shadow-lg"
            >
              𝕏
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 pt-15 mt-10 bg-[#0b1120]">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-medium text-gray-500">
          <div className="tracking-wide">
            © 2026 Arogya360. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-8 justify-center">
            <a href="#" className="hover:text-white transition-colors block">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors block">
              Terms of Service
            </a>
            <div className="flex items-center gap-3 text-white bg-gray-900 border-gray-700 px-5 py-2.5 rounded-full border shadow-inner">
              <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                <div className="w-2.5 h-2.5 bg-black rounded-full font-bold flex items-center justify-center text-[10px] text-white">
                  A
                </div>
              </div>
              <span className="text-sm tracking-wide">
                Made with{" "}
                <b className="font-extrabold text-blue-400 ml-1">Arogya360</b>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
