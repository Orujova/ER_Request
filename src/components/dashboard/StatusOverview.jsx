// src/pages/Dashboard/components/StatusOverview.jsx
import React from "react";

const StatusOverview = ({ stats }) => {
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
            <span className="text-sm font-medium">{stats.pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Under Review</span>
            </div>
            <span className="text-sm font-medium">{stats.underReview}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></div>
              <span className="text-sm text-gray-600">Decision Made</span>
            </div>
            <span className="text-sm font-medium">{stats.decisionMade}</span>
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
              <span className="text-sm text-gray-600">Order Created</span>
            </div>
            <span className="text-sm font-medium">{stats.orderCreated}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Completed</span>
            </div>
            <span className="text-sm font-medium">{stats.completed}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Canceled</span>
            </div>
            <span className="text-sm font-medium">{stats.canceled}</span>
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
              {stats.total}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-sm text-gray-600">In Progress</span>
            <span className="text-sm font-medium text-blue-600">
              {stats.pending + stats.underReview + stats.decisionMade}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Finalized</span>
            <span className="text-sm font-medium text-gray-800">
              {stats.completed + stats.canceled}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusOverview;
