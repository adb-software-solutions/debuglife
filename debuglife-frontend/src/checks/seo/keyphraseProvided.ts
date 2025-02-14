// src/checks/seo/keyphraseProvided.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";

export const checkKeyphraseProvided = (params: UseContentAnalysisParams): SEOAssessment => {
  const kp = params.keyphrase.trim();
  const kpProvided = kp.length > 0;
  return {
    score: kpProvided ? 9 : 0,
    max: 9,
    feedback: kpProvided ? "Focus keyphrase provided." : "No focus keyphrase set.",
  };
};
