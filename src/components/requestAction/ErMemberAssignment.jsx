// File: components/ErMemberAssignment.jsx
import React from "react";
import { User } from "lucide-react";
import { themeColors } from "../../styles/theme";

const ErMemberAssignment = ({ erMembers, selectedErMember, onChange }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  return (
    <div
      className="bg-background rounded-xl shadow-sm p-6"
      style={{ boxShadow: themeColors.cardShadow }}
    >
      <h3 className="text-lg font-semibold mb-5 text-text flex items-center">
        <User size={20} className="mr-2 text-primary" />
        ER Member Assignment
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-textLight mb-2">
            Assign ER Member
          </label>
          <select
            className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all
              focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
            value={selectedErMember}
            onChange={handleChange}
          >
            <option value="">Select ER Member</option>
            {erMembers.map((member) => (
              <option key={member.Id} value={member.Id}>
                {member.FullName}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ErMemberAssignment;
