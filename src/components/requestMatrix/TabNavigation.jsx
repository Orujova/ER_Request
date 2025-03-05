import React from "react";
import { themeColors } from "../../styles/theme";

const TabNavigation = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: "cases", label: "Cases" },
    { id: "disciplinary", label: "Disciplinary" },
  ];

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="flex -mb-px" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 focus:outline-none ${
              activeTab === tab.id ? "border-b-2" : "border-transparent"
            }`}
            style={{
              color:
                activeTab === tab.id
                  ? themeColors.primary
                  : themeColors.textLight,
              borderColor:
                activeTab === tab.id ? themeColors.primary : "transparent",
              backgroundColor:
                activeTab === tab.id
                  ? `${themeColors.primaryLight}10`
                  : "transparent",
            }}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;
