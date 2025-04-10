import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Search, Building, User } from "lucide-react";

// Project - Area Manager Table Component
const ProjectAreaManagerTable = ({ projects, areaManagers, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProjects, setFilteredProjects] = useState(projects);
  const tableRef = useRef(null);

  useEffect(() => {
    setFilteredProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = projects.filter((project) => {
      const projectCodeMatches =
        project.ProjectCode?.toLowerCase().includes(lowerCaseSearch);
      const areaManagerMatches =
        project.AreaManager?.toLowerCase().includes(lowerCaseSearch);
      return projectCodeMatches || areaManagerMatches;
    });

    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          Project - Area Manager Assignments
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Search by project code or manager..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden">
        <div ref={tableRef} className="overflow-x-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Project Code
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Area Manager
                </th>
                <th
                  scope="col"
                  className="px-5 py-3.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-5 py-4 text-sm text-gray-500 text-center"
                  >
                    {searchTerm
                      ? "No matching projects found"
                      : "No projects found"}
                  </td>
                </tr>
              ) : (
                filteredProjects.map((project, index) => (
                  <tr
                    key={project.Id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      <div className="flex items-center">
                        <Building size={16} className="mr-2 text-cyan-600" />
                        {project.ProjectCode || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      {project.AreaManager ? (
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-cyan-600" />
                          {project.AreaManager}
                        </div>
                      ) : (
                        <span className="text-gray-400 flex items-center">
                          <User size={16} className="mr-2 text-gray-300" />
                          Not assigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const manager = areaManagers.find(
                              (m) => m.FullName === project.AreaManager
                            );
                            onEdit(project, manager);
                          }}
                          className="p-1.5 text-cyan-700 bg-cyan-50 rounded-md hover:bg-cyan-100 transition-colors"
                          title={
                            project.AreaManager
                              ? "Edit Area Manager"
                              : "Assign Area Manager"
                          }
                        >
                          {project.AreaManager ? (
                            <Edit size={16} />
                          ) : (
                            <Plus size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProjectAreaManagerTable;
