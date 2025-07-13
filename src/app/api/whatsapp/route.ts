
import { addProductFromMessage } from '@/ai/flows/add-product-flow';
import { autoReply } from '@/ai/flows/auto-reply-system';
import { getProductById } from '@/lib/data';
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
    console.error(
      `BazaarBot Twilio Error: Twilio client not configured. Message to ${to} with body "${body}" was not sent.`
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
    console.error(`BazaarBot Twilio Error: Error sending Twilio message to ${to}:`, error);
    // Don't re-throw, as this would prevent the original Twilio webhook from getting a response.
  }
}

async function fetchImageAsDataUri(url: string) {
  if (!accountSid || !authToken) {
    console.error('BazaarBot Media Error: Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN) are not configured. Cannot fetch media.');
    return null;
  }
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText} (${response.status})`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('BazaarBot Media Error: Error fetching image for data URI:', error);
    return null;
  }
}

function parseProductId(message: string): string | null {
  const match = message.match(/\(ID: (.*?)\)/);
  return match ? match[1] : null;
}

async function handleTwilioWebhook(request: Request) {
  console.log('--- BazaarBot Webhook: New Twilio Request ---');
  const formData = await request.formData();
  const from = (formData.get('From') as string) || '';
  const message = (formData.get('Body') as string) || '';
  const mediaUrl = (formData.get('MediaUrl0') as string) || null;
  const numMedia = parseInt((formData.get('NumMedia') as string) || '0');

  console.log(`BazaarBot Webhook: From: ${from}, Message: "${message}", NumMedia: ${numMedia}`);

  if (!from) {
    console.error('BazaarBot Webhook Abort: "From" number is missing.');
    return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
  }

  try {
    // Case 1: Seller is adding a product (message has an image)
    if (mediaUrl && numMedia > 0) {
      console.log('BazaarBot Webhook: Processing as "Add Product" request...');
      const sellerId = from.replace('whatsapp:', '');
      const photoDataUri = await fetchImageAsDataUri(mediaUrl);
      if (photoDataUri) {
        console.log('BazaarBot Webhook: Image fetched. Calling addProductFromMessage AI flow...');
        const result = await addProductFromMessage({ sellerId, message, photoDataUri });
        console.log('BazaarBot Webhook: AI response received:', result.confirmationMessage);
        await sendWhatsappMessage(from, result.confirmationMessage);
      } else {
        console.error('BazaarBot Webhook Error: Failed to fetch image data URI.');
        await sendWhatsappMessage(
          from,
          'Sorry, I had trouble processing the image. Please try sending it again.'
        );
      }
    } else {
      console.log('BazaarBot Webhook: Processing as text-only request...');
      const productId = parseProductId(message);
      // Case 2: Buyer is asking about a specific product
      if (productId) {
        console.log(`BazaarBot Webhook: Parsed Product ID: ${productId}. Looking up product...`);
        const product = await getProductById(productId);
        if (product) {
          console.log('BazaarBot Webhook: Product found. Calling autoReply AI flow with product context...');
          const result = await autoReply({
            sellerId: product.sellerId,
            message: message,
            productName: product.description,
            productPrice: product.price,
          });
          console.log('BazaarBot Webhook: AI response received:', result.reply);
          await sendWhatsappMessage(from, result.reply);
        } else {
          console.warn(`BazaarBot Webhook Warning: Product with ID ${productId} not found.`);
          await sendWhatsappMessage(from, "Sorry, I couldn't find that product. It might no longer be available.");
        }
      } else {
        // Case 3: Generic message without product context
        console.log('BazaarBot Webhook: No Product ID found. Calling autoReply AI flow without product context...');
        const senderId = from.replace('whatsapp:', '');
        const result = await autoReply({ sellerId: senderId, message });
        console.log('BazaarBot Webhook: AI response received:', result.reply);
        await sendWhatsappMessage(from, result.reply);
      }
    }
  } catch (error) {
    console.error('--- BazaarBot Webhook CRITICAL ERROR ---');
    console.error('An unhandled error occurred while processing a WhatsApp message.');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Sender:', from);
    console.error('Message Body:', message);
    console.error('Full Error Details:', error);

    if (error instanceof Error) {
        if (error.message.includes('database') || error.message.includes('Firestore') || error.message.includes('credential')) {
            console.error('\nHint: This error might be due to a missing or incorrect FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable.\n');
        }
        if (error.message.includes('API key')) {
             console.error('\nHint: This error might be due to a missing or invalid GOOGLE_API_KEY environment variable.\n');
        }
    }
    
    // Send a generic failsafe message to the user
    await sendWhatsappMessage(
      from, 
      "I'm sorry, but something went wrong on our end and I couldn't process your request. Please try again in a moment."
    );
  }

  // Respond to Twilio to acknowledge receipt, even if there was an error
  return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
}

// This function is primarily for the simulator page, not the Twilio webhook
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

    
