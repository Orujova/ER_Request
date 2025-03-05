import React, { useState, useEffect } from "react";
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
      className="max-w-xl mx-auto rounded-lg p-8"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: themeColors.cardShadow,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      <div className="flex items-center mb-8">
        <button
          onClick={onCancel}
          className="mr-4 p-2 rounded-full transition-colors duration-150"
          style={{
            color: themeColors.textLight,
            backgroundColor: `${themeColors.textLight}10`,
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = `${themeColors.textLight}20`;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = `${themeColors.textLight}10`;
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
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
            required
          />
        </div>

        <div className="pt-4">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2 rounded-md transition-colors duration-150"
              style={{
                border: `1px solid ${themeColors.border}`,
                backgroundColor: "transparent",
                color: themeColors.textLight,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  themeColors.secondaryHover;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.Name.trim()}
              className="px-5 py-2 rounded-md transition-all duration-200"
              style={{
                backgroundColor: formData.Name.trim()
                  ? themeColors.primary
                  : `${themeColors.primary}80`,
                color: themeColors.background,
                opacity: !formData.Name.trim() ? 0.7 : 1,
              }}
              onMouseOver={(e) => {
                if (formData.Name.trim()) {
                  e.currentTarget.style.backgroundColor =
                    themeColors.primaryHover;
                }
              }}
              onMouseOut={(e) => {
                if (formData.Name.trim()) {
                  e.currentTarget.style.backgroundColor = themeColors.primary;
                }
              }}
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DisciplinaryViolationForm;
