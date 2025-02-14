// src/checks/seo/textLength.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { countWords } from "@/utils/textUtils";

export const checkTextLength = (params: UseContentAnalysisParams, plainText: string): SEOAssessment => {
  const wordCount = countWords(plainText);
  const threshold = params.cornerstone ? 900 : 300;
  let status: TrafficLight;
  if (wordCount >= threshold) {
    status = "green";
  } else if (wordCount >= threshold * 0.8) {
    status = "amber";
  } else {
    status = "red";
  }
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? `Text length is good (${wordCount} words).`
      : `Text length is low (${wordCount} words; recommended at least ${threshold}).`,
  };
};
