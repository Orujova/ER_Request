import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens, getUserId } from "../../utils/authHandler";

// Async thunks
export const fetchDashboardData = createAsyncThunk(
  "dashboard/fetchDashboardData",
  async (params, { rejectWithValue }) => {
    try {
      const { jwtToken } = getStoredTokens();
      const userId = getUserId();

      // Build URL with pagination and all filter parameters
      const url = new URL(`${API_BASE_URL}/api/ERRequest`);
      url.searchParams.append("Page", params.currentPage);
      url.searchParams.append("ShowMore.Take", params.itemsPerPage);

      // Add userId
      if (userId) {
        url.searchParams.append("UserId", userId);
      }

      // Add filters
      const { filters } = params;
      if (filters.erMember) {
        url.searchParams.append("ERMember", filters.erMember);
      }
      if (filters.projectId) {
        url.searchParams.append("ProjectId", filters.projectId);
      }
      if (filters.employeeId) {
        url.searchParams.append("EmployeeId", filters.employeeId);
      }
      if (filters.caseId) {
        url.searchParams.append("CaseId", filters.caseId);
      }
      if (filters.subCaseId) {
        url.searchParams.append("SubCaseId", filters.subCaseId);
      }
      if (filters.status !== "") {
        url.searchParams.append("ERRequestStatus", filters.status);
      }
      if (filters.startDate) {
        url.searchParams.append("StartedDate", filters.startDate);
      }
      if (filters.endDate) {
        url.searchParams.append("EndDate", filters.endDate);
      }

      // Add ordering
      if (params.orderBy) {
        url.searchParams.append("OrderBy", params.orderBy);
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

      // Transform the API data
      const transformedData = erRequests.map((item) => ({
        id: item.Id,
        erMember: item.ERMember,
        erMemberId: item.ERMemberId,
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

      // Calculate stats for each status
      const statusCounts = {
        total: totalCount,
        pending: erRequests.filter((r) => r.ERRequestStatus === 0).length,
        underReview: erRequests.filter((r) => r.ERRequestStatus === 1).length,
        decisionMade: erRequests.filter((r) => r.ERRequestStatus === 2).length,
        orderCreated: erRequests.filter((r) => r.ERRequestStatus === 3).length,
        completed: erRequests.filter((r) => r.ERRequestStatus === 4).length,
        canceled: erRequests.filter((r) => r.ERRequestStatus === 5).length,
      };

      return {
        requests: transformedData,
        stats: statusCounts,
        totalItems: totalCount,
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReferenceData = createAsyncThunk(
  "dashboard/fetchReferenceData",
  async (_, { rejectWithValue }) => {
    try {
      const { jwtToken } = getStoredTokens();

      // Parallel requests for better performance
      const [
        casesResponse,
        subCasesResponse,
        projectsResponse,
        employeesResponse,
      ] = await Promise.all([
        fetch(`${API_BASE_URL}/api/Case`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }),
        fetch(`${API_BASE_URL}/api/SubCase`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }),
        fetch(`${API_BASE_URL}/api/Project`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }),
        fetch(`${API_BASE_URL}/api/Employee`, {
          headers: { Authorization: `Bearer ${jwtToken}` },
        }),
      ]);

      if (
        !casesResponse.ok ||
        !subCasesResponse.ok ||
        !projectsResponse.ok ||
        !employeesResponse.ok
      ) {
        throw new Error("Failed to fetch reference data");
      }

      const [casesData, subCasesData, projectsData, employeesData] =
        await Promise.all([
          casesResponse.json(),
          subCasesResponse.json(),
          projectsResponse.json(),
          employeesResponse.json(),
        ]);

      return {
        cases: casesData[0].Cases || [],
        subCases: subCasesData[0].SubCases || [],
        projects: projectsData[0].Projects || [],
        employees: employeesData[0].Employees || [],
      };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// For reassigning ER member to a request
export const reassignERMember = createAsyncThunk(
  "dashboard/reassignERMember",
  async ({ requestId, newErMemberId }, { rejectWithValue }) => {
    try {
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
            ERRequestId: requestId,
            NewERMemberUserId: newErMemberId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to reassign ER member: ${response.status}`);
      }

      return { requestId, newErMemberId };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  // Data
  requests: [],
  stats: {
    total: 0,
    pending: 0,
    underReview: 0,
    decisionMade: 0,
    orderCreated: 0,
    completed: 0,
    canceled: 0,
  },

  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 0,

  // Sorting
  orderBy: "createddate_desc",

  // Filters
  searchTerm: "",
  showFilters: false,
  activeFilters: {
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
  },

  // Reference data
  caseOptions: [],
  subCaseOptions: [],
  projectOptions: [],
  employeeOptions: [],
  filteredSubCaseOptions: [],
  filteredProjectOptions: [],
  filteredEmployeeOptions: [],

  // UI state
  showProjectDropdown: false,
  showEmployeeDropdown: false,

  // Loading and error states
  loading: false,
  error: null,
  reassignLoading: false,
  reassignError: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    updateFilterValue(state, action) {
      const { key, value } = action.payload;
      state.activeFilters[key] = value;
      state.currentPage = 1;

      // Special handling for certain filters
      if (key === "caseId") {
        state.activeFilters.subCaseId = "";
      }

      // When project search is emptied
      if (key === "projectSearch" && !value) {
        state.activeFilters.projectId = "";
      }

      // When employee search is emptied
      if (key === "employeeSearch" && !value) {
        state.activeFilters.employeeId = "";
      }
    },

    clearFilters(state) {
      state.activeFilters = {
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
      };
      state.currentPage = 1;
      state.showProjectDropdown = false;
      state.showEmployeeDropdown = false;
    },

    updateSorting(state, action) {
      state.orderBy = action.payload;
      state.currentPage = 1;
    },

    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },

    toggleFilters(state) {
      state.showFilters = !state.showFilters;
    },

    toggleProjectDropdown(state, action) {
      state.showProjectDropdown = action.payload;
    },

    toggleEmployeeDropdown(state, action) {
      state.showEmployeeDropdown = action.payload;
    },

    updateFilteredSubCases(state) {
      if (state.activeFilters.caseId) {
        state.filteredSubCaseOptions = state.subCaseOptions.filter(
          (subCase) => subCase.CaseId === parseInt(state.activeFilters.caseId)
        );
      } else {
        state.filteredSubCaseOptions = state.subCaseOptions;
      }
    },

    updateFilteredProjects(state) {
      if (state.activeFilters.projectSearch) {
        const search = state.activeFilters.projectSearch.toLowerCase();
        state.filteredProjectOptions = state.projectOptions.filter(
          (project) =>
            project.ProjectCode.toLowerCase().includes(search) ||
            (project.ProjectName &&
              project.ProjectName.toLowerCase().includes(search))
        );
        state.showProjectDropdown = state.filteredProjectOptions.length > 0;
      } else {
        state.filteredProjectOptions = state.projectOptions;
        state.showProjectDropdown = false;
      }
    },

    updateFilteredEmployees(state) {
      if (state.activeFilters.employeeSearch) {
        const search = state.activeFilters.employeeSearch.toLowerCase();
        state.filteredEmployeeOptions = state.employeeOptions.filter(
          (employee) =>
            employee.FullName.toLowerCase().includes(search) ||
            (employee.Badge && employee.Badge.toLowerCase().includes(search))
        );
        state.showEmployeeDropdown = state.filteredEmployeeOptions.length > 0;
      } else {
        state.filteredEmployeeOptions = state.employeeOptions;
        state.showEmployeeDropdown = false;
      }
    },

    selectProject(state, action) {
      const project = action.payload;
      state.activeFilters.projectId = project.Id.toString();
      state.activeFilters.projectSearch = `${project.ProjectCode} - ${
        project.ProjectName || ""
      }`;
      state.showProjectDropdown = false;
    },

    selectEmployee(state, action) {
      const employee = action.payload;
      state.activeFilters.employeeId = employee.Id.toString();
      state.activeFilters.employeeSearch = `${employee.FullName} (${
        employee.Badge || "No Badge"
      })`;
      state.showEmployeeDropdown = false;
    },

    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchDashboardData
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload.requests;
        state.stats = action.payload.stats;
        state.totalItems = action.payload.totalItems;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchReferenceData
      .addCase(fetchReferenceData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReferenceData.fulfilled, (state, action) => {
        state.loading = false;
        state.caseOptions = action.payload.cases;
        state.subCaseOptions = action.payload.subCases;
        state.projectOptions = action.payload.projects;
        state.employeeOptions = action.payload.employees;
        state.filteredSubCaseOptions = action.payload.subCases;
        state.filteredProjectOptions = action.payload.projects;
        state.filteredEmployeeOptions = action.payload.employees;
      })
      .addCase(fetchReferenceData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle reassignERMember
      .addCase(reassignERMember.pending, (state) => {
        state.reassignLoading = true;
        state.reassignError = null;
      })
      .addCase(reassignERMember.fulfilled, (state, action) => {
        state.reassignLoading = false;

        // Update the request with the new ER member info
        const { requestId, newErMemberId } = action.payload;
        const requestIndex = state.requests.findIndex(
          (req) => req.id === requestId
        );

        if (requestIndex !== -1) {
          // We would need to update erMember name too, but we'll need to fetch it from the ER members
          // This will be updated when the dashboard is refreshed
        }
      })
      .addCase(reassignERMember.rejected, (state, action) => {
        state.reassignLoading = false;
        state.reassignError = action.payload;
      });
  },
});

export const {
  updateFilterValue,
  clearFilters,
  updateSorting,
  setCurrentPage,
  toggleFilters,
  toggleProjectDropdown,
  toggleEmployeeDropdown,
  updateFilteredSubCases,
  updateFilteredProjects,
  updateFilteredEmployees,
  selectProject,
  selectEmployee,
  setSearchTerm,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
