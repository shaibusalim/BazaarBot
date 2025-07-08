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
  input: {schema: AutoReplyInputSchema},
  output: {schema: AutoReplyOutputSchema},
  prompt: `You are a Ghanaian shop assistant. Be polite and concise. Your goal is to answer customer questions based on the information provided.

{% if productName %}The customer is asking about the following product: {{productName}}{% endif %}
{% if productPrice %}The price of the product is: {{productPrice}}{% endif %}

Customer message: {{{message}}}
`,
  config: {
    model: 'gpt-4',
  },
});

const autoReplyFlow = ai.defineFlow(
  {
    name: 'autoReplyFlow',
    inputSchema: AutoReplyInputSchema,
    outputSchema: AutoReplyOutputSchema,
  },
  async input => {
    const {output} = await autoReplyPrompt(input);
    return output!;
  }
);
