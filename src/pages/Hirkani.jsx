import { useState, useRef, useEffect } from 'react'
import Navbar from '../components/Navbar'

const pregnancyData = [
  {
    month: 1,
    title: "Mahina 1 / Month 1 (Weeks 1-4)",
    todo: ["Visit a nearby municipal clinic to confirm pregnancy", "Start taking prescribed Folic Acid daily", "Rest well and drink plenty of water"],
    eat: ["Fresh fruits and green vegetables", "Milk and dairy products", "Home-cooked warm meals"],
    exercise: ["Very light walking for 15-20 mins daily", "Basic deep breathing"],
    notTodo: ["Do NOT take any medicine without a doctor's advice", "Avoid lifting heavy weights like water buckets", "Avoid long stressful travel"],
    warning: ["Severe spotting or bleeding", "Extreme lower stomach pain", "Severe dizziness"]
  },
  {
    month: 2,
    title: "Mahina 2 / Month 2 (Weeks 5-8)",
    todo: ["Get your first ultrasound (Sonography) done", "Register your pregnancy for the Govt Health Card", "Wear comfortable, loose cotton clothes"],
    eat: ["Iron-rich foods like spinach and jaggery (Gul)", "Protein-rich diet like dal and eggs", "Nuts and seeds"],
    exercise: ["Regular slow walking inside the house or park", "Gentle stretching"],
    notTodo: ["Avoid eating raw or undercooked meat and eggs", "Do NOT skip meals", "Avoid spicy outside food"],
    warning: ["Continuous vomiting (if you can't keep food down)", "Fever above 100°F", "Burning sensation while passing urine"]
  },
  {
    month: 3,
    title: "Mahina 3 / Month 3 (Weeks 9-13)",
    todo: ["Get routine blood and urine tests done at the clinic", "Drink at least 8-10 glasses of clean water", "Keep ASHA worker's contact number handy"],
    eat: ["Calcium-rich foods like milk and yogurt", "Citrus fruits (Lemon, Orange) for Vitamin C", "Well-cooked home food"],
    exercise: ["Pregnancy safe yoga (only under guidance)"],
    notTodo: ["Do NOT sleep on your stomach", "Avoid hot water baths", "Do not self-medicate for headaches"],
    warning: ["Vaginal bleeding or unusual discharge", "Severe constant headaches", "Blurred vision"]
  },
  {
    month: 4,
    title: "Mahina 4 / Month 4 (Weeks 14-17)",
    todo: ["Start Iron and Calcium supplements given by doctor", "Start sleeping on your left side", "Get the Anomaly Scan done"],
    eat: ["Fiber-rich foods (Oats, Dal) to avoid constipation", "Fresh fruit juices without added sugar", "Green leafy vegetables"],
    exercise: ["Brisk walking", "Pelvic floor exercises"],
    notTodo: ["Do NOT skip your daily supplements", "Avoid completely eating junk or street food", "Avoid standing for very long periods"],
    warning: ["Bleeding or fluid leaking", "Severe swelling in hands or face", "No weight gain"]
  },
  {
    month: 5,
    title: "Mahina 5 / Month 5 (Weeks 18-22)",
    todo: ["Notice your baby's first movements", "Wear flat and supportive footwear", "Take Tetanus (TT) vaccine at the clinic"],
    eat: ["Variety of lentils (Dals)", "Milk and ghee in moderation", "Seasonal local fruits"],
    exercise: ["Light household chores are okay (no lifting)", "Prenatal yoga"],
    notTodo: ["Avoid sitting with crossed legs for long", "Do NOT ignore any infections", "Avoid cleaning pet areas"],
    warning: ["Absence of baby movement after 22 weeks", "Pain during urination", "Sudden gush of fluid"]
  },
  {
    month: 6,
    title: "Mahina 6 / Month 6 (Weeks 23-27)",
    todo: ["Monitor your weight gain", "Get a Glucose test done (for Sugar/Diabetes)", "Moisturize your belly to reduce itching"],
    eat: ["Small, frequent meals to avoid acidity", "Plenty of water", "Foods rich in Omega-3"],
    exercise: ["Walking", "Meditation and relaxing breathing"],
    notTodo: ["Avoid lying flat on your back", "Do not eat highly spicy or oily foods", "Avoid sudden jerky movements"],
    warning: ["Frequent stomach tightening (contractions)", "Vaginal bleeding", "Extreme swelling in legs/ankles"]
  },
  {
    month: 7,
    title: "Mahina 7 / Month 7 (Weeks 28-31)",
    todo: ["Keep track of baby's kicks every day", "Pack a hospital bag with clothes for you and baby", "Decide on your nearest Municipal Maternity Hospital"],
    eat: ["Light dinners", "Iron and Vitamin C combos", "Dry fruits like soaked almonds"],
    exercise: ["Gentle walking", "Deep breathing exercises"],
    notTodo: ["Avoid traveling long distances", "Stop heavy household work like washing large clothes", "Avoid stress and anxiety"],
    warning: ["Decreased baby movements (less than 10 kicks in 2 hours)", "Water breaking", "Severe abdominal pain"]
  },
  {
    month: 8,
    title: "Mahina 8 / Month 8 (Weeks 32-35)",
    todo: ["Visit the doctor every 2 weeks now", "Ensure all medical reports are safe in one folder", "Discuss birth plan with the doctor or nurse"],
    eat: ["Easily digestible foods", "Soups and purees", "Adequate hydration"],
    exercise: ["Very light walking", "Pelvic stretches"],
    notTodo: ["Avoid completely stopping physical activity", "Avoid wearing tight clothes", "Do not ignore any bodily changes"],
    warning: ["Constant back pain", "Rhythmic cramping", "Leaking of thin, clear fluid"]
  },
  {
    month: 9,
    title: "Mahina 9 / Month 9 (Weeks 36-40)",
    todo: ["Weekly doctor visits are necessary", "Keep emergency transport/ambulance number ready", "Rest and save energy for delivery"],
    eat: ["Energy-giving foods (Dates, bananas)", "Light, frequent meals", "Plenty of warm fluids"],
    exercise: ["Short, slow walks", "Breathing techniques for labor"],
    notTodo: ["Do NOT travel outside your city/village", "Do not panic when false labor pain starts", "Do NOT stay alone for long periods"],
    warning: ["Water breaks (amniotic fluid leak)", "Regular painful contractions (every 5-10 mins)", "Noticeable drop in baby's movements"]
  }
];

export default function Hirkani() {
  const [activeMonth, setActiveMonth] = useState(1);
  const [chatMsg, setChatMsg] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'bot', text: 'Namaste! I am the Hirkani AI Assistant. You can ask me general questions about pregnancy, diet, or municipal hospital rules.' }
  ]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const generateResponse = (message) => {
    const msg = message.toLowerCase();
    
    if (msg.includes('bleed') || msg.includes('rakta') || msg.includes('spotting')) {
      return "⚠️ This could be a danger sign. Please visit your nearest hospital or municipal clinic immediately.";
    }
    if (msg.includes('pain') || msg.includes('dukht') || msg.includes('potat') || msg.includes('cramp') || msg.includes('trass')) {
      return "Mild pain or stretching is common, but severe pain means you need to consult a doctor. Try resting and lying on your left side.";
    }
    if (msg.includes('vomit') || msg.includes('ulti') || msg.includes('nausea') || msg.includes('malamal') || msg.includes('chakkr')) {
      return "Morning sickness is very common. Eat small, frequent meals and stay hydrated. Drink ginger tea. If you can't keep food down and vomit continuously, see a doctor.";
    }
    if (msg.includes('food') || msg.includes('diet') || msg.includes('eat') || msg.includes('khau') || msg.includes('jevan') || msg.includes('aahar')) {
      return "Eat a balanced diet! Include green leafy vegetables, lentils (dal), milk, eggs, and completely cooked food. Avoid raw papaya, raw meat, and outside junk food.";
    }
    if (msg.includes('water') || msg.includes('pani') || msg.includes('tahan')) {
      return "Please drink at least 8-10 glasses of clean, filtered water every day. This helps maintain fluid levels around the baby and prevents infections.";
    }
    if (msg.includes('movement') || msg.includes('halchal') || msg.includes('kick')) {
      return "Baby movements usually start around month 4 or 5. By month 7, you should track movements daily. If you notice a drastic decrease in baby kicks, contact your clinic.";
    }
    if (msg.includes('travel') || msg.includes('pravas') || msg.includes('gaavi')) {
      return "Short travel is okay. Attempt to avoid long, bumpy rides. If you travel, take frequent breaks to stretch your legs. Always carry your medical file with you.";
    }
    if (msg.includes('sleep') || msg.includes('jhop')) {
      return "Aim for 8 hours of sleep at night and 2 hours of rest in the afternoon. Sleeping on your left side is highly recommended as it improves blood flow to the baby.";
    }
    if (msg.includes('medicine') || msg.includes('goli') || msg.includes('aushadh') || msg.includes('iron') || msg.includes('calcium')) {
      return "Take your prescribed Folic Acid, Iron, and Calcium supplements regularly. Do NOT take any unprescribed medicine or painkillers on your own.";
    }
    if (msg.includes('fever') || msg.includes('taap') || msg.includes('garam') || msg.includes('sardi')) {
      return "Do not self-medicate for a fever during pregnancy. Please consult a doctor immediately for safe treatment.";
    }
    
    return "Thank you! For more details, please read the month-by-month guide above. If you have a specific medical concern, please consult a doctor or your ASHA worker.";
  };

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const currentMsg = chatMsg;
    const newHistory = [...chatHistory, { role: 'user', text: currentMsg }];
    setChatHistory(newHistory);
    setChatMsg('');
    
    // Simulate thinking delay
    setTimeout(() => {
      const botResponse = generateResponse(currentMsg);
      setChatHistory(prev => [...prev, { role: 'bot', text: botResponse }]);
    }, 800);
  };

  const currentData = pregnancyData.find(d => d.month === activeMonth);

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: '#f4f7f9', minHeight: '100vh', paddingTop: '70px', fontFamily: '"Inter", "Segoe UI", sans-serif', color: '#334155' }}>
        
        {/* Header Section */}
        <div style={{ backgroundColor: '#ffffff', padding: '60px 20px 40px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#111827', margin: '0 0 16px 0', letterSpacing: '-0.025em' }}>
            <span style={{ fontSize: '2.2rem', marginRight: '10px' }}>👶</span> 
            <span style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>HIRKANI</span> Care Corner
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#6b7280', maxWidth: '700px', margin: '0 auto', lineHeight: '1.6' }}>
            Free Municipal Maternity Awareness Portal. A month-by-month guide to ensure a safe and healthy pregnancy for you and your baby. No login required.
          </p>
        </div>

        <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px', display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Main Content Area */}
          <div style={{ flex: '1 1 750px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Modern Pill Tabs */}
            <div style={{ padding: '8px', background: '#ffffff', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)', border: '1px solid #f3f4f6', overflowX: 'auto' }}>
              <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content' }}>
                {pregnancyData.map((data) => (
                  <button
                    key={data.month}
                    onClick={() => setActiveMonth(data.month)}
                    style={{
                      padding: '12px 24px', 
                      borderRadius: '10px',
                      border: 'none', 
                      background: activeMonth === data.month ? '#f43f5e' : 'transparent',
                      color: activeMonth === data.month ? '#ffffff' : '#6b7280', 
                      fontWeight: '600', 
                      fontSize: '1rem', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: activeMonth === data.month ? '0 4px 6px -1px rgba(244, 63, 94, 0.2)' : 'none'
                    }}
                    onMouseOver={(e) => { if(activeMonth !== data.month) e.currentTarget.style.background = '#f3f4f6' }}
                    onMouseOut={(e) => { if(activeMonth !== data.month) e.currentTarget.style.background = 'transparent' }}
                  >
                    Month {data.month}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Month Content Card */}
            <div style={{ background: '#ffffff', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)', border: '1px solid #f3f4f6' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1f2937', margin: '0 0 32px 0', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
                {currentData.title}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
                
                {/* DOs Section */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #10b981', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#d1fae5', borderRadius: '8px', fontSize: '1rem' }}>✅</span> 
                    What to Do (काय करावे)
                  </h3>
                  <ul style={{ paddingLeft: '0', margin: '0', listStyle: 'none', color: '#4b5563', lineHeight: '1.6' }}>
                    {currentData.todo.map((item, i) => (
                      <li key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#10b981', marginTop: '2px' }}>•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* DONTs Section */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #ef4444', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#fee2e2', borderRadius: '8px', fontSize: '1rem' }}>❌</span> 
                    What NOT to Do (काय टाळावे)
                  </h3>
                  <ul style={{ paddingLeft: '0', margin: '0', listStyle: 'none', color: '#4b5563', lineHeight: '1.6' }}>
                    {currentData.notTodo.map((item, i) => (
                      <li key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#ef4444', marginTop: '2px' }}>•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* EAT Section */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #f59e0b', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#fef3c7', borderRadius: '8px', fontSize: '1rem' }}>🍲</span> 
                    Diet & Food (आहार)
                  </h3>
                  <ul style={{ paddingLeft: '0', margin: '0', listStyle: 'none', color: '#4b5563', lineHeight: '1.6' }}>
                    {currentData.eat.map((item, i) => (
                      <li key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#f59e0b', marginTop: '2px' }}>•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* EXERCISE Section */}
                <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e5e7eb', borderTop: '4px solid #3b82f6', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '600', color: '#111827', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#dbeafe', borderRadius: '8px', fontSize: '1rem' }}>🧘‍♀️</span> 
                    Safe Exercise (व्यायाम)
                  </h3>
                  <ul style={{ paddingLeft: '0', margin: '0', listStyle: 'none', color: '#4b5563', lineHeight: '1.6' }}>
                    {currentData.exercise.map((item, i) => (
                      <li key={i} style={{ marginBottom: '12px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <span style={{ color: '#3b82f6', marginTop: '2px' }}>•</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* WARNING Section - Full Width */}
                <div style={{ background: '#fff1f2', padding: '24px', borderRadius: '16px', border: '1px solid #ffe4e6', gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#be123c', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', background: '#ffe4e6', borderRadius: '8px', fontSize: '1rem' }}>⚠️</span> 
                    Danger Signs / Consult Doctor Immediately (धोक्याची चिन्हे)
                  </h3>
                  <div style={{ paddingLeft: '42px' }}>
                    <ul style={{ paddingLeft: '0', margin: '0', listStyle: 'none', color: '#9f1239', lineHeight: '1.6', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                      {currentData.warning.map((item, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                          <span style={{ color: '#e11d48', marginTop: '2px' }}>•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Sidebar Area (AI Assistant & SOS) */}
          <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* AI Assistant Widget */}
            <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', height: '500px' }}>
              
              {/* Chat Header */}
              <div style={{ padding: '24px', background: '#ffffff', borderBottom: '1px solid #f3f4f6', borderRadius: '20px 20px 0 0', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #f43f5e, #e11d48)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontSize: '1.5rem', boxShadow: '0 4px 6px rgba(225, 29, 72, 0.2)' }}>
                  ✨
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: '0 0 4px 0' }}>AI Pregnancy Assistant</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0' }}>General guidance & support</p>
                </div>
              </div>
              
              {/* Chat Body */}
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', background: '#f8fafc' }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ 
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                    background: msg.role === 'user' ? '#f43f5e' : '#ffffff', 
                    color: msg.role === 'user' ? '#ffffff' : '#334155',
                    padding: '12px 16px', 
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', 
                    fontSize: '0.95rem', 
                    maxWidth: '85%', 
                    lineHeight: '1.5',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    border: msg.role === 'user' ? 'none' : '1px solid #e2e8f0'
                  }}>
                    {msg.text}
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              {/* Chat Input */}
              <div style={{ padding: '20px', background: '#ffffff', borderTop: '1px solid #f3f4f6', borderRadius: '0 0 20px 20px' }}>
                <div style={{ display: 'flex', gap: '12px', background: '#f8fafc', padding: '6px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <input 
                    type="text" 
                    value={chatMsg} 
                    onChange={e => setChatMsg(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()} 
                    placeholder="Type your question..." 
                    style={{ flex: 1, padding: '10px 14px', background: 'transparent', border: 'none', fontSize: '0.95rem', outline: 'none', color: '#1f2937' }} 
                  />
                  <button 
                    onClick={handleSendChat} 
                    style={{ background: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', width: '44px', height: '44px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#e11d48'}
                    onMouseOut={e => e.currentTarget.style.background = '#f43f5e'}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency SOS */}
            <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', padding: '32px 24px', borderRadius: '20px', color: 'white', boxShadow: '0 10px 15px -3px rgba(220, 38, 38, 0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.25rem' }}>
                  🚨
                </div>
                <h4 style={{ fontSize: '1.25rem', fontWeight: '700', margin: '0' }}>
                  Urgent SOS Help
                </h4>
              </div>
              <p style={{ fontSize: '0.95rem', color: '#fee2e2', marginBottom: '24px', lineHeight: '1.6' }}>
                In case of extreme pain, water breaking, or heavy bleeding, call for immediate help.
              </p>
              <button 
                onClick={() => alert("🚨 AMBULANCE REQUESTED!\n\nYour location is being tracked. Help from the nearest municipal hospital is on the way.")} 
                style={{
                  width: '100%', padding: '16px 0', background: '#ffffff', color: '#dc2626', border: 'none', borderRadius: '12px', 
                  fontWeight: '700', fontSize: '1.05rem', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)' }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                CALL EMERGENCY (108)
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
