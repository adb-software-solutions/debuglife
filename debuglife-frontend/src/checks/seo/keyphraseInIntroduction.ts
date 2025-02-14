// src/checks/seo/keyphraseInIntroduction.ts
import { UseContentAnalysisParams, SEOAssessment, TrafficLight } from "../../types/contentAnalysis";
import { cleanMarkdown, getSentences } from "../../utils/textUtils";

export const checkKeyphraseInIntroduction = (params: UseContentAnalysisParams, content: string): SEOAssessment => {
  // Clean the Markdown to remove headings, images, code blocks, etc.
  const cleaned = cleanMarkdown(content);
  
  // Split cleaned text into paragraphs.
  const paragraphs = cleaned.split(/\n+/).map(p => p.trim()).filter(Boolean);
  
  // Use the first non-empty paragraph as the introduction.
  const intro = paragraphs[0] || "";
  
  // Split the introduction into sentences using the existing getSentences helper.
  const sentences = getSentences(intro);
  
  // Normalize the keyphrase and split it into words.
  const kpWords = params.keyphrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  
  // Count the number of sentences in the introduction that contain all keyphrase words.
  let matchCount = 0;
  sentences.forEach(sentence => {
    const lowerSentence = sentence.toLowerCase();
    if (kpWords.every(word => lowerSentence.includes(word))) {
      matchCount += 1;
    }
  });
  
  // Determine the traffic-light status based on matchCount:
  //   green: 2 or more sentences contain the keyphrase,
  //   amber: exactly 1 sentence,
  //   red: none.
  const status: TrafficLight = matchCount >= 2 ? "green" : matchCount === 1 ? "amber" : "red";
  
  return {
    score: status === "green" ? 9 : status === "amber" ? 3 : 0,
    max: 9,
    feedback: status === "green"
      ? `Keyphrase appears clearly in the introduction across ${matchCount} sentence(s).`
      : status === "amber"
      ? "Keyphrase appears once in the introduction; consider emphasizing it more."
      : "Keyphrase not found in the introduction.",
  };
};
