import React from "react";
import { Check } from "lucide-react";

const StatusPoint = ({ label, stepNumber, active, completed }) => {
  // Softer color scheme for better visual comfort
  const bgColors = {
    default: "bg-slate-100",
    active: "bg-sky-100",
    completed: "bg-emerald-50",
  };

  const iconColors = {
    default: "text-slate-400",
    active: "text-sky-500",
    completed: "text-emerald-500",
  };

  const textColors = {
    default: "text-slate-500",
    active: "text-sky-600",
    completed: "text-emerald-600",
  };

  const borderColors = {
    default: "border-slate-200",
    active: "border-sky-300",
    completed: "border-emerald-300",
  };

  // Determine current state
  const state = completed ? "completed" : active ? "active" : "default";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`
          z-10 flex items-center justify-center 
          w-8 h-8 rounded-full border-2
          ${bgColors[state]} 
          ${borderColors[state]} 
          ${iconColors[state]}
          ${state === "active" ? "shadow-md" : ""}
          transition-all duration-300 ease-in-out
        `}
      >
        {completed ? <Check size={16} /> : stepNumber}
      </div>
      <span
        className={`
          mt-2 text-xs font-medium
          ${textColors[state]}
          transition-colors duration-300
        `}
      >
        {label}
      </span>
    </div>
  );
};

export default StatusPoint;
