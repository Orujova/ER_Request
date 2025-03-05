import React, { useState } from "react";
import { Plus, Search, Folder, X } from "lucide-react";
import { themeColors } from "../../styles/theme";
import CaseForm from "./CaseForm";
import CaseCard from "./CaseCard";
import EmptyState from "./EmptyState";

const CaseTab = ({
  cases,
  subCases,
  expandedCases,
  selectedCase,
  selectedSubCase,
  searchTerm,
  setSearchTerm,
  setSelectedCase,
  setSelectedSubCase,
  toggleCaseExpansion,
  createCase,
  updateCase,
  deleteCase,
  createSubCase,
  updateSubCase,
  deleteSubCase,
}) => {
  const [activeView, setActiveView] = useState("dashboard");
  const [newCase, setNewCase] = useState({ caseName: "" });
  const [newSubCase, setNewSubCase] = useState({
    description: "",
    caseId: null,
  });

  // Handle case creation
  const handleCreateCase = async () => {
    const result = await createCase(newCase);
    if (result) {
      setNewCase({ caseName: "" });
      setActiveView("dashboard");
    }
  };

  // Render appropriate view
  const renderView = () => {
    switch (activeView) {
      case "createCase":
        return (
          <CaseForm
            caseData={newCase}
            setCaseData={setNewCase}
            onSubmit={handleCreateCase}
            onCancel={() => setActiveView("dashboard")}
            formTitle="Create New Case"
            formSubtitle="Add a new case to the system"
            submitLabel="Create Case"
          />
        );
      case "editCase":
        return (
          <CaseForm
            caseData={selectedCase}
            setCaseData={setSelectedCase}
            onSubmit={() => {
              updateCase(selectedCase);
              setActiveView("dashboard");
            }}
            onCancel={() => setActiveView("dashboard")}
            formTitle="Edit Case"
            formSubtitle={`ID: ${selectedCase?.Id}`}
            submitLabel="Update Case"
          />
        );
      default:
        return renderDashboard();
    }
  };

  // Main dashboard view
  const renderDashboard = () => {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: themeColors.text }}
          >
            Cases
          </h2>
          <button
            onClick={() => {
              setNewCase({ caseName: "" });
              setActiveView("createCase");
            }}
            className="px-4 py-2 rounded-md flex items-center space-x-2 transition-all duration-200 "
            style={{
              background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
              color: themeColors.background,
              boxShadow: `0 2px 4px ${themeColors.primaryDark}40`,
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span>Create New Case</span>
          </button>
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} strokeWidth={2} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search cases by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md py-2.5 px-4 focus:outline-none transition-all duration-200"
              style={{
                border: `1px solid ${themeColors.border}`,
                backgroundColor: themeColors.background,
                color: themeColors.text,
              }}
              onFocus={(e) => {
                e.target.style.boxShadow = `0 0 0 3px ${themeColors.primaryLight}20`;
                e.target.style.borderColor = themeColors.primaryLight;
              }}
              onBlur={(e) => {
                e.target.style.boxShadow = "none";
                e.target.style.borderColor = themeColors.border;
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X
                  size={20}
                  strokeWidth={2}
                  className="text-gray-400 hover:text-gray-600"
                />
              </button>
            )}
          </div>
        </div>

        {/* Cases list */}
        {cases.length === 0 ? (
          <EmptyState
            icon={() => (
              <Folder size={64} strokeWidth={1.5} className="text-gray-400" />
            )}
            title="No cases found"
            message={
              searchTerm
                ? `No cases match your search for "${searchTerm}"`
                : "Get started by creating your first case"
            }
            buttonText={searchTerm ? "Clear Search" : "Create Case"}
            buttonAction={
              searchTerm
                ? () => setSearchTerm("")
                : () => {
                    setNewCase({ caseName: "" });
                    setActiveView("createCase");
                  }
            }
            searchTerm={searchTerm}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {cases.map((caseItem) => (
              <CaseCard
                key={caseItem.Id}
                caseItem={caseItem}
                subCases={subCases.filter((sc) => sc.CaseId === caseItem.Id)}
                isExpanded={expandedCases[caseItem.Id]}
                selectedSubCase={selectedSubCase}
                newSubCase={newSubCase}
                setNewSubCase={setNewSubCase}
                toggleExpansion={() => toggleCaseExpansion(caseItem.Id)}
                onEditCase={() => {
                  setSelectedCase(caseItem);
                  setActiveView("editCase");
                }}
                onDeleteCase={() => deleteCase(caseItem.Id)}
                onCreateSubCase={() =>
                  createSubCase({
                    description: newSubCase.description,
                    caseId: caseItem.Id,
                  })
                }
                onEditSubCase={(updatedSubcase) =>
                  updateSubCase(updatedSubcase)
                }
                onDeleteSubCase={(subCaseId) => deleteSubCase(subCaseId)}
                setSelectedSubCase={setSelectedSubCase}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return <div className="max-w-5xl mx-auto p-4">{renderView()}</div>;
};

export default CaseTab;
