// src/checks/seo/keyphraseInSubheadings.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { extractSubheadings } from "@/utils/textUtils";

/**
 * Evaluates the representation of the focus keyphrase within the subheadings of the content.
 * 
 * This function works as follows:
 * 
 * 1. It tokenizes the focus keyphrase into individual words (all lowercased).
 * 2. It extracts subheadings from the provided content using the extractSubheadings helper.
 * 3. For each subheading, it checks how many keyphrase words appear:
 *    - A full match occurs if every keyphrase word is found in the subheading.
 *    - A partial match occurs if some (but not all) keyphrase words are found.
 * 4. It computes a weighted ratio, where:
 *    - Each full match counts as 1 point.
 *    - Each partial match counts as 0.5 points.
 * 5. The weighted ratio is then compared against thresholds:
 *    - Green (optimal) if the ratio is between 0.30 and 0.75.
 *    - Amber if the ratio is greater than 0 but below 0.30 or above 0.75.
 *    - Red if no matches are found.
 * 
 * @param params - The content analysis parameters including the focus keyphrase.
 * @param content - The raw markdown content from which subheadings are to be extracted.
 * @returns An SEOAssessment object with a score (9, 3, or 0), a maximum of 9, and feedback.
 */
export const checkKeyphraseInSubheadings = (params: UseContentAnalysisParams, content: string): SEOAssessment => {
  // Convert the focus keyphrase to lowercase and split into individual words.
  const kpWords = params.keyphrase.trim().toLowerCase().split(/\s+/).filter(Boolean);

  // Extract subheadings from the content.
  const subheadings = extractSubheadings(content);
  const totalSubheadings = subheadings.length;
  
  // Initialize counters for full and partial matches.
  let fullMatchCount = 0;
  let partialMatchCount = 0;
  
  // For each subheading, determine if it fully or partially contains the keyphrase words.
  subheadings.forEach(sh => {
    const lowerSh = sh.toLowerCase();
    // Check if every keyphrase word appears in the subheading.
    const wordsFound = kpWords.filter(word => lowerSh.includes(word)).length;
    
    if (wordsFound === kpWords.length) {
      // All words found => full match.
      fullMatchCount += 1;
    } else if (wordsFound > 0) {
      // Some words found => partial match.
      partialMatchCount += 1;
    }
  });
  
  // If there are no subheadings, return a red assessment.
  if (totalSubheadings === 0) {
    return {
      score: 0,
      max: 9,
      feedback: "No subheadings found.",
    };
  }
  
  // Calculate weighted score: full matches count as 1, partial matches as 0.5.
  const weightedScore = fullMatchCount + 0.5 * partialMatchCount;
  const ratio = weightedScore / totalSubheadings;
  
  // Determine the overall status based on the ratio.
  let status: TrafficLight;
  if (ratio >= 0.30 && ratio <= 0.75) {
    status = "green";
  } else if (ratio > 0 && (ratio < 0.30 || ratio > 0.75)) {
    status = "amber";
  } else {
    status = "red";
  }
  
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? `Keyphrase is well represented in subheadings. Weighted ratio: ${ratio.toFixed(2)}.`
      : status === "amber"
      ? `Keyphrase representation in subheadings is borderline. Weighted ratio: ${ratio.toFixed(2)}.`
      : "Keyphrase not adequately found in subheadings.",
  };
};
