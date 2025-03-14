import React from "react";
import {
  ClockIcon,
  EyeIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XIcon,
  MailIcon,
  UserIcon,
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
      case 2:
        return {
          label: "Decision Made",
          color: "bg-violet-50 text-violet-700",
          iconColor: "text-violet-600",
          icon: <ClipboardIcon className="h-4 w-4" />,
          borderColor: "border-violet-200",
        };
      case 3:
        return {
          label: "ReAssigned",
          color: "bg-indigo-50 text-indigo-700",
          iconColor: "text-indigo-600",
          icon: <UserIcon className="h-4 w-4" />,
          borderColor: "border-indigo-200",
        };
      case 4:
        return {
          label: "Decision Communicated",
          color: "bg-blue-50 text-blue-700",
          iconColor: "text-blue-600",
          icon: <MailIcon className="h-4 w-4" />,
          borderColor: "border-blue-200",
        };
      case 5:
        return {
          label: "Completed",
          color: "bg-emerald-50 text-emerald-700",
          iconColor: "text-emerald-600",
          icon: <CheckCircleIcon className="h-4 w-4" />,
          borderColor: "border-emerald-200",
        };
      default:
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
      className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium ${status.color} border ${status.borderColor}`}
    >
      <span className={`${status.iconColor} mr-1.5`}>{status.icon}</span>
      <span>{status.label}</span>
    </div>
  );
};

export default StatusBadge;
