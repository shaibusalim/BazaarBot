// Use a dynamic import for firebase-admin to ensure compatibility with Next.js bundling.
import admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let db: admin.firestore.Firestore | undefined;
let FieldValue: typeof admin.firestore.FieldValue | undefined;

// Singleton pattern to prevent multiple initializations
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

    if (!serviceAccountBase64) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is not set in environment variables.');
    }

    // Decode the Base64 string into a JSON string
    const serviceAccountJson = Buffer.from(
      serviceAccountBase64,
      'base64'
    ).toString('utf-8');
    
    // Parse the JSON string into an object
    const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;

    // Initialize the Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
    
    db = admin.firestore();
    FieldValue = admin.firestore.FieldValue;

  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    
    if (error instanceof SyntaxError) {
        console.error('\nHint: The FIREBASE_SERVICE_ACCOUNT_BASE64 string seems to be corrupted or invalid.');
        // Don't log the decoded string here to avoid exposing partial credentials in production logs.
        console.error('Please re-generate the Base64 string from your service account JSON file and ensure it is copied correctly into your environment variables.\n');
    }
  }
} else {
  // If already initialized, get the existing instance
  db = admin.app().firestore();
  FieldValue = admin.firestore.FieldValue;
}

// To prevent the app from crashing if Firebase isn't initialized,
// we export potentially undefined values and handle them where they are used.
export { db, FieldValue };
