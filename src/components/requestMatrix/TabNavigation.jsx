import React from "react";
import { themeColors } from "../../styles/theme";
import { Briefcase, Activity } from "lucide-react";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    {
      id: "cases",
      label: "Cases",
      icon: (active) => (
        <Briefcase size={18} strokeWidth={active ? 2.5 : 2} className="mr-2" />
      ),
    },
    {
      id: "disciplinary",
      label: "Disciplinary",
      icon: (active) => (
        <Activity size={18} strokeWidth={active ? 2.5 : 2} className="mr-2" />
      ),
    },
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
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center justify-center py-3 px-6 font-medium text-base text-center rounded-lg transition-all duration-300 ${
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
              {tab.icon(isActive)}
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

export default TabNavigation;
