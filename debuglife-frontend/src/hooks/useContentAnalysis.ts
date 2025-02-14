// src/hooks/useContentAnalysis.ts
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { updateSEOAnalysis } from "../services/seoService";
import { getSentences, countWords } from "@/utils/textUtils";
import { getPassiveData } from "../services/nlpService";
import { UseContentAnalysisParams, ContentAnalysisResult, TrafficLight } from "../types/contentAnalysis";

// Import SEO check functions.
import { checkKeyphraseProvided } from "../checks/seo/keyphraseProvided";
import { checkKeyphraseInIntroduction } from "../checks/seo/keyphraseInIntroduction";
import { checkKeyphraseInTitle } from "../checks/seo/keyphraseInTitle";
import { checkTextLength } from "../checks/seo/textLength";
import { checkKeyphraseLength } from "../checks/seo/keyphraseLength";
import { checkKeyphraseDensity } from "../checks/seo/keyphraseDensity";
import { checkKeyphraseInSubheadings } from "../checks/seo/keyphraseInSubheadings";
import { checkLinkFocusKeyphrase } from "../checks/seo/linkFocusKeyphrase";
import { checkKeyphraseInImageAlt } from "../checks/seo/keyphraseInImageAlt";
import { checkSeoTitleWidth } from "../checks/seo/seoTitleWidth";
import { checkKeyphraseInSlug } from "../checks/seo/keyphraseInSlug";
import { checkKeyphraseInMetaDescription } from "../checks/seo/keyphraseInMetaDescription";

// Import readability check functions.
import { checkLongSentences } from "../checks/readability/longSentences";
import { checkTransitionWords } from "../checks/readability/transitionWords";
import { checkParagraphLength } from "../checks/readability/paragraphLength";
import { checkConsecutiveSentences } from "../checks/readability/consecutiveSentences";
import { checkFleschReadingEase } from "../checks/readability/fleschReadingEase";
import { checkWordComplexity } from "../checks/readability/wordComplexity";
import { checkSubheadingDistribution } from "../checks/readability/subheadingDistribution";

interface ExtendedUseContentAnalysisParams extends UseContentAnalysisParams {}

const useContentAnalysis = (params: ExtendedUseContentAnalysisParams): ContentAnalysisResult => {
  const [analysis, setAnalysis] = useState<ContentAnalysisResult>({
    seoScore: 0,
    readabilityScore: 0,
    seoDetails: { assessments: {} },
    readabilityDetails: {
      longSentences: "red",
      transitionWords: "red",
      paragraphLength: "red",
      consecutiveSentences: "red",
      fleschReadingEase: "red",
      wordComplexity: "red",
      subheadingDistribution: "red",
      passiveVoice: "red",
    },
  });

  const performAnalysis = async () => {
    // --- SEO Assessments ---
    const seoAssessments: { [key: string]: any } = {};
    seoAssessments["keyphraseProvided"] = checkKeyphraseProvided(params);
    seoAssessments["keyphraseInIntroduction"] = checkKeyphraseInIntroduction(params, params.content);
    seoAssessments["keyphraseInTitle"] = checkKeyphraseInTitle(params, params.title);
    seoAssessments["textLength"] = checkTextLength(params, params.content);
    seoAssessments["keyphraseLength"] = checkKeyphraseLength(params);
    seoAssessments["keyphraseDensity"] = checkKeyphraseDensity(params, params.content);
    seoAssessments["keyphraseInSubheadings"] = checkKeyphraseInSubheadings(params, params.content);
    seoAssessments["linkFocusKeyphrase"] = checkLinkFocusKeyphrase(params, params.content);
    seoAssessments["keyphraseInImageAlt"] = checkKeyphraseInImageAlt(params, params.content);
    const slugAssessment = checkKeyphraseInSlug(params);
    if (slugAssessment) seoAssessments["keyphraseInSlug"] = slugAssessment;
    const metaAssessment = checkKeyphraseInMetaDescription(params);
    if (metaAssessment) seoAssessments["keyphraseInMetaDescription"] = metaAssessment;
    seoAssessments["seoTitleWidth"] = checkSeoTitleWidth(params, params.title);

    const seoKeys = Object.keys(seoAssessments);
    const totalSeoPoints = seoKeys.reduce((sum, key) => sum + seoAssessments[key].score, 0);
    const overallSEOScore = Math.round((totalSeoPoints / (seoKeys.length * 9)) * 100);

    // --- Readability Assessments ---
    // Each readability check returns a TrafficLight ("green", "amber", or "red")
    const longSentencesStatus = checkLongSentences(params.content);
    const transitionStatus = checkTransitionWords(params.content);
    const paragraphLengthStatus = checkParagraphLength(params.content);
    const consecutiveStatus = checkConsecutiveSentences(params.content);
    const fleschStatus = checkFleschReadingEase(params.content);
    const wordComplexityStatus = checkWordComplexity(params.content, params.cornerstone || false);
    const subheadingDistributionStatus = checkSubheadingDistribution(params.content);
    // Get passive voice status from the backend.
    const { passiveStatus } = await getPassiveData(params.content, params.title, params.keyphrase, params.cornerstone || false);

    // Map statuses to numeric values: green=100, amber=50, red=0.
    const mapping: Record<TrafficLight, number> = { green: 100, amber: 50, red: 0 };
    const readabilityChecks = {
      longSentences: longSentencesStatus,
      transitionWords: transitionStatus,
      paragraphLength: paragraphLengthStatus,
      consecutiveSentences: consecutiveStatus,
      fleschReadingEase: fleschStatus,
      wordComplexity: wordComplexityStatus,
      subheadingDistribution: subheadingDistributionStatus,
      passiveVoice: passiveStatus,
    };
    const checkValues = Object.values(readabilityChecks);
    const totalReadabilityPoints = checkValues.reduce((sum, status) => sum + mapping[status], 0);
    const overallReadabilityScore = Math.round(totalReadabilityPoints / checkValues.length);

    setAnalysis({
      seoScore: overallSEOScore,
      readabilityScore: overallReadabilityScore,
      seoDetails: { assessments: seoAssessments },
      readabilityDetails: readabilityChecks,
    });

    if (params.blogId) {
      try {
        await updateSEOAnalysis(params.blogId, {
          seoScore: overallSEOScore,
          readabilityScore: overallReadabilityScore,
          seoDetails: { assessments: seoAssessments },
          readabilityDetails: readabilityChecks,
        });
      } catch (error) {
        console.error("Failed to update SEO analysis on backend:", error);
      }
    }
  };

  const debouncedAnalysis = debounce(performAnalysis, 500);
  useEffect(() => {
    debouncedAnalysis();
    return () => debouncedAnalysis.cancel();
  }, [
    params.content,
    params.title,
    params.keyphrase,
    params.slug,
    params.metaDescription,
    params.cornerstone,
    params.blogId,
  ]);

  return analysis;
};

export default useContentAnalysis;
