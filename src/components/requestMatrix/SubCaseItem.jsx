// src/components/requestMatrix/SubCaseItem.jsx
import React, { useState } from "react";
import {
  Edit3,
  Trash2,
  FileText,
  FileCheck,
  MessageSquare,
} from "lucide-react";
import { themeColors } from "../../styles/theme";

const SubCaseItem = ({
  subcase,
  selectedSubCase,
  setSelectedSubCase,
  onEditSubCase,
  onShowDeleteModal,
  hasPermission,
}) => {
  // Local state for handling edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    subcase.Description
  );
  const [editedRequirements, setEditedRequirements] = useState({
    IsPresentationRequired: subcase.IsPresentationRequired,
    IsActRequired: subcase.IsActRequired,
    IsExplanationRequired: subcase.IsExplanationRequired,
  });

  // Check if this is the selected subcase
  const isSelected = selectedSubCase?.Id === subcase.Id;

  // Toggle a requirement
  const toggleRequirement = (field) => {
    setEditedRequirements({
      ...editedRequirements,
      [field]: !editedRequirements[field],
    });
  };

  // Save edited subcase
  const handleSaveEdit = () => {
    if (!hasPermission) return;

    onEditSubCase({
      ...subcase,
      Description: editedDescription,
      ...editedRequirements,
    });
    setIsEditing(false);
  };

  // Enter edit mode
  const handleEditClick = (e) => {
    if (!hasPermission) return;

    e.stopPropagation();
    setEditedDescription(subcase.Description);
    setEditedRequirements({
      IsPresentationRequired: subcase.IsPresentationRequired,
      IsActRequired: subcase.IsActRequired,
      IsExplanationRequired: subcase.IsExplanationRequired,
    });
    setIsEditing(true);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Handle delete click
  const handleDeleteClick = (e) => {
    if (!hasPermission) return;

    e.stopPropagation();
    onShowDeleteModal(subcase);
  };

  // Render required document badges
  const renderRequirementBadges = () => {
    const requirements = isEditing
      ? editedRequirements
      : {
          IsPresentationRequired: subcase.IsPresentationRequired,
          IsActRequired: subcase.IsActRequired,
          IsExplanationRequired: subcase.IsExplanationRequired,
        };

    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {requirements.IsPresentationRequired && (
          <span
            className="px-2 py-0.5 text-xs rounded-full flex items-center"
            style={{
              backgroundColor: "#e6f4fa",
              color: "#0ea5e9",
              fontWeight: 500,
            }}
          >
            <FileText size={12} className="mr-1" />
            Presentation
          </span>
        )}
        {requirements.IsActRequired && (
          <span
            className="px-2 py-0.5 text-xs rounded-full flex items-center"
            style={{
              backgroundColor: "#e7f8ed",
              color: "#10b981",
              fontWeight: 500,
            }}
          >
            <FileCheck size={12} className="mr-1" />
            Act
          </span>
        )}
        {requirements.IsExplanationRequired && (
          <span
            className="px-2 py-0.5 text-xs rounded-full flex items-center"
            style={{
              backgroundColor: "#fef3e6",
              color: "#f59e0b",
              fontWeight: 500,
            }}
          >
            <MessageSquare size={12} className="mr-1" />
            Explanation
          </span>
        )}
      </div>
    );
  };

  // Render edit mode
  if (isEditing) {
    return (
      <div
        className="p-4 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: themeColors.background,
          border: `1px solid ${themeColors.primaryLight}40`,
          boxShadow: `0 2px 8px ${themeColors.shadowLight}`,
        }}
      >
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          className="w-full p-2 mb-3 border rounded-md"
          style={{
            borderColor: themeColors.border,
            backgroundColor: themeColors.background,
            color: themeColors.text,
          }}
          rows={2}
        />

        <div className="mb-3">
          <p
            className="text-xs font-medium mb-2"
            style={{ color: themeColors.textLight }}
          >
            REQUIRED DOCUMENTS:
          </p>
          <div className="flex flex-wrap gap-2">
            <RequirementToggle
              label="Presentation"
              icon={<FileText size={14} />}
              isActive={editedRequirements.IsPresentationRequired}
              onClick={() => toggleRequirement("IsPresentationRequired")}
              color="#0ea5e9"
            />
            <RequirementToggle
              label="Act"
              icon={<FileCheck size={14} />}
              isActive={editedRequirements.IsActRequired}
              onClick={() => toggleRequirement("IsActRequired")}
              color="#10b981"
            />
            <RequirementToggle
              label="Explanation"
              icon={<MessageSquare size={14} />}
              isActive={editedRequirements.IsExplanationRequired}
              onClick={() => toggleRequirement("IsExplanationRequired")}
              color="#f59e0b"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancelEdit}
            className="px-3 py-1 text-sm rounded"
            style={{
              backgroundColor: themeColors.background,
              border: `1px solid ${themeColors.border}`,
              color: themeColors.textLight,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="px-3 py-1 text-sm rounded"
            style={{
              backgroundColor: themeColors.primary,
              color: "white",
            }}
          >
            Save
          </button>
        </div>
      </div>
    );
  }

  // Render view mode
  return (
    <div
      className={`p-4 rounded-lg transition-all duration-200 hover:shadow-md ${
        isSelected ? "ring-2" : ""
      }`}
      style={{
        backgroundColor: themeColors.background,
        border: `1px solid ${themeColors.border}`,
        boxShadow: `0 1px 3px ${themeColors.shadowLight}`,
        ringColor: themeColors.primaryLight,
      }}
      onClick={() => setSelectedSubCase(subcase)}
    >
      <div className="flex justify-between">
        <div className="flex-1">
          <div className="flex items-center">
            <p style={{ color: themeColors.text }}>{subcase.Description}</p>
          </div>
          {renderRequirementBadges()}
        </div>

        {/* Only show edit/delete buttons if user has permission */}
        {hasPermission && (
          <div className="flex space-x-1 ml-2 self-start">
            <button
              onClick={handleEditClick}
              className="p-1.5 rounded hover:bg-gray-100"
              style={{ color: themeColors.textLight }}
            >
              <Edit3 size={16} strokeWidth={1.5} />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 rounded hover:bg-red-50"
            >
              <Trash2
                size={16}
                strokeWidth={1.5}
                className="text-red-400 hover:text-red-600"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for requirement toggle buttons
const RequirementToggle = ({ label, icon, isActive, onClick, color }) => {
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
    </button>
  );
};

export default SubCaseItem;
