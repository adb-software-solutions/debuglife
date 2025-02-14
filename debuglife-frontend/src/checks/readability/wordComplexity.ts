// src/checks/readability/wordComplexity.ts
import { TrafficLight } from "../../types/contentAnalysis";
import { countWords, cleanMarkdown } from "@/utils/textUtils";
import { commonWords } from "@/data/commonWords";

// Convert the commonWords array into a Set for efficient lookup.
const commonWordsSet = new Set(commonWords.map(word => word.toLowerCase()));

/**
 * Evaluates word complexity in the given Markdown content.
 *
 * A word is considered complex if:
 * - It is longer than seven characters,
 * - It does not appear in the top 5000 most frequent words,
 * - It does not start with a capital letter.
 *
 * Returns "green" if less than 10% of words are complex, "amber" otherwise for regular content,
 * and "red" for cornerstone content if 10% or more of words are complex.
 *
 * @param text - The raw Markdown content.
 * @param cornerstone - Indicates if the content is cornerstone (more strict).
 * @returns A TrafficLight value ("green", "amber", or "red").
 */
export const checkWordComplexity = (text: string, cornerstone: boolean = false): TrafficLight => {
  const cleaned = cleanMarkdown(text);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) return "red";
  
  const complexCount = words.filter(word => {
    // Exclude words that start with a capital letter.
    if (word[0] === word[0].toUpperCase()) return false;
    // A word is complex if it is longer than 7 characters and not common.
    return word.length > 7 && !commonWordsSet.has(word.toLowerCase());
  }).length;
  
  const ratio = complexCount / words.length;
  return ratio < 0.10 ? "green" : cornerstone ? "red" : "amber";
};
