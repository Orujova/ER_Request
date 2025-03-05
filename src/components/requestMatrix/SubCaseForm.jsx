import React from "react";
import { Plus } from "lucide-react";
import { themeColors } from "../../styles/theme";

const SubCaseForm = ({
  caseId,
  newSubCase,
  setNewSubCase,
  onCreateSubCase,
}) => {
  // Check if this form is for the current case
  const isCurrentCase = caseId === newSubCase.caseId;

  return (
    <div
      className="mb-6 p-4 rounded-lg border transition-all duration-200"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: `0 2px 8px ${themeColors.shadowLight}`,
        borderColor: themeColors.border,
      }}
    >
      <h4
        className="font-medium text-sm mb-3"
        style={{ color: themeColors.text }}
      >
        Add New SubCase
      </h4>
      <div className="flex flex-col space-y-3">
        <textarea
          placeholder="Enter subcase description..."
          value={isCurrentCase ? newSubCase.description : ""}
          onChange={(e) =>
            setNewSubCase({
              description: e.target.value,
              caseId: caseId,
            })
          }
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
        <div className="flex justify-end">
          <button
            onClick={onCreateSubCase}
            disabled={!isCurrentCase || !newSubCase.description}
            className="px-4 py-2 text-sm rounded-md flex items-center space-x-2 transition-all duration-200 group"
            style={{
              backgroundColor:
                isCurrentCase && newSubCase.description
                  ? themeColors.primary
                  : `${themeColors.primary}80`,
              color: themeColors.background,
              opacity: !isCurrentCase || !newSubCase.description ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (isCurrentCase && newSubCase.description) {
                e.currentTarget.style.backgroundColor =
                  themeColors.primaryHover;
              }
            }}
            onMouseOut={(e) => {
              if (isCurrentCase && newSubCase.description) {
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

export default SubCaseForm;
