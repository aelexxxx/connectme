'use server';

/**
 * @fileOverview Provides AI-driven connection suggestions based on user profile analysis.
 *
 * - suggestConnections - A function that suggests connections based on profile information.
 * - SuggestConnectionsInput - The input type for the suggestConnections function.
 * - SuggestConnectionsOutput - The return type for the suggestConnections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestConnectionsInputSchema = z.object({
  profileSummary: z
    .string()
    .describe('A summary of the user profile, including interests and background.'),
  numberOfSuggestions: z
    .number()
    .default(5)
    .describe('The number of connection suggestions to generate.'),
});

export type SuggestConnectionsInput = z.infer<typeof SuggestConnectionsInputSchema>;

const SuggestConnectionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('A list of suggested connections based on the profile summary.'),
});

export type SuggestConnectionsOutput = z.infer<typeof SuggestConnectionsOutputSchema>;

export async function suggestConnections(input: SuggestConnectionsInput): Promise<SuggestConnectionsOutput> {
  return suggestConnectionsFlow(input);
}

const suggestConnectionsPrompt = ai.definePrompt({
  name: 'suggestConnectionsPrompt',
  input: {schema: SuggestConnectionsInputSchema},
  output: {schema: SuggestConnectionsOutputSchema},
  prompt: `Based on the following user profile summary, suggest {{numberOfSuggestions}} connections that the user might find relevant or interesting. Provide the suggestions as a list of names or usernames.

Profile Summary: {{{profileSummary}}}`,
});

const suggestConnectionsFlow = ai.defineFlow(
  {
    name: 'suggestConnectionsFlow',
    inputSchema: SuggestConnectionsInputSchema,
    outputSchema: SuggestConnectionsOutputSchema,
  },
  async input => {
    const {output} = await suggestConnectionsPrompt(input);
    return output!;
  }
);
