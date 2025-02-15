// src/checks/readability/wordComplexity.ts
import { ReadabilityAssessment } from "../../types/contentAnalysis";
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
 * Returns a ReadabilityAssessment object with:
 *  - score: 9 (green) if less than 10% of words are complex,
 *           3 (amber) for regular content if 10% or more are complex,
 *           0 (red) for cornerstone content if 10% or more are complex.
 *  - max: always 9.
 *  - feedback: A dynamic message including the percentage of complex words.
 *
 * @param text - The raw Markdown content.
 * @param cornerstone - Indicates if the content is cornerstone (more strict).
 * @returns A ReadabilityAssessment object.
 */
export const checkWordComplexity = (text: string, cornerstone: boolean = false): ReadabilityAssessment => {
  const cleaned = cleanMarkdown(text);
  const words = cleaned.split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return { score: 0, max: 9, feedback: "No words found to evaluate complexity." };
  }
  
  const complexCount = words.filter(word => {
    // Exclude words that start with a capital letter.
    if (word[0] === word[0].toUpperCase()) return false;
    // A word is complex if it is longer than 7 characters and not common.
    return word.length > 7 && !commonWordsSet.has(word.toLowerCase());
  }).length;
  
  const ratio = complexCount / words.length;
  const percentage = (ratio * 100).toFixed(2);
  
  if (ratio < 0.10) {
    return {
      score: 9,
      max: 9,
      feedback: `Few complex words detected (${percentage}% of words are complex); text is easy to understand.`
    };
  } else if (cornerstone) {
    return {
      score: 0,
      max: 9,
      feedback: `Too many complex words for cornerstone content (${percentage}% of words are complex); consider simplifying the language.`
    };
  } else {
    return {
      score: 3,
      max: 9,
      feedback: `Some complex words detected (${percentage}% of words are complex); consider using simpler language.`
    };
  }
};
