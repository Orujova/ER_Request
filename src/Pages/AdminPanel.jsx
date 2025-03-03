import React, { useState, useEffect } from "react";
import { Plus, Loader2, Link } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";
import Alert from "../components/common/Alert";
import SearchableSelect from "../components/common/SearchableSelect";

const { jwtToken } = getStoredTokens();

const AdminPanel = () => {
  // Data states
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);
  const [erMembers, setErMembers] = useState([]);

  // Form states
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedAreaManager, setSelectedAreaManager] = useState("");
  const [selectedErMember, setSelectedErMember] = useState("");

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
      setSelectedProject("");
      setSelectedEmployee("");

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
      setSelectedAreaManager("");
      setSelectedErMember("");

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to link ER member");
    } finally {
      setLoading(false);
    }
  };

  // Prepare options for select components
  const projectOptions = projects.map((project) => ({
    id: project.Id,
    name: project.ProjectName || "Unnamed Project",
  }));

  const employeeOptions = employees.map((employee) => ({
    id: employee.Id,
    name: employee.FullName || "Unnamed Employee",
  }));

  const managerOptions = areaManagers.map((manager) => ({
    id: manager.EmployeeId,
    name: manager.FullName || "Unnamed Manager",
  }));

  const erMemberOptions = erMembers.map((member) => ({
    id: member.Id,
    name: member.FullName || "Unnamed Member",
  }));

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
                  Assing ER Member
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
                  <SearchableSelect
                    label="Select Project"
                    value={selectedProject}
                    onChange={setSelectedProject}
                    options={projectOptions}
                    placeholder="Choose a project"
                    disabled={loading}
                  />
                  <SearchableSelect
                    label="Select Employee"
                    value={selectedEmployee}
                    onChange={setSelectedEmployee}
                    options={employeeOptions}
                    placeholder="Choose an employee"
                    disabled={loading}
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
                  <SearchableSelect
                    label="Select Area Manager"
                    value={selectedAreaManager}
                    onChange={setSelectedAreaManager}
                    options={managerOptions}
                    placeholder="Choose an area manager"
                    disabled={loading}
                  />
                  <SearchableSelect
                    label="Select ER Member"
                    value={selectedErMember}
                    onChange={setSelectedErMember}
                    options={erMemberOptions}
                    placeholder="Choose an ER member"
                    disabled={loading}
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
