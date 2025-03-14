import React, { useState } from "react";
import {
  Plus,
  Check,
  X,
  FileText,
  FileCheck,
  MessageSquare,
} from "lucide-react";
import { themeColors } from "../../styles/theme";

const SubCaseForm = ({
  caseId,
  newSubCase,
  setNewSubCase,
  onCreateSubCase,
}) => {
  // Check if this form is for the current case
  const isCurrentCase = caseId === newSubCase.caseId;

  // Initialize the form state if it's a new form for this case
  if (caseId !== newSubCase.caseId) {
    setNewSubCase({
      description: "",
      caseId: caseId,
      IsPresentationRequired: false,
      IsActRequired: false,
      IsExplanationRequired: false,
    });
  }

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setNewSubCase({
      ...newSubCase,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const toggleRequirement = (field) => {
    setNewSubCase({
      ...newSubCase,
      [field]: !newSubCase[field],
    });
  };

  return (
    <div
      className="rounded-lg transition-all duration-200"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: `0 2px 8px ${themeColors.shadowLight}`,
        borderColor: themeColors.border,
      }}
    >
      <div className="flex flex-col space-y-3">
        <textarea
          placeholder="Enter subcase description..."
          name="description"
          value={newSubCase.description || ""}
          onChange={handleChange}
          className="w-full rounded-md px-3 py-2 text-sm focus:outline-none transition-all duration-200"
          style={{
            border: `1px solid ${themeColors.border}`,
            backgroundColor: themeColors.background,
            color: themeColors.text,
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 0 2px ${themeColors.primaryLight}50`;
            e.target.style.borderColor = themeColors.primaryLight;
          }}
          onBlur={(e) => {
            e.target.style.boxShadow = "none";
            e.target.style.borderColor = themeColors.border;
          }}
          rows={2}
        />

        {/* Required documents section */}
        <div className="px-2 py-3">
          <h4
            className="text-xs font-medium mb-2"
            style={{ color: themeColors.textLight }}
          >
            REQUIRED DOCUMENTS:
          </h4>
          <div className="flex flex-wrap gap-2">
            <RequirementButton
              label="Presentation"
              icon={<FileText size={14} />}
              isActive={newSubCase.IsPresentationRequired}
              onClick={() => toggleRequirement("IsPresentationRequired")}
              color="#4299e1" // blue
            />
            <RequirementButton
              label="Act"
              icon={<FileCheck size={14} />}
              isActive={newSubCase.IsActRequired}
              onClick={() => toggleRequirement("IsActRequired")}
              color="#48bb78" // green
            />
            <RequirementButton
              label="Explanation"
              icon={<MessageSquare size={14} />}
              isActive={newSubCase.IsExplanationRequired}
              onClick={() => toggleRequirement("IsExplanationRequired")}
              color="#ed8936" // orange
            />
          </div>
        </div>

        <div className="flex justify-end px-2 pb-3">
          <button
            onClick={onCreateSubCase}
            disabled={!newSubCase.description}
            className="px-4 py-2 text-sm rounded-md flex items-center space-x-2 transition-all duration-200 group"
            style={{
              backgroundColor: newSubCase.description
                ? themeColors.primary
                : `${themeColors.primary}80`,
              color: themeColors.background,
              opacity: !newSubCase.description ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (newSubCase.description) {
                e.currentTarget.style.backgroundColor =
                  themeColors.primaryHover;
              }
            }}
            onMouseOut={(e) => {
              if (newSubCase.description) {
                e.currentTarget.style.backgroundColor = themeColors.primary;
              }
            }}
          >
            <Plus
              size={18}
              strokeWidth={2.5}
              className="group-hover:rotate-90 transition-transform"
            />
            <span>Add SubCase</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Component for requirement toggle buttons
const RequirementButton = ({ label, icon, isActive, onClick, color }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200 hover:opacity-80`}
      style={{
        backgroundColor: isActive ? color : `${color}20`,
        color: isActive ? "white" : color,
        border: `1px solid ${isActive ? color : "transparent"}`,
      }}
    >
      <span className="mr-1">{icon}</span>
      {label}
      {isActive && <Check size={14} className="ml-1" />}
    </button>
  );
};

export default SubCaseForm;
