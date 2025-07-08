import { addProductFromMessage } from '@/ai/flows/add-product-flow';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sellerId, message, photoDataUri } = body;

    if (!sellerId || !message || !photoDataUri) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId, message, and photoDataUri' },
        { status: 400 }
      );
    }

    // In a real app, you'd want to verify that this request
    // is coming from your trusted WhatsApp service (e.g., using a secret key).

    const result = await addProductFromMessage({
      sellerId,
      message,
      photoDataUri,
    });

    // In a real app, you would now use a WhatsApp API client 
    // to send `result.confirmationMessage` back to the seller.
    // For this demo, we'll just return it in the API response.
    return NextResponse.json(result);

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
