// src/checks/seo/keyphraseInSlug.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";

export const checkKeyphraseInSlug = (params: UseContentAnalysisParams): SEOAssessment | null => {
  if (!params.slug) return null;
  
  // Normalize slug: lowercase and replace hyphens with spaces.
  const slugClean = params.slug.toLowerCase().replace(/-/g, " ");
  // Normalize and split the keyphrase into individual words.
  const kpWords = params.keyphrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  // Count how many keyphrase words are present in the slug.
  const foundCount = kpWords.filter(word => slugClean.includes(word)).length;
  
  // Determine status.
  let status: TrafficLight;
  if (foundCount === kpWords.length) {
    status = "green";
  } else if (foundCount > 0) {
    status = "amber";
  } else {
    status = "red";
  }
  
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? "All keyphrase words found in slug."
      : status === "amber"
      ? "Some keyphrase words found in slug."
      : "Keyphrase not found in slug.",
  };
};
