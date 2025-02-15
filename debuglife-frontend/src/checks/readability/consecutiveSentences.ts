import { ReadabilityAssessment } from "../../types/contentAnalysis";
import { getSentences, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates consecutive sentences that start with the same word.
 *
 * If three or more consecutive sentences (or headings) start with the same word,
 * this check returns a "red" result (score 0). Otherwise, it returns "green" (score 9).
 *
 * @param text - The raw Markdown content.
 * @returns A ReadabilityAssessment object with:
 *  - score: 9 (green) if no issues, 0 (red) if there are 3 or more consecutive sentences starting with the same word.
 *  - max: always 9.
 *  - feedback: dynamic message based on the assessment.
 */
export const checkConsecutiveSentences = (text: string): ReadabilityAssessment => {
  const cleaned = cleanMarkdown(text);
  const sentences = getSentences(cleaned);

  // If there are fewer than 3 sentences, it's automatically "green".
  if (sentences.length < 3) {
    return { score: 9, max: 9, feedback: "No issues with consecutive sentences." };
  }

  let currentWord = "";
  let count = 0;
  let maxCount = 0;

  for (const sentence of sentences) {
    // Extract the first word of the sentence.
    const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase() || "";
    if (firstWord === currentWord && firstWord !== "") {
      count++;
    } else {
      currentWord = firstWord;
      count = 1;
    }
    if (count > maxCount) maxCount = count;
  }

  if (maxCount >= 3) {
    return {
      score: 0,
      max: 9,
      feedback: `Too many consecutive sentences start with the same word (maximum consecutive count: ${maxCount}); disrupts flow.`,
    };
  }
  return { score: 9, max: 9, feedback: "No issues with consecutive sentences." };
};
