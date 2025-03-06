import React from "react";
import {
  FileText,
  Calendar,
  User,
  Briefcase,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { themeColors } from "../../styles/theme";

const CaseSummary = ({ request }) => {
  const [expanded, setExpanded] = React.useState(false);

  if (!request) {
    return (
      <div
        className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
        style={{ boxShadow: themeColors.cardShadow }}
      >
        <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
          <FileText size={20} className="mr-2 text-primary" />
          Case Summary
        </h3>
        <div className="p-4 rounded-lg bg-secondary text-textLight text-center border border-dashed border-gray-300">
          <ClipboardList size={24} className="mx-auto mb-2 text-gray-400" />
          No case information available
        </div>
      </div>
    );
  }

  // Summary items with icons for better visual hierarchy
  const summaryItems = [
    {
      icon: <FileText size={16} className="text-blue-500" />,
      label: "Case",
      value: request.case,
    },
    {
      icon: <ClipboardList size={16} className="text-indigo-500" />,
      label: "Sub Case",
      value: request.subCase,
    },
    {
      icon: <Calendar size={16} className="text-green-500" />,
      label: "Created Date",
      value: request.createdDate,
    },
    {
      icon: <User size={16} className="text-amber-500" />,
      label: "Employee",
      value: request.employeeInfo?.name,
    },
    {
      icon: <Briefcase size={16} className="text-purple-500" />,
      label: "Project",
      value: `${request.employeeInfo?.project} (${request.employeeInfo?.projectCode})`,
    },
  ];

  return (
    <div
      className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
      style={{ boxShadow: themeColors.cardShadow }}
    >
      <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
        <FileText size={20} className="mr-2 text-primary" />
        Case Summary
      </h3>

      <div className="space-y-3">
        {summaryItems
          .slice(0, expanded ? summaryItems.length : 3)
          .map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-secondary hover:bg-secondary-hover transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="mr-3">{item.icon}</div>
                <div>
                  <div className="text-xs text-textLight mb-1">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-text">
                    {item.value || "N/A"}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {summaryItems.length > 3 && (
          <button
            className="text-sm text-primary flex items-center justify-center w-full mt-2 hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform duration-200 ${
                expanded ? "transform rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default CaseSummary;
