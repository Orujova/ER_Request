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
  const { jwtToken } = getStoredTokens();

  const [activeTab, setActiveTab] = useState("cases");
  const [cases, setCases] = useState([]);
  const [subCases, setSubCases] = useState([]);
  const [dataInitialized, setDataInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataVersion, setDataVersion] = useState(0); // Reinstated for refresh
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedSubCase, setSelectedSubCase] = useState(null);
  const [expandedCases, setExpandedCases] = useState({});

  const getRequestHeaders = useCallback(() => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    };
  }, [jwtToken]);

  // Function to trigger data refresh
  const refreshData = useCallback(() => {
    setDataVersion((prev) => prev + 1);
  }, []);

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

  const fetchAllSubCases = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/SubCase`, {
        headers: getRequestHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch subcases");
      const data = await response.json();
      setSubCases(data[0].SubCases);
      return data[0].SubCases;
    } catch (err) {
      showToast(err.message, "error");
      return [];
    } finally {
      setLoading(false);
    }
  }, [getRequestHeaders]);

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

      setExpandedCases((prev) => ({
        ...prev,
        [createdCase.Id]: true,
      }));

      showToast(`Case created successfully`, "success");
      refreshData(); // Trigger refetch after creation
      return createdCase;
    } catch (err) {
      showToast(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

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

      setExpandedCases((prev) => ({
        ...prev,
        [newSubCase.caseId]: true,
      }));

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
      refreshData(); // Trigger refetch after creation
      return createdSubCase;
    } catch (err) {
      showToast(err.message, "error");
      return null;
    } finally {
      setLoading(false);
    }
  };

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

      setCases((prev) =>
        prev.map((c) =>
          c.Id === caseData.Id ? { ...c, CaseName: caseData.CaseName } : c
        )
      );

      if (selectedCase?.Id === caseData.Id) {
        setSelectedCase({ ...selectedCase, CaseName: caseData.CaseName });
      }

      showToast(`Case updated successfully`, "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

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

      setSubCases((prev) =>
        prev.map((sc) =>
          sc.Id === subcaseData.Id ? { ...sc, ...subcaseData } : sc
        )
      );

      setSelectedSubCase(null);
      showToast("SubCase updated successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const deleteCase = async (caseId) => {
    const relatedSubcases = subCases.filter((sc) => sc.CaseId === caseId);

    if (relatedSubcases.length > 0) {
      for (const subCase of relatedSubcases) {
        await deleteSubCase(subCase.Id, false);
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

      setCases((prev) => prev.filter((c) => c.Id !== caseId));

      if (selectedCase?.Id === caseId) {
        setSelectedCase(null);
      }

      setExpandedCases((prev) => {
        const newState = { ...prev };
        delete newState[caseId];
        return newState;
      });

      showToast("Case deleted successfully", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

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

      setSubCases((prev) => prev.filter((sc) => sc.Id !== subCaseId));

      if (selectedSubCase?.Id === subCaseId) {
        setSelectedSubCase(null);
      }

      if (showMessages) {
        showToast("SubCase deleted successfully", "success");
      }
    } catch (err) {
      if (showMessages) {
        showToast(err.message, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleCaseExpansion = (caseId) => {
    setExpandedCases((prev) => ({
      ...prev,
      [caseId]: !prev[caseId],
    }));
  };

  const filteredCases = cases.filter(
    (caseItem) =>
      caseItem.CaseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(caseItem.Id).includes(searchTerm)
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const fetchedCases = await fetchCases();
        await fetchAllSubCases();

        const initialExpandedState = {};
        fetchedCases.forEach((caseItem) => {
          initialExpandedState[caseItem.Id] =
            expandedCases[caseItem.Id] || false;
        });
        setExpandedCases((prev) => ({ ...prev, ...initialExpandedState }));

        setDataInitialized(true);
      } catch (err) {
        console.error("Error loading data:", err);
        showToast("Failed to load data. Please try again.", "error");
        setDataInitialized(true);
      }
    };

    loadData();
  }, [dataVersion, fetchCases, fetchAllSubCases]);

  if (!dataInitialized) {
    return <Loading />;
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: themeColors.secondary }}
    >
      <div className="max-w-7xl mx-auto">
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

        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

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
