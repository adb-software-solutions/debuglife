// src/checks/readability/transitionWords.ts
import { TrafficLight } from "../../types/contentAnalysis";
import { singleWords, multipleWords, pairedTransitions } from "@/constants/transitionWords";
import { getSentences, cleanMarkdown } from "@/utils/textUtils";

/**
 * Evaluates the usage of transition words and paired expressions in the given Markdown content.
 *
 * The function:
 * 1. Cleans the Markdown text using cleanMarkdown.
 * 2. Splits the cleaned text into sentences using getSentences.
 * 3. Checks each sentence for:
 *    - The presence of any single or multi-word transition expression (from singleWords and multipleWords).
 *    - The presence of any paired transition expression (both parts must appear in the sentence, order does not matter).
 * 4. Counts each sentence that matches at least one of these conditions.
 * 5. Calculates the ratio of matching sentences to the total number of sentences.
 * 6. Returns a TrafficLight status based on the ratio:
 *    - "green" if 30% or more of sentences contain a transition,
 *    - "amber" if between 20% and 30% do,
 *    - "red" if less than 20% do.
 *
 * @param text - The raw Markdown content to analyze.
 * @returns A TrafficLight value ("green", "amber", or "red").
 */
export const checkTransitionWords = (text: string): TrafficLight => {
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
  
  // Return a TrafficLight status based on the ratio.
  if (ratio >= 0.30) return "green";
  else if (ratio >= 0.20) return "amber";
  else return "red";
};
