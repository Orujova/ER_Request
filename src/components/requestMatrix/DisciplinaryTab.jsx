import React, { useState, useEffect } from "react";
import { themeColors } from "../../styles/theme";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";
import {
  Plus,
  Search,
  BookOpen,
  Tag,
  AlertTriangle,
  Edit3,
  Trash2,
  X,
} from "lucide-react";
import DisciplinaryActionForm from "./DisciplinaryActionForm";
import DisciplinaryViolationForm from "./DisciplinaryViolationForm";
import DisciplinaryResultForm from "./DisciplinaryResultForm";
import EmptyState from "./EmptyState";
import DeleteConfirmationModal from "../common/DeleteConfirmationModal";
import { showToast } from "../../toast/toast";

const DisciplinaryTab = () => {
  // Authentication
  const { jwtToken } = getStoredTokens();

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

  // Delete modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(""); // 'action', 'result', or 'violation'

  // API headers
  const getRequestHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    };
  };

  // Notification
  const showNotification = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // API: Fetch all disciplinary actions
  const fetchDisciplinaryActions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/GetAllDisciplinaryAction`, {
        headers: getRequestHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch disciplinary actions");
      const data = await response.json();
      setDisciplinaryActions(data[0]?.DisciplinaryActions || []);
      return data[0]?.DisciplinaryActions || [];
    } catch (err) {
      showNotification(err.message, true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // API: Fetch all disciplinary results
  const fetchDisciplinaryResults = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/GetAllDisciplinaryActionResult`,
        {
          headers: getRequestHeaders(),
        }
      );
      if (!response.ok) throw new Error("Failed to fetch disciplinary results");
      const data = await response.json();
      setDisciplinaryResults(data[0]?.DisciplinaryActionResults || []);
      return data[0]?.DisciplinaryActionResults || [];
    } catch (err) {
      showNotification(err.message, true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // API: Fetch all disciplinary violations
  const fetchDisciplinaryViolations = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/GetAllDisciplinaryViolation`,
        {
          headers: getRequestHeaders(),
        }
      );
      if (!response.ok)
        throw new Error("Failed to fetch disciplinary violations");
      const data = await response.json();
      setDisciplinaryViolations(data[0]?.DisciplinaryViolations || []);
      return data[0]?.DisciplinaryViolations || [];
    } catch (err) {
      showNotification(err.message, true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // API: Create new disciplinary action
  const createDisciplinaryAction = async (action) => {
    if (!action.Name.trim()) {
      showNotification("Name cannot be empty", true);
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/CreateDisciplinaryAction`, {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Name: action.Name,
          DisciplinaryActionResultId: action.DisciplinaryActionResultId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create disciplinary action");
      const createdAction = await response.json();

      // Update actions list
      await fetchDisciplinaryActions();
      showNotification(
        `Disciplinary action "${action.Name}" created successfully`
      );
      setActiveView("dashboard");
      return createdAction;
    } catch (err) {
      showNotification(err.message, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Create new disciplinary result
  const createDisciplinaryResult = async (result) => {
    if (!result.Name.trim()) {
      showNotification("Name cannot be empty", true);
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/CreateDisciplinaryActionResult`,
        {
          method: "POST",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            Name: result.Name,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to create disciplinary result");
      const createdResult = await response.json();

      // Update results list
      await fetchDisciplinaryResults();
      showNotification(
        `Disciplinary result "${result.Name}" created successfully`
      );
      setActiveView("dashboard");
      return createdResult;
    } catch (err) {
      showNotification(err.message, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Create new disciplinary violation
  const createDisciplinaryViolation = async (violation) => {
    if (!violation.Name.trim()) {
      showNotification("Name cannot be empty", true);
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/CreateDisciplinaryViolation`,
        {
          method: "POST",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            Name: violation.Name,
          }),
        }
      );

      if (!response.ok)
        throw new Error("Failed to create disciplinary violation");
      const createdViolation = await response.json();

      // Update violations list
      await fetchDisciplinaryViolations();
      showNotification(
        `Disciplinary violation "${violation.Name}" created successfully`
      );
      setActiveView("dashboard");
      return createdViolation;
    } catch (err) {
      showNotification(err.message, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Update disciplinary action
  const updateDisciplinaryAction = async (action) => {
    if (!action.Name.trim()) {
      showNotification("Name cannot be empty", true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/UpdateDisciplinaryAction`, {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: action.Id,
          Name: action.Name,
          DisciplinaryActionResultId: action.DisciplinaryActionResultId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update disciplinary action");

      // Update actions list
      await fetchDisciplinaryActions();
      showNotification(
        `Disciplinary action "${action.Name}" updated successfully`
      );
      setSelectedAction(null);
      setActiveView("dashboard");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Update disciplinary result
  const updateDisciplinaryResult = async (result) => {
    if (!result.Name.trim()) {
      showNotification("Name cannot be empty", true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/UpdateDisciplinaryActionResult`,
        {
          method: "PUT",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            Id: result.Id,
            Name: result.Name,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update disciplinary result");

      // Update results list
      await fetchDisciplinaryResults();
      showNotification(
        `Disciplinary result "${result.Name}" updated successfully`
      );
      setSelectedResult(null);
      setActiveView("dashboard");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Update disciplinary violation
  const updateDisciplinaryViolation = async (violation) => {
    if (!violation.Name.trim()) {
      showNotification("Name cannot be empty", true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/UpdateDisciplinaryViolation`,
        {
          method: "PUT",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            Id: violation.Id,
            Name: violation.Name,
          }),
        }
      );

      if (!response.ok)
        throw new Error("Failed to update disciplinary violation");

      // Update violations list
      await fetchDisciplinaryViolations();
      showNotification(
        `Disciplinary violation "${violation.Name}" updated successfully`
      );
      setSelectedViolation(null);
      setActiveView("dashboard");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // Handler for showing delete confirmation modal
  const handleShowDeleteModal = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setIsDeleteModalOpen(true);
  };

  // Handler for confirming deletion
  const handleConfirmDelete = async (id) => {
    if (deleteType === "action") {
      await deleteDisciplinaryAction(id);
    } else if (deleteType === "result") {
      await deleteDisciplinaryResult(id);
    } else if (deleteType === "violation") {
      await deleteDisciplinaryViolation(id);
    }
  };

  // API: Delete disciplinary action
  const deleteDisciplinaryAction = async (actionId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/DeleteDisciplinaryAction`, {
        method: "DELETE",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: actionId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete disciplinary action");

      // Update actions list
      await fetchDisciplinaryActions();
      showNotification("Disciplinary action deleted successfully");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Delete disciplinary result
  const deleteDisciplinaryResult = async (resultId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/DeleteDisciplinaryActionResult`,
        {
          method: "DELETE",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            Id: resultId,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to delete disciplinary result");

      // Update results list
      await fetchDisciplinaryResults();
      showNotification("Disciplinary result deleted successfully");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Delete disciplinary violation
  const deleteDisciplinaryViolation = async (violationId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/DeleteDisciplinaryViolation`,
        {
          method: "DELETE",
          headers: getRequestHeaders(),
          body: JSON.stringify({
            Id: violationId,
          }),
        }
      );

      if (!response.ok)
        throw new Error("Failed to delete disciplinary violation");

      // Update violations list
      await fetchDisciplinaryViolations();
      showNotification("Disciplinary violation deleted successfully");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchDisciplinaryActions(),
        fetchDisciplinaryResults(),
        fetchDisciplinaryViolations(),
      ]);
    };

    loadData();
  }, []);

  // Filter data based on search term
  const filteredActions = disciplinaryActions.filter(
    (action) =>
      action.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      action.Id.toString().includes(searchTerm)
  );

  const filteredResults = disciplinaryResults.filter(
    (result) =>
      result.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.Id.toString().includes(searchTerm)
  );

  const filteredViolations = disciplinaryViolations.filter(
    (violation) =>
      violation.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.Id.toString().includes(searchTerm)
  );

  // Get result name by ID
  const getResultNameById = (resultId) => {
    const result = disciplinaryResults.find((r) => r.Id === resultId);
    return result ? result.Name : "Unknown";
  };

  // Render view based on activeView state
  const renderView = () => {
    switch (activeView) {
      case "createAction":
        return (
          <DisciplinaryActionForm
            action={{
              Name: "",
              DisciplinaryActionResultId: disciplinaryResults[0]?.Id || 0,
            }}
            onSubmit={createDisciplinaryAction}
            onCancel={() => setActiveView("dashboard")}
            results={disciplinaryResults}
            formTitle="Create Disciplinary Action"
            submitLabel="Create"
          />
        );
      case "editAction":
        return (
          <DisciplinaryActionForm
            action={selectedAction}
            onSubmit={updateDisciplinaryAction}
            onCancel={() => {
              setSelectedAction(null);
              setActiveView("dashboard");
            }}
            results={disciplinaryResults}
            formTitle="Edit Disciplinary Action"
            submitLabel="Update"
          />
        );
      case "createResult":
        return (
          <DisciplinaryResultForm
            result={{ Name: "" }}
            onSubmit={createDisciplinaryResult}
            onCancel={() => setActiveView("dashboard")}
            formTitle="Create Disciplinary Result"
            submitLabel="Create"
          />
        );
      case "editResult":
        return (
          <DisciplinaryResultForm
            result={selectedResult}
            onSubmit={updateDisciplinaryResult}
            onCancel={() => {
              setSelectedResult(null);
              setActiveView("dashboard");
            }}
            formTitle="Edit Disciplinary Result"
            submitLabel="Update"
          />
        );
      case "createViolation":
        return (
          <DisciplinaryViolationForm
            violation={{ Name: "" }}
            onSubmit={createDisciplinaryViolation}
            onCancel={() => setActiveView("dashboard")}
            formTitle="Create Policy Violation"
            submitLabel="Create"
          />
        );
      case "editViolation":
        return (
          <DisciplinaryViolationForm
            violation={selectedViolation}
            onSubmit={updateDisciplinaryViolation}
            onCancel={() => {
              setSelectedViolation(null);
              setActiveView("dashboard");
            }}
            formTitle="Edit Policy Violation"
            submitLabel="Update"
          />
        );
      default:
        return renderDashboard();
    }
  };

  // Sub-tab navigation
  const renderSubTabNav = () => {
    const tabs = [
      { id: "actions", label: "Disciplinary Actions", icon: BookOpen },
      { id: "results", label: "Action Results", icon: Tag },
      { id: "violations", label: "Policy Violations", icon: AlertTriangle },
    ];

    return (
      <div
        className="relative mb-8 p-1.5 rounded-xl"
        style={{
          background: `linear-gradient(to right, ${themeColors.primaryLight}15, ${themeColors.secondaryLight}25)`,
          boxShadow: `0 2px 10px ${themeColors.shadowLight}`,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <div className="flex">
          {tabs.map((tab) => {
            const isActive = activeSubTab === tab.id;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`relative flex items-center justify-center py-3 px-6 font-medium text-sm rounded-lg transition-all duration-300 ${
                  isActive ? "shadow-md" : "hover:bg-white hover:bg-opacity-30"
                }`}
                style={{
                  color: isActive ? themeColors.primary : themeColors.textLight,
                  backgroundColor: isActive ? "white" : "transparent",
                  flex: 1,
                  zIndex: isActive ? 1 : 0,
                  transform: isActive ? "translateY(-2px)" : "none",
                }}
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2 : 1.5}
                  className="mr-2"
                />
                <span>{tab.label}</span>

                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 w-1.5 h-1.5 rounded-full transform -translate-x-1/2 translate-y-0.5"
                    style={{ backgroundColor: themeColors.primary }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Render table for disciplinary actions
  const renderActionsTable = () => {
    if (filteredActions.length === 0) {
      return (
        <EmptyState
          icon={() => (
            <BookOpen size={64} strokeWidth={1.5} className="text-gray-400" />
          )}
          title="No Disciplinary Actions Found"
          message={
            searchTerm
              ? `No actions match your search for "${searchTerm}"`
              : "Get started by creating your first disciplinary action"
          }
          buttonText={searchTerm ? "Clear Search" : "Create Action"}
          buttonAction={
            searchTerm
              ? () => setSearchTerm("")
              : () => setActiveView("createAction")
          }
          searchTerm={searchTerm}
        />
      );
    }

    return (
      <div
        className="overflow-hidden rounded-lg shadow-sm"
        style={{ border: `1px solid ${themeColors.border}` }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: `${themeColors.secondaryLight}` }}>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Result
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredActions.map((action) => (
              <tr
                key={action.Id}
                className="hover:bg-gray-50 transition-colors duration-150"
                style={{ backgroundColor: themeColors.background }}
              >
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: themeColors.textLight }}
                >
                  {action.Id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {action.Name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full"
                    style={{
                      backgroundColor: "#e6f4f7",
                      color: "#0891b2",
                    }}
                  >
                    {getResultNameById(action.DisciplinaryActionResultId)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAction(action);
                      setActiveView("editAction");
                    }}
                    style={{ color: themeColors.primary }}
                  >
                    <Edit3 size={16} className="inline mr-1" />
                  </button>
                  <button
                    onClick={() => handleShowDeleteModal(action, "action")}
                  >
                    <Trash2
                      size={16}
                      className="inline ml-1  text-red-600 hover:bg-red-50"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render table for disciplinary results
  const renderResultsTable = () => {
    if (filteredResults.length === 0) {
      return (
        <EmptyState
          icon={() => (
            <Tag size={64} strokeWidth={1.5} className="text-gray-400" />
          )}
          title="No Action Results Found"
          message={
            searchTerm
              ? `No results match your search for "${searchTerm}"`
              : "Get started by creating your first action result"
          }
          buttonText={searchTerm ? "Clear Search" : "Create Result"}
          buttonAction={
            searchTerm
              ? () => setSearchTerm("")
              : () => setActiveView("createResult")
          }
          searchTerm={searchTerm}
        />
      );
    }

    return (
      <div
        className="overflow-hidden rounded-lg shadow-sm"
        style={{ border: `1px solid ${themeColors.border}` }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: `${themeColors.secondaryLight}` }}>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map((result) => (
              <tr
                key={result.Id}
                className="hover:bg-gray-50 transition-colors duration-150"
                style={{ backgroundColor: themeColors.background }}
              >
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: themeColors.textLight }}
                >
                  {result.Id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {result.Name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAction(result);
                      setActiveView("editResult");
                    }}
                    style={{ color: themeColors.primary }}
                  >
                    <Edit3 size={16} className="inline mr-1" />
                  </button>
                  <button
                    onClick={() => handleShowDeleteModal(result, "result")}
                  >
                    <Trash2
                      size={16}
                      className="inline ml-1  text-red-600 hover:bg-red-50"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render table for disciplinary violations
  const renderViolationsTable = () => {
    if (filteredViolations.length === 0) {
      return (
        <EmptyState
          icon={() => (
            <AlertTriangle
              size={64}
              strokeWidth={1.5}
              className="text-gray-400"
            />
          )}
          title="No Policy Violations Found"
          message={
            searchTerm
              ? `No violations match your search for "${searchTerm}"`
              : "Get started by creating your first policy violation"
          }
          buttonText={searchTerm ? "Clear Search" : "Create Violation"}
          buttonAction={
            searchTerm
              ? () => setSearchTerm("")
              : () => setActiveView("createViolation")
          }
          searchTerm={searchTerm}
        />
      );
    }

    return (
      <div
        className="overflow-hidden rounded-lg shadow-sm"
        style={{ border: `1px solid ${themeColors.border}` }}
      >
        <table className="min-w-full divide-y divide-gray-200">
          <thead style={{ backgroundColor: `${themeColors.secondaryLight}` }}>
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredViolations.map((violation) => (
              <tr
                key={violation.Id}
                className="hover:bg-gray-50 transition-colors duration-150"
                style={{ backgroundColor: themeColors.background }}
              >
                <td
                  className="px-6 py-4 whitespace-nowrap text-sm"
                  style={{ color: themeColors.textLight }}
                >
                  {violation.Id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className="text-sm font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {violation.Name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedViolation(violation);
                      setActiveView("editViolation");
                    }}
                    style={{ color: themeColors.primary }}
                  >
                    <Edit3 size={16} className="inline mr-1" />
                  </button>
                  <button
                    onClick={() =>
                      handleShowDeleteModal(violation, "violation")
                    }
                  >
                    <Trash2
                      size={16}
                      className="inline ml-1  text-red-600 hover:bg-red-50"
                    />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Render active content based on sub-tab selection
  const renderActiveSubTabContent = () => {
    switch (activeSubTab) {
      case "actions":
        return renderActionsTable();
      case "results":
        return renderResultsTable();
      case "violations":
        return renderViolationsTable();
      default:
        return renderActionsTable();
    }
  };

  // Render dashboard
  const renderDashboard = () => {
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
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              {activeSubTab === "actions"
                ? `${filteredActions.length} disciplinary actions`
                : activeSubTab === "results"
                ? `${filteredResults.length} action results`
                : `${filteredViolations.length} policy violations`}
            </p>
          </div>

          {activeSubTab === "actions" && (
            <button
              onClick={() => setActiveView("createAction")}
              className="px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 8px ${themeColors.primaryDark}30`,
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="font-medium">Add Disciplinary Action</span>
            </button>
          )}
          {activeSubTab === "results" && (
            <button
              onClick={() => setActiveView("createResult")}
              className="px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 8px ${themeColors.primaryDark}30`,
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="font-medium">Add Action Result</span>
            </button>
          )}
          {activeSubTab === "violations" && (
            <button
              onClick={() => setActiveView("createViolation")}
              className="px-4 py-2.5 rounded-lg flex items-center space-x-2 transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 8px ${themeColors.primaryDark}30`,
              }}
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="font-medium">Add Policy Violation</span>
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} strokeWidth={2} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
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
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="text-center py-6">
            <div
              className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-opacity-25 border-t-transparent"
              style={{ color: themeColors.primary }}
            ></div>
            <p
              className="mt-2 text-sm"
              style={{ color: themeColors.textLight }}
            >
              Loading...
            </p>
          </div>
        )}

        {/* Sub tabs navigation */}
        {!loading && renderSubTabNav()}

        {/* Content based on active sub tab */}
        {!loading && renderActiveSubTabContent()}
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
