import React from "react";
import { User, BadgeAlert, Building, BriefcaseIcon, Users } from "lucide-react";
import InfoCard from "./InfoCard";

const EmployeeInfoTab = ({ request }) => {
  if (!request || !request.employeeInfo) return null;

  const { employeeInfo } = request;

  return (
    <div className="space-y-5">
      {/* Employee Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold bg-sky-100 text-sky-700">
          {employeeInfo.name ? employeeInfo.name.charAt(0) : "E"}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {employeeInfo.name}
          </h3>
          <p className="text-slate-500">
            {employeeInfo.position || "Position not specified"}
          </p>
        </div>
      </div>

      {/* Employee Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          label="Employee ID"
          value={employeeInfo.id}
          icon={<User className="w-4 h-4" />}
        />

        <InfoCard
          label="Badge Number"
          value={employeeInfo.badge}
          icon={<BadgeAlert className="w-4 h-4" />}
        />

        <InfoCard
          label="Project Name"
          value={employeeInfo.project}
          icon={<Building className="w-4 h-4" />}
          theme="primary"
        />

        <InfoCard label="Project Code" value={employeeInfo.projectCode} />

        <InfoCard
          label="Position"
          value={employeeInfo.position}
          icon={<BriefcaseIcon className="w-4 h-4" />}
        />

        {employeeInfo.section && (
          <InfoCard
            label="Section"
            value={employeeInfo.section}
            icon={<Users className="w-4 h-4" />}
          />
        )}

        {employeeInfo.subSection && (
          <InfoCard label="Sub-Section" value={employeeInfo.subSection} />
        )}
      </div>
    </div>
  );
};

export default EmployeeInfoTab;
