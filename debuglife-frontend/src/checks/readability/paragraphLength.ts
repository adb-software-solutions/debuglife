import { TrafficLight } from "../../types/contentAnalysis";
import { countWords, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the length of paragraphs in the given Markdown content.
 * 
 * - Green: All paragraphs are below 150 words.
 * - Amber: At least one paragraph is between 150 and 200 words (and none exceed 200).
 * - Red: Any paragraph exceeds 200 words.
 *
 * @param text - The raw Markdown content.
 * @returns A TrafficLight status ("green", "amber", or "red").
 */
export const checkParagraphLength = (text: string): TrafficLight => {
  const cleaned = cleanMarkdown(text);
  // Split text into paragraphs based on blank lines.
  const paragraphs = cleaned.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
  
  if (paragraphs.length === 0) return "red";
  
  let overall: TrafficLight = "green";
  for (const para of paragraphs) {
    const wordCount = countWords(para);
    if (wordCount > 200) {
      overall = "red";
      break;
    } else if (wordCount > 150) {
      overall = "amber";
    }
  }
  return overall;
};
