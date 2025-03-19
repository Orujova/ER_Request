import React from "react";
import { FileText, Calendar, AlertCircle, User } from "lucide-react";
import InfoCard from "./InfoCard";
import { formatDate } from "../../utils/dateFormatters";

const CaseInfoTab = ({ request }) => {
  if (!request) return null;

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2 text-slate-900">
        <FileText className="w-5 h-5 text-sky-600" />
        Case Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InfoCard
          label="Case Name"
          value={request.case}
          icon={<FileText className="w-4 h-4" />}
        />

        <InfoCard label="Sub Case" value={request.subCase} />

        <InfoCard
          label="Created Date"
          value={formatDate(request.createdDate)}
          icon={<Calendar className="w-4 h-4" />}
        />

        <InfoCard
          label="ER Member"
          value={request.erMember || "Unassigned"}
          icon={<User className="w-4 h-4" />}
        />

        <InfoCard
          label="Request Type"
          value={request.requestType === 0 ? "Standard" : "Urgent"}
          theme={request.requestType === 0 ? "default" : "info"}
          icon={
            request.requestType === 0 ? null : (
              <AlertCircle className="w-4 h-4" />
            )
          }
        />

        {request.orderNumber && (
          <InfoCard label="Order Number" value={request.orderNumber} />
        )}
      </div>
    </div>
  );
};

export default CaseInfoTab;
