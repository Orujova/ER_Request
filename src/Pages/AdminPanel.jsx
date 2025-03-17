import React, { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";
import Alert from "../components/common/Alert";
import SearchableProjectDropdown from "../components/common/SearchableProjectDropdown";

const { jwtToken } = getStoredTokens();

const AdminPanel = () => {
  // Data states
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);
  const [erMembers, setErMembers] = useState([]);

  // Form states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAreaManager, setSelectedAreaManager] = useState(null);
  const [selectedErMember, setSelectedErMember] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("assign");

  // Fetch all initial data
  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      };

      const [projectsRes, employeesRes, managersRes, erMembersRes] =
        await Promise.all([
          fetch(`${API_BASE_URL}/api/Project`, { headers }),
          fetch(`${API_BASE_URL}/api/Employee`, { headers }),
          fetch(`${API_BASE_URL}/api/Project/GetAllAreaManagerProject`, {
            headers,
          }),
          fetch(`${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`, {
            headers,
          }),
        ]);

      const [projectsData, employeesData, managersData, erMembersData] =
        await Promise.all([
          projectsRes.json(),
          employeesRes.json(),
          managersRes.json(),
          erMembersRes.json(),
        ]);

      setProjects(projectsData[0]?.Projects || []);
      setEmployees(employeesData[0]?.Employees || []);
      setAreaManagers(managersData[0]?.AreaManagerProjects || []);
      setErMembers(erMembersData[0]?.AppUsers || []);
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAreaManagerAssignment = async (e) => {
    e.preventDefault();
    if (!selectedProject || !selectedEmployee) {
      setError("Please select both project and employee");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/Project/AddAreaManagerProjects`,
        {
          method: "POST",
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            EmployeeId: parseInt(selectedEmployee),
            ProjectIds: [parseInt(selectedProject)],
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to assign area manager");

      setSuccess("Area Manager assigned successfully");
      await fetchAllData();
      setSelectedProject(null);
      setSelectedEmployee(null);

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to assign area manager");
    } finally {
      setLoading(false);
    }
  };

  const handleErMemberLink = async (e) => {
    e.preventDefault();
    if (!selectedAreaManager || !selectedErMember) {
      setError("Please select both area manager and ER member");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find the selected manager to get the correct Id (not EmployeeId)
      const selectedManager = areaManagers.find(
        (manager) => String(manager.EmployeeId) === selectedAreaManager
      );

      if (!selectedManager) {
        throw new Error("Selected area manager not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/AdminApplicationUser/UpdateAreaManagerUserLink`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Use the actual Id field from the manager object, not the EmployeeId
            AreaManagerId: parseInt(selectedManager.Id),
            AppUserId: parseInt(selectedErMember),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to link ER member");

      setSuccess("ER Member updated successfully");
      await fetchAllData();
      setSelectedAreaManager(null);
      setSelectedErMember(null);

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to link ER member");
    } finally {
      setLoading(false);
    }
  };

  // Prepare options for select components
  const projectOptions = projects.map(
    (project) => project.ProjectName || "Unnamed Project"
  );

  const employeeOptions = employees.map(
    (employee) => employee.FullName || "Unnamed Employee"
  );

  const managerOptions = areaManagers.map(
    (manager) => manager.FullName || "Unnamed Manager"
  );

  const erMemberOptions = erMembers.map(
    (member) => member.FullName || "Unnamed Member"
  );

  // Function to get ID from name (for SearchableProjectDropdown)
  const getProjectIdByName = (name) => {
    const project = projects.find((p) => p.ProjectName === name);
    return project ? String(project.Id) : null;
  };

  const getEmployeeIdByName = (name) => {
    const employee = employees.find((e) => e.FullName === name);
    return employee ? String(employee.Id) : null;
  };

  const getManagerIdByName = (name) => {
    const manager = areaManagers.find((m) => m.FullName === name);
    return manager ? String(manager.EmployeeId) : null;
  };

  const getErMemberIdByName = (name) => {
    const member = erMembers.find((m) => m.FullName === name);
    return member ? String(member.Id) : null;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 bg-cyan-600">
            <h1 className="text-xl font-semibold text-white">
              Area Manager & ER Member Management
            </h1>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-1 -mb-px">
                <button
                  onClick={() => setActiveTab("assign")}
                  className={`px-5 py-3 text-sm font-medium rounded-t-md transition-colors
                    ${
                      activeTab === "assign"
                        ? "text-cyan-600 border-b-2 border-cyan-500 bg-white"
                        : "text-gray-500 hover:text-cyan-600 hover:bg-gray-50"
                    }`}
                  aria-current={activeTab === "assign" ? "page" : undefined}
                >
                  Assign Area Manager
                </button>
                <button
                  onClick={() => setActiveTab("link")}
                  className={`px-5 py-3 text-sm font-medium rounded-t-md transition-colors
                    ${
                      activeTab === "link"
                        ? "text-cyan-600 border-b-2 border-cyan-500 bg-white"
                        : "text-gray-500 hover:text-cyan-600 hover:bg-gray-50"
                    }`}
                  aria-current={activeTab === "link" ? "page" : undefined}
                >
                  Assign ER Member
                </button>
              </div>
            </div>

            {/* Messages */}
            <Alert
              variant="error"
              message={error}
              onDismiss={() => setError(null)}
            />
            <Alert
              variant="success"
              message={success}
              onDismiss={() => setSuccess("")}
            />

            {/* Forms */}
            {activeTab === "assign" && (
              <form
                onSubmit={handleAreaManagerAssignment}
                className="space-y-6"
              >
                <div className="bg-gray-50 p-5 rounded-md space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
                  <SearchableProjectDropdown
                    label="Select Project"
                    placeholder="Choose a project"
                    options={projectOptions}
                    value={
                      selectedProject
                        ? projects.find(
                            (p) => p.Id === parseInt(selectedProject)
                          )?.ProjectName
                        : null
                    }
                    onChange={(projectName) => {
                      setSelectedProject(
                        projectName ? getProjectIdByName(projectName) : null
                      );
                    }}
                    nullable={true}
                  />
                  <SearchableProjectDropdown
                    label="Select Employee"
                    placeholder="Choose an employee"
                    options={employeeOptions}
                    value={
                      selectedEmployee
                        ? employees.find(
                            (e) => e.Id === parseInt(selectedEmployee)
                          )?.FullName
                        : null
                    }
                    onChange={(employeeName) => {
                      setSelectedEmployee(
                        employeeName ? getEmployeeIdByName(employeeName) : null
                      );
                    }}
                    nullable={true}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading || !selectedProject || !selectedEmployee}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white font-medium
                      bg-cyan-600 hover:bg-cyan-700 focus:ring-1 focus:ring-cyan-500 focus:ring-offset-2
                      transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    Assign Area Manager
                  </button>
                </div>
              </form>
            )}

            {activeTab === "link" && (
              <form onSubmit={handleErMemberLink} className="space-y-6">
                <div className="bg-gray-50 p-5 rounded-md space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
                  <SearchableProjectDropdown
                    label="Select Area Manager"
                    placeholder="Choose an area manager"
                    options={managerOptions}
                    value={
                      selectedAreaManager
                        ? areaManagers.find(
                            (m) => String(m.EmployeeId) === selectedAreaManager
                          )?.FullName
                        : null
                    }
                    onChange={(managerName) => {
                      setSelectedAreaManager(
                        managerName ? getManagerIdByName(managerName) : null
                      );
                    }}
                    nullable={true}
                  />
                  <SearchableProjectDropdown
                    label="Select ER Member"
                    placeholder="Choose an ER member"
                    options={erMemberOptions}
                    value={
                      selectedErMember
                        ? erMembers.find(
                            (m) => String(m.Id) === selectedErMember
                          )?.FullName
                        : null
                    }
                    onChange={(memberName) => {
                      setSelectedErMember(
                        memberName ? getErMemberIdByName(memberName) : null
                      );
                    }}
                    nullable={true}
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      loading || !selectedAreaManager || !selectedErMember
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white font-medium
                      bg-cyan-600 hover:bg-cyan-700 focus:ring-1 focus:ring-cyan-500 focus:ring-offset-2
                      transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    Assign ER Member
                  </button>
                </div>
              </form>
            )}

            {/* Table - Simplified and more scannable */}
            <div className="mt-10">
              <h2 className="text-lg font-medium mb-4 text-gray-800">
                Current Assignments
              </h2>
              <div className="border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Area Manager
                        </th>
                        <th
                          scope="col"
                          className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ER Member
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {areaManagers.length === 0 ? (
                        <tr>
                          <td
                            colSpan="2"
                            className="px-5 py-4 text-sm text-gray-500 text-center"
                          >
                            No assignments found
                          </td>
                        </tr>
                      ) : (
                        areaManagers.map((assignment, index) => (
                          <tr
                            key={assignment.Id || index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-5 py-3.5 text-sm text-gray-900">
                              {assignment.FullName || "N/A"}
                            </td>
                            <td className="px-5 py-3.5 text-sm text-gray-900">
                              {assignment.UserFullName || (
                                <span className="text-gray-400">
                                  Not assigned
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
