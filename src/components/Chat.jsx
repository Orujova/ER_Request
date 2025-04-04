// components/ChatPanel.jsx
import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Send,
  AtSign,
  X,
  Loader,
  CircleUser,
} from "lucide-react";
import MessageBubble from "./MessageBubble";
import { formatMessageDate } from "../utils/dateFormatters";

// Chat Panel Component
const ChatPanel = ({
  messages = [],
  currentUserId,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  erMembers = [],
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [groupedMessages, setGroupedMessages] = useState({});

  const messageEndRef = useRef(null);
  const mentionInputRef = useRef(null);
  const messageContainerRef = useRef(null);

  // Group messages by date
  useEffect(() => {
    if (!messages || messages.length === 0) {
      setGroupedMessages({});
      return;
    }

    const groups = {};

    messages.forEach((msg) => {
      // Use formattedTimestamp if available, otherwise fall back to timestamp
      const date = new Date(msg.formattedTimestamp || msg.timestamp);

      // Format as YYYY-MM-DD for grouping
      const dateKey = date.toISOString().split("T")[0];

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(msg);
    });

    setGroupedMessages(groups);
  }, [messages]);

  // Handle message change and mention functionality
  const handleMessageChange = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    // Check for @ symbol to trigger mention dropdown
    const lastAtSymbolIndex = value.lastIndexOf("@");
    if (lastAtSymbolIndex !== -1) {
      const query = value.substring(lastAtSymbolIndex + 1).toLowerCase();
      setMentionQuery(query);

      if (query.length >= 0) {
        const filtered = erMembers.filter(
          (member) =>
            member.FullName && member.FullName.toLowerCase().includes(query)
        );
        setFilteredMembers(filtered);
        setShowMentionDropdown(filtered.length > 0);
      } else {
        setFilteredMembers(erMembers);
        setShowMentionDropdown(erMembers.length > 0);
      }
    } else {
      setShowMentionDropdown(false);
    }
  };

  // Select a member from dropdown
  const handleMemberSelect = (member) => {
    const lastAtSymbolIndex = newMessage.lastIndexOf("@");
    if (lastAtSymbolIndex !== -1) {
      const beforeMention = newMessage.substring(0, lastAtSymbolIndex);
      setNewMessage(`${beforeMention}@${member.FullName} `);
    }
    setShowMentionDropdown(false);

    // Focus back on the input
    if (mentionInputRef.current) {
      mentionInputRef.current.focus();
    }
  };

  // Send message wrapper
  const sendMessage = () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);
    setMessageError(null);

    handleSendMessage(newMessage)
      .then((success) => {
        if (success) {
          setNewMessage("");
          setShowMentionDropdown(false);
        }
      })
      .catch((err) => {
        setMessageError(err.message || "Error sending message");
      })
      .finally(() => {
        setSendingMessage(false);
      });
  };

  // Edit message wrapper
  const editMessage = () => {
    if (!editMessageText.trim() || !editingMessageId || sendingMessage) return;

    setSendingMessage(true);
    setMessageError(null);

    handleEditMessage(editingMessageId, editMessageText)
      .then((success) => {
        if (success) {
          setEditingMessageId(null);
          setEditMessageText("");
        }
      })
      .catch((err) => {
        setMessageError(err.message || "Error editing message");
      })
      .finally(() => {
        setSendingMessage(false);
      });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4"
        ref={messageContainerRef}
        style={{
          backgroundColor: "#ffffff",
          backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        {!messages || messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3 bg-cyan-100 text-cyan-600">
              <MessageCircle className="w-5 h-5" />
            </div>
            <p className="text-slate-700">No messages yet</p>
            <p className="text-sm mt-1 text-slate-500">
              Start the conversation
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {Object.keys(groupedMessages)
              .sort()
              .map((dateKey) => {
                const dateGroup = groupedMessages[dateKey];
                const firstMsg = dateGroup[0];
                // Get nice date format for the header
                const dateLabel = formatMessageDate(
                  firstMsg.formattedTimestamp || firstMsg.timestamp
                );

                return (
                  <div key={`date-${dateKey}`} className="mb-4">
                    {/* Date Header */}
                    <div className="flex justify-center mb-3">
                      <div className="bg-slate-100 px-3 py-1 rounded-full text-xs text-slate-600 font-medium">
                        {dateLabel.split(",")[0]}{" "}
                        {/* Just take the date part */}
                      </div>
                    </div>

                    {/* Messages for this date */}
                    {dateGroup.map((msg) => (
                      <MessageBubble
                        key={`msg-${msg.id}`}
                        message={msg}
                        currentUserId={currentUserId}
                        onEdit={setEditingMessageId}
                        onDelete={handleDeleteMessage}
                        editingMessageId={editingMessageId}
                        editMessageText={editMessageText}
                        setEditMessageText={setEditMessageText}
                        handleEditMessage={editMessage}
                      />
                    ))}
                  </div>
                );
              })}
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Error Message Display */}
      {messageError && (
        <div className="px-4 py-2 border-t text-sm flex items-center justify-between bg-rose-50 border-rose-200 text-rose-600">
          <span>{messageError}</span>
          <button
            className="text-inherit hover:opacity-75"
            onClick={() => setMessageError(null)}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t p-3 bg-white" style={{ borderColor: "#e2e8f0" }}>
        <div className="relative">
          <input
            type="text"
            ref={mentionInputRef}
            value={newMessage}
            onChange={handleMessageChange}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message... Use @ to mention"
            className="w-full pl-10 pr-10 py-2.5 rounded-md transition-colors bg-slate-50 border border-slate-200"
            disabled={sendingMessage}
          />
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 disabled:opacity-50 text-slate-400"
            onClick={() => {
              if (!sendingMessage) {
                setNewMessage(newMessage + "@");
                setFilteredMembers(erMembers);
                setShowMentionDropdown(true);
                if (mentionInputRef.current) {
                  mentionInputRef.current.focus();
                }
              }
            }}
            disabled={sendingMessage}
          >
            <AtSign className="w-5 h-5" />
          </button>
          <button
            onClick={sendMessage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 disabled:opacity-50 transition-colors"
            style={{
              color: newMessage.trim() ? "#0891b2" : "#94a3b8",
            }}
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <Loader className="w-5 h-5 animate-spin text-cyan-600" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>

          {/* @mention dropdown */}
          {showMentionDropdown && (
            <div className="absolute bottom-full left-0 w-full mb-1 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto bg-white border border-slate-200">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <button
                    key={`member-${member.Id}`}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors hover:bg-slate-100 text-slate-700"
                    onClick={() => handleMemberSelect(member)}
                  >
                    <CircleUser className="w-4 h-4 text-cyan-600" />
                    <span>{member.FullName}</span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-slate-500">
                  No matching members
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatPanel };
