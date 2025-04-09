// File: components/email/EREmailInterface.jsx
import React, { useState, useEffect } from "react";
import { Mail } from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

// Import components
import EmailHeader from "../../components/email/EmailHeader";
import FolderSidebar from "../../components/email/FolderSidebar";
import EmailList from "../../components/email/EmailList";
import EmailView from "../../components/email/EmailView";
import EmailReplyForm from "./EmailReplyForm";
import StatusBar from "../../components/email/StatusBar";
import FullScreenEmail from "../../components/email/FullScreenEmail";

const EREmailInterface = ({ requestid }) => {
  // State Management
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [folder, setFolder] = useState("inbox");
  const [isRead, setIsRead] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [page, setPage] = useState(1);
  const [showMoreTake, setShowMoreTake] = useState(10);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [fullScreenMode, setFullScreenMode] = useState(false);

  // Email reply state
  const [replyMode, setReplyMode] = useState(null); // Can be "Reply", "ReplyAll", or "Forward"
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Filter state moved from sidebar to toolbar
  const [showReadFilter, setShowReadFilter] = useState(false);

  // Get tokens from auth handler
  const { jwtToken } = getStoredTokens();
  const accessToken = localStorage.getItem("access_token");

  // Colors theme for consistent styling
  const colors = {
    primary: "#0891b2",
    primaryLight: "#22d3ee",
    primaryDark: "#0e7490",
    primaryGradientStart: "#0891b2",
    primaryGradientEnd: "#0e7490",
    primaryHover: "#0369a1",
    background: "#f8fafc",
    border: "#e2e8f0",
    text: "#334155",
    textLight: "#64748b",
  };

  // Fetch emails from API
  const fetchEmails = async () => {
    setLoading(true);
    try {
      if (!accessToken) {
        throw new Error("Access token not found");
      }

      const isReadParam = isRead !== "" ? `&IsRead=${isRead}` : "";

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/GetUserEmails?AccessToken=${accessToken}&ERRequestId=${requestid}&Page=${page}&ShowMore.Take=${showMoreTake}&Folder=${folder}${isReadParam}`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch emails");
      }

      const data = await response.json();

      if (data.IsSuccess) {
        setEmails(data.Emails || []);

        // If user email wasn't found in localStorage, try to get it from the first email
        if (!userEmail && data.Emails && data.Emails.length > 0) {
          const firstEmail = data.Emails[0];
          setUserEmail(firstEmail.Sender);
          localStorage.setItem("email", firstEmail.Sender);
        }

        if (data.Emails && data.Emails.length > 0 && !selectedEmail) {
          setSelectedEmail(data.Emails[0]);
        }

        if (!data.Emails || data.Emails.length === 0) {
          setErrorMessage(data.Message || "No emails found");
        } else {
          setErrorMessage("");
        }
      } else {
        throw new Error(data.Message || "Failed to retrieve emails");
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Download attachment function with loading state
  const downloadAttachment = async (attachment) => {
    try {
      setDownloadingAttachmentId(attachment.Id);

      const response = await fetch(attachment.DownloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download attachment");
      }

      // Convert the response to a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.Name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Error downloading attachment:", err);
      alert(`Error downloading ${attachment.Name}: ${err.message}`);
    } finally {
      setDownloadingAttachmentId(null);
    }
  };

  // Load emails on component mount and when folder or isRead changes
  useEffect(() => {
    // Try to get user email from localStorage
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }

    fetchEmails();
  }, [folder, isRead]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".filter-dropdown") &&
        !event.target.closest(".filter-button")
      ) {
        setShowReadFilter(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle single click on email item
  const handleEmailSelect = (email) => {
    setSelectedEmail(email);
    // Close reply form if open
    if (showReplyForm) {
      setShowReplyForm(false);
      setReplyMode(null);
    }
    // Exit full screen mode if active
    if (fullScreenMode) {
      setFullScreenMode(false);
    }
  };

  // Handle double click on email item - open in full screen
  const handleEmailDoubleClick = (email) => {
    setSelectedEmail(email);
    setFullScreenMode(true);
    // Close reply form if open
    if (showReplyForm) {
      setShowReplyForm(false);
      setReplyMode(null);
    }
  };

  const handleFolderChange = (newFolder) => {
    setFolder(newFolder);
    setSelectedEmail(null);
    // Close reply form if open
    if (showReplyForm) {
      setShowReplyForm(false);
      setReplyMode(null);
    }
    // Exit full screen mode if active
    if (fullScreenMode) {
      setFullScreenMode(false);
    }
  };

  const setReadFilter = (value) => {
    setIsRead(value);
    setShowReadFilter(false);
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setShowReadFilter(!showReadFilter);
  };

  // Handle reply button clicks
  const handleReplyClick = (type) => {
    setReplyMode(type);
    setShowReplyForm(true);
    // Exit full screen mode if active
    setFullScreenMode(false);
  };

  // Handle reply form close
  const handleReplyFormClose = () => {
    setShowReplyForm(false);
    setReplyMode(null);
  };

  // Handle successful email send
  const handleEmailSent = () => {
    // Refresh emails list after a short delay
    setTimeout(() => {
      fetchEmails();
      setShowReplyForm(false);
      setReplyMode(null);
    }, 1000);
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    setFullScreenMode(!fullScreenMode);
  };

  // Separate inbox and sent emails if needed
  const inboxEmails = userEmail
    ? emails.filter((email) => email.Sender !== userEmail)
    : emails;
  const sentEmails = userEmail
    ? emails.filter((email) => email.Sender === userEmail)
    : [];

  // Full screen email view
  if (fullScreenMode && selectedEmail) {
    return (
      <FullScreenEmail
        selectedEmail={selectedEmail}
        userEmail={userEmail}
        toggleFullScreen={toggleFullScreen}
        handleReplyClick={handleReplyClick}
        downloadAttachment={downloadAttachment}
        downloadingAttachmentId={downloadingAttachmentId}
        colors={colors}
      />
    );
  }

  // Main UI Render (normal view)
  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-700">
      {/* Top Bar */}
      <EmailHeader colors={colors} />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Folders */}
        <FolderSidebar
          folder={folder}
          handleFolderChange={handleFolderChange}
          inboxEmails={inboxEmails}
          sentEmails={sentEmails}
          colors={colors}
        />

        {/* Middle Column - Email List */}
        <EmailList
          emails={emails}
          loading={loading}
          errorMessage={errorMessage}
          selectedEmail={selectedEmail}
          fetchEmails={fetchEmails}
          toggleFilterDropdown={toggleFilterDropdown}
          showReadFilter={showReadFilter}
          isRead={isRead}
          setReadFilter={setReadFilter}
          handleEmailSelect={handleEmailSelect}
          handleEmailDoubleClick={handleEmailDoubleClick}
          colors={colors}
        />

        {/* Right Panel - Email Content or Reply Form */}
        <div className="flex-1 flex flex-col bg-white">
          {showReplyForm ? (
            <EmailReplyForm
              requestId={requestid}
              selectedEmail={selectedEmail}
              onClose={handleReplyFormClose}
              onSuccess={handleEmailSent}
              replyType={replyMode}
            />
          ) : selectedEmail ? (
            <EmailView
              selectedEmail={selectedEmail}
              userEmail={userEmail}
              handleReplyClick={handleReplyClick}
              toggleFullScreen={toggleFullScreen}
              downloadAttachment={downloadAttachment}
              downloadingAttachmentId={downloadingAttachmentId}
              colors={colors}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
              <Mail
                className="h-16 w-16 mb-3"
                style={{ color: colors.primaryLight }}
              />
              <div className="text-lg mb-1">Select an email to view</div>
              <div className="text-sm mt-1">No email selected</div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar />
    </div>
  );
};

export default EREmailInterface;
