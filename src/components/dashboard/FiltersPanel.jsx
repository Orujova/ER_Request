// src/pages/Dashboard/components/FiltersPanel.jsx
import { useSelector, useDispatch } from "react-redux";
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

const FiltersPanel = ({ onClearFilters }) => {
  const dispatch = useDispatch();
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
            htmlFor="erMemberId"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            ER Member
          </label>
          <select
            id="erMemberId"
            className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
            value={activeFilters.erMemberId}
            onChange={(e) => handleFilterChange("erMemberId", e.target.value)}
          >
            <option value="">All ER Members</option>
            {erMembers.map((member) => (
              <option key={member.Id} value={member.Id}>
                {member.FullName}
              </option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
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
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
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
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;
