import { useState, useRef, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Hospital from "./pages/Hospital";
import Authority from "./pages/Authority";
import Hirkani from "./pages/Hirkani";
import AuthorityFeedback from "./pages/AuthorityFeedback";

const QA_DATASET = [
  {
    id: 1,
    category: "General System",
    keywords: [
      "what is",
      "smart health care",
      "system",
      "about",
      "explain",
      "describe",
    ],
    question: "What is the Smart Health Care System?",
    answer:
      "The Smart Health Care System is a digital platform connecting <b>Citizens, Hospitals, and Authorities</b>. Citizens book appointments and view health records. Hospitals manage patients and medical data. Authorities monitor health analytics.",
  },
  {
    id: 2,
    category: "General System",
    keywords: ["who", "use", "users", "roles", "types", "user types"],
    question: "Who can use this system?",
    answer:
      "Three types of users:<br>👤 <b>Citizens</b> – book appointments, view records, emergency services.<br>🏨 <b>Hospitals</b> – manage patients, update medical data.<br>🏛️ <b>Authorities</b> – oversee system, monitor analytics, approve hospitals.",
  },
  {
    id: 3,
    category: "General System",
    keywords: [
      "features",
      "functions",
      "what can",
      "modules",
      "capabilities",
      "main features",
    ],
    question: "What are the main features?",
    answer:
      "Key features:<br>• Appointment Booking & Management<br>• Digital Health Records<br>• Hospital Dashboard<br>• Authority Analytics Panel<br>• Emergency SOS Services<br>• Role-Based Secure Login<br>• Profile & Family Management<br>• Real-Time Notifications",
  },
  {
    id: 4,
    category: "General System",
    keywords: ["access", "available", "24/7", "anytime", "always"],
    question: "Is the system available 24/7?",
    answer:
      "Yes! Viewing records, booking appointments, and checking status are available <b>24/7</b>. Emergency services are always active.",
  },
  {
    id: 5,
    category: "General System",
    keywords: [
      "free",
      "paid",
      "cost",
      "subscription",
      "price",
      "charges",
      "money",
    ],
    question: "Is the system free to use?",
    answer:
      "The platform is <b>free for Citizens</b>. Hospitals may have subscription fees. Consultation fees are set by hospitals/doctors. Emergency features are always free.",
  },
  {
    id: 6,
    category: "General System",
    keywords: ["offline", "no internet", "without internet", "works offline"],
    question: "Can I use it without internet?",
    answer:
      "Most features require internet. The mobile app lets you <b>download health records</b> for offline viewing. Emergency SOS has SMS backup.",
  },
  {
    id: 7,
    category: "General System",
    keywords: [
      "mobile app",
      "android",
      "ios",
      "phone app",
      "download app",
      "google play",
      "app store",
    ],
    question: "Is there a mobile app?",
    answer:
      "Yes!<br>📱 <b>Android</b> – Google Play Store<br>🍎 <b>iOS</b> – Apple App Store<br>Search 'Smart Health Care System'.",
  },
  {
    id: 8,
    category: "General System",
    keywords: [
      "reliable",
      "uptime",
      "server",
      "downtime",
      "maintenance",
      "availability",
    ],
    question: "How reliable is the system?",
    answer:
      "The system targets <b>99.9% uptime</b>. Maintenance is scheduled 2–4 AM IST with 24-hour advance notice.",
  },
  {
    id: 9,
    category: "Login & Register",
    keywords: [
      "register",
      "sign up",
      "create account",
      "new account",
      "join",
      "signup",
    ],
    question: "How do I register?",
    answer:
      "1️⃣ Click <b>Register</b><br>2️⃣ Select role (Citizen / Hospital / Authority)<br>3️⃣ Fill name, email, phone, password<br>4️⃣ Verify email via OTP<br>5️⃣ Complete profile<br>✅ Done!",
  },
  {
    id: 10,
    category: "Login & Register",
    keywords: ["login", "log in", "sign in", "access account", "how to login"],
    question: "How do I log in?",
    answer:
      "1️⃣ Click <b>Login</b><br>2️⃣ Enter email and password<br>3️⃣ Select your role<br>4️⃣ Click Submit<br>✅ You're in!",
  },
  {
    id: 11,
    category: "Login & Register",
    keywords: [
      "can't login",
      "cannot login",
      "login failed",
      "not working",
      "login problem",
      "login error",
    ],
    question: "Why can't I log in?",
    answer:
      "Common reasons:<br>❌ Wrong email/password<br>❌ Unverified email<br>❌ Wrong role selected<br>❌ Account suspended<br>❌ Caps Lock on<br><br>💡 Try <b>Reset Password</b>.",
  },
  {
    id: 12,
    category: "Login & Register",
    keywords: [
      "forgot password",
      "reset password",
      "lost password",
      "password reset",
    ],
    question: "How do I reset my password?",
    answer:
      "1️⃣ Click <b>Forgot Password</b><br>2️⃣ Enter your email<br>3️⃣ Check email for reset link<br>4️⃣ Set new password<br>⚠️ Link expires in <b>30 minutes</b>.",
  },
  {
    id: 13,
    category: "Login & Register",
    keywords: [
      "change password",
      "update password",
      "new password",
      "password change",
    ],
    question: "How do I change my password?",
    answer:
      "1️⃣ Go to <b>Profile Settings</b><br>2️⃣ Click <b>Security → Change Password</b><br>3️⃣ Enter current + new password<br>4️⃣ Save ✅",
  },
  {
    id: 14,
    category: "Login & Register",
    keywords: [
      "account locked",
      "blocked",
      "suspended",
      "deactivated",
      "account suspended",
    ],
    question: "My account is locked. What do I do?",
    answer:
      "Wait 15–30 minutes and retry. If suspended, contact <b>support@smarthealthcare.in</b> with your registered email.",
  },
  {
    id: 15,
    category: "Login & Register",
    keywords: [
      "otp not received",
      "no otp",
      "verification code",
      "otp missing",
      "didn't get otp",
    ],
    question: "I didn't receive my OTP.",
    answer:
      "1️⃣ Check <b>Spam/Junk</b> folder<br>2️⃣ Confirm your email/phone<br>3️⃣ Wait 2–3 mins → click <b>Resend OTP</b><br>4️⃣ Still nothing? Contact support.",
  },
  {
    id: 16,
    category: "Citizen Features",
    keywords: [
      "book appointment",
      "schedule appointment",
      "appointment",
      "book doctor",
      "visit doctor",
      "make appointment",
    ],
    question: "How do I book an appointment?",
    answer:
      "1️⃣ Log in → <b>Appointments</b><br>2️⃣ Search hospital/doctor by name, specialty, or location<br>3️⃣ Select date & time slot<br>4️⃣ Confirm booking<br>✅ Email + SMS confirmation sent!",
  },
  {
    id: 17,
    category: "Citizen Features",
    keywords: [
      "cancel appointment",
      "reschedule",
      "delete appointment",
      "appointment cancel",
      "change appointment",
    ],
    question: "How do I cancel or reschedule?",
    answer:
      "1️⃣ Log in → <b>My Appointments</b><br>2️⃣ Find the appointment<br>3️⃣ Click <b>Cancel</b> or <b>Reschedule</b><br>⚠️ Must cancel at least <b>2 hours</b> before.",
  },
  {
    id: 18,
    category: "Citizen Features",
    keywords: [
      "health records",
      "medical records",
      "view records",
      "my records",
      "health history",
      "medical history",
    ],
    question: "How do I view my health records?",
    answer:
      "1️⃣ Log in → <b>Health Records</b><br>2️⃣ View diagnoses, prescriptions, lab reports, treatment history<br>3️⃣ Download as PDF anytime 📁",
  },
  {
    id: 19,
    category: "Citizen Features",
    keywords: [
      "emergency",
      "help",
      "ambulance",
      "urgent",
      "sos",
      "emergency service",
      "need help",
    ],
    question: "How do I request emergency services?",
    answer:
      "🚨 Press the red <b>Emergency / SOS</b> button!<br>1️⃣ GPS auto-detected<br>2️⃣ Select type (Ambulance / Medical / Fire / Police)<br>3️⃣ Submit — nearest responder alerted instantly<br>💡 Works without login too!",
  },
  {
    id: 20,
    category: "Citizen Features",
    keywords: [
      "find hospital",
      "search hospital",
      "nearby hospital",
      "locate hospital",
      "hospital near me",
    ],
    question: "How do I find a nearby hospital?",
    answer:
      "1️⃣ Log in → <b>Find Hospital</b><br>2️⃣ Allow location or enter city/PIN<br>3️⃣ Filter by specialty, rating, distance<br>4️⃣ Book directly from results!",
  },
  {
    id: 21,
    category: "Citizen Features",
    keywords: [
      "appointment status",
      "confirmed appointment",
      "pending appointment",
      "check appointment status",
    ],
    question: "How do I check my appointment status?",
    answer:
      "Log in → <b>My Appointments</b><br>🟡 Pending | 🟢 Confirmed | ✅ Completed | ❌ Cancelled<br>You also get email/SMS when status changes.",
  },
  {
    id: 22,
    category: "Citizen Features",
    keywords: [
      "update profile",
      "edit profile",
      "change details",
      "personal info",
      "update information",
      "profile update",
    ],
    question: "How do I update my profile?",
    answer:
      "1️⃣ Click your avatar (top right)<br>2️⃣ <b>Edit Profile</b><br>3️⃣ Update name, age, blood group, address, photo<br>4️⃣ Save ✅",
  },
  {
    id: 23,
    category: "Citizen Features",
    keywords: [
      "notification",
      "alert",
      "reminder",
      "sms",
      "email alert",
      "what notifications",
    ],
    question: "What notifications will I receive?",
    answer:
      "📅 Appointment confirmations & reminders<br>🔄 Status changes<br>📋 Prescriptions uploaded<br>🚨 Emergency response status<br>📢 System announcements<br><br>Via: <b>Email + SMS + In-App</b>",
  },
  {
    id: 24,
    category: "Citizen Features",
    keywords: [
      "share records",
      "send records",
      "share with doctor",
      "share health records",
    ],
    question: "Can I share my health records with a doctor?",
    answer:
      "Yes! Health Records → Select docs → <b>Share</b> → Choose hospital/doctor → Set optional expiry date ✅ Revoke anytime.",
  },
  {
    id: 25,
    category: "Citizen Features",
    keywords: [
      "prescription",
      "medicine",
      "doctor prescription",
      "view prescription",
      "my prescription",
    ],
    question: "Where can I see my prescriptions?",
    answer:
      "<b>Health Records → Prescriptions</b> tab.<br>Shows: Doctor's name | Date | Medicines | Dosage | Duration<br>Download or print directly.",
  },
  {
    id: 26,
    category: "Citizen Features",
    keywords: [
      "feedback",
      "review",
      "rating",
      "rate hospital",
      "rate doctor",
      "review hospital",
    ],
    question: "Can I rate or review a hospital?",
    answer:
      "Yes! After appointment is <b>Completed</b>:<br>My Appointments → <b>Give Feedback</b> → Rate (1–5 ⭐) + write review → Submit",
  },
  {
    id: 27,
    category: "Citizen Features",
    keywords: [
      "family member",
      "add family",
      "book for family",
      "dependent",
      "child account",
      "family",
    ],
    question: "Can I add family members?",
    answer:
      "Yes! Dashboard → <b>My Family</b> → Add Member → Enter name, age, relationship.<br>Book appointments and manage records on their behalf 👨👩👧",
  },
  {
    id: 28,
    category: "Citizen Features",
    keywords: [
      "insurance",
      "health insurance",
      "cashless",
      "claim insurance",
      "policy",
    ],
    question: "Does the system support health insurance?",
    answer:
      "Yes! Profile → <b>Insurance Details</b>. Participating hospitals can verify coverage and process <b>cashless claims</b> directly.",
  },
  {
    id: 29,
    category: "Citizen Features",
    keywords: [
      "health tips",
      "wellness advice",
      "health advice",
      "tips",
      "wellness",
    ],
    question: "Does the system provide health tips?",
    answer:
      "Yes! <b>Health & Wellness</b> section includes:<br>💡 Daily tips | 🌡️ Seasonal advisories | 🏃 Diet & exercise | 🛡️ Disease prevention | 📢 Health campaigns",
  },
  {
    id: 30,
    category: "Citizen Features",
    keywords: [
      "chronic",
      "diabetes tracking",
      "bp tracking",
      "blood pressure",
      "sugar level",
      "track health",
    ],
    question: "Can I track chronic conditions?",
    answer:
      "Yes! <b>Health Tracker</b>:<br>🩸 Blood glucose | 💓 BP | ❤️ Heart rate | ⚖️ Weight | 🫁 SpO₂<br>Charts show trends. Share with your doctor!",
  },
  {
    id: 31,
    category: "Hospital Dashboard",
    keywords: [
      "hospital login",
      "hospital account",
      "hospital access",
      "hospital sign in",
    ],
    question: "How does a hospital log in?",
    answer:
      "Login → Select role: <b>Hospital</b> → Enter credentials → Access <b>Hospital Dashboard</b>.",
  },
  {
    id: 32,
    category: "Hospital Dashboard",
    keywords: [
      "hospital register",
      "add hospital",
      "hospital signup",
      "onboard hospital",
      "register hospital",
    ],
    question: "How can a hospital register?",
    answer:
      "Register → Hospital → Fill details + upload documents → Submit for <b>Authority approval</b><br>⏳ Approval: 1–3 business days.",
  },
  {
    id: 33,
    category: "Hospital Dashboard",
    keywords: [
      "manage appointment",
      "hospital appointments",
      "confirm appointment",
      "hospital schedule",
    ],
    question: "How does a hospital manage appointments?",
    answer:
      "Hospital Dashboard → <b>Appointments</b>:<br>✅ View all bookings<br>✅ Confirm / reschedule<br>✅ Assign doctors<br>✅ Mark Completed / Cancel",
  },
  {
    id: 34,
    category: "Hospital Dashboard",
    keywords: [
      "update patient",
      "patient data",
      "patient records",
      "add patient record",
      "update health record",
    ],
    question: "How can a hospital update patient data?",
    answer:
      "Patient Management → Search patient → Open profile → Add/update: diagnosis, prescriptions, lab results, treatment notes → Save ✅",
  },
  {
    id: 35,
    category: "Hospital Dashboard",
    keywords: [
      "add doctor",
      "doctor registration",
      "manage doctors",
      "hospital staff",
      "add staff",
    ],
    question: "How can a hospital add doctors?",
    answer:
      "Staff Management → <b>Add Doctor</b> → Enter name, specialisation, qualification, schedule → Save ✅",
  },
  {
    id: 36,
    category: "Hospital Dashboard",
    keywords: [
      "hospital analytics",
      "statistics",
      "hospital reports",
      "patient stats",
      "hospital performance",
    ],
    question: "What analytics are available?",
    answer:
      "📊 Total appointments | 👥 Patient demographics | ⭐ Top specialties | 👨⚕️ Doctor performance | 💬 Feedback ratings | 🛏️ Bed availability",
  },
  {
    id: 37,
    category: "Hospital Dashboard",
    keywords: [
      "emergency management",
      "emergency patient",
      "handle emergency",
      "emergency case hospital",
    ],
    question: "How does a hospital handle emergencies?",
    answer:
      "1️⃣ Real-time SOS alert received<br>2️⃣ Staff accept → ambulance dispatched<br>3️⃣ Status updated live for citizen<br>4️⃣ Case linked to citizen's health history",
  },
  {
    id: 38,
    category: "Hospital Dashboard",
    keywords: [
      "upload prescription",
      "add prescription",
      "write prescription",
      "doctor prescription hospital",
    ],
    question: "How can a hospital upload a prescription?",
    answer:
      "Patient profile → <b>Add Prescription</b> → Fill medicines, dosages, duration, notes → Save ✅ Visible to patient instantly.",
  },
  {
    id: 39,
    category: "Hospital Dashboard",
    keywords: [
      "bed",
      "bed availability",
      "ward",
      "icu",
      "capacity",
      "bed management",
    ],
    question: "Can hospitals manage bed availability?",
    answer:
      "Yes! <b>Resource Management</b> → Update beds by ward: General, ICU, Emergency, Maternity 🛏️ Visible to Authorities.",
  },
  {
    id: 40,
    category: "Hospital Dashboard",
    keywords: [
      "discharge",
      "patient discharge",
      "discharge summary",
      "release patient",
    ],
    question: "How does a hospital discharge a patient?",
    answer:
      "Patient Management → Active Case → <b>Discharge</b> → Fill summary (diagnosis, treatment, follow-up) → Save ✅ Added to citizen's records.",
  },
  {
    id: 41,
    category: "Hospital Dashboard",
    keywords: [
      "hospital profile",
      "update hospital info",
      "edit hospital details",
      "hospital information",
    ],
    question: "How can a hospital update its profile?",
    answer:
      "Hospital Profile (settings) → Update name, address, services, working hours → Save ✅",
  },
  {
    id: 42,
    category: "Hospital Dashboard",
    keywords: [
      "lab report",
      "test report",
      "diagnostic report",
      "upload lab",
      "laboratory",
    ],
    question: "How can a hospital upload lab reports?",
    answer:
      "Patient Profile → Lab Reports → <b>Upload Report</b> (PDF/JPG/PNG) → Add test name, date → Save ✅",
  },
  {
    id: 43,
    category: "Hospital Dashboard",
    keywords: [
      "hospital revenue",
      "billing",
      "payment tracking",
      "hospital earnings",
      "invoice",
    ],
    question: "Can hospitals track billing?",
    answer:
      "Yes! Billing section:<br>💳 All transactions | 🧾 Generate invoices | 📊 Pending payments | ↩️ Issue refunds | 📥 Download reports",
  },
  {
    id: 44,
    category: "Hospital Dashboard",
    keywords: [
      "multiple branches",
      "hospital chain",
      "branch management",
      "multi location",
      "branches",
    ],
    question: "Can a hospital chain manage multiple branches?",
    answer:
      "Yes! Parent account with sub-dashboards per branch. Unified view + independent operations per branch.",
  },
  {
    id: 45,
    category: "Hospital Dashboard",
    keywords: [
      "working hours",
      "timings",
      "hospital hours",
      "open hours",
      "availability hours",
    ],
    question: "How does a hospital set working hours?",
    answer:
      "Hospital Profile → Settings → <b>Working Hours</b> → Set daily times per department → Mark holidays → Save ✅",
  },
  {
    id: 46,
    category: "Authority Panel",
    keywords: [
      "authority",
      "what is authority",
      "authority role",
      "authority access",
      "government panel",
    ],
    question: "What is the Authority role?",
    answer:
      "Highest system access:<br>🏛️ Approve hospitals | 📊 Monitor health data | 📢 Broadcast announcements | ⚙️ Manage policies | 🔍 Audit hospitals | 📋 Compliance reports",
  },
  {
    id: 47,
    category: "Authority Panel",
    keywords: [
      "approve hospital",
      "hospital approval",
      "verify hospital",
      "hospital verification",
      "hospital request",
    ],
    question: "How does Authority approve a hospital?",
    answer:
      "Hospital Requests → Review documents → <b>Approve</b> ✅ or <b>Reject</b> ❌ (with reason).<br>Approved: hospital gets credentials. Rejected: notified with reason.",
  },
  {
    id: 48,
    category: "Authority Panel",
    keywords: [
      "system analytics",
      "authority analytics",
      "nationwide data",
      "health analytics",
      "system statistics",
    ],
    question: "What analytics can Authority view?",
    answer:
      "👥 Registered citizens & hospitals | 📅 Appointment volumes by region | 🦠 Common conditions | 🚨 Emergency response times | ⭐ Hospital ratings | 📈 Health trends",
  },
  {
    id: 49,
    category: "Authority Panel",
    keywords: [
      "monitor hospitals",
      "hospital monitoring",
      "track hospitals",
      "oversight authority",
    ],
    question: "How can Authority monitor hospitals?",
    answer:
      "Real-time dashboards of all hospitals, activity checks, citizen feedback review, and ability to warn/suspend non-compliant hospitals 📊",
  },
  {
    id: 50,
    category: "Authority Panel",
    keywords: [
      "announcement",
      "broadcast",
      "authority message",
      "system announcement",
      "send message",
    ],
    question: "Can Authority send announcements?",
    answer:
      "Yes! Announcements → Write message → Select audience (All / Hospitals / Citizens) → Publish ✅ Sent via dashboard + email/SMS.",
  },
  {
    id: 51,
    category: "Authority Panel",
    keywords: [
      "deactivate hospital",
      "suspend hospital",
      "remove hospital",
      "ban hospital",
      "block hospital",
    ],
    question: "How can Authority suspend a hospital?",
    answer:
      "Hospital Management → Find hospital → <b>Suspend</b> → Enter reason → Access revoked instantly 🔄 Reversible after compliance.",
  },
  {
    id: 52,
    category: "Authority Panel",
    keywords: [
      "generate report",
      "download report",
      "export data",
      "authority report",
      "health report",
    ],
    question: "How can Authority generate reports?",
    answer:
      "Reports → Select type → Choose date range & region → <b>Generate</b> → Download as <b>PDF or Excel</b> 📊",
  },
  {
    id: 53,
    category: "Authority Panel",
    keywords: [
      "complaint",
      "grievance",
      "escalate complaint",
      "report hospital",
      "file complaint",
    ],
    question: "How does Authority handle complaints?",
    answer:
      "Citizens file via Help → Report a Hospital → Authority reviews → Contacts hospital → Takes action (warning/suspension). Citizens updated throughout.",
  },
  {
    id: 54,
    category: "Authority Panel",
    keywords: [
      "disease surveillance",
      "outbreak",
      "epidemic tracking",
      "disease spread",
      "public health",
    ],
    question: "Can Authority track disease outbreaks?",
    answer:
      "Yes! Analytics panel shows:<br>📈 Diagnosis spikes by region | 🏥 Hospital admissions by condition | ⚠️ Outbreak indicators for fast government response.",
  },
  {
    id: 55,
    category: "Authority Panel",
    keywords: [
      "audit",
      "system audit",
      "data audit",
      "compliance audit",
      "activity log",
    ],
    question: "Can Authority conduct audits?",
    answer:
      "Yes! Audit Log shows:<br>🔑 Hospital logins | 📋 Data access logs | ✏️ Record modifications | 🚨 Emergency response times | ⚙️ Admin actions",
  },
  {
    id: 56,
    category: "Emergency Services",
    keywords: [
      "emergency service",
      "sos",
      "how emergency works",
      "emergency system",
      "how does emergency",
    ],
    question: "How do emergency services work?",
    answer:
      "🚨 SOS triggered → GPS auto-detected → Nearest responder alerted → Responder dispatches help → Citizen tracks live → Case recorded in health history",
  },
  {
    id: 57,
    category: "Emergency Services",
    keywords: [
      "ambulance",
      "call ambulance",
      "request ambulance",
      "need ambulance",
    ],
    question: "How do I call an ambulance?",
    answer:
      "SOS button → Select <b>Ambulance</b> → Confirm location → <b>Request Now</b> 🚑 Track live on screen.",
  },
  {
    id: 58,
    category: "Emergency Services",
    keywords: [
      "emergency without login",
      "guest emergency",
      "no account emergency",
      "without account",
    ],
    question: "Can I access emergency without logging in?",
    answer:
      "Yes! Homepage has visible <b>Emergency Help</b> button — enter location and request help without an account 💡",
  },
  {
    id: 59,
    category: "Emergency Services",
    keywords: [
      "track ambulance",
      "ambulance status",
      "where ambulance",
      "live tracking",
      "ambulance location",
    ],
    question: "Can I track the ambulance in real time?",
    answer:
      "🗺️ Live map with ambulance location | ⏱️ ETA displayed | 🔔 Updates as it approaches | 📞 Driver contact shared",
  },
  {
    id: 60,
    category: "Emergency Services",
    keywords: [
      "emergency contact",
      "add contact",
      "ice contact",
      "in case of emergency",
      "sos contact",
    ],
    question: "Can I add emergency contacts?",
    answer:
      "Profile → <b>Emergency Contacts</b> → Add up to 3 contacts.<br>✅ Auto-notified with your location when SOS is triggered.",
  },
  {
    id: 61,
    category: "Data Privacy & Security",
    keywords: [
      "privacy",
      "data privacy",
      "personal data",
      "secure",
      "confidential",
      "data protection",
    ],
    question: "How is my personal data protected?",
    answer:
      "🔐 End-to-end encryption | 🛡️ RBAC | 🔒 SSL | 📱 2FA | 🔍 Regular audits | ⚖️ GDPR compliance | 🚫 No data sold",
  },
  {
    id: 62,
    category: "Data Privacy & Security",
    keywords: [
      "data sharing",
      "who can see",
      "data access",
      "who sees my data",
      "who has access",
    ],
    question: "Who can see my health data?",
    answer:
      "👤 <b>You</b> – full access<br>🏨 <b>Hospitals</b> – only your shared/appointment data<br>🏛️ <b>Authority</b> – anonymised stats only<br><br>You control all sharing.",
  },
  {
    id: 63,
    category: "Data Privacy & Security",
    keywords: [
      "two factor",
      "2fa",
      "otp login",
      "extra security",
      "two step",
      "2 factor",
    ],
    question: "Does the system support 2FA?",
    answer:
      "Yes! Profile → Security Settings → Toggle <b>2FA</b> → Choose SMS or Email OTP ✅ Each login needs password + OTP.",
  },
  {
    id: 64,
    category: "Data Privacy & Security",
    keywords: [
      "delete account",
      "remove account",
      "deactivate account",
      "close account",
      "erase account",
    ],
    question: "How do I delete my account?",
    answer:
      "Profile Settings → Account → <b>Delete Account</b> → Confirm → Data removed within 30 days ⚠️ Medical records may be retained anonymously per law.",
  },
  {
    id: 65,
    category: "Data Privacy & Security",
    keywords: [
      "data breach",
      "hacked",
      "compromised",
      "security breach",
      "account hacked",
    ],
    question: "What if my account is hacked?",
    answer:
      "1️⃣ Reset password<br>2️⃣ Enable 2FA<br>3️⃣ Log out all devices: Profile → Security<br>4️⃣ Email <b>security@smarthealthcare.in</b><br>⏱️ Response within 24 hours.",
  },
  {
    id: 66,
    category: "Data Privacy & Security",
    keywords: [
      "revoke access",
      "remove hospital access",
      "stop sharing",
      "restrict access",
      "remove access",
    ],
    question: "How do I revoke a hospital's access?",
    answer:
      "Health Records → <b>Shared Access</b> → Click <b>Revoke</b> next to hospital ✅ Access removed immediately. Re-share anytime.",
  },
  {
    id: 67,
    category: "Data Privacy & Security",
    keywords: [
      "where data stored",
      "data storage",
      "server location",
      "data center",
      "stored data",
    ],
    question: "Where is my data stored?",
    answer:
      "On <b>secure encrypted cloud servers in India</b>, compliant with IT Act & DPDP Act. Backed up daily. Not stored outside India without consent.",
  },
  {
    id: 68,
    category: "Data Privacy & Security",
    keywords: [
      "gdpr",
      "compliance",
      "data law",
      "regulation",
      "legal compliance",
      "iso",
    ],
    question: "Is the system legally compliant?",
    answer:
      "Yes! Compliant with:<br>⚖️ Indian IT Act | 🛡️ DPDP Act | 🏥 Healthcare data regulations | 🔐 ISO 27001",
  },
  {
    id: 69,
    category: "Role-Based Access",
    keywords: [
      "citizen vs hospital",
      "difference between roles",
      "role comparison",
      "citizen hospital difference",
    ],
    question: "Difference between Citizen and Hospital accounts?",
    answer:
      "👤 <b>Citizen</b>: Book appointments, view personal records, emergency services.<br>🏨 <b>Hospital</b>: Manage patients, update records, handle appointments & emergencies.",
  },
  {
    id: 70,
    category: "Role-Based Access",
    keywords: [
      "citizen see all",
      "citizen access hospital",
      "citizen limitations",
      "can citizen see others",
    ],
    question: "Can a citizen see other patients' records?",
    answer:
      "Absolutely not. Citizens see <b>only their own</b> records. Strict RBAC enforced — one citizen can never access another's data.",
  },
  {
    id: 71,
    category: "Role-Based Access",
    keywords: [
      "hospital access to data",
      "what hospital can see",
      "hospital data permission",
      "hospital see records",
    ],
    question: "What data can a hospital access?",
    answer:
      "✅ Records of own patients (appointment-linked)<br>✅ Documents citizen explicitly shared<br>✅ Emergency case data<br>❌ Cannot see other hospitals' data or unlinked profiles",
  },
  {
    id: 72,
    category: "Role-Based Access",
    keywords: [
      "role dashboard",
      "different dashboards",
      "custom dashboard",
      "which dashboard",
    ],
    question: "Does each role have a different dashboard?",
    answer:
      "Yes!<br>👤 Citizen: Appointments, records, emergency, profile<br>🏨 Hospital: Patient mgmt, staff, analytics, billing<br>🏛️ Authority: Approvals, analytics, announcements, reports",
  },
  {
    id: 73,
    category: "Role-Based Access",
    keywords: [
      "change role",
      "switch role",
      "citizen to hospital",
      "update role",
      "change account type",
    ],
    question: "Can I change my role after registering?",
    answer:
      "Roles are <b>fixed at registration</b>. Contact support@smarthealthcare.in for a role change request. Requires verification and admin approval.",
  },
  {
    id: 74,
    category: "Profile Management",
    keywords: [
      "profile photo",
      "change photo",
      "upload photo",
      "profile picture",
      "change avatar",
    ],
    question: "How do I change my profile photo?",
    answer:
      "Profile → Edit Profile → Click photo → Upload (JPG/PNG, max 2MB) → Crop → Save ✅",
  },
  {
    id: 75,
    category: "Profile Management",
    keywords: ["blood group", "blood type", "update blood group", "blood"],
    question: "How do I update my blood group?",
    answer:
      "Profile → Edit Profile → <b>Medical Details</b> → Select blood group → Save 🩸 Critical for emergencies!",
  },
  {
    id: 76,
    category: "Profile Management",
    keywords: [
      "notification settings",
      "turn off notifications",
      "notification preferences",
      "manage alerts",
      "disable notifications",
    ],
    question: "How do I manage notification preferences?",
    answer:
      "Profile → <b>Notification Settings</b> → Toggle Email/SMS/In-App per event type → Save ⚠️ Emergency alerts cannot be disabled.",
  },
  {
    id: 77,
    category: "Profile Management",
    keywords: [
      "language",
      "change language",
      "hindi",
      "regional language",
      "vernacular",
    ],
    question: "Can I use the system in Hindi?",
    answer:
      "Yes! Profile → Settings → <b>Language</b> → Select Hindi or English. More regional languages coming soon.",
  },
  {
    id: 78,
    category: "Profile Management",
    keywords: [
      "allergy",
      "allergic",
      "food allergy",
      "drug allergy",
      "allergy record",
      "add allergy",
    ],
    question: "How do I add allergy information?",
    answer:
      "Profile → Medical Details → <b>Allergies</b> → Add Allergy → Enter allergen + reaction type → Save ⚠️ Highlighted in emergencies.",
  },
  {
    id: 79,
    category: "Technical Support",
    keywords: [
      "not loading",
      "app not working",
      "website down",
      "page error",
      "not opening",
      "app crash",
    ],
    question: "The app/website is not loading. What do I do?",
    answer:
      "1️⃣ Check internet<br>2️⃣ Refresh/restart app<br>3️⃣ Clear cache & cookies<br>4️⃣ Try Chrome browser<br>5️⃣ Check maintenance notice<br>6️⃣ Contact support with screenshot",
  },
  {
    id: 80,
    category: "Technical Support",
    keywords: [
      "contact support",
      "help",
      "customer care",
      "helpline",
      "reach support",
      "contact us",
    ],
    question: "How do I contact support?",
    answer:
      "📧 support@smarthealthcare.in<br>📞 1800-XXX-XXXX (toll-free)<br>💬 In-App chat icon<br>📝 Help & Support menu<br><br>⏰ Mon–Sat, 9 AM – 6 PM IST",
  },
  {
    id: 81,
    category: "Technical Support",
    keywords: [
      "bug",
      "report issue",
      "error",
      "glitch",
      "problem with app",
      "technical problem",
      "report bug",
    ],
    question: "How do I report a bug?",
    answer:
      "Help & Support → <b>Report a Problem</b> → Describe issue + attach screenshot → Submit ⏱️ Response in 24–48 hours.",
  },
  {
    id: 82,
    category: "Technical Support",
    keywords: [
      "browser",
      "compatible browser",
      "which browser",
      "chrome firefox",
      "browser issue",
    ],
    question: "Which browsers are supported?",
    answer:
      "✅ Chrome (v90+) | ✅ Firefox (v88+) | ✅ Edge (v90+) | ✅ Safari (v14+)<br>💡 Best: Latest Chrome<br>❌ IE not supported.",
  },
  {
    id: 83,
    category: "Technical Support",
    keywords: [
      "session expired",
      "logged out automatically",
      "timeout",
      "session",
      "auto logout",
    ],
    question: "Why was I automatically logged out?",
    answer:
      "Auto-logout after <b>30 minutes of inactivity</b> to protect your data. Enable <b>'Remember Me'</b> at login on personal devices.",
  },
  {
    id: 84,
    category: "Health Records",
    keywords: [
      "types of records",
      "what records",
      "record categories",
      "documents stored",
      "health record types",
    ],
    question: "What types of health records are stored?",
    answer:
      "💊 Prescriptions | 🧪 Lab reports | 🩻 X-rays/scans | 🏥 Discharge summaries | 💉 Vaccination records | 📝 Doctor notes | ⚠️ Allergies | 🗓️ Surgical history",
  },
  {
    id: 85,
    category: "Health Records",
    keywords: [
      "download records",
      "export health records",
      "save records",
      "print records",
      "get my records",
    ],
    question: "Can I download my health records?",
    answer:
      "Health Records → Select records → <b>Download / Export as PDF</b> 📄 Digitally signed for authenticity.",
  },
  {
    id: 86,
    category: "Health Records",
    keywords: [
      "wrong record",
      "incorrect data",
      "error in record",
      "fix health record",
      "mistake in record",
    ],
    question: "What if my health records have an error?",
    answer:
      "Health Records → Find entry → <b>Report Error</b> → Describe error → Hospital/doctor notified to correct it. Contact support if unresolved in 48 hours.",
  },
  {
    id: 87,
    category: "Health Records",
    keywords: [
      "vaccination",
      "vaccine record",
      "immunisation",
      "covid vaccine",
      "vaccine certificate",
      "vaccination history",
    ],
    question: "Can I store vaccination records?",
    answer:
      "Yes! Hospitals add after administering, or upload via <b>Health Records → Vaccinations</b>. Includes: vaccine name, date, dose, facility.",
  },
  {
    id: 88,
    category: "Health Records",
    keywords: [
      "how long records kept",
      "records duration",
      "record retention",
      "old records",
      "data retention",
    ],
    question: "How long are health records kept?",
    answer:
      "As long as your account is active. After deletion, anonymised records kept for <b>minimum 7 years</b> per medical regulations.",
  },
  {
    id: 89,
    category: "Appointments",
    keywords: [
      "appointment reminder",
      "remind appointment",
      "forget appointment",
      "reminder",
    ],
    question: "Will I get appointment reminders?",
    answer:
      "Yes!<br>📅 <b>24 hours before</b> – Email + SMS<br>🔔 <b>1 hour before</b> – In-app notification<br>Set custom times in Notification Settings.",
  },
  {
    id: 90,
    category: "Appointments",
    keywords: [
      "appointment fee",
      "consultation charge",
      "payment",
      "cost appointment",
      "fees",
      "how much",
    ],
    question: "Is there a fee for booking appointments?",
    answer:
      "Platform booking is free. Hospitals set their own <b>consultation fees</b> — shown before confirming.<br>💳 UPI | Card | Net Banking",
  },
  {
    id: 91,
    category: "Appointments",
    keywords: [
      "online consultation",
      "video call doctor",
      "telemedicine",
      "virtual appointment",
      "video doctor",
    ],
    question: "Can I have an online video consultation?",
    answer:
      "Yes! Book with <b>Video Consult</b> option → Join via link at appointment time → Prescription uploaded digitally after consult 🎥",
  },
  {
    id: 92,
    category: "Appointments",
    keywords: [
      "no slot",
      "slot not available",
      "full booking",
      "doctor busy",
      "no appointment available",
      "fully booked",
    ],
    question: "What if there are no available slots?",
    answer:
      "🔔 Click <b>Notify Me</b> on doctor's page<br>📅 Try different dates<br>🏥 Search same specialty at another hospital<br>🚨 Urgent? Use emergency services.",
  },
  {
    id: 93,
    category: "Appointments",
    keywords: [
      "find specialist",
      "search specialty",
      "cardiologist",
      "dermatologist",
      "specialty",
      "doctor type",
      "specialist",
    ],
    question: "How do I find a doctor by specialisation?",
    answer:
      "Find Doctor → Filters → Select <b>Specialisation</b> (Cardiologist, Dermatologist, Paediatrician, etc.) → See available doctors → Book!",
  },
  {
    id: 94,
    category: "Appointments",
    keywords: [
      "appointment history",
      "past appointments",
      "old appointments",
      "previous visits",
      "past visits",
    ],
    question: "Where can I see past appointments?",
    answer:
      "My Appointments → <b>History</b> tab<br>Shows: Date | Doctor | Hospital | Outcome | Associated prescriptions",
  },
  {
    id: 95,
    category: "Appointments",
    keywords: [
      "waiting time",
      "how long wait",
      "queue",
      "wait at hospital",
      "current wait",
    ],
    question: "Can I see estimated waiting time?",
    answer:
      "Yes! Hospital page shows <b>current estimated wait time</b> — updated in real time by staff 🕐",
  },
  {
    id: 96,
    category: "General System",
    keywords: [
      "api",
      "integration",
      "connect system",
      "third party",
      "external system",
      "integrate",
    ],
    question: "Can the system integrate with other platforms?",
    answer:
      "Yes! APIs for:<br>🏥 Ayushman Bharat | 🧪 Labs | 💊 Pharmacies | 🛡️ Insurance | 📋 EHR systems<br>Hospitals request access through Authority.",
  },
  {
    id: 97,
    category: "General System",
    keywords: [
      "update",
      "new features",
      "release",
      "version",
      "upgrade",
      "latest",
    ],
    question: "How do I know about new features?",
    answer:
      "🔔 In-app notifications | 📧 Email newsletter | 📢 Authority announcements | 📋 Help / About → Release notes | 📱 App auto-updates",
  },
  {
    id: 98,
    category: "Authority Panel",
    keywords: [
      "policy",
      "system policy",
      "authority policy",
      "health policy",
      "set policy",
    ],
    question: "Can the Authority set system-wide policies?",
    answer:
      "Yes! Set & publish:<br>💰 Fee caps | 📋 Data retention | 🚨 Emergency standards | 🏥 Registration requirements | ⚖️ Usage guidelines<br>All hospitals must comply.",
  },
  {
    id: 99,
    category: "Citizen Features",
    keywords: [
      "upload",
      "document",
      "report",
      "file",
      "add document",
      "upload file",
      "upload record",
    ],
    question: "Can I upload my own health documents?",
    answer:
      "Yes! Health Records → <b>Upload Document</b> → Select type → Upload (PDF/JPG/PNG, max 10MB) → Save 🔒 Shareable anytime.",
  },
  {
    id: 100,
    category: "Emergency Services",
    keywords: [
      "emergency history",
      "past emergency",
      "emergency records",
      "past sos",
      "previous emergency",
    ],
    question: "Can I view my past emergency requests?",
    answer:
      "Yes! Dashboard → <b>Emergency History</b>: Date | Type | Response time | Hospital | Follow-up records",
  },
  {
    id: 101,
    category: "General System",
    keywords: [
      "what are you",
      "who are you",
      "chatbot",
      "ai assistant",
      "this bot",
      "about you",
    ],
    question: "What are you?",
    answer:
      "I'm the <b>Smart Health Care AI Assistant</b> — trained on 105 Q&A pairs across 7 categories to help Citizens, Hospitals, and Authorities navigate the system! 🏥",
  },
  {
    id: 102,
    category: "General System",
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good evening",
      "greetings",
      "namaste",
    ],
    question: "Hello!",
    answer:
      "Hello! 👋 Welcome to the Smart Health Care System!<br><br>I can help with:<br>🗓️ Appointments | 📋 Health Records | 🚨 Emergency | 🔐 Login | 🏥 Hospitals<br><br>What can I help you with today?",
  },
  {
    id: 103,
    category: "General System",
    keywords: ["thank you", "thanks", "thank", "appreciate", "helpful"],
    question: "Thank you!",
    answer:
      "You're welcome! 😊 Feel free to ask anything else about the Smart Health Care System anytime! 🏥",
  },
  {
    id: 104,
    category: "General System",
    keywords: [
      "help",
      "what can you do",
      "options",
      "guide me",
      "show options",
      "capabilities",
    ],
    question: "What can you help me with?",
    answer:
      "I can help with:<br>👤 <b>Citizen</b>: Appointments, records, emergency, profile<br>🏨 <b>Hospital</b>: Patients, billing, analytics<br>🏛️ <b>Authority</b>: Approvals, reports, policies<br>🔐 <b>Account</b>: Login, register, 2FA<br>🚨 <b>Emergency</b>: SOS, ambulance, tracking",
  },
  {
    id: 105,
    category: "Citizen Features",
    keywords: [
      "health tracker",
      "log health",
      "daily readings",
      "monitor health",
      "track vitals",
    ],
    question: "How do I use the health tracker?",
    answer:
      "Dashboard → <b>Health Tracker</b>:<br>1️⃣ Select metric (BP, glucose, weight, etc.)<br>2️⃣ Enter reading + date<br>3️⃣ Charts auto-update<br>4️⃣ Share with doctor during consultations 📊",
  },
];

const ROLE_SUGGESTIONS = {
  citizen: [
    "Book appointment",
    "View health records",
    "Emergency SOS",
    "Reset password",
    "Add family members",
    "Track blood pressure",
  ],
  hospital: [
    "Update patient data",
    "Manage appointments",
    "Upload lab reports",
    "Add a doctor",
    "Hospital analytics",
    "Discharge patient",
  ],
  authority: [
    "Authority access",
    "Approve hospital",
    "Generate reports",
    "Disease surveillance",
    "Broadcast announcements",
    "Suspend hospital",
  ],
  general: [
    "What is this system?",
    "How to register?",
    "Is it free?",
    "Contact support",
    "Mobile app?",
    "Data privacy",
  ],
};

const CAT_COLORS = {
  "General System": "#00d4ff",
  "Login & Register": "#a78bfa",
  "Citizen Features": "#34d399",
  "Hospital Dashboard": "#fb923c",
  "Authority Panel": "#f472b6",
  "Emergency Services": "#f87171",
  "Data Privacy & Security": "#facc15",
  "Role-Based Access": "#60a5fa",
  "Profile Management": "#4ade80",
  "Health Records": "#38bdf8",
  Appointments: "#c084fc",
  "Technical Support": "#94a3b8",
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "was",
  "can",
  "how",
  "what",
  "why",
  "who",
  "does",
  "did",
  "will",
  "you",
  "your",
  "this",
  "that",
  "with",
  "have",
  "from",
  "not",
  "its",
  "into",
  "they",
  "their",
  "when",
  "where",
  "which",
  "there",
  "been",
  "but",
  "get",
  "use",
  "has",
  "had",
  "may",
  "about",
  "also",
]);

function tokenise(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

function scorePair(query, pair, role) {
  const qTokens = tokenise(query).filter((t) => !STOP_WORDS.has(t));
  if (!qTokens.length) return 0;
  let score = 0;
  const qL = query.toLowerCase();
  if (
    qL.includes(pair.question.toLowerCase()) ||
    pair.question.toLowerCase().includes(qL)
  )
    score += 60;
  for (const kw of pair.keywords)
    if (qL.includes(kw)) score += kw.split(" ").length > 1 ? 20 : 12;
  const qT = tokenise(pair.question).filter((t) => !STOP_WORDS.has(t));
  const aT = tokenise(pair.answer).filter((t) => !STOP_WORDS.has(t));
  for (const t of qTokens) {
    if (qT.includes(t)) score += 8;
    else if (aT.includes(t)) score += 2;
    else
      for (const q2 of qT)
        if (q2.includes(t) || t.includes(q2)) {
          score += 4;
          break;
        }
  }
  const catMap = {
    citizen: [
      "Citizen Features",
      "Appointments",
      "Health Records",
      "Emergency Services",
    ],
    hospital: ["Hospital Dashboard", "Appointments", "Emergency Services"],
    authority: ["Authority Panel", "General System"],
    general: [
      "General System",
      "Login & Register",
      "Technical Support",
      "Data Privacy & Security",
      "Profile Management",
      "Role-Based Access",
    ],
  };
  if (catMap[role]?.includes(pair.category)) score += 5;
  return score;
}

function findBestMatch(query, role) {
  const results = QA_DATASET.map((p) => ({
    pair: p,
    score: scorePair(query, p, role),
  })).sort((a, b) => b.score - a.score);
  return results[0].score >= 10 ? results[0] : null;
}

function getRelatedSuggestions(query) {
  const qT = tokenise(query);
  return QA_DATASET.filter((p) =>
    qT.some((t) => p.keywords.some((k) => k.includes(t))),
  )
    .slice(0, 3)
    .map((p) => p.question);
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&display=swap');
.shcb *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',sans-serif;}
.shcb-btn{position:fixed;bottom:28px;right:28px;width:58px;height:58px;border-radius:50%;background:#ffffff;border:2px solid #000000;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 20px rgba(0,0,0,.15);z-index:9999;transition:transform .2s,box-shadow .2s;}
.shcb-btn:hover{transform:scale(1.07);box-shadow:0 6px 28px rgba(0,0,0,.25);}
.shcb-btn:active{transform:scale(.96);}
.shcb-badge{position:absolute;top:-2px;right:-2px;width:18px;height:18px;background:#EF4444;border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;}
.shcb-win{position:fixed;bottom:100px;right:28px;width:380px;height:580px;background:#fff;border:1px solid #E5E7EB;border-radius:20px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.12);z-index:9998;transform-origin:bottom right;animation:shcb-open .2s cubic-bezier(.16,1,.3,1) forwards;}
.shcb-win.closing{animation:shcb-close .16s ease-in forwards;}
@keyframes shcb-open{from{opacity:0;transform:scale(.75) translateY(16px);}to{opacity:1;transform:scale(1) translateY(0);}}
@keyframes shcb-close{from{opacity:1;transform:scale(1);}to{opacity:0;transform:scale(.75) translateY(16px);}}
.shcb-hdr{background:#fff;border-bottom:1px solid #F3F4F6;padding:14px 16px;display:flex;align-items:center;gap:10px;flex-shrink:0;}
.shcb-logo{width:38px;height:38px;border-radius:10px;background:#EFF6FF;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
.shcb-ht{font-family:'Manrope',sans-serif;font-weight:700;font-size:.9rem;color:#111827;}
.shcb-hs{font-size:.7rem;color:#9CA3AF;margin-top:1px;}
.shcb-online{display:flex;align-items:center;gap:5px;margin-left:auto;}
.shcb-dot{width:7px;height:7px;border-radius:50%;background:#22C55E;animation:shcb-blink 1.5s infinite;}
@keyframes shcb-blink{0%,100%{opacity:1;}50%{opacity:.3;}}
.shcb-online span{font-size:.7rem;color:#22C55E;font-weight:500;}
.shcb-x{background:none;border:none;color:#9CA3AF;width:28px;height:28px;border-radius:8px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0;}
.shcb-x:hover{background:#F3F4F6;color:#374151;}
.shcb-roles{padding:8px 12px 7px;display:flex;gap:6px;background:#FAFAFA;border-bottom:1px solid #F3F4F6;flex-shrink:0;overflow-x:auto;scrollbar-width:none;}
.shcb-roles::-webkit-scrollbar{display:none;}
.shcb-role{padding:4px 12px;border-radius:20px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:.73rem;font-weight:500;cursor:pointer;transition:all .15s;white-space:nowrap;}
.shcb-role.active{background:#EFF6FF;border-color:#2563EB;color:#2563EB;font-weight:600;}
.shcb-role:hover:not(.active){border-color:#D1D5DB;color:#374151;}
.shcb-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;background:#FAFAFA;}
.shcb-msgs::-webkit-scrollbar{width:3px;}
.shcb-msgs::-webkit-scrollbar-thumb{background:#E5E7EB;border-radius:4px;}
.shcb-msg{display:flex;gap:8px;animation:shcb-fi .2s ease;}
@keyframes shcb-fi{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:translateY(0);}}
.shcb-msg.user{flex-direction:row-reverse;}
.shcb-av{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
.shcb-av.bot{background:#EFF6FF;}
.shcb-av.user{background:#F3E8FF;}
.shcb-bbl{max-width:80%;padding:10px 13px;border-radius:14px;font-size:.82rem;line-height:1.6;}
.shcb-msg.bot .shcb-bbl{background:#fff;border:1px solid #E5E7EB;border-radius:4px 14px 14px 14px;color:#1F2937;box-shadow:0 1px 3px rgba(0,0,0,.04);}
.shcb-msg.user .shcb-bbl{background:#2563EB;border-radius:14px 4px 14px 14px;color:#fff;}
.shcb-cat{display:inline-block;font-size:.62rem;border-radius:4px;padding:2px 7px;margin-bottom:5px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;}
.shcb-mq{font-size:.7rem;color:#9CA3AF;margin-bottom:4px;font-style:italic;}
.shcb-cbar{height:2px;background:#F3F4F6;border-radius:2px;margin-top:8px;overflow:hidden;}
.shcb-cfill{height:100%;border-radius:2px;background:#2563EB;transition:width .5s;}
.shcb-clbl{font-size:.62rem;color:#9CA3AF;margin-top:3px;}
.shcb-td{display:flex;gap:4px;align-items:center;}
.shcb-td span{width:6px;height:6px;border-radius:50%;background:#2563EB;animation:shcb-bounce 1.2s infinite;}
.shcb-td span:nth-child(2){animation-delay:.2s;opacity:.6;}
.shcb-td span:nth-child(3){animation-delay:.4s;opacity:.3;}
@keyframes shcb-bounce{0%,80%,100%{transform:scale(.75);}40%{transform:scale(1.2);}}
.shcb-sugg{margin-top:7px;}
.shcb-sugg-lbl{font-size:.7rem;color:#9CA3AF;margin-bottom:4px;}
.shcb-sugg-btn{display:inline-block;padding:3px 9px;border-radius:6px;border:1px solid #E5E7EB;background:#F9FAFB;color:#374151;font-size:.73rem;margin:2px;cursor:pointer;transition:all .15s;}
.shcb-sugg-btn:hover{background:#EFF6FF;border-color:#2563EB;color:#2563EB;}
.shcb-chips{padding:7px 12px 6px;display:flex;gap:5px;flex-wrap:nowrap;overflow-x:auto;background:#fff;border-bottom:1px solid #F3F4F6;flex-shrink:0;scrollbar-width:none;}
.shcb-chips::-webkit-scrollbar{display:none;}
.shcb-chip{padding:4px 10px;border-radius:14px;border:1.5px solid #E5E7EB;background:#fff;color:#6B7280;font-size:.71rem;cursor:pointer;transition:all .15s;white-space:nowrap;flex-shrink:0;}
.shcb-chip:hover{border-color:#2563EB;color:#2563EB;background:#EFF6FF;}
.shcb-inp-row{padding:10px 12px;border-top:1px solid #F3F4F6;background:#fff;display:flex;gap:8px;align-items:center;flex-shrink:0;}
.shcb-inp{flex:1;background:#F9FAFB;border:1.5px solid #E5E7EB;border-radius:10px;padding:9px 13px;color:#111827;font-size:.82rem;outline:none;transition:border-color .2s;}
.shcb-inp::placeholder{color:#9CA3AF;}
.shcb-inp:focus{border-color:#2563EB;background:#fff;}
.shcb-send{width:38px;height:38px;border-radius:10px;border:none;background:#2563EB;color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:transform .15s,background .15s;flex-shrink:0;}
.shcb-send:hover{background:#1D4ED8;transform:scale(1.05);}
.shcb-send:active{transform:scale(.95);}
@media(max-width:480px){.shcb-win{width:calc(100vw - 20px);right:10px;bottom:86px;height:72vh;}.shcb-btn{bottom:16px;right:16px;}}
`;

function SmartHealthChatbot() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [role, setRole] = useState("citizen");
  const [messages, setMessages] = useState([
    {
      id: 0,
      type: "bot",
      html: `👋 <b>Welcome to Smart Health Care!</b><br/><br/>I am your AI Assistant. How can I help you today?`,
    },
  ]);
  const [typing, setTyping] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [unread, setUnread] = useState(0);
  const msgsRef = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  useEffect(() => {
    if (msgsRef.current)
      msgsRef.current.scrollTop = msgsRef.current.scrollHeight;
  }, [messages, typing]);

  const closeChat = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 180);
  };

  const send = (text) => {
    const q = (text || inputVal).trim();
    if (!q) return;
    setInputVal("");
    setMessages((prev) => [...prev, { id: Date.now(), type: "user", html: q }]);
    setTyping(true);
    setTimeout(
      () => {
        setTyping(false);
        const res = findBestMatch(q, role);
        let html;
        if (!res) {
          const sugg = getRelatedSuggestions(q);
          html = `<span style="color:#ffb347;">🤔 I don't have a specific answer for that yet.</span>
${sugg.length ? `<div class="shcb-sugg"><div class="shcb-sugg-lbl">💡 Did you mean:</div>${sugg.map((s) => `<button class="shcb-sugg-btn" data-q="${s}">→ ${s}</button>`).join("")}</div>` : ""}
<br/><small style="color:#3a6080">📧 support@smarthealthcare.in</small>`;
        } else {
          html = `${res.pair.answer}`;
        }
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, type: "bot", html },
        ]);
        if (!open) setUnread((u) => u + 1);
      },
      600 + Math.random() * 400,
    );
  };

  const handleClick = (e) => {
    if (e.target.dataset.q) send(e.target.dataset.q);
  };

  return (
    <div className="shcb">
      <button
        className="shcb-btn"
        onClick={
          open
            ? closeChat
            : () => {
                setOpen(true);
                setClosing(false);
                setUnread(0);
              }
        }
      >
        {open ? (
          "✕"
        ) : (
          <img
            src="/logo-transparent.png"
            alt="Arogya360 Logo"
            style={{
              height: "40px", // Adjusted to fit the 58px button
              objectFit: "contain",
            }}
          />
        )}
        {!open && unread > 0 && <div className="shcb-badge">{unread}</div>}
      </button>
      {open && (
        <div className={`shcb-win${closing ? " closing" : ""}`}>
          <div className="shcb-hdr">
            <div className="shcb-logo">🏥</div>
            <div>
              <h3
                style={{
                  fontSize: "1.15rem",
                  fontWeight: "700",
                  color: "#111827",
                  margin: "0 0 4px 0",
                }}
              >
                AI Assistant
              </h3>
              <p style={{ fontSize: "0.85rem", color: "#6b7280", margin: "0" }}>
                General guidance & support
              </p>
            </div>
            <button
              className="shcb-x"
              onClick={closeChat}
              style={{ marginLeft: "auto" }}
            >
              ✕
            </button>
          </div>
          <div className="shcb-msgs" ref={msgsRef} onClick={handleClick}>
            {messages.map((m) => (
              <div key={m.id} className={`shcb-msg ${m.type}`}>
                <div className={`shcb-av ${m.type}`}>
                  {m.type === "bot" ? "🏥" : "👤"}
                </div>
                <div
                  className="shcb-bbl"
                  dangerouslySetInnerHTML={{ __html: m.html }}
                />
              </div>
            ))}
            {typing && (
              <div className="shcb-msg bot">
                <div className="shcb-av bot">🏥</div>
                <div className="shcb-bbl">
                  <div className="shcb-td">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="shcb-inp-row">
            <input
              className="shcb-inp"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask anything about Smart Health Care…"
              autoComplete="off"
            />
            <button className="shcb-send" onClick={() => send()}>
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const ProtectedRoute = ({ children, allowedRole }) => {
  const isAuth = localStorage.getItem("isAuth");
  const role = localStorage.getItem("role");

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and it doesn't match
  if (allowedRole && role !== allowedRole) {
    if (role === "citizen") return <Navigate to="/citizen" replace />;
    if (role === "hospital") return <Navigate to="/hospital" replace />;
    if (role === "authority") return <Navigate to="/authority" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default function App() {
  useEffect(() => {
    fetch("https://tera-app.onrender.com/api/hello")
      .then((res) => res.json())
      .then((data) => console.log(data.message));
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/hirkani" element={<Hirkani />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hospital"
            element={
              <ProtectedRoute allowedRole="hospital">
                <Layout>
                  <Hospital />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRole="authority">
                <Layout>
                  <Authority />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/authority/feedback"
            element={
              <ProtectedRoute allowedRole="authority">
                <Layout>
                  <AuthorityFeedback />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>

      {/* ✅ Chatbot — सगळ्यात शेवटी, App च्या बाहेर दिसेल */}
      <SmartHealthChatbot />
    </>
  );
}
