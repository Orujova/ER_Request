// File: components/email/FolderSidebar.jsx
import React from "react";
import { Inbox, Send, Clock, Trash2, Archive, Flag } from "lucide-react";

const FolderSidebar = ({
  folder,
  handleFolderChange,
  inboxEmails,
  sentEmails,
  colors,
}) => {
  // Folder items for easy mapping
  const folderItems = [
    {
      id: "inbox",
      label: "Inbox",
      icon: <Inbox className="h-3.5 w-3.5 mr-2" />,
      count: inboxEmails.length,
    },
    {
      id: "sent",
      label: "Sent Items",
      icon: <Send className="h-3.5 w-3.5 mr-2" />,
      count: sentEmails.length,
    },
    {
      id: "drafts",
      label: "Drafts",
      icon: <Clock className="h-3.5 w-3.5 mr-2" />,
      count: 0,
    },
    {
      id: "deleted",
      label: "Deleted Items",
      icon: <Trash2 className="h-3.5 w-3.5 mr-2" />,
      count: 0,
    },
    {
      id: "archive",
      label: "Archive",
      icon: <Archive className="h-3.5 w-3.5 mr-2" />,
      count: 0,
    },
    {
      id: "junk",
      label: "Junk Email",
      icon: <Flag className="h-3.5 w-3.5 mr-2" />,
      count: 0,
    },
  ];

  return (
    <div className="w-48 bg-slate-100 border-r border-slate-200 p-4 flex flex-col">
      <div className="font-medium text-slate-700 mb-2 text-sm">Folders</div>

      {folderItems.map((item) => (
        <div
          key={item.id}
          className={`flex items-center ${
            item.id === "inbox" || item.id === "sent"
              ? "p-1.5 mb-0.5"
              : "p-2 mb-1"
          } rounded-md cursor-pointer ${
            folder === item.id ? "text-white" : "hover:bg-slate-200"
          }`}
          onClick={() => handleFolderChange(item.id)}
          style={{
            backgroundColor:
              folder === item.id ? colors.primary : "transparent",
          }}
        >
          {item.icon}
          <span className="text-sm">{item.label}</span>
          {item.count > 0 && (
            <span className="ml-auto bg-white bg-opacity-85 text-slate-700 text-xs rounded-full px-1.5 py-0.5">
              {item.count}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default FolderSidebar;
