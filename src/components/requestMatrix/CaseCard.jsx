import React from "react";
import { ChevronRight, Edit3, Trash2, File, Folder } from "lucide-react";
import { themeColors } from "../../styles/theme";
import SubCaseForm from "./SubCaseForm";
import SubCaseItem from "./SubCaseItem";

const CaseCard = ({
  caseItem,
  subCases,
  isExpanded,
  selectedSubCase,
  newSubCase,
  setNewSubCase,
  toggleExpansion,
  onEditCase,
  onDeleteCase,
  onCreateSubCase,
  onEditSubCase,
  onDeleteSubCase,
  setSelectedSubCase,
}) => {
  return (
    <div
      className="bg-white rounded-lg overflow-hidden border border-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
      style={{
        boxShadow: isExpanded
          ? themeColors.cardShadow
          : `0 2px 4px ${themeColors.shadowLight}`,
      }}
    >
      {/* Case header */}
      <div
        className={`flex justify-between items-center p-4 cursor-pointer transition-colors duration-200`}
        style={{
          background: isExpanded
            ? `linear-gradient(to right, ${themeColors.primaryLight}10, ${themeColors.secondaryDark}40)`
            : themeColors.background,
          borderLeft: isExpanded
            ? `4px solid ${themeColors.primary}`
            : `4px solid transparent`,
        }}
        onClick={toggleExpansion}
      >
        <div className="flex items-center">
          <div
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
            style={{ color: themeColors.primary }}
          >
            <ChevronRight
              size={20}
              strokeWidth={2.5}
              className="transform transition-transform"
            />
          </div>
          <h3
            className="text-lg font-medium ml-2"
            style={{ color: themeColors.text }}
          >
            {caseItem.CaseName}
          </h3>
          <span
            className="ml-3 text-sm"
            style={{ color: themeColors.textLight }}
          >
            ID: {caseItem.Id}
          </span>
          <span
            className="ml-4 text-xs px-2 py-1 rounded-full"
            style={{
              backgroundColor: `${themeColors.primaryLight}20`,
              color: themeColors.primaryDark,
            }}
          >
            {subCases.length} subcases
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCase();
            }}
            className="p-2 rounded-full transition-colors duration-150 hover:bg-gray-100"
          >
            <Edit3
              size={20}
              strokeWidth={1.5}
              className="text-gray-600 hover:text-gray-800"
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteCase();
            }}
            className="p-2 rounded-full transition-colors duration-150 hover:bg-red-50"
          >
            <Trash2
              size={20}
              strokeWidth={1.5}
              className="text-red-500 hover:text-red-600"
            />
          </button>
        </div>
      </div>

      {/* Case content - subcases */}
      {isExpanded && (
        <div
          className="p-5"
          style={{
            backgroundColor: themeColors.secondary,
            borderTop: `1px solid ${themeColors.border}`,
          }}
        >
          {/* Subcase creation form */}
          <SubCaseForm
            caseId={caseItem.Id}
            newSubCase={newSubCase}
            setNewSubCase={setNewSubCase}
            onCreateSubCase={onCreateSubCase}
          />

          {/* Subcases list */}
          {subCases.length === 0 ? (
            <div
              className="text-center py-8 rounded-md flex flex-col items-center justify-center"
              style={{
                backgroundColor: `${themeColors.background}80`,
                color: themeColors.textLight,
                border: `1px dashed ${themeColors.border}`,
              }}
            >
              <File
                size={48}
                strokeWidth={1.5}
                className="mb-3 text-gray-400"
              />
              <p>No subcases found for this case</p>
            </div>
          ) : (
            <div className="space-y-4 mt-6">
              {subCases.map((subcase) => (
                <SubCaseItem
                  key={subcase.Id}
                  subcase={subcase}
                  selectedSubCase={selectedSubCase}
                  setSelectedSubCase={setSelectedSubCase}
                  onEditSubCase={onEditSubCase}
                  onDeleteSubCase={onDeleteSubCase}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CaseCard;
