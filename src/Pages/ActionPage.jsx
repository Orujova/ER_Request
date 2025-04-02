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

  // State
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

  // Create a function to fetch the current request data
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

      // Extract the request data
      const requestItem = requestData;

      if (requestItem) {
        // Transform API data to match our component structure
        const transformedRequest = {
          id: requestItem.Id,
          caseId: requestItem.CaseId,
          case: requestItem.CaseName,
          caseName: requestItem.CaseName,
          subCaseId: requestItem.SubCaseId,
          subCase: requestItem.SubCaseDescription,
          subCaseDescription: requestItem.SubCaseDescription,
          status: requestItem.ERRequestStatus,
          employeeId: requestItem.EmployeeId,
          employeeName: requestItem.EmployeeName,
          employeeFullName: requestItem.EmployeeName,
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
          // Structure the data to be compatible with both formats
          employeeInfo: {
            id: requestItem.EmployeeId,
            name: requestItem.EmployeeName,
            badge: requestItem.EmployeeBadge || "",
            project: requestItem.ProjectName,
            projectId: requestItem.ProjectId,
            projectCode: requestItem.ProjectCode,
            position: requestItem.PositionName || "",
            positionId: requestItem.PositionId,
            section: requestItem.SectionName || "",
            sectionId: requestItem.SectionId,
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

        // Update the Redux store with the latest request data
        dispatch({
          type: "SET_CURRENT_REQUEST",
          payload: transformedRequest,
        });

        // Also set in local state for fallback
        setLocalRequest(transformedRequest);

        // Set selected ER member based on request data
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
  }, [id, dispatch, API_BASE_URL]);

  // Fetch necessary data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const { jwtToken } = getStoredokens();

      // First, fetch the current request to ensure we have the latest data
      await fetchCurrentRequest();

      // Fetch ER Members
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

      // Fetch Disciplinary Violations
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
      setDisciplinaryViolations(
        violationsData[0]?.DisciplinaryViolations || []
      );

      // Fetch Disciplinary Action Results
      const actionResultsResponse = await fetch(
        `${API_BASE_URL}/GetAllDisciplinaryActionResult`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!actionResultsResponse.ok) {
        throw new Error(
          `Error fetching action results: ${actionResultsResponse.status}`
        );
      }

      const actionResultsData = await actionResultsResponse.json();
      setDisciplinaryActionResults(
        actionResultsData[0]?.DisciplinaryActionResults || []
      );

      // Fetch Cases
      const casesResponse = await fetch(`${API_BASE_URL}/api/Case`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!casesResponse.ok) {
        throw new Error(`Error fetching cases: ${casesResponse.status}`);
      }

      const casesData = await casesResponse.json();
      setCases(casesData[0]?.Cases || []);

      // Fetch SubCases
      const subCasesResponse = await fetch(`${API_BASE_URL}/api/SubCase`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!subCasesResponse.ok) {
        throw new Error(`Error fetching subcases: ${subCasesResponse.status}`);
      }

      const subCasesData = await subCasesResponse.json();
      setAllSubCases(subCasesData[0]?.SubCases || []);

      // Fetch existing child requests
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
  }, [id, API_BASE_URL, fetchCurrentRequest]);

  // Fetch data on component mount and when shouldRefresh changes
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Refresh data when shouldRefresh changes
  useEffect(() => {
    if (shouldRefresh) {
      fetchAllData();
      setShouldRefresh(false);
    }
  }, [shouldRefresh, fetchAllData]);

  // Handle ER member change
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

      // Fetch updated request data
      await fetchCurrentRequest();

      setSuccess("ER member updated successfully.");
      showToast("ER member updated successfully.", "success");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusLoading(true);
      const { jwtToken } = getStoredTokens();

      console.log(`Updating status to: ${newStatus}`);

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

      console.log("Status update successful, fetching updated data...");

      // Refresh the page to show updated status
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

  // Use either Redux state or local state for request, with a fallback to an empty object
  const currentRequest = request || localRequest || {};

  if (loading && !error && !success) {
    return (
      <div className="flex justify-center items-center h-screen bg-secondary">
        <div className="text-center">
          <Loader
            size={40}
            className="animate-spin text-primary mx-auto mb-4"
          />
          <p className="text-lg text-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary pt-6 pb-12">
      <div className="">
        {/* Header */}
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
          onDismiss={() => setSuccess("")}
        />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Takes 8/12 of the space */}
          <div className="lg:col-span-8 space-y-6">
            <ErMemberAssignment
              erMembers={erMembers}
              selectedErMember={selectedErMember}
              onChange={handleErMemberChange}
              loading={loading}
              request={currentRequest}
            />

            {/* Tabs */}
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
                {/* Request Update Form */}
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
                  />
                )}

                {/* Copy to Other Employees */}
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

          {/* Right Column - Takes 4/12 of the space */}
          <div className="lg:col-span-4 space-y-6">
            <CaseSummary request={currentRequest} />

            {/* Status Update Card */}
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
