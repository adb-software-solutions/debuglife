// services/seoService.ts
import { ContentAnalysisResult } from "@/hooks/useSEOAnalysis";

export const updateSEOAnalysis = async (
  blogId: string,
  analysis: ContentAnalysisResult
): Promise<any> => {
  // The payload now includes an overall traffic light (green/amber/red) computed from the SEO score.
  const overallTrafficLight =
    analysis.seoScore >= 80 ? "green" : analysis.seoScore >= 50 ? "amber" : "red";
    
  const payload = {
    seo_score: analysis.seoScore,
    seo_analysis: {
      trafficLight: overallTrafficLight,
      details: analysis.seoDetails.assessments,
    },
  };

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${blogId}/seo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // include credentials for CSRF if needed
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update SEO analysis");
  }
  return res.json();
};
