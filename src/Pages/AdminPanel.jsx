import React, { useState, useEffect } from "react";
import * as Select from "@radix-ui/react-select";
import { Plus, Save, Edit, Loader2, Link } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";

const { jwtToken } = getStoredTokens();

const StyledSelect = ({
  label,
  value,
  onChange,
  options = [],
  placeholder,
}) => (
  <div>
    <label className="block text-sm font-semibold mb-2 text-gray-700">
      {label}
    </label>
    <Select.Root value={value || ""} onValueChange={onChange}>
      <Select.Trigger
        className="w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        hover:border-gray-300 transition-colors duration-200"
      >
        <Select.Value placeholder={placeholder} />
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="bg-white rounded-lg shadow-lg border overflow-hidden">
          <Select.Viewport className="p-1">
            {options.map((option) => (
              <Select.Item
                key={option.id}
                value={String(option.id)}
                className="px-4 py-2.5 outline-none cursor-pointer rounded-md
                text-gray-700 hover:bg-blue-50 focus:bg-blue-50 transition-colors duration-150"
              >
                <Select.ItemText>{option.name}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  </div>
);

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
      setEmployees(employeesData || []);
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
      const response = await fetch(
        `${API_BASE_URL}/api/AdminApplicationUser/UpdateAreaManagerUserLink`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            AreaManagerId: parseInt(selectedAreaManager),
            AppUserId: parseInt(selectedErMember),
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to link ER member");

      setSuccess("ER Member linked successfully");
      await fetchAllData();
      setSelectedAreaManager("");
      setSelectedErMember("");
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-blue-600">
          <h1 className="text-2xl font-bold text-white">
            Area Manager & ER Member Management
          </h1>
        </div>

        {/* Main Content */}
        <div className="p-8">
          {/* Tab Navigation */}
          <div className="border-b mb-8">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("assign")}
                className={`px-6 py-3 font-medium rounded-t-lg transition-all duration-200
                  ${
                    activeTab === "assign"
                      ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
              >
                Assign Area Manager
              </button>
              <button
                onClick={() => setActiveTab("link")}
                className={`px-6 py-3 font-medium rounded-t-lg transition-all duration-200
                  ${
                    activeTab === "link"
                      ? "text-blue-600 border-b-2 border-blue-500 bg-white"
                      : "text-gray-500 hover:text-blue-600"
                  }`}
              >
                Change ER Member
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-6 px-6 py-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 px-6 py-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          {/* Forms */}
          {activeTab === "assign" && (
            <form onSubmit={handleAreaManagerAssignment} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                <StyledSelect
                  label="Project"
                  value={selectedProject}
                  onChange={setSelectedProject}
                  options={projectOptions}
                  placeholder="Select Project"
                />
                <StyledSelect
                  label="Employee"
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                  options={employeeOptions}
                  placeholder="Select Employee"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !selectedProject || !selectedEmployee}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
                    transition-all duration-200 transform hover:scale-105
                    ${
                      loading
                        ? "bg-gray-400"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg"
                    }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Plus size={20} />
                  )}
                  Assign Area Manager
                </button>
              </div>
            </form>
          )}

          {activeTab === "link" && (
            <form onSubmit={handleErMemberLink} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-50 rounded-xl">
                <StyledSelect
                  label="Area Manager"
                  value={selectedAreaManager}
                  onChange={setSelectedAreaManager}
                  options={managerOptions}
                  placeholder="Select Area Manager"
                />
                <StyledSelect
                  label="ER Member"
                  value={selectedErMember}
                  onChange={setSelectedErMember}
                  options={erMemberOptions}
                  placeholder="Select ER Member"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    loading || !selectedAreaManager || !selectedErMember
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium
                    transition-all duration-200 transform hover:scale-105
                    ${
                      loading
                        ? "bg-gray-400"
                        : "bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-lg"
                    }`}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Link size={20} />
                  )}
                  Update ER Member
                </button>
              </div>
            </form>
          )}

          {/* Table */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">
              Current Assignments
            </h2>
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      Area Manager
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                      ER Member
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {areaManagers.map((assignment, index) => (
                    <tr
                      key={assignment.Id || index}
                      className={`border-t border-gray-100
                        ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="px-6 py-4">
                        {assignment.FullName || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        {assignment.UserFullName || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
