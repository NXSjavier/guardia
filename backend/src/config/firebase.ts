import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

let serviceAccount: admin.ServiceAccount | undefined;

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (privateKey && !privateKey.includes('TU_') && !privateKey.includes('your-')) {
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID || 'studio-243920639-72d26',
    private_key: privateKey.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL || `firebase-adminsdk@${process.env.FIREBASE_PROJECT_ID || 'studio-243920639-72d26'}.iam.gserviceaccount.com`,
  };

  if (!admin.apps.length) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar Firebase Admin:', error);
    }
  }
} else {
  console.log('⚠️ Firebase Admin NO inicializado');
  console.log('   Agrega FIREBASE_PRIVATE_KEY en backend/.env');
  console.log('   O descarga la clave desde: Firebase Console > Configuración > Cuentas de servicio');
}

export const db = admin.apps.length > 0 ? admin.firestore() : null;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
export default admin;
