import React, { useState, useEffect } from "react";
import {
  Clock,
  Search,
  Check,
  X,
  ChevronRight,
  Loader,
  AlertTriangle,
  Activity,
  CornerDownRight,
  Calendar,
  Info,
} from "lucide-react";
import StatusPoint from "./StatusPoint";

const StatusUpdater = ({
  request,
  handleStatusUpdate,
  statusLoading,
  API_BASE_URL,
  id,
  defaultStatusHistory = [],
}) => {
  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionToConfirm, setActionToConfirm] = useState(null);
  const [isCancel, setIsCancel] = useState(false);
  const [statusHistory, setStatusHistory] = useState(defaultStatusHistory);

  // Status color mapping
  const getStatusBadgeColor = (status) => {
    const statusColorMap = {
      Pending: "bg-slate-100 text-slate-600 border-slate-200",
      ReAssigned: "bg-amber-50 text-amber-600 border-amber-200",
      "Under Review": "bg-sky-50 text-sky-600 border-sky-200",
      "Decision Made": "bg-indigo-50 text-indigo-600 border-indigo-200",
      "Decision Communicated": "bg-blue-50 text-blue-600 border-blue-200",
      Completed: "bg-emerald-50 text-emerald-600 border-emerald-200",
      Canceled: "bg-red-50 text-red-600 border-red-200",
      default: "bg-slate-100 text-slate-600 border-slate-200",
    };
    return statusColorMap[status] || statusColorMap["default"];
  };

  // Convert status to numeric representation
  const getStatusNumber = (status) => {
    if (typeof status === "number") return status;

    const statusNumberMap = {
      Pending: 0,
      "Under Review": 1,
      "Decision Made": 2,
      ReAssigned: 3,
      "Decision Communicated": 4,
      Completed: 5,
    };
    return statusNumberMap[status] ?? -1;
  };

  // Check if request is canceled
  const isRequestCanceled = (req) => {
    if (!req) return false;
    return req.IsCanceled === true || req.isCanceled === true;
  };

  // Convert status code to readable name
  const getStatusNameByCode = (code) => {
    const statusNameMap = {
      0: "Pending",
      1: "Under Review",
      2: "Decision Made",
      3: "ReAssigned",
      4: "Decision Communicated",
      5: "Completed",
      999: "Canceled",
    };
    return statusNameMap[code] || "Unknown";
  };

  // Get current status, handling different input formats
  const getCurrentStatus = () => {
    if (typeof request?.status === "number") {
      return getStatusNameByCode(request.status);
    }
    if (typeof request?.ERRequestStatus === "number") {
      return getStatusNameByCode(request.ERRequestStatus);
    }
    return request?.status || request?.ERRequestStatus || "Unknown";
  };

  // Adjust status number, treating ReAssigned as Pending
  const getAdjustedStatusNumber = (status) => {
    const statusNum = getStatusNumber(status);
    return statusNum === 3 ? 0 : statusNum;
  };

  // Initiate status update
  const initiateStatusUpdate = (statusCode) => {
    if (statusCode === 1 || statusCode === 5) {
      setIsCancel(false);
      setActionToConfirm(statusCode);
      setIsModalOpen(true);
    }
  };

  // Initiate request cancellation
  const initiateCancelRequest = () => {
    setIsCancel(true);
    setActionToConfirm(null);
    setIsModalOpen(true);
  };

  // Confirm status update or cancellation
  const confirmStatusUpdate = () => {
    handleStatusUpdate(isCancel ? 999 : actionToConfirm);
  };

  // Update modal state when loading completes
  useEffect(() => {
    if (!statusLoading && isModalOpen) {
      setIsModalOpen(false);
      setActionToConfirm(null);
      setIsCancel(false);
    }
  }, [statusLoading]);

  // Configurable status actions
  const statusActions = [
    {
      statusCode: 1,
      label: "Under Review",
      // description: "Begin review process",
      icon: <Search size={16} />,
      iconBg: "bg-sky-50 text-sky-500",
      bgColor: "bg-white hover:bg-sky-50",
      textColor: "text-sky-600",
      borderColor: "border-sky-200 hover:border-sky-300",
      disabled:
        getCurrentStatus() === "Under Review" ||
        getAdjustedStatusNumber(getCurrentStatus()) > 1 ||
        statusLoading ||
        isRequestCanceled(request),
      isManual: true,
    },
    {
      statusCode: 5,
      label: "Complete",
      // description: "Mark as fully completed",
      icon: <Check size={16} />,
      iconBg: "bg-emerald-200 text-emerald-600",
      bgColor:
        "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500",
      textColor: "text-white",
      borderColor: "border-transparent",
      disabled:
        getCurrentStatus() === "Completed" ||
        getAdjustedStatusNumber(getCurrentStatus()) < 1 ||
        statusLoading ||
        isRequestCanceled(request),
      isManual: true,
    },
  ];

  const currentStatusNum = getAdjustedStatusNumber(getCurrentStatus());

  // Render when no request is available
  if (!request || Object.keys(request).length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-slate-100">
        <h3 className="text-lg font-semibold mb-5 text-slate-700 flex items-center">
          <Activity size={20} className="mr-2 text-sky-500" />
          Update Status
        </h3>
        <div className="p-4 rounded-lg bg-slate-50 text-slate-500 text-center border border-dashed border-slate-200">
          <Clock size={24} className="mx-auto mb-2 text-slate-400" />
          No status information available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border border-slate-100">
      <h3 className="text-lg font-semibold mb-5 text-slate-700 flex items-center">
        <Activity size={20} className="mr-2 text-sky-500" />
        Update Status
      </h3>

      {/* Current Status Badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <div className="text-sm text-slate-500 mb-2">Current Status</div>
          <div
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusBadgeColor(
              getCurrentStatus()
            )}`}
          >
            {getCurrentStatus()}
          </div>
        </div>

        {/* Last updated timestamp */}
        <div className="text-right">
          <div className="text-xs text-slate-400">Last updated</div>
          <div className="text-sm text-slate-600 font-medium flex items-center justify-end">
            <Calendar size={12} className="mr-1" />
            {request.createdDate || "Today, 10:30 AM"}
          </div>
        </div>
      </div>

      {/* Status Progression Workflow */}
      <div className="mb-8">
        <div className="relative pt-8 pb-4">
          <div className="absolute top-12 left-0 w-full h-1 bg-slate-100 rounded-full"></div>

          <div className="relative flex justify-between">
            <StatusPoint
              label="Pending"
              stepNumber={1}
              active={currentStatusNum === 0}
              completed={currentStatusNum > 0}
            />
            <StatusPoint
              label="Review"
              stepNumber={2}
              active={currentStatusNum === 1}
              completed={currentStatusNum > 1}
            />
            <StatusPoint
              label="Decision"
              stepNumber={3}
              active={currentStatusNum === 2}
              completed={currentStatusNum > 2}
            />
            <StatusPoint
              label="Communicated"
              stepNumber={4}
              active={currentStatusNum === 4}
              completed={currentStatusNum > 4}
            />
            <StatusPoint
              label="Complete"
              stepNumber={5}
              active={currentStatusNum === 5}
              completed={currentStatusNum === 5}
            />
          </div>
        </div>
      </div>

      {/* Status Action Buttons */}
      {!isRequestCanceled(request) ? (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-600 mb-3 flex items-center">
            <CornerDownRight size={14} className="mr-2 text-slate-400" />
            Change Status To
          </h4>

          {/* Manual Status Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {statusActions
              .filter((action) => action.isManual)
              .map((action) => (
                <button
                  key={action.statusCode}
                  className={`flex items-center p-2 rounded-lg border transition-all ${
                    action.disabled
                      ? "opacity-60 cursor-not-allowed bg-slate-50 border-slate-200"
                      : `${action.bgColor} ${action.borderColor}`
                  }`}
                  onClick={() => initiateStatusUpdate(action.statusCode)}
                  disabled={action.disabled}
                >
                  <div
                    className={`flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full ${action.iconBg} mr-3`}
                  >
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div
                      className={`font-medium ${
                        action.disabled ? "text-slate-500" : action.textColor
                      }`}
                    >
                      {action.label}
                    </div>
                    <div
                      className={`text-xs ${
                        action.disabled
                          ? "text-slate-400"
                          : action.statusCode === 5
                          ? "text-white text-opacity-90"
                          : "text-slate-500"
                      }`}
                    >
                      {action.description}
                    </div>
                  </div>
                </button>
              ))}
          </div>

          {/* Automatic Status Updates Info */}
          <div className="mt-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <Info
                size={18}
                className="text-blue-500 mr-3 flex-shrink-0 mt-0.5"
              />
              <div>
                <p className="text-sm font-medium text-blue-700">
                  About Status Updates
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  "Decision Made", "ReAssigned", and "Decision Communicated"
                  statuses are updated automatically based on system actions.
                  You can only change the status to "Under Review" or "Complete"
                  manually.
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Request Button */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              className="w-full flex items-center justify-between p-3 rounded-lg border-2 border-red-200 hover:bg-red-50 hover:border-red-300 transition-all"
              onClick={initiateCancelRequest}
              disabled={getCurrentStatus() === "Completed" || statusLoading}
            >
              <div className="flex items-center">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-50 text-red-500 mr-3">
                  <X size={16} />
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm text-red-600">
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
        </div>
      ) : (
        <div className="p-5 rounded-lg bg-red-50 border border-red-100 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-500 mb-3">
            <AlertTriangle size={24} />
          </div>
          <p className="text-base font-medium text-red-600">
            This request has been canceled
          </p>
          <p className="text-sm text-red-500 mt-1">
            No further status changes are possible
          </p>
        </div>
      )}

      {/* Status History Timeline */}
      {statusHistory.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <h4 className="text-sm font-medium text-slate-600 mb-3">
            Status History
          </h4>
          <div className="space-y-3">
            {statusHistory.map((item, index) => (
              <div key={index} className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-sky-400 mt-1.5"></div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-slate-700">
                    {item.status}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center">
                    <Calendar size={10} className="mr-1" />
                    {item.date} {item.user && `by ${item.user}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl transform transition-all">
            <div className="mb-4 flex items-center">
              <div
                className={`p-3 rounded-full ${
                  isCancel ? "bg-red-50" : "bg-amber-50"
                } mr-3`}
              >
                <AlertTriangle
                  size={22}
                  className={isCancel ? "text-red-500" : "text-amber-500"}
                />
              </div>
              <h3 className="text-lg font-semibold text-slate-800">
                {isCancel ? "Confirm Cancellation" : "Confirm Status Change"}
              </h3>
            </div>

            <p className="mb-6 text-slate-600">
              {isCancel
                ? "Are you sure you want to cancel this request? This action cannot be undone."
                : `Are you sure you want to change the status to "${getStatusNameByCode(
                    actionToConfirm
                  )}"?`}
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                onClick={() => !statusLoading && setIsModalOpen(false)}
                disabled={statusLoading}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium flex items-center ${
                  isCancel
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-emerald-500 hover:bg-emerald-600"
                } transition-colors`}
                onClick={confirmStatusUpdate}
                disabled={statusLoading}
              >
                {statusLoading ? (
                  <>
                    <Loader size={16} className="animate-spin mr-2" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {isCancel ? (
                      <X size={16} className="mr-2" />
                    ) : (
                      <Check size={16} className="mr-2" />
                    )}
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusUpdater;
