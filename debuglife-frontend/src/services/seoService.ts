// services/seoService.ts
import {ContentAnalysisResult} from "@/types/contentAnalysis";

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

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${blogId}/seo`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(payload),
        },
    );

    if (!res.ok) {
        throw new Error("Failed to update SEO analysis");
    }
    return res.json();
};
