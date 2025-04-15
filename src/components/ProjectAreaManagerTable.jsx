import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Search, Building, User, Loader2 } from "lucide-react";
import { API_BASE_URL } from "../../apiConfig";
import { getStoredTokens } from "../utils/authHandler";

// Project - Area Manager Table Component
const ProjectAreaManagerTable = ({ onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [areaManagerProjects, setAreaManagerProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const tableRef = useRef(null);

  // Fetch data directly in the component
  const fetchAreaManagerProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const { jwtToken } = getStoredTokens();
      const headers = {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      };

      const response = await fetch(
        `${API_BASE_URL}/api/Project/GetAllAreaManagerProject`,
        { headers }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch area manager projects");
      }

      const data = await response.json();
      const areaManagerProjectsList = data[0]?.AreaManagerProjects || [];

      setAreaManagerProjects(areaManagerProjectsList);
      setFilteredData(areaManagerProjectsList);
    } catch (err) {
      setError("Failed to load area manager projects");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAreaManagerProjects();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredData(areaManagerProjects);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = areaManagerProjects.filter((item) => {
      const projectCodeMatches =
        item.ProjectCode?.toLowerCase().includes(lowerCaseSearch);
      const areaManagerMatches =
        item.FullName?.toLowerCase().includes(lowerCaseSearch);
      return projectCodeMatches || areaManagerMatches;
    });

    setFilteredData(filtered);
  }, [searchTerm, areaManagerProjects]);

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
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 size={24} className="text-cyan-600 animate-spin" />
            <span className="ml-2 text-gray-600">
              Loading area manager projects...
            </span>
          </div>
        ) : error ? (
          <div className="text-red-500 p-4 text-center">{error}</div>
        ) : (
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
                    className="px-5 py-3.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    ER Member
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
                {filteredData.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-5 py-4 text-sm text-gray-500 text-center"
                    >
                      {searchTerm
                        ? "No matching projects found"
                        : "No projects found"}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.Id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-gray-900">
                        <div className="flex items-center">
                          <Building size={16} className="mr-2 text-cyan-600" />
                          {item.ProjectCode || "N/A"}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-900">
                        {item.FullName ? (
                          <div className="flex items-center">
                            <User size={16} className="mr-2 text-cyan-600" />
                            {item.FullName}
                          </div>
                        ) : (
                          <span className="text-gray-400 flex items-center">
                            <User size={16} className="mr-2 text-gray-300" />
                            Not assigned
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-900">
                        {item.UserFullName ? (
                          <div className="flex items-center">
                            <User size={16} className="mr-2 text-cyan-600" />
                            {item.UserFullName}
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
                            onClick={() =>
                              onEdit(
                                {
                                  Id: item.ProjectId,
                                  ProjectCode: item.ProjectCode,
                                },
                                item
                              )
                            }
                            className="p-1.5 text-cyan-700 bg-cyan-50 rounded-md hover:bg-cyan-100 transition-colors"
                            title="Edit Area Manager"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectAreaManagerTable;
