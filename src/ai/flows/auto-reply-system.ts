'use server';

/**
 * @fileOverview Automatically replies to common buyer inquiries using AI.
 *
 * - autoReply - A function that handles the auto-reply process.
 * - AutoReplyInput - The input type for the autoReply function.
 * - AutoReplyOutput - The return type for the autoReply function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutoReplyInputSchema = z.object({
  message: z.string().describe('The message from the buyer.'),
  sellerId: z.string().describe('The seller ID associated with the message.'),
  productName: z.string().optional().describe('The name of the product the buyer is asking about.'),
  productPrice: z.string().optional().describe('The price of the product the buyer is asking about.'),
});
export type AutoReplyInput = z.infer<typeof AutoReplyInputSchema>;

const AutoReplyOutputSchema = z.object({
  reply: z.string().describe('The automated reply to the buyer.'),
});
export type AutoReplyOutput = z.infer<typeof AutoReplyOutputSchema>;

export async function autoReply(input: AutoReplyInput): Promise<AutoReplyOutput> {
  return autoReplyFlow(input);
}

const autoReplyPrompt = ai.definePrompt({
  name: 'autoReplyPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: AutoReplyInputSchema},
  output: {schema: AutoReplyOutputSchema},
  prompt: `You are a friendly and helpful Ghanaian shop assistant managing WhatsApp messages for a seller. Be polite, concise, and professional. Your goal is to answer customer questions based on the information provided.

{{#if productName}}
The customer is asking about the following product: "{{productName}}" which costs {{productPrice}}.
Use this information to answer their question. Common questions are about availability, location, or delivery.
If you don't have enough information, politely say so and mention that the seller will reply shortly.
{{else}}
The customer has sent a general message. Provide a helpful, general response.
If they ask about a product you don't know about, tell them the seller will get back to them.
{{/if}}

Customer's message: "{{{message}}}"
`,
});

const autoReplyFlow = ai.defineFlow(
  {
    name: 'autoReplyFlow',
    inputSchema: AutoReplyInputSchema,
    outputSchema: AutoReplyOutputSchema,
  },
  async input => {
    const {output} = await autoReplyPrompt(input);
    if (!output) {
      return { reply: "Sorry, I'm having trouble understanding. The seller will get back to you soon." };
    }
    return output;
  }
);
