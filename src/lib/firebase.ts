import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0104749615",
  appId: "1:690628155274:web:46eb7046df7ccfdb469a73",
  apiKey: "AIzaSyD_NnXcEyRT6ETkrjsVjyzHIYfm0iFocMc",
  authDomain: "gen-lang-client-0104749615.firebaseapp.com",
  storageBucket: "gen-lang-client-0104749615.firebasestorage.app",
  messagingSenderId: "690628155274"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-e9a0ca61-5ba6-40d0-ab92-f1743e94e765");
