import { addProductFromMessage } from '@/ai/flows/add-product-flow';
import { autoReply } from '@/ai/flows/auto-reply-system';
import { getProductById } from '@/lib/mock-data';
import { NextResponse } from 'next/server';
import { Twilio } from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client =
  accountSid && authToken ? new Twilio(accountSid, authToken) : null;

async function sendWhatsappMessage(to: string, body: string) {
  if (!client || !twilioNumber) {
    console.log(
      `Twilio not configured. Message to ${to} with body "${body}" was not sent.`
    );
    return;
  }
  try {
    await client.messages.create({
      from: twilioNumber,
      to: to,
      body: body,
    });
  } catch (error) {
    console.error(`Error sending message to ${to}:`, error);
  }
}

async function fetchImageAsDataUri(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error fetching image for data URI:', error);
    return null;
  }
}

function parseProductId(message: string): string | null {
  const match = message.match(/\(ID: (.*?)\)/);
  return match ? match[1] : null;
}

async function handleTwilioWebhook(request: Request) {
  const formData = await request.formData();
  const from = (formData.get('From') as string) || ''; // e.g., "whatsapp:+233123456789"
  const message = (formData.get('Body') as string) || '';
  const mediaUrl = (formData.get('MediaUrl0') as string) || null;

  if (!from || !message) {
    return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
  }

  // Case 1: Seller is adding a product (message has an image)
  if (mediaUrl) {
    const sellerId = from.replace('whatsapp:', '');
    const photoDataUri = await fetchImageAsDataUri(mediaUrl);
    if (photoDataUri) {
      const result = await addProductFromMessage({ sellerId, message, photoDataUri });
      await sendWhatsappMessage(from, result.confirmationMessage);
    } else {
      await sendWhatsappMessage(
        from,
        'Sorry, I had trouble processing the image. Please try sending it again.'
      );
    }
  } else {
    const productId = parseProductId(message);
    // Case 2: Buyer is asking about a specific product
    if (productId) {
      const product = await getProductById(productId);
      if (product) {
        const result = await autoReply({
          sellerId: product.sellerId,
          message: message,
          productName: product.description,
          productPrice: product.price,
        });
        await sendWhatsappMessage(from, result.reply);
      } else {
        await sendWhatsappMessage(from, "Sorry, I couldn't find that product. It might no longer be available.");
      }
    } else {
      // Case 3: Generic message without product context (could be seller or buyer)
      // Fallback: The AI will respond generically without product specifics.
      const senderId = from.replace('whatsapp:', '');
      const result = await autoReply({ sellerId: senderId, message });
      await sendWhatsappMessage(from, result.reply);
    }
  }

  // Respond to Twilio to acknowledge receipt
  return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
}

async function handleJsonRequest(request: Request) {
  try {
    const body = await request.json();
    const { sellerId, message, photoDataUri } = body;
    const fromNumber = `whatsapp:${sellerId}`;

    if (!sellerId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId and message' },
        { status: 400 }
      );
    }

    if (photoDataUri) {
      const result = await addProductFromMessage({ sellerId, message, photoDataUri });
      await sendWhatsappMessage(fromNumber, result.confirmationMessage);
      return NextResponse.json(result);
    } else {
      const productId = parseProductId(message);
      if (productId) {
        const product = await getProductById(productId);
        if (product) {
          const result = await autoReply({
            sellerId: product.sellerId,
            message: message,
            productName: product.description,
            productPrice: product.price,
          });
          await sendWhatsappMessage(fromNumber, result.reply);
          return NextResponse.json(result);
        } else {
          const result = { reply: "Sorry, I couldn't find that product. It might no longer be available." };
          await sendWhatsappMessage(fromNumber, result.reply);
          return NextResponse.json(result);
        }
      } else {
        const result = await autoReply({ sellerId, message });
        await sendWhatsappMessage(fromNumber, result.reply);
        return NextResponse.json(result);
      }
    }
  } catch (error) {
    console.error('Error processing JSON request:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const contentType = request.headers.get('Content-Type') || '';
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return handleTwilioWebhook(request);
  } else {
    // Default to handling JSON for testing via simulator
    return handleJsonRequest(request);
  }
}
