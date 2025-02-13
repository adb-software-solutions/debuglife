// hooks/useContentAnalysis.ts
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { updateSEOAnalysis } from "../services/seoService";

// Traffic light type now supports amber
export type TrafficLight = "green" | "amber" | "red";

// SEO Assessment details now include amber scoring (9 = green, 3 = amber, 0 = red)
export interface SEOAssessment {
  score: number; // 9 for green, 3 for amber, 0 for red
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
}

export interface ContentAnalysisResult {
  seoScore: number;         // 0–100
  readabilityScore: number; // 0–100
  seoDetails: SEOAnalysisDetails;
  readabilityDetails: ReadabilityAnalysisDetails;
}

// Helper functions
const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

const splitSentences = (text: string): string[] =>
  text.split(/[\.\!\?]+/).map(s => s.trim()).filter(Boolean);

// Extract markdown subheadings (lines starting with "##" or "###")
const extractSubheadings = (text: string): string[] => {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => /^#{2,3}\s/.test(line))
    .map(line => line.replace(/^#{2,3}\s/, ""));
};

// Count occurrences of a substring (case-insensitive)
const countOccurrences = (text: string, sub: string): number => {
  const regex = new RegExp(sub, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
};

// Extract markdown link texts: pattern [text](url)
const extractLinkTexts = (text: string): string[] => {
  const regex = /\[([^\]]+)\]\([^)]+\)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// Extract markdown image alt texts: pattern ![alt](url)
const extractImageAlts = (text: string): string[] => {
  const regex = /!\[([^\]]*)\]\([^)]+\)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

// For passive voice detection we now support amber:
// Using a naive heuristic: if passive ratio < 5% => green, between 5%-10% => amber, >=10% => red.
// (Replace with a proper NLP library for production.)
const countPassiveSentences = (sentences: string[]): number => {
  return sentences.filter(sentence =>
    /\b(was|were)\b/.test(sentence) && /\bby\b/.test(sentence)
  ).length;
};

interface UseContentAnalysisParams {
  content: string;
  title: string;
  keyphrase: string;
  slug?: string;
  metaDescription?: string;
  cornerstone?: boolean;
  blogId?: string;
}

const useContentAnalysis = ({
  content,
  title,
  keyphrase,
  slug,
  metaDescription,
  cornerstone = false,
  blogId,
}: UseContentAnalysisParams): ContentAnalysisResult => {
  const [analysis, setAnalysis] = useState<ContentAnalysisResult>({
    seoScore: 0,
    readabilityScore: 0,
    seoDetails: { assessments: {} },
    readabilityDetails: {
      longSentences: "red",
      passiveVoice: "red",
      transitionWords: "red",
    },
  });

  const performAnalysis = async () => {
    const assessments: { [key: string]: SEOAssessment } = {};
    const kp = keyphrase.trim();
    const kpLower = kp.toLowerCase();

    // 1. Keyphrase provided
    const kpProvided = kp.length > 0;
    assessments["keyphraseProvided"] = {
      score: kpProvided ? 9 : 0,
      max: 9,
      feedback: kpProvided ? "Focus keyphrase provided." : "No focus keyphrase set.",
    };
    if (!kpProvided) {
      setAnalysis(prev => ({
        ...prev,
        seoScore: 0,
        seoDetails: { assessments },
      }));
      return;
    }

    // Prepare plain text by stripping simple markdown formatting.
    const plainText = content.replace(/[#_*~`>+\-]/g, " ");
    const wordCount = countWords(plainText);
    const sentences = splitSentences(plainText);

    // 2. Keyphrase in content:
    const contentOccurrences = countOccurrences(plainText.toLowerCase(), kpLower);
    // If occurrences >= 2, green; if exactly 1, amber; if 0, red.
    const keyphraseInContent: TrafficLight =
      contentOccurrences >= 2 ? "green" : contentOccurrences === 1 ? "amber" : "red";
    assessments["keyphraseInContent"] = {
      score: keyphraseInContent === "green" ? 9 : keyphraseInContent === "amber" ? 3 : 0,
      max: 9,
      feedback:
        keyphraseInContent === "green"
          ? "Keyphrase found multiple times in content."
          : keyphraseInContent === "amber"
          ? "Keyphrase found only once in content."
          : "Keyphrase not found in content.",
    };

    // 3. Keyphrase in introduction (first paragraph)
    const paragraphs = plainText.split(/\n+/).map(p => p.trim()).filter(Boolean);
    const intro = paragraphs[0] || "";
    const introOccurrences = countOccurrences(intro.toLowerCase(), kpLower);
    const keyphraseInIntroduction: TrafficLight =
      introOccurrences >= 1 ? (introOccurrences >= 2 ? "green" : "amber") : "red";
    assessments["keyphraseInIntroduction"] = {
      score: keyphraseInIntroduction === "green" ? 9 : keyphraseInIntroduction === "amber" ? 3 : 0,
      max: 9,
      feedback:
        keyphraseInIntroduction === "green"
          ? "Keyphrase found clearly in the introduction."
          : keyphraseInIntroduction === "amber"
          ? "Keyphrase found in introduction, but could be more prominent."
          : "Keyphrase not found in the introduction.",
    };

    // 4. Keyphrase in title (assumed H1)
    const titleOccurrences = countOccurrences(title.toLowerCase(), kpLower);
    const keyphraseInTitle: TrafficLight =
      titleOccurrences > 0 ? (titleOccurrences > 1 ? "green" : "amber") : "red";
    assessments["keyphraseInTitle"] = {
      score: keyphraseInTitle === "green" ? 9 : keyphraseInTitle === "amber" ? 3 : 0,
      max: 9,
      feedback:
        keyphraseInTitle === "green"
          ? "Keyphrase found strongly in the title."
          : keyphraseInTitle === "amber"
          ? "Keyphrase found in title, but consider emphasizing it more."
          : "Keyphrase not found in the title.",
    };

    // 5. Text length
    const threshold = cornerstone ? 900 : 300;
    let textLengthStatus: TrafficLight;
    if (wordCount >= threshold) {
      textLengthStatus = "green";
    } else if (wordCount >= threshold * 0.8) {
      textLengthStatus = "amber";
    } else {
      textLengthStatus = "red";
    }
    assessments["textLength"] = {
      score: textLengthStatus === "green" ? 9 : textLengthStatus === "amber" ? 3 : 0,
      max: 9,
      feedback:
        textLengthStatus === "green"
          ? `Text length is good (${wordCount} words).`
          : `Text length is low (${wordCount} words; recommended at least ${threshold}).`,
    };

    // 6. Keyphrase length (recommended: ≤4 words)
    const kpWordCount = countWords(kp);
    const kpLengthStatus: TrafficLight = kpWordCount <= 4 ? "green" : kpWordCount <= 6 ? "amber" : "red";
    assessments["keyphraseLength"] = {
      score: kpLengthStatus === "green" ? 9 : kpLengthStatus === "amber" ? 3 : 0,
      max: 9,
      feedback:
        kpLengthStatus === "green"
          ? `Keyphrase length is optimal (${kpWordCount} words).`
          : kpLengthStatus === "amber"
          ? `Keyphrase is slightly long (${kpWordCount} words).`
          : `Keyphrase is too long (${kpWordCount} words; recommended maximum is 4).`,
    };

    // 7. Keyphrase density
    const density = wordCount > 0 ? (contentOccurrences / wordCount) * 100 : 0;
    // Recommended density between 0.5% and 3%: if within, green; if slightly off (0.3-0.5 or 3-3.5) then amber; else red.
    let densityStatus: TrafficLight;
    if (density >= 0.5 && density <= 3) {
      densityStatus = "green";
    } else if ((density >= 0.3 && density < 0.5) || (density > 3 && density <= 3.5)) {
      densityStatus = "amber";
    } else {
      densityStatus = "red";
    }
    assessments["keyphraseDensity"] = {
      score: densityStatus === "green" ? 9 : densityStatus === "amber" ? 3 : 0,
      max: 9,
      feedback:
        densityStatus === "green"
          ? `Keyphrase density is optimal (${density.toFixed(2)}%).`
          : densityStatus === "amber"
          ? `Keyphrase density is borderline (${density.toFixed(2)}%).`
          : `Keyphrase density is off (${density.toFixed(2)}%); recommended between 0.5% and 3%.`,
    };

    // 8. Keyphrase in subheadings
    const subheadings = extractSubheadings(content);
    const subheadingCount = subheadings.length;
    const subheadingMatches = subheadings.filter(sh => sh.toLowerCase().includes(kpLower)).length;
    let subheadingStatus: TrafficLight;
    if (subheadingCount === 0) {
      subheadingStatus = "red";
    } else {
      const ratio = subheadingMatches / subheadingCount;
      // For example: if at least 30% but not more than 75% match => green; if less than 30% => red; if more than 75% => amber (over-optimization)
      if (ratio >= 0.30 && ratio <= 0.75) {
        subheadingStatus = "green";
      } else if (ratio > 0.75) {
        subheadingStatus = "amber";
      } else {
        subheadingStatus = "red";
      }
    }
    assessments["keyphraseInSubheadings"] = {
      score: subheadingStatus === "green" ? 9 : subheadingStatus === "amber" ? 3 : 0,
      max: 9,
      feedback:
        subheadingStatus === "green"
          ? "Keyphrase is well represented in subheadings."
          : subheadingStatus === "amber"
          ? "Keyphrase in subheadings is overused; consider moderating."
          : "Keyphrase not adequately found in subheadings.",
    };

    // 9. Link focus keyphrase (in anchor texts)
    const linkTexts = extractLinkTexts(content);
    const linkMatches = linkTexts.filter(lt => lt.toLowerCase().includes(kpLower)).length;
    const linkStatus: TrafficLight = linkMatches > 0 ? "green" : "red";
    assessments["linkFocusKeyphrase"] = {
      score: linkStatus === "green" ? 9 : 0,
      max: 9,
      feedback: linkStatus === "green" ? "Keyphrase found in link anchor texts." : "Keyphrase not found in link texts.",
    };

    // 10. Keyphrase in image alt attributes
    const imageAlts = extractImageAlts(content);
    const altMatches = imageAlts.filter(alt => alt.toLowerCase().includes(kpLower)).length;
    const imageAltStatus: TrafficLight = altMatches > 0 ? "green" : "red";
    assessments["keyphraseInImageAlt"] = {
      score: imageAltStatus === "green" ? 9 : 0,
      max: 9,
      feedback: imageAltStatus === "green" ? "Keyphrase found in image alt attributes." : "Keyphrase not found in image alts.",
    };

    // 11. Keyphrase in slug (if provided)
    if (slug) {
      const slugLower = slug.toLowerCase();
      const slugStatus: TrafficLight = slugLower.includes(kpLower) ? "green" : "red";
      assessments["keyphraseInSlug"] = {
        score: slugStatus === "green" ? 9 : 0,
        max: 9,
        feedback: slugStatus === "green" ? "Keyphrase found in slug." : "Keyphrase not found in slug.",
      };
    }

    // 12. Keyphrase in meta description (if provided)
    if (metaDescription) {
      const metaLower = metaDescription.toLowerCase();
      const metaStatus: TrafficLight = metaLower.includes(kpLower) ? "green" : "red";
      assessments["keyphraseInMetaDescription"] = {
        score: metaStatus === "green" ? 9 : 0,
        max: 9,
        feedback: metaStatus === "green" ? "Keyphrase found in meta description." : "Keyphrase not found in meta description.",
      };
    }

    // 13. SEO title width: using title length (ideal between 30-60 characters)
    const titleLength = title.trim().length;
    let titleWidthStatus: TrafficLight;
    if (titleLength >= 30 && titleLength <= 60) {
      titleWidthStatus = "green";
    } else if ((titleLength >= 25 && titleLength < 30) || (titleLength > 60 && titleLength <= 70)) {
      titleWidthStatus = "amber";
    } else {
      titleWidthStatus = "red";
    }
    assessments["seoTitleWidth"] = {
      score: titleWidthStatus === "green" ? 9 : titleWidthStatus === "amber" ? 3 : 0,
      max: 9,
      feedback:
        titleWidthStatus === "green"
          ? "SEO title width is optimal."
          : "SEO title width is suboptimal (recommended between 30 and 60 characters).",
    };

    // Compute overall SEO score
    const seoKeys = Object.keys(assessments);
    const totalPoints = seoKeys.reduce((sum, key) => sum + assessments[key].score, 0);
    const maxPoints = seoKeys.length * 9;
    const overallSEOScore = Math.round((totalPoints / maxPoints) * 100);

    const seoDetails: SEOAnalysisDetails = { assessments };

    // --- Readability Assessments ---
    // 1. Sentence length: less than 25% of sentences > 20 words.
    const longSentencesCount = sentences.filter(s => countWords(s) > 20).length;
    const longSentenceRatio = sentences.length > 0 ? longSentencesCount / sentences.length : 1;
    const longSentences: TrafficLight = longSentenceRatio <= 0.25 ? "green" : longSentenceRatio <= 0.35 ? "amber" : "red";

    // 2. Passive voice: using our naive heuristic. Now: <5% = green, 5%-10% = amber, >=10% = red.
    const passiveCount = countPassiveSentences(sentences);
    const passiveRatio = sentences.length > 0 ? passiveCount / sentences.length : 1;
    const passiveVoice: TrafficLight =
      passiveRatio < 0.05 ? "green" : passiveRatio < 0.10 ? "amber" : "red";

    // 3. Transition words: at least 30% sentences with at least one.
    const sentencesWithTransition = sentences.filter(s =>
      ["however", "therefore", "moreover", "furthermore", "meanwhile", "thus", "consequently", "additionally", "in addition"].some(word =>
        s.toLowerCase().includes(word)
      )
    ).length;
    const transitionRatio = sentences.length > 0 ? sentencesWithTransition / sentences.length : 0;
    const transitionWordsStatus: TrafficLight =
      transitionRatio >= 0.30 ? "green" : transitionRatio >= 0.20 ? "amber" : "red";

    // Readability score: each of three checks is weighted equally.
    const readabilityPoints =
      (longSentences === "green" ? 33.3 : longSentences === "amber" ? 16.7 : 0) +
      (passiveVoice === "green" ? 33.3 : passiveVoice === "amber" ? 16.7 : 0) +
      (transitionWordsStatus === "green" ? 33.4 : transitionWordsStatus === "amber" ? 16.7 : 0);
    const overallReadabilityScore = Math.round(readabilityPoints);

    const readabilityDetails: ReadabilityAnalysisDetails = {
      longSentences,
      passiveVoice,
      transitionWords: transitionWordsStatus,
    };

    const newAnalysis: ContentAnalysisResult = {
      seoScore: overallSEOScore,
      readabilityScore: overallReadabilityScore,
      seoDetails,
      readabilityDetails,
    };

    setAnalysis(newAnalysis);

    // Optionally update backend
    if (blogId) {
      try {
        await updateSEOAnalysis(blogId, newAnalysis);
      } catch (error) {
        console.error("Failed to update SEO analysis on backend:", error);
      }
    }
  };

  const debouncedAnalysis = debounce(performAnalysis, 500);
  useEffect(() => {
    debouncedAnalysis();
    return () => debouncedAnalysis.cancel();
  }, [content, title, keyphrase, slug, metaDescription, cornerstone, blogId]);

  return analysis;
};

export default useContentAnalysis;
