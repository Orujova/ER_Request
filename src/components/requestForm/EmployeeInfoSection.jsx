// src/components/RequestForm/EmployeeInfoSection.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedEmployee,
  setProjectId,
  setSearchQuery,
} from "../../redux/slices/formDataSlice";
import SearchableDropdown from "../common/SearchableDropdown";
import SearchableProjectDropdown from "../common/SearchableProjectDropdown";
import SectionContainer from "./SectionContainer";

const EmployeeInfoSection = () => {
  const dispatch = useDispatch();

  // Add fallbacks for undefined state
  const formData = useSelector((state) => state.formData) || {};
  const requestForm = useSelector((state) => state.requestForm) || {};

  const employees = requestForm.employees || [];
  const projects = requestForm.projects || [];
  const activeTab = formData.activeTab || "employee";
  const selectedEmployee = formData.selectedEmployee || null;
  const projectId = formData.projectId;
  const searchQueries = formData.searchQueries || {
    badge: "",
    name: "",
    project: "",
  };

  const getFilteredEmployeesByBadge = () => {
    return employees
      .filter((emp) =>
        emp.Badge?.toLowerCase().includes(
          (searchQueries.badge || "").toLowerCase()
        )
      )
      .map((emp) => `${emp.Badge} - ${emp.FullName}`);
  };

  const getFilteredEmployeesByName = () => {
    return employees
      .filter((emp) =>
        emp.FullName?.toLowerCase().includes(
          (searchQueries.name || "").toLowerCase()
        )
      )
      .map((emp) => `${emp.FullName} (${emp.Badge})`);
  };

  const getProjectOptions = () => {
    return projects.map((project) => project.ProjectName);
  };

  const handleSearch = (field, value) => {
    dispatch(setSearchQuery({ field, value }));
  };

  const handleSelect = (field, value) => {
    switch (field) {
      case "badge":
        if (!value) {
          dispatch(setSelectedEmployee(null));
          return;
        }
        const badgeParts = value.split(" - ");
        const badge = badgeParts[0];
        const empByBadge = employees.find((emp) => emp.Badge === badge);
        dispatch(setSelectedEmployee(empByBadge));
        break;
      case "name":
        if (!value) {
          dispatch(setSelectedEmployee(null));
          return;
        }
        const nameParts = value.match(/(.+) \((.+)\)/);
        if (nameParts) {
          const fullName = nameParts[1];
          const empByName = employees.find((emp) => emp.FullName === fullName);
          dispatch(setSelectedEmployee(empByName));
        }
        break;
      case "project":
        if (activeTab === "general") {
          const projectId = value
            ? projects.find((p) => p.ProjectName === value)?.Id
            : null;
          dispatch(setProjectId(projectId));
        }
        break;
    }
  };

  // Get project name from ID
  const getProjectNameById = (projectId) => {
    if (!projectId) return "";
    const project = projects.find((p) => p.Id === projectId);
    return project ? project.ProjectName : "";
  };

  return (
    <SectionContainer title="Employee Related Information">
      <div className="grid grid-cols-2 gap-6">
        {activeTab === "employee" && (
          <>
            <SearchableDropdown
              label="Badge"
              placeholder="Search by badge..."
              value={
                selectedEmployee?.Badge ? `${selectedEmployee.Badge} ` : ""
              }
              onSearch={(value) => handleSearch("badge", value)}
              onSelect={(value) => handleSelect("badge", value)}
              options={getFilteredEmployeesByBadge()}
              searchQuery={searchQueries.badge || ""}
              setSearchQuery={(value) => handleSearch("badge", value)}
              allowClear={true}
            />

            <SearchableDropdown
              label="A.S.A"
              placeholder="Search by name..."
              value={
                selectedEmployee?.FullName
                  ? `${selectedEmployee.FullName} `
                  : ""
              }
              onSearch={(value) => handleSearch("name", value)}
              onSelect={(value) => handleSelect("name", value)}
              options={getFilteredEmployeesByName()}
              searchQuery={searchQueries.name || ""}
              setSearchQuery={(value) => handleSearch("name", value)}
              allowClear={true}
            />

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Position
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-700"
                value={selectedEmployee?.Position?.Name || ""}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Department
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-700"
                value={selectedEmployee?.Section?.Name || ""}
                readOnly
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-100 text-gray-700"
                value={
                  getProjectNameById(projectId) ||
                  selectedEmployee?.Project?.ProjectCode ||
                  ""
                }
                readOnly
              />
            </div>
          </>
        )}

        {activeTab === "general" && (
          <SearchableProjectDropdown
            label="Project"
            placeholder="Select Project"
            options={getProjectOptions()}
            value={projects.find((p) => p.Id === projectId)?.ProjectName || ""}
            onChange={(value) => handleSelect("project", value)}
            nullable={true}
          />
        )}
      </div>
    </SectionContainer>
  );
};

export default EmployeeInfoSection;
