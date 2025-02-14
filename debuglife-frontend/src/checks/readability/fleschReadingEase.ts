import { TrafficLight } from "../../types/contentAnalysis";
import { countWords, getSentences, cleanMarkdown } from "@/utils/textUtils";

/**
 * Estimates the number of syllables in a word using a basic heuristic.
 *
 * @param word - The word to analyze.
 * @returns The estimated syllable count.
 */
const countSyllables = (word: string): number => {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  word = word.replace(/e$/, "");
  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
};

/**
 * Calculates the Flesch Reading Ease Score for the given Markdown content.
 *
 * Formula: 206.835 - 1.015*(words/sentences) - 84.6*(syllables/words)
 *
 * Returns:
 * - "green" if score is between 60 and 70 (acceptable for web copy),
 * - "amber" if score is between 50-60 or 70-80,
 * - "red" if score is below 50 or above 80.
 *
 * @param text - The raw Markdown content.
 * @returns A TrafficLight value indicating reading ease.
 */
export const checkFleschReadingEase = (text: string): TrafficLight => {
  const cleaned = cleanMarkdown(text);
  const sentences = getSentences(cleaned);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  if (totalWords === 0 || sentences.length === 0) return "red";
  
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgWordsPerSentence = totalWords / sentences.length;
  const avgSyllablesPerWord = totalSyllables / totalWords;
  
  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  if (fleschScore >= 60 && fleschScore <= 70) return "green";
  else if ((fleschScore >= 50 && fleschScore < 60) || (fleschScore > 70 && fleschScore <= 80)) return "amber";
  else return "red";
};
