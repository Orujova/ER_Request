import React from "react";
import {
  FileText,
  User,
  Mail,
  Paperclip,
  BadgeAlert,
  Users,
} from "lucide-react";

const TabNavigation = ({
  activeTab,
  setActiveTab,
  hasRelatedRequests,
  showDisciplinary,
}) => {
  const tabs = [
    {
      id: "case",
      label: "Case Info",
      icon: <FileText className="w-4 h-4" />,
      always: true,
    },
    {
      id: "employee",
      label: "Employee",
      icon: <User className="w-4 h-4" />,
      always: true,
    },
    {
      id: "mail",
      label: "Mail",
      icon: <Mail className="w-4 h-4" />,
      always: true,
    },
    {
      id: "attachments",
      label: "Attachments",
      icon: <Paperclip className="w-4 h-4" />,
      always: true,
    },
    {
      id: "disciplinary",
      label: "Disciplinary",
      icon: <BadgeAlert className="w-4 h-4" />,
      always: false,
      condition: showDisciplinary,
    },
    {
      id: "related",
      label: "Related",
      icon: <Users className="w-4 h-4" />,
      always: false,
      condition: hasRelatedRequests,
    },
  ];

  return (
    <div className="bg-white rounded-t-xl overflow-hidden shadow-sm border border-slate-200 border-b-0">
      <div className="flex flex-wrap overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => {
          // Only show tab if it's always visible or its condition is true
          if (tab.always || tab.condition) {
            return (
              <button
                key={tab.id}
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-sky-600 text-sky-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  {tab.label}
                </div>
              </button>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default TabNavigation;
