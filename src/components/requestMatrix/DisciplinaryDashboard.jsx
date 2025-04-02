// src/components/requestMatrix/DisciplinaryDashboard.jsx
import React from "react";
import { Plus } from "lucide-react";
import { themeColors } from "../../styles/theme";
import DisciplinarySearchBar from "./DisciplinarySearchBar";
import DisciplinarySubTabs from "./DisciplinarySubTabs";
import DisciplinaryActionTable from "./DisciplinaryActionTable";
import DisciplinaryResultTable from "./DisciplinaryResultTable";
import DisciplinaryViolationTable from "./DisciplinaryViolationTable";

const DisciplinaryDashboard = ({
  activeSubTab,
  setActiveSubTab,
  searchTerm,
  setSearchTerm,
  filteredActions,
  filteredResults,
  filteredViolations,
  disciplinaryResults,
  hasPermission,
  loading,
  setActiveView,
  setSelectedAction,
  setSelectedResult,
  setSelectedViolation,
  handleShowDeleteModal,
}) => {
  // Helper function to get the button label based on active tab
  const getAddButtonLabel = () => {
    switch (activeSubTab) {
      case "actions":
        return "Add Disciplinary Action";
      case "results":
        return "Add Action Result";
      case "violations":
        return "Add Policy Violation";
      default:
        return "Add New";
    }
  };

  // Helper function to get the create view name based on active tab
  const getCreateViewName = () => {
    switch (activeSubTab) {
      case "actions":
        return "createAction";
      case "results":
        return "createResult";
      case "violations":
        return "createViolation";
      default:
        return "createAction";
    }
  };

  // Helper function to get the item count based on active tab
  const getItemCount = () => {
    switch (activeSubTab) {
      case "actions":
        return filteredActions.length;
      case "results":
        return filteredResults.length;
      case "violations":
        return filteredViolations.length;
      default:
        return 0;
    }
  };

  // Handler for editing an item
  const handleEditItem = (item, type) => {
    switch (type) {
      case "action":
        setSelectedAction(item);
        setActiveView("editAction");
        break;
      case "result":
        setSelectedResult(item);
        setActiveView("editResult");
        break;
      case "violation":
        setSelectedViolation(item);
        setActiveView("editViolation");
        break;
      default:
        break;
    }
  };

  // Render active content based on sub-tab selection
  const renderActiveSubTabContent = () => {
    switch (activeSubTab) {
      case "actions":
        return (
          <DisciplinaryActionTable
            actions={filteredActions}
            results={disciplinaryResults}
            searchTerm={searchTerm}
            hasPermission={hasPermission}
            onEdit={(action) => handleEditItem(action, "action")}
            onDelete={handleShowDeleteModal}
            onCreateNew={() => setActiveView("createAction")}
          />
        );
      case "results":
        return (
          <DisciplinaryResultTable
            results={filteredResults}
            searchTerm={searchTerm}
            hasPermission={hasPermission}
            onEdit={(result) => handleEditItem(result, "result")}
            onDelete={handleShowDeleteModal}
            onCreateNew={() => setActiveView("createResult")}
          />
        );
      case "violations":
        return (
          <DisciplinaryViolationTable
            violations={filteredViolations}
            searchTerm={searchTerm}
            hasPermission={hasPermission}
            onEdit={(violation) => handleEditItem(violation, "violation")}
            onDelete={handleShowDeleteModal}
            onCreateNew={() => setActiveView("createViolation")}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{ color: themeColors.text }}
          >
            Disciplinary Management
          </h2>
          <p className="text-sm mt-1" style={{ color: themeColors.textLight }}>
            {activeSubTab === "actions"
              ? `${filteredActions.length} disciplinary actions`
              : activeSubTab === "results"
              ? `${filteredResults.length} action results`
              : `${filteredViolations.length} policy violations`}
          </p>
        </div>

        {/* Only show create buttons if user has permission */}
        {hasPermission && (
          <button
            onClick={() => setActiveView(getCreateViewName())}
            className="px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200"
            style={{
              background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
              color: themeColors.background,
              boxShadow: `0 2px 8px ${themeColors.primaryDark}30`,
            }}
          >
            <Plus size={20} strokeWidth={2.5} />
            <span className="font-medium">{getAddButtonLabel()}</span>
          </button>
        )}
      </div>

      {/* Search bar */}
      <DisciplinarySearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-6">
          <div
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-opacity-25 border-t-transparent"
            style={{ color: themeColors.primary }}
          ></div>
          <p className="mt-2 text-sm" style={{ color: themeColors.textLight }}>
            Loading...
          </p>
        </div>
      )}

      {/* Sub tabs navigation */}
      {!loading && (
        <DisciplinarySubTabs
          activeSubTab={activeSubTab}
          setActiveSubTab={setActiveSubTab}
        />
      )}

      {/* Content based on active sub tab */}
      {!loading && renderActiveSubTabContent()}
    </>
  );
};

export default DisciplinaryDashboard;
