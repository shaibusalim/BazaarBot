'use server';
/**
 * @fileOverview Handles adding a product to a seller's catalog from a message.
 *
 * - addProductFromMessage - A function that handles the product addition process.
 * - AddProductInput - The input type for the addProductFromMessage function.
 * - AddProductOutput - The return type for the addProductFromMessage function.
 */

import {ai} from '@/ai/genkit';
import {addProduct as addProductToDb} from '@/lib/mock-data';
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
      'The price of the product, including the currency symbol (e.g., ₵150).'
    ),
  description: z
    .string()
    .describe('A short, clear description of the product.'),
});

export async function addProductFromMessage(
  input: AddProductInput
): Promise<AddProductOutput> {
  return addProductFlow(input);
}

const productExtractorPrompt = ai.definePrompt({
  name: 'productExtractorPrompt',
  input: {schema: z.object({message: z.string()})},
  output: {schema: ExtractedProductDetailsSchema},
  prompt: `You are an intelligent assistant that extracts product information from a seller's message.
The currency is Ghanaian Cedis (₵). If no currency is specified, assume it is ₵.
Extract the price and a description for the product from the following message.

Message: {{{message}}}
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
    });

    if (!extractedDetails) {
      return {
        confirmationMessage:
          "Sorry, I couldn't understand the product details. Please try again with a clear price and description.",
      };
    }

    const newProductData = {
      sellerId: input.sellerId,
      image: input.photoDataUri,
      price: extractedDetails.price,
      description: extractedDetails.description,
    };

    const addedProduct = await addProductToDb(newProductData);

    return {
      confirmationMessage: `Great! I've added "${addedProduct.description}" to your store for ${addedProduct.price}.`,
      addedProduct: addedProduct,
    };
  }
);
