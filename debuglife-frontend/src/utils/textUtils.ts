// src/helpers/textUtils.ts
import nlp from "compromise";

export const countWords = (text: string): number =>
  text.trim().split(/\s+/).filter(Boolean).length;

export const getSentences = (text: string): string[] => {
  const doc = nlp(text);
  return doc.sentences().out("array");
};

export const extractSubheadings = (text: string): string[] => {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(line => /^#{2,3}\s/.test(line))
    .map(line => line.replace(/^#{2,3}\s/, ""));
};

export const countOccurrences = (text: string, sub: string): number => {
  const regex = new RegExp(sub, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
};

export const extractLinkTexts = (text: string): string[] => {
  const regex = /\[([^\]]+)\]\([^)]+\)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

export const extractImageAlts = (text: string): string[] => {
  const regex = /!\[([^\]]*)\]\([^)]+\)/g;
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match[1]);
  }
  return matches;
};

/**
 * Clean Markdown text by removing:
 *  - Code blocks (``` ... ```)
 *  - Inline code (`...`)
 *  - Images (![alt](url))
 *  - Headings (lines starting with one or more '#' characters)
 */
export const cleanMarkdown = (text: string): string => {
    console.log('Text to clean:', text);
    if (!text) return "";
    let cleaned = text;
    // Remove code blocks.
    cleaned = cleaned.replace(/```[\s\S]*?```/g, "");
    // Remove inline code.
    cleaned = cleaned.replace(/`[^`]*`/g, "");
    // Remove image markdown.
    cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, "");
    // Remove headings.
    cleaned = cleaned
      .split("\n")
      .filter(line => !/^#{1,6}\s/.test(line))
      .join("\n");
    return cleaned;
  };
  
  