// src/components/requestMatrix/CaseTab.jsx
import React, { useState } from "react";
import {
  Plus,
  Search,
  Folder,
  X,
  Filter,
  SlidersHorizontal,
} from "lucide-react";
import { themeColors } from "../../styles/theme";
import CaseForm from "./CaseForm";
import CaseCard from "./CaseCard";
import EmptyState from "./EmptyState";
import {
  canManageContent,
  withPermissionCheck,
} from "../../utils/permissionChecks";

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
  const [sortOrder, setSortOrder] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  // Check if user has permission to create/edit/delete
  const hasPermission = canManageContent();

  // Create wrapped handlers that check permissions
  const handleCreateCase = withPermissionCheck(async () => {
    const result = await createCase(newCase);
    if (result) {
      setNewCase({ caseName: "" });
      setActiveView("dashboard");
    }
  });

  const handleUpdateCase = withPermissionCheck(() => {
    updateCase(selectedCase);
    setActiveView("dashboard");
  });

  const handleDeleteCase = withPermissionCheck(deleteCase);

  const handleCreateSubCase = withPermissionCheck(createSubCase);

  const handleUpdateSubCase = withPermissionCheck(updateSubCase);

  const handleDeleteSubCase = withPermissionCheck(deleteSubCase);

  // Sort cases based on current sort order
  const sortCases = (casesToSort) => {
    const sorted = [...casesToSort];
    if (sortOrder === "newest") {
      return sorted.sort((a, b) => b.Id - a.Id);
    } else if (sortOrder === "oldest") {
      return sorted.sort((a, b) => a.Id - b.Id);
    } else if (sortOrder === "name-asc") {
      return sorted.sort((a, b) => a.CaseName.localeCompare(b.CaseName));
    } else if (sortOrder === "name-desc") {
      return sorted.sort((a, b) => b.CaseName.localeCompare(a.CaseName));
    } else if (sortOrder === "subcases") {
      return sorted.sort((a, b) => {
        const aSubcaseCount = subCases.filter(
          (sc) => sc.CaseId === a.Id
        ).length;
        const bSubcaseCount = subCases.filter(
          (sc) => sc.CaseId === b.Id
        ).length;
        return bSubcaseCount - aSubcaseCount;
      });
    }
    return sorted;
  };

  // Filter and sort cases based on search and sort options
  const filteredCases = searchTerm
    ? cases.filter(
        (c) =>
          c.CaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.Id.toString().includes(searchTerm)
      )
    : cases;

  const sortedAndFilteredCases = sortCases(filteredCases);

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
            onSubmit={handleUpdateCase}
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ color: themeColors.text }}
            >
              Cases Management
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              {sortedAndFilteredCases.length}{" "}
              {sortedAndFilteredCases.length === 1 ? "case" : "cases"} available
            </p>
          </div>

          {/* Only show Create button if user has permission */}
          {hasPermission && (
            <button
              onClick={() => {
                setNewCase({ caseName: "" });
                setActiveView("createCase");
              }}
              className="px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 8px ${themeColors.primaryDark}30`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${themeColors.primaryDark}40`;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 2px 8px ${themeColors.primaryDark}30`;
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="font-medium">Create New Case</span>
            </button>
          )}
        </div>

        {/* Search and filter bar */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={20} strokeWidth={2} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search cases by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg py-2.5 px-4 focus:outline-none transition-all duration-200"
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
                    size={18}
                    strokeWidth={2}
                    className="text-gray-400 hover:text-gray-600"
                  />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2.5 rounded-lg transition-all duration-200"
              style={{
                border: `1px solid ${themeColors.border}`,
                backgroundColor: showFilters
                  ? `${themeColors.primaryLight}15`
                  : themeColors.background,
                color: showFilters ? themeColors.primary : themeColors.text,
              }}
            >
              <SlidersHorizontal size={18} strokeWidth={1.5} className="mr-2" />
              <span>Filters & Sort</span>
            </button>
          </div>

          {/* Expanded filter and sort options */}
          {showFilters && (
            <div
              className="mt-4 p-4 rounded-lg"
              style={{
                backgroundColor: `${themeColors.secondaryLight}30`,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <div className="flex flex-wrap gap-3">
                <p
                  className="text-sm font-medium mr-2"
                  style={{ color: themeColors.textLight }}
                >
                  Sort by:
                </p>

                <button
                  onClick={() => setSortOrder("newest")}
                  className="px-3 py-1 text-sm rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      sortOrder === "newest"
                        ? themeColors.primary
                        : themeColors.background,
                    color:
                      sortOrder === "newest"
                        ? themeColors.background
                        : themeColors.text,
                    border: `1px solid ${
                      sortOrder === "newest"
                        ? themeColors.primary
                        : themeColors.border
                    }`,
                  }}
                >
                  Newest
                </button>

                <button
                  onClick={() => setSortOrder("oldest")}
                  className="px-3 py-1 text-sm rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      sortOrder === "oldest"
                        ? themeColors.primary
                        : themeColors.background,
                    color:
                      sortOrder === "oldest"
                        ? themeColors.background
                        : themeColors.text,
                    border: `1px solid ${
                      sortOrder === "oldest"
                        ? themeColors.primary
                        : themeColors.border
                    }`,
                  }}
                >
                  Oldest
                </button>

                <button
                  onClick={() => setSortOrder("name-asc")}
                  className="px-3 py-1 text-sm rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      sortOrder === "name-asc"
                        ? themeColors.primary
                        : themeColors.background,
                    color:
                      sortOrder === "name-asc"
                        ? themeColors.background
                        : themeColors.text,
                    border: `1px solid ${
                      sortOrder === "name-asc"
                        ? themeColors.primary
                        : themeColors.border
                    }`,
                  }}
                >
                  Name (A-Z)
                </button>

                <button
                  onClick={() => setSortOrder("name-desc")}
                  className="px-3 py-1 text-sm rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      sortOrder === "name-desc"
                        ? themeColors.primary
                        : themeColors.background,
                    color:
                      sortOrder === "name-desc"
                        ? themeColors.background
                        : themeColors.text,
                    border: `1px solid ${
                      sortOrder === "name-desc"
                        ? themeColors.primary
                        : themeColors.border
                    }`,
                  }}
                >
                  Name (Z-A)
                </button>

                <button
                  onClick={() => setSortOrder("subcases")}
                  className="px-3 py-1 text-sm rounded-full transition-all duration-200"
                  style={{
                    backgroundColor:
                      sortOrder === "subcases"
                        ? themeColors.primary
                        : themeColors.background,
                    color:
                      sortOrder === "subcases"
                        ? themeColors.background
                        : themeColors.text,
                    border: `1px solid ${
                      sortOrder === "subcases"
                        ? themeColors.primary
                        : themeColors.border
                    }`,
                  }}
                >
                  Most Subcases
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cases list */}
        {sortedAndFilteredCases.length === 0 ? (
          <EmptyState
            icon={() => (
              <Folder size={64} strokeWidth={1.5} className="text-gray-400" />
            )}
            title={searchTerm ? "No matching cases found" : "No cases found"}
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
                    if (hasPermission) {
                      setNewCase({ caseName: "" });
                      setActiveView("createCase");
                    }
                  }
            }
            searchTerm={searchTerm}
            hideButton={!searchTerm && !hasPermission}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedAndFilteredCases.map((caseItem) => (
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
                  if (hasPermission) {
                    setSelectedCase(caseItem);
                    setActiveView("editCase");
                  }
                }}
                onDeleteCase={handleDeleteCase}
                onCreateSubCase={() =>
                  handleCreateSubCase({
                    description: newSubCase.description,
                    caseId: caseItem.Id,
                    IsPresentationRequired:
                      newSubCase.IsPresentationRequired || false,
                    IsActRequired: newSubCase.IsActRequired || false,
                    IsExplanationRequired:
                      newSubCase.IsExplanationRequired || false,
                  })
                }
                onEditSubCase={handleUpdateSubCase}
                onDeleteSubCase={handleDeleteSubCase}
                setSelectedSubCase={setSelectedSubCase}
              />
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div
      className="max-w-7xl mx-auto p-6 rounded-xl"
      style={{
        backgroundColor: `${themeColors.secondaryLight}20`,
      }}
    >
      {renderView()}
    </div>
  );
};

export default CaseTab;
