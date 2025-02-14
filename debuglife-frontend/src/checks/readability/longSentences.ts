// src/checks/readability/longSentences.ts
import { TrafficLight } from "../../types/contentAnalysis";
import { countWords, getSentences, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the proportion of long sentences in the given Markdown content.
 *
 * This function:
 * 1. Cleans the Markdown text using cleanMarkdown to remove headings, code blocks, images, etc.
 * 2. Splits the cleaned text into sentences using the getSentences helper (which uses Compromise).
 * 3. Counts sentences that are considered "long" (more than 20 words).
 * 4. Calculates the ratio of long sentences to total sentences.
 * 5. Returns a TrafficLight status:
 *    - "green" if 25% or fewer sentences are long,
 *    - "amber" if between 25% and 35% are long,
 *    - "red" if more than 35% are long.
 *
 * @param text - The raw Markdown content to analyze.
 * @returns A TrafficLight value ("green", "amber", or "red") based on sentence length.
 */
export const checkLongSentences = (text: string): TrafficLight => {
  // Clean the Markdown text to remove unwanted elements.
  const cleanedText = cleanMarkdown(text);
  // Use getSentences to split the cleaned text into an array of sentences.
  const sentences = getSentences(cleanedText);
  // Count sentences that have more than 20 words.
  const longCount = sentences.filter(s => countWords(s) > 20).length;
  // Calculate the ratio of long sentences to total sentences.
  const ratio = sentences.length > 0 ? longCount / sentences.length : 1;
  
  // Determine the traffic-light status based on the ratio.
  if (ratio <= 0.25) return "green";
  else if (ratio <= 0.35) return "amber";
  else return "red";
};
