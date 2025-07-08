import * as admin from 'firebase-admin';

let db: admin.firestore.Firestore | null = null;

try {
  // Check if the app is already initialized to prevent errors on hot-reloads
  if (!admin.apps.length) {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (serviceAccountBase64) {
      const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
      const credentials = JSON.parse(serviceAccountJson);
      
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
      });
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in environment variables. Firebase Admin will not be initialized.');
    }
  }
  
  // Only assign db if an app exists
  if (admin.apps.length > 0) {
    db = admin.firestore();
  }
  
} catch (error) {
  console.error('Firebase Admin Initialization Error:', error);
  // Gracefully fail if initialization fails. db will remain null.
}

export { db };
