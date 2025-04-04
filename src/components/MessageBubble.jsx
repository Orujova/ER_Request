// MessageBubble.jsx
import React, { useState, useRef, useEffect } from "react";
import { Edit2, Trash2, X, MoreHorizontal, AlertCircle } from "lucide-react";
import { extractTimeFromFormattedDate } from "../utils/dateFormatters";

const MessageBubble = ({
  message,
  currentUserId,
  onEdit,
  onDelete,
  editingMessageId,
  editMessageText,
  setEditMessageText,
  handleEditMessage,
}) => {
  const isCurrentUser = message.senderId === parseInt(currentUserId);
  const [showOptions, setShowOptions] = useState(false);
  const [showEditError, setShowEditError] = useState(false);
  const optionsMenuRef = useRef(null);

  // Format just the time portion for the message bubble
  const formatMessageTime = (timestamp, formattedTimestamp) => {
    try {
      // First try to extract time from the formatted timestamp
      if (formattedTimestamp) {
        const timeOnly = extractTimeFromFormattedDate(formattedTimestamp);
        if (timeOnly) return timeOnly;
      }

      // Fall back to the standard timestamp
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        });
      }

      // Last resort fallback
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Error formatting message time:", error);
      return "";
    }
  };

  // Close the options menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target)
      ) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If this message is being edited
  if (editingMessageId === message.id) {
    return (
      <div
        className={`flex ${
          isCurrentUser ? "justify-end" : "justify-start"
        } w-full mb-2`}
      >
        <div className="max-w-[80%]">
          <div className="relative">
            <input
              type="text"
              value={editMessageText}
              onChange={(e) => setEditMessageText(e.target.value)}
              className="w-full px-3 py-2 pr-10 rounded-md bg-slate-100 border border-slate-300"
              style={{
                outline: "none",
              }}
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleEditMessage()}
            />
            <button
              onClick={() => {
                onEdit(null);
                setEditMessageText("");
                setShowEditError(false);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Show error message when attempting to edit a read message */}
          {showEditError && (
            <div className="mt-2 text-xs text-rose-600 bg-rose-50 p-2 rounded flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              This message cannot be edited because it has been read.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Normal message display
  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } w-full mb-2 group`}
    >
      <div className="max-w-[80%] relative">
        <div
          className={`p-3 rounded-lg ${
            isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
          }`}
          style={{
            backgroundColor: isCurrentUser
              ? "rgba(8, 145, 178, 0.2)" // Cyan with opacity
              : "#f1f5f9", // Slate-100
            color: "#334155", // Slate-700
          }}
        >
          <div className="flex flex-col">
            {!isCurrentUser && (
              <span
                className="text-xs font-medium mb-1"
                style={{ color: "#0891b2" }} // Cyan-600
              >
                {message.sender}
              </span>
            )}
            <span className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </span>
          </div>

          <div className="flex justify-end items-center mt-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">
                {formatMessageTime(
                  message.timestamp,
                  message.formattedTimestamp
                )}
              </span>

              {message.isEdited && (
                <span className="text-xs text-slate-400 ml-1">edited</span>
              )}
            </div>

            <div className="flex items-center ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {isCurrentUser && (
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 rounded-full transition-colors text-slate-500 hover:bg-slate-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}
            </div>

            {isCurrentUser && (
              <div className="flex ml-1">
                {message.isRead ? (
                  <div className="flex">
                    <svg
                      className="w-3 h-3 text-emerald-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <svg
                      className="w-3 h-3 -ml-1 text-emerald-500"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="flex">
                    <svg
                      className="w-3 h-3 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <svg
                      className="w-3 h-3 -ml-1 text-slate-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Options Menu */}
        {isCurrentUser && showOptions && (
          <div
            ref={optionsMenuRef}
            className="absolute right-0 mt-1 bg-white rounded-md shadow-md border border-slate-200 z-10"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  // Check if message is already read
                  if (message.isRead) {
                    setShowEditError(true);
                    onEdit(message.id);
                    setEditMessageText(message.message);
                  } else {
                    onEdit(message.id);
                    setEditMessageText(message.message);
                    setShowEditError(false);
                  }
                  setShowOptions(false);
                }}
                className={`flex items-center w-full px-4 py-2 text-sm text-left ${
                  message.isRead
                    ? "text-slate-400"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <Edit2 className="w-3 h-3 mr-2" />
                Edit
                {message.isRead && <span className="ml-2 text-xs">(Read)</span>}
              </button>
              <button
                onClick={() => {
                  onDelete(message.id);
                  setShowOptions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-rose-600 hover:bg-slate-100"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
