'use server';
/**
 * @fileOverview Provides AI-driven social media link suggestions for profiles.
 *
 * - findSocialMediaLinks - A function that finds social media links based on profile information.
 * - FindSocialMediaLinksInput - The input type for the findSocialMediaLinks function.
 * - FindSocialMediaLinksOutput - The return type for the findSocialMediaLinks function.
 * - ComputedSocialLink - The type for an individual computed social link.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindSocialMediaLinksInputSchema = z.object({
  name: z.string().describe("The full name of the person."),
  bio: z.string().describe("A short biography of the person."),
  photoSeed: z.string().describe("A seed (often a username-like string, e.g., 'jane_doe') used for generating a profile photo, which can be a hint for social media usernames."),
  interests: z.array(z.string()).optional().describe("A list of the person's interests or skills."),
  platforms: z.array(z.string()).optional().default(["linkedin", "twitter", "instagram", "github", "wikipedia", "personal_blog_or_website"]).describe("Specific platforms to search for. If not provided, common platforms will be considered."),
});

export type FindSocialMediaLinksInput = z.infer<typeof FindSocialMediaLinksInputSchema>;

const ComputedSocialLinkSchema = z.object({
  platform: z.string().toLowerCase().describe("The social media platform name in lowercase (e.g., 'linkedin', 'twitter', 'instagram', 'github', 'wikipedia', 'personal_blog_or_website')."),
  url: z.string().url().describe("The full URL to the profile or page."),
  justification: z.string().describe("A brief (1-2 sentences) explanation why this link is believed to be correct and relevant to the person."),
});

export type ComputedSocialLink = z.infer<typeof ComputedSocialLinkSchema>;

const FindSocialMediaLinksOutputSchema = z.object({
  socialLinks: z.array(ComputedSocialLinkSchema).describe("A list of suggested social media links or relevant web pages."),
});

export type FindSocialMediaLinksOutput = z.infer<typeof FindSocialMediaLinksOutputSchema>;

export async function findSocialMediaLinks(input: FindSocialMediaLinksInput): Promise<FindSocialMediaLinksOutput> {
  return findSocialMediaLinksFlow(input);
}

const findSocialMediaLinksPrompt = ai.definePrompt({
  name: 'findSocialMediaLinksPrompt',
  input: {schema: FindSocialMediaLinksInputSchema},
  output: {schema: FindSocialMediaLinksOutputSchema},
  prompt: `You are an AI assistant specialized in finding public online profiles and relevant web pages for individuals.
Given a person's name, biography, potential username hint (photoSeed), and interests, your task is to find plausible public URLs for the specified platforms or common professional/social platforms.

Input:
Name: {{{name}}}
Bio: {{{bio}}}
Username Hint (photoSeed): {{{photoSeed}}}
{{#if interests}}Interests: {{#each interests}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/if}}
Platforms to search: {{#each platforms}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

Based on this information, search for and return URLs for the listed platforms.
For each link found, you MUST provide:
1. The platform name (in lowercase, e.g., 'linkedin', 'twitter', 'instagram', 'github', 'wikipedia', 'personal_blog_or_website').
2. The full URL.
3. A brief justification (1-2 sentences) explaining why you believe this link belongs to the person described, considering their name, bio, and interests.

Return up to 3-4 of the most relevant and high-confidence links.
If no plausible links are found for a platform or overall, return an empty list for 'socialLinks'.
Prioritize official-looking profiles or pages. Avoid fan pages, directories, or clearly unrelated results.
Be cautious and prefer not to return a link if confidence is low. Ensure URLs are valid.
For 'personal_blog_or_website', try to find a personal site if it seems distinct from a platform profile.
`,
});

const findSocialMediaLinksFlow = ai.defineFlow(
  {
    name: 'findSocialMediaLinksFlow',
    inputSchema: FindSocialMediaLinksInputSchema,
    outputSchema: FindSocialMediaLinksOutputSchema,
  },
  async input => {
    // Ensure default platforms if not provided
    const filledInput = {
      ...input,
      platforms: input.platforms && input.platforms.length > 0 
        ? input.platforms 
        : ["linkedin", "twitter", "instagram", "github", "wikipedia", "personal_blog_or_website"],
    };

    const {output} = await findSocialMediaLinksPrompt(filledInput);
    
    if (!output) {
        return { socialLinks: [] };
    }
    // Filter out any links that might have invalid URLs, despite Zod validation
    const validSocialLinks = output.socialLinks.filter(link => {
        try {
            new URL(link.url);
            return true;
        } catch (e) {
            console.warn(`Invalid URL found and filtered: ${link.url}`);
            return false;
        }
    });

    return { socialLinks: validSocialLinks };
  }
);
