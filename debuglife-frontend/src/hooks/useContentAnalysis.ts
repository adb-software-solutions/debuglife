// src/hooks/useContentAnalysis.ts
import { useState, useEffect } from "react";
import debounce from "lodash.debounce";
import { updateSEOAnalysis } from "../services/seoService";
import { getPassiveData, getKeyphraseDistributionData, getSentimentData, getLexicalDiversityData } from "../services/nlpService";
import { UseContentAnalysisParams, ContentAnalysisResult } from "../types/contentAnalysis";

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

// Import readability check functions (which now return an object { score, max, feedback }).
import { checkLongSentences } from "../checks/readability/longSentences";
import { checkTransitionWords } from "../checks/readability/transitionWords";
import { checkParagraphLength } from "../checks/readability/paragraphLength";
import { checkConsecutiveSentences } from "../checks/readability/consecutiveSentences";
import { checkFleschReadingEase } from "../checks/readability/fleschReadingEase";
import { checkWordComplexity } from "../checks/readability/wordComplexity";
import { checkSubheadingDistribution } from "../checks/readability/subheadingDistribution";

interface ExtendedUseContentAnalysisParams extends UseContentAnalysisParams {}

const useContentAnalysis = (params: ExtendedUseContentAnalysisParams): ContentAnalysisResult => {
  // Both SEO and readability details use the same structure.
  const [analysis, setAnalysis] = useState<ContentAnalysisResult>({
    seoScore: 0,
    readabilityScore: 0,
    seoDetails: { assessments: {} },
    readabilityDetails: { assessments: {} },
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
    const {keyphraseAssessment}  = await getKeyphraseDistributionData(params.content, params.keyphrase);
    seoAssessments["keyphraseDistribution"] = keyphraseAssessment;
    const slugAssessment = checkKeyphraseInSlug(params);
    if (slugAssessment) seoAssessments["keyphraseInSlug"] = slugAssessment;
    const metaAssessment = checkKeyphraseInMetaDescription(params);
    if (metaAssessment) seoAssessments["keyphraseInMetaDescription"] = metaAssessment;
    seoAssessments["seoTitleWidth"] = checkSeoTitleWidth(params, params.title);

    const seoKeys = Object.keys(seoAssessments);
    const totalSeoPoints = seoKeys.reduce((sum, key) => sum + seoAssessments[key].score, 0);
    // Assuming each SEO check has a maximum score of 9.
    const overallSEOScore = Math.round((totalSeoPoints / (seoKeys.length * 9)) * 100);

    // --- Readability Assessments ---
    // Assign readability checks in the same style as SEO.
    const readabilityAssessments: { [key: string]: any } = {};
    readabilityAssessments["longSentences"] = checkLongSentences(params.content);
    readabilityAssessments["transitionWords"] = checkTransitionWords(params.content);
    readabilityAssessments["paragraphLength"] = checkParagraphLength(params.content);
    readabilityAssessments["consecutiveSentences"] = checkConsecutiveSentences(params.content);
    readabilityAssessments["fleschReadingEase"] = checkFleschReadingEase(params.content);
    readabilityAssessments["wordComplexity"] = checkWordComplexity(params.content, params.cornerstone || false);
    readabilityAssessments["subheadingDistribution"] = checkSubheadingDistribution(params.content);
    // Get passive voice assessment from the backend (assumed to return an object with { score, max, feedback }).
    const { passiveAssessment } = await getPassiveData(
      params.content,
    );
    readabilityAssessments["passiveVoice"] = passiveAssessment;
    // // Get sentiment analysis assessment
    // const { sentimentAssessment } = await getSentimentData(params.content);
    // readabilityAssessments["sentiment"] = sentimentAssessment;
    // // Get lexical diversity assessment
    // const { lexicalDiversityAssessment } = await getLexicalDiversityData(params.content);
    // readabilityAssessments["lexicalDiversity"] = lexicalDiversityAssessment;

    const readabilityKeys = Object.keys(readabilityAssessments);
    const totalReadabilityPoints = readabilityKeys.reduce(
      (sum, key) => sum + readabilityAssessments[key].score,
      0
    );
    // Assuming each readability check has a maximum score of 9.
    const overallReadabilityScore = Math.round((totalReadabilityPoints / (readabilityKeys.length * 9)) * 100);

    setAnalysis({
      seoScore: overallSEOScore,
      readabilityScore: overallReadabilityScore,
      seoDetails: { assessments: seoAssessments },
      readabilityDetails: { assessments: readabilityAssessments },
    });

    if (params.blogId) {
      try {
        await updateSEOAnalysis(params.blogId, {
          seoScore: overallSEOScore,
          readabilityScore: overallReadabilityScore,
          seoDetails: { assessments: seoAssessments },
          readabilityDetails: { assessments: readabilityAssessments },
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
