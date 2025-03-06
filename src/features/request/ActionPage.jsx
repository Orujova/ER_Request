import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Mail,
  Copy,
  Check,
  X,
  ArrowLeft,
  Users,
  Search,
  Calendar,
  FileText,
  User,
  AlertTriangle,
  CheckCircle,
  Loader,
  PlusCircle,
  ChevronRight,
  Clipboard,
  Clock,
  CheckSquare,
  XSquare,
  Eye,
} from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";
import { themeColors } from "../../styles/theme";

function RequestAction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const request = useSelector((state) => state.request.currentRequest);

  // Form state
  const [erMembers, setErMembers] = useState([]);
  const [selectedErMember, setSelectedErMember] = useState("");
  const [disciplinaryViolations, setDisciplinaryViolations] = useState([]);
  const [disciplinaryActionResults, setDisciplinaryActionResults] = useState(
    []
  );
  const [disciplinaryActions, setDisciplinaryActions] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isEligible, setIsEligible] = useState(true);
  const [formData, setFormData] = useState({
    Id: parseInt(id),
    DisciplinaryActionId: "",
    DisciplinaryActionResultId: "",
    DisciplinaryViolationId: "",
    Note: "",
    Reason: "",
    IsEligible: true,
    ContractEndDate: "",
    OrderNumber: "",
  });
  const [childRequests, setChildRequests] = useState([]);
  const [existingChildRequests, setExistingChildRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(true);
  const [activeTab, setActiveTab] = useState("updateRequest"); // "updateRequest" or "copyEmployees"
  const [cases, setCases] = useState([]);
  const [subCases, setSubCases] = useState([]);
  const [allSubCases, setAllSubCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedSubCase, setSelectedSubCase] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [hoverChildId, setHoverChildId] = useState(null);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  // Function to refresh request data
  const refreshRequestData = useCallback(() => {
    // Assuming you have a Redux action to fetch request details
    // dispatch(fetchRequestDetails(id));

    // For now, let's just reload the page to simulate the refresh
    // In production, you'd want to use Redux actions instead
    window.location.reload();
  }, [id]);

  // Fetch necessary data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { token } = getStoredTokens();

        // Fetch ER Members
        const erMembersResponse = await fetch(
          `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
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
              Authorization: `Bearer ${token}`,
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
              Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
          },
        });

        if (!subCasesResponse.ok) {
          throw new Error(
            `Error fetching subcases: ${subCasesResponse.status}`
          );
        }

        const subCasesData = await subCasesResponse.json();
        setAllSubCases(subCasesData[0]?.SubCases || []);

        // Fetch existing child requests
        const childRequestsResponse = await fetch(
          `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${id}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (childRequestsResponse.ok) {
          const childRequestsData = await childRequestsResponse.json();
          setExistingChildRequests(childRequestsData[0]?.ERRequests || []);
        }

        // If request has data, populate the form
        if (request) {
          setFormData({
            Id: parseInt(id),
            DisciplinaryActionId: request.disciplinaryActionId || "",
            DisciplinaryActionResultId:
              request.disciplinaryActionResultId || "",
            DisciplinaryViolationId: request.disciplinaryViolationId || "",
            Note: request.note || "",
            Reason: request.reason || "",
            IsEligible:
              request.isEligible !== undefined ? request.isEligible : true,
            ContractEndDate: request.contractEndDate || "",
            OrderNumber: request.orderNumber || "",
          });
          setIsEligible(
            request.isEligible !== undefined ? request.isEligible : true
          );
          setSelectedErMember(request.erMemberId || "");
        }

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [id, request, shouldRefresh]);

  // Refresh data when shouldRefresh changes
  useEffect(() => {
    if (shouldRefresh) {
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  // Fetch disciplinary actions when action result changes
  useEffect(() => {
    const fetchDisciplinaryActions = async () => {
      if (!formData.DisciplinaryActionResultId) {
        // Clear disciplinary actions when no result is selected
        setDisciplinaryActions([]);
        return;
      }

      try {
        setLoading(true);
        const { token } = getStoredTokens();

        const response = await fetch(
          `${API_BASE_URL}/GetDisciplinaryActions?DisciplinaryActionResultId=${formData.DisciplinaryActionResultId}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            `Error fetching disciplinary actions: ${response.status}`
          );
        }

        const data = await response.json();
        setDisciplinaryActions(data || []);

        // Reset disciplinary action selection when action result changes
        setFormData((prev) => ({
          ...prev,
          DisciplinaryActionId: "",
        }));

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDisciplinaryActions();
  }, [formData.DisciplinaryActionResultId]);

  // Auto search employee when searchTerm changes
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchTerm.trim()) {
      setEmployees([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { token } = getStoredTokens();

        const response = await fetch(
          `${API_BASE_URL}/api/Employee?searchTerm=${searchTerm}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching employees: ${response.status}`);
        }

        const data = await response.json();
        setEmployees(data[0]?.Employees || []);
        setIsSearching(false);
      } catch (err) {
        setError(err.message);
        setIsSearching(false);
      }
    }, 500);

    setSearchTimeout(timer);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm]);

  // Handle ER member change
  const handleErMemberChange = async (event) => {
    try {
      setLoading(true);
      const newErMemberId = event.target.value;
      setSelectedErMember(newErMemberId);

      const { token } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequestERMember`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

      setSuccess("ER member updated successfully.");
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
        refreshRequestData();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setStatusLoading(true);
      const { token } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequestStatus`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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

      setSuccess("Status updated successfully.");
      setStatusLoading(false);

      // Clear success message and refresh data after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        refreshRequestData();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setStatusLoading(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "eligibilityOption") {
      const isEligibleValue = value === "eligible";
      setIsEligible(isEligibleValue);
      setFormData({
        ...formData,
        IsEligible: isEligibleValue,
      });
      return;
    }

    setFormData({
      ...formData,
      [name]: newValue,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const { token } = getStoredTokens();

      // Validate form if IsEligible is true
      if (isEligible && (!formData.ContractEndDate || !formData.OrderNumber)) {
        setError(
          "Contract End Date and Order Number are required when eligible is checked."
        );
        setLoading(false);
        return;
      }

      // Prepare data for API call
      const requestData = {
        ...formData,
        DisciplinaryActionId: formData.DisciplinaryActionId
          ? parseInt(formData.DisciplinaryActionId)
          : 0,
        DisciplinaryActionResultId: formData.DisciplinaryActionResultId
          ? parseInt(formData.DisciplinaryActionResultId)
          : 0,
        DisciplinaryViolationId: formData.DisciplinaryViolationId
          ? parseInt(formData.DisciplinaryViolationId)
          : 0,
        IsEligible: isEligible,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequest`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(
          `Error updating request: ${response.status} - ${errorData}`
        );
      }

      setSuccess("Request updated successfully.");
      setLoading(false);

      // Clear success message and refresh data after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        refreshRequestData();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle case change
  const handleCaseChange = (e) => {
    const caseId = e.target.value;
    setSelectedCase(caseId);

    // Filter subcases based on selected case
    if (caseId) {
      const filteredSubCases = allSubCases.filter(
        (subCase) => subCase.CaseId === parseInt(caseId)
      );
      setSubCases(filteredSubCases);
    } else {
      setSubCases([]);
    }

    // Reset selected subcase
    setSelectedSubCase("");
  };

  // Handle subcase change
  const handleSubCaseChange = (e) => {
    setSelectedSubCase(e.target.value);
  };

  // Add employee to child requests
  const addEmployeeToChildRequests = (employee) => {
    // Check if employee is already added
    if (childRequests.some((req) => req.EmployeeId === employee.Id)) {
      setError("This employee has already been added to the list.");
      return;
    }

    // Check if employee already exists in existing child requests
    if (existingChildRequests.some((req) => req.EmployeeId === employee.Id)) {
      setError("This employee already has a child request for this parent.");
      return;
    }

    // Validate case and subcase selections
    if (!selectedCase || !selectedSubCase) {
      setError(
        "Please select both a Case and Sub Case before adding employees."
      );
      return;
    }

    setChildRequests([
      ...childRequests,
      {
        EmployeeId: employee.Id,
        CaseId: parseInt(selectedCase),
        SubCaseId: parseInt(selectedSubCase),
        EmployeeName: employee.FullName,
        Badge: employee.Badge,
        Position: employee.Position?.Name || "",
        Department: employee.Section?.Name || "",
        CaseName:
          cases.find((c) => c.Id === parseInt(selectedCase))?.CaseName || "",
        SubCaseName:
          subCases.find((s) => s.Id === parseInt(selectedSubCase))
            ?.Description || "",
      },
    ]);

    // Clear search results but keep the search term
    setEmployees([]);
  };

  // Remove employee from child requests
  const removeEmployeeFromChildRequests = (employeeId) => {
    setChildRequests(
      childRequests.filter((req) => req.EmployeeId !== employeeId)
    );
  };

  // Submit child requests
  const submitChildRequests = async () => {
    if (childRequests.length === 0) {
      setError("No employees selected for child requests.");
      return;
    }

    try {
      setLoading(true);
      const { token } = getStoredTokens();

      const requestBody = {
        ParentId: parseInt(id),
        ChildRequests: childRequests.map((req) => ({
          EmployeeId: req.EmployeeId,
          CaseId: req.CaseId,
          SubCaseId: req.SubCaseId,
        })),
      };

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/AddChildERRequest`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(`Error creating child requests: ${response.status}`);
      }

      // Fetch updated child requests
      const childRequestsResponse = await fetch(
        `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${id}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (childRequestsResponse.ok) {
        const childRequestsData = await childRequestsResponse.json();
        setExistingChildRequests(childRequestsData[0]?.ERRequests || []);
      }

      setSuccess("Child requests created successfully.");
      setChildRequests([]);
      setEmployees([]);
      setSearchTerm("");
      setLoading(false);

      // Clear success message and refresh data after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        setShouldRefresh(true);
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const navigateToDetail = () => {
    navigate(`/request/${id}`);
  };

  const navigateToChildDetail = (childId) => {
    navigate(`/request/${childId}`);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800";
      case "Under Review":
        return "bg-amber-100 text-amber-800";
      case "Decision Made":
        return "bg-blue-100 text-blue-800";
      case "Order Created":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  const getStatusNumber = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Under Review":
        return 1;
      case "Decision Made":
        return 2;
      case "Order Created":
        return 3;
      case "Completed":
        return 4;
      default:
        return -1;
    }
  };

  const getStatusNameByCode = (code) => {
    switch (code) {
      case 0:
        return "Pending";
      case 1:
        return "Under Review";
      case 2:
        return "Decision Made";
      case 3:
        return "Order Created";
      case 4:
        return "Completed";
      case 5:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className="bg-background rounded-xl shadow-sm p-6 mb-6"
          style={{ boxShadow: themeColors.cardShadow }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-text">Request #{id}</h1>
                {request && (
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                )}
              </div>
              <p className="text-textLight">
                Manage request actions and employee assignments
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 px-4 py-2 text-sm text-textLight hover:text-text bg-background border border-border rounded-lg hover:border-borderHover transition-all"
                onClick={navigateToDetail}
              >
                <ArrowLeft size={16} />
                Back to Request
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm text-primary hover:text-primaryHover bg-primaryLight bg-opacity-10 border border-primaryLight rounded-lg hover:bg-opacity-20 transition-all">
                <Mail size={16} />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Success and Error Messages */}
        {error && (
          <div
            className="bg-background border-l-4 border-error text-error rounded-lg shadow-sm p-4 mb-6 flex items-start justify-between"
            role="alert"
          >
            <div className="flex items-center">
              <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
              <p>{error}</p>
            </div>
            <button
              className="text-textLight hover:text-text"
              onClick={() => setError(null)}
            >
              <X size={20} />
            </button>
          </div>
        )}

        {success && (
          <div
            className="bg-background border-l-4 border-success text-success rounded-lg shadow-sm p-4 mb-6 flex items-center"
            role="alert"
          >
            <CheckCircle size={20} className="mr-3 flex-shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column - Takes 8/12 of the space */}
          <div className="lg:col-span-8 space-y-6">
            {/* ER Member Selection */}
            <div
              className="bg-background rounded-xl shadow-sm p-6"
              style={{ boxShadow: themeColors.cardShadow }}
            >
              <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
                <User size={20} className="mr-2 text-primary" />
                ER Member Assignment
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textLight mb-2">
                    Assign ER Member
                  </label>
                  <select
                    className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all
                    focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                    value={selectedErMember}
                    onChange={handleErMemberChange}
                  >
                    <option value="">Select ER Member</option>
                    {erMembers.map((member) => (
                      <option key={member.Id} value={member.Id}>
                        {member.FullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

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
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-textLight mb-2">
                          Disciplinary Violation
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <AlertTriangle
                              size={16}
                              className="text-textLight"
                            />
                          </div>
                          <select
                            name="DisciplinaryViolationId"
                            className="block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                            focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                            value={formData.DisciplinaryViolationId}
                            onChange={handleChange}
                          >
                            <option value="">Select Violation</option>
                            {disciplinaryViolations.map((violation) => (
                              <option key={violation.Id} value={violation.Id}>
                                {violation.Name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-2">
                          Disciplinary Action Result
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FileText size={16} className="text-textLight" />
                          </div>
                          <select
                            name="DisciplinaryActionResultId"
                            className="block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                            focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                            value={formData.DisciplinaryActionResultId}
                            onChange={handleChange}
                          >
                            <option value="">Select Action Result</option>
                            {disciplinaryActionResults.map((result) => (
                              <option key={result.Id} value={result.Id}>
                                {result.Name}
                              </option>
                            ))}
                          </select>
                          {!formData.DisciplinaryActionResultId && (
                            <div className="mt-1 text-xs text-textLight">
                              Select result first to see available actions
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-textLight mb-2">
                          Disciplinary Action
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <FileText
                              size={16}
                              className={
                                !formData.DisciplinaryActionResultId
                                  ? "text-gray-300"
                                  : "text-textLight"
                              }
                            />
                          </div>
                          <select
                            name="DisciplinaryActionId"
                            className={`block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                            focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm ${
                              !formData.DisciplinaryActionResultId
                                ? "bg-secondaryDark text-gray-400 cursor-not-allowed"
                                : ""
                            }`}
                            value={formData.DisciplinaryActionId}
                            onChange={handleChange}
                            disabled={!formData.DisciplinaryActionResultId}
                          >
                            <option value="">Select Action</option>
                            {disciplinaryActions.map((action) => (
                              <option key={action.Id} value={action.Id}>
                                {action.Name}
                              </option>
                            ))}
                          </select>
                          {formData.DisciplinaryActionResultId &&
                            disciplinaryActions.length === 0 && (
                              <div className="mt-1 text-xs text-warning">
                                No actions available for this result
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-2">
                          Reason
                        </label>
                        <textarea
                          name="Reason"
                          rows={3}
                          className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all
                          focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                          placeholder="Enter reason..."
                          value={formData.Reason}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-2">
                          Note
                        </label>
                        <textarea
                          name="Note"
                          rows={3}
                          className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all
                          focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                          placeholder="Enter note..."
                          value={formData.Note}
                          onChange={handleChange}
                        />
                      </div>

                      {/* Eligibility Radio Buttons */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-textLight mb-3">
                          Eligibility Status
                        </label>
                        <div className="flex gap-6">
                          <div className="flex items-center">
                            <input
                              id="eligibleOption"
                              name="eligibilityOption"
                              type="radio"
                              value="eligible"
                              className="h-4 w-4 text-primary focus:ring-0 focus:outline-none border-border"
                              checked={isEligible}
                              onChange={handleChange}
                              required
                            />
                            <label
                              htmlFor="eligibleOption"
                              className="ml-2 block text-sm text-text"
                            >
                              <span className="flex items-center">
                                <CheckSquare
                                  size={16}
                                  className="mr-1 text-success"
                                />
                                Eligible
                              </span>
                            </label>
                          </div>
                          <div className="flex items-center">
                            <input
                              id="notEligibleOption"
                              name="eligibilityOption"
                              type="radio"
                              value="notEligible"
                              className="h-4 w-4 text-error focus:ring-0 focus:outline-none border-border"
                              checked={!isEligible}
                              onChange={handleChange}
                              required
                            />
                            <label
                              htmlFor="notEligibleOption"
                              className="ml-2 block text-sm text-text"
                            >
                              <span className="flex items-center">
                                <XSquare
                                  size={16}
                                  className="mr-1 text-error"
                                />
                                Not Eligible
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {isEligible && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-textLight mb-2">
                              Contract End Date
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Calendar
                                  size={16}
                                  className="text-textLight"
                                />
                              </div>
                              <input
                                type="date"
                                name="ContractEndDate"
                                className="block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                                focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                                value={formData.ContractEndDate}
                                onChange={handleChange}
                                required={isEligible}
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-textLight mb-2">
                              Order Number
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <FileText
                                  size={16}
                                  className="text-textLight"
                                />
                              </div>
                              <input
                                type="text"
                                name="OrderNumber"
                                className="block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                                focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                                placeholder="Enter order number..."
                                value={formData.OrderNumber}
                                onChange={handleChange}
                                required={isEligible}
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="mt-6 flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                        style={{
                          background: `linear-gradient(to right, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
                        }}
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader size={18} className="animate-spin mr-2" />
                        ) : (
                          <Check size={18} className="mr-2" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </form>
                )}

                {/* Copy to Other Employees */}
                {activeTab === "copyEmployees" && (
                  <div>
                    <div className="mb-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-textLight mb-2">
                            Case
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FileText size={16} className="text-textLight" />
                            </div>
                            <select
                              className="block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                              focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                              value={selectedCase}
                              onChange={handleCaseChange}
                            >
                              <option value="">Select Case</option>
                              {cases.map((caseItem) => (
                                <option key={caseItem.Id} value={caseItem.Id}>
                                  {caseItem.CaseName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-textLight mb-2">
                            Sub Case
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                              <FileText
                                size={16}
                                className={
                                  !selectedCase
                                    ? "text-gray-300"
                                    : "text-textLight"
                                }
                              />
                            </div>
                            <select
                              className={`block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                              focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm ${
                                !selectedCase
                                  ? "bg-secondaryDark text-gray-400 cursor-not-allowed"
                                  : ""
                              }`}
                              value={selectedSubCase}
                              onChange={handleSubCaseChange}
                              disabled={!selectedCase}
                            >
                              <option value="">Select Sub Case</option>
                              {subCases.map((subCase) => (
                                <option key={subCase.Id} value={subCase.Id}>
                                  {subCase.Description}
                                </option>
                              ))}
                            </select>
                          </div>
                          {selectedCase && subCases.length === 0 && (
                            <div className="mt-1 text-xs text-warning">
                              No sub cases available for this case
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-medium text-textLight mb-2">
                          Search Employee
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search by badge, name or FIN..."
                            className="block w-full rounded-lg border border-border bg-background pl-10 pr-4 py-3 text-sm transition-all
                            focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Search size={16} className="text-textLight" />
                          </div>
                          {isSearching && (
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <Loader
                                size={16}
                                className="animate-spin text-textLight"
                              />
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-xs text-textLight">
                          Start typing to search employees automatically
                        </div>
                      </div>

                      {employees.length > 0 && (
                        <div className="rounded-lg border border-border overflow-hidden mb-6 shadow-sm">
                          <div className="max-h-60 overflow-y-auto">
                            {employees.map((employee) => (
                              <div
                                key={employee.Id}
                                className="flex justify-between items-center p-3 hover:bg-secondary border-b border-border last:border-0 transition-colors"
                              >
                                <div className="flex items-center">
                                  <User
                                    size={18}
                                    className="text-textLight mr-3"
                                  />
                                  <div>
                                    <div className="font-medium text-text">
                                      {employee.FullName}{" "}
                                      <span className="text-textLight text-xs">
                                        ({employee.Badge})
                                      </span>
                                    </div>
                                    <div className="text-xs text-textLight">
                                      {employee.Position?.Name || ""}
                                      {employee.Position?.Name &&
                                        employee.Section?.Name &&
                                        " • "}
                                      {employee.Section?.Name || ""}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className={`inline-flex items-center justify-center p-1.5 rounded-lg transition-all ${
                                    !selectedCase || !selectedSubCase
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-primaryLight text-primary hover:bg-primary hover:text-white"
                                  }`}
                                  onClick={() =>
                                    addEmployeeToChildRequests(employee)
                                  }
                                  disabled={!selectedCase || !selectedSubCase}
                                  title={
                                    !selectedCase || !selectedSubCase
                                      ? "Select Case and Sub Case first"
                                      : "Add employee"
                                  }
                                >
                                  <PlusCircle size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Existing Child Requests */}
                      {existingChildRequests.length > 0 && (
                        <div className="mb-6">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-text flex items-center">
                              <Clipboard
                                size={18}
                                className="mr-2 text-primary"
                              />
                              Existing Child Requests (
                              {existingChildRequests.length})
                            </h4>
                          </div>
                          <div className="rounded-lg border border-border overflow-hidden shadow-sm">
                            {existingChildRequests.map((req) => (
                              <div
                                key={req.Id}
                                className={`flex justify-between items-center p-3 hover:bg-secondary border-b border-border last:border-0 transition-colors ${
                                  hoverChildId === req.Id ? "bg-secondary" : ""
                                }`}
                                onMouseEnter={() => setHoverChildId(req.Id)}
                                onMouseLeave={() => setHoverChildId(null)}
                              >
                                <div className="flex items-center">
                                  <User
                                    size={18}
                                    className="text-textLight mr-3"
                                  />
                                  <div>
                                    <div className="font-medium text-text">
                                      {req.EmployeeFullName}{" "}
                                      <span className="text-textLight text-xs">
                                        ({req.EmployeeBadge})
                                      </span>
                                    </div>
                                    <div className="text-xs text-textLight">
                                      {req.PositionName}
                                      {req.PositionName &&
                                        req.SectionName &&
                                        " • "}
                                      {req.SectionName}
                                    </div>
                                    <div className="text-xs text-primary mt-1">
                                      {req.CaseName} • {req.SubCaseDescription}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-xs px-2 py-1 rounded-full bg-blue-50 text-primary">
                                    Request #{req.Id}
                                  </div>
                                  {hoverChildId === req.Id && (
                                    <button
                                      type="button"
                                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 transition-all"
                                      onClick={() =>
                                        navigateToChildDetail(req.Id)
                                      }
                                      title="View details"
                                    >
                                      <Eye size={16} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Child Requests to Add */}
                      {childRequests.length > 0 && (
                        <div className="mt-6">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-medium text-text flex items-center">
                              <Users size={18} className="mr-2 text-primary" />
                              New Employees to Add ({childRequests.length})
                            </h4>
                          </div>
                          <div className="rounded-lg border border-border overflow-hidden mb-6 shadow-sm">
                            {childRequests.map((req) => (
                              <div
                                key={req.EmployeeId}
                                className="flex justify-between items-center p-3 hover:bg-secondary border-b border-border last:border-0 transition-colors"
                              >
                                <div className="flex items-center">
                                  <User
                                    size={18}
                                    className="text-textLight mr-3"
                                  />
                                  <div>
                                    <div className="font-medium text-text">
                                      {req.EmployeeName}{" "}
                                      <span className="text-textLight text-xs">
                                        ({req.Badge})
                                      </span>
                                    </div>
                                    <div className="text-xs text-textLight">
                                      {req.Position}
                                      {req.Position && req.Department && " • "}
                                      {req.Department}
                                    </div>
                                    <div className="text-xs text-primary mt-1">
                                      {req.CaseName} • {req.SubCaseName}
                                    </div>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-50 text-error hover:bg-error hover:text-white transition-all"
                                  onClick={() =>
                                    removeEmployeeFromChildRequests(
                                      req.EmployeeId
                                    )
                                  }
                                  title="Remove employee"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
                              style={{
                                background: `linear-gradient(to right, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
                              }}
                              onClick={submitChildRequests}
                              disabled={loading}
                            >
                              {loading ? (
                                <Loader
                                  size={18}
                                  className="animate-spin mr-2"
                                />
                              ) : (
                                <Copy size={18} className="mr-2" />
                              )}
                              Create Copy Requests
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Takes 4/12 of the space */}
          <div className="lg:col-span-4 space-y-6">
            {/* Case Summary Card */}
            <div
              className="bg-background rounded-xl shadow-sm p-6"
              style={{ boxShadow: themeColors.cardShadow }}
            >
              <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
                <FileText size={20} className="mr-2 text-primary" />
                Case Summary
              </h3>
              {request && (
                <div className="space-y-4">
                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-textLight mb-1">Case</div>
                    <div className="text-sm font-medium text-text">
                      {request.case}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-textLight mb-1">Sub Case</div>
                    <div className="text-sm font-medium text-text">
                      {request.subCase}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-textLight mb-1">
                      Created Date
                    </div>
                    <div className="text-sm font-medium text-text">
                      {request.createdDate}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-textLight mb-1">Employee</div>
                    <div className="text-sm font-medium text-text">
                      {request.employeeInfo?.name}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-secondary">
                    <div className="text-xs text-textLight mb-1">Project</div>
                    <div className="text-sm font-medium text-text">
                      {request.employeeInfo?.project}
                      <span className="text-textLight ml-1">
                        ({request.employeeInfo?.projectCode})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Update Card - Completely Redesigned */}
            <div
              className="bg-background rounded-xl shadow-sm p-6"
              style={{ boxShadow: themeColors.cardShadow }}
            >
              <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
                <Clock size={20} className="mr-2 text-primary" />
                Update Status
              </h3>

              {/* Current Status */}
              <div className="mb-6">
                <div className="text-sm text-textLight mb-2">
                  Current Status
                </div>
                {request && (
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStatusBadgeColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </div>
                )}
              </div>

              {/* Status Progression */}
              <div className="mb-8">
                <div className="relative pt-8 pb-4">
                  {/* Background Line */}
                  <div className="absolute top-12 left-0 w-full h-1 bg-gray-200"></div>

                  {/* Status Points */}
                  <div className="relative flex justify-between">
                    <StatusPoint
                      label="Pending"
                      stepNumber={1}
                      active={request?.status === "Pending"}
                      completed={getStatusNumber(request?.status) > 0}
                    />
                    <StatusPoint
                      label="Under Review"
                      stepNumber={2}
                      active={request?.status === "Under Review"}
                      completed={getStatusNumber(request?.status) > 1}
                    />
                    <StatusPoint
                      label="Decision"
                      stepNumber={3}
                      active={request?.status === "Decision Made"}
                      completed={getStatusNumber(request?.status) > 2}
                    />
                    <StatusPoint
                      label="Order"
                      stepNumber={4}
                      active={request?.status === "Order Created"}
                      completed={getStatusNumber(request?.status) > 3}
                    />
                    <StatusPoint
                      label="Complete"
                      stepNumber={5}
                      active={request?.status === "Completed"}
                      completed={false}
                    />
                  </div>
                </div>
              </div>

              {/* Status Action Buttons - New Design */}
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-medium text-textLight mb-3">
                  Change Status To
                </h4>

                {/* Under Review Status Button */}
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    request?.status === "Under Review" ||
                    getStatusNumber(request?.status) > 1 ||
                    statusLoading
                      ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
                      : "hover:bg-blue-50 hover:border-blue-200 focus:ring-2 focus:ring-blue-100 border-border"
                  }`}
                  onClick={() => handleStatusUpdate(1)}
                  disabled={
                    statusLoading ||
                    request?.status === "Under Review" ||
                    getStatusNumber(request?.status) > 1
                  }
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 mr-3">
                      <Search size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Under Review</div>
                      <div className="text-xs text-textLight">
                        Begin review process
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-blue-500" />
                </button>

                {/* Decision Made Status Button */}
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    request?.status === "Decision Made" ||
                    getStatusNumber(request?.status) > 2 ||
                    getStatusNumber(request?.status) < 1 ||
                    statusLoading
                      ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
                      : "hover:bg-indigo-50 hover:border-indigo-200 focus:ring-2 focus:ring-indigo-100 border-border"
                  }`}
                  onClick={() => handleStatusUpdate(2)}
                  disabled={
                    statusLoading ||
                    request?.status === "Decision Made" ||
                    getStatusNumber(request?.status) > 2 ||
                    getStatusNumber(request?.status) < 1
                  }
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                      <FileText size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Decision Made</div>
                      <div className="text-xs text-textLight">
                        Mark decision as completed
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-indigo-500" />
                </button>

                {/* Order Created Status Button */}
                <button
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    request?.status === "Order Created" ||
                    getStatusNumber(request?.status) > 3 ||
                    getStatusNumber(request?.status) < 2 ||
                    statusLoading
                      ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
                      : "hover:bg-purple-50 hover:border-purple-200 focus:ring-2 focus:ring-purple-100 border-border"
                  }`}
                  onClick={() => handleStatusUpdate(3)}
                  disabled={
                    statusLoading ||
                    request?.status === "Order Created" ||
                    getStatusNumber(request?.status) > 3 ||
                    getStatusNumber(request?.status) < 2
                  }
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 mr-3">
                      <Clipboard size={16} />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Order Created</div>
                      <div className="text-xs text-textLight">
                        Mark order as processed
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-purple-500" />
                </button>
              </div>

              {/* Final Actions */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-sm hover:shadow transition-all ${
                    request?.status === "Completed" ||
                    getStatusNumber(request?.status) < 3 ||
                    statusLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600"
                  }`}
                  onClick={() => handleStatusUpdate(4)}
                  disabled={
                    statusLoading ||
                    request?.status === "Completed" ||
                    getStatusNumber(request?.status) < 3
                  }
                >
                  {statusLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <Check size={18} />
                  )}
                  <span className="font-medium">Complete</span>
                </button>

                <button
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg shadow-sm hover:shadow transition-all ${
                    statusLoading
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
                  }`}
                  onClick={() => handleStatusUpdate(5)}
                  disabled={statusLoading}
                >
                  {statusLoading ? (
                    <Loader size={18} className="animate-spin" />
                  ) : (
                    <X size={18} />
                  )}
                  <span className="font-medium">Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for status points
function StatusPoint({ label, stepNumber, active, completed }) {
  let bgColor = "bg-gray-200";
  let textColor = "text-gray-500";

  if (active) {
    bgColor = "bg-amber-500";
    textColor = "text-white";
  } else if (completed) {
    bgColor = "bg-emerald-500";
    textColor = "text-white";
  }

  return (
    <div className="flex flex-col items-center">
      <div
        className={`z-10 flex items-center justify-center w-8 h-8 rounded-full ${bgColor} ${textColor}`}
      >
        {completed ? <Check size={16} /> : stepNumber}
      </div>
      <span className="mt-2 text-xs whitespace-nowrap">{label}</span>
    </div>
  );
}

export default RequestAction;
