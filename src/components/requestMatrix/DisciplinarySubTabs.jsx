// src/components/requestMatrix/DisciplinarySubTabs.jsx
import React from "react";
import { BookOpen, Tag, AlertTriangle } from "lucide-react";
import { themeColors } from "../../styles/theme";

const DisciplinarySubTabs = ({ activeSubTab, setActiveSubTab }) => {
  const tabs = [
    { id: "actions", label: "Disciplinary Actions", icon: BookOpen },
    { id: "results", label: "Action Results", icon: Tag },
    { id: "violations", label: "Policy Violations", icon: AlertTriangle },
  ];

  return (
    <div
      className="relative mb-8 p-1.5 rounded-xl"
      style={{
        background: `linear-gradient(to right, ${themeColors.primaryLight}15, ${themeColors.secondaryLight}25)`,
        boxShadow: `0 2px 10px ${themeColors.shadowLight}`,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative flex items-center justify-center py-3 px-6 font-medium text-sm rounded-lg transition-all duration-300 ${
                isActive ? "shadow-md" : "hover:bg-white hover:bg-opacity-30"
              }`}
              style={{
                color: isActive ? themeColors.primary : themeColors.textLight,
                backgroundColor: isActive ? "white" : "transparent",
                flex: 1,
                zIndex: isActive ? 1 : 0,
                transform: isActive ? "translateY(-2px)" : "none",
              }}
            >
              <Icon
                size={18}
                strokeWidth={isActive ? 2 : 1.5}
                className="mr-2"
              />
              <span>{tab.label}</span>

              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 translate-y-0.5"
                  style={{ backgroundColor: themeColors.primary }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DisciplinarySubTabs;
