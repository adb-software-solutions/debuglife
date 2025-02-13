// components/SEOSidebar.tsx
import React from "react";
import useContentAnalysis, { ContentAnalysisResult, TrafficLight } from "@/hooks/useSEOAnalysis";

interface SEOSidebarProps {
  content: string;
  title: string;
  keyphrase: string;
  blogId?: string; // Optional blog id to trigger backend updates
}

// Helper to convert a traffic light status into Tailwind background color classes.
const colorForStatus = (status: TrafficLight) => {
  if (status === "green") return "bg-green-500";
  if (status === "amber") return "bg-yellow-500";
  return "bg-red-500";
};

const SEOSidebar: React.FC<SEOSidebarProps> = ({ content, title, keyphrase, blogId }) => {
  const analysis: ContentAnalysisResult = useContentAnalysis({ content, title, keyphrase, blogId });

  // Compute an overall SEO traffic light from the overall score.
  const overallTrafficLight =
    analysis.seoScore >= 80 ? "green" : analysis.seoScore >= 50 ? "amber" : "red";

  return (
    <aside className="p-4 border rounded shadow bg-white dark:bg-slate-800">
      <h3 className="text-2xl font-bold mb-4">SEO Analysis</h3>

      {/* Overall Score */}
      <div className="mb-6">
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${colorForStatus(overallTrafficLight)} mr-2`} />
          <span className="font-medium">Overall SEO Score:</span>
          <span className="ml-2">{analysis.seoScore} / 100</span>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300">
          Traffic Light: {overallTrafficLight.toUpperCase()}
        </div>
      </div>

      {/* SEO Details Table */}
      <div>
        <h4 className="font-medium mb-2">Detailed SEO Assessments</h4>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left pb-1">Assessment</th>
              <th className="text-center pb-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(analysis.seoDetails.assessments).map(([key, assess]) => {
              // Determine assessment status based on score.
              // Here we allow amber: score 9 => green, score 3 => amber, score 0 => red.
              const status: TrafficLight = assess.score === 9 ? "green" : assess.score === 3 ? "amber" : "red";
              return (
                <tr key={key} className="border-b last:border-0">
                  <td className="py-1 capitalize">{key.replace(/([A-Z])/g, " $1")}</td>
                  <td className="py-1 text-center">
                    <div className={`w-3 h-3 rounded-full inline-block ${colorForStatus(status)}`} title={assess.feedback} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Readability Assessments */}
      <div className="mt-6">
        <h4 className="font-medium mb-2">Readability</h4>
        <div className="flex items-center mb-1">
          <div className={`w-4 h-4 rounded-full ${colorForStatus(analysis.readabilityDetails.longSentences)} mr-2`} />
          <span>Sentence Length</span>
        </div>
        <div className="flex items-center mb-1">
          <div className={`w-4 h-4 rounded-full ${colorForStatus(analysis.readabilityDetails.passiveVoice)} mr-2`} />
          <span>Passive Voice</span>
        </div>
        <div className="flex items-center">
          <div className={`w-4 h-4 rounded-full ${colorForStatus(analysis.readabilityDetails.transitionWords)} mr-2`} />
          <span>Transition Words</span>
        </div>
        <div className="mt-2 text-sm">
          Readability Score: {analysis.readabilityScore} / 100
        </div>
      </div>
    </aside>
  );
};

export default SEOSidebar;
