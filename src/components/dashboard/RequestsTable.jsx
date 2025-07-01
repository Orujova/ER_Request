import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { reassignERMember } from "../../redux/slices/dashboardSlice";
import StatusBadge from "../common/StatusBadge";
import { EyeIcon, CalendarIcon, ClockIcon, XIcon } from "lucide-react";

const RequestsTable = ({ requests, onViewDetails }) => {
  const dispatch = useDispatch();
  const { erMembers } = useSelector((state) => state.erMembers);
  const { reassignLoading, reassignError } = useSelector(
    (state) => state.dashboard
  );

  // Modal state'i
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [newErMemberId, setNewErMemberId] = useState("");

  const handleReassignClick = (request) => {
    setSelectedRequest(request);
    setNewErMemberId("");
    setShowReassignModal(true);
  };

  const handleReassignSubmit = () => {
    if (selectedRequest && newErMemberId) {
      dispatch(
        reassignERMember({
          requestId: selectedRequest.id,
          newErMemberId: parseInt(newErMemberId),
        })
      )
        .unwrap()
        .then(() => setShowReassignModal(false))
        .catch(() => {});
    }
  };

  const formatDuration = (days) => {
    if (days === null || days === undefined) return "N/A";
    return days === 1 ? `${days - 1} day` : `${days - 1} days`;
  };

  const getDurationColor = (request) => {
    if (request.statusCode >= 4) {
      return request.duration > 14 ? "text-amber-600" : "text-gray-500";
    }
    return request.duration > 14 ? "text-red-600 font-bold" : "text-gray-500";
  };

  return (
    <>
      <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            {/* DEĞİŞİKLİK: Başlık arka planı, gövdeden ayrışması için tekrar gri yapıldı. */}
            <thead className="border-b border-gray-200 bg-gray-100">
              <tr>
                {/* DEĞİŞİKLİK: Yapışkan başlıkların arka planı da gri olarak güncellendi. */}
                <th
                  scope="col"
                  className="sticky left-0 z-20 w-40 min-w-[10rem] border-r bg-gray-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Request Number
                </th>
                <th
                  scope="col"
                  className="sticky left-40 z-20 w-48 min-w-[12rem] border-r bg-gray-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  ER Member
                </th>
                <th
                  scope="col"
                  className="w-32 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Project
                </th>
                <th
                  scope="col"
                  className="w-48 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Employee
                </th>
                <th
                  scope="col"
                  className="w-40 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Case
                </th>
                <th
                  scope="col"
                  className="w-40 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Subcase
                </th>
                <th
                  scope="col"
                  className="w-32 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="w-32 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="sticky right-[9rem] z-20 w-36 min-w-[9rem] border-l bg-gray-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="sticky right-0 z-20 w-36 min-w-[9rem] bg-gray-100 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600"
                >
                  Actions
                </th>
              </tr>
            </thead>
            {/* DEĞİŞİKLİK: Tablo gövdesi (tbody) tamamen beyaz arka plana sahip. */}
            <tbody className="divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="bg-white py-16 text-center text-sm text-gray-500"
                  >
                    No requests found
                  </td>
                </tr>
              ) : (
                requests.map((request, index) => (
                  <tr
                    key={request.id}
                    className="group align-middle bg-white transition-colors duration-200 ease-in-out hover:bg-cyan-50"
                  >
                    <td className="sticky left-0 z-10 w-40 min-w-[10rem] whitespace-nowrap border-r bg-white px-4 py-4 text-center text-xs font-medium text-gray-800 transition-colors duration-200 ease-in-out group-hover:bg-cyan-50">
                      {(request.title &&
                        request.title.substring(4).split(":")[0]) ||
                        "N/A"}
                    </td>
                    <td className="sticky left-40 z-10 w-48 min-w-[12rem] whitespace-nowrap border-r bg-white px-4 py-4 text-center transition-colors duration-200 ease-in-out group-hover:bg-cyan-50">
                      <p className="text-sm font-semibold text-gray-900">
                        {request.erMember}
                      </p>
                      <button
                        onClick={() => handleReassignClick(request)}
                        className="mt-1 text-xs font-medium text-cyan-600 transition-colors hover:text-cyan-800"
                      >
                        Reassign
                      </button>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-sm text-gray-800">
                      {request.projectCode}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-xs text-gray-700">
                      {request.employee}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-medium text-gray-800">
                      {request.case}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-xs text-gray-700">
                      {request.subcase}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center text-xs text-gray-500">
                      <div className="flex items-center justify-center">
                        <CalendarIcon className="mr-1.5 h-4 w-4" />
                        <span>{request.date}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-center">
                      <div
                        className={`flex items-center justify-center text-xs ${getDurationColor(
                          request
                        )}`}
                      >
                        <ClockIcon className="mr-1.5 h-4 w-4" />
                        <span>{formatDuration(request.duration)}</span>
                      </div>
                    </td>
                    <td className="sticky right-[9rem] z-10 w-36 min-w-[9rem] whitespace-nowrap border-l bg-white px-4 py-4 text-center transition-colors duration-200 ease-in-out group-hover:bg-cyan-50">
                      <StatusBadge statusCode={request.statusCode} />
                    </td>
                    <td className="sticky right-0 z-10 w-36 min-w-[9rem] whitespace-nowrap bg-white px-4 py-4 text-center transition-colors duration-200 ease-in-out group-hover:bg-cyan-50">
                      <button
                        onClick={() => onViewDetails(request.id)}
                        className="inline-flex items-center rounded-full bg-cyan-100 px-4 py-1.5 text-xs font-semibold text-cyan-800 ring-1 ring-inset ring-cyan-600/20 transition-all duration-200 hover:bg-cyan-200/60 hover:scale-105"
                      >
                        <EyeIcon className="mr-1.5 h-4 w-4" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal (Değişiklik yok) */}
      {showReassignModal && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Reassign ER Member
              </h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowReassignModal(false)}
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="mb-2 text-sm text-gray-600">
                Currently assigned to:{" "}
                <span className="font-semibold text-gray-800">
                  {selectedRequest.erMember}
                </span>
              </p>
              <p className="mb-4 text-sm text-gray-600">
                Request:{" "}
                <span className="font-medium text-gray-800">
                  {selectedRequest.case} - {selectedRequest.subcase}
                </span>
              </p>
              <label
                htmlFor="er-member-select"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Select new ER Member:
              </label>
              <select
                id="er-member-select"
                value={newErMemberId}
                onChange={(e) => setNewErMemberId(e.target.value)}
                className="w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-cyan-500 focus:ring-cyan-500"
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
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReassignSubmit}
                disabled={!newErMemberId || reassignLoading}
                className="rounded-md bg-[#0D9BBF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0B89A9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {reassignLoading ? "Reassigning..." : "Reassign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RequestsTable;
