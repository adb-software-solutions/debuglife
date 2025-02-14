// src/checks/seo/keyphraseLength.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { countWords } from "../../utils/textUtils";

export const checkKeyphraseLength = (params: UseContentAnalysisParams): SEOAssessment => {
  const kp = params.keyphrase.trim();
  const kpWordCount = countWords(kp);
  let status: TrafficLight | "no-keyphrase";
  if (kpWordCount === 0) {
    status = "no-keyphrase";
  } else if (kpWordCount <= 4) {
    status = "green";
  } else if (kpWordCount <= 6) {
    status = "amber";
  } else {
    status = "red";
  }
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? `Keyphrase length is optimal (${kpWordCount} words).`
      : status === "amber"
      ? `Keyphrase is slightly long (${kpWordCount} words).`
      : status === "no-keyphrase"
        ? "No keyphrase set."
      : `Keyphrase is too long (${kpWordCount} words; recommended maximum is 4).`,
  };
};
