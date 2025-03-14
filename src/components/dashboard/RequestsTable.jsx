import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { reassignERMember } from "../../redux/slices/dashboardSlice";
import StatusBadge from "../common/StatusBadge";
import {
  EyeIcon,
  CalendarIcon,
  UserIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";

const RequestsTable = ({ requests, onViewDetails }) => {
  const dispatch = useDispatch();
  const { erMembers } = useSelector((state) => state.erMembers);
  const { reassignLoading, reassignError } = useSelector(
    (state) => state.dashboard
  );

  // State for reassignment modal
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newErMemberId, setNewErMemberId] = useState("");

  // Open reassign modal
  const handleReassignClick = (request) => {
    setSelectedRequest(request);
    setNewErMemberId("");
    setShowReassignModal(true);
  };

  // Handle reassign submission
  const handleReassignSubmit = () => {
    if (selectedRequest && newErMemberId) {
      dispatch(
        reassignERMember({
          requestId: selectedRequest.id,
          newErMemberId: parseInt(newErMemberId),
        })
      )
        .unwrap()
        .then(() => {
          setShowReassignModal(false);
          // Success message could be shown here
        })
        .catch((error) => {
          // Error handling is done in the Redux slice
        });
    }
  };

  return (
    <>
      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  ER Member
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Project
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Case
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subcase
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-sm text-gray-500"
                  >
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {request.erMember}
                      </p>
                      <button
                        onClick={() => handleReassignClick(request)}
                        className="text-xs text-[#06b6d4] hover:text-[#0891b2]"
                      >
                        Reassign
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900">
                          {request.project}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.projectCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {request.employee}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{request.case}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{request.subcase}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <p className="text-sm text-gray-500">{request.date}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge statusCode={request.statusCode} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => onViewDetails(request.id)}
                        className="inline-flex items-center px-3 py-1.5 border border-[#0D9BBF] shadow-sm text-sm leading-4 font-medium rounded-md text-[#0D9BBF] bg-white hover:bg-[#E6F7FB] focus:outline-none focus:ring-0 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedRequest && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Reassign ER Member
              </h3>
              <button
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowReassignModal(false)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Currently assigned to:{" "}
                <span className="font-medium">{selectedRequest.erMember}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Request: {selectedRequest.case} - {selectedRequest.subcase}
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select new ER Member:
              </label>

              <select
                value={newErMemberId}
                onChange={(e) => setNewErMemberId(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0D9BBF] focus:border-[#0D9BBF]"
              >
                <option value="">Select ER Member</option>
                {erMembers.map((member) => (
                  <option
                    key={member.Id}
                    value={member.Id}
                    disabled={member.Id === selectedRequest.erMemberId}
                  >
                    {member.FullName}
                  </option>
                ))}
              </select>

              {reassignError && (
                <p className="mt-2 text-sm text-red-600">{reassignError}</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReassignModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignSubmit}
                disabled={!newErMemberId || reassignLoading}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  !newErMemberId
                    ? "bg-[#0D9BBF] opacity-50 cursor-not-allowed"
                    : "bg-[#0D9BBF] hover:bg-[#0B89A9]"
                }`}
              >
                {reassignLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Reassigning...
                  </span>
                ) : (
                  "Reassign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestsTable;
