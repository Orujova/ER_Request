import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../apiConfig";
import { themeColors } from "../styles/theme";

const CaseManagementSystem = () => {
  // Main state
  const [cases, setCases] = useState([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [subCases, setSubCases] = useState([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Selected items state
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedSubCase, setSelectedSubCase] = useState(null);

  // Form states
  const [newCase, setNewCase] = useState({
    caseName: "",
  });

  const [newSubCase, setNewSubCase] = useState({
    description: "",
    caseId: null,
  });

  // Track expanded cases in accordion view
  const [expandedCases, setExpandedCases] = useState({});

  // Toast notification
  const showNotification = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(null), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  // API: Fetch all cases
  const fetchCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case`);
      if (!response.ok) throw new Error("Failed to fetch cases");
      const data = await response.json();
      setCases(data[0].Cases);
      return data[0].Cases;
    } catch (err) {
      showNotification(err.message, true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // API: Fetch all subcases
  const fetchAllSubCases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`);
      if (!response.ok) throw new Error("Failed to fetch subcases");
      const data = await response.json();
      setSubCases(data[0].SubCases);

      // Create initial expanded state for all cases
      const initialExpandedState = {};
      cases.forEach((caseItem) => {
        initialExpandedState[caseItem.Id] = false;
      });
      setExpandedCases(initialExpandedState);

      return data[0].SubCases;
    } catch (err) {
      showNotification(err.message, true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // API: Create new case
  const createCase = async () => {
    if (!newCase.caseName.trim()) {
      showNotification("Case name cannot be empty", true);
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          CaseName: newCase.caseName,
        }),
      });

      if (!response.ok) throw new Error("Failed to create case");
      const createdCase = await response.json();

      // Update cases list
      setCases((prevCases) => [...prevCases, createdCase]);

      // Add to expanded cases state
      setExpandedCases((prev) => ({
        ...prev,
        [createdCase.Id]: true,
      }));

      showNotification(`Case "${createdCase.CaseName}" created successfully`);
      setNewCase({ caseName: "" });
      setActiveView("dashboard");
      return createdCase;
    } catch (err) {
      showNotification(err.message, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Create new subcase
  const createSubCase = async (caseId) => {
    if (!newSubCase.description.trim()) {
      showNotification("Description cannot be empty", true);
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Description: newSubCase.description,
          CaseId: caseId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create subcase");
      const createdSubCase = await response.json();

      // Update subcases list
      setSubCases((prevSubCases) => [...prevSubCases, createdSubCase]);
      showNotification("SubCase created successfully");

      // Reset form
      setNewSubCase({
        description: "",
        caseId: null,
      });

      // Refresh data
      await fetchAllSubCases();

      return createdSubCase;
    } catch (err) {
      showNotification(err.message, true);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Update case
  const updateCase = async (caseData) => {
    if (!caseData || !caseData.Id) {
      showNotification("Invalid case data", true);
      return;
    }

    if (!caseData.CaseName.trim()) {
      showNotification("Case name cannot be empty", true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id: caseData.Id,
          CaseName: caseData.CaseName,
        }),
      });

      if (!response.ok) throw new Error("Failed to update case");

      // Update local state
      setCases((prevCases) =>
        prevCases.map((c) =>
          c.Id === caseData.Id ? { ...c, CaseName: caseData.CaseName } : c
        )
      );

      if (selectedCase?.Id === caseData.Id) {
        setSelectedCase({ ...selectedCase, CaseName: caseData.CaseName });
      }

      showNotification(`Case "${caseData.CaseName}" updated successfully`);
      setActiveView("dashboard");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Update subcase
  const updateSubCase = async (subcaseData) => {
    if (!subcaseData || !subcaseData.Id) {
      showNotification("Invalid subcase data", true);
      return;
    }

    if (!subcaseData.Description.trim()) {
      showNotification("Description cannot be empty", true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          Id: subcaseData.Id,
          Description: subcaseData.Description,
          CaseId: subcaseData.CaseId,
        }),
      });

      if (!response.ok) throw new Error("Failed to update subcase");

      // Update subcases list
      setSubCases((prevSubCases) =>
        prevSubCases.map((sc) =>
          sc.Id === subcaseData.Id
            ? {
                ...sc,
                Description: subcaseData.Description,
                CaseId: subcaseData.CaseId,
              }
            : sc
        )
      );

      setSelectedSubCase(null);
      showNotification("SubCase updated successfully");

      // Refresh data
      await fetchAllSubCases();
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Delete case
  const deleteCase = async (caseId) => {
    // Check if case has subcases
    const relatedSubcases = subCases.filter((sc) => sc.CaseId === caseId);

    if (relatedSubcases.length > 0) {
      if (
        !window.confirm(
          `This case has ${relatedSubcases.length} subcases. Delete them all?`
        )
      ) {
        return;
      }

      // Delete all subcases first
      for (const subCase of relatedSubcases) {
        await deleteSubCase(subCase.Id, false); // silent delete
      }
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case/${caseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete case");

      // Update local state
      setCases((prevCases) => prevCases.filter((c) => c.Id !== caseId));

      // Remove from expanded cases state
      setExpandedCases((prev) => {
        const newState = { ...prev };
        delete newState[caseId];
        return newState;
      });

      if (selectedCase?.Id === caseId) {
        setSelectedCase(null);
      }

      showNotification("Case deleted successfully");
    } catch (err) {
      showNotification(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  // API: Delete subcase
  const deleteSubCase = async (subCaseId, showMessages = true) => {
    const subcaseToDelete = subCases.find((sc) => sc.Id === subCaseId);
    if (!subcaseToDelete) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase/${subCaseId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete subcase");

      // Update subcases list
      setSubCases((prevSubCases) =>
        prevSubCases.filter((sc) => sc.Id !== subCaseId)
      );

      if (selectedSubCase?.Id === subCaseId) {
        setSelectedSubCase(null);
      }

      if (showMessages) {
        showNotification("SubCase deleted successfully");
      }

      // Refresh data
      if (showMessages) {
        await fetchAllSubCases();
      }
    } catch (err) {
      if (showMessages) {
        showNotification(err.message, true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter cases based on search term
  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.CaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseItem.Id.toString().includes(searchTerm)
  );

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchCases();
        await fetchAllSubCases();
        setDataInitialized(true);
      } catch (err) {
        console.error("Error loading initial data:", err);
        showNotification(
          "Failed to load initial data. Please refresh the page.",
          true
        );
        // Still mark as initialized to prevent render errors
        setDataInitialized(true);
      }
    };

    loadInitialData();
  }, []);

  // Toggle case expansion in accordion view
  const toggleCaseExpansion = (caseId) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  // Render cards for each case and its subcases
  const renderCaseCards = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        {filteredCases.map((caseItem) => {
          const caseSubcases = subCases.filter(
            (sc) => sc.CaseId === caseItem.Id
          );
          const isExpanded = expandedCases[caseItem.Id];

          return (
            <div
              key={caseItem.Id}
              className="bg-white rounded-lg overflow-hidden border border-gray-100 transition-all duration-200"
              style={{
                boxShadow: isExpanded
                  ? themeColors.cardShadow
                  : `0 2px 4px ${themeColors.shadowLight}`,
              }}
            >
              {/* Case header */}
              <div
                className={`flex justify-between items-center p-4 cursor-pointer transition-colors duration-200`}
                style={{
                  background: isExpanded
                    ? `linear-gradient(to right, ${themeColors.primaryLight}10, ${themeColors.secondaryDark}40)`
                    : themeColors.background,
                  borderLeft: isExpanded
                    ? `4px solid ${themeColors.primary}`
                    : `4px solid transparent`,
                }}
                onClick={() => toggleCaseExpansion(caseItem.Id)}
              >
                <div className="flex items-center">
                  <div
                    className={`transition-transform duration-200 ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    style={{ color: themeColors.primary }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3
                    className="text-lg font-medium ml-2"
                    style={{ color: themeColors.text }}
                  >
                    {caseItem.CaseName}
                  </h3>
                  <span
                    className="ml-3 text-sm"
                    style={{ color: themeColors.textLight }}
                  >
                    ID: {caseItem.Id}
                  </span>
                  <span
                    className="ml-4 text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${themeColors.primaryLight}20`,
                      color: themeColors.primaryDark,
                    }}
                  >
                    {caseSubcases.length} subcases
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCase(caseItem);
                      setActiveView("editCase");
                    }}
                    className="p-2 rounded-full transition-colors duration-150"
                    style={{
                      color: themeColors.primary,
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColors.primaryLight}10`;
                      e.currentTarget.style.borderColor = `${themeColors.primaryLight}30`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCase(caseItem.Id);
                    }}
                    className="p-2 rounded-full transition-colors duration-150"
                    style={{
                      color: themeColors.error,
                      backgroundColor: "transparent",
                      border: "1px solid transparent",
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColors.error}10`;
                      e.currentTarget.style.borderColor = `${themeColors.error}30`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Case content - subcases */}
              {isExpanded && (
                <div
                  className="p-5"
                  style={{
                    backgroundColor: themeColors.secondary,
                    borderTop: `1px solid ${themeColors.border}`,
                  }}
                >
                  {/* Subcase creation form */}
                  <div
                    className="mb-6 p-4 rounded-md"
                    style={{
                      backgroundColor: themeColors.background,
                      boxShadow: `0 2px 8px ${themeColors.shadowLight}`,
                      border: `1px solid ${themeColors.border}`,
                    }}
                  >
                    <h4
                      className="font-medium text-sm mb-3"
                      style={{ color: themeColors.text }}
                    >
                      Add New SubCase
                    </h4>
                    <div className="flex flex-col space-y-3">
                      <textarea
                        placeholder="Enter subcase description..."
                        value={
                          caseItem.Id === newSubCase.caseId
                            ? newSubCase.description
                            : ""
                        }
                        onChange={(e) =>
                          setNewSubCase({
                            description: e.target.value,
                            caseId: caseItem.Id,
                          })
                        }
                        className="w-full rounded-md px-3 py-2 text-sm focus:outline-none"
                        style={{
                          border: `1px solid ${themeColors.border}`,
                          backgroundColor: themeColors.background,
                          color: themeColors.text,
                        }}
                        onFocus={(e) => {
                          e.target.style.boxShadow = `0 0 0 2px ${themeColors.primaryLight}50`;
                          e.target.style.borderColor = themeColors.primaryLight;
                        }}
                        onBlur={(e) => {
                          e.target.style.boxShadow = "none";
                          e.target.style.borderColor = themeColors.border;
                        }}
                        rows={2}
                      />
                      <div className="flex justify-end">
                        <button
                          onClick={() => createSubCase(caseItem.Id)}
                          disabled={loading || !newSubCase.description}
                          className="px-4 py-2 text-sm rounded-md flex items-center transition-all duration-200"
                          style={{
                            backgroundColor: newSubCase.description
                              ? themeColors.primary
                              : `${themeColors.primary}80`,
                            color: themeColors.background,
                            opacity:
                              loading || !newSubCase.description ? 0.7 : 1,
                          }}
                          onMouseOver={(e) => {
                            if (!loading && newSubCase.description) {
                              e.currentTarget.style.backgroundColor =
                                themeColors.primaryHover;
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!loading && newSubCase.description) {
                              e.currentTarget.style.backgroundColor =
                                themeColors.primary;
                            }
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Add SubCase
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subcases list */}
                  {caseSubcases.length === 0 ? (
                    <div
                      className="text-center py-8 rounded-md"
                      style={{
                        backgroundColor: `${themeColors.background}80`,
                        color: themeColors.textLight,
                        border: `1px dashed ${themeColors.border}`,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        style={{ color: `${themeColors.textLight}60` }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      No subcases found for this case
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {caseSubcases.map((subcase) => (
                        <div
                          key={subcase.Id}
                          className="rounded-md p-4 transition-all duration-200 border"
                          style={{
                            backgroundColor:
                              selectedSubCase?.Id === subcase.Id
                                ? `${themeColors.primaryLight}10`
                                : themeColors.background,
                            borderColor:
                              selectedSubCase?.Id === subcase.Id
                                ? themeColors.primaryLight
                                : themeColors.border,
                            boxShadow:
                              selectedSubCase?.Id === subcase.Id
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
                              {selectedSubCase?.Id === subcase.Id ? (
                                <>
                                  <button
                                    onClick={() =>
                                      updateSubCase(selectedSubCase)
                                    }
                                    className="p-1.5 rounded transition-colors duration-150"
                                    style={{
                                      color: themeColors.success,
                                      backgroundColor: `${themeColors.success}10`,
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = `${themeColors.success}20`;
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor = `${themeColors.success}10`;
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => setSelectedSubCase(null)}
                                    className="p-1.5 rounded transition-colors duration-150"
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
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setSelectedSubCase(subcase)}
                                    className="p-1.5 rounded transition-colors duration-150"
                                    style={{
                                      color: themeColors.primary,
                                      backgroundColor: "transparent",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = `${themeColors.primary}10`;
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => deleteSubCase(subcase.Id)}
                                    className="p-1.5 rounded transition-colors duration-150"
                                    style={{
                                      color: themeColors.error,
                                      backgroundColor: "transparent",
                                    }}
                                    onMouseOver={(e) => {
                                      e.currentTarget.style.backgroundColor = `${themeColors.error}10`;
                                    }}
                                    onMouseOut={(e) => {
                                      e.currentTarget.style.backgroundColor =
                                        "transparent";
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mt-3">
                            {selectedSubCase?.Id === subcase.Id ? (
                              <textarea
                                value={selectedSubCase.Description}
                                onChange={(e) =>
                                  setSelectedSubCase({
                                    ...selectedSubCase,
                                    Description: e.target.value,
                                  })
                                }
                                className="w-full rounded-md px-3 py-2 focus:outline-none"
                                style={{
                                  border: `1px solid ${themeColors.primaryLight}`,
                                  boxShadow: `0 0 0 2px ${themeColors.primaryLight}30`,
                                  backgroundColor: themeColors.background,
                                  color: themeColors.text,
                                }}
                                rows={2}
                              />
                            ) : (
                              <p style={{ color: themeColors.text }}>
                                {subcase.Description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Create Case form
  const renderCreateCaseForm = () => {
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
            onClick={() => setActiveView("dashboard")}
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
            <h2
              className="text-xl font-bold"
              style={{ color: themeColors.text }}
            >
              Create New Case
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              Add a new case to the system
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="caseName"
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Case Name
            </label>
            <input
              id="caseName"
              type="text"
              placeholder="Enter case name"
              value={newCase.caseName}
              onChange={(e) => setNewCase({ caseName: e.target.value })}
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
            />
          </div>

          <div className="pt-4">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveView("dashboard")}
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
                onClick={createCase}
                disabled={loading || !newCase.caseName}
                className="px-5 py-2 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: newCase.caseName
                    ? themeColors.primary
                    : `${themeColors.primary}80`,
                  color: themeColors.background,
                  opacity: loading || !newCase.caseName ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading && newCase.caseName) {
                    e.currentTarget.style.backgroundColor =
                      themeColors.primaryHover;
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading && newCase.caseName) {
                    e.currentTarget.style.backgroundColor = themeColors.primary;
                  }
                }}
              >
                Create Case
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Edit Case form
  const renderEditCaseForm = () => {
    if (!selectedCase) return null;

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
            onClick={() => setActiveView("dashboard")}
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
            <h2
              className="text-xl font-bold"
              style={{ color: themeColors.text }}
            >
              Edit Case
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              ID: {selectedCase.Id}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="editCaseName"
              className="block text-sm font-medium mb-2"
              style={{ color: themeColors.text }}
            >
              Case Name
            </label>
            <input
              id="editCaseName"
              type="text"
              value={selectedCase.CaseName}
              onChange={(e) =>
                setSelectedCase({
                  ...selectedCase,
                  CaseName: e.target.value,
                })
              }
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
            />
          </div>

          <div className="pt-4">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setActiveView("dashboard")}
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
                onClick={() => updateCase(selectedCase)}
                disabled={loading}
                className="px-5 py-2 rounded-md transition-all duration-200"
                style={{
                  backgroundColor: themeColors.primary,
                  color: themeColors.background,
                  opacity: loading ? 0.7 : 1,
                }}
                onMouseOver={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor =
                      themeColors.primaryHover;
                  }
                }}
                onMouseOut={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = themeColors.primary;
                  }
                }}
              >
                Update Case
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main dashboard view
  const renderDashboard = () => {
    return (
      <div className="max-w-5xl mx-auto">
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
            Create New Case
          </button>
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
          </div>
        </div>

        {/* Cards view for cases and subcases */}
        {loading && cases.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-lg"
            style={{
              backgroundColor: themeColors.background,
              boxShadow: themeColors.cardShadow,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            <div className="relative w-16 h-16 mb-4">
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: `${themeColors.primary}20`,
                  animationDuration: "1.5s",
                }}
              ></div>
              <svg
                className="relative animate-spin h-16 w-16"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: themeColors.primary }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p
              className="text-lg font-medium"
              style={{ color: themeColors.textLight }}
            >
              Loading cases...
            </p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 rounded-lg"
            style={{
              backgroundColor: themeColors.background,
              boxShadow: themeColors.cardShadow,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            {searchTerm ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: `${themeColors.textLight}60` }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 16l2.879-2.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: themeColors.text }}
                >
                  No matching cases found
                </h3>
                <p
                  className="text-center mb-4"
                  style={{ color: themeColors.textLight }}
                >
                  No cases match your search for "{searchTerm}"
                </p>
                <button
                  onClick={() => setSearchTerm("")}
                  className="px-4 py-2 rounded-md transition-colors duration-150"
                  style={{
                    backgroundColor: `${themeColors.primary}10`,
                    color: themeColors.primary,
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColors.primary}20`;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = `${themeColors.primary}10`;
                  }}
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  style={{ color: `${themeColors.textLight}60` }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                  />
                </svg>
                <h3
                  className="text-lg font-medium mb-2"
                  style={{ color: themeColors.text }}
                >
                  No cases found
                </h3>
                <p
                  className="text-center mb-4"
                  style={{ color: themeColors.textLight }}
                >
                  Get started by creating your first case
                </p>
                <button
                  onClick={() => {
                    setNewCase({ caseName: "" });
                    setActiveView("createCase");
                  }}
                  className="px-5 py-2 rounded-md transition-all duration-200"
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
                  Create Case
                </button>
              </>
            )}
          </div>
        ) : (
          renderCaseCards()
        )}
      </div>
    );
  };

  // Render appropriate view
  const renderView = () => {
    switch (activeView) {
      case "createCase":
        return renderCreateCaseForm();
      case "editCase":
        return renderEditCaseForm();
      default:
        return renderDashboard();
    }
  };

  // If data isn't initialized yet, show a loading screen
  if (!dataInitialized) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6"
        style={{ backgroundColor: themeColors.secondary }}
      >
        <div
          className="p-8 rounded-lg max-w-md w-full text-center"
          style={{
            backgroundColor: themeColors.background,
            boxShadow: themeColors.cardShadow,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                backgroundColor: `${themeColors.primary}20`,
                animationDuration: "1.5s",
              }}
            ></div>
            <svg
              className="relative animate-spin h-20 w-20"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              style={{ color: themeColors.primary }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: themeColors.text }}
          >
            Loading Case Management System
          </h2>
          <p style={{ color: themeColors.textLight }}>
            Please wait while we load your data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: themeColors.secondary }}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <div
            className="flex items-center p-4 rounded-lg mb-4"
            style={{
              background: `linear-gradient(135deg, ${themeColors.headerBg}, ${themeColors.background})`,
              boxShadow: themeColors.navShadow,
              borderBottom: `1px solid ${themeColors.border}`,
            }}
          >
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: themeColors.text }}
              >
                Case Management System
              </h1>
              <p className="mt-1" style={{ color: themeColors.textLight }}>
                Effortlessly manage your cases and subcases
              </p>
            </div>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div
            className="mb-6 p-4 rounded shadow-md border-l-4"
            style={{
              backgroundColor: `${themeColors.error}10`,
              borderLeftColor: themeColors.error,
            }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ color: themeColors.error }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p
                  className="text-sm font-medium"
                  style={{ color: themeColors.text }}
                >
                  {error}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex rounded-md p-1.5 focus:outline-none"
                    style={{
                      color: themeColors.error,
                      backgroundColor: `${themeColors.error}20`,
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColors.error}30`;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = `${themeColors.error}20`;
                    }}
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div
            className="mb-6 p-4 rounded shadow-md border-l-4"
            style={{
              backgroundColor: `${themeColors.success}10`,
              borderLeftColor: themeColors.success,
            }}
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  style={{ color: themeColors.success }}
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p
                  className="text-sm font-medium"
                  style={{ color: themeColors.text }}
                >
                  {success}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && !success && !error && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: `${themeColors.text}10` }}
          >
            <div
              className="p-5 rounded-lg flex items-center"
              style={{
                backgroundColor: themeColors.background,
                boxShadow: themeColors.cardShadow,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              <svg
                className="animate-spin h-6 w-6 mr-3"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                style={{ color: themeColors.primary }}
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="text-gray-700 font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Main content */}
        {renderView()}
      </div>
    </div>
  );
};

export default CaseManagementSystem;
