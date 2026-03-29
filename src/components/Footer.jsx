import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0b1120] text-gray-300 pt-20 font-sans border-t border-gray-800">
      <div className="max-w-[1400px] mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24 mb-16">
        
        {/* Brand Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md">
                <div className="w-5 h-5 bg-black rounded-full font-bold flex items-center justify-center text-[12px] text-white">
                  A
                </div>
             </div>
             <span className="text-2xl font-bold tracking-wide text-white">Arogya360</span>
          </div>
          <p className="text-gray-400 font-medium leading-relaxed text-[0.95rem]">
            Your trusted digital healthcare companion, bringing smart algorithms and comprehensive data together for a healthier community.
          </p>
        </div>

        {/* Address Grid */}
        <div>
          <h3 className="text-white text-lg font-bold mb-8 uppercase tracking-wider">Contact & Address</h3>
          <ul className="space-y-6 text-[0.95rem] font-medium text-gray-400">
            <li className="flex items-start">
              <span className="mt-1 flex-1 leading-relaxed">
                Municipal Corporation Main Office,<br />
                Shivaji Nagar, Pune 411005
              </span>
            </li>
          </ul>
        </div>

        {/* Follow Us Grid */}
        <div>
          <h4 className="text-white text-lg font-bold mb-8 uppercase tracking-wider">
            Follow Us
          </h4>
          <div className="flex gap-4 flex-wrap">
            <a
              target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center hover:bg-blue-500 hover:border-blue-400 hover:text-white transition-all hover:-translate-y-1 cursor-pointer text-base shadow-lg group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
            </a>
            <a
              target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center hover:bg-blue-600 hover:border-blue-500 hover:text-white transition-all hover:-translate-y-1 cursor-pointer text-base shadow-lg group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.848-3.037-1.85 0-2.133 1.446-2.133 2.939v5.667H9.356V9h3.414v1.561h.046c.475-.9 1.636-1.85 3.368-1.85 3.605 0 4.269 2.372 4.269 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.066-2.064c0-1.14.925-2.066 2.066-2.066a2.066 2.066 0 010 4.13zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.77C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.77 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a
              target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center hover:bg-sky-400 hover:border-sky-300 hover:text-white transition-all hover:-translate-y-1 cursor-pointer text-base shadow-lg group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a
              target="_blank" rel="noopener noreferrer"
              className="w-12 h-12 rounded-full border border-gray-700 bg-gray-800 flex items-center justify-center hover:bg-gradient-to-tr hover:from-orange-500 hover:via-pink-500 hover:to-purple-500 hover:border-pink-400 hover:text-white transition-all hover:-translate-y-1 cursor-pointer text-base shadow-lg group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.46 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 bg-[#060a13] py-8">
        <div className="max-w-[1400px] mx-auto px-8 md:px-16 flex flex-col md:flex-row justify-between items-center gap-8 text-sm font-medium text-gray-500">
          
          <div className="tracking-wide flex flex-col gap-2 text-center md:text-left">
            <span className="text-gray-400">© 2026 Arogya360. All rights reserved.</span>
            <span className="text-xs text-gray-500 font-medium">
              Developed by: <span className="text-blue-400 font-semibold">Sanket Sutar, Onkar Jadhavar, Saurabh Taur, Rohan Umbarepatil</span>
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-8 justify-center">
            <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors block">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-blue-400 transition-colors block">
              Terms of Service
            </Link>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
