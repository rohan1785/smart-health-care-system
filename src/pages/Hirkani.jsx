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

  const handleSendChat = () => {
    if (!chatMsg.trim()) return;
    const newHistory = [...chatHistory, { role: 'user', text: chatMsg }];
    setChatHistory(newHistory);
    setChatMsg('');
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'bot', text: 'This is a general advice AI. Please always consult your nearest municipal doctor or ASHA worker for any medical concerns or pain.' }]);
    }, 1000);
  };

  const currentData = pregnancyData.find(d => d.month === activeMonth);

  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingTop: '80px', fontFamily: 'Inter, sans-serif' }}>
        
        {/* Header Section */}
        <div style={{ background: 'linear-gradient(to right, #ffe4e6, #fce7f3)', padding: '40px 20px', textAlign: 'center', borderBottom: '1px solid #fbcfe8' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#be123c', marginBottom: '10px' }}>
            👶 HIRKANI Care Corner
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#475569', maxWidth: '800px', margin: '0 auto' }}>
            Free Municipal Maternity Awareness Portal. A month-by-month guide to ensure a safe and healthy pregnancy for you and your baby. No login required.
          </p>
        </div>

        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '30px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* Main Content Area (Tabs + Details) */}
          <div style={{ flex: '1 1 700px', background: 'white', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            
            {/* Tabs for 9 Months */}
            <div style={{ display: 'flex', overflowX: 'auto', background: '#fff1f2', borderBottom: '1px solid #ffe4e6' }}>
              {pregnancyData.map((data) => (
                <button
                  key={data.month}
                  onClick={() => setActiveMonth(data.month)}
                  style={{
                    padding: '16px 24px', whiteSpace: 'nowrap', border: 'none', background: activeMonth === data.month ? '#f43f5e' : 'transparent',
                    color: activeMonth === data.month ? 'white' : '#881337', fontWeight: '700', fontSize: '1.1rem', cursor: 'pointer', transition: 'all 0.2s',
                    borderBottom: activeMonth === data.month ? '4px solid #9f1239' : '4px solid transparent'
                  }}
                >
                  Month {data.month}
                </button>
              ))}
            </div>

            {/* Content for Selected Month */}
            <div style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#881337', marginBottom: '20px', borderBottom: '2px solid #fecdd3', paddingBottom: '10px' }}>
                {currentData.title}
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                {/* DOs Section */}
                <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#065f46', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>✅</span> What to Do (काय करावे)
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: '#047857', lineHeight: '1.6' }}>
                    {currentData.todo.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                  </ul>
                </div>

                {/* DONTs Section */}
                <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #ef4444' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#991b1b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>❌</span> What NOT to Do (काय टाळावे)
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: '#b91c1c', lineHeight: '1.6' }}>
                    {currentData.notTodo.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                  </ul>
                </div>

                {/* EAT Section */}
                <div style={{ background: '#fffbeb', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #f59e0b' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#92400e', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🍲</span> Diet & Food (आहार)
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: '#b45309', lineHeight: '1.6' }}>
                    {currentData.eat.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                  </ul>
                </div>

                {/* EXERCISE Section */}
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#1e40af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🧘‍♀️</span> Safe Exercise (व्यायाम)
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: '#1d4ed8', lineHeight: '1.6' }}>
                    {currentData.exercise.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                  </ul>
                </div>

                {/* WARNING Section */}
                <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '12px', borderLeft: '4px solid #dc2626', gridColumn: '1 / -1' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#991b1b', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>⚠️</span> Danger Signs / Consult Doctor Immediately (धोक्याची चिन्हे)
                  </h3>
                  <ul style={{ paddingLeft: '20px', color: '#b91c1c', lineHeight: '1.6' }}>
                    {currentData.warning.map((item, i) => <li key={i} style={{ marginBottom: '8px' }}>{item}</li>)}
                  </ul>
                </div>

              </div>
            </div>
          </div>

          {/* Right Sidebar Area (AI Assistant & SOS) */}
          <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* AI Assistant Widget */}
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #fbcfe8', boxShadow: '0 10px 25px rgba(225, 91, 100, 0.1)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', background: '#ffe4e6', borderBottom: '1px solid #fbcfe8' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#e11d48', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <span style={{ fontSize: '1.5rem' }}>✨</span> AI Pregnancy Assistant
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#be123c', marginTop: '5px', margin: '5px 0 0 0' }}>
                  Have a general question about pregnancy? Ask our free AI guide.
                </p>
              </div>
              
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '350px' }}>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '10px', marginBottom: '15px' }}>
                  {chatHistory.map((msg, i) => (
                    <div key={i} style={{ 
                      alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                      background: msg.role === 'user' ? '#f43f5e' : '#f1f5f9', 
                      color: msg.role === 'user' ? 'white' : '#334155',
                      padding: '10px 14px', borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', 
                      fontSize: '0.95rem', maxWidth: '85%', lineHeight: '1.5'
                    }}>
                      {msg.text}
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={chatMsg} 
                    onChange={e => setChatMsg(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSendChat()} 
                    placeholder="Type your question..." 
                    style={{ flex: 1, padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem', outline: 'none' }} 
                  />
                  <button 
                    onClick={handleSendChat} 
                    style={{ background: '#f43f5e', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Emergency SOS */}
            <div style={{ background: '#fef2f2', padding: '20px', borderRadius: '16px', border: '1px solid #fecdd3' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 10px 0' }}>
                <span>🚨</span> Urgent SOS Help
              </h4>
              <p style={{ fontSize: '0.95rem', color: '#b91c1c', marginBottom: '15px', lineHeight: '1.5' }}>
                In case of extreme pain, water breaking, or heavy bleeding, call for immediate help.
              </p>
              <button 
                onClick={() => alert("🚨 AMBULANCE REQUESTED!\n\nYour location is being tracked. Help from the nearest municipal hospital is on the way.")} 
                style={{
                  width: '100%', padding: '14px 0', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', 
                  fontWeight: '800', fontSize: '1.1rem', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                }}
                onMouseOver={e => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={e => e.currentTarget.style.background = '#dc2626'}
              >
                <span>📞</span> CALL EMERGENCY (108)
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
