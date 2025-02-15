import { TrafficLight } from "@/types/contentAnalysis";

export const colorForStatus = (status: TrafficLight) => {
  if (status === "green") return "bg-green-500";
  if (status === "amber") return "bg-yellow-500";
  return "bg-red-500";
};
