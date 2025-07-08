import type { Product } from '@/types';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
// This pattern ensures it's only initialized once.
if (!admin.apps.length) {
  try {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!serviceAccountBase64) {
      throw new Error('Firebase service account key not found in environment variables.');
    }
    const serviceAccountJson = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
  }
}

const db = admin.firestore();
const productsCollection = db.collection('products');

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  try {
    const snapshot = await productsCollection
      .where('sellerId', '==', sellerId)
      .orderBy('createdAt', 'desc')
      .get();
      
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        sellerId: data.sellerId,
        image: data.image,
        price: data.price,
        description: data.description,
        createdAt: data.createdAt.toDate(),
      };
    }) as Product[];
  } catch (error) {
    console.error("Error getting products by seller:", error);
    return [];
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  try {
    const newProductDoc = {
      ...productData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const docRef = await productsCollection.add(newProductDoc);

    const doc = await docRef.get();
    const data = doc.data();

    return {
      id: doc.id,
      ...productData,
      createdAt: data?.createdAt.toDate(),
    } as Product;
    
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Failed to add product to the database.");
  }
}
