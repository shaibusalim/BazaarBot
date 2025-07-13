import * as admin from 'firebase-admin';
import type { ServiceAccount } from 'firebase-admin';

let db: admin.firestore.Firestore;
let FieldValue: typeof admin.firestore.FieldValue;

const initializeFirebaseAdmin = () => {
  // Check if the app is already initialized to prevent errors
  if (admin.apps.length > 0) {
    return admin.apps[0];
  }

  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;

  if (!serviceAccountBase64) {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_BASE64 is not set. Firebase Admin will not be initialized.'
    );
    return null;
  }

  let serviceAccountJson: string;
  try {
    // Decode the Base64 string into a JSON string
    serviceAccountJson = Buffer.from(
      serviceAccountBase64,
      'base64'
    ).toString('utf-8');
    
    // Parse the JSON string into an object
    const credentials = JSON.parse(serviceAccountJson) as ServiceAccount;

    // Initialize the Firebase Admin SDK
    return admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    
    // If there's a parsing error, log a helpful hint and a snippet of the corrupted string
    if (error instanceof SyntaxError) {
        console.error('\nHint: The FIREBASE_SERVICE_ACCOUNT_BASE64 string seems to be corrupted or invalid.');
        console.error('The decoded JSON string snippet starts with:');
        // @ts-ignore
        console.error(`\n---\n${serviceAccountJson.substring(0, 100)}...\n---\n`);
        console.error('Please re-generate the Base64 string from your service account JSON file and ensure it is copied correctly into your environment variables.\n');
    }
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
