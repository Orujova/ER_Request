import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  Send,
  Paperclip,
  Link2,
  Mail,
  Copy,
  Check,
  X,
  ArrowLeft,
  Users,
} from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

function RequestAction() {
  const { id } = useParams();
  const navigate = useNavigate();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEmployeeSearch, setShowEmployeeSearch] = useState(false);

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

        // No need to fetch disciplinary actions yet (will fetch based on selected result)

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch disciplinary actions when action result changes
  useEffect(() => {
    const fetchDisciplinaryActions = async () => {
      if (!formData.DisciplinaryActionResultId) return;

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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDisciplinaryActions();
  }, [formData.DisciplinaryActionResultId]);

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
      }, 3000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (newStatus) => {
    try {
      setLoading(true);
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
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "IsEligible") {
      setIsEligible(checked);
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

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequest`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
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
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating request: ${response.status}`);
      }

      setSuccess("Request updated successfully.");
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Handle employee search for copy to other employees
  const handleSearchEmployee = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
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
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // Add employee to child requests
  const addEmployeeToChildRequests = (employee) => {
    // Check if employee is already added
    if (childRequests.some((req) => req.EmployeeId === employee.Id)) {
      setError("This employee has already been added to the list.");
      return;
    }

    setChildRequests([
      ...childRequests,
      {
        EmployeeId: employee.Id,
        CaseId: request?.caseId || 0,
        SubCaseId: request?.subCaseId || 0,
        EmployeeName: employee.FullName,
        Badge: employee.Badge,
        Position: employee.Position?.Name || "",
        Department: employee.Section?.Name || "",
      },
    ]);
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
      setChildRequests([]);
      setEmployees([]);
      setSearchTerm("");
      setShowEmployeeSearch(false);
      setLoading(false);

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const navigateToDetail = () => {
    navigate(`/request/${id}`);
  };

  if (loading && !error && !success) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">
            Request #{id} - Action
          </h1>
          {request && (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${
                request.status === "Pending"
                  ? "bg-gray-100 text-gray-800"
                  : request.status === "Under Review"
                  ? "bg-amber-100 text-amber-800"
                  : request.status === "Decision Made"
                  ? "bg-blue-100 text-blue-800"
                  : request.status === "Order Created"
                  ? "bg-purple-100 text-purple-800"
                  : request.status === "Completed"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {request.status}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
            onClick={navigateToDetail}
          >
            <ArrowLeft size={16} />
            Back to Request
          </button>
          <button className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
            <Mail size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Success and Error Messages */}
      {error && (
        <div
          className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
          role="alert"
        >
          <p>{error}</p>
          <button
            className="float-right text-red-700"
            onClick={() => setError(null)}
          >
            &times;
          </button>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
          role="alert"
        >
          <p>{success}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          {/* ER Member Selection */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-5">ER Member Assignment</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign ER Member
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

          {/* Request Update Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow p-6 mb-6"
          >
            <h3 className="text-lg font-semibold mb-5">Update Request</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplinary Violation
                </label>
                <select
                  name="DisciplinaryViolationId"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplinary Action Result
                </label>
                <select
                  name="DisciplinaryActionResultId"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Disciplinary Action
                </label>
                <select
                  name="DisciplinaryActionId"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason
                </label>
                <textarea
                  name="Reason"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter reason..."
                  value={formData.Reason}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  name="Note"
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter note..."
                  value={formData.Note}
                  onChange={handleChange}
                />
              </div>

              <div className="flex items-center">
                <input
                  id="isEligible"
                  name="IsEligible"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  checked={isEligible}
                  onChange={handleChange}
                />
                <label
                  htmlFor="isEligible"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Is Eligible
                </label>
              </div>

              {isEligible && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contract End Date
                    </label>
                    <input
                      type="date"
                      name="ContractEndDate"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      value={formData.ContractEndDate}
                      onChange={handleChange}
                      required={isEligible}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <input
                      type="text"
                      name="OrderNumber"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="Enter order number..."
                      value={formData.OrderNumber}
                      onChange={handleChange}
                      required={isEligible}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Copy to Other Employees */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold">
                Copy For Other Employees
              </h3>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setShowEmployeeSearch(!showEmployeeSearch)}
              >
                <Users size={16} className="mr-2" />
                {showEmployeeSearch ? "Hide Search" : "Search Employees"}
              </button>
            </div>

            {showEmployeeSearch && (
              <div className="mb-6">
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="Search by badge, name or FIN..."
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSearchEmployee()
                    }
                  />
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleSearchEmployee}
                  >
                    Search
                  </button>
                </div>

                {employees.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Badge
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Position
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Department
                          </th>
                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Add</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {employees.map((employee) => (
                          <tr key={employee.Id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {employee.Badge}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {employee.FullName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {employee.Position?.Name || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {employee.Section?.Name || ""}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                type="button"
                                className="text-blue-600 hover:text-blue-900"
                                onClick={() =>
                                  addEmployeeToChildRequests(employee)
                                }
                              >
                                Add
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : searchTerm ? (
                  <div className="text-gray-500 py-4 text-center">
                    No employees found.
                  </div>
                ) : null}
              </div>
            )}

            {childRequests.length > 0 && (
              <>
                <h4 className="font-medium text-gray-700 mb-3">
                  Selected Employees
                </h4>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Badge
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Position
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Department
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {childRequests.map((req) => (
                        <tr key={req.EmployeeId}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {req.Badge}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {req.EmployeeName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {req.Position}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {req.Department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-900"
                              onClick={() =>
                                removeEmployeeFromChildRequests(req.EmployeeId)
                              }
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={submitChildRequests}
                  >
                    <Copy size={16} className="mr-2" />
                    Create Copy Requests
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Takes 1/3 of the space */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-5">Actions</h3>
            <div className="flex flex-col gap-2">
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleStatusUpdate(1)} // Under Review
              >
                Set Under Review
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleStatusUpdate(2)} // Decision Made
              >
                Set Decision Made
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 bg-white text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                onClick={() => handleStatusUpdate(3)} // Order Created
              >
                Set Order Created
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                onClick={() => handleStatusUpdate(4)} // Completed
              >
                <Check size={16} />
                Mark as Completed
              </button>
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={() => handleStatusUpdate(5)} // Order Canceled
              >
                <X size={16} />
                Cancel Order
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-5">Case Summary</h3>
            {request && (
              <div className="flex flex-col gap-4">
                <div>
                  <div className="font-medium text-gray-500 mb-1">Case</div>
                  <div className="text-gray-900">{request.case}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">Sub Case</div>
                  <div className="text-gray-900">{request.subCase}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">
                    Created Date
                  </div>
                  <div className="text-gray-900">{request.createdDate}</div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">Employee</div>
                  <div className="text-gray-900">
                    {request.employeeInfo?.name}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-gray-500 mb-1">Project</div>
                  <div className="text-gray-900">
                    {request.employeeInfo?.project} (
                    {request.employeeInfo?.projectCode})
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestAction;
