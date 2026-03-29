import React, { useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="home-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <Navbar />
      
      <div className="flex-1 max-w-4xl mx-auto px-6 lg:px-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100 my-16">
        
        <div className="mb-10 border-b border-gray-200 pb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-gray-500 text-lg">Effective Date: March 30, 2026</p>
          <p className="text-gray-600 mt-4 leading-relaxed">
            Welcome to <span className="font-semibold text-blue-600">Arogya360 (Smart Health Care)</span>. We respect your privacy and are committed to protecting your sensitive medical data and personal information. This Privacy Policy outlines how we collect, use, process, and protect data provided by Citizens, Hospitals, and Government Authorities.
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">1.</span> Information We Collect
            </h2>
            <ul className="list-disc pl-6 space-y-3 leading-relaxed">
              <li><strong>Citizens:</strong> Name, age, blood group, contact information, appointment history, medical prescriptions, and diagnostic lab reports.</li>
              <li><strong>Hospitals:</strong> Registration details, bed occupancy, doctor rosters, billing and insurance information, and aggregated disease statistics.</li>
              <li><strong>System Data:</strong> IP addresses, browser types, and real-time GPS locations exclusively during Emergency/SOS activations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">2.</span> How We Use Your Data
            </h2>
            <p className="leading-relaxed mb-3">
              Your health and identity data is used exclusively to provide core system functionalities:
            </p>
            <ul className="list-disc pl-6 space-y-3 leading-relaxed">
              <li>Facilitating appointments between patients and doctors securely.</li>
              <li>Enabling emergency dispatchers (ambulances, police) to locate you accurately during an SOS.</li>
              <li>Allowing participating health insurance providers to process cashless claims directly.</li>
              <li>Generating anonymous, aggregated dashboard statistics for Government Authorities.</li>
            </ul>
          </section>

          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-blue-600">3.</span> AI, Machine Learning & Analytics
            </h2>
            <p className="leading-relaxed mb-3 font-medium text-blue-800">
              Arogya360 utilizes advanced technologies to enhance public health monitoring:
            </p>
            <ul className="list-disc pl-6 space-y-3 leading-relaxed text-blue-800">
              <li><strong>Disease Outbreak Prediction:</strong> We aggregate, anonymize, and process hospital-level disease data (e.g., Dengue, Malaria rates) to forecast potential outbreaks. No personal patient identities are ever linked to these analytical models.</li>
              <li><strong>ML Trust Score (Fraud Detection):</strong> Hospital operational data (bed occupancy vs. admitted patients) is analyzed by our Python Machine Learning backend to calculate a "Trust Score." This algorithm detects potential billing fraud or misreporting entirely automatically.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">4.</span> Data Sharing & Third Parties
            </h2>
            <p className="leading-relaxed mb-3">
              We do <strong>not</strong> sell, rent, or trade your personal medical records to commercial entities. Your data is only shared with:
            </p>
            <ul className="list-disc pl-6 space-y-3 leading-relaxed">
              <li><strong>Registered Medical Professionals:</strong> Doctors explicitly granted access during your consultation.</li>
              <li><strong>Government Authorities:</strong> Depersonalized, aggregate data is shared for public health surveillance and policy making.</li>
              <li><strong>Legal Requirements:</strong> If mandated by law enforcement or regulatory healthcare bodies (e.g., during mandatory disease reporting).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">5.</span> Data Security & Storage
            </h2>
            <p className="leading-relaxed">
              Arogya360 uses industry-standard encryption protocols to protect your Electronic Health Records (EHR). User passwords and critical session tokens are securely hashed. Infrastructure is hosted on secure, compliant cloud environments, targeting 99.9% uptime.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-blue-500">6.</span> Your Rights & Choices
            </h2>
            <p className="leading-relaxed">
              Citizens have the right to access, download, and request deletion of their medical history. You may revoke a doctor's access to your medical records at any time via the "Health Records" dashboard.
            </p>
          </section>

          <div className="pt-8 mt-12 border-t border-gray-200 text-center">
            <p className="text-gray-500 font-medium tracking-wide">
              Questions regarding this Privacy Policy? Contact us at:
            </p>
            <a href="mailto:privacy@arogya360.in" className="text-blue-600 font-bold hover:underline text-lg mt-2 inline-block">
              privacy@arogya360.in
            </a>
          </div>

        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
