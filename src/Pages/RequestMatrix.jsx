import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../apiConfig";
import { themeColors } from "../styles/theme";
import { getStoredTokens } from "../utils/authHandler";
import CaseTab from "../components/requestMatrix/CaseTab";
import DisciplinaryTab from "../components/requestMatrix/DisciplinaryTab";
import TabNavigation from "../components/requestMatrix/TabNavigation";
import Loading from "../components/common/LoadingScreen";
import { showToast } from "../toast/toast";

const RequestMatrix = () => {
  // Authentication
  const { jwtToken } = getStoredTokens();

  // Main state
  const [activeTab, setActiveTab] = useState("cases");
  const [cases, setCases] = useState([]);
  const [subCases, setSubCases] = useState([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataVersion, setDataVersion] = useState(0); // Used to trigger refetches

  // Selected items state
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedSubCase, setSelectedSubCase] = useState(null);
  const [expandedCases, setExpandedCases] = useState({});

  // API request headers with authentication
  const getRequestHeaders = useCallback(() => {
    const currentToken = getStoredTokens().jwtToken; // Get fresh token on each request
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${currentToken}`,
    };
  }, []);

  // Function to trigger data refresh
  const refreshData = useCallback(() => {
    setDataVersion((prev) => prev + 1);
  }, []);

  // API: Fetch all cases
  const fetchCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case`, {
        headers: getRequestHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch cases");
      const data = await response.json();
      setCases(data[0].Cases);
      return data[0].Cases;
    } catch (err) {
      showToast(err.message, "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getRequestHeaders]);

  // API: Fetch all subcases
  const fetchAllSubCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        headers: getRequestHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch subcases");
      const data = await response.json();
      setSubCases(data[0].SubCases);

      // Create initial expanded state for all cases
      const initialExpandedState = {};
      cases.forEach((caseItem) => {
        initialExpandedState[caseItem.Id] = expandedCases[caseItem.Id] || false;
      });
      setExpandedCases((prev) => ({ ...prev, ...initialExpandedState }));

      return data[0].SubCases;
    } catch (err) {
      showToast(err.message, "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getRequestHeaders, cases, expandedCases]);

  // API: Create new case
  const createCase = async (newCase) => {
    if (!newCase.caseName.trim()) {
      showToast("Case name cannot be empty", "error");
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case`, {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          CaseName: newCase.caseName,
        }),
      });

      if (!response.ok) throw new Error("Failed to create case");
      const createdCase = await response.json();

      // Auto-expand the new case
      setExpandedCases((prev) => ({
        ...prev,
        [createdCase.Id]: true,
      }));

      showToast(`Case  created successfully`, "success");

      // Refresh data after successful creation
      refreshData();
      return createdCase;
    } catch (err) {
      showToast(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Create new subcase
  const createSubCase = async (newSubCase) => {
    if (!newSubCase.description.trim()) {
      showToast(
        newSubCase.caseId
          ? "Description cannot be empty"
          : "Please select a case first",
        "error"
      );
      return null;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Description: newSubCase.description,
          CaseId: newSubCase.caseId,
          IsPresentationRequired: newSubCase.IsPresentationRequired || false,
          IsActRequired: newSubCase.IsActRequired || false,
          IsExplanationRequired: newSubCase.IsExplanationRequired || false,
        }),
      });

      if (!response.ok) throw new Error("Failed to create subcase");
      const createdSubCase = await response.json();

      // Auto-expand the parent case
      setExpandedCases((prev) => ({
        ...prev,
        [newSubCase.caseId]: true,
      }));

      // Show success message with info about required documents
      const requiredDocs = [];
      if (createdSubCase.IsPresentationRequired)
        requiredDocs.push("Presentation");
      if (createdSubCase.IsActRequired) requiredDocs.push("Act");
      if (createdSubCase.IsExplanationRequired)
        requiredDocs.push("Explanation");

      const message =
        requiredDocs.length > 0
          ? `SubCase created successfully. Required: ${requiredDocs.join(", ")}`
          : "SubCase created successfully";

      showToast(message, "success");

      // Refresh data after successful creation
      refreshData();
      return createdSubCase;
    } catch (err) {
      showToast(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

  // API: Update case
  const updateCase = async (caseData) => {
    if (!caseData || !caseData.Id) {
      showToast("Invalid case data", "error");
      return;
    }

    if (!caseData.CaseName.trim()) {
      showToast("Case name cannot be empty", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/Case`, {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: caseData.Id,
          CaseName: caseData.CaseName,
        }),
      });

      if (!response.ok) throw new Error("Failed to update case");

      // Update the selected case if it was the one being edited
      if (selectedCase?.Id === caseData.Id) {
        setSelectedCase({ ...selectedCase, CaseName: caseData.CaseName });
      }

      showToast(`Case  updated successfully`, "success");

      // Refresh data after successful update
      refreshData();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // API: Update subcase
  const updateSubCase = async (subcaseData) => {
    if (!subcaseData || !subcaseData.Id) {
      showToast("Invalid subcase data", "error");
      return;
    }

    if (!subcaseData.Description.trim()) {
      showToast("Description cannot be empty", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        method: "PUT",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: subcaseData.Id,
          Description: subcaseData.Description,
          CaseId: subcaseData.CaseId,
          IsPresentationRequired: subcaseData.IsPresentationRequired || false,
          IsActRequired: subcaseData.IsActRequired || false,
          IsExplanationRequired: subcaseData.IsExplanationRequired || false,
        }),
      });

      if (!response.ok) throw new Error("Failed to update subcase");

      // Clear selected subcase after update
      setSelectedSubCase(null);
      showToast("SubCase updated successfully", "success");

      // Refresh data after successful update
      refreshData();
    } catch (err) {
      showToast(err.message, "error");
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
      const response = await fetch(`${API_BASE_URL}/api/Case`, {
        method: "DELETE",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: caseId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete case");

      // Clear selection if it was the deleted case
      if (selectedCase?.Id === caseId) {
        setSelectedCase(null);
      }

      // Remove from expanded cases state
      setExpandedCases((prev) => {
        const newState = { ...prev };
        delete newState[caseId];
        return newState;
      });

      showToast("Case deleted successfully", "success");

      // Refresh data after successful deletion
      refreshData();
    } catch (err) {
      showToast(err.message, "error");
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
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        method: "DELETE",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          Id: subCaseId,
        }),
      });

      if (!response.ok) throw new Error("Failed to delete subcase");

      // Clear selection if it was the deleted subcase
      if (selectedSubCase?.Id === subCaseId) {
        setSelectedSubCase(null);
      }

      if (showMessages) {
        showToast("SubCase deleted successfully", "success");
      }

      // Refresh data after successful deletion
      if (showMessages) {
        // Only trigger refresh for non-silent deletes
        refreshData();
      }
    } catch (err) {
      if (showMessages) {
        showToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Toggle case expansion in accordion view
  const toggleCaseExpansion = (caseId) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  // Filter cases based on search term
  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.CaseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(caseItem.Id).includes(searchTerm)
  );

  // Load data when dataVersion changes (our refresh trigger)
  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedCases = await fetchCases();
        await fetchAllSubCases();
        setDataInitialized(true);
      } catch (err) {
        console.error("Error loading data:", err);
        showToast("Failed to load data. Please try again.", "error");
        setDataInitialized(true);
      }
    };

    loadData();
  }, [dataVersion, fetchCases, fetchAllSubCases]);

  // If data isn't initialized yet, show a loading screen
  if (!dataInitialized) {
    return <Loading />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: themeColors.secondary }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center p-4 rounded-lg">
            <div>
              <h1
                className="text-2xl font-bold"
                style={{ color: themeColors.text }}
              >
                Case Management System
              </h1>
              <p className="mt-1" style={{ color: themeColors.textLight }}>
                Effortlessly manage your cases and disciplinary areas
              </p>
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main content */}
        <div className="mt-6">
          {activeTab === "cases" && (
            <CaseTab
              cases={filteredCases}
              subCases={subCases}
              expandedCases={expandedCases}
              selectedCase={selectedCase}
              selectedSubCase={selectedSubCase}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              setSelectedCase={setSelectedCase}
              setSelectedSubCase={setSelectedSubCase}
              toggleCaseExpansion={toggleCaseExpansion}
              createCase={createCase}
              updateCase={updateCase}
              deleteCase={deleteCase}
              createSubCase={createSubCase}
              updateSubCase={updateSubCase}
              deleteSubCase={deleteSubCase}
              loading={loading}
            />
          )}

          {activeTab === "disciplinary" && <DisciplinaryTab />}
        </div>
      </div>
    </div>
  );
};

export default RequestMatrix;
