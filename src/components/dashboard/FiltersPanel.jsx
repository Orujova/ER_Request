import React, { useEffect, useRef } from "react";
import { useDispatch as useReduxDispatch, useSelector } from "react-redux";
import {
  updateFilterValue,
  updateFilteredSubCases,
  updateFilteredProjects,
  updateFilteredEmployees,
  toggleProjectDropdown,
  toggleEmployeeDropdown,
  selectProject,
  selectEmployee,
} from "../../redux/slices/dashboardSlice";

// Import the new duration filter component
import DurationFilter from "./DurationFilter";

const FiltersPanel = ({ onClearFilters }) => {
  const dispatch = useReduxDispatch();
  const {
    activeFilters,
    caseOptions,
    filteredSubCaseOptions,
    filteredProjectOptions,
    filteredEmployeeOptions,
    showProjectDropdown,
    showEmployeeDropdown,
  } = useSelector((state) => state.dashboard);

  const { erMembers } = useSelector((state) => state.erMembers);

  // Refs for handling click outside
  const projectDropdownRef = useRef(null);
  const employeeDropdownRef = useRef(null);

  const handleFilterChange = (key, value) => {
    dispatch(updateFilterValue({ key, value }));

    

    if (key === "caseId") {
      dispatch(updateFilteredSubCases());
    }

    if (key === "projectSearch") {
      dispatch(updateFilteredProjects());
    }

    if (key === "employeeSearch") {
      dispatch(updateFilteredEmployees());
    }
  };

  const handleProjectSelect = (project) => {
    dispatch(selectProject(project));
  };

  const handleEmployeeSelect = (employee) => {
    dispatch(selectEmployee(employee));
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close project dropdown when clicking outside
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target) &&
        showProjectDropdown
      ) {
        dispatch(toggleProjectDropdown(false));
      }

      // Close employee dropdown when clicking outside
      if (
        employeeDropdownRef.current &&
        !employeeDropdownRef.current.contains(event.target) &&
        showEmployeeDropdown
      ) {
        dispatch(toggleEmployeeDropdown(false));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dispatch, showProjectDropdown, showEmployeeDropdown]);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-700">Filters</h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-[#06b6d4] hover:text-[#0B89A9]"
        >
          Clear all
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ER Member Filter */}
        <div>
          <label
            htmlFor="erMember"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            ER Member
          </label>
          <select
            id="erMember"
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
            value={activeFilters.erMember}
            onChange={(e) => handleFilterChange("erMember", e.target.value)}
          >
            <option value="">All ER Members</option>
            {erMembers.map((member) => (
              <option key={member.Id} value={member.FullName}>
                {member.FullName}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        <div ref={projectDropdownRef}>
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
              onFocus={() => dispatch(toggleProjectDropdown(true))}
              placeholder="Search or select project..."
            />
            {showProjectDropdown && filteredProjectOptions.length > 0 && (
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
                    {project.ProjectCode} - {project.ProjectName || ""}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Employee Filter */}
        <div ref={employeeDropdownRef}>
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
              onFocus={() => dispatch(toggleEmployeeDropdown(true))}
              placeholder="Search or select employee..."
            />
            {showEmployeeDropdown && filteredEmployeeOptions.length > 0 && (
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
                    {employee.FullName} ({employee.Badge || "No Badge"})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Case Filter */}
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
            onChange={(e) => handleFilterChange("caseId", e.target.value)}
          >
            <option value="">All Cases</option>
            {caseOptions.map((caseItem) => (
              <option key={caseItem.Id} value={caseItem.Id}>
                {caseItem.Name || caseItem.CaseName}
              </option>
            ))}
          </select>
        </div>

        {/* Subcase Filter */}
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
            onChange={(e) => handleFilterChange("subCaseId", e.target.value)}
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

        {/* Status Filter */}
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
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="0">Pending</option>
            <option value="1">Under Review</option>
            <option value="2">Decision Made</option>
            <option value="3">ReAssigned</option>
            <option value="4">Decision Communicated</option>
            <option value="5">Completed</option>
          </select>
        </div>

        {/* Canceled Filter */}
        <div>
          <label
            htmlFor="isCanceled"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Canceled Requests
          </label>
          <select
            id="isCanceled"
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
            value={activeFilters.isCanceled || ""}
            onChange={(e) => handleFilterChange("isCanceled", e.target.value)}
          >
            <option value="">All Requests</option>
            <option value="true">Canceled</option>
            <option value="false">Not Canceled</option>
          </select>
        </div>

        {/* Duration Filter - New! */}
        <DurationFilter />

        {/* Start Date Filter */}
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
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>

        {/* End Date Filter */}
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
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;
