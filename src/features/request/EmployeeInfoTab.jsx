import React, { useEffect, useState } from "react";
import { User, BadgeAlert, Building, Briefcase, Users } from "lucide-react";
import InfoCard from "./InfoCard";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

const EmployeeInfoTab = ({ request }) => {
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (request?.employeeInfo?.id) {
      fetchEmployeeDetails(request.employeeInfo.id);
    }
  }, [request]);

  const fetchEmployeeDetails = async (employeeId) => {
    try {
      setIsLoading(true);
      setError(null);

      const { token } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/Employee/${employeeId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "ngrok-skip-browser-warning": "narmin",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching employee details: ${response.status}`);
      }

      const data = await response.json();
      setEmployeeDetails(data);
    } catch (err) {
      console.error("Failed to fetch employee details:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!request || !request.employeeInfo) return null;

  // Use the original employeeInfo and enhance with API data if available
  const { employeeInfo } = request;

  // Merge data, prioritizing API data when available
  const displayData = {
    name: employeeDetails?.FullName || employeeInfo.name,
    id: employeeInfo.id,
    badge: employeeDetails?.Badge || employeeInfo.badge,
    position: employeeDetails?.Position?.Name || employeeInfo.position,
    project: employeeInfo.project,
    projectCode:
      employeeDetails?.Project?.ProjectCode || employeeInfo.projectCode,
    functionalArea: employeeDetails?.Project?.FunctionalArea,
    section: employeeDetails?.Section?.Name || employeeInfo.section,
    subSection: employeeDetails?.SubSection?.Name || employeeInfo.subSection,
    startDate: employeeDetails?.StartedDate,
    contractEndDate: employeeDetails?.ContractEndDate,
    fin: employeeDetails?.FIN,
    imageUrl: employeeDetails?.ImageUrl,
  };

  return (
    <div className="space-y-5">
      {/* Employee Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-sky-100 text-sky-700">
          {displayData.name ? displayData.name.charAt(0) : "E"}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {displayData.name}
          </h3>
          <p className="text-slate-500">
            {displayData.position || "Position not specified"}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 rounded-md border border-rose-200 text-sm">
          <p>Could not fetch complete employee details: {error}</p>
        </div>
      )}

      {/* Employee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          label="Badge Number"
          value={displayData.badge}
          icon={<BadgeAlert className="w-4 h-4" />}
        />

        <InfoCard
          label="Project Name"
          value={displayData.project}
          icon={<Building className="w-4 h-4" />}
        />

        <InfoCard label="Project Code" value={displayData.projectCode} />

        {displayData.functionalArea && (
          <InfoCard
            label="Functional Area"
            value={displayData.functionalArea}
          />
        )}

        <InfoCard
          label="Position"
          value={displayData.position}
          icon={<Briefcase className="w-4 h-4" />}
        />

        {displayData.section && (
          <InfoCard
            label="Section"
            value={displayData.section}
            icon={<Users className="w-4 h-4" />}
          />
        )}

        {displayData.subSection && (
          <InfoCard label="Sub-Section" value={displayData.subSection} />
        )}
      </div>
    </div>
  );
};

export default EmployeeInfoTab;
