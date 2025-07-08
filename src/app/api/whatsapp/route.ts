import { addProductFromMessage } from '@/ai/flows/add-product-flow';
import { autoReply } from '@/ai/flows/auto-reply-system';
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

async function handleTwilioWebhook(request: Request) {
  const formData = await request.formData();
  const from = (formData.get('From') as string) || ''; // e.g., "whatsapp:+14155238886"
  const message = (formData.get('Body') as string) || '';
  const mediaUrl = (formData.get('MediaUrl0') as string) || null;

  const sellerId = from.replace('whatsapp:', '');

  if (!sellerId || !message) {
    return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
  }

  if (mediaUrl) {
    // Seller adding a product
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
    // Buyer asking a question
    const result = await autoReply({ sellerId, message });
    await sendWhatsappMessage(from, result.reply);
  }

  // Respond to Twilio to acknowledge receipt
  return new Response('<Response/>', { headers: { 'Content-Type': 'text/xml' } });
}

async function handleJsonRequest(request: Request) {
  try {
    const body = await request.json();
    const { sellerId, message, photoDataUri } = body;

    if (!sellerId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: sellerId and message' },
        { status: 400 }
      );
    }

    if (photoDataUri) {
      const result = await addProductFromMessage({ sellerId, message, photoDataUri });
      await sendWhatsappMessage(`whatsapp:${sellerId}`, result.confirmationMessage);
      return NextResponse.json(result);
    } else {
      const result = await autoReply({ sellerId, message });
      await sendWhatsappMessage(`whatsapp:${sellerId}`, result.reply);
      return NextResponse.json(result);
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
