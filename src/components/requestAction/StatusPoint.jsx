import React from "react";
import { Check } from "lucide-react";

const StatusPoint = ({ label, stepNumber, active, completed }) => {
  // Improved color scheme with more intuitive visual hierarchy
  let bgColor = completed
    ? "bg-emerald-600"
    : active
    ? "bg-[#219cba]"
    : "bg-gray-200";
  let textColor = completed || active ? "text-white" : "text-gray-600";
  let ringColor = active ? "ring-2 ring-[#cee9f0]" : "";

  // Animation for active state
  let animation = active ? "animate-pulse" : "";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`z-10 flex items-center justify-center w-9 h-9 rounded-full ${bgColor} ${textColor} ${ringColor} ${animation} shadow-sm transition-all duration-200`}
      >
        {completed ? <Check size={16} className="text-white" /> : stepNumber}
      </div>
      <span
        className={`mt-2 text-xs font-medium ${
          active
            ? "text-[#0891b2]"
            : completed
            ? "text-emerald-600"
            : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export default StatusPoint;
