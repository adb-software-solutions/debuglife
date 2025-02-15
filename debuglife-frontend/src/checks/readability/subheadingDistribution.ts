import {ReadabilityAssessment} from "../../types/contentAnalysis";
import {countWords, extractSubheadings, cleanMarkdown} from "@/utils/textUtils";

/**
 * Evaluates the distribution of subheadings within the content.
 *
 * - If the text is longer than 300 words and has no subheadings, returns a red result.
 * - Splits the original content into sections at subheadings (lines starting with '#' characters)
 *   and checks that no section (after cleaning) exceeds 300 words.
 *
 * Returns a ReadabilityAssessment object with:
 *  - score: 9 (green) if subheadings are appropriately distributed,
 *           0 (red) if content is too long without subheadings or if any section exceeds 300 words.
 *  - max: always 9.
 *  - feedback: a dynamic message reflecting the result.
 *
 * @param text - The raw Markdown content.
 * @returns A ReadabilityAssessment object.
 */
export const checkSubheadingDistribution = (
    text: string,
): ReadabilityAssessment => {
    console.debug("Starting checkSubheadingDistribution analysis.");

    // Use cleaned text to compute total word count.
    const cleaned = cleanMarkdown(text);
    const totalWords = countWords(cleaned);
    console.debug(`Total words in cleaned text: ${totalWords}`);

    // Extract subheadings from the original text.
    const subheadings = extractSubheadings(text);
    console.debug(`Number of subheadings found: ${subheadings.length}`);

    if (totalWords > 300 && subheadings.length === 0) {
        console.debug(
            "Text is longer than 300 words but contains no subheadings.",
        );
        return {
            score: 0,
            max: 9,
            feedback:
                "Content is longer than 300 words but lacks subheadings; text may be hard to scan.",
        };
    }

    // Split the original text into sections using subheading markers.
    const sections = text
        .split(/\n(?=#)/)
        .map((s) => s.trim())
        .filter(Boolean);
    console.debug(`Number of sections identified: ${sections.length}`);

    sections.forEach((section, index) => {
        // Clean each section before counting words.
        const sectionCleaned = cleanMarkdown(section);
        const sectionWordCount = countWords(sectionCleaned);
        console.debug(`Section ${index + 1} word count: ${sectionWordCount}`);
    });

    for (const section of sections) {
        const sectionCleaned = cleanMarkdown(section);
        if (countWords(sectionCleaned) > 300) {
            console.debug("Detected a section exceeding 300 words.");
            return {
                score: 0,
                max: 9,
                feedback:
                    "One or more sections exceed 300 words; consider adding more subheadings for better readability.",
            };
        }
    }

    console.debug("All sections are within the acceptable word limit.");
    return {
        score: 9,
        max: 9,
        feedback: "Subheadings are well distributed; content is easy to scan.",
    };
};
