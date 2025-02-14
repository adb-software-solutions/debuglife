// src/checks/seo/keyphraseInImageAlt.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { extractImageAlts } from "../../utils/textUtils";

export const checkKeyphraseInImageAlt = (params: UseContentAnalysisParams, content: string): SEOAssessment => {
  const kpLower = params.keyphrase.toLowerCase();
  const imageAlts = extractImageAlts(content);
  const matches = imageAlts.filter(alt => alt.toLowerCase().includes(kpLower)).length;
  const status: TrafficLight = matches > 0 ? "green" : "red";
  return {
    score: status === "green" ? 9 : 0,
    max: 9,
    feedback: status === "green"
      ? "Keyphrase found in image alt attributes."
      : "Keyphrase not found in image alt texts.",
  };
};
