// services/seoService.ts
import { ContentAnalysisResult } from "@/types/contentAnalysis";
import { fetchWithCSRF } from "@/helpers/common/csrf";

export const updateSEOAnalysis = async (
  blogId: string,
  analysis: ContentAnalysisResult,
): Promise<any> => {
  const payload = {
    seo_score: analysis.seoScore,
    seo_analysis: {
      details: analysis.seoDetails.assessments,
    },
    readability_score: analysis.readabilityScore,
    readability_analysis: {
      details: analysis.readabilityDetails.assessments,
    },
  };

  const res = await fetchWithCSRF(
    `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${blogId}/seo`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!res.ok) {
    throw new Error("Failed to update SEO analysis");
  }
  return res.json();
};
