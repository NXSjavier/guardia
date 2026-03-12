import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyCtsNiltcH_RDUzCsMv5aGrAlUAWFQ7HQo",
  authDomain: "studio-243920639-72d26.firebaseapp.com",
  databaseURL: "https://studio-243920639-72d26-default-rtdb.firebaseio.com",
  projectId: "studio-243920639-72d26",
  storageBucket: "studio-243920639-72d26.firebasestorage.app",
  messagingSenderId: "1002048436333",
  appId: "1:1002048436333:web:0a1c378f23cd73afa0e764"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const initMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};
