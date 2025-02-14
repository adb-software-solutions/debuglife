// src/checks/seo/keyphraseInMetaDescription.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";

export const checkKeyphraseInMetaDescription = (params: UseContentAnalysisParams): SEOAssessment | null => {
  if (!params.metaDescription) return null;

  // Split the focus keyphrase into individual words.
  const kpWords = params.keyphrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const metaLower = params.metaDescription.toLowerCase();

  // Count how many keyphrase words are found in the meta description.
  const foundCount = kpWords.filter(word => metaLower.includes(word)).length;

  let status: TrafficLight;
  if (foundCount === kpWords.length) {
    // All words found: green.
    status = "green";
  } else if (foundCount > 0) {
    // Some words found: amber.
    status = "amber";
  } else {
    // No words found: red.
    status = "red";
  }

  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? "All keyphrase words found in meta description."
      : status === "amber"
      ? "Some keyphrase words found in meta description."
      : "No keyphrase words found in meta description.",
  };
};
