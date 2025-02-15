// src/checks/readability/longSentences.ts
import { ReadabilityAssessment } from "../../types/contentAnalysis";
import { countWords, getSentences, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the proportion of long sentences in the given Markdown content.
 *
 * A sentence is considered "long" if it contains more than 20 words.
 *
 * Returns a ReadabilityAssessment object with:
 *  - score: 9 if 25% or fewer sentences are long,
 *           3 if between 25% and 35% are long,
 *           0 if more than 35% are long.
 *  - max: always 9.
 *  - feedback: a dynamic message including the percentage of long sentences.
 *
 * @param text - The raw Markdown content to analyze.
 * @returns A ReadabilityAssessment object.
 */
export const checkLongSentences = (text: string): ReadabilityAssessment => {
  // Clean the Markdown text to remove unwanted elements.
  const cleanedText = cleanMarkdown(text);
  // Split the cleaned text into an array of sentences.
  const sentences = getSentences(cleanedText);
  // Count sentences that have more than 20 words.
  const longCount = sentences.filter(s => countWords(s) > 20).length;
  // Calculate the ratio of long sentences to total sentences.
  const ratio = sentences.length > 0 ? longCount / sentences.length : 1;
  const percentage = (ratio * 100).toFixed(2);

  // Determine the assessment based on the ratio.
  if (ratio <= 0.25) {
    return {
      score: 9,
      max: 9,
      feedback: `Few long sentences (${percentage}% of sentences are long); text is well-structured.`,
    };
  } else if (ratio <= 0.35) {
    return {
      score: 3,
      max: 9,
      feedback: `Some long sentences (${percentage}% are long); consider breaking them up.`,
    };
  } else {
    return {
      score: 0,
      max: 9,
      feedback: `Too many long sentences (${percentage}% are long); text may be hard to read.`,
    };
  }
};
