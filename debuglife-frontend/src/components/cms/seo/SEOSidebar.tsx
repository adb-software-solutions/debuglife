// src/components/SEOSidebar.tsx
import React from "react";
import { Disclosure } from "@headlessui/react";
import { ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/solid";
import useContentAnalysis from "@/hooks/useContentAnalysis";
import { ContentAnalysisResult, TrafficLight } from "@/types/contentAnalysis";

const colorForStatus = (status: TrafficLight) => {
  if (status === "green") return "bg-green-500";
  if (status === "amber") return "bg-yellow-500";
  return "bg-red-500";
};

const readabilityFeedback: Record<
  | "longSentences"
  | "passiveVoice"
  | "transitionWords"
  | "paragraphLength"
  | "consecutiveSentences"
  | "fleschReadingEase"
  | "wordComplexity"
  | "subheadingDistribution",
  Record<TrafficLight, string>
> = {
  longSentences: {
    green: "Few long sentences; text is well-structured.",
    amber: "Some long sentences; consider breaking them up.",
    red: "Too many long sentences; text may be hard to read.",
  },
  passiveVoice: {
    green: "Very little passive voice detected.",
    amber: "Some passive voice detected; try to use more active constructions.",
    red: "Excessive passive voice; consider revising.",
  },
  transitionWords: {
    green: "Good usage of transition words.",
    amber: "Moderate usage of transition words; consider adding more for better flow.",
    red: "Insufficient transition words; text may lack flow.",
  },
  paragraphLength: {
    green: "Paragraphs are short and easy to read.",
    amber: "Some paragraphs are a bit long; consider breaking them up.",
    red: "Paragraphs are too long; readability is affected.",
  },
  consecutiveSentences: {
    green: "No issues with consecutive sentences.",
    amber: "A few consecutive sentences start the same; vary your sentence starters.",
    red: "Too many consecutive sentences with the same start; disrupts flow.",
  },
  fleschReadingEase: {
    green: "Text is very readable.",
    amber: "Text is moderately readable; consider simplifying complex sentences.",
    red: "Text is hard to read; revise for clarity.",
  },
  wordComplexity: {
    green: "Few complex words; text is easy to understand.",
    amber: "Some complex words detected; consider using simpler language.",
    red: "Too many complex words; text may be difficult for readers.",
  },
  subheadingDistribution: {
    green: "Subheadings are well distributed.",
    amber: "Subheading distribution is suboptimal; consider adjusting.",
    red: "Poor subheading distribution; text may be hard to scan.",
  },
};

const SEOSidebar: React.FC<{
  content: string;
  title: string;
  keyphrase: string;
  blogId?: string;
}> = ({ content, title, keyphrase, blogId }) => {
  const analysis: ContentAnalysisResult = useContentAnalysis({ content, title, keyphrase, blogId });
  const overallTrafficLight: TrafficLight =
    analysis.seoScore >= 80 ? "green" : analysis.seoScore >= 50 ? "amber" : "red";

  // Using similar thresholds for readability
  const readabilityTrafficLight: TrafficLight =
    analysis.readabilityScore >= 80 ? "green" : analysis.readabilityScore >= 50 ? "amber" : "red";

  // Common header cell classes for consistent widths
  const assessmentHeaderClass = "py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 w-1/3";
  const feedbackHeaderClass = "py-2 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100 w-2/3";

  return (
    <aside className="p-4 border rounded shadow bg-white dark:bg-slate-800">
      <h3 className="text-2xl font-bold mb-4">SEO Analysis</h3>

      {/* Top Scores: SEO & Readability */}
      <div className="mb-6 flex flex-col sm:flex-row sm:space-x-8">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className={`w-4 h-4 rounded-full ${colorForStatus(overallTrafficLight)} mr-2`} />
          <span className="font-medium">Overall SEO Score:</span>
          <span className="ml-2">{analysis.seoScore} / 100</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${colorForStatus(readabilityTrafficLight)} mr-2`} />
          <span className="font-medium">Readability Score:</span>
          <span className="ml-2">{analysis.readabilityScore} / 100</span>
        </div>
      </div>

      {/* SEO Assessments Collapsible */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="mb-6">
            <Disclosure.Button className="flex justify-between text-left font-medium focus:outline-none">
              <span className="mr-2">SEO Assessments</span>
              {open ? (
                <ChevronUpIcon className="w-5 h-5 mr-auto mt-1" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 mr-auto mt-1" />
              )}
            </Disclosure.Button>
            <Disclosure.Panel as="div" className="mt-2">
              <div className="overflow-hidden rounded-md border border-gray-300">
                <table className="min-w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className={assessmentHeaderClass}>Assessment</th>
                      <th className={feedbackHeaderClass}>Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800">
                    {Object.entries(analysis.seoDetails.assessments).map(([key, assess]) => {
                      const status: TrafficLight =
                        assess.score === 9 ? "green" : assess.score === 3 ? "amber" : "red";
                      return (
                        <tr key={key} className="border-t border-gray-300">
                          <td className={`py-2 pl-4 pr-3 flex items-center text-sm text-gray-900 dark:text-gray-100`}>
                            <div className={`w-3 h-3 rounded-full ${colorForStatus(status)} mr-2`} />
                            <span className="capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                          </td>
                          <td className="py-2 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-300">
                            {assess.feedback}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>

      {/* Readability Assessments Collapsible */}
      <Disclosure defaultOpen>
        {({ open }) => (
          <div className="mt-4">
            <Disclosure.Button className="flex justify-between text-left font-medium mb-2 focus:outline-none">
              <span className="mr-2">Readability</span>
              {open ? (
                <ChevronUpIcon className="w-5 h-5 mr-auto mt-1" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 mr-auto mt-1" />
              )}
            </Disclosure.Button>
            <Disclosure.Panel as="div" className="mt-2">
              <div className="overflow-hidden rounded-md border border-gray-300">
                <table className="min-w-full table-fixed">
                  <thead className="bg-gray-50 dark:bg-slate-700">
                    <tr>
                      <th className={assessmentHeaderClass}>Assessment</th>
                      <th className={feedbackHeaderClass}>Feedback</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-slate-800">
                    {Object.entries(analysis.readabilityDetails).map(([checkName, status]) => {
                      const keyName = checkName as keyof typeof readabilityFeedback;
                      const trafficStatus = status as TrafficLight;
                      return (
                        <tr key={checkName} className="border-t border-gray-300">
                          <td className="py-2 pl-4 pr-3 flex items-center text-sm text-gray-900 dark:text-gray-100">
                            <div className={`w-3 h-3 rounded-full ${colorForStatus(trafficStatus)} mr-2`} />
                            <span className="capitalize">
                              {checkName
                                .replace(/([A-Z])/g, " $1")
                                .replace("PassiveVoice", "Passive Voice")
                                .replace("TransitionWords", "Transition Words")
                                .replace("ParagraphLength", "Paragraph Length")
                                .replace("ConsecutiveSentences", "Consecutive Sentences")
                                .replace("FleschReadingEase", "Flesch Reading Ease")
                                .replace("WordComplexity", "Word Complexity")
                                .replace("SubheadingDistribution", "Subheading Distribution")}
                            </span>
                          </td>
                          <td className="py-2 pl-4 pr-3 text-sm text-gray-500 dark:text-gray-300">
                            {readabilityFeedback[keyName][trafficStatus]}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Disclosure.Panel>
          </div>
        )}
      </Disclosure>
    </aside>
  );
};

export default SEOSidebar;
