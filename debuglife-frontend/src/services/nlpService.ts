// src/services/nlpService.ts
import { cleanMarkdown } from "@/utils/textUtils";

export const getPassiveData = async (
  text: string,
  title: string,
  keyphrase: string,
  cornerstone: boolean
): Promise<{ passiveRatio: number; passiveStatus: "green" | "amber" | "red" }> => {
  // Clean the Markdown content to remove non-prose elements.
  const cleanedText = cleanMarkdown(text);
  
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/blog/seo/analyze`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ content: cleanedText, title, keyphrase, cornerstone }),
    }
  );
  const data = await res.json();
  return { passiveRatio: data.passive_ratio, passiveStatus: data.passive_status };
};
