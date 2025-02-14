// src/types/contentAnalysis.ts
export type TrafficLight = "green" | "amber" | "red";

export interface SEOAssessment {
  score: number; // typically 9 (green), 3 (amber), or 0 (red)
  max: number;   // always 9
  feedback?: string;
}

export interface SEOAnalysisDetails {
  assessments: { [key: string]: SEOAssessment };
}

export interface ReadabilityAnalysisDetails {
  longSentences: TrafficLight;
  passiveVoice: TrafficLight;
  transitionWords: TrafficLight;
    paragraphLength: TrafficLight;
    consecutiveSentences: TrafficLight;
    fleschReadingEase: TrafficLight;
    wordComplexity: TrafficLight;
    subheadingDistribution: TrafficLight;
    
}

export interface ContentAnalysisResult {
  seoScore: number;         // 0–100
  readabilityScore: number; // 0–100
  seoDetails: SEOAnalysisDetails;
  readabilityDetails: ReadabilityAnalysisDetails;
}

export interface UseContentAnalysisParams {
  content: string;
  title: string;
  keyphrase: string;
  slug?: string;
  metaDescription?: string;
  cornerstone?: boolean;
  blogId?: string;
}
