import { addProductFromMessage } from '@/ai/flows/add-product-flow';
import { autoReply } from '@/ai/flows/auto-reply-system';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sellerId, message, photoDataUri } = body;

    if (!sellerId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId and message' },
        { status: 400 }
      );
    }

    // In a real app, you'd want to verify that this request
    // is coming from your trusted WhatsApp service (e.g., using a secret key).

    if (photoDataUri) {
      // If there's a photo, it's a seller adding a new product.
      const result = await addProductFromMessage({
        sellerId,
        message,
        photoDataUri,
      });
      // In a real app, you would now use a WhatsApp API client 
      // to send `result.confirmationMessage` back to the seller.
      return NextResponse.json(result);
    } else {
      // If there's no photo, it's a buyer asking a question.
      const result = await autoReply({
        sellerId,
        message,
      });
      // In a real app, you would now use a WhatsApp API client 
      // to send `result.reply` back to the buyer.
      return NextResponse.json(result);
    }

  } catch (error) {
    console.error('Error processing WhatsApp message:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
