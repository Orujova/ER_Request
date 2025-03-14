import React, { useState } from "react";
import { ChevronRight, Edit3, Trash2, File, Folder, Plus } from "lucide-react";
import { themeColors } from "../../styles/theme";
import SubCaseForm from "./SubCaseForm";
import SubCaseItem from "./SubCaseItem";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

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
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'case' or 'subcase'

  // Handler for showing delete modal for case
  const handleShowCaseDeleteModal = (e) => {
    e.stopPropagation();
    setDeleteType("case");
    setItemToDelete(caseItem);
    setIsDeleteModalOpen(true);
  };

  // Handler for showing delete modal for subcase
  const handleShowSubcaseDeleteModal = (subcase) => {
    setDeleteType("subcase");
    setItemToDelete(subcase);
    setIsDeleteModalOpen(true);
  };

  // Handler for confirming deletion
  const handleConfirmDelete = (id) => {
    if (deleteType === "case") {
      onDeleteCase(id);
    } else if (deleteType === "subcase") {
      onDeleteSubCase(id);
    }
  };

  // Handler for creating a new subcase
  const handleCreateSubCase = async () => {
    const result = await onCreateSubCase();
    if (result) {
      // Reset the form after successful creation
      setNewSubCase({
        description: "",
        caseId: caseItem.Id,
        IsPresentationRequired: false,
        IsActRequired: false,
        IsExplanationRequired: false,
      });
    }
  };

  return (
    <>
      <div
        className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md"
        style={{
          boxShadow: isExpanded
            ? `0 4px 12px ${themeColors.shadowLight}`
            : `0 2px 4px ${themeColors.shadowLight}`,
        }}
      >
        {/* Case header */}
        <div
          className={`flex justify-between items-center p-5 cursor-pointer`}
          style={{
            background: isExpanded
              ? `linear-gradient(to right, ${themeColors.primaryLight}15, ${themeColors.secondaryDark}25)`
              : themeColors.background,
          }}
          onClick={toggleExpansion}
        >
          <div className="flex items-center flex-wrap md:flex-nowrap">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg mr-3 ${
                isExpanded ? "bg-primary bg-opacity-10" : ""
              }`}
              style={{
                color: themeColors.primary,
              }}
            >
              <ChevronRight
                size={22}
                strokeWidth={2.5}
                className={`transition-transform duration-300 ${
                  isExpanded ? "rotate-90" : ""
                }`}
              />
            </div>
            <div className="flex flex-col md:flex-row md:items-center">
              <h3
                className="text-lg font-medium"
                style={{ color: themeColors.text }}
              >
                {caseItem.CaseName}
              </h3>
              <div className="flex items-center mt-1 md:mt-0">
                <span
                  className="md:ml-3 text-sm px-2 py-0.5 rounded-md"
                  style={{
                    color: themeColors.textLight,
                    background: `${themeColors.secondaryLight}50`,
                  }}
                >
                  ID: {caseItem.Id}
                </span>
                <span
                  className="ml-3 text-xs px-3 py-1 rounded-full"
                  style={{
                    backgroundColor: `${themeColors.primaryLight}20`,
                    color: themeColors.primaryDark,
                    fontWeight: 500,
                  }}
                >
                  {subCases.length} subcases
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditCase();
              }}
              className="p-2 rounded-lg hover:bg-gray-100"
              style={{
                color: themeColors.textLight,
              }}
            >
              <Edit3
                size={18}
                strokeWidth={1.5}
                className="text-inherit hover:text-gray-800"
              />
            </button>
            <button
              onClick={handleShowCaseDeleteModal}
              className="p-2 rounded-lg hover:bg-red-50"
            >
              <Trash2
                size={18}
                strokeWidth={1.5}
                className="text-red-400 hover:text-red-600"
              />
            </button>
          </div>
        </div>

        {/* Case content - subcases */}
        {isExpanded && (
          <div
            className="p-6"
            style={{
              backgroundColor: themeColors.secondary,
              borderTop: `1px solid ${themeColors.border}`,
            }}
          >
            {/* Subcase creation form */}
            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: themeColors.background,
                boxShadow: `0 2px 6px ${themeColors.shadowLight}`,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <div className="flex items-center mb-3">
                <Plus
                  size={16}
                  strokeWidth={2.5}
                  style={{ color: themeColors.primary }}
                  className="mr-2"
                />
                <h4 className="font-medium" style={{ color: themeColors.text }}>
                  Add New Subcase
                </h4>
              </div>
              <SubCaseForm
                caseId={caseItem.Id}
                newSubCase={newSubCase}
                setNewSubCase={setNewSubCase}
                onCreateSubCase={handleCreateSubCase}
              />
            </div>

            {/* Subcases list */}
            <div className="mt-5">
              <h4
                className="text-sm font-medium uppercase tracking-wider mb-3 px-1"
                style={{ color: themeColors.textLight }}
              >
                Subcases
              </h4>

              {subCases.length === 0 ? (
                <div
                  className="text-center py-8 rounded-lg flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: `${themeColors.background}80`,
                    color: themeColors.textLight,
                    border: `1px dashed ${themeColors.border}`,
                  }}
                >
                  <File
                    size={40}
                    strokeWidth={1.5}
                    className="mb-3 text-gray-400"
                  />
                  <p>No subcases found for this case</p>
                </div>
              ) : (
                <div className="space-y-3 mt-2">
                  {subCases.map((subcase) => (
                    <SubCaseItem
                      key={subcase.Id}
                      subcase={subcase}
                      selectedSubCase={selectedSubCase}
                      setSelectedSubCase={setSelectedSubCase}
                      onEditSubCase={onEditSubCase}
                      onDeleteSubCase={onDeleteSubCase}
                      onShowDeleteModal={handleShowSubcaseDeleteModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleConfirmDelete(itemToDelete?.Id)}
        title={`Delete ${deleteType === "case" ? "Case" : "Subcase"}`}
        message={
          deleteType === "case"
            ? `Are you sure you want to delete this case? This will also delete all ${subCases.length} subcases.`
            : "Are you sure you want to delete this subcase? This action cannot be undone."
        }
        itemToDelete={itemToDelete}
        itemType={deleteType}
      />
    </>
  );
};

export default CaseCard;
