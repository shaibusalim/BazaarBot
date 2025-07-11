import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;
let FieldValue: typeof admin.firestore.FieldValue | null = null;

try {
  if (!admin.apps.length) {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (serviceAccountBase64) {
      const serviceAccountJson = Buffer.from(
        serviceAccountBase64,
        'base64'
      ).toString('utf-8');
      const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;

      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } else {
      console.warn(
        'FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in environment variables. Firebase Admin will not be initialized.'
      );
    }
  }

  if (admin.apps.length > 0) {
    db = admin.firestore();
    FieldValue = admin.firestore.FieldValue;
  }
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
}

export { db, FieldValue };
