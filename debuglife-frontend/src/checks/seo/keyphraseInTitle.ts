// src/checks/seo/keyphraseInTitle.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";

export const checkKeyphraseInTitle = (params: UseContentAnalysisParams, title: string): SEOAssessment => {
  // Normalize the title.
  const titleLower = title.toLowerCase();
  // Split the keyphrase into individual words.
  const kpWords = params.keyphrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  // Count how many keyphrase words are present in the title.
  const matches = kpWords.filter(word => titleLower.includes(word)).length;
  
  // Determine status:
  // - If all keyphrase words are present, then it's green.
  // - If only some of the words are present, then it's amber.
  // - If none are present, then it's red.
  let status: TrafficLight;
  if (matches === kpWords.length && kpWords.length > 0) {
    status = "green";
  } else if (matches > 0) {
    status = "amber";
  } else {
    status = "red";
  }
  
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? "Keyphrase found strongly in title."
      : status === "amber"
      ? "Keyphrase partially found in title; consider emphasizing it more."
      : "Keyphrase not found in title.",
  };
};
