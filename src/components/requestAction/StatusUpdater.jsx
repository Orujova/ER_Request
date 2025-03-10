import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Clock,
  Search,
  FileText,
  Clipboard,
  Check,
  X,
  ChevronRight,
  Loader,
  AlertTriangle,
} from "lucide-react";
import { themeColors } from "../../styles/theme";
import StatusPoint from "./StatusPoint";

// Modal component that uses portal for proper display
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  statusCode,
  loading,
}) => {
  if (!isOpen) return null;

  const getStatusNameByCode = (code) => {
    switch (code) {
      case 0:
        return "Pending";
      case 1:
        return "Under Review";
      case 2:
        return "Decision Made";
      case 3:
        return "Order Created";
      case 4:
        return "Completed";
      case 5:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transform transition-all">
          <div className="mb-4 flex items-center text-amber-500">
            <AlertTriangle size={24} className="mr-2" />
            <h3 className="text-lg font-semibold">Confirm Status Change</h3>
          </div>

          <p className="mb-6 text-gray-700">
            Are you sure you want to change the status to "
            {getStatusNameByCode(statusCode)}"?
            {statusCode === 5 && " This action cannot be undone."}
          </p>

          <div className="flex justify-end gap-3">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              className={`px-4 py-2 rounded-lg text-white ${
                statusCode === 5
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-[#219cba] hover:bg-[#0891b2]"
              }`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader size={16} className="animate-spin mx-2" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Confirm"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const StatusUpdater = ({ request, handleStatusUpdate, statusLoading }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Under Review":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "Decision Made":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Order Created":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusNumber = (status) => {
    switch (status) {
      case "Pending":
        return 0;
      case "Under Review":
        return 1;
      case "Decision Made":
        return 2;
      case "Order Created":
        return 3;
      case "Completed":
        return 4;
      default:
        return -1;
    }
  };

  const getStatusNameByCode = (code) => {
    switch (code) {
      case 0:
        return "Pending";
      case 1:
        return "Under Review";
      case 2:
        return "Decision Made";
      case 3:
        return "Order Created";
      case 4:
        return "Completed";
      case 5:
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  const initiateStatusUpdate = (statusCode) => {
    if (statusCode === 4 || statusCode === 5) {
      setActionToConfirm(statusCode);
      setIsModalOpen(true);
    } else {
      handleStatusUpdate(statusCode);
    }
  };

  const confirmStatusUpdate = () => {
    handleStatusUpdate(actionToConfirm);
  };

  useEffect(() => {
    if (!statusLoading && isModalOpen) {
      setIsModalOpen(false);
      setActionToConfirm(null); // Reset the action to confirm
    }
  }, [statusLoading]);

  // Handle status changes
  useEffect(() => {
    // This will run whenever the request status changes
    if (request?.status) {
      // Any additional logic needed when status changes
    }
  }, [request?.status]);

  if (!request) {
    return (
      <div
        className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
        style={{ boxShadow: themeColors.cardShadow }}
      >
        <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
          <Clock size={20} className="mr-2 text-primary" />
          Update Status
        </h3>
        <div className="p-4 rounded-lg bg-secondary text-textLight text-center border border-dashed border-gray-300">
          <Clock size={24} className="mx-auto mb-2 text-gray-400" />
          No status information available
        </div>
      </div>
    );
  }

  const statusActions = [
    {
      statusCode: 1,
      label: "Under Review",
      description: "Begin review process",
      icon: <Search size={16} />,
      iconBg: "bg-[#e6f4f7] text-[#0891b2]",
      hoverStyles:
        "hover:bg-[#e6f4f7] hover:border-[#cee9f0] focus:ring-2 focus:ring-[#e6f4f7]",
      chevronColor: "text-[#219cba]",
      disabled:
        request?.status === "Under Review" ||
        getStatusNumber(request?.status) > 1 ||
        statusLoading,
    },
    {
      statusCode: 2,
      label: "Decision Made",
      description: "Mark decision as completed",
      icon: <FileText size={16} />,
      iconBg: "bg-indigo-100 text-indigo-600",
      hoverStyles:
        "hover:bg-indigo-50 hover:border-indigo-200 focus:ring-2 focus:ring-indigo-100",
      chevronColor: "text-indigo-500",
      disabled:
        request?.status === "Decision Made" ||
        getStatusNumber(request?.status) > 2 ||
        getStatusNumber(request?.status) < 1 ||
        statusLoading,
    },
    {
      statusCode: 3,
      label: "Order Created",
      description: "Mark order as processed",
      icon: <Clipboard size={16} />,
      iconBg: "bg-purple-100 text-purple-600",
      hoverStyles:
        "hover:bg-purple-50 hover:border-purple-200 focus:ring-2 focus:ring-purple-100",
      chevronColor: "text-purple-500",
      disabled:
        request?.status === "Order Created" ||
        getStatusNumber(request?.status) > 3 ||
        getStatusNumber(request?.status) < 2 ||
        statusLoading,
    },
    {
      statusCode: 4,
      label: "Complete",
      description: "Mark as fully completed",
      icon: <Check size={16} />,
      iconBg: "bg-emerald-100 text-emerald-600",
      hoverStyles:
        "hover:bg-emerald-50 hover:border-emerald-200 focus:ring-2 focus:ring-emerald-100",
      chevronColor: "text-emerald-500",
      buttonClass:
        "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600",
      disabled:
        request?.status === "Completed" ||
        getStatusNumber(request?.status) < 3 ||
        statusLoading,
    },
    {
      statusCode: 5,
      label: "Cancel",
      description: "Cancel this request",
      icon: <X size={16} />,
      iconBg: "bg-red-100 text-red-600",
      hoverStyles:
        "hover:bg-red-50 hover:border-red-200 focus:ring-2 focus:ring-red-100",
      chevronColor: "text-red-500",
      buttonClass:
        "bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600",
      disabled: statusLoading,
    },
  ];

  return (
    <div
      className="bg-background rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md"
      style={{ boxShadow: themeColors.cardShadow }}
    >
      <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
        <Clock size={20} className="mr-2 text-primary" />
        Update Status
      </h3>

      {/* Current Status */}
      <div className="mb-6">
        <div className="text-sm text-textLight mb-2">Current Status</div>
        <div
          className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border ${getStatusBadgeColor(
            request.status
          )}`}
        >
          {request.status}
        </div>
      </div>

      {/* Status Progression */}
      <div className="mb-8">
        <div className="relative pt-8 pb-4">
          <div className="absolute top-12 left-0 w-full h-1 bg-gray-200 rounded-full"></div>

          {/* Status Points */}
          <div className="relative flex justify-between">
            <StatusPoint
              label="Pending"
              stepNumber={1}
              active={request?.status === "Pending"}
              completed={getStatusNumber(request?.status) > 0}
            />
            <StatusPoint
              label="Review"
              stepNumber={2}
              active={request?.status === "Under Review"}
              completed={getStatusNumber(request?.status) > 1}
            />
            <StatusPoint
              label="Decision"
              stepNumber={3}
              active={request?.status === "Decision Made"}
              completed={getStatusNumber(request?.status) > 2}
            />
            <StatusPoint
              label="Order"
              stepNumber={4}
              active={request?.status === "Order Created"}
              completed={getStatusNumber(request?.status) > 3}
            />
            <StatusPoint
              label="Complete"
              stepNumber={5}
              active={request?.status === "Completed"}
              completed={request?.status === "Completed"}
            />
          </div>
        </div>
      </div>

      {/* Status Action Buttons */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-textLight mb-3">
          Change Status To
        </h4>

        {statusActions.map((action) => (
          <button
            key={action.statusCode}
            className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
              action.disabled
                ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
                : action.statusCode === 4 || action.statusCode === 5
                ? action.buttonClass
                : action.hoverStyles + " border-border"
            }`}
            onClick={() => initiateStatusUpdate(action.statusCode)}
            disabled={action.disabled}
          >
            <div className="flex items-center">
              <div
                className={`flex items-center justify-center h-8 w-8 rounded-full ${
                  action.statusCode === 4 || action.statusCode === 5
                    ? "bg-white bg-opacity-20"
                    : action.iconBg
                } mr-3`}
              >
                {action.icon}
              </div>
              <div className="text-left">
                <div
                  className={`font-medium ${
                    (action.statusCode === 4 || action.statusCode === 5) &&
                    !action.disabled
                      ? "text-white"
                      : ""
                  }`}
                >
                  {action.label}
                </div>
                <div
                  className={`text-xs ${
                    (action.statusCode === 4 || action.statusCode === 5) &&
                    !action.disabled
                      ? "text-white text-opacity-90"
                      : "text-textLight"
                  }`}
                >
                  {action.description}
                </div>
              </div>
            </div>
            {statusLoading && action.statusCode === actionToConfirm ? (
              <Loader size={16} className="animate-spin mr-1 text-gray-500" />
            ) : (
              <ChevronRight
                size={16}
                className={
                  (action.statusCode === 4 || action.statusCode === 5) &&
                  !action.disabled
                    ? "text-white"
                    : action.chevronColor
                }
              />
            )}
          </button>
        ))}
      </div>

      {/* Confirmation Modal using Portal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !statusLoading && setIsModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        statusCode={actionToConfirm}
        loading={statusLoading}
      />
    </div>
  );
};

export default StatusUpdater;
