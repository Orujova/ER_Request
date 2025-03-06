import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Search,
  Loader,
  PlusCircle,
  X,
  User,
  Users,
  Clipboard,
  Copy,
  Eye,
  AlertTriangle,
  Info,
  Filter,
  ChevronDown,
} from "lucide-react";
import { getStoredTokens } from "../../utils/authHandler";
import { themeColors } from "../../styles/theme";

const CopyEmployees = ({
  id,
  cases,
  allSubCases,
  existingChildRequests,
  API_BASE_URL,
  setSuccess,
  setError,
  refreshChildRequests,
}) => {
  const navigate = useNavigate();

  // State
  const [employees, setEmployees] = useState([]);
  const [childRequests, setChildRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [subCases, setSubCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState("");
  const [selectedSubCase, setSelectedSubCase] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [hoverChildId, setHoverChildId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);

  // Handle case change
  const handleCaseChange = (e) => {
    const caseId = e.target.value;
    setSelectedCase(caseId);
    setFormErrors({ ...formErrors, case: null });

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
    setFormErrors({ ...formErrors, subCase: null });
  };

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
  }, [searchTerm, API_BASE_URL, setError]);

  // Validate before adding employee
  const validateBeforeAdd = (employee) => {
    const errors = {};

    // Check if employee is already added
    if (childRequests.some((req) => req.EmployeeId === employee.Id)) {
      errors.employee = "This employee has already been added to the list.";
    }

    // Check if employee already exists in existing child requests
    if (existingChildRequests.some((req) => req.EmployeeId === employee.Id)) {
      errors.employee =
        "This employee already has a child request for this parent.";
    }

    // Validate case and subcase selections
    if (!selectedCase) {
      errors.case = "Please select a Case before adding employees.";
    }

    if (!selectedSubCase) {
      errors.subCase = "Please select a Sub Case before adding employees.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add employee to child requests
  const addEmployeeToChildRequests = (employee) => {
    if (!validateBeforeAdd(employee)) {
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

      setSuccess("Child requests created successfully.");
      showToast("Child requests created successfully.", "success");
      setChildRequests([]);
      setEmployees([]);
      setSearchTerm("");
      setLoading(false);

      // Refresh child requests and clear success message after 2 seconds
      setTimeout(() => {
        setSuccess(null);
        refreshChildRequests();
      }, 2000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const navigateToChildDetail = (childId) => {
    navigate(`/request/${childId}`);
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      <div className="mb-6">
        {/* Selection Section */}
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 mb-6">
          <h3 className="text-md font-medium mb-4 flex items-center text-gray-700">
            <Filter size={16} className="mr-2 text-primary" />
            Selection Criteria
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">
                Case
                {formErrors.case && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText
                    size={16}
                    className={
                      formErrors.case ? "text-red-500" : "text-textLight"
                    }
                  />
                </div>
                <select
                  className={`block w-full rounded-lg border ${
                    formErrors.case
                      ? "border-red-300 focus:border-red-500"
                      : "border-border focus:border-primary"
                  } bg-background pl-10 pr-4 py-3 text-sm transition-all
                  focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
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
                {formErrors.case && (
                  <p className="mt-1 text-xs text-red-500">{formErrors.case}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textLight mb-2">
                Sub Case
                {formErrors.subCase && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText
                    size={16}
                    className={
                      !selectedCase
                        ? "text-gray-300"
                        : formErrors.subCase
                        ? "text-red-500"
                        : "text-textLight"
                    }
                  />
                </div>
                <select
                  className={`block w-full rounded-lg border ${
                    formErrors.subCase
                      ? "border-red-300 focus:border-red-500"
                      : "border-border focus:border-primary"
                  } bg-background pl-10 pr-4 py-3 text-sm transition-all
                  focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm ${
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
                {formErrors.subCase && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.subCase}
                  </p>
                )}
                {selectedCase && subCases.length === 0 && (
                  <div className="mt-1 text-xs text-warning flex items-center">
                    <AlertTriangle size={12} className="mr-1 text-amber-500" />
                    No sub cases available for this case
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Employee Search */}
          <div>
            <label className="block text-sm font-medium text-textLight mb-2">
              Search Employee
              {formErrors.employee && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by badge, name or FIN..."
                className={`block w-full rounded-lg border ${
                  formErrors.employee
                    ? "border-red-300 focus:border-red-500"
                    : "border-border focus:border-primary"
                } bg-background pl-10 pr-10 py-3 text-sm transition-all
                focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (formErrors.employee)
                    setFormErrors({ ...formErrors, employee: null });
                }}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search
                  size={16}
                  className={
                    formErrors.employee ? "text-red-500" : "text-textLight"
                  }
                />
              </div>
              {isSearching ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader size={16} className="animate-spin text-primary" />
                </div>
              ) : (
                searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <X size={16} />
                  </button>
                )
              )}
            </div>
            {formErrors.employee && (
              <p className="mt-1 text-xs text-red-500">{formErrors.employee}</p>
            )}
            <div className="mt-1 text-xs text-textLight flex items-center">
              <Info size={12} className="mr-1 text-[#219cba]" />
              Start typing to search employees automatically (minimum 3
              characters)
            </div>
          </div>
        </div>

        {/* Search Results */}
        {employees.length > 0 && (
          <div className="rounded-lg border border-border overflow-hidden mb-6 shadow-sm">
            <div className="bg-gray-50 px-4 py-2 border-b border-border">
              <h4 className="text-sm font-medium text-gray-700 flex items-center">
                <User size={14} className="mr-2 text-primary" />
                Search Results ({employees.length})
              </h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {employees.map((employee) => (
                <div
                  key={employee.Id}
                  className="flex justify-between items-center p-3 hover:bg-secondary border-b border-border last:border-0 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e6f4f7] text-[#0891b2] mr-3">
                      <User size={16} />
                    </div>
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
                    className={`inline-flex items-center justify-center p-2 rounded-lg transition-all ${
                      !selectedCase || !selectedSubCase
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-primaryLight text-primary hover:bg-primary hover:text-white"
                    }`}
                    onClick={() => addEmployeeToChildRequests(employee)}
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

        {/* Existing Child Requests (Collapsible Section) */}
        {existingChildRequests.length > 0 && (
          <div className="mb-6 rounded-lg border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("existing")}
              className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 border-b border-border text-left"
            >
              <h4 className="font-medium text-text flex items-center">
                <Clipboard size={18} className="mr-2 text-primary" />
                Existing Child Requests ({existingChildRequests.length})
              </h4>
              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform duration-200 ${
                  expandedSection === "existing" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {expandedSection === "existing" && (
              <div className="max-h-80 overflow-y-auto">
                {existingChildRequests.map((req) => (
                  <div
                    key={req.Id}
                    className={`flex justify-between items-center p-3 hover:bg-secondary border-b border-border last:border-0 transition-colors ${
                      hoverChildId === req.Id ? "bg-[#e6f4f7]" : ""
                    }`}
                    onMouseEnter={() => setHoverChildId(req.Id)}
                    onMouseLeave={() => setHoverChildId(null)}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e6f4f7] text-[#0891b2] mr-3">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-text">
                          {req.EmployeeFullName}{" "}
                          <span className="text-textLight text-xs">
                            ({req.EmployeeBadge})
                          </span>
                        </div>
                        <div className="text-xs text-textLight">
                          {req.PositionName}
                          {req.PositionName && req.SectionName && " • "}
                          {req.SectionName}
                        </div>
                        <div className="text-xs text-primary mt-1">
                          {req.CaseName} • {req.SubCaseDescription}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs px-2 py-1 rounded-full bg-[#e6f4f7] text-primary">
                        Request #{req.Id}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-primary bg-opacity-10 text-primary hover:bg-opacity-20 transition-all"
                        onClick={() => navigateToChildDetail(req.Id)}
                        title="View details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Child Requests to Add (Collapsible Section) */}
        {childRequests.length > 0 && (
          <div className="mb-6 rounded-lg border border-border overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("new")}
              className="w-full flex justify-between items-center p-4 bg-[#e6f4f7] hover:bg-[#e6f4f7] border-b border-[#cee9f0] text-left"
            >
              <h4 className="font-medium text-[#0783a0] flex items-center">
                <Users size={18} className="mr-2 text-[#0891b2]" />
                New Employees to Add ({childRequests.length})
              </h4>
              <ChevronDown
                size={18}
                className={`text-[#219cba] transition-transform duration-200 ${
                  expandedSection === "new" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {expandedSection === "new" && (
              <div className="max-h-80 overflow-y-auto">
                {childRequests.map((req) => (
                  <div
                    key={req.EmployeeId}
                    className="flex justify-between items-center p-3 hover:bg-secondary border-b border-border last:border-0 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-[#e6f4f7] text-[#0891b2] mr-3">
                        <User size={16} />
                      </div>
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
                        removeEmployeeFromChildRequests(req.EmployeeId)
                      }
                      title="Remove employee"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Submit Button */}
        {childRequests.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70"
              style={{
                background: loading
                  ? "#CBD5E1"
                  : `linear-gradient(to right, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
              }}
              onClick={submitChildRequests}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Copy size={18} className="mr-2" />
                  Create Copy Requests
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && employees.length === 0 && searchTerm.length > 2 && (
          <div className="p-8 rounded-lg border border-dashed border-gray-300 text-center mb-6">
            <User size={48} className="mx-auto mb-2 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-600 mb-1">
              No employees found
            </h3>
            <p className="text-sm text-gray-500">
              Try adjusting your search terms or search criteria
            </p>
          </div>
        )}

        {childRequests.length === 0 &&
          existingChildRequests.length === 0 &&
          !searchTerm && (
            <div className="p-8 rounded-lg border border-dashed border-gray-300 text-center mb-6">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-600 mb-1">
                No employees added
              </h3>
              <p className="text-sm text-gray-500">
                Search for employees to create copy requests
              </p>
              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center text-xs text-primary">
                  <Info size={14} className="mr-1" />
                  Select a Case and Sub Case first, then search for employees
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default CopyEmployees;
