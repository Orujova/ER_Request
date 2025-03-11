import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X, CheckCircle, BookOpen } from "lucide-react";
import { themeColors } from "../../styles/theme";

const DisciplinaryActionForm = ({
  action,
  onSubmit,
  onCancel,
  results,
  formTitle,
  submitLabel,
}) => {
  const [formData, setFormData] = useState({
    Id: action?.Id || 0,
    Name: action?.Name || "",
    DisciplinaryActionResultId: action?.DisciplinaryActionResultId || 0,
  });

  // Update form data when props change
  useEffect(() => {
    if (action) {
      setFormData({
        Id: action.Id || 0,
        Name: action.Name || "",
        DisciplinaryActionResultId:
          action.DisciplinaryActionResultId || results[0]?.Id || 0,
      });
    }
  }, [action, results]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "DisciplinaryActionResultId" ? parseInt(value, 10) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      className="max-w-xl mx-auto rounded-xl overflow-hidden shadow-lg"
      style={{
        backgroundColor: themeColors.background,
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
          className="mr-4 p-2 rounded-full transition-colors duration-150 hover:bg-white hover:bg-opacity-50"
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
          {action?.Id && (
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              ID: {action.Id}
            </p>
          )}
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="flex items-start">
          <div
            className="p-2 rounded-lg mr-4 mt-2 hidden sm:flex"
            style={{
              backgroundColor: `${themeColors.primaryLight}15`,
              color: themeColors.primary,
            }}
          >
            <BookOpen size={22} strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <label
              htmlFor="Name"
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Action Name
            </label>
            <input
              id="Name"
              name="Name"
              type="text"
              placeholder="Enter action name"
              value={formData.Name}
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
              required
            />
            <p
              className="mt-2 text-xs"
              style={{ color: themeColors.textLight }}
            >
              Enter the name of this disciplinary action
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div
            className="p-2 rounded-lg mr-4 mt-2 hidden sm:flex"
            style={{
              backgroundColor: `${themeColors.primaryLight}15`,
              color: themeColors.primary,
            }}
          >
            <CheckCircle size={22} strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <label
              htmlFor="DisciplinaryActionResultId"
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Action Result
            </label>
            <select
              id="DisciplinaryActionResultId"
              name="DisciplinaryActionResultId"
              value={formData.DisciplinaryActionResultId}
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
              required
            >
              {results.length === 0 ? (
                <option value="">No results available</option>
              ) : (
                results.map((result) => (
                  <option key={result.Id} value={result.Id}>
                    {result.Name}
                  </option>
                ))
              )}
            </select>
            {results.length === 0 ? (
              <p className="mt-2 text-xs" style={{ color: themeColors.error }}>
                Please create action results first
              </p>
            ) : (
              <p
                className="mt-2 text-xs"
                style={{ color: themeColors.textLight }}
              >
                Select the result that applies to this action
              </p>
            )}
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
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2"
            style={{
              border: `1px solid ${themeColors.border}`,
              backgroundColor: themeColors.background,
              color: themeColors.textLight,
            }}
          >
            <X size={18} strokeWidth={2} />
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            disabled={!formData.Name.trim() || results.length === 0}
            className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2"
            style={{
              backgroundColor:
                formData.Name.trim() && results.length > 0
                  ? themeColors.primary
                  : `${themeColors.primary}80`,
              color: themeColors.background,
              opacity: !formData.Name.trim() || results.length === 0 ? 0.7 : 1,
              boxShadow:
                formData.Name.trim() && results.length > 0
                  ? `0 2px 6px ${themeColors.primaryDark}40`
                  : "none",
            }}
          >
            <Save size={18} strokeWidth={2} />
            <span>{submitLabel}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DisciplinaryActionForm;
