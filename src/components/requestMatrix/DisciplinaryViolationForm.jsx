import React, { useState, useEffect } from "react";
import { ArrowLeft, Save, X, AlertTriangle } from "lucide-react";
import { themeColors } from "../../styles/theme";

const DisciplinaryViolationForm = ({
  violation,
  onSubmit,
  onCancel,
  formTitle,
  submitLabel,
}) => {
  const [formData, setFormData] = useState({
    Id: violation?.Id || 0,
    Name: violation?.Name || "",
  });

  // Update form data when props change
  useEffect(() => {
    if (violation) {
      setFormData({
        Id: violation.Id || 0,
        Name: violation.Name || "",
      });
    }
  }, [violation]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
          {violation?.Id && (
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              ID: {violation.Id}
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
            <AlertTriangle size={22} strokeWidth={1.5} />
          </div>

          <div className="flex-1">
            <label
              htmlFor="Name"
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Violation Name
            </label>
            <input
              id="Name"
              name="Name"
              type="text"
              placeholder="Enter policy violation name"
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
              Enter the name of this policy violation
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
            disabled={!formData.Name.trim()}
            className="px-5 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2"
            style={{
              backgroundColor: formData.Name.trim()
                ? themeColors.primary
                : `${themeColors.primary}80`,
              color: themeColors.background,
              opacity: !formData.Name.trim() ? 0.7 : 1,
              boxShadow: formData.Name.trim()
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

export default DisciplinaryViolationForm;
