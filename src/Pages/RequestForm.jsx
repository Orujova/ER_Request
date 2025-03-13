import React, { useState, useEffect, useRef } from "react";
import AzureUsers from "../components/AzureUserSelector";
import { API_BASE_URL } from "../../apiConfig";
import { X, FileUp } from "lucide-react";
import { getStoredTokens } from "../utils/authHandler";
import SearchableDropdown from "../components/common/SearchableDropdown";
import SearchableProjectDropdown from "../components/common/SearchableProjectDropdown";
// import { showToast } from "../../toast/toast";

// Constants
const ERRequestType = {
  EmployeeRequest: 0,
  GeneralRequest: 1,
};

// Main component
const RequestForm = () => {
  // States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("employee");
  const [requestType, setRequestType] = useState("");
  const [subCase, setSubCase] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    projectId: null,
    ccAddresses: "",
    mailBody: "",
    hyperlink: "",
    attachments: [],
  });

  // Search queries state
  const [searchQueries, setSearchQueries] = useState({
    case: "",
    subCase: "",
    badge: "",
    name: "",
    project: "",
  });

  const [selectedCCUsers, setSelectedCCUsers] = useState([]);

  // Data states
  const [cases, setCases] = useState([]);
  const [subCases, setSubCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);

  // Update project from employee when employee changes
  useEffect(() => {
    if (activeTab === "employee" && selectedEmployee?.Project?.Id) {
      setFormData((prev) => ({
        ...prev,
        projectId: selectedEmployee.Project.Id,
      }));
    }
  }, [selectedEmployee, activeTab]);

  // Reset project when switching tabs
  useEffect(() => {
    if (activeTab === "employee" && selectedEmployee?.Project?.Id) {
      setFormData((prev) => ({
        ...prev,
        projectId: selectedEmployee.Project.Id,
      }));
    } else if (activeTab === "general") {
      setFormData((prev) => ({
        ...prev,
        projectId: null,
      }));
    }
  }, [activeTab, selectedEmployee]);

  // Fetch data
  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        setLoading(true);
        const { jwtToken } = getStoredTokens();

        const fetchOptions = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: "application/json",
          },
        };

        // Fetch Cases
        const casesResponse = await fetch(
          `${API_BASE_URL}/api/Case`,
          fetchOptions
        );
        const casesData = await casesResponse.json();
        const fetchedCases = casesData[0]?.Cases || [];
        setCases(fetchedCases);

        // Fetch SubCases
        const subCasesResponse = await fetch(
          `${API_BASE_URL}/api/SubCase`,
          fetchOptions
        );
        const subCasesData = await subCasesResponse.json();
        const fetchedSubCases = subCasesData[0]?.SubCases || [];
        setSubCases(fetchedSubCases);

        // Fetch Employees
        const employeesResponse = await fetch(
          `${API_BASE_URL}/api/Employee`,
          fetchOptions
        );
        const employeesData = await employeesResponse.json();
        const fetchedEmployees = employeesData[0]?.Employees || [];
        setEmployees(fetchedEmployees);

        // Fetch Projects
        const projectsResponse = await fetch(
          `${API_BASE_URL}/api/Project`,
          fetchOptions
        );
        const projectsData = await projectsResponse.json();
        const fetchedProjects = projectsData[0]?.Projects || [];
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
        setError("Failed to load form data");

        // Set default empty arrays to prevent undefined errors
        setCases([]);
        setSubCases([]);
        setEmployees([]);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDependencies();
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        ...files.map((file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          file: file, // Store the actual File object
        })),
      ],
    }));
  };

  const isFormValid = () => {
    if (!requestType || !subCase) {
      return false;
    }

    if (activeTab === "employee" && !selectedEmployee) {
      return false;
    }

    if (!formData.mailBody.trim()) {
      return false;
    }

    // Validate that at least one of hyperlink or attachment is provided
    const hasHyperlink = formData.hyperlink.trim() !== "";
    const hasAttachments = formData.attachments.length > 0;

    // Require either a hyperlink or at least one attachment
    if (!hasHyperlink && !hasAttachments) {
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { jwtToken } = getStoredTokens();
      const formDataObj = new FormData();

      const isEmployeeRequest = activeTab === "employee";
      formDataObj.append(
        "RequestType",
        isEmployeeRequest
          ? ERRequestType.EmployeeRequest
          : ERRequestType.GeneralRequest
      );

      // Append case and subcase IDs
      formDataObj.append(
        "CaseId",
        cases.find((c) => c.CaseName === requestType)?.Id || "0"
      );
      formDataObj.append(
        "SubCaseId",
        subCases.find((sc) => sc.Description === subCase)?.Id || "0"
      );

      if (isEmployeeRequest) {
        // Employee request - include employee data
        formDataObj.append("EmployeeId", selectedEmployee?.Id || "0");
        formDataObj.append("ProjectId", selectedEmployee?.Project?.Id || "0");
      } else {
        formDataObj.append("EmployeeId", "");

        if (formData.projectId) {
          formDataObj.append("ProjectId", formData.projectId);
        } else {
          formDataObj.append("ProjectId", "");
          // Alternative: Don't append ProjectId at all if not selected
        }
      }

      // Common fields for both request types
      formDataObj.append("ERHyperLink", formData.hyperlink || "");
      formDataObj.append("MailCcAddresses", formData.ccAddresses || "");
      formDataObj.append("MailBody", formData.mailBody || "");

      // Handle file attachments
      if (formData.attachments && formData.attachments.length > 0) {
        formData.attachments.forEach((attachment) => {
          if (attachment.file && attachment.file instanceof File) {
            formDataObj.append("Attachments", attachment.file);
          }
        });
      } else {
        // Empty attachments - try sending as empty string
        formDataObj.append("Attachments", "");
      }

      // Submit request
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/AddERRequest`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formDataObj,
        }
      );

      // Parse and log the response
      const responseText = await response.text();
      console.log("API Response:", responseText);

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log("Parsed Response:", responseData);
      } catch (e) {
        console.error("Failed to parse response:", e);
        responseData = { message: responseText };
      }

      if (!response.ok || (responseData && responseData.IsSuccess === false)) {
        throw new Error(
          responseData.Message || responseData.message || "Submission failed"
        );
      }

      // Handle successful submission
      alert("Request submitted successfully");
      resetForm();
    } catch (err) {
      console.error("Submission failed:", err);
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRequestType("");
    setSubCase("");
    setSelectedEmployee(null);
    setFormData({
      projectId: null,
      ccAddresses: "",
      mailBody: "",
      hyperlink: "",
      attachments: [],
    });
    setSelectedCCUsers([]);
    setSearchQueries({
      case: "",
      subCase: "",
      badge: "",
      name: "",
      project: "",
    });
  };

  // Filtering methods
  const getFilteredCases = () => {
    if (!cases) return [];
    return cases
      .filter((caseItem) =>
        caseItem?.CaseName?.toLowerCase().includes(
          (searchQueries.case || "").toLowerCase()
        )
      )
      .map((caseItem) => caseItem.CaseName);
  };

  const getFilteredSubCases = () => {
    if (!requestType || !subCases) return [];
    const selectedCaseId = cases.find((c) => c.CaseName === requestType)?.Id;
    return subCases
      .filter(
        (subCaseItem) =>
          subCaseItem.CaseId === selectedCaseId &&
          subCaseItem.Description?.toLowerCase().includes(
            (searchQueries.subCase || "").toLowerCase()
          )
      )
      .map((subCaseItem) => subCaseItem.Description);
  };

  const getFilteredEmployeesByBadge = () => {
    if (!employees) return [];
    return employees
      .filter((emp) =>
        emp.Badge?.toLowerCase().includes(
          (searchQueries.badge || "").toLowerCase()
        )
      )
      .map((emp) => `${emp.Badge} - ${emp.FullName}`);
  };

  const getFilteredEmployeesByName = () => {
    if (!employees) return [];
    return employees
      .filter((emp) =>
        emp.FullName?.toLowerCase().includes(
          (searchQueries.name || "").toLowerCase()
        )
      )
      .map((emp) => `${emp.FullName} (${emp.Badge})`);
  };

  const getProjectOptions = () => {
    if (!projects) return [];
    return projects.map((project) => project.ProjectName);
  };

  // Handle search and select
  const handleSearch = (field, value = "") => {
    setSearchQueries((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelect = (field, value) => {
    switch (field) {
      case "case":
        setRequestType(value || "");
        setSubCase("");
        break;
      case "subCase":
        setSubCase(value || "");
        break;
      case "badge":
        if (!value) {
          setSelectedEmployee(null);
          return;
        }
        const badgeParts = value.split(" - ");
        const badge = badgeParts[0];
        const empByBadge = employees.find((emp) => emp.Badge === badge);
        setSelectedEmployee(empByBadge);
        break;
      case "name":
        if (!value) {
          setSelectedEmployee(null);
          return;
        }
        const nameParts = value.match(/(.+) \((.+)\)/);
        if (nameParts) {
          const fullName = nameParts[1];
          const empByName = employees.find((emp) => emp.FullName === fullName);
          setSelectedEmployee(empByName);
        }
        break;
      case "project":
        if (activeTab === "general") {
          setFormData((prev) => ({
            ...prev,
            projectId: value
              ? projects.find((p) => p.ProjectName === value)?.Id
              : null,
          }));
        }
        break;
    }
  };

  // Azure User Selection
  const handleAzureUserSelect = (user) => {
    // Prevent duplicate users
    if (selectedCCUsers.some((u) => u.id === user.id)) {
      return;
    }

    const newSelectedUsers = [...selectedCCUsers, user];
    setSelectedCCUsers(newSelectedUsers);

    // Update CC addresses in formData
    const ccAddresses = newSelectedUsers
      .map((u) => u.userPrincipalName)
      .join(",");
    setFormData((prev) => ({
      ...prev,
      ccAddresses,
    }));
  };

  // Remove CC user
  const handleRemoveCCUser = (userToRemove) => {
    const updatedUsers = selectedCCUsers.filter(
      (user) => user.id !== userToRemove.id
    );
    setSelectedCCUsers(updatedUsers);

    // Update CC addresses in formData
    const ccAddresses = updatedUsers.map((u) => u.userPrincipalName).join(",");
    setFormData((prev) => ({
      ...prev,
      ccAddresses,
    }));
  };

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  // Get project name from ID
  const getProjectNameById = (projectId) => {
    if (!projectId) return "";
    const project = projects.find((p) => p.Id === projectId);
    return project ? project.ProjectName : "";
  };

  // Component rendering
  return (
    <div className="max-w-6xl mx-auto my-8 p-10 bg-white rounded-3xl shadow-lg border border-gray-200">
      {error && (
        <div className="bg-red-500 text-white p-4 mb-6 rounded-xl">{error}</div>
      )}

      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center relative after:content-[''] after:absolute after:bottom-[-0.5rem] after:left-1/2 after:transform after:-translate-x-1/2 after:w-16 after:h-1 after:bg-sky-600 after:rounded">
        Create New Request
      </h2>

      <div className="grid grid-cols-2 gap-4 p-3 mb-8 bg-gray-50 rounded-xl">
        <button
          type="button"
          className={`py-4 px-6 rounded-xl text-base font-semibold transition-colors ${
            activeTab === "employee"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-gray-500 hover:bg-white hover:text-sky-600"
          }`}
          onClick={() => setActiveTab("employee")}
        >
          Əməkdaş üçün sorğu
        </button>
        <button
          type="button"
          className={`py-4 px-6 rounded-xl text-base font-semibold transition-colors ${
            activeTab === "general"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-gray-500 hover:bg-white hover:text-sky-600"
          }`}
          onClick={() => setActiveTab("general")}
        >
          Ümumi sorğu
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded">
            Sorğu Məlumatları
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <SearchableDropdown
              label="Case"
              placeholder="Search case type..."
              value={requestType}
              onSearch={(value) => handleSearch("case", value)}
              onSelect={(value) => handleSelect("case", value)}
              options={getFilteredCases()}
              searchQuery={searchQueries.case}
              setSearchQuery={(value) => handleSearch("case", value)}
              allowClear={true}
            />

            <SearchableDropdown
              label="Sub Case"
              placeholder={
                !requestType ? "First select a case" : "Search sub case..."
              }
              value={subCase}
              onSearch={(value) => handleSearch("subCase", value)}
              onSelect={(value) => handleSelect("subCase", value)}
              options={getFilteredSubCases()}
              disabled={!requestType}
              searchQuery={searchQueries.subCase}
              setSearchQuery={(value) => handleSearch("subCase", value)}
              allowClear={true}
            />
          </div>
        </div>

        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded">
            Employee Related Information
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {activeTab === "employee" && (
              <>
                <SearchableDropdown
                  label="Badge"
                  placeholder="Search by badge..."
                  value={
                    selectedEmployee?.Badge
                      ? `${selectedEmployee.Badge} - ${selectedEmployee.FullName}`
                      : ""
                  }
                  onSearch={(value) => handleSearch("badge", value)}
                  onSelect={(value) => handleSelect("badge", value)}
                  options={getFilteredEmployeesByBadge()}
                  searchQuery={searchQueries.badge}
                  setSearchQuery={(value) => handleSearch("badge", value)}
                  allowClear={true}
                />

                <SearchableDropdown
                  label="A.S.A"
                  placeholder="Search by name..."
                  value={
                    selectedEmployee?.FullName
                      ? `${selectedEmployee.FullName} (${selectedEmployee.Badge})`
                      : ""
                  }
                  onSearch={(value) => handleSearch("name", value)}
                  onSelect={(value) => handleSelect("name", value)}
                  options={getFilteredEmployeesByName()}
                  searchQuery={searchQueries.name}
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
                      getProjectNameById(formData.projectId) ||
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
                value={
                  projects.find((p) => p.Id === formData.projectId)
                    ?.ProjectName || ""
                }
                onChange={(value) => handleSelect("project", value)}
                nullable={true}
              />
            )}
          </div>
        </div>

        {/* Mail Information */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded">
            Mail
          </h3>
          <div className="mb-5 relative overflow-hidden">
            <div className="pl-6 py-4 pr-4 bg-gradient-to-r from-blue-50 via-blue-50 to-transparent rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Siz bu bölmədə intizam pozuntusunu ətraflı şəkildə
                    açıqlamalı və əlaqədər şəxsləri CC bölmədə təyin
                    etməlisiniz. Bu bölmədə məktubun ünvanlanacağı müvafiq ER
                    üzvü avtomatik təyin olunur.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              CC
            </label>

            <AzureUsers
              onSelect={handleAzureUserSelect}
              selectedUsers={selectedCCUsers}
              onRemove={handleRemoveCCUser}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mail Body
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors resize-vertical min-h-32"
              placeholder="Enter your message here..."
              value={formData.mailBody}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  mailBody: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Hyperlink */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded">
            Hyperlink
          </h3>

          <div className="mb-5 relative overflow-hidden">
            <div className="pl-6 py-4 pr-4 bg-gradient-to-r from-blue-50 via-blue-50 to-transparent rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    İntizam pozuntusu ilə əlaqəli video materialların linkini bu
                    bölmədə yerləşdirə bilərsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Hyperlink
            </label>

            <input
              type="url"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="Enter URL"
              value={formData.hyperlink}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hyperlink: e.target.value,
                }))
              }
            />
          </div>
        </div>

        {/* Attachments */}
        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded">
            Attachments
          </h3>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Add Files
            </label>
            <div className="relative">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors text-gray-700"
              >
                <FileUp size={18} />
                <span>Choose files or drag & drop here</span>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {formData.attachments.length} file(s) selected
                </p>
                <div className="space-y-2">
                  {formData.attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 bg-sky-50 rounded-lg border border-sky-100"
                    >
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !isFormValid()}
          className={`w-full py-4 px-6 text-white text-lg font-semibold rounded-xl shadow-md transition-colors ${
            loading || !isFormValid()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-sky-600 hover:bg-sky-700"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </div>
          ) : (
            "Submit Request"
          )}
        </button>
      </form>
    </div>
  );
};

export default RequestForm;
