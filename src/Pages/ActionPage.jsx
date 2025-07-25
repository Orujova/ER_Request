import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Loader } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";
import { themeColors } from "../styles/theme";
import Header from "../components/layout/PageHeader";
import ErMemberAssignment from "../components/requestAction/ErMemberAssignment";
import UpdateRequestForm from "../components/requestAction/UpdateRequestForm";
import CopyEmployees from "../components/requestAction/CopyEmployees";
import CaseSummary from "../components/requestAction/CaseSummary";
import StatusUpdater from "../components/requestAction/StatusUpdater";
import Alert from "../components/common/Alert";
import { showToast } from "../toast/toast";

function RequestAction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const request = useSelector((state) => state.request.currentRequest);

  const [erMembers, setErMembers] = useState([]);
  const [selectedErMember, setSelectedErMember] = useState("");
  const [disciplinaryViolations, setDisciplinaryViolations] = useState([]);
  const [disciplinaryActionResults, setDisciplinaryActionResults] = useState(
    []
  );
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);
  const [cases, setCases] = useState([]);
  const [allSubCases, setAllSubCases] = useState([]);
  const [existingChildRequests, setExistingChildRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState("updateRequest");
  const [localRequest, setLocalRequest] = useState(null);

  const fetchCurrentRequest = useCallback(async () => {
    try {
      const { jwtToken } = getStoredTokens();
      const requestResponse = await fetch(
        `${API_BASE_URL}/api/ERRequest/${id}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!requestResponse.ok) {
        throw new Error(`Error fetching request: ${requestResponse.status}`);
      }

      const requestData = await requestResponse.json();
      const requestItem = requestData;

      if (requestItem) {
        const transformedRequest = {
          id: requestItem.Id,
          caseId: requestItem.CaseId,
          caseName: requestItem.CaseName,
          subCaseId: requestItem.SubCaseId,
          subCaseDescription: requestItem.SubCaseDescription,
          status: requestItem.ERRequestStatus,
          employeeId: requestItem.EmployeeId,
          employeeName: requestItem.EmployeeName,
          employeeBadge: requestItem.EmployeeBadge || "",
          projectName: requestItem.ProjectName,
          projectId: requestItem.ProjectId,
          projectCode: requestItem.ProjectCode,
          positionName: requestItem.PositionName || "",
          positionId: requestItem.PositionId || null,
          sectionName: requestItem.SectionName || "",
          sectionId: requestItem.SectionId || null,
          subSectionName: requestItem.SubSectionName || "",
          subSectionId: requestItem.SubSectionId || null,
          erMember: requestItem.ERMember,
          erMemberId: requestItem.ERMemberUserId || requestItem.AppuserId,
          createdDate: requestItem.CreatedDate,
          parentId: requestItem.ParentId,
          requestType: requestItem.RequestType,
          orderNumber: requestItem.OrderNumber,
          note: requestItem.Note,
          reason: requestItem.Reason,
          disciplinaryActionId: requestItem.DisciplinaryActionId,
          disciplinaryActionName: requestItem.DisciplinaryActionName,
          disciplinaryActionResultId: requestItem.DisciplinaryActionResultId,
          disciplinaryActionResultName:
            requestItem.DisciplinaryActionResultName,
          disciplinaryViolationId: requestItem.DisciplinaryViolationId,
          disciplinaryViolationName: requestItem.DisciplinaryViolationName,
          isEligible: requestItem.IsEligible,
          contractEndDate: requestItem.ContractEndDate,
          employeeInfo: {
            id: requestItem.EmployeeId,
            name: requestItem.EmployeeName,
            badge: requestItem.EmployeeBadge || "",
            project: requestItem.ProjectName,
            projectId: requestItem.ProjectId,
            projectCode: requestItem.ProjectCode,
            position: requestItem.PositionName || "",
            positionId: requestItem.PositionId,
          },
          disciplinaryAction: {
            id: requestItem.DisciplinaryActionId,
            name: requestItem.DisciplinaryActionName,
            resultId: requestItem.DisciplinaryActionResultId,
            resultName: requestItem.DisciplinaryActionResultName,
            violationId: requestItem.DisciplinaryViolationId,
            violationName: requestItem.DisciplinaryViolationName,
          },
        };

        dispatch({
          type: "SET_CURRENT_REQUEST",
          payload: transformedRequest,
        });
        setLocalRequest(transformedRequest);

        if (requestItem.ERMemberUserId) {
          setSelectedErMember(requestItem.ERMemberUserId.toString());
        }

        return transformedRequest;
      }

      return null;
    } catch (err) {
      console.error("Error fetching current request:", err);
      return null;
    }
  }, [id, dispatch]);

  const fetchAllDisciplinaryActions = useCallback(async () => {
    try {
      const { jwtToken } = getStoredTokens();
      const actionsResponse = await fetch(
        `${API_BASE_URL}/GetAllDisciplinaryAction`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!actionsResponse.ok) {
        throw new Error(
          `Error fetching disciplinary actions: ${actionsResponse.status}`
        );
      }

      const actionsData = await actionsResponse.json();
      const actions = actionsData[0]?.DisciplinaryActions || [];
      setDisciplinaryActions(actions);
      return actions;
    } catch (err) {
      console.error("Error fetching disciplinary actions:", err);
      setError("Disciplinary actions yüklenirken hata oluştu.");
      return [];
    }
  }, [API_BASE_URL]);

  const fetchDisciplinaryActionResults = useCallback(async () => {
    try {
      const { jwtToken } = getStoredTokens();
      const resultsResponse = await fetch(
        `${API_BASE_URL}/GetAllDisciplinaryActionResult`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!resultsResponse.ok) {
        throw new Error(
          `Error fetching action results: ${resultsResponse.status}`
        );
      }

      const resultsData = await resultsResponse.json();
      const results = resultsData[0]?.DisciplinaryActionResults || [];
      setDisciplinaryActionResults(results);
      return results;
    } catch (err) {
      console.error("Error fetching disciplinary action results:", err);
      setError("Action results yüklenirken hata oluştu.");
      return [];
    }
  }, [API_BASE_URL]);

  const fetchDisciplinaryViolations = useCallback(async () => {
    try {
      const { jwtToken } = getStoredTokens();
      const violationsResponse = await fetch(
        `${API_BASE_URL}/GetAllDisciplinaryViolation`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!violationsResponse.ok) {
        throw new Error(
          `Error fetching violations: ${violationsResponse.status}`
        );
      }

      const violationsData = await violationsResponse.json();
      const violations = violationsData[0]?.DisciplinaryViolations || [];
      setDisciplinaryViolations(violations);
      return violations;
    } catch (err) {
      console.error("Error fetching disciplinary violations:", err);
      setError("Violations yüklenirken hata oluştu.");
      return [];
    }
  }, [API_BASE_URL]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      await fetchCurrentRequest();

      const { jwtToken } = getStoredTokens();
      const erMembersResponse = await fetch(
        `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!erMembersResponse.ok) {
        throw new Error(
          `Error fetching ER members: ${erMembersResponse.status}`
        );
      }

      const erMembersData = await erMembersResponse.json();
      setErMembers(erMembersData[0]?.AppUsers || []);

      await Promise.all([
        fetchDisciplinaryViolations(),
        fetchAllDisciplinaryActions(),
        fetchDisciplinaryActionResults(),
      ]);

      const casesResponse = await fetch(`${API_BASE_URL}/api/Case`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,

          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!casesResponse.ok) {
        throw new Error(`Error fetching cases: ${casesResponse.status}`);
      }

      const casesData = await casesResponse.json();
      setCases(casesData[0]?.Cases || []);

      const subCasesResponse = await fetch(`${API_BASE_URL}/api/SubCase`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,

          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!subCasesResponse.ok) {
        throw new Error(`Error fetching subcases: ${subCasesResponse.status}`);
      }

      const subCasesData = await subCasesResponse.json();
      setAllSubCases(subCasesData[0]?.SubCases || []);

      const childRequestsResponse = await fetch(
        `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${id}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (childRequestsResponse.ok) {
        const childRequestsData = await childRequestsResponse.json();
        setExistingChildRequests(childRequestsData[0]?.ERRequests || []);
      }

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [
    id,
    API_BASE_URL,
    fetchCurrentRequest,
    fetchDisciplinaryViolations,
    fetchAllDisciplinaryActions,
    fetchDisciplinaryActionResults,
  ]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (shouldRefresh) {
      fetchAllData();
      setShouldRefresh(false);
    }
  }, [shouldRefresh, fetchAllData]);

  const handleErMemberChange = async (newErMemberId) => {
    try {
      setLoading(true);
      setSelectedErMember(newErMemberId);

      const { jwtToken } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequestERMember`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            ERRequestId: parseInt(id),
            NewERMemberUserId: parseInt(newErMemberId),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating ER member: ${response.status}`);
      }

      await fetchCurrentRequest();

      setSuccess("ER member başarıyla güncellendi.");
      showToast("ER member başarıyla güncellendi.", "success");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusLoading(true);
      const { jwtToken } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequestStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",

            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify({
            ERRequestId: parseInt(id),
            NewStatus: newStatus,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating status: ${response.status}`);
      }

      window.location.reload();
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
      setStatusLoading(false);
    }
  };

  const navigateToDetail = () => {
    navigate(`/request/${id}`);
  };

  const refreshChildRequests = async () => {
    try {
      const { jwtToken } = getStoredTokens();
      const childRequestsResponse = await fetch(
        `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${id}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (childRequestsResponse.ok) {
        const childRequestsData = await childRequestsResponse.json();
        setExistingChildRequests(childRequestsData[0]?.ERRequests || []);
      }

      setShouldRefresh(true);
    } catch (err) {
      setError(err.message);
    }
  };

  const currentRequest = request || localRequest || {};

  if (loading && !error && !success) {
    return (
      <div className="flex justify-center items-center h-screen bg-secondary">
        <div className="text-center">
          <Loader
            size={40}
            className="animate-spin text-primary mx-auto mb-4"
          />
          <p className="text-lg text-text">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pt-6 pb-12">
      <div className="">
        <Header
          id={id}
          request={currentRequest}
          navigateToDetail={navigateToDetail}
        />

        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
        <Alert
          variant="success"
          message={success}
          onDismiss={() => setSuccess(null)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-6">
            <ErMemberAssignment
              erMembers={erMembers}
              selectedErMember={selectedErMember}
              onChange={handleErMemberChange}
              loading={loading}
              request={currentRequest}
            />

            <div
              className="bg-background rounded-xl shadow-sm overflow-hidden"
              style={{ boxShadow: themeColors.cardShadow }}
            >
              <div className="border-b border-border">
                <div className="flex">
                  <button
                    className={`px-6 py-4 text-sm font-medium relative ${
                      activeTab === "updateRequest"
                        ? "text-primary"
                        : "text-textLight hover:text-text"
                    }`}
                    onClick={() => setActiveTab("updateRequest")}
                  >
                    Update Request
                    {activeTab === "updateRequest" && (
                      <div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                        style={{
                          background: `linear-gradient(to right, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
                        }}
                      ></div>
                    )}
                  </button>
                  <button
                    className={`px-6 py-4 text-sm font-medium relative ${
                      activeTab === "copyEmployees"
                        ? "text-primary"
                        : "text-textLight hover:text-text"
                    }`}
                    onClick={() => setActiveTab("copyEmployees")}
                  >
                    Copy For Other Employees
                    {activeTab === "copyEmployees" && (
                      <div
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"
                        style={{
                          background: `linear-gradient(to right, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
                        }}
                      ></div>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-6">
                {activeTab === "updateRequest" && (
                  <UpdateRequestForm
                    id={id}
                    request={currentRequest}
                    disciplinaryViolations={disciplinaryViolations}
                    disciplinaryActionResults={disciplinaryActionResults}
                    disciplinaryActions={disciplinaryActions}
                    API_BASE_URL={API_BASE_URL}
                    setSuccess={setSuccess}
                    setError={setError}
                    showToast={showToast}
                    fetchAllDisciplinaryActions={fetchAllDisciplinaryActions}
                    fetchDisciplinaryActionResults={
                      fetchDisciplinaryActionResults
                    }
                    fetchDisciplinaryViolations={fetchDisciplinaryViolations}
                    fetchRequestDetails={fetchCurrentRequest}
                  />
                )}
                {activeTab === "copyEmployees" && (
                  <CopyEmployees
                    id={id}
                    cases={cases}
                    allSubCases={allSubCases}
                    existingChildRequests={existingChildRequests}
                    API_BASE_URL={API_BASE_URL}
                    setSuccess={setSuccess}
                    showToast={showToast}
                    setError={setError}
                    refreshChildRequests={refreshChildRequests}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <CaseSummary request={currentRequest} />

            <StatusUpdater
              key={`status-updater-${
                currentRequest?.status || "loading"
              }-${Date.now()}`}
              request={currentRequest}
              handleStatusUpdate={handleStatusUpdate}
              statusLoading={statusLoading}
              API_BASE_URL={API_BASE_URL}
              id={id}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestAction;
