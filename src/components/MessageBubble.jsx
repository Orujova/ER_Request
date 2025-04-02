// MessageBubble.jsx
import React, { useState, useRef, useEffect } from "react";
import { Edit2, Trash2, Check, MoreHorizontal } from "lucide-react";

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
  const optionsMenuRef = useRef(null);

  // Enhanced timestamp formatting function for MessageBubble.jsx
  const formatTimestamp = (timestamp) => {
    try {
      let date;

      // Handle different timestamp formats
      if (typeof timestamp === "string") {
        // If timestamp only contains the date part like "2025-04-02"
        if (timestamp.length <= 10) {
          // Add the current time to have a complete date
          const now = new Date();
          const timeString = now.toTimeString().split(" ")[0];
          date = new Date(`${timestamp}T${timeString}`);
        } else {
          // Parse normal datetime string
          date = new Date(timestamp);
        }
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else {
        // If timestamp is invalid, use current time
        date = new Date();
      }

      // Check if date is valid
      if (isNaN(date.getTime())) {
        // If parsing failed, return current time
        date = new Date();
      }

      // Format as HH:MM (24-hour format)
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false, // Use 24-hour format
      });
    } catch (error) {
      console.error("Error formatting timestamp:", error);
      // Return current time as fallback
      return new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
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
        } w-full mb-4`}
      >
        <div className="max-w-[80%]">
          <div className="flex">
            <input
              type="text"
              value={editMessageText}
              onChange={(e) => setEditMessageText(e.target.value)}
              className="w-full px-3 py-2 rounded-l-md bg-slate-100 border border-slate-300 border-r-0"
              style={{
                outline: "none",
              }}
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleEditMessage()}
            />
            <button
              onClick={handleEditMessage}
              className="px-3 py-2 rounded-r-md transition-colors text-white"
              style={{
                backgroundColor: "#0891b2",
              }}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2 mt-2 justify-end">
            <button
              onClick={() => {
                onEdit(null);
                setEditMessageText("");
              }}
              className="text-xs text-slate-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Normal message display
  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } w-full mb-4`}
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

          <div className="flex justify-between items-center mt-1">
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500">
                {formatTimestamp(message.timestamp)}
              </span>

              {message.isEdited && (
                <span className="text-xs text-slate-400">edited</span>
              )}
            </div>

            <div className="flex items-center">
              {isCurrentUser && (
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="p-1 rounded-full transition-colors text-slate-500 hover:bg-slate-200"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              )}

              {isCurrentUser && (
                <div className="flex ml-1">
                  {message.isRead ? (
                    <div className="flex">
                      <Check className="w-3 h-3 text-emerald-500" />
                      <Check className="w-3 h-3 -ml-1 text-emerald-500" />
                    </div>
                  ) : (
                    <div className="flex">
                      <Check className="w-3 h-3 text-slate-400" />
                      <Check className="w-3 h-3 -ml-1 text-slate-400" />
                    </div>
                  )}
                </div>
              )}
            </div>
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
                  onEdit(message.id);
                  setEditMessageText(message.message);
                  setShowOptions(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-left text-slate-700 hover:bg-slate-100"
              >
                <Edit2 className="w-3 h-3 mr-2" />
                Edit
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
