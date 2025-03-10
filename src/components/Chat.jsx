import React, { useState, useRef, useEffect } from "react";
import {
  MessageCircle,
  Edit2,
  Trash2,
  Send,
  AtSign,
  X,
  Check,
  MoreHorizontal,
  Loader,
  CircleUser,
} from "lucide-react";
import { themeColors } from "../styles/theme";

// Message Bubble Component
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
  console.log(isCurrentUser);

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
              className="w-full px-3 py-2 rounded-l-md"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.text,
                border: `1px solid ${themeColors.border}`,
                borderRight: "none",
                outline: "none",
              }}
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleEditMessage()}
            />
            <button
              onClick={handleEditMessage}
              className="px-3 py-2 rounded-r-md transition-colors"
              style={{
                backgroundColor: themeColors.primary,
                color: themeColors.background,
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
              className="text-xs"
              style={{ color: themeColors.textLight }}
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
      <div className="max-w-[80%] group">
        <div
          className={`p-3 rounded-lg ${
            isCurrentUser ? "rounded-br-none" : "rounded-bl-none"
          }`}
          style={{
            backgroundColor: isCurrentUser
              ? themeColors.primary + "30"
              : themeColors.secondary,
            color: themeColors.text,
          }}
        >
          <div className="flex flex-col">
            {!isCurrentUser && (
              <span
                className="text-xs font-medium mb-1"
                style={{ color: themeColors.primary }}
              >
                {message.sender}
              </span>
            )}
            <span className="text-sm whitespace-pre-wrap break-words">
              {message.message}
            </span>
          </div>

          <div className="flex justify-end items-center gap-1 mt-1">
            <span className="text-xs" style={{ color: themeColors.textLight }}>
              {typeof message.timestamp === "string"
                ? new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
            </span>

            {isCurrentUser && (
              <div className="flex">
                {message.isRead ? (
                  <div className="flex">
                    <Check
                      className="w-3 h-3"
                      style={{ color: themeColors.success }}
                    />
                    <Check
                      className="w-3 h-3 -ml-1"
                      style={{ color: themeColors.success }}
                    />
                  </div>
                ) : (
                  <div className="flex">
                    <Check
                      className="w-3 h-3"
                      style={{ color: themeColors.textLight }}
                    />
                    <Check
                      className="w-3 h-3 -ml-1"
                      style={{ color: themeColors.textLight }}
                    />
                  </div>
                )}
              </div>
            )}

            {message.isEdited && (
              <span
                className="text-xs"
                style={{ color: themeColors.textLight }}
              >
                edited
              </span>
            )}
          </div>
        </div>

        {isCurrentUser && (
          <div className="hidden group-hover:flex gap-1 justify-end mt-1">
            <button
              onClick={() => {
                onEdit(message.id);
                setEditMessageText(message.message);
              }}
              className="p-1 rounded-full shadow transition-colors"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.text,
              }}
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(message.id)}
              className="p-1 rounded-full shadow transition-colors"
              style={{
                backgroundColor: themeColors.background,
                color: themeColors.error,
              }}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Chat Panel Component
const ChatPanel = ({
  messages,
  currentUserId,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  erMembers,
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");

  const messageEndRef = useRef(null);
  const mentionInputRef = useRef(null);
  const messageContainerRef = useRef(null);

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
        const filtered = erMembers.filter((member) =>
          member.FullName.toLowerCase().includes(query)
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
      .then(() => {
        setNewMessage("");
        setShowMentionDropdown(false);
      })
      .catch((err) => {
        setMessageError(err.message);
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
      .then(() => {
        setEditingMessageId(null);
        setEditMessageText("");
      })
      .catch((err) => {
        setMessageError(err.message);
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
    <div
      className="rounded-xl overflow-hidden flex flex-col h-[calc(100vh-22rem)]"
      style={{
        backgroundColor: themeColors.background,
        boxShadow: themeColors.cardShadow,
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Chat Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{
          backgroundColor: themeColors.secondary,
          borderColor: themeColors.border,
        }}
      >
        <h3
          className="font-semibold flex items-center gap-2"
          style={{ color: themeColors.text }}
        >
          <MessageCircle
            className="w-4 h-4"
            style={{ color: themeColors.primary }}
          />
          <span>Chat</span>
          {messages.length > 0 && (
            <span
              className="px-2 py-0.5 text-xs rounded-full"
              style={{
                backgroundColor: themeColors.primary + "20",
                color: themeColors.primary,
              }}
            >
              {messages.length}
            </span>
          )}
        </h3>
        <div>
          <button
            className="p-1 rounded-md transition-colors"
            style={{ color: themeColors.textLight }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-5"
        ref={messageContainerRef}
        style={{
          backgroundColor: themeColors.background,
          backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
              style={{
                backgroundColor: themeColors.primary + "20",
                color: themeColors.primary,
              }}
            >
              <MessageCircle className="w-5 h-5" />
            </div>
            <p style={{ color: themeColors.text }}>No messages yet</p>
            <p
              className="text-sm mt-1"
              style={{ color: themeColors.textLight }}
            >
              Start the conversation
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {messages.map((msg) => (
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
            <div ref={messageEndRef} />
          </div>
        )}
      </div>

      {/* Error Message Display */}
      {messageError && (
        <div
          className="px-4 py-2 border-t text-sm flex items-center justify-between"
          style={{
            backgroundColor: themeColors.error + "15",
            borderColor: themeColors.error + "30",
            color: themeColors.error,
          }}
        >
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
      <div className="border-t p-4" style={{ borderColor: themeColors.border }}>
        <div className="relative">
          <input
            type="text"
            ref={mentionInputRef}
            value={newMessage}
            onChange={handleMessageChange}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message... Use @ to mention"
            className="w-full pl-10 pr-10 py-2.5 rounded-md transition-colors"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
            }}
            disabled={sendingMessage}
          />
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 disabled:opacity-50"
            style={{ color: themeColors.textLight }}
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
              color: newMessage.trim()
                ? themeColors.primary
                : themeColors.textLight,
            }}
            disabled={!newMessage.trim() || sendingMessage}
          >
            {sendingMessage ? (
              <Loader
                className="w-5 h-5 animate-spin"
                style={{ color: themeColors.primary }}
              />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>

          {/* @mention dropdown */}
          {showMentionDropdown && (
            <div
              className="absolute bottom-full left-0 w-full mb-1 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto"
              style={{
                backgroundColor: themeColors.background,
                border: `1px solid ${themeColors.border}`,
              }}
            >
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <button
                    key={`member-${member.Id}`}
                    className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors hover:bg-gray-100"
                    style={{
                      color: themeColors.text,
                    }}
                    onClick={() => handleMemberSelect(member)}
                  >
                    <CircleUser
                      className="w-4 h-4"
                      style={{ color: themeColors.primary }}
                    />
                    <span>{member.FullName}</span>
                  </button>
                ))
              ) : (
                <div
                  className="px-4 py-2"
                  style={{ color: themeColors.textLight }}
                >
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
