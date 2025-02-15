import { cleanMarkdown } from "@/utils/textUtils";
import { ReadabilityAssessment, SEOAssessment } from "@/types/contentAnalysis";

export const getPassiveData = async (
  text: string,
): Promise<{ passiveAssessment: ReadabilityAssessment }> => {
  // Clean the Markdown content to remove non-prose elements.
  const cleanedText = cleanMarkdown(text);
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/seo/analyze-passive-text`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: cleanedText }),
    }
  );
  const data = await res.json();
  // Return the passiveAssessment as a ReadabilityAssessment.
  return { passiveAssessment: data.passive_assessment };
};


export const getKeyphraseDistributionData = async (
  text: string,
  keyphrase: string
): Promise<{ keyphraseAssessment: SEOAssessment }> => {
  // Clean the Markdown content.
  const cleanedText = cleanMarkdown(text);
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/seo/analyze-keyphrase-distribution`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      // Pass both content and keyphrase to the endpoint.
      body: JSON.stringify({ content: cleanedText, keyphrase }),
    }
  );
  const data = await res.json();
  // Return the keyphraseAssessment as a SEOAssessment.
  return { keyphraseAssessment: data.keyphrase_assessment };
};

export const getLexicalDiversityData = async (
  text: string,
): Promise<{ lexicalDiversityAssessment: ReadabilityAssessment }> => {
  // Clean the Markdown content.
  const cleanedText = cleanMarkdown(text);
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/seo/analyze-lexical-diversity`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      // Pass both content and keyphrase to the endpoint.
      body: JSON.stringify({ content: cleanedText }),
    }
  );
  const data = await res.json();
  // Return the lexicalDiversityAssessment as a SEOAssessment.
  return { lexicalDiversityAssessment: data.lexical_diversity_assessment };
};

export const getSentimentData = async (
  text: string,
): Promise<{ sentimentAssessment: ReadabilityAssessment }> => {
  // Clean the Markdown content.
  const cleanedText = cleanMarkdown(text);
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/seo/analyze-sentiment`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      // Pass both content and keyphrase to the endpoint.
      body: JSON.stringify({ content: cleanedText }),
    }
  );
  const data = await res.json();
  // Return the sentimentAssessment as a SEOAssessment.
  return { sentimentAssessment: data.sentiment_assessment };
};