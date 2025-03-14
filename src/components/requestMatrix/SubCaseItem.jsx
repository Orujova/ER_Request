import React, { useState } from "react";
import {
  Edit3,
  Check,
  X,
  Trash2,
  FileText,
  FileCheck,
  MessageSquare,
} from "lucide-react";
import { themeColors } from "../../styles/theme";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

const SubCaseItem = ({
  subcase,
  selectedSubCase,
  setSelectedSubCase,
  onEditSubCase,
  onDeleteSubCase,
}) => {
  const isSelected = selectedSubCase?.Id === subcase.Id;
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Handle showing the delete modal
  const handleShowDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // Handle confirming deletion
  const handleConfirmDelete = (id) => {
    onDeleteSubCase(id);
  };

  // Handle toggling requirement fields when editing
  const toggleRequirement = (field) => {
    setSelectedSubCase({
      ...selectedSubCase,
      [field]: !selectedSubCase[field],
    });
  };

  // Requirement indicator badges
  const RequirementBadge = ({ isRequired, icon, label, color }) => {
    if (!isRequired) return null;

    return (
      <div
        className="flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2"
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {icon}
        <span className="ml-1">{label}</span>
      </div>
    );
  };

  // Requirement toggle buttons for edit mode
  const RequirementToggle = ({ field, value, label, icon, color }) => {
    return (
      <button
        type="button"
        onClick={() => toggleRequirement(field)}
        className={`flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors duration-200 hover:opacity-80 mr-2`}
        style={{
          backgroundColor: value ? color : `${color}20`,
          color: value ? "white" : color,
          border: `1px solid ${value ? color : "transparent"}`,
        }}
      >
        {icon}
        <span className="ml-1">{label}</span>
        {value && <Check size={14} className="ml-1" />}
      </button>
    );
  };

  return (
    <>
      <div
        className="rounded-lg p-4 transition-all duration-200 border group"
        style={{
          backgroundColor: isSelected
            ? `${themeColors.primaryLight}10`
            : themeColors.background,
          borderColor: isSelected
            ? themeColors.primaryLight
            : themeColors.border,
          boxShadow: isSelected
            ? `0 0 0 1px ${themeColors.primaryLight}30`
            : `0 1px 3px ${themeColors.shadowLight}`,
        }}
      >
        <div className="flex justify-between items-start">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: `${themeColors.textLight}15`,
              color: themeColors.textLight,
            }}
          >
            ID: {subcase.Id}
          </span>

          <div className="flex items-center space-x-1">
            {isSelected ? (
              <>
                <button
                  onClick={() => onEditSubCase(selectedSubCase)}
                  className="p-1.5 rounded transition-colors duration-150 hover:bg-green-50"
                  style={{
                    color: themeColors.success,
                  }}
                >
                  <Check
                    size={18}
                    strokeWidth={2.5}
                    className="hover:scale-110 transition-transform"
                  />
                </button>
                <button
                  onClick={() => setSelectedSubCase(null)}
                  className="p-1.5 rounded transition-colors duration-150 hover:bg-gray-50"
                  style={{
                    color: themeColors.textLight,
                  }}
                >
                  <X
                    size={18}
                    strokeWidth={2.5}
                    className="hover:scale-110 transition-transform"
                  />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setSelectedSubCase(subcase)}
                  className="p-1.5 rounded transition-colors duration-150 hover:bg-gray-50"
                  style={{
                    color: themeColors.primary,
                  }}
                >
                  <Edit3
                    size={18}
                    strokeWidth={1.5}
                    className="hover:scale-110 transition-transform"
                  />
                </button>
                <button
                  onClick={handleShowDeleteModal}
                  className="p-1.5 rounded transition-colors duration-150 hover:bg-red-50"
                  style={{
                    color: themeColors.error,
                  }}
                >
                  <Trash2
                    size={18}
                    strokeWidth={1.5}
                    className="hover:scale-110 transition-transform"
                  />
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          {isSelected ? (
            <textarea
              value={selectedSubCase.Description}
              onChange={(e) =>
                setSelectedSubCase({
                  ...selectedSubCase,
                  Description: e.target.value,
                })
              }
              className="w-full rounded-md px-3 py-2 focus:outline-none transition-all duration-200"
              style={{
                border: `1px solid ${themeColors.primaryLight}`,
                boxShadow: `0 0 0 2px ${themeColors.primaryLight}30`,
                backgroundColor: themeColors.background,
                color: themeColors.text,
              }}
              rows={2}
            />
          ) : (
            <p style={{ color: themeColors.text }}>{subcase.Description}</p>
          )}
        </div>

        {/* Required documents section */}
        <div
          className={`mt-3 ${isSelected ? "border-t pt-3" : ""}`}
          style={{ borderColor: isSelected ? `${themeColors.border}50` : "" }}
        >
          {isSelected ? (
            // Edit mode - toggle buttons
            <div>
              <h4
                className="text-xs font-medium mb-2"
                style={{ color: themeColors.textLight }}
              >
                REQUIRED DOCUMENTS:
              </h4>
              <div className="flex flex-wrap">
                <RequirementToggle
                  field="IsPresentationRequired"
                  value={selectedSubCase.IsPresentationRequired}
                  label="Presentation"
                  icon={<FileText size={14} className="mr-1" />}
                  color="#4299e1" // blue
                />
                <RequirementToggle
                  field="IsActRequired"
                  value={selectedSubCase.IsActRequired}
                  label="Act"
                  icon={<FileCheck size={14} className="mr-1" />}
                  color="#48bb78" // green
                />
                <RequirementToggle
                  field="IsExplanationRequired"
                  value={selectedSubCase.IsExplanationRequired}
                  label="Explanation"
                  icon={<MessageSquare size={14} className="mr-1" />}
                  color="#ed8936" // orange
                />
              </div>
            </div>
          ) : (
            // View mode - badges
            <div className="flex flex-wrap mt-2">
              <RequirementBadge
                isRequired={subcase.IsPresentationRequired}
                icon={<FileText size={12} />}
                label="Presentation"
                color="#4299e1" // blue
              />
              <RequirementBadge
                isRequired={subcase.IsActRequired}
                icon={<FileCheck size={12} />}
                label="Act"
                color="#48bb78" // green
              />
              <RequirementBadge
                isRequired={subcase.IsExplanationRequired}
                icon={<MessageSquare size={12} />}
                label="Explanation"
                color="#ed8936" // orange
              />
            </div>
          )}
        </div>
      </div>

      {/* External Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleConfirmDelete(subcase.Id)}
        title="Delete Subcase"
        message="Are you sure you want to delete this subcase? This action cannot be undone."
        itemType="subcase"
      />
    </>
  );
};

export default SubCaseItem;
