// src/checks/readability/passiveVoice.ts
import { TrafficLight } from "../../types/contentAnalysis";

// This file is provided in case you want local fallback; however, we are now obtaining passive voice data from the backend.
export const evaluatePassiveVoice = (passiveRatio: number): TrafficLight => {
  if (passiveRatio < 0.05) return "green";
  else if (passiveRatio < 0.10) return "amber";
  else return "red";
};
