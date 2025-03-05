import React, { useState, useEffect } from "react";
import { themeColors } from "../../styles/theme";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";
import DisciplinaryActionForm from "./DisciplinaryActionForm";
import DisciplinaryViolationForm from "./DisciplinaryViolationForm";
import DisciplinaryResultForm from "./DisciplinaryResultForm";
import EmptyState from "./EmptyState";

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

  // API: Delete disciplinary action
  const deleteDisciplinaryAction = async (actionId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this disciplinary action?"
      )
    ) {
      return;
    }

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
    if (
      !window.confirm(
        "Are you sure you want to delete this disciplinary result?"
      )
    ) {
      return;
    }

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
    if (
      !window.confirm(
        "Are you sure you want to delete this disciplinary violation?"
      )
    ) {
      return;
    }

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
      { id: "actions", label: "Disciplinary Actions" },
      { id: "results", label: "Action Results" },
      { id: "violations", label: "Policy Violations" },
    ];

    return (
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex -mb-px" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
                activeSubTab === tab.id ? "border-b-2" : "border-transparent"
              }`}
              style={{
                color:
                  activeSubTab === tab.id
                    ? themeColors.primary
                    : themeColors.textLight,
                borderColor:
                  activeSubTab === tab.id ? themeColors.primary : "transparent",
                backgroundColor:
                  activeSubTab === tab.id
                    ? `${themeColors.primaryLight}10`
                    : "transparent",
              }}
              aria-current={activeSubTab === tab.id ? "page" : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  // Render table for disciplinary actions
  const renderActionsTable = () => {
    if (filteredActions.length === 0) {
      return (
        <EmptyState
          icon="document"
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Result
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {action.Id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {action.Name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {getResultNameById(action.DisciplinaryActionResultId)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedAction(action);
                      setActiveView("editAction");
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDisciplinaryAction(action.Id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
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
          icon="document"
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {result.Id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {result.Name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedResult(result);
                      setActiveView("editResult");
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDisciplinaryResult(result.Id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
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
          icon="document"
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
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {violation.Id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {violation.Name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedViolation(violation);
                      setActiveView("editViolation");
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteDisciplinaryViolation(violation.Id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
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
        <div className="flex justify-between items-center mb-6">
          <h2
            className="text-2xl font-bold"
            style={{ color: themeColors.text }}
          >
            Disciplinary Management
          </h2>
          {activeSubTab === "actions" && (
            <button
              onClick={() => setActiveView("createAction")}
              className="px-4 py-2 rounded-md flex items-center transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 4px ${themeColors.primaryDark}40`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 4px ${themeColors.primaryDark}40`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Disciplinary Action
            </button>
          )}
          {activeSubTab === "results" && (
            <button
              onClick={() => setActiveView("createResult")}
              className="px-4 py-2 rounded-md flex items-center transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 4px ${themeColors.primaryDark}40`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = `0 3px 6px ${themeColors.primaryDark}60`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 4px ${themeColors.primaryDark}40`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Action Result
            </button>
          )}
          {activeSubTab === "violations" && (
            <button
              onClick={() => setActiveView("createViolation")}
              className="px-4 py-2 rounded-md flex items-center transition-all duration-200"
              style={{
                background: `linear-gradient(to right, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
                color: themeColors.background,
                boxShadow: `0 2px 4px ${themeColors.primaryDark}40`,
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = `0 3px 6px ${themeColors.primaryDark}60`;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = `0 2px 4px ${themeColors.primaryDark}40`;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Policy Violation
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
                style={{ color: themeColors.textLight }}
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name or ID..."
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
          </div>
        </div>

        {/* Sub tabs navigation */}
        {renderSubTabNav()}

        {/* Content based on active sub tab */}
        {renderActiveSubTabContent()}
      </>
    );
  };

  return <div className="max-w-5xl mx-auto">{renderView()}</div>;
};

export default DisciplinaryTab;
