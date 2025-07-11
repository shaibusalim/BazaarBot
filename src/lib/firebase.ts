import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let db: admin.firestore.Firestore;
let FieldValue: typeof admin.firestore.FieldValue;

const initializeFirebaseAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Firebase Admin will not be initialized.'
    );
    return null;
  }

  try {
    const serviceAccountJson = Buffer.from(
      serviceAccountBase64,
      'base64'
    ).toString('utf-8');
    const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;

    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    return null;
  }
};

const app = initializeFirebaseAdmin();

if (app) {
  db = admin.firestore();
  FieldValue = admin.firestore.FieldValue;
} else {
  // To prevent the app from crashing if Firebase isn't initialized,
  // we can assign null and handle it gracefully in other parts of the app.
  // @ts-ignore
  db = null;
  // @ts-ignore
  FieldValue = null;
}

export { db, FieldValue };
