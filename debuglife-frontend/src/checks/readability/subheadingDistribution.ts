import { TrafficLight } from "../../types/contentAnalysis";
import { countWords, extractSubheadings, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the distribution of subheadings within the content.
 *
 * - If the text is longer than 300 words and has no subheadings, returns red.
 * - Splits the content into sections at subheadings and checks that no section exceeds 300 words.
 *
 * @param text - The raw Markdown content.
 * @returns "green" if subheadings are appropriately distributed, "red" otherwise.
 */
export const checkSubheadingDistribution = (text: string): TrafficLight => {
  const cleaned = cleanMarkdown(text);
  const totalWords = countWords(cleaned);
  
  const subheadings = extractSubheadings(text);
  if (totalWords > 300 && subheadings.length === 0) return "red";
  
  // Split content by subheadings; here we assume subheadings start with '#' at the beginning of a line.
  const sections = cleaned.split(/\n(?=#)/).map(s => s.trim()).filter(Boolean);
  for (const section of sections) {
    if (countWords(section) > 300) return "red";
  }
  
  return "green";
};
