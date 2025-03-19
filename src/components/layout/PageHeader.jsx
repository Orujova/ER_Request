import React from "react";
import { ArrowLeft, Clock, Eye, Calendar, AlertCircle } from "lucide-react";

const Header = ({ id, request, navigateToDetail }) => {
  // Enum-based status mapping
  const getStatusFromCode = (statusCode) => {
    const statusMapping = {
      0: "Pending",
      1: "Under Review",
      2: "Decision Made",
      3: "ReAssigned",
      4: "Decision Communicated",
      5: "Completed",
    };
    return statusMapping[statusCode] || "Unknown";
  };

  const getStatusBadgeColor = (status) => {
    const statusColors = {
      Pending: {
        bg: "bg-slate-50 text-slate-700 border-slate-200",
        icon: "text-slate-500",
      },
      ReAssigned: {
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        icon: "text-amber-500",
      },
      "Under Review": {
        bg: "bg-sky-50 text-sky-700 border-sky-200",
        icon: "text-sky-500",
      },
      "Decision Made": {
        bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
        icon: "text-indigo-500",
      },
      "Decision Communicated": {
        bg: "bg-blue-50 text-blue-700 border-blue-200",
        icon: "text-blue-500",
      },
      Completed: {
        bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: "text-emerald-500",
      },
      Canceled: {
        bg: "bg-red-50 text-red-700 border-red-200",
        icon: "text-red-500",
      },
      Unknown: {
        bg: "bg-slate-100 text-slate-700 border-slate-200",
        icon: "text-slate-500",
      },
    };

    return statusColors[status] || statusColors.Unknown;
  };

  // Check if the request is canceled
  const isRequestCanceled = (req) => {
    if (!req) return false;
    return req.IsCanceled === true || req.isCanceled === true;
  };

  // Calculate relative time
  const calculateRelativeTime = (dateString) => {
    if (!dateString) return "recently";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    }
    if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    }

    return new Date(dateString).toLocaleDateString();
  };

  // Format date in a friendly format
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Determine the status
  const statusCode =
    typeof request?.status === "number"
      ? request.status
      : typeof request?.ERRequestStatus === "number"
      ? request.ERRequestStatus
      : null;

  const status =
    statusCode !== null
      ? getStatusFromCode(statusCode)
      : request?.status || request?.ERRequestStatus || "Unknown";

  const statusInfo = getStatusBadgeColor(status);

  // Calculate time since creation
  const timeSinceCreation = calculateRelativeTime(
    request?.createdDate || request?.CreatedDate
  );
  const formattedCreationDate = formatDate(
    request?.createdDate || request?.CreatedDate
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-800">Request #{id}</h1>
            {isRequestCanceled(request) ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border bg-red-50 text-red-700 border-red-200">
                Canceled
              </span>
            ) : (
              status && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.bg}`}
                >
                  {status}
                </span>
              )
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 text-slate-500 text-sm">
            <div className="flex items-center">
              <Clock size={16} className={`mr-2 ${statusInfo.icon}`} />
              <span>Created {timeSinceCreation}</span>
            </div>

            {formattedCreationDate && (
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-slate-400" />
                <span>{formattedCreationDate}</span>
              </div>
            )}

            {request?.parentId && (
              <div className="flex items-center text-slate-500">
                <AlertCircle size={16} className="mr-2 text-amber-500" />
                <span className="text-amber-600">
                  Child request (Parent ID: {request.parentId})
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
            onClick={navigateToDetail}
          >
            <ArrowLeft size={16} />
            Back to Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;
