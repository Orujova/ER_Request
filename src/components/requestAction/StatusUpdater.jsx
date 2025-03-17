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
  Mail,
  User,
  AlertCircle,
} from "lucide-react";
import { themeColors } from "../../styles/theme";
import StatusPoint from "./StatusPoint";
import { getStoredTokens } from "../../utils/authHandler";

// Modal component that uses portal for proper display
const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  statusCode,
  loading,
  isCancel = false,
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
        return "ReAssigned";
      case 4:
        return "Decision Communicated";
      case 5:
        return "Completed";
      case 999: // Special code for cancel action
        return "Canceled";
      default:
        return "Unknown";
    }
  };

  const title = isCancel ? "Confirm Cancellation" : "Confirm Status Change";
  const message = isCancel
    ? "Are you sure you want to cancel this request? This action cannot be undone."
    : `Are you sure you want to change the status to "${getStatusNameByCode(
        statusCode
      )}"?`;

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
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>

          <p className="mb-6 text-gray-700">{message}</p>

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
                isCancel
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

const StatusUpdater = ({
  request,
  handleStatusUpdate,
  statusLoading,
  API_BASE_URL,
  id,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [isCancel, setIsCancel] = useState(false);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-gray-50 text-gray-700 border-gray-200";
      case "ReAssigned":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Under Review":
        return "bg-sky-50 text-sky-700 border-sky-200";
      case "Decision Made":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Decision Communicated":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "Canceled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusNumber = (status) => {
    // Handle numeric status
    if (typeof status === "number") {
      return status;
    }

    // Handle string status
    switch (status) {
      case "Pending":
        return 0;
      case "Under Review":
        return 1;
      case "Decision Made":
        return 2;
      case "ReAssigned":
        return 3;
      case "Decision Communicated":
        return 4;
      case "Completed":
        return 5;
      default:
        return -1;
    }
  };

  // Check if a request is canceled (using IsCanceled property)
  const isRequestCanceled = (req) => {
    if (!req) return false;
    return req.IsCanceled === true || req.isCanceled === true;
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
        return "ReAssigned";
      case 4:
        return "Decision Communicated";
      case 5:
        return "Completed";
      default:
        return "Unknown";
    }
  };

  // Get status from either numeric or string representation
  const getCurrentStatus = () => {
    if (typeof request?.status === "number") {
      return getStatusNameByCode(request.status);
    }
    if (typeof request?.ERRequestStatus === "number") {
      return getStatusNameByCode(request.ERRequestStatus);
    }
    return request?.status || request?.ERRequestStatus || "Unknown";
  };

  const initiateStatusUpdate = (statusCode) => {
    // Only Under Review and Completed can be manually set
    if (statusCode === 1 || statusCode === 5) {
      setIsCancel(false);
      setActionToConfirm(statusCode);
      setIsModalOpen(true);
    }
  };

  const initiateCancelRequest = () => {
    setIsCancel(true);
    setActionToConfirm(null); // We'll use a different API for cancellation
    setIsModalOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (isCancel) {
      // Handle cancellation with a different API endpoint
      handleCancelRequest();
    } else {
      handleStatusUpdate(actionToConfirm);
    }
  };

  const handleCancelRequest = async () => {
    try {
      setStatusLoading(true);
      const { token } = getStoredTokens();

      // Using the correct API endpoint for cancellation
      const reqId = request?.id || id; // Fallback to param id if request object doesn't have id

      // Using the separate dedicated Cancel API endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/CancelERRequest?ERRequestId=${reqId}`,
        {
          method: "PUT",
          headers: {
            "ngrok-skip-browser-warning": "narmin",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error canceling request: ${response.status}`);
      }

      console.log("Cancel request successful");

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error) {
      console.error("Error canceling request:", error);
      setStatusLoading(false);
    }
  };

  useEffect(() => {
    if (!statusLoading && isModalOpen) {
      setIsModalOpen(false);
      setActionToConfirm(null);
      setIsCancel(false);
    }
  }, [statusLoading]);

  // Handle status changes
  useEffect(() => {
    // This will run whenever the request status changes
    if (request?.status) {
      // Any additional logic needed when status changes
    }
  }, [request?.status]);

  if (!request || Object.keys(request).length === 0) {
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
      description: "Begin review process (Manual)",
      icon: <Search size={16} />,
      iconBg: "bg-[#e6f4f7] text-[#5cb8ca]",
      hoverStyles:
        "hover:bg-[#e6f4f7] hover:border-[#cee9f0] focus:ring-2 focus:ring-[#e6f4f7]",
      chevronColor: "text-[#5cb8ca]",
      disabled:
        getCurrentStatus() === "Under Review" ||
        getStatusNumber(getCurrentStatus()) > 1 ||
        statusLoading ||
        isRequestCanceled(request),
      isManual: true,
    },
    {
      statusCode: 2,
      label: "Decision Made",
      description: "Mark decision as completed (Automatic)",
      icon: <FileText size={16} />,
      iconBg: "bg-indigo-50 text-indigo-500",
      hoverStyles:
        "hover:bg-indigo-50 hover:border-indigo-200 focus:ring-2 focus:ring-indigo-100",
      chevronColor: "text-indigo-400",
      disabled: true, // Always disabled as this is automatic
      isManual: false,
    },
    {
      statusCode: 3,
      label: "ReAssigned",
      description: "Reassign to another member (Automatic)",
      icon: <User size={16} />,
      iconBg: "bg-amber-50 text-amber-500",
      hoverStyles:
        "hover:bg-amber-50 hover:border-amber-200 focus:ring-2 focus:ring-amber-100",
      chevronColor: "text-amber-400",
      disabled: true, // Always disabled as this is automatic
      isManual: false,
    },
    {
      statusCode: 4,
      label: "Decision Communicated",
      description: "Decision has been communicated (Automatic)",
      icon: <Mail size={16} />,
      iconBg: "bg-blue-50 text-blue-500",
      hoverStyles:
        "hover:bg-blue-50 hover:border-blue-200 focus:ring-2 focus:ring-blue-100",
      chevronColor: "text-blue-400",
      disabled: true, // Always disabled as this is automatic
      isManual: false,
    },
    {
      statusCode: 5,
      label: "Complete",
      description: "Mark as fully completed (Manual)",
      icon: <Check size={16} />,
      iconBg: "bg-teal-50 text-teal-600",
      hoverStyles:
        "hover:bg-teal-50 hover:border-teal-200 focus:ring-2 focus:ring-teal-100",
      chevronColor: "text-teal-500",
      buttonClass:
        "bg-gradient-to-r from-teal-400 to-teal-500 text-white hover:from-teal-500 hover:to-teal-600",
      disabled:
        getCurrentStatus() === "Completed" ||
        getStatusNumber(getCurrentStatus()) < 1 ||
        statusLoading ||
        isRequestCanceled(request),
      isManual: true,
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
            getCurrentStatus()
          )}`}
        >
          {getCurrentStatus()}
        </div>
      </div>

      {/* Status Progression */}
      <div className="mb-8">
        <div className="relative pt-8 pb-4">
          <div className="absolute top-12 left-0 w-full h-1 bg-gray-200 rounded-full"></div>

          {/* Status Points */}
          <div className="relative flex justify-between">
            <StatusPoint
              label="Pending/Reassigned"
              stepNumber={1}
              active={
                getCurrentStatus() === "Pending" ||
                getCurrentStatus() === "ReAssigned"
              }
              completed={
                getStatusNumber(getCurrentStatus()) > 0 &&
                getCurrentStatus() !== "ReAssigned"
              }
            />
            <StatusPoint
              label="Review"
              stepNumber={2}
              active={getCurrentStatus() === "Under Review"}
              completed={getStatusNumber(getCurrentStatus()) > 1}
            />
            <StatusPoint
              label="Decision"
              stepNumber={3}
              active={getCurrentStatus() === "Decision Made"}
              completed={getStatusNumber(getCurrentStatus()) > 2}
            />
            <StatusPoint
              label="Communicated"
              stepNumber={4}
              active={getCurrentStatus() === "Decision Communicated"}
              completed={getStatusNumber(getCurrentStatus()) > 4}
            />
            <StatusPoint
              label="Complete"
              stepNumber={5}
              active={getCurrentStatus() === "Completed"}
              completed={getCurrentStatus() === "Completed"}
            />
          </div>
        </div>
      </div>

      {/* Status Action Buttons */}
      <div className="space-y-3 mb-6">
        <h4 className="text-sm font-medium text-textLight mb-3">
          Change Status To
        </h4>

        {!isRequestCanceled(request) ? (
          <>
            {/* Only show manually actionable status options */}
            {statusActions
              .filter((action) => action.isManual)
              .map((action) => (
                <button
                  key={action.statusCode}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                    action.disabled
                      ? "opacity-60 cursor-not-allowed bg-gray-50 border-gray-200"
                      : action.statusCode === 5
                      ? action.buttonClass
                      : action.hoverStyles + " border-border"
                  }`}
                  onClick={() => initiateStatusUpdate(action.statusCode)}
                  disabled={action.disabled}
                >
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full ${
                        action.statusCode === 5 && !action.disabled
                          ? "bg-white bg-opacity-20"
                          : action.iconBg
                      } mr-3`}
                    >
                      {action.icon}
                    </div>
                    <div className="text-left">
                      <div
                        className={`font-medium ${
                          action.statusCode === 5 && !action.disabled
                            ? "text-white"
                            : ""
                        }`}
                      >
                        {action.label}
                      </div>
                      <div
                        className={`text-xs ${
                          action.statusCode === 5 && !action.disabled
                            ? "text-white text-opacity-90"
                            : "text-textLight"
                        }`}
                      >
                        {action.description}
                      </div>
                    </div>
                  </div>
                  {statusLoading && action.statusCode === actionToConfirm ? (
                    <Loader
                      size={16}
                      className="animate-spin mr-1 text-gray-500"
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className={
                        action.statusCode === 5 && !action.disabled
                          ? "text-white"
                          : action.chevronColor
                      }
                    />
                  )}
                </button>
              ))}

            {/* Automatic status updates info section */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start">
                <AlertCircle
                  size={16}
                  className="text-textLight mt-0.5 mr-2 flex-shrink-0"
                />
                <div>
                  <p className="text-sm font-medium text-textLight">
                    Automatic Status Updates
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    The other status changes (Decision Made, ReAssigned,
                    Decision Communicated) happen automatically based on system
                    actions.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancel Request Button */}
            <div className="mt-6">
              <button
                className="w-full flex items-center justify-between p-3 rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
                onClick={initiateCancelRequest}
                disabled={request?.status === "Completed" || statusLoading}
              >
                <div className="flex items-center">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-red-50 text-red-500 mr-3">
                    <X size={16} />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-red-600">
                      Cancel Request
                    </div>
                    <div className="text-xs text-red-400">
                      This action cannot be undone
                    </div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-red-400" />
              </button>
            </div>
          </>
        ) : (
          <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-center">
            <AlertTriangle size={24} className="mx-auto mb-2 text-red-400" />
            <p className="text-sm font-medium text-red-600">
              This request has been canceled
            </p>
            <p className="text-xs text-red-400 mt-1">
              No further status changes are possible
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal using Portal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !statusLoading && setIsModalOpen(false)}
        onConfirm={confirmStatusUpdate}
        statusCode={actionToConfirm}
        loading={statusLoading}
        isCancel={isCancel}
      />
    </div>
  );
};

export default StatusUpdater;
