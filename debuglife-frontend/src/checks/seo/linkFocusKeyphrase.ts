// src/checks/seo/linkFocusKeyphrase.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { extractLinkTexts } from "../../utils/textUtils";

export const checkLinkFocusKeyphrase = (params: UseContentAnalysisParams, content: string): SEOAssessment => {
  const kpLower = params.keyphrase.toLowerCase();
  const linkTexts = extractLinkTexts(content);
  const matches = linkTexts.filter(lt => lt.toLowerCase().includes(kpLower)).length;
  const status: TrafficLight = matches > 0 ? "green" : "red";
  return {
    score: status === "green" ? 9 : 0,
    max: 9,
    feedback: status === "green"
      ? "Keyphrase found in link anchor texts."
      : "Keyphrase not found in link texts.",
  };
};
