// src/components/requestMatrix/DisciplinaryTab.jsx
import React, { useState, useEffect } from "react";
import { themeColors } from "../../styles/theme";
import {
  canManageContent,
  withPermissionCheck,
} from "../../utils/permissionChecks";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";

// Service imports
import * as disciplinaryService from "../../services/disciplinaryService";

// Component imports
import DisciplinaryDashboard from "./DisciplinaryDashboard";
import DisciplinaryActionFormPage from "./DisciplinaryActionFormPage";
import DisciplinaryResultFormPage from "./DisciplinaryResultFormPage";
import DisciplinaryViolationFormPage from "./DisciplinaryViolationFormPage";

// Utility imports
import { filterDisciplinaryData } from "../../utils/disciplinaryUtils";

const DisciplinaryTab = () => {
  // States
  const [activeView, setActiveView] = useState("dashboard");
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);
  const [disciplinaryResults, setDisciplinaryResults] = useState([]);
  const [disciplinaryViolations, setDisciplinaryViolations] = useState([]);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSubTab, setActiveSubTab] = useState("actions");

  // Check if user has permission to manage content
  const hasPermission = canManageContent();

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'action', 'result', or 'violation'

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

  // Load all data function
  const loadAllData = async () => {
    const actionsData = await disciplinaryService.fetchDisciplinaryActions(
      setLoading,
      setError
    );
    setDisciplinaryActions(actionsData);

    const resultsData = await disciplinaryService.fetchDisciplinaryResults(
      setLoading,
      setError
    );
    setDisciplinaryResults(resultsData);

    const violationsData =
      await disciplinaryService.fetchDisciplinaryViolations(
        setLoading,
        setError
      );
    setDisciplinaryViolations(violationsData);
  };

  // Handler for showing delete confirmation modal
  const handleShowDeleteModal = withPermissionCheck((item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  });

  // Handler for confirming deletion
  const handleConfirmDelete = withPermissionCheck(async () => {
    if (!itemToDelete) return;

    let success = false;

    if (deleteType === "action") {
      success = await disciplinaryService.deleteDisciplinaryAction(
        itemToDelete.Id,
        setLoading,
        setError,
        setSuccess
      );
      if (success) {
        const updatedActions =
          await disciplinaryService.fetchDisciplinaryActions(
            setLoading,
            setError
          );
        setDisciplinaryActions(updatedActions);
      }
    } else if (deleteType === "result") {
      success = await disciplinaryService.deleteDisciplinaryResult(
        itemToDelete.Id,
        setLoading,
        setError,
        setSuccess
      );
      if (success) {
        const updatedResults =
          await disciplinaryService.fetchDisciplinaryResults(
            setLoading,
            setError
          );
        setDisciplinaryResults(updatedResults);
      }
    } else if (deleteType === "violation") {
      success = await disciplinaryService.deleteDisciplinaryViolation(
        itemToDelete.Id,
        setLoading,
        setError,
        setSuccess
      );
      if (success) {
        const updatedViolations =
          await disciplinaryService.fetchDisciplinaryViolations(
            setLoading,
            setError
          );
        setDisciplinaryViolations(updatedViolations);
      }
    }

    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  });

  // Create handlers
  const handleCreateAction = withPermissionCheck(async (action) => {
    const createdAction = await disciplinaryService.createDisciplinaryAction(
      action,
      setLoading,
      setError,
      setSuccess
    );
    if (createdAction) {
      const updatedActions = await disciplinaryService.fetchDisciplinaryActions(
        setLoading,
        setError
      );
      setDisciplinaryActions(updatedActions);
      setActiveView("dashboard");
    }
  });

  const handleCreateResult = withPermissionCheck(async (result) => {
    const createdResult = await disciplinaryService.createDisciplinaryResult(
      result,
      setLoading,
      setError,
      setSuccess
    );
    if (createdResult) {
      const updatedResults = await disciplinaryService.fetchDisciplinaryResults(
        setLoading,
        setError
      );
      setDisciplinaryResults(updatedResults);
      setActiveView("dashboard");
    }
  });

  const handleCreateViolation = withPermissionCheck(async (violation) => {
    const createdViolation =
      await disciplinaryService.createDisciplinaryViolation(
        violation,
        setLoading,
        setError,
        setSuccess
      );
    if (createdViolation) {
      const updatedViolations =
        await disciplinaryService.fetchDisciplinaryViolations(
          setLoading,
          setError
        );
      setDisciplinaryViolations(updatedViolations);
      setActiveView("dashboard");
    }
  });

  // Update handlers
  const handleUpdateAction = withPermissionCheck(async (action) => {
    const success = await disciplinaryService.updateDisciplinaryAction(
      action,
      setLoading,
      setError,
      setSuccess
    );
    if (success) {
      const updatedActions = await disciplinaryService.fetchDisciplinaryActions(
        setLoading,
        setError
      );
      setDisciplinaryActions(updatedActions);
      setSelectedAction(null);
      setActiveView("dashboard");
    }
  });

  const handleUpdateResult = withPermissionCheck(async (result) => {
    const success = await disciplinaryService.updateDisciplinaryResult(
      result,
      setLoading,
      setError,
      setSuccess
    );
    if (success) {
      const updatedResults = await disciplinaryService.fetchDisciplinaryResults(
        setLoading,
        setError
      );
      setDisciplinaryResults(updatedResults);
      setSelectedResult(null);
      setActiveView("dashboard");
    }
  });

  const handleUpdateViolation = withPermissionCheck(async (violation) => {
    const success = await disciplinaryService.updateDisciplinaryViolation(
      violation,
      setLoading,
      setError,
      setSuccess
    );
    if (success) {
      const updatedViolations =
        await disciplinaryService.fetchDisciplinaryViolations(
          setLoading,
          setError
        );
      setDisciplinaryViolations(updatedViolations);
      setSelectedViolation(null);
      setActiveView("dashboard");
    }
  });

  // Cancel handlers
  const handleCancelAction = () => {
    setSelectedAction(null);
    setActiveView("dashboard");
  };

  const handleCancelResult = () => {
    setSelectedResult(null);
    setActiveView("dashboard");
  };

  const handleCancelViolation = () => {
    setSelectedViolation(null);
    setActiveView("dashboard");
  };

  // Filter data based on search term
  const filteredActions = filterDisciplinaryData(
    disciplinaryActions,
    searchTerm
  );
  const filteredResults = filterDisciplinaryData(
    disciplinaryResults,
    searchTerm
  );
  const filteredViolations = filterDisciplinaryData(
    disciplinaryViolations,
    searchTerm
  );

  // Render view based on activeView state
  const renderView = () => {
    switch (activeView) {
      case "createAction":
        return (
          <DisciplinaryActionFormPage
            isCreating={true}
            disciplinaryResults={disciplinaryResults}
            onSubmit={handleCreateAction}
            onCancel={handleCancelAction}
          />
        );
      case "editAction":
        return (
          <DisciplinaryActionFormPage
            isCreating={false}
            selectedAction={selectedAction}
            disciplinaryResults={disciplinaryResults}
            onSubmit={handleUpdateAction}
            onCancel={handleCancelAction}
          />
        );
      case "createResult":
        return (
          <DisciplinaryResultFormPage
            isCreating={true}
            onSubmit={handleCreateResult}
            onCancel={handleCancelResult}
          />
        );
      case "editResult":
        return (
          <DisciplinaryResultFormPage
            isCreating={false}
            selectedResult={selectedResult}
            onSubmit={handleUpdateResult}
            onCancel={handleCancelResult}
          />
        );
      case "createViolation":
        return (
          <DisciplinaryViolationFormPage
            isCreating={true}
            onSubmit={handleCreateViolation}
            onCancel={handleCancelViolation}
          />
        );
      case "editViolation":
        return (
          <DisciplinaryViolationFormPage
            isCreating={false}
            selectedViolation={selectedViolation}
            onSubmit={handleUpdateViolation}
            onCancel={handleCancelViolation}
          />
        );
      default:
        return (
          <DisciplinaryDashboard
            activeSubTab={activeSubTab}
            setActiveSubTab={setActiveSubTab}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredActions={filteredActions}
            filteredResults={filteredResults}
            filteredViolations={filteredViolations}
            disciplinaryResults={disciplinaryResults}
            hasPermission={hasPermission}
            loading={loading}
            setActiveView={setActiveView}
            setSelectedAction={setSelectedAction}
            setSelectedResult={setSelectedResult}
            setSelectedViolation={setSelectedViolation}
            handleShowDeleteModal={handleShowDeleteModal}
          />
        );
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto p-6 rounded-xl"
      style={{
        backgroundColor: `${themeColors.secondaryLight}20`,
      }}
    >
      {renderView()}

      {/* Error notification */}
      {error && (
        <div
          className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg"
          style={{ zIndex: 50 }}
        >
          {error}
        </div>
      )}

      {/* Success notification */}
      {success && (
        <div
          className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          style={{ zIndex: 50 }}
        >
          {success}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Delete ${
          deleteType === "action"
            ? "Disciplinary Action"
            : deleteType === "result"
            ? "Action Result"
            : "Policy Violation"
        }`}
        message={
          deleteType === "action"
            ? `Are you sure you want to delete this disciplinary action? This action cannot be undone.`
            : deleteType === "result"
            ? `Are you sure you want to delete this action result? This may affect associated disciplinary actions and cannot be undone.`
            : `Are you sure you want to delete this policy violation? This action cannot be undone.`
        }
        itemToDelete={itemToDelete}
        itemType={deleteType}
      />
    </div>
  );
};

export default DisciplinaryTab;
