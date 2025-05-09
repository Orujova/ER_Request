import React from "react";
import { Clock, User, ArrowLeft, ExternalLink } from "lucide-react";
import StatusBadge from "../../components/common/StatusBadge";
import { formatDate } from "../../utils/dateFormatters";
import { ROLES, hasRole } from "../../utils/roles";

const RequestHeader = ({ id, request, handleGoBack, navigateToAction }) => {
  // Check if request is null or undefined
  if (!request) {
    return (
      <div className="bg-white rounded-xl mb-6 overflow-hidden shadow-sm border border-slate-200">
        <div className="p-5 md:p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-900">Request #{id}</h1>
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors bg-white text-slate-700 border border-slate-300 hover:bg-slate-50"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }
  const isRegularUser = hasRole(ROLES.USER);

  return (
    <div className="bg-white rounded-xl mb-6 overflow-hidden shadow-sm border border-slate-200">
      <div className="p-5 md:p-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Request ID and Status */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full lg:w-auto">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                Request #{id}
                {request?.parentId && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    Child Request
                  </span>
                )}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 mt-1">
                <div className="text-sm flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created {formatDate(request?.createdDate)}</span>
                </div>
                <div className="flex items-center sm:ml-2">
                  <span className="text-sm font-semibold bg-cyan-50 text-cyan-700 px-2 py-0.5 rounded-md border border-cyan-100">
                    by {request?.UserFullName || "Unknown User"}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-10 w-px mx-2 hidden md:block bg-slate-200"></div>

            <div>
              <StatusBadge statusCode={request?.status} />
            </div>

            <div className="h-10 w-px mx-2 hidden md:block bg-slate-200"></div>

            <div>
              <div className="text-sm font-medium flex items-center gap-1.5 text-slate-700">
                <User className="w-4 h-4 text-cyan-600" />
                <span>{request?.erMember || "Unassigned"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
            <button
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors w-full lg:w-auto bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
              onClick={handleGoBack}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {!isRegularUser && (
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors w-full lg:w-auto bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:outline-none"
                style={{ backgroundColor: "#0891b2" }}
                onClick={navigateToAction}
              >
                <ExternalLink className="w-4 h-4" />
                Go to Action
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestHeader;
