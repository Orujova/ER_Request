import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens, getUserId } from "../utils/authHandler";
import {
  EyeIcon,
  CheckCircleIcon,
  ClipboardIcon,
  CalendarIcon,
  FilterIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  ClockIcon,
  AlertTriangleIcon,
  XIcon,
  ArrowUpDownIcon,
} from "lucide-react";

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    underReview: 0,
    decisionMade: 0,
    orderCreated: 0,
    completed: 0,
    canceled: 0,
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    erMember: "",
    erMemberId: "",
    projectId: "",
    projectSearch: "",
    employeeId: "",
    employeeSearch: "",
    caseId: "",
    subCaseId: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  // Dropdown visibility state
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Sorting state
  const [orderBy, setOrderBy] = useState("createddate_desc");

  // Reference data
  const [caseOptions, setCaseOptions] = useState([]);
  const [subCaseOptions, setSubCaseOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [employeeOptions, setEmployeeOptions] = useState([]);
  const [erMemberOptions, setErMemberOptions] = useState([]);
  const [filteredSubCaseOptions, setFilteredSubCaseOptions] = useState([]);
  const [filteredProjectOptions, setFilteredProjectOptions] = useState([]);
  const [filteredEmployeeOptions, setFilteredEmployeeOptions] = useState([]);

  const navigate = useNavigate();

  // Fetch reference data (Cases, SubCases, Projects, Employees, ER Members)
  useEffect(() => {
    const fetchReferenceData = async () => {
      const { jwtToken } = getStoredTokens();

      try {
        // Fetch Cases
        const casesResponse = await fetch(`${API_BASE_URL}/api/Case`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (casesResponse.ok) {
          const casesData = await casesResponse.json();
          setCaseOptions(casesData[0].Cases || []);
        }

        // Fetch SubCases
        const subCasesResponse = await fetch(`${API_BASE_URL}/api/SubCase`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (subCasesResponse.ok) {
          const subCasesData = await subCasesResponse.json();
          setSubCaseOptions(subCasesData[0].SubCases || []);
        }

        // Fetch Projects
        const projectsResponse = await fetch(`${API_BASE_URL}/api/Project`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json();
          const projects = projectsData[0].Projects || [];
          setProjectOptions(projects);
          setFilteredProjectOptions(projects);
        }

        // Fetch Employees
        const employeesResponse = await fetch(`${API_BASE_URL}/api/Employee`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        });
        if (employeesResponse.ok) {
          const employeesData = await employeesResponse.json();
          const employees = employeesData[0].Employees || [];
          setEmployeeOptions(employees);
          setFilteredEmployeeOptions(employees);
        }

        // Fetch ER Members
        const erMembersResponse = await fetch(
          `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
          {
            headers: { Authorization: `Bearer ${jwtToken}` },
          }
        );
        if (erMembersResponse.ok) {
          const erMembersData = await erMembersResponse.json();
          setErMemberOptions(erMembersData[0].AppUsers || []);
        }
      } catch (err) {
        console.error("Error fetching reference data:", err);
      }
    };

    fetchReferenceData();
  }, []);

  // Filter SubCases when Case selection changes
  useEffect(() => {
    if (activeFilters.caseId) {
      const filtered = subCaseOptions.filter(
        (subCase) => subCase.CaseId === parseInt(activeFilters.caseId)
      );
      setFilteredSubCaseOptions(filtered);
    } else {
      setFilteredSubCaseOptions(subCaseOptions);
    }
  }, [activeFilters.caseId, subCaseOptions]);

  // Filter Projects based on search text
  useEffect(() => {
    if (activeFilters.projectSearch) {
      const search = activeFilters.projectSearch.toLowerCase();
      const filtered = projectOptions.filter(
        (project) =>
          project.ProjectCode.toLowerCase().includes(search) ||
          (project.ProjectName &&
            project.ProjectName.toLowerCase().includes(search))
      );
      setFilteredProjectOptions(filtered);
      setShowProjectDropdown(filtered.length > 0);
    } else {
      setFilteredProjectOptions(projectOptions);
      setShowProjectDropdown(false);
    }
  }, [activeFilters.projectSearch, projectOptions]);

  // Filter Employees based on search text
  useEffect(() => {
    if (activeFilters.employeeSearch) {
      const search = activeFilters.employeeSearch.toLowerCase();
      const filtered = employeeOptions.filter(
        (employee) =>
          employee.FullName.toLowerCase().includes(search) ||
          (employee.Badge && employee.Badge.toLowerCase().includes(search))
      );
      setFilteredEmployeeOptions(filtered);
      setShowEmployeeDropdown(filtered.length > 0);
    } else {
      setFilteredEmployeeOptions(employeeOptions);
      setShowEmployeeDropdown(false);
    }
  }, [activeFilters.employeeSearch, employeeOptions]);

  // Add click away listener to close dropdowns
  useEffect(() => {
    const handleClickOutside = () => {
      setShowProjectDropdown(false);
      setShowEmployeeDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch data from the API with pagination and filters
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { jwtToken } = getStoredTokens();
        const userId = getUserId();

        // Build URL with pagination and all filter parameters
        const url = new URL(`${API_BASE_URL}/api/ERRequest`);
        url.searchParams.append("Page", currentPage);
        url.searchParams.append("ShowMore.Take", itemsPerPage);

        // Add userId
        if (userId) {
          url.searchParams.append("UserId", userId);
        }

        // Add filters
        if (activeFilters.erMember) {
          url.searchParams.append("ERMember", activeFilters.erMember);
        }
        if (activeFilters.projectId) {
          url.searchParams.append("ProjectId", activeFilters.projectId);
        }
        if (activeFilters.employeeId) {
          url.searchParams.append("EmployeeId", activeFilters.employeeId);
        }
        if (activeFilters.caseId) {
          url.searchParams.append("CaseId", activeFilters.caseId);
        }
        if (activeFilters.subCaseId) {
          url.searchParams.append("SubCaseId", activeFilters.subCaseId);
        }
        if (activeFilters.status !== "") {
          url.searchParams.append("ERRequestStatus", activeFilters.status);
        }
        if (activeFilters.startDate) {
          url.searchParams.append("StartedDate", activeFilters.startDate);
        }
        if (activeFilters.endDate) {
          url.searchParams.append("EndDate", activeFilters.endDate);
        }

        // Add ordering
        if (orderBy) {
          url.searchParams.append("OrderBy", orderBy);
        }

        const response = await fetch(url.toString(), {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const data = await response.json();

        // Handle nested array structure if it exists
        const requestsData = Array.isArray(data) ? data[0] : {};
        const erRequests = requestsData.ERRequests || [];
        const totalCount = requestsData.TotalERRequestCount || 0;

        // Transform the API data to match our component's structure
        const transformedData = erRequests.map((item) => ({
          id: item.Id,
          erMember: item.ERMember,
          project: item.ProjectName,
          projectCode: item.ProjectCode,
          employee: item.EmployeeName,
          case: item.CaseName,
          subcase: item.SubCaseDescription,
          statusCode: item.ERRequestStatus,
          date: new Date(item.CreatedDate || Date.now())
            .toISOString()
            .split("T")[0],
        }));

        setRequests(transformedData);
        setTotalItems(totalCount);

        // Calculate stats for each status
        const statusCounts = {
          total: totalCount,
          pending: erRequests.filter((r) => r.ERRequestStatus === 0).length,
          underReview: erRequests.filter((r) => r.ERRequestStatus === 1).length,
          decisionMade: erRequests.filter((r) => r.ERRequestStatus === 2)
            .length,
          orderCreated: erRequests.filter((r) => r.ERRequestStatus === 3)
            .length,
          completed: erRequests.filter((r) => r.ERRequestStatus === 4).length,
          canceled: erRequests.filter((r) => r.ERRequestStatus === 5).length,
        };

        setStats(statusCounts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, itemsPerPage, activeFilters, orderBy]);

  // Filter functions
  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Reset to first page when filter changes
    setCurrentPage(1);

    // Special handling for certain filters
    if (key === "caseId") {
      setActiveFilters((prev) => ({ ...prev, subCaseId: "" }));
    }

    // When ER Member dropdown changes, update text filter
    if (key === "erMemberId" && value) {
      const selectedMember = erMemberOptions.find(
        (member) => member.Id === parseInt(value)
      );
      if (selectedMember) {
        setActiveFilters((prev) => ({
          ...prev,
          erMember: selectedMember.FullName,
        }));
      }
    }

    // Clear project ID when search is emptied
    if (key === "projectSearch" && !value) {
      setActiveFilters((prev) => ({ ...prev, projectId: "" }));
    }

    // Clear employee ID when search is emptied
    if (key === "employeeSearch" && !value) {
      setActiveFilters((prev) => ({ ...prev, employeeId: "" }));
    }
  };

  // Handle project selection
  const handleProjectSelect = (project) => {
    handleFilterChange("projectId", project.Id.toString());
    handleFilterChange(
      "projectSearch",
      `${project.ProjectCode} - ${project.ProjectName || ""}`
    );
    setShowProjectDropdown(false);
  };

  // Handle employee selection
  const handleEmployeeSelect = (employee) => {
    handleFilterChange("employeeId", employee.Id.toString());
    handleFilterChange(
      "employeeSearch",
      `${employee.FullName} (${employee.Badge || "No Badge"})`
    );
    setShowEmployeeDropdown(false);
  };

  const clearFilters = () => {
    setActiveFilters({
      erMember: "",
      erMemberId: "",
      projectId: "",
      projectSearch: "",
      employeeId: "",
      employeeSearch: "",
      caseId: "",
      subCaseId: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
    setShowProjectDropdown(false);
    setShowEmployeeDropdown(false);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setOrderBy(value);
    setCurrentPage(1);
  };

  // Filter and search
  const filteredRequests = requests.filter((request) => {
    // Apply search term if it exists
    if (searchTerm) {
      const searchFields = [
        request.erMember,
        request.project,
        request.projectCode,
        request.employee,
        request.case,
        request.subcase,
        request.date,
        getStatusDisplay(request.statusCode),
      ];

      const matchesSearch = searchFields.some(
        (field) =>
          field &&
          field.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (!matchesSearch) return false;
    }

    return true; // Server-side filtering is applied
  });

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Status display utilities
  const getStatusDisplay = (code) => {
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
        return "Order Canceled";
      default:
        return "Unknown";
    }
  };

  const getStatusInfo = (code) => {
    switch (code) {
      case 0:
        return {
          label: "Pending",
          color: "bg-yellow-50 text-yellow-700",
          iconColor: "text-yellow-600",
          icon: <ClockIcon className="h-4 w-4" />,
          borderColor: "border-yellow-200",
        };
      case 1:
        return {
          label: "Under Review",
          color: "bg-sky-50 text-sky-700",
          iconColor: "text-sky-600",
          icon: <EyeIcon className="h-4 w-4" />,
          borderColor: "border-sky-200",
        };
      case 2: // Decision Made
        return {
          label: "Decision Made",
          color: "bg-violet-50 text-violet-700",
          iconColor: "text-violet-600",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-violet-200",
        };
      case 3: // Order Created
        return {
          label: "Order Created",
          color: "bg-fuchsia-50 text-fuchsia-700",
          iconColor: "text-fuchsia-600",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-fuchsia-200",
        };
      case 4: // Completed
        return {
          label: "Completed",
          color: "bg-emerald-50 text-emerald-700",
          iconColor: "text-emerald-600",
          icon: <CheckCircleIcon className="h-4 w-4" />,
          borderColor: "border-emerald-200",
        };
      case 5: // Canceled
        return {
          label: "Canceled",
          color: "bg-rose-50 text-rose-700",
          iconColor: "text-rose-600",
          icon: <XIcon className="h-4 w-4" />,
          borderColor: "border-rose-200",
        };
      default: // Unknown
        return {
          label: "Unknown",
          color: "bg-gray-50 text-gray-600",
          iconColor: "text-gray-500",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-gray-200",
        };
    }
  };

  return (
    <div className="space-y-6 p-1 bg-gray-50 min-h-screen">
      {/* Stats Overview */}

      {/* Status Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-medium">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Under Review</span>
              </div>
              <span className="text-sm font-medium">{stats.underReview}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
                <span className="text-sm text-gray-600">Decision Made</span>
              </div>
              <span className="text-sm font-medium">{stats.decisionMade}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Request Process
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                <span className="text-sm text-gray-600">Order Created</span>
              </div>
              <span className="text-sm font-medium">{stats.orderCreated}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-medium">{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                <span className="text-sm text-gray-600">Canceled</span>
              </div>
              <span className="text-sm font-medium">{stats.canceled}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Quick Stats
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-600">Total Requests</span>
              <span className="text-sm font-medium text-[#0D9BBF]">
                {stats.total}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-blue-600">
                {stats.pending + stats.underReview + stats.decisionMade}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Finalized</span>
              <span className="text-sm font-medium text-gray-800">
                {stats.completed + stats.canceled}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Header with search and filters */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Employee Reviews Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track and manage employee reviews
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={orderBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm
                      focus:outline-none focus:ring-1 focus:ring-[#0D9BBF] focus:border-[#0D9BBF] appearance-none"
                  >
                    <option value="createddate_desc">Date (Newest)</option>
                    <option value="createddate">Date (Oldest)</option>
                    <option value="ermember">ER Member (A-Z)</option>
                    <option value="ermember_desc">ER Member (Z-A)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ArrowUpDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Filter button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="inline-flex items-center justify-center px-4 py-2 border hover:bg-[#f5fcfd] border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white focus:outline-none focus:ring-0"
                >
                  <FilterIcon className="h-4 w-4 text-gray-500 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#06b6d4] hover:text-[#0B89A9]"
                  >
                    Clear all
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ER Member Filter - Now with dropdown */}
                  <div>
                    <label
                      htmlFor="erMemberId"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      ER Member
                    </label>
                    <select
                      id="erMemberId"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                      value={activeFilters.erMemberId}
                      onChange={(e) =>
                        handleFilterChange("erMemberId", e.target.value)
                      }
                    >
                      <option value="">All ER Members</option>
                      {erMemberOptions.map((member) => (
                        <option key={member.Id} value={member.Id}>
                          {member.FullName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Project Filter - With searchable dropdown */}
                  <div>
                    <label
                      htmlFor="projectSearch"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Project
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="projectSearch"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                        value={activeFilters.projectSearch}
                        onChange={(e) =>
                          handleFilterChange("projectSearch", e.target.value)
                        }
                        onFocus={() => setShowProjectDropdown(true)}
                        placeholder="Search or select project..."
                      />
                      {showProjectDropdown &&
                        filteredProjectOptions.length > 0 && (
                          <div
                            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {filteredProjectOptions.map((project) => (
                              <div
                                key={project.Id}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                onClick={() => handleProjectSelect(project)}
                              >
                                {project.ProjectCode} -{" "}
                                {project.ProjectName || ""}
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Employee Filter - With searchable dropdown */}
                  <div>
                    <label
                      htmlFor="employeeSearch"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Employee
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="employeeSearch"
                        className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                        value={activeFilters.employeeSearch}
                        onChange={(e) =>
                          handleFilterChange("employeeSearch", e.target.value)
                        }
                        onFocus={() => setShowEmployeeDropdown(true)}
                        placeholder="Search or select employee..."
                      />
                      {showEmployeeDropdown &&
                        filteredEmployeeOptions.length > 0 && (
                          <div
                            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {filteredEmployeeOptions.map((employee) => (
                              <div
                                key={employee.Id}
                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                                onClick={() => handleEmployeeSelect(employee)}
                              >
                                {employee.FullName} (
                                {employee.Badge || "No Badge"})
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="caseId"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Case
                    </label>
                    <select
                      id="caseId"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                      value={activeFilters.caseId}
                      onChange={(e) =>
                        handleFilterChange("caseId", e.target.value)
                      }
                    >
                      <option value="">All Cases</option>
                      {caseOptions.map((caseItem) => (
                        <option key={caseItem.Id} value={caseItem.Id}>
                          {caseItem.CaseName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="subCaseId"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Subcase
                    </label>
                    <select
                      id="subCaseId"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                      value={activeFilters.subCaseId}
                      onChange={(e) =>
                        handleFilterChange("subCaseId", e.target.value)
                      }
                      disabled={!activeFilters.caseId}
                    >
                      <option value="">All Subcases</option>
                      {filteredSubCaseOptions.map((subCase) => (
                        <option key={subCase.Id} value={subCase.Id}>
                          {subCase.Description}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="status"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                      value={activeFilters.status}
                      onChange={(e) =>
                        handleFilterChange("status", e.target.value)
                      }
                    >
                      <option value="">All Statuses</option>
                      <option value="0">Pending</option>
                      <option value="1">Under Review</option>
                      <option value="2">Decision Made</option>
                      <option value="3">Order Created</option>
                      <option value="4">Completed</option>
                      <option value="5">Canceled</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="startDate"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                      value={activeFilters.startDate}
                      onChange={(e) =>
                        handleFilterChange("startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="endDate"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      End Date
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
                      value={activeFilters.endDate}
                      onChange={(e) =>
                        handleFilterChange("endDate", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Table section */}
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D9BBF] mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading data...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 my-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangleIcon className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error loading data:
                    </h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ER Member
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Project
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Employee
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Case
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Subcase
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-8 text-center text-sm text-gray-500"
                          >
                            No requests found
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((request) => {
                          const status = getStatusInfo(request.statusCode);

                          return (
                            <tr
                              key={request.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm font-medium text-gray-900">
                                  {request.erMember}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <p className="text-sm text-gray-900">
                                    {request.project}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.projectCode}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm text-gray-900">
                                  {request.employee}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm text-gray-900">
                                  {request.case}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <p className="text-sm text-gray-900">
                                  {request.subcase}
                                </p>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                                  <p className="text-sm text-gray-500">
                                    {request.date}
                                  </p>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div
                                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color} border ${status.borderColor}`}
                                >
                                  <span className={`${status.iconColor} mr-1`}>
                                    {status.icon}
                                  </span>
                                  <span>{status.label}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                  onClick={() =>
                                    navigate(`/request/${request.id}`)
                                  }
                                  className="inline-flex items-center px-3 py-1.5 border border-[#0D9BBF] shadow-sm text-sm leading-4 font-medium rounded-md text-[#0D9BBF] bg-white hover:bg-[#E6F7FB] focus:outline-none focus:ring-0 transition-colors"
                                >
                                  <EyeIcon className="h-4 w-4 mr-1" />
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {!loading && !error && filteredRequests.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 px-4 py-3 border-t border-gray-200 sm:px-6 rounded-b-lg">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <span className="text-sm text-gray-700">
                    Total Records:{" "}
                    <span className="font-medium">{totalItems}</span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center text-sm px-2 py-2 rounded-md border ${
                      currentPage === 1
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-3 w-4" />
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center text-sm px-3 py-1 rounded-md border ${
                          currentPage === pageNum
                            ? "z-10 bg-[#0D9BBF] border-[#0D9BBF] text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center text-sm px-2 py-2 rounded-md border ${
                      currentPage === totalPages
                        ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-3 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
