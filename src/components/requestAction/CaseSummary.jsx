import React, { useState } from "react";
import {
  FileText,
  Calendar,
  User,
  Briefcase,
  ClipboardList,
  ChevronDown,
  Building,
  Tag,
  AlertTriangle,
  ChevronRight,
  Info,
} from "lucide-react";

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

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "ReAssigned":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Under Review":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Decision Made":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Decision Communicated":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Canceled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Function to get status text
  const getStatus = (req) => {
    if (!req) return "N/A";

    if (req.isCanceled || req.IsCanceled) {
      return "Canceled";
    }

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

  // Function to get employee badge
  const getEmployeeBadge = (req) => {
    if (!req) return "";
    if (req.employeeInfo?.badge) return req.employeeInfo.badge;
    if (req.employeeBadge) return req.employeeBadge;
    if (req.EmployeeBadge) return req.EmployeeBadge;
    return "";
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

  // Function to get position
  const getPosition = (req) => {
    if (!req) return "N/A";
    if (req.employeeInfo?.position) return req.employeeInfo.position;
    if (req.positionName) return req.positionName;
    if (req.PositionName) return req.PositionName;
    return "N/A";
  };

  // Summary items with icons for better visual hierarchy
  const summaryItems = [
    {
      icon: <ClipboardList size={16} className="text-blue-500" />,
      label: "Case",
      value: getCaseName(request),
    },
    {
      icon: <FileText size={16} className="text-indigo-500" />,
      label: "Sub Case",
      value: getSubCaseName(request),
    },
    {
      icon: <Calendar size={16} className="text-emerald-500" />,
      label: "Created Date",
      value: getCreatedDate(request),
    },
    {
      icon: <User size={16} className="text-amber-500" />,
      label: "Employee",
      value: getEmployeeName(request),
      badge: getEmployeeBadge(request),
    },

    {
      icon: <Building size={16} className="text-purple-500" />,
      label: "Project",
      value: getProject(request),
    },
    {
      icon: <Tag size={16} className="text-rose-500" />,
      label: "Status",
      value: getStatus(request),
      statusColor: getStatusColor(getStatus(request)),
    },
  ];

  // Always show something even if data is missing
  const allDataMissing =
    !request ||
    Object.keys(request).length === 0 ||
    summaryItems.every((item) => item.value === "N/A");

  if (!request || Object.keys(request).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-slate-100">
        <h3 className="text-lg font-semibold mb-5 text-slate-700 flex items-center">
          <FileText size={20} className="mr-2 text-sky-500" />
          Case Summary
        </h3>
        <div className="p-5 rounded-lg bg-slate-50 text-slate-500 text-center border border-dashed border-slate-200">
          <ClipboardList size={30} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-medium">No case information available</p>
        </div>
      </div>
    );
  }

  if (allDataMissing) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-slate-100">
        <h3 className="text-lg font-semibold mb-5 text-slate-700 flex items-center">
          <FileText size={20} className="mr-2 text-sky-500" />
          Case Summary
        </h3>
        <div className="p-5 rounded-lg bg-amber-50 text-amber-700 text-center border border-dashed border-amber-200">
          <AlertTriangle size={30} className="mx-auto mb-3 text-amber-500" />
          <p className="font-medium">Case data is currently unavailable</p>
          <p className="text-sm mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  // Check if request is parent or child
  const isParent =
    request.requestType === "Parent" || request.RequestType === "Parent";
  const isChild = request.parentId || request.ParentId;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-slate-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-slate-700 flex items-center">
          <FileText size={20} className="mr-2 text-sky-500" />
          Case Summary
        </h3>

        {/* Show parent/child badge if applicable */}
        {(isParent || isChild) && (
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              isParent
                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}
          >
            {isParent ? "Parent Request" : "Child Request"}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {summaryItems
          .slice(0, expanded ? summaryItems.length : 4)
          .map((item, index) => (
            <div
              key={index}
              className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="mr-3 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-500 mb-1">
                    {item.label}
                  </div>
                  <div className="flex items-center">
                    {item.label === "Status" ? (
                      <span
                        className={`px-2 py-0.5 text-sm font-medium rounded-md border ${item.statusColor}`}
                      >
                        {item.value}
                      </span>
                    ) : (
                      <div className="text-sm font-medium text-slate-700 truncate">
                        {item.value}
                        {item.badge && (
                          <span className="ml-2 text-xs font-normal text-slate-500">
                            ({item.badge})
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

        {/* Parent Request ID Reference (if this is a child request) */}
        {isChild && (
          <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-100">
            <div className="flex items-center">
              <div className="mr-3 flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-white shadow-sm">
                <Info size={16} className="text-amber-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs text-amber-600 mb-1">
                  Parent Request ID
                </div>
                <div className="flex items-center">
                  <div className="text-sm font-medium text-amber-700">
                    #{request.parentId || request.ParentId}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {summaryItems.length > 4 && (
          <button
            className="flex items-center justify-center w-full mt-2 p-2 text-sm text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
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
