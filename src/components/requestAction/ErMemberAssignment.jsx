import React from "react";
import {
  User,
  Users,
  Shield,
  AlertCircle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

const ErMemberAssignment = ({
  erMembers,
  selectedErMember,
  onChange,
  loading,
  request,
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  // Find the current selected ER member name for display purposes
  const getSelectedMemberName = () => {
    if (!selectedErMember) return "";
    const member = erMembers.find(
      (m) => m.Id.toString() === selectedErMember.toString()
    );
    return member ? member.FullName : "";
  };
  console.log(request);

  // Extract previous ER member details from the request
  const previousErMember = request?.UserFullName || request?.erMember;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-100 transition-all duration-300 hover:shadow-md">
      <h3 className="text-base font-semibold mb-5 text-slate-700 flex items-center">
        <Shield size={18} className="mr-2 text-sky-500" />
        ER Member Assignment
      </h3>

      <div className="space-y-4">
        {/* Previous Assignment Display */}
        {previousErMember && (
          <div className="p-2 bg-amber-50 rounded-lg border border-amber-100 mb-4">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center border border-amber-200 shadow-sm">
                <User size={18} className="text-amber-500" />
              </div>
              <div className="ml-3 flex-grow">
                <span className="text-xs font-medium text-amber-600 ">
                  Previously Assigned To
                </span>
                <p className="font-medium text-amber-700 text-sm">
                  {previousErMember}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Current or New Assignment Display */}
        {selectedErMember && (
          <div className="p-4 bg-sky-50 rounded-lg border border-sky-100 mb-4">
            <div className="flex items-start">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-sky-200 shadow-sm">
                <User size={20} className="text-sky-500" />
              </div>
              <div className="ml-3 flex-grow">
                <span className="text-xs font-medium text-sky-600 uppercase tracking-wide">
                  Currently Assigned To
                </span>
                <p className="font-medium text-sky-700 text-base">
                  {getSelectedMemberName()}
                </p>
                <div className="flex items-center mt-1">
                  <CheckCircle size={12} className="text-emerald-500 mr-1" />
                  <span className="text-xs text-sky-600">Active</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transition Indicator */}
        {previousErMember &&
          selectedErMember &&
          previousErMember !== getSelectedMemberName() && (
            <div className="flex items-center justify-center my-2">
              <div className="flex items-center bg-slate-100 rounded-full px-3 py-1.5">
                <User size={14} className="text-slate-500 mr-2" />
                <ArrowRight size={14} className="text-slate-500 mr-2" />
                <User size={14} className="text-slate-500" />
              </div>
            </div>
          )}

        <label className="block text-sm font-medium text-slate-600 mb-2">
          {selectedErMember ? "Reassign ER Member" : "Assign ER Member"}
        </label>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Users size={16} className="text-slate-400" />
          </div>

          <select
            className="block w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none hover:border-slate-300 shadow-sm"
            value={selectedErMember}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="">Select ER Member</option>
            {erMembers.map((member) => (
              <option key={member.Id} value={member.Id}>
                {member.FullName}
              </option>
            ))}
          </select>
        </div>

        {/* Hint text and information */}
        <div className="mt-2 flex items-start text-xs text-slate-500">
          <AlertCircle
            size={14}
            className="text-slate-400 mt-0.5 mr-2 flex-shrink-0"
          />
          <p>
            Assign an ER team member who will be responsible for handling this
            request. They will receive notifications about status changes and
            updates.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErMemberAssignment;
