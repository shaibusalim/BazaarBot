'use server';
/**
 * @fileOverview Handles adding a product to a seller's catalog from a message.
 *
 * - addProductFromMessage - A function that handles the product addition process.
 * - AddProductInput - The input type for the addProductFromMessage function.
 * - AddProductOutput - The return type for the addProductFromMessage function.
 */

import {ai} from '@/ai/genkit';
import {addProduct as addProductToDb} from '@/lib/data';
import type {Product} from '@/types';
import {z} from 'genkit';

const AddProductInputSchema = z.object({
  message: z
    .string()
    .describe(
      'The message from the seller, containing the product description and price.'
    ),
  sellerId: z.string().describe('The seller ID.'),
  photoDataUri: z
    .string()
    .describe(
      "A photo of the product, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AddProductInput = z.infer<typeof AddProductInputSchema>;

const AddProductOutputSchema = z.object({
  confirmationMessage: z
    .string()
    .describe('A confirmation message to be sent back to the seller.'),
  addedProduct: z
    .object({
      id: z.string(),
      image: z.string(),
      price: z.string(),
      description: z.string(),
      sellerId: z.string(),
    })
    .optional()
    .describe('The product that was added.'),
});
export type AddProductOutput = z.infer<typeof AddProductOutputSchema>;

const ExtractedProductDetailsSchema = z.object({
  price: z
    .string()
    .describe(
      'The price of the product, including the currency symbol (e.g., ₵150). Extract this from the message.'
    ),
  description: z
    .string()
    .describe(
      'A short, clear, and appealing description of the product, created by analyzing the provided photo.'
    ),
});

export async function addProductFromMessage(
  input: AddProductInput
): Promise<AddProductOutput> {
  return addProductFlow(input);
}

const productExtractorPrompt = ai.definePrompt({
  name: 'productExtractorPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {
    schema: z.object({
      message: z.string(),
      photoDataUri: z.string(),
    }),
  },
  output: {schema: ExtractedProductDetailsSchema},
  prompt: `You are an intelligent assistant that extracts product information from a seller's message and image for an e-commerce store in Ghana.
The currency is Ghanaian Cedis (₵). If no currency is specified, assume it is ₵.
Your task is to:
1. Extract the exact price from the user's message.
2. Create a clear, concise, and attractive product description based *only* on the provided photo. Do not use the user's text for the description.

Message: {{{message}}}
Photo: {{media url=photoDataUri}}
`,
});

const addProductFlow = ai.defineFlow(
  {
    name: 'addProductFlow',
    inputSchema: AddProductInputSchema,
    outputSchema: AddProductOutputSchema,
  },
  async input => {
    const {output: extractedDetails} = await productExtractorPrompt({
      message: input.message,
      photoDataUri: input.photoDataUri,
    });

    if (!extractedDetails || !extractedDetails.price || !extractedDetails.description) {
      return {
        confirmationMessage:
          "Sorry, I couldn't quite understand the product details. Please try again with a clear photo and a message that includes the price.",
      };
    }

    const newProductData = {
      sellerId: input.sellerId,
      image: input.photoDataUri,
      price: extractedDetails.price,
      description: extractedDetails.description,
    };

    const addedProduct = await addProductToDb(newProductData);

    const storeUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/${addedProduct.sellerId}`;

    return {
      confirmationMessage: `Great! I've added "${addedProduct.description}" to your store for ${addedProduct.price}. You can view your updated store here: ${storeUrl}`,
      addedProduct: addedProduct,
    };
  }
);
