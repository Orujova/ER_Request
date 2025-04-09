// File: components/email/EmailList.jsx
import React from "react";
import {
  RefreshCw,
  Filter,
  AlertCircle,
  Check,
  Mail,
  Paperclip,
} from "lucide-react";

const EmailListItem = ({
  email,
  isSelected,
  handleEmailSelect,
  handleEmailDoubleClick,
  formatDate,
}) => {
  return (
    <div
      className={`p-3 border-b border-slate-200 cursor-pointer ${
        isSelected
          ? "bg-cyan-50 border-l-4 border-l-cyan-500"
          : "hover:bg-slate-50"
      } ${!email.IsRead ? "font-medium" : ""}`}
      onClick={() => handleEmailSelect(email)}
      onDoubleClick={() => handleEmailDoubleClick(email)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium text-xs truncate max-w-[65%]">
          {email.SenderName}
        </div>
        <div className="text-xs text-slate-500">
          {formatDate(email.ReceivedDateTime).split(",")[0]}
        </div>
      </div>
      <div className="text-xs mb-1 truncate">{email.Subject}</div>
      <div className="flex items-center">
        {email.HasAttachments && (
          <span className="flex items-center text-xs text-slate-500 mr-2">
            <Paperclip className="h-3 w-3 text-slate-400 mr-1" />
            {email.Attachments ? email.Attachments.length : ""}
          </span>
        )}
      </div>
    </div>
  );
};

const EmailFilter = ({ showReadFilter, isRead, setReadFilter }) => {
  if (!showReadFilter) return null;

  return (
    <div className="absolute left-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-10 w-36 filter-dropdown">
      <div className="p-2 text-xs font-medium text-slate-500 border-b border-slate-200">
        Filter by read status
      </div>
      <div
        className={`p-2 hover:bg-slate-100 cursor-pointer text-sm flex items-center ${
          isRead === "" ? "text-cyan-600 font-medium" : ""
        }`}
        onClick={() => setReadFilter("")}
      >
        {isRead === "" && <Check className="h-3.5 w-3.5 mr-1.5" />}
        <span className={isRead === "" ? "ml-5" : ""}>All</span>
      </div>
      <div
        className={`p-2 hover:bg-slate-100 cursor-pointer text-sm flex items-center ${
          isRead === "true" ? "text-cyan-600 font-medium" : ""
        }`}
        onClick={() => setReadFilter("true")}
      >
        {isRead === "true" && <Check className="h-3.5 w-3.5 mr-1.5" />}
        <span className={isRead === "true" ? "ml-5" : ""}>Read</span>
      </div>
      <div
        className={`p-2 hover:bg-slate-100 cursor-pointer text-sm flex items-center ${
          isRead === "false" ? "text-cyan-600 font-medium" : ""
        }`}
        onClick={() => setReadFilter("false")}
      >
        {isRead === "false" && <Check className="h-3.5 w-3.5 mr-1.5" />}
        <span className={isRead === "false" ? "ml-5" : ""}>Unread</span>
      </div>
    </div>
  );
};

const EmailList = ({
  emails,
  loading,
  errorMessage,
  selectedEmail,
  fetchEmails,
  toggleFilterDropdown,
  showReadFilter,
  isRead,
  setReadFilter,
  handleEmailSelect,
  handleEmailDoubleClick,
  colors,
}) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-72 border-r border-slate-200 flex flex-col bg-white">
      {/* Toolbar */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <button
            className="p-1.5 rounded hover:bg-slate-200"
            onClick={fetchEmails}
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-slate-600" />
          </button>
          <div className="relative">
            <button
              className="p-1.5 rounded hover:bg-slate-200 filter-button"
              title="Filter"
              onClick={toggleFilterDropdown}
            >
              <Filter className="h-4 w-4 text-slate-600" />
            </button>

            {/* Read/Unread Filter Dropdown */}
            <EmailFilter
              showReadFilter={showReadFilter}
              isRead={isRead}
              setReadFilter={setReadFilter}
            />
          </div>
        </div>
        <div className="text-sm text-slate-500">
          {emails.length > 0 ? `${emails.length} email(s)` : "No emails"}
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500"></div>
          </div>
        ) : errorMessage ? (
          <div className="p-4 text-slate-600 text-sm">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
              <span className="font-medium">Info</span>
            </div>
            {errorMessage}
          </div>
        ) : emails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <Mail
              className="h-10 w-10 mb-2"
              style={{ color: colors.primaryLight }}
            />
            <div className="text-sm">No emails found</div>
          </div>
        ) : (
          emails.map((email) => (
            <EmailListItem
              key={email.Id}
              email={email}
              isSelected={selectedEmail && selectedEmail.Id === email.Id}
              handleEmailSelect={handleEmailSelect}
              handleEmailDoubleClick={handleEmailDoubleClick}
              formatDate={formatDate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default EmailList;
