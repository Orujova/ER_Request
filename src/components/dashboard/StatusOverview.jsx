import React from "react";

const StatusOverview = ({ stats }) => {
  const safeStats = stats || {};

  const displayStats = {
    // Status codes from the enum
    pending: safeStats.pending || 0,
    underReview: safeStats.underReview || 0,
    decisionMade: safeStats.decisionMade || 0,
    reAssigned: safeStats.reAssigned || 0,
    decisionCommunicated: safeStats.decisionCommunicated || 0,
    completed: safeStats.completed || 0,

    // Canceled requests (based on IsCanceled flag)
    canceled: safeStats.canceled || 0,

    // Total count
    total: safeStats.total || 0,
  };

  // Calculate in progress (all active statuses)
  const inProgress =
    displayStats.pending +
    displayStats.underReview +
    displayStats.decisionMade +
    displayStats.reAssigned +
    displayStats.decisionCommunicated;

  // Calculate finalized (completed + canceled)
  const finalized = displayStats.completed + displayStats.canceled;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Status Overview
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <span className="text-sm font-medium">{displayStats.pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Under Review</span>
            </div>
            <span className="text-sm font-medium">
              {displayStats.underReview}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
              <span className="text-sm text-gray-600">Decision Made</span>
            </div>
            <span className="text-sm font-medium">
              {displayStats.decisionMade}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Request Process
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
              <span className="text-sm text-gray-600">ReAssigned</span>
            </div>
            <span className="text-sm font-medium">
              {displayStats.reAssigned}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-pink-500 mr-2"></div>
              <span className="text-sm text-gray-600">
                Decision Communicated
              </span>
            </div>
            <span className="text-sm font-medium">
              {displayStats.decisionCommunicated}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <span className="text-sm font-medium">
              {displayStats.completed}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Canceled</span>
            </div>
            <span className="text-sm font-medium">{displayStats.canceled}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Quick Stats
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">Total Requests</span>
            <span className="text-sm font-medium text-[#0D9BBF]">
              {displayStats.total}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {inProgress}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Finalized</span>
            <span className="text-sm font-medium text-gray-800">
              {finalized}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;
