// components/ChatPopup.jsx
import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { ChatPanel } from "../../components/Chat";

const ChatPopup = ({
  messages = [],
  currentUserId,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
  erMembers = [],
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Calculate unread messages when messages change
  useEffect(() => {
    if (messages && currentUserId) {
      const unread = messages.filter(
        (msg) => !msg.isRead && msg.senderId !== parseInt(currentUserId)
      ).length;
      setUnreadCount(unread);
    }
  }, [messages, currentUserId]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div
          className="bg-white rounded-xl shadow-xl border border-slate-200 w-80 sm:w-96 flex flex-col"
          style={{ height: "500px" }}
        >
          <div
            className="flex items-center justify-between p-3 border-b border-slate-200"
            style={{ backgroundColor: "#0891b2" }}
          >
            <h3 className="font-semibold flex items-center text-white">
              <MessageCircle className="w-4 h-4 mr-2" />
              <span>Chat</span>
              {messages.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white text-cyan-700">
                  {messages.length}
                </span>
              )}
            </h3>
            <button
              className="text-white hover:bg-cyan-700 p-1 rounded-full"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatPanel
              messages={messages}
              currentUserId={currentUserId}
              handleSendMessage={handleSendMessage}
              handleEditMessage={handleEditMessage}
              handleDeleteMessage={handleDeleteMessage}
              erMembers={erMembers}
            />
          </div>
        </div>
      ) : (
        <button
          className="rounded-full p-3 shadow-lg flex items-center justify-center relative"
          style={{ backgroundColor: "#0891b2" }}
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="w-6 h-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
};

export default ChatPopup;
