// src/checks/seo/seoTitleWidth.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";

export const checkSeoTitleWidth = (params: UseContentAnalysisParams, title: string): SEOAssessment => {
  const titleLength = title.trim().length;
  let status: TrafficLight;
  if (titleLength >= 30 && titleLength <= 60) {
    status = "green";
  } else if ((titleLength >= 25 && titleLength < 30) || (titleLength > 60 && titleLength <= 70)) {
    status = "amber";
  } else {
    status = "red";
  }
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? "SEO title width is optimal."
      : "SEO title width is suboptimal (recommended between 30 and 60 characters).",
  };
};
