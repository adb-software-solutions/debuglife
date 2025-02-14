import {TrafficLight} from "../../types/contentAnalysis";
import {getSentences, cleanMarkdown} from "@/utils/textUtils";

/**
 * Checks if there are three or more consecutive sentences (or headings) that start with the same word.
 *
 * @param text - The raw Markdown content.
 * @returns "red" if three or more consecutive sentences start with the same word; otherwise "green".
 */
export const checkConsecutiveSentences = (text: string): TrafficLight => {
    const cleaned = cleanMarkdown(text);
    const sentences = getSentences(cleaned);

    if (sentences.length < 3) return "green";

    let currentWord = "";
    let count = 0;
    for (const sentence of sentences) {
        // Extract the first word of the sentence.
        const firstWord = sentence.trim().split(/\s+/)[0]?.toLowerCase() || "";
        if (firstWord === currentWord && firstWord !== "") {
            count++;
            if (count >= 3) return "red";
        } else {
            currentWord = firstWord;
            count = 1;
        }
    }

    return "green";
};
