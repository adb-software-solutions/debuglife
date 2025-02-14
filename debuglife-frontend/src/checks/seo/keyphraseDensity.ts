// src/checks/seo/keyphraseDensity.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { countWords, getSentences } from "../../utils/textUtils";

/**
 * This function calculates keyphrase density in a more advanced manner:
 * - It uses the existing getSentences helper (which leverages compromise)
 *   to split the text into sentences.
 * - It splits the keyphrase into individual words.
 * - For each sentence, it checks if every word in the keyphrase is present.
 * - Each sentence that contains all keyphrase words is counted as one occurrence.
 * - Density is computed as: (number of matching sentences / total word count) * 100.
 *
 * Thresholds:
 *  - Green if density is between 0.5% and 3%.
 *  - Amber if density is borderline (0.3–0.5% or 3–3.5%).
 *  - Red otherwise.
 */
export const checkKeyphraseDensity = (params: UseContentAnalysisParams, plainText: string): SEOAssessment => {
  // Use getSentences from our textUtils helper.
  const sentences = getSentences(plainText);
  // Normalize and split the keyphrase into individual words.
  const kpWords = params.keyphrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  // Count how many sentences contain all the keyphrase words.
  let matchCount = 0;
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const allWordsPresent = kpWords.every(word => lowerSentence.includes(word));
    if (allWordsPresent) {
      matchCount += 1;
    }
  });

  // Total word count from plainText.
  const totalWords = countWords(plainText);
  const density = totalWords > 0 ? (matchCount / totalWords) * 100 : 0;

  // Determine traffic-light status based on density.
  let status: TrafficLight;
  if (density >= 0.5 && density <= 3) {
    status = "green";
  } else if ((density >= 0.3 && density < 0.5) || (density > 3 && density <= 3.5)) {
    status = "amber";
  } else {
    status = "red";
  }

  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? `Keyphrase density is optimal (${density.toFixed(2)}% based on ${matchCount} matching sentences).`
      : status === "amber"
      ? `Keyphrase density is borderline (${density.toFixed(2)}% based on ${matchCount} matching sentences).`
      : `Keyphrase density is off (${density.toFixed(2)}% based on ${matchCount} matching sentences); recommended between 0.5% and 3%.`,
  };
};
