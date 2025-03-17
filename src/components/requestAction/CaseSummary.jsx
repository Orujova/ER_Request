import React, { useState } from "react";
import {
  FileText,
  Calendar,
  User,
  Briefcase,
  ClipboardList,
  ChevronDown,
  MapPin,
  Building,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { themeColors } from "../../styles/theme";

const CaseSummary = ({ request }) => {
  const [expanded, setExpanded] = useState(false);

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Function to convert status code to readable string
  const getStatusFromCode = (statusCode) => {
    switch (statusCode) {
      case 0:
        return "Pending";
      case 1:
        return "Under Review";
      case 2:
        return "Decision Made";
      case 3:
        return "ReAssigned";
      case 4:
        return "Decision Communicated";
      case 5:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // Function to get status text
  const getStatus = (req) => {
    if (!req) return "N/A";

    if (typeof req.status === "number") {
      return getStatusFromCode(req.status);
    }
    if (typeof req.ERRequestStatus === "number") {
      return getStatusFromCode(req.ERRequestStatus);
    }

    return req.status || req.ERRequestStatus || "N/A";
  };

  // Function to get case name
  const getCaseName = (req) => {
    if (!req) return "N/A";
    if (req.case) return req.case;
    if (req.caseName) return req.caseName;
    if (req.CaseName) return req.CaseName;
    return "N/A";
  };

  // Function to get subcase name
  const getSubCaseName = (req) => {
    if (!req) return "N/A";
    if (req.subCase) return req.subCase;
    if (req.subCaseDescription) return req.subCaseDescription;
    if (req.SubCaseDescription) return req.SubCaseDescription;
    return "N/A";
  };

  // Function to get created date
  const getCreatedDate = (req) => {
    if (!req) return "N/A";
    if (req.createdDate) return formatDate(req.createdDate);
    if (req.createdAt) return formatDate(req.createdAt);
    if (req.CreatedDate) return formatDate(req.CreatedDate);
    return "N/A";
  };

  // Function to get employee name
  const getEmployeeName = (req) => {
    if (!req) return "N/A";
    if (req.employeeInfo?.name) return req.employeeInfo.name;
    if (req.employeeFullName) return req.employeeFullName;
    if (req.employeeName) return req.employeeName;
    if (req.EmployeeName) return req.EmployeeName;
    return "N/A";
  };

  // Function to get project
  const getProject = (req) => {
    if (!req) return "N/A";
    if (req.employeeInfo?.project) {
      const code = req.employeeInfo.projectCode
        ? `(${req.employeeInfo.projectCode})`
        : "";
      return `${req.employeeInfo.project} ${code}`.trim();
    }
    if (req.projectName) {
      const code = req.projectCode ? `(${req.projectCode})` : "";
      return `${req.projectName} ${code}`.trim();
    }
    if (req.ProjectName) {
      const code = req.ProjectCode ? `(${req.ProjectCode})` : "";
      return `${req.ProjectName} ${code}`.trim();
    }
    return "N/A";
  };

  // Summary items with icons for better visual hierarchy
  const summaryItems = [
    {
      icon: <FileText size={16} className="text-blue-500" />,
      label: "Case",
      value: getCaseName(request),
    },
    {
      icon: <ClipboardList size={16} className="text-indigo-500" />,
      label: "Sub Case",
      value: getSubCaseName(request),
    },
    {
      icon: <Calendar size={16} className="text-green-500" />,
      label: "Created Date",
      value: getCreatedDate(request),
    },
    {
      icon: <User size={16} className="text-amber-500" />,
      label: "Employee",
      value: getEmployeeName(request),
    },

    {
      icon: <MapPin size={16} className="text-rose-500" />,
      label: "Project",
      value: getProject(request),
    },

    {
      icon: <Clock size={16} className="text-yellow-500" />,
      label: "Status",
      value: getStatus(request),
    },
  ];

  // Always show something even if data is missing
  const allDataMissing =
    !request ||
    Object.keys(request).length === 0 ||
    summaryItems.every((item) => item.value === "N/A");

  if (!request || Object.keys(request).length === 0) {
    return (
      <div
        className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
        style={{ boxShadow: themeColors.cardShadow }}
      >
        <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
          <FileText size={20} className="mr-2 text-primary" />
          Case Summary
        </h3>
        <div className="p-4 rounded-lg bg-secondary text-textLight text-center border border-dashed border-gray-300">
          <ClipboardList size={24} className="mx-auto mb-2 text-gray-400" />
          No case information available
        </div>
      </div>
    );
  }

  if (allDataMissing) {
    return (
      <div
        className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
        style={{ boxShadow: themeColors.cardShadow }}
      >
        <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
          <FileText size={20} className="mr-2 text-primary" />
          Case Summary
        </h3>
        <div className="p-4 rounded-lg bg-amber-50 text-amber-700 text-center border border-dashed border-amber-200">
          <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500" />
          <p className="font-medium">Case data is currently unavailable</p>
          <p className="text-sm mt-1">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
      style={{ boxShadow: themeColors.cardShadow }}
    >
      <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
        <FileText size={20} className="mr-2 text-primary" />
        Case Summary
      </h3>

      <div className="space-y-3">
        {summaryItems
          .slice(0, expanded ? summaryItems.length : 3)
          .map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg bg-secondary hover:bg-secondary-hover transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="mr-3">{item.icon}</div>
                <div>
                  <div className="text-xs text-textLight mb-1">
                    {item.label}
                  </div>
                  <div className="text-sm font-medium text-text">
                    {item.value}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {summaryItems.length > 3 && (
          <button
            className="text-sm text-primary flex items-center justify-center w-full mt-2 hover:underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Show more"}
            <ChevronDown
              size={16}
              className={`ml-1 transition-transform duration-200 ${
                expanded ? "transform rotate-180" : ""
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default CaseSummary;
