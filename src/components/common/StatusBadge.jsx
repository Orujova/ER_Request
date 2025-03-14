import React from "react";
import {
  ClockIcon,
  EyeIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XIcon,
} from "lucide-react";

const StatusBadge = ({ statusCode }) => {
  const getStatusInfo = (code) => {
    switch (code) {
      case 0:
        return {
          label: "Pending",
          color: "bg-yellow-50 text-yellow-700",
          iconColor: "text-yellow-600",
          icon: <ClockIcon className="h-4 w-4" />,
          borderColor: "border-yellow-200",
        };
      case 1:
        return {
          label: "Under Review",
          color: "bg-sky-50 text-sky-700",
          iconColor: "text-sky-600",
          icon: <EyeIcon className="h-4 w-4" />,
          borderColor: "border-sky-200",
        };
      case 2: // Decision Made
        return {
          label: "Decision Made",
          color: "bg-violet-50 text-violet-700",
          iconColor: "text-violet-600",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-violet-200",
        };
      case 3: // Order Created
        return {
          label: "Order Created",
          color: "bg-fuchsia-50 text-fuchsia-700",
          iconColor: "text-fuchsia-600",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-fuchsia-200",
        };
      case 4: // Completed
        return {
          label: "Completed",
          color: "bg-emerald-50 text-emerald-700",
          iconColor: "text-emerald-600",
          icon: <CheckCircleIcon className="h-4 w-4" />,
          borderColor: "border-emerald-200",
        };
      case 5: // Canceled
        return {
          label: "Canceled",
          color: "bg-rose-50 text-rose-700",
          iconColor: "text-rose-600",
          icon: <XIcon className="h-4 w-4" />,
          borderColor: "border-rose-200",
        };
      default: // Unknown
        return {
          label: "Unknown",
          color: "bg-gray-50 text-gray-600",
          iconColor: "text-gray-500",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-gray-200",
        };
    }
  };

  const status = getStatusInfo(statusCode);

  return (
    <div
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color} border ${status.borderColor}`}
    >
      <span className={`${status.iconColor} mr-1`}>{status.icon}</span>
      <span>{status.label}</span>
    </div>
  );
};

export default StatusBadge;
