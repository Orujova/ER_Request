import React from "react";
import { ArrowLeft, Save, X } from "lucide-react";
import { themeColors } from "../../styles/theme";

const CaseForm = ({
  caseData,
  setCaseData,
  onSubmit,
  onCancel,
  formTitle,
  formSubtitle,
  submitLabel,
}) => {
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "caseName") {
      setCaseData((prev) => ({ ...prev, caseName: value }));
    } else if (name === "CaseName") {
      setCaseData((prev) => ({ ...prev, CaseName: value }));
    }
  };

  // Determine if form is valid
  const isFormValid = caseData?.caseName?.trim() || caseData?.CaseName?.trim();

  return (
    <div
      className="max-w-xl mx-auto rounded-lg p-8 space-y-6"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: themeColors.cardShadow,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="mr-4 p-2 rounded-full transition-colors duration-150 hover:bg-gray-100"
        >
          <ArrowLeft
            size={24}
            strokeWidth={2}
            className="text-gray-600 hover:text-gray-800"
          />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: themeColors.text }}>
            {formTitle}
          </h2>
          <p className="text-sm mt-1" style={{ color: themeColors.textLight }}>
            {formSubtitle}
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label
            htmlFor="caseName"
            className="block text-sm font-medium mb-2"
            style={{ color: themeColors.text }}
          >
            Case Name
          </label>
          <input
            id="caseName"
            name={caseData.hasOwnProperty("caseName") ? "caseName" : "CaseName"}
            type="text"
            placeholder="Enter case name"
            value={caseData.caseName || caseData.CaseName || ""}
            onChange={handleInputChange}
            className="w-full rounded-md px-4 py-3 focus:outline-none transition-all duration-200"
            style={{
              border: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.background,
              color: themeColors.text,
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 3px ${themeColors.primaryLight}30`;
              e.target.style.borderColor = themeColors.primaryLight;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
              e.target.style.borderColor = themeColors.border;
            }}
          />
        </div>

        <div className="pt-4 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-md transition-colors duration-150 flex items-center space-x-2 hover:bg-gray-100"
          >
            <X size={18} strokeWidth={2} />
            <span>Cancel</span>
          </button>
          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className="px-5 py-2 rounded-md transition-all duration-200 flex items-center space-x-2"
            style={{
              backgroundColor: isFormValid
                ? themeColors.primary
                : `${themeColors.primary}80`,
              color: themeColors.background,
              opacity: !isFormValid ? 0.7 : 1,
            }}
            onMouseOver={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor =
                  themeColors.primaryHover;
              }
            }}
            onMouseOut={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor = themeColors.primary;
              }
            }}
          >
            <Save size={18} strokeWidth={2} />
            <span>{submitLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaseForm;
