import React, { useState, useEffect } from "react";
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
  CheckCircle,
} from "lucide-react";
import { getStoredTokens } from "../../utils/authHandler";

const CopyEmployees = ({
  id,
  cases,
  allSubCases,
  existingChildRequests,
  API_BASE_URL,
  setSuccess,
  setError,
  refreshChildRequests,
  showToast,
}) => {
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
  const [expandedSection, setExpandedSection] = useState("new");

  const handleCaseChange = (e) => {
    const caseId = e.target.value;
    setSelectedCase(caseId);
    setFormErrors({ ...formErrors, case: null });

    if (caseId) {
      const filteredSubCases = allSubCases.filter(
        (subCase) => subCase.CaseId === parseInt(caseId)
      );
      setSubCases(filteredSubCases);
    } else {
      setSubCases([]);
    }

    setSelectedSubCase("");
  };

  const handleSubCaseChange = (e) => {
    setSelectedSubCase(e.target.value);
    setFormErrors({ ...formErrors, subCase: null });
  };

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (!searchTerm.trim() || searchTerm.length < 3) {
      setEmployees([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const { jwtToken } = getStoredTokens();

        // Construct query parameters with proper encoding
        const params = new URLSearchParams();
        params.append("Search", searchTerm);
        params.append("Page", "1");
        params.append("ShowMore.Take", "10");

        const response = await fetch(
          `${API_BASE_URL}/api/Employee?${params.toString()}`,
          {
            headers: {
              accept: "*/*",
              Authorization: `Bearer ${jwtToken}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `Error fetching employees: ${response.status} - ${
              errorText || response.statusText
            }`
          );
        }

        const data = await response.json();
        // Adjust based on actual API response structure; assuming data[0].Employees
        const employeeList = data[0]?.Employees || [];
        setEmployees(employeeList);
        setIsSearching(false);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message);
        setIsSearching(false);
      }
    }, 800); // Increased debounce timeout to 800ms

    setSearchTimeout(timer);

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTerm, API_BASE_URL, setError]);

  const validateBeforeAdd = (employee) => {
    const errors = {};

    if (childRequests.some((req) => req.EmployeeId === employee.Id)) {
      errors.employee = "This employee has already been added to the list.";
    }

    if (existingChildRequests.some((req) => req.EmployeeId === employee.Id)) {
      errors.employee =
        "This employee already has a child request for this parent.";
    }

    if (!selectedCase) {
      errors.case = "Please select a Case before adding employees.";
    }

    if (!selectedSubCase) {
      errors.subCase = "Please select a Sub Case before adding employees.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

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

    setEmployees([]);
    setSearchTerm(""); // Clear search term after adding an employee
  };

  const removeEmployeeFromChildRequests = (employeeId) => {
    setChildRequests(
      childRequests.filter((req) => req.EmployeeId !== employeeId)
    );
  };

  const submitChildRequests = async () => {
    if (childRequests.length === 0) {
      setError("No employees selected for child requests.");
      return;
    }

    try {
      setLoading(true);
      const { jwtToken } = getStoredTokens();

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
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error creating child requests: ${response.status} - ${
            errorText || response.statusText
          }`
        );
      }

      setSuccess("Child requests created successfully.");
      if (showToast) {
        showToast("Child requests created successfully.", "success");
      }
      setChildRequests([]);
      setEmployees([]);
      setSearchTerm("");
      setLoading(false);

      setTimeout(() => {
        setSuccess(null);
        refreshChildRequests();
      }, 2000);
    } catch (err) {
      console.error("Submit error:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const navigateToChildDetail = (childId) => {
    window.location.href = `/request/${childId}`;
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div>
      <div className="mb-6">
        <div className="p-5 rounded-lg bg-slate-50 border border-slate-200 mb-6">
          <h3 className="text-md font-medium mb-4 flex items-center text-slate-700">
            <Filter size={16} className="mr-2 text-sky-500" />
            Selection Criteria
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
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
                      formErrors.case ? "text-red-500" : "text-slate-400"
                    }
                  />
                </div>
                <select
                  className={`block w-full rounded-lg border ${
                    formErrors.case
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
                  } bg-white pl-10 pr-4 py-3 text-sm transition-all
                  focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm`}
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
              <label className="block text-sm font-medium text-slate-600 mb-2">
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
                        ? "text-slate-300"
                        : formErrors.subCase
                        ? "text-red-500"
                        : "text-slate-400"
                    }
                  />
                </div>
                <select
                  className={`block w-full rounded-lg border ${
                    formErrors.subCase
                      ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                      : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
                  } bg-white pl-10 pr-4 py-3 text-sm transition-all
                  focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm ${
                    !selectedCase
                      ? "bg-slate-50 text-slate-400 cursor-not-allowed"
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
                  <div className="mt-1 text-xs text-amber-600 flex items-center">
                    <AlertTriangle size={12} className="mr-1" />
                    No sub cases available for this case
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
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
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
                } bg-white pl-10 pr-10 py-3 text-sm transition-all
                focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm`}
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
                    formErrors.employee ? "text-red-500" : "text-slate-400"
                  }
                />
              </div>
              {isSearching ? (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader size={16} className="animate-spin text-sky-500" />
                </div>
              ) : (
                searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
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
            <div className="mt-1 text-xs text-slate-500 flex items-center">
              <Info size={12} className="mr-1 text-sky-500" />
              Start typing to search employees automatically (minimum 3
              characters)
            </div>
          </div>
        </div>

        {employees.length > 0 && (
          <div className="rounded-lg border border-slate-200 overflow-hidden mb-6 shadow-sm">
            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
              <h4 className="text-sm font-medium text-slate-700 flex items-center">
                <User size={14} className="mr-2 text-sky-500" />
                Search Results ({employees.length})
              </h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {employees.map((employee) => (
                <div
                  key={employee.Id}
                  className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-200 last:border-0 transition-colors"
                >
                  <div className="flex items-center">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sky-50 text-sky-500 mr-3">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="font-medium text-slate-700">
                        {employee.FullName}{" "}
                        <span className="text-slate-500 text-xs">
                          ({employee.Badge})
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">
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
                    className={`inline-flex items-center justify-center p-2 rounded-lg transition-colors ${
                      !selectedCase || !selectedSubCase
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white"
                    }`}
                    onClick={() => addEmployeeToChildRequests(employee)}
                    disabled={!selectedCase || !selectedSubCase}
                    title={
                      !selectedCase || !selectedSubCase
                        ? "Please select both Case and Sub Case first"
                        : "Add employee"
                    }
                  >
                    <PlusCircle size={18} />
                  </button>
                </div>
              ))}
            </div>
            {!selectedCase || !selectedSubCase ? (
              <div className="p-4 text-xs text-amber-600 flex items-center">
                <AlertTriangle size={12} className="mr-1" />
                Please select both a Case and a Sub Case before adding an
                employee
              </div>
            ) : null}
          </div>
        )}

        {existingChildRequests.length > 0 && (
          <div className="mb-6 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("existing")}
              className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 border-b border-slate-200 text-left transition-colors"
            >
              <h4 className="font-medium text-slate-700 flex items-center">
                <Clipboard size={18} className="mr-2 text-sky-500" />
                Existing Child Requests ({existingChildRequests.length})
              </h4>
              <ChevronDown
                size={18}
                className={`text-slate-500 transition-transform duration-200 ${
                  expandedSection === "existing" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {expandedSection === "existing" && (
              <div className="max-h-80 overflow-y-auto">
                {existingChildRequests.map((req) => (
                  <div
                    key={req.Id}
                    className={`flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-200 last:border-0 transition-colors ${
                      hoverChildId === req.Id ? "bg-sky-50" : ""
                    }`}
                    onMouseEnter={() => setHoverChildId(req.Id)}
                    onMouseLeave={() => setHoverChildId(null)}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sky-50 text-sky-500 mr-3">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">
                          {req.EmployeeFullName}{" "}
                          <span className="text-slate-500 text-xs">
                            ({req.EmployeeBadge})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.PositionName}
                          {req.PositionName && req.SectionName && " • "}
                          {req.SectionName}
                        </div>
                        <div className="text-xs text-sky-600 mt-1">
                          {req.CaseName} • {req.SubCaseDescription}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs px-2 py-1 rounded-full bg-sky-50 text-sky-500">
                        Request #{req.Id}
                      </div>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-1.5 rounded-lg bg-sky-50 text-sky-500 hover:bg-sky-500 hover:text-white transition-colors"
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

        {childRequests.length > 0 && (
          <div className="mb-6 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
            <button
              onClick={() => toggleSection("new")}
              className="w-full flex justify-between items-center p-4 bg-sky-50 hover:bg-sky-100 border-b border-sky-100 text-left transition-colors"
            >
              <h4 className="font-medium text-sky-700 flex items-center">
                <Users size={18} className="mr-2 text-sky-600" />
                New Employees to Add ({childRequests.length})
              </h4>
              <ChevronDown
                size={18}
                className={`text-sky-500 transition-transform duration-200 ${
                  expandedSection === "new" ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {expandedSection === "new" && (
              <div className="max-h-80 overflow-y-auto">
                {childRequests.map((req) => (
                  <div
                    key={req.EmployeeId}
                    className="flex justify-between items-center p-3 hover:bg-slate-50 border-b border-slate-200 last:border-0 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-sky-50 text-sky-500 mr-3">
                        <User size={16} />
                      </div>
                      <div>
                        <div className="font-medium text-slate-700">
                          {req.EmployeeName}{" "}
                          <span className="text-slate-500 text-xs">
                            ({req.Badge})
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {req.Position}
                          {req.Position && req.Department && " • "}
                          {req.Department}
                        </div>
                        <div className="text-xs text-sky-600 mt-1">
                          {req.CaseName} • {req.SubCaseName}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
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

        {childRequests.length > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 focus:ring-2 focus:ring-sky-100 focus:outline-none"
              onClick={submitChildRequests}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Create Copy Requests
                </>
              )}
            </button>
          </div>
        )}

        {!isSearching && employees.length === 0 && searchTerm.length > 2 && (
          <div className="p-8 rounded-lg border border-dashed border-slate-200 text-center mb-6 bg-slate-50">
            <User size={48} className="mx-auto mb-2 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-700 mb-1">
              No employees found
            </h3>
            <p className="text-sm text-slate-500">
              Try adjusting your search terms or search criteria
            </p>
          </div>
        )}

        {childRequests.length === 0 &&
          existingChildRequests.length === 0 &&
          !searchTerm && (
            <div className="p-8 rounded-lg border border-dashed border-slate-200 text-center mb-6 bg-slate-50">
              <Users size={48} className="mx-auto mb-2 text-slate-300" />
              <h3 className="text-lg font-medium text-slate-700 mb-1">
                No employees added
              </h3>
              <p className="text-sm text-slate-500">
                Search for employees to create copy requests
              </p>
              <div className="mt-4 flex justify-center">
                <div className="inline-flex items-center text-xs text-sky-600 bg-sky-50 py-2 px-3 rounded-full">
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
