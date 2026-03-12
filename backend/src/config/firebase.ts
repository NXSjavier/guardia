import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount: any;
let firebaseInitialized = false;

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && !privateKey.includes('TU_') && !privateKey.includes('your-')) {
  try {
    let key = privateKey;
    if (key.includes('\\n')) {
      key = key.replace(/\\n/g, '\n');
    }
    
    if (!key.includes('-----BEGIN PRIVATE KEY-----')) {
      console.log('⚠️ Clave privada no tiene formato PEM válido');
    } else {
      serviceAccount = {
        type: 'service_account',
        project_id: process.env.FIREBASE_PROJECT_ID || 'studio-243920639-72d26',
        private_key: key,
        client_email: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk@${process.env.FIREBASE_PROJECT_ID || 'studio-243920639-72d26'}.iam.gserviceaccount.com`,
      };

      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        firebaseInitialized = true;
        console.log('✅ Firebase Admin inicializado correctamente');
      }
    }
  } catch (error: any) {
    console.error('❌ Error al inicializar Firebase Admin:', error.message);
  }
}

if (!firebaseInitialized) {
  console.log('⚠️ Firebase Admin NO inicializado - funcionando sin Firestore/Auth');
}

export const db = firebaseInitialized ? admin.firestore() : null;
export const auth = firebaseInitialized ? admin.auth() : null;
export default admin;
