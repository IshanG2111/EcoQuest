import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

function formatPrivateKey(key: string | undefined): string {
  if (!key) return '';
  return key.replace(/\\n/g, '\n');
}

let adminApp: App | null = null;

try {
  if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'ecoquest-ab8ad';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || 'firebase-adminsdk-fbsvc@ecoquest-ab8ad.iam.gserviceaccount.com';
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    adminApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'ecoquest-ab8ad.firebasestorage.app',
    });
  } else {
    adminApp = getApp();
  }
} catch (error) {
  console.warn('Firebase admin initialization error:', error);
}

export const adminAuth: Auth | null = adminApp ? getAuth(adminApp) : null;
export const adminDb: Firestore | null = adminApp ? getFirestore(adminApp) : null;
export const adminStorage: Storage | null = adminApp ? getStorage(adminApp) : null;

export default adminApp;
