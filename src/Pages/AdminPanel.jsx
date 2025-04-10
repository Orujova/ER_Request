import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Loader2,
  Edit,
  Search,
  X,
  Check,
  Building,
  User,
} from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";
import Alert from "../components/common/Alert";
import SearchableProjectDropdown from "../components/common/SearchableProjectDropdown";
import ProjectAreaManagerTable from "../components/ProjectAreaManagerTable";
import AreaManagerErMemberTable from "../components/AreaManagerErMemberTable";

const AdminPanel = () => {
  // Data states
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);
  const [erMembers, setErMembers] = useState([]);
  const [areaManagerProjects, setAreaManagerProjects] = useState({});

  // Form states
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAreaManager, setSelectedAreaManager] = useState(null);
  const [selectedErMember, setSelectedErMember] = useState(null);

  // Edit states
  const [editMode, setEditMode] = useState(false);
  const [editingAreaManager, setEditingAreaManager] = useState(null);
  const [editingErMember, setEditingErMember] = useState(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("assign");

  const { jwtToken } = getStoredTokens();

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

      const projectsList = projectsData[0]?.Projects || [];
      const employeesList = employeesData[0]?.Employees || [];
      const areaManagersList = managersData[0]?.AreaManagerProjects || [];
      const erMembersList = erMembersData[0]?.AppUsers || [];

      setProjects(projectsList);
      setEmployees(employeesList);
      setAreaManagers(areaManagersList);
      setErMembers(erMembersList);

      // Map area managers to their assigned projects
      const projectsByManager = {};

      // First, create a map from area manager name to EmployeeId
      const managerNameToId = {};
      areaManagersList.forEach((manager) => {
        if (manager.FullName) {
          managerNameToId[manager.FullName] = manager.EmployeeId;
        }
      });

      // Then, assign projects to corresponding area managers
      projectsList.forEach((project) => {
        if (project.AreaManager) {
          const managerId = managerNameToId[project.AreaManager];
          if (managerId) {
            if (!projectsByManager[managerId]) {
              projectsByManager[managerId] = [];
            }
            projectsByManager[managerId].push(project);
          }
        }
      });

      setAreaManagerProjects(projectsByManager);
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

  const handleUpdateAreaManager = async (e) => {
    e.preventDefault();
    if (!editingAreaManager || !selectedEmployee) {
      setError("Please select both area manager and new employee");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get the current area manager
      const selectedManager = areaManagers.find(
        (manager) => manager.Id === editingAreaManager
      );

      if (!selectedManager) {
        throw new Error("Selected area manager not found");
      }

      // Get the project IDs associated with this area manager
      const managerProjects =
        areaManagerProjects[selectedManager.EmployeeId] || [];
      const projectIds = managerProjects.map((project) => project.Id);

      // If no projects are found, use the selected project or a default
      const finalProjectIds =
        projectIds.length > 0
          ? projectIds
          : selectedProject
          ? [parseInt(selectedProject)]
          : [];

      // Ensure we have at least one project ID
      if (finalProjectIds.length === 0) {
        throw new Error("No projects found for this area manager");
      }

      const response = await fetch(
        `${API_BASE_URL}/api/Project/UpdateAreaManagerProjects`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Id: editingAreaManager,
            EmployeeId: parseInt(selectedEmployee),
            ProjectIds: finalProjectIds,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update area manager");

      setSuccess("Area Manager updated successfully");
      await fetchAllData();
      setEditMode(false);
      setEditingAreaManager(null);
      setSelectedEmployee(null);

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update area manager");
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
      setSelectedAreaManager(null);
      setSelectedErMember(null);
      setEditMode(false);
      setEditingErMember(null);

      // Auto-dismiss success message after 3 seconds
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to link ER member");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAreaManager = (areaManager) => {
    setEditMode(true);
    setEditingAreaManager(areaManager.Id);
    // Pre-select the current employee
    const employee = employees.find((e) => e.Id === areaManager.EmployeeId);
    setSelectedEmployee(employee ? String(employee.Id) : null);

    // Get the associated projects
    const projects = areaManagerProjects[areaManager.EmployeeId] || [];
    if (projects.length > 0) {
      setSelectedProject(String(projects[0].Id));
    }

    setActiveTab("assign");
  };

  const handleEditErMember = (areaManager) => {
    setEditMode(true);
    setEditingErMember(areaManager.Id);
    setSelectedAreaManager(String(areaManager.EmployeeId));
    // Pre-select the current ER member
    setSelectedErMember(
      areaManager.AppUserId ? String(areaManager.AppUserId) : null
    );
    setActiveTab("link");
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingAreaManager(null);
    setEditingErMember(null);
    setSelectedEmployee(null);
    setSelectedAreaManager(null);
    setSelectedErMember(null);
  };

  // Prepare options for select components
  const projectOptions = projects.map(
    (project) => project.ProjectCode || "Unnamed Project"
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
    const project = projects.find((p) => p.ProjectCode === name);
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
                  onClick={() => {
                    setActiveTab("assign");
                    if (editMode && editingErMember) {
                      cancelEdit();
                    }
                  }}
                  className={`px-5 py-3 text-sm font-medium rounded-t-md transition-colors
                    ${
                      activeTab === "assign"
                        ? "text-cyan-600 border-b-2 border-cyan-500 bg-white"
                        : "text-gray-500 hover:text-cyan-600 hover:bg-gray-50"
                    }`}
                  aria-current={activeTab === "assign" ? "page" : undefined}
                >
                  {editMode && editingAreaManager
                    ? "Edit Area Manager"
                    : "Assign Area Manager"}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("link");
                    if (editMode && editingAreaManager) {
                      cancelEdit();
                    }
                  }}
                  className={`px-5 py-3 text-sm font-medium rounded-t-md transition-colors
                    ${
                      activeTab === "link"
                        ? "text-cyan-600 border-b-2 border-cyan-500 bg-white"
                        : "text-gray-500 hover:text-cyan-600 hover:bg-gray-50"
                    }`}
                  aria-current={activeTab === "link" ? "page" : undefined}
                >
                  {editMode && editingErMember
                    ? "Edit ER Member"
                    : "Assign ER Member"}
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
                onSubmit={
                  editMode
                    ? handleUpdateAreaManager
                    : handleAreaManagerAssignment
                }
                className="space-y-6"
              >
                <div className="bg-gray-50 p-5 rounded-md space-y-5">
                  <div className="md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
                    {!editMode && (
                      <SearchableProjectDropdown
                        label="Select Project"
                        placeholder="Choose a project"
                        options={projectOptions}
                        value={
                          selectedProject
                            ? projects.find(
                                (p) => p.Id === parseInt(selectedProject)
                              )?.ProjectCode
                            : null
                        }
                        onChange={(projectCode) => {
                          setSelectedProject(
                            projectCode ? getProjectIdByName(projectCode) : null
                          );
                        }}
                        nullable={true}
                      />
                    )}

                    <SearchableProjectDropdown
                      label={
                        editMode
                          ? "Select New Area Manager"
                          : "Select Area Manager"
                      }
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
                          employeeName
                            ? getEmployeeIdByName(employeeName)
                            : null
                        );
                      }}
                      nullable={true}
                    />
                  </div>

                  {editMode && editingAreaManager && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-2">
                        Current Assigned Projects:
                      </h3>
                      <div className="bg-white p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                        {areaManagerProjects[
                          areaManagers.find((m) => m.Id === editingAreaManager)
                            ?.EmployeeId
                        ]?.length > 0 ? (
                          <div className="grid gap-2">
                            {areaManagerProjects[
                              areaManagers.find(
                                (m) => m.Id === editingAreaManager
                              )?.EmployeeId
                            ].map((project, idx) => (
                              <div
                                key={idx}
                                className="flex items-center text-sm"
                              >
                                <Building
                                  size={14}
                                  className="mr-1.5 text-cyan-600 flex-shrink-0"
                                />
                                <span className="font-medium">
                                  {project.ProjectCode}:
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">
                            No projects currently assigned
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Note: These projects will remain assigned after update
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3">
                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-md text-gray-700 font-medium
                        bg-gray-200 hover:bg-gray-300 focus:ring-1 focus:ring-gray-300 focus:ring-offset-2
                        transition-colors"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      (!selectedProject && !editMode) ||
                      !selectedEmployee
                    }
                    className="flex items-center gap-2 px-5 py-2.5 rounded-md text-white font-medium
                      bg-cyan-600 hover:bg-cyan-700 focus:ring-1 focus:ring-cyan-500 focus:ring-offset-2
                      transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : editMode ? (
                      <Check size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    {editMode ? "Update Area Manager" : "Assign Area Manager"}
                  </button>
                </div>
              </form>
            )}

            {/* Form for ER Member tab */}
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
                    disabled={editMode}
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

                <div className="flex justify-end gap-3">
                  {editMode && (
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-md text-gray-700 font-medium
                        bg-gray-200 hover:bg-gray-300 focus:ring-1 focus:ring-gray-300 focus:ring-offset-2
                        transition-colors"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  )}

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
                    ) : editMode ? (
                      <Check size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    {editMode ? "Update ER Member" : "Assign ER Member"}
                  </button>
                </div>
              </form>
            )}

            {/* Tables based on active tab */}
            {activeTab === "assign" && (
              <ProjectAreaManagerTable
                projects={projects}
                areaManagers={areaManagers}
                onEdit={(project, manager) => {
                  setSelectedProject(String(project.Id));
                  if (manager) {
                    handleEditAreaManager(manager);
                  } else {
                    setEditMode(false);
                  }
                }}
              />
            )}

            {activeTab === "link" && (
              <AreaManagerErMemberTable
                areaManagers={areaManagers}
                onEdit={(manager) => handleEditErMember(manager)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
