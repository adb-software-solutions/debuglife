import { ReadabilityAssessment } from "../../types/contentAnalysis";
import { singleWords, multipleWords, pairedTransitions } from "@/constants/transitionWords";
import { getSentences, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the usage of transition words and paired expressions in the given Markdown content.
 *
 * The function:
 * 1. Cleans the Markdown text.
 * 2. Splits the cleaned text into sentences.
 * 3. Checks each sentence for:
 *    - The presence of any single or multi-word transition expression (from singleWords and multipleWords).
 *    - The presence of any paired transition expression (both parts must appear in the sentence, order does not matter).
 * 4. Counts each sentence that matches at least one of these conditions.
 * 5. Calculates the ratio of matching sentences to the total number of sentences.
 * 6. Returns a ReadabilityAssessment object with:
 *    - score: 9 (green) if 30% or more of sentences contain a transition,
 *             3 (amber) if between 20% and 30% do,
 *             0 (red) if less than 20% do.
 *    - max: always 9.
 *    - feedback: A dynamic message that includes the percentage of sentences containing transitions.
 *
 * @param text - The raw Markdown content to analyze.
 * @returns A ReadabilityAssessment object.
 */
export const checkTransitionWords = (text: string): ReadabilityAssessment => {
  // Clean the markdown content.
  const cleanedText = cleanMarkdown(text);
  // Split cleaned text into sentences.
  const sentences = getSentences(cleanedText);

  // Combine single and multiple word transitions.
  const allTransitions = [...singleWords, ...multipleWords];

  // Helper: Check if a sentence matches a paired transition.
  const matchesPairedTransition = (sentence: string): boolean => {
    const lowerSentence = sentence.toLowerCase();
    return pairedTransitions.some(pair =>
      pair.every(word => lowerSentence.includes(word))
    );
  };

  // Determine for each sentence if it contains any transition (either single/multi or paired).
  const matchingSentences = sentences.filter(sentence => {
    const lowerSentence = sentence.toLowerCase();
    const hasSingleOrMulti = allTransitions.some(transition => lowerSentence.includes(transition));
    const hasPaired = matchesPairedTransition(sentence);
    return hasSingleOrMulti || hasPaired;
  });

  // Calculate the ratio of matching sentences to total sentences.
  const ratio = sentences.length > 0 ? matchingSentences.length / sentences.length : 0;
  const percentage = (ratio * 100).toFixed(2);

  if (ratio >= 0.30) {
    return {
      score: 9,
      max: 9,
      feedback: `Good usage of transition words; ${percentage}% of sentences contain transitions.`,
    };
  } else if (ratio >= 0.20) {
    return {
      score: 3,
      max: 9,
      feedback: `Moderate usage of transition words; only ${percentage}% of sentences contain transitions. Consider adding more for better flow.`,
    };
  } else {
    return {
      score: 0,
      max: 9,
      feedback: `Insufficient usage of transition words; only ${percentage}% of sentences contain transitions.`,
    };
  }
};
