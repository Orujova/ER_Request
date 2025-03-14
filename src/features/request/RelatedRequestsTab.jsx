import React from "react";
import { Users, ArrowLeft, ExternalLink } from "lucide-react";

const RelatedRequestsTab = ({
  request,
  childRequests = [],
  handleNavigationToChild,
  navigateToParent,
}) => {
  const hasRelated = request?.parentId || childRequests.length > 0;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-slate-900">
        <Users className="w-5 h-5 text-sky-600" />
        Related Requests
      </h3>

      {request?.parentId && (
        <div className="mb-6">
          <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-800">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-sky-100 text-sky-700">
              P
            </span>
            Parent Request
          </h4>
          <button
            onClick={() => navigateToParent(request.parentId)}
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-left w-full transition-colors bg-sky-50 text-slate-800 border border-sky-200 hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>Request #{request.parentId}</span>
          </button>
        </div>
      )}

      {childRequests.length > 0 && (
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2 text-slate-800">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs bg-emerald-100 text-emerald-700">
              C
            </span>
            Child Requests ({childRequests.length})
          </h4>
          <div className="space-y-3">
            {childRequests.map((child) => (
              <button
                key={`child-${child.Id}`}
                onClick={() => handleNavigationToChild(child.Id)}
                className="inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left w-full transition-colors bg-slate-50 text-slate-800 border border-slate-200 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <div>
                  <span className="font-medium text-slate-800">
                    Request #{child.Id}
                  </span>
                  <p className="text-sm mt-1 text-slate-500">
                    {child.EmployeeFullName}
                  </p>
                  <p className="text-xs mt-0.5 text-slate-500">
                    {child.SubCaseDescription}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      )}

      {!hasRelated && (
        <div className="text-center py-10 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 transition-all hover:bg-slate-100">
          <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>No related requests found</p>
        </div>
      )}
    </div>
  );
};

export default RelatedRequestsTab;
