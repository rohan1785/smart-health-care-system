import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA3ei6PchbpDRkF4mQ3L6m-O1vNwf7SZFo",
  authDomain: "smart-health-system-e3411.firebaseapp.com",
  projectId: "smart-health-system-e3411",
  storageBucket: "smart-health-system-e3411.firebasestorage.app",
  messagingSenderId: "405646575043",
  appId: "1:405646575043:web:6ee5034511361ff950a976",
  measurementId: "G-K3QJM6KNLB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixLocations() {
  console.log("Fetching hospitals...");
  const snapshot = await getDocs(collection(db, "hospitals"));
  
  for (const hospitalDoc of snapshot.docs) {
    const data = hospitalDoc.data();
    const id = hospitalDoc.id;
    
    // If it doesn't have lat/lng but has a name or location
    if (!data.lat || !data.lng) {
      console.log(`Missing lat/lng for ${data.name}. Attempting to geocode...`);
      
      let targetLat = null;
      let targetLng = null;

      try {
        const searchQuery = (data.location && data.location !== "Not Specified") ? data.location : data.name;
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Maharashtra, India')}`, {
          headers: {
            "User-Agent": "SmartHealthApp/1.0"
          }
        });
        
        if (res.ok) {
          const result = await res.json();
          if (result && result.length > 0) {
            targetLat = parseFloat(result[0].lat);
            targetLng = parseFloat(result[0].lon);
            console.log(`Found coordinates for ${searchQuery} via API: ${targetLat}, ${targetLng}`);
          }
        } else {
          console.warn(`API returned ${res.status}`);
        }
      } catch (err) {
        console.error(`Error with API for ${data.name}:`, err.message);
      }
      
      if (!targetLat || !targetLng) {
        // Fallbacks
        const tName = data.name.toLowerCase();
        if (tName.includes("latur")) { targetLat = 18.4088; targetLng = 76.5604; }
        else if (tName.includes("pune")) { targetLat = 18.5204; targetLng = 73.8567; }
        else if (tName.includes("mumbai")) { targetLat = 19.0760; targetLng = 72.8777; }
        else if (tName.includes("solapur")) { targetLat = 17.6599; targetLng = 75.9064; }
        else if (tName.includes("kolhapur") || tName.includes("cpr") || tName.includes("savitribai")) { targetLat = 16.7050; targetLng = 74.2433; }
        else if (tName.includes("sangli")) { targetLat = 16.8524; targetLng = 74.5815; }
        else if (tName.includes("miraj")) { targetLat = 16.8302; targetLng = 74.6077; }
        
        if (targetLat) console.log(`Used fallback for ${data.name}`);
      }
      
      if (targetLat && targetLng) {
        await updateDoc(doc(db, "hospitals", id), {
          lat: targetLat,
          lng: targetLng
        });
        console.log(`Updated ${data.name} in Firestore.`);
      } else {
        console.log(`Could completely not resolve loc for ${data.name}`);
      }
      
      // Delay to respect rate limits of Nominatim API
      await new Promise(r => setTimeout(r, 1500));
    } else {
      console.log(`${data.name} already has coordinates: ${data.lat}, ${data.lng}`);
    }
  }
  
  console.log("Done fixing locations!");
  process.exit(0);
}

fixLocations();
