import type { Product } from '@/types';
import { db, FieldValue } from '@/lib/firebase';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';

export async function getProductsBySeller(sellerId: string): Promise<Product[]> {
  if (!db) {
    console.log("Firestore not initialized, returning empty array. Check Firebase credentials.");
    return [];
  }

  try {
    const productsCollection = db.collection('products');
    // NOTE: This query requires a composite index in Firestore.
    // The error message from Firestore will contain a direct link to create it.
    const snapshot = await productsCollection
      .where('sellerId', '==', sellerId)
      .orderBy('createdAt', 'desc')
      .get();
      
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map((doc: QueryDocumentSnapshot<DocumentData>) => {
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
    // In a real app, you might want to throw the error to be handled by the caller
    return [];
  }
}

export async function getProductById(productId: string): Promise<Product | null> {
  if (!db) {
    console.log("Firestore not initialized, returning null. Check Firebase credentials.");
    return null;
  }

  try {
    const productRef = db.collection('products').doc(productId);
    const doc = await productRef.get();
      
    if (!doc.exists) {
      console.log(`Product with ID ${productId} not found.`);
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      sellerId: data.sellerId,
      image: data.image,
      price: data.price,
      description: data.description,
      createdAt: data.createdAt.toDate(),
    } as Product;
  } catch (error) {
    console.error("Error getting product by ID:", error);
    return null;
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
  if (!db || !FieldValue) {
    console.error("Firestore not initialized, cannot add product. Check Firebase credentials.");
    throw new Error("Database not connected. Failed to add product.");
  }
  
  try {
    const productsCollection = db.collection('products');

    const newProductDoc = {
      ...productData,
      createdAt: FieldValue.serverTimestamp(),
    };
    const docRef = await productsCollection.add(newProductDoc);

    // Fetch the just-created document to get the server-generated timestamp
    const doc = await docRef.get();
    const data = doc.data();

    return {
      id: doc.id,
      ...productData,
      createdAt: data?.createdAt.toDate(), // Return a JS Date object
    } as Product;
    
  } catch (error) {
    console.error("Error adding product:", error);
    throw new Error("Failed to add product to the database.");
  }
}
