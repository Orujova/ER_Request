import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Search, X, User } from "lucide-react";

// Area Manager - ER Member Table Component
const AreaManagerErMemberTable = ({ areaManagers, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredManagers, setFilteredManagers] = useState(areaManagers);
  const tableRef = useRef(null);

  useEffect(() => {
    setFilteredManagers(areaManagers);
  }, [areaManagers]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredManagers(areaManagers);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = areaManagers.filter((manager) => {
      const managerMatches =
        manager.FullName?.toLowerCase().includes(lowerCaseSearch);
      const erMemberMatches =
        manager.UserFullName?.toLowerCase().includes(lowerCaseSearch);
      return managerMatches || erMemberMatches;
    });

    setFilteredManagers(filtered);
  }, [searchTerm, areaManagers]);

  return (
    <div className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-800">
          Area Manager - ER Member Assignments
        </h2>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-cyan-500 focus:border-cyan-500"
            placeholder="Search by name..."
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
              {filteredManagers.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-5 py-4 text-sm text-gray-500 text-center"
                  >
                    {searchTerm
                      ? "No matching assignments found"
                      : "No assignments found"}
                  </td>
                </tr>
              ) : (
                filteredManagers.map((manager, index) => (
                  <tr
                    key={manager.Id || index}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      <div className="flex items-center">
                        <User size={16} className="mr-2 text-cyan-600" />
                        {manager.FullName || "N/A"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-900">
                      {manager.UserFullName ? (
                        <div className="flex items-center">
                          <User size={16} className="mr-2 text-cyan-600" />
                          {manager.UserFullName}
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
                          onClick={() => onEdit(manager)}
                          className="p-1.5 text-cyan-700 bg-cyan-50 rounded-md hover:bg-cyan-100 transition-colors"
                          title={
                            manager.UserFullName
                              ? "Edit ER Member"
                              : "Assign ER Member"
                          }
                        >
                          {manager.UserFullName ? (
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

export default AreaManagerErMemberTable;
