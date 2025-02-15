import { ReadabilityAssessment } from "../../types/contentAnalysis";
import { countWords, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the length of paragraphs in the given Markdown content.
 * 
 * Returns a ReadabilityAssessment object with:
 *  - score: 9 (green) if all paragraphs are below 150 words,
 *           3 (amber) if at least one paragraph is between 150 and 200 words (none exceed 200),
 *           0 (red) if any paragraph exceeds 200 words.
 *  - max: always 9.
 *  - feedback: a dynamic message based on the paragraphs' word counts.
 *
 * @param text - The raw Markdown content.
 * @returns A ReadabilityAssessment object.
 */
export const checkParagraphLength = (text: string): ReadabilityAssessment => {
  const cleaned = cleanMarkdown(text);
  // Split text into paragraphs based on blank lines.
  const paragraphs = cleaned.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  
  if (paragraphs.length === 0) {
    return { score: 0, max: 9, feedback: "No paragraphs found; text may be lacking structure." };
  }
  
  let status: "green" | "amber" | "red" = "green";
  
  for (const para of paragraphs) {
    const wordCount = countWords(para);
    if (wordCount > 200) {
      status = "red";
      break;
    } else if (wordCount > 150) {
      status = "amber";
      // Continue checking to see if any paragraph exceeds 200 words.
    }
  }
  
  if (status === "red") {
    return {
      score: 0,
      max: 9,
      feedback: "One or more paragraphs exceed 200 words; text may be too dense and difficult to read."
    };
  } else if (status === "amber") {
    return {
      score: 3,
      max: 9,
      feedback: "Some paragraphs are between 150 and 200 words; consider shortening them for improved readability."
    };
  } else {
    return {
      score: 9,
      max: 9,
      feedback: "All paragraphs are concise and easy to read."
    };
  }
};
