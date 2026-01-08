
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, doc, updateDoc, onSnapshot, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbtFGhrRYKREkEuV1wWgc1VTFrsstllV4",
  authDomain: "fir-9b640.firebaseapp.com",
  databaseURL: "https://fir-9b640-default-rtdb.firebaseio.com",
  projectId: "fir-9b640",
  storageBucket: "fir-9b640.firebasestorage.app",
  messagingSenderId: "633324162007",
  appId: "1:633324162007:web:6379ed58043d180c8b1992"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// AUTH
export const loginAdmin = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);
export const logout = () => signOut(auth);

// FIRESTORE - CITAS
export const saveAppointment = async (appointment: any) => {
  try {
    return await addDoc(collection(db, "appointments"), {
      ...appointment,
      status: 'pendiente',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving appointment:", error);
    throw error;
  }
};

export const getAppointments = async () => {
  try {
    const q = query(collection(db, "appointments"), orderBy("fecha", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw error;
  }
};

export const updateAppointmentStatus = async (id: string, status: string) => {
  try {
    const appRef = doc(db, "appointments", id);
    return await updateDoc(appRef, { status });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    throw error;
  }
};

// FIRESTORE - COTIZACIONES
export const saveQuote = async (quote: any) => {
  try {
    return await addDoc(collection(db, "quotes"), {
      ...quote,
      status: 'Pendiente',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving quote:", error);
    throw error;
  }
};

export const getQuotes = async () => {
  try {
    const q = query(collection(db, "quotes"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching quotes:", error);
    throw error;
  }
};

export const updateQuoteStatus = async (id: string, status: string) => {
  try {
    const quoteRef = doc(db, "quotes", id);
    return await updateDoc(quoteRef, { status });
  } catch (error) {
    console.error("Error updating quote status:", error);
    throw error;
  }
};

// FIRESTORE - MENSAJES DE CONTACTO
export const saveContactMessage = async (formData: { nombre: string; email: string; mensaje: string }) => {
  try {
    return await addDoc(collection(db, "messages"), {
      ...formData,
      date: new Date().toISOString(),
      status: 'new',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error saving contact message:", error);
    throw error;
  }
};

export const subscribeToMessages = (callback: (messages: any[]) => void) => {
  const q = query(collection(db, "messages"), orderBy("date", "desc"));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
};

export const updateMessageStatus = async (id: string, status: string) => {
  try {
    const msgRef = doc(db, "messages", id);
    return await updateDoc(msgRef, { status });
  } catch (error) {
    console.error("Error updating message status:", error);
    throw error;
  }
};

export const deleteMessage = async (id: string) => {
  try {
    const msgRef = doc(db, "messages", id);
    return await deleteDoc(msgRef);
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};

/**
 * CLOUDINARY UPLOAD
 */
export const uploadToCloudinary = async (file: File) => {
  const CLOUD_NAME = "dfqdd2nja"; 
  const UPLOAD_PRESET = "optica"; 
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
      method: 'POST',
      body: formData,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      const errorMsg = responseData.error?.message || "Error desconocido";
      throw new Error(`Cloudinary falló: ${errorMsg}`);
    }
    
    return responseData.secure_url;
  } catch (error: any) {
    console.error("Error crítico en uploadToCloudinary:", error);
    throw error;
  }
};
