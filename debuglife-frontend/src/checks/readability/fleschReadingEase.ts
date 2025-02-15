import { ReadabilityAssessment } from "../../types/contentAnalysis";
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
 * Returns a ReadabilityAssessment with:
 *  - score: 9 (green) if the Flesch score is between 60 and 70,
 *           3 (amber) if the Flesch score is between 50-60 or 70-80,
 *           0 (red) if the Flesch score is below 50 or above 80.
 *  - max: always 9.
 *  - feedback: a dynamic message including the computed Flesch score.
 *
 * @param text - The raw Markdown content.
 * @returns A ReadabilityAssessment object indicating reading ease.
 */
export const checkFleschReadingEase = (text: string): ReadabilityAssessment => {
  const cleaned = cleanMarkdown(text);
  const sentences = getSentences(cleaned);
  const words = cleaned.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  
  if (totalWords === 0 || sentences.length === 0) {
    return {
      score: 0,
      max: 9,
      feedback: "Insufficient content to calculate reading ease."
    };
  }
  
  const totalSyllables = words.reduce((sum, word) => sum + countSyllables(word), 0);
  const avgWordsPerSentence = totalWords / sentences.length;
  const avgSyllablesPerWord = totalSyllables / totalWords;
  const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  if (fleschScore >= 60 && fleschScore <= 70) {
    return {
      score: 9,
      max: 9,
      feedback: `Text is very readable (Flesch score: ${fleschScore.toFixed(2)}).`
    };
  } else if ((fleschScore >= 50 && fleschScore < 60) || (fleschScore > 70 && fleschScore <= 80)) {
    return {
      score: 3,
      max: 9,
      feedback: `Text is moderately readable (Flesch score: ${fleschScore.toFixed(2)}); consider simplifying complex sentences.`
    };
  } else {
    return {
      score: 0,
      max: 9,
      feedback: `Text is hard to read (Flesch score: ${fleschScore.toFixed(2)}); revise for clarity.`
    };
  }
};
