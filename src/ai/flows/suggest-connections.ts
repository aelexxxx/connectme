'use server';

/**
 * @fileOverview Provides AI-driven connection suggestions based on user profile analysis.
 *
 * - suggestConnections - A function that suggests connections based on profile information.
 * - SuggestConnectionsInput - The input type for the suggestConnections function.
 * - SuggestConnectionsOutput - The return type for the suggestConnections function.
 * - SuggestedProfile - The type for an individual suggested profile.
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

const SuggestedProfileSchema = z.object({
  name: z.string().describe('The full name of the suggested connection.'),
  bio: z.string().describe('A short, engaging biography for the suggested connection (around 2-3 sentences).'),
  photoSeed: z.string().describe('A unique seed for a profile picture (e.g., lowercase name with spaces replaced by underscores like "jane_doe"). This seed will be used to construct a URL like https://picsum.photos/seed/SEED_VALUE/200/200.'),
  status: z.string().optional().describe('A brief current status message (e.g., "Exploring new tech trends").'),
  interests: z.array(z.string()).min(2).max(5).describe('A list of 2 to 5 key interests or skills (e.g., ["AI", "Hiking", "Photography"]).')
});

export type SuggestedProfile = z.infer<typeof SuggestedProfileSchema>;

const SuggestConnectionsOutputSchema = z.object({
  suggestions: z
    .array(SuggestedProfileSchema)
    .describe('A list of suggested connection profiles.'),
});

export type SuggestConnectionsOutput = z.infer<typeof SuggestConnectionsOutputSchema>;

export async function suggestConnections(input: SuggestConnectionsInput): Promise<SuggestConnectionsOutput> {
  return suggestConnectionsFlow(input);
}

const suggestConnectionsPrompt = ai.definePrompt({
  name: 'suggestConnectionsPrompt',
  input: {schema: SuggestConnectionsInputSchema},
  output: {schema: SuggestConnectionsOutputSchema},
  prompt: `Based on the following user profile summary, suggest {{numberOfSuggestions}} potential connections.
For each suggestion, you MUST provide:
1.  Their full name.
2.  A short, engaging biography (2-3 sentences).
3.  A unique photo seed for their profile picture. This should be a lowercase version of their name with spaces replaced by underscores (e.g., for "Jane Doe", use "jane_doe").
4.  An optional brief current status message (e.g., "Exploring new tech trends").
5.  A list of 2 to 5 key interests or skills (e.g., ["Artificial Intelligence", "Mountain Biking", "Startups"]).

Present the suggestions as an array of objects, adhering strictly to the output schema.

Profile Summary: {{{profileSummary}}}
`,
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
