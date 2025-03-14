import React from "react";
import {
  BadgeAlert,
  AlertTriangle,
  Calendar,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import InfoCard from "./InfoCard";
import { formatDate } from "../../utils/dateFormatters";

const DisciplinaryTab = ({ request }) => {
  if (!request) return null;

  const hasData =
    request.disciplinaryAction?.name ||
    request.disciplinaryAction?.resultName ||
    request.disciplinaryAction?.violationName ||
    request.contractEndDate ||
    request.isEligible !== undefined ||
    request.note ||
    request.reason;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-slate-900">
        <BadgeAlert className="w-5 h-5 text-amber-600" />
        Disciplinary Actions
      </h3>

      {hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {request.disciplinaryAction?.name && (
            <InfoCard
              label="Action Type"
              value={request.disciplinaryAction.name}
              theme="warning"
              icon={<BadgeAlert className="w-4 h-4" />}
            />
          )}

          {request.disciplinaryAction?.resultName && (
            <InfoCard
              label="Action Result"
              value={request.disciplinaryAction.resultName}
              theme="warning"
              icon={<AlertCircle className="w-4 h-4" />}
            />
          )}

          {request.disciplinaryAction?.violationName && (
            <InfoCard
              label="Violation Type"
              value={request.disciplinaryAction.violationName}
              theme="warning"
              icon={<ShieldAlert className="w-4 h-4" />}
            />
          )}

          {request.contractEndDate && (
            <InfoCard
              label="Contract End Date"
              value={formatDate(request.contractEndDate)}
              theme="warning"
              icon={<Calendar className="w-4 h-4" />}
            />
          )}

          {request.isEligible !== undefined && (
            <InfoCard
              label="Eligibility"
              value={request.isEligible ? "Eligible" : "Not Eligible"}
              theme={request.isEligible ? "success" : "warning"}
            />
          )}

          {request.note && (
            <InfoCard
              label="Note"
              value={request.note}
              theme="warning"
              fullWidth={true}
              multiline={true}
            />
          )}

          {request.reason && (
            <InfoCard
              label="Reason"
              value={request.reason}
              theme="warning"
              fullWidth={true}
              multiline={true}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-10 rounded-xl bg-slate-50 text-slate-500 border border-slate-200 transition-all hover:bg-slate-100">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p>No disciplinary action information available</p>
        </div>
      )}
    </div>
  );
};

export default DisciplinaryTab;
