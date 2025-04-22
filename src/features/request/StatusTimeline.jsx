import React from "react";
import { Clock, CheckCircle, AlertCircle, Mail, Users } from "lucide-react";

const StatusTimeline = ({ request }) => {
  if (!request) return null;

  // Define the base statuses
  const baseStatuses = [
    {
      id: 0,
      name: "Pending",
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      progressColor: "bg-amber-500",
      date: request.pendingDate,
    },
    {
      id: 1,
      name: "Under Review",
      icon: AlertCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      progressColor: "bg-blue-500",
      date: request.underReviewDate,
    },
    {
      id: 2,
      name: "Decision Made",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      progressColor: "bg-green-500",
      date: request.decisionMadeDate,
    },
    {
      id: 4,
      name: "Decision Communicated",
      icon: Mail,
      color: "text-indigo-500",
      bgColor: "bg-indigo-50",
      progressColor: "bg-indigo-500",
      date: request.decisionCommunicatedDate,
    },
    {
      id: 5,
      name: "Completed",
      icon: CheckCircle,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      progressColor: "bg-emerald-500",
      date: request.completedDate,
    },
  ];

  const currentStatus = request.status || 0;

  // Create the final statuses array based on whether the request is reassigned or not
  let statuses;

  if (currentStatus === 3) {
    // If reassigned, replace Pending with Reassigned at the beginning
    statuses = [
      {
        id: 0,
        name: "Reassigned",
        icon: Users,
        color: "text-purple-500",
        bgColor: "bg-purple-50",
        progressColor: "bg-purple-500",
        date: request.reAssignedDate,
      },
      ...baseStatuses.slice(1), // Skip the original "Pending" and include all other statuses
    ];
  } else {
    // If not reassigned, use the original statuses
    statuses = baseStatuses;
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center">
          Request Timeline
          <span className="ml-3 text-sm text-slate-500 font-normal">
            (Request ID: {request.id || "N/A"})
          </span>
        </h3>
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        <div className="flex items-start justify-between relative">
          {/* Horizontal progress line */}
          <div className="absolute left-0 right-0 top-6 h-0.5 bg-slate-200"></div>

          {statuses.map((status, index) => {
            // For reassigned requests, we want to show the correct progress
            const isActive =
              currentStatus === 3
                ? index === 0 ||
                  (request.reassignedProgress &&
                    index <= request.reassignedProgress)
                : currentStatus >= status.id;

            const isLastActive =
              currentStatus === 3
                ? (request.reassignedProgress &&
                    index === request.reassignedProgress) ||
                  index === 0
                : currentStatus === status.id;

            const StatusIcon = status.icon;

            return (
              <div
                key={index}
                className="relative flex flex-col items-center w-1/5 px-2"
              >
                {/* Progress indicator */}
                <div
                  className={`
                    w-6 h-6 rounded-full border-2 flex items-center justify-center mb-3 transition-all duration-300
                    ${
                      isActive
                        ? `${status.bgColor} ${status.color} border-transparent`
                        : "bg-white border-slate-300"
                    }
                  `}
                >
                  <StatusIcon className="w-4 h-4" />
                </div>

                {/* Status content */}
                <div className="text-center">
                  <h4
                    className={`
                      font-semibold text-sm mb-1 transition-colors
                      ${isActive ? "text-slate-900" : "text-slate-500"}
                    `}
                  >
                    {status.name}
                  </h4>

                  {isActive && status.date && (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                      {new Date(status.date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {isLastActive && (
                  <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-[200px]">
                    <div className="mt-4 bg-blue-50 border border-blue-100 rounded-lg p-1 text-center">
                      <p className="text-sm text-blue-700">
                        Current active status
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 mt-4">
        <div className="flex justify-between items-center text-sm text-slate-600">
          <span>
            Last Updated:{" "}
            {new Date(request.lastUpdated || Date.now()).toLocaleString()}
          </span>
          <div className="flex items-center space-x-2">
            <span>Status:</span>
            <span className="font-medium text-emerald-600">
              {currentStatus === 3
                ? "Reassigned"
                : statuses.find((s) => currentStatus === s.id)?.name ||
                  "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusTimeline;
