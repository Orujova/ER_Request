import React from "react";
import { ArrowLeft, Save, X, FileText } from "lucide-react";
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
      className="max-w-xl mx-auto rounded-xl p-0 overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: `0 6px 24px ${themeColors.shadowLight}`,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Header */}
      <div
        className="p-6 flex items-center"
        style={{
          background: `linear-gradient(to right, ${themeColors.primaryLight}10, ${themeColors.secondaryLight}25)`,
          borderBottom: `1px solid ${themeColors.border}`,
        }}
      >
        <button
          onClick={onCancel}
          className="mr-4 p-2 rounded-full transition-all duration-200 hover:bg-white hover:bg-opacity-50"
        >
          <ArrowLeft
            size={22}
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

      {/* Form content */}
      <div className="p-8 space-y-6">
        {/* Icon and field */}
        <div className="flex items-start">
          <div
            className="p-2 rounded-lg mr-4 mt-2 hidden sm:flex"
            style={{
              backgroundColor: `${themeColors.primaryLight}15`,
              color: themeColors.primary,
            }}
          >
            <FileText size={22} strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <label
              htmlFor="caseName"
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Case Name
            </label>
            <input
              id="caseName"
              name={
                caseData.hasOwnProperty("caseName") ? "caseName" : "CaseName"
              }
              type="text"
              placeholder="Enter case name"
              value={caseData.caseName || caseData.CaseName || ""}
              onChange={handleInputChange}
              className="w-full rounded-lg px-4 py-3 focus:outline-none transition-all duration-200"
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
            <p
              className="mt-2 text-xs"
              style={{ color: themeColors.textLight }}
            >
              Enter a descriptive name for this case
            </p>
          </div>
        </div>

        {/* Bottom actions */}
        <div
          className="pt-6 flex justify-end space-x-4 mt-8"
          style={{
            borderTop: `1px solid ${themeColors.border}`,
          }}
        >
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2 hover:bg-gray-100"
            style={{
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <X size={18} strokeWidth={2} />
            <span>Cancel</span>
          </button>
          <button
            onClick={onSubmit}
            disabled={!isFormValid}
            className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2"
            style={{
              backgroundColor: isFormValid
                ? themeColors.primary
                : `${themeColors.primary}80`,
              color: themeColors.background,
              opacity: !isFormValid ? 0.7 : 1,
              boxShadow: isFormValid
                ? `0 2px 6px ${themeColors.primaryDark}40`
                : "none",
            }}
            onMouseOver={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor =
                  themeColors.primaryHover;
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 4px 8px ${themeColors.primaryDark}40`;
              }
            }}
            onMouseOut={(e) => {
              if (isFormValid) {
                e.currentTarget.style.backgroundColor = themeColors.primary;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 2px 6px ${themeColors.primaryDark}40`;
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
