import React, { useState, useEffect, useRef } from "react";
import { Mail } from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";

// Import optimized components
import EmailHeader from "../../components/email/EmailHeader";
import FolderSidebar from "../../components/email/FolderSidebar";
import EmailList from "../../components/email/EmailList";
import ImprovedEmailView from "../../components/email/EmailView";
import StreamlinedEmailReplyForm from "./EmailReplyForm";
import StatusBar from "../../components/email/StatusBar";
import FullScreenEmail from "../../components/email/FullScreenEmail";

const FinalMailInfoTab = ({ request, requestid }) => {
  // Refs for scroll position tracking
  const containerRef = useRef(null);
  const requestDetailRef = useRef(
    document.querySelector(".request-detail-container") || null
  );

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
  const [showMoreTake, setShowMoreTake] = useState(20);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [fullScreenMode, setFullScreenMode] = useState(false);
  const [expandedMode, setExpandedMode] = useState(false);
  const [statusBarState, setStatusBarState] = useState("connected");

  // Store request detail page scroll position
  const [requestDetailScrollPos, setRequestDetailScrollPos] = useState(0);

  // Email reply state
  const [replyMode, setReplyMode] = useState(null); // Can be "Reply", "ReplyAll", or "Forward"
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Get tokens from auth handler
  const { jwtToken } = getStoredTokens();
  const accessToken = localStorage.getItem("access_token");

  // Check if emails are enabled for this request
  const emailsEnabled = request?.emailsEnabled ?? true;

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

  // Find and store the request detail page container on mount
  useEffect(() => {
    const detailContainer = document.querySelector(".request-detail-container");
    if (detailContainer) {
      requestDetailRef.current = detailContainer;

      // Set up scroll listener
      const handleDetailScroll = () => {
        // Only update when not in reply mode to prevent conflicts
        if (!showReplyForm) {
          setRequestDetailScrollPos(detailContainer.scrollTop);
        }
      };

      detailContainer.addEventListener("scroll", handleDetailScroll);

      return () => {
        detailContainer.removeEventListener("scroll", handleDetailScroll);
      };
    }
  }, [showReplyForm]); // Add showReplyForm as a dependency

  // Fetch emails from API
  const fetchEmails = async () => {
    setLoading(true);
    setStatusBarState("connecting");

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
        // Set status to connected once emails are loaded
        setStatusBarState("connected");
        setEmails(data.Emails || []);

        // If user email wasn't found in localStorage, try to get it from the first email
        if (!userEmail && data.Emails && data.Emails.length > 0) {
          // Look for the first "sent" email to identify the current user
          const sentEmail = data.Emails.find(
            (email) => email.Folder === "sentitems" || email.IsSender
          );

          if (sentEmail) {
            setUserEmail(sentEmail.Sender);
            localStorage.setItem("email", sentEmail.Sender);
          } else if (data.Emails[0].To && data.Emails[0].To.length > 0) {
            // Fallback to first email's recipient (less reliable)
            setUserEmail(data.Emails[0].To[0]);
            localStorage.setItem("email", data.Emails[0].To[0]);
          }
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
        setStatusBarState("error");
        throw new Error(data.Message || "Failed to retrieve emails");
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
      setErrorMessage(err.message);
      setStatusBarState("error");
    } finally {
      setLoading(false);
    }
  };

  // Download attachment function with loading state
  const downloadAttachment = async (attachment) => {
    try {
      setDownloadingAttachmentId(attachment.Id);
      setStatusBarState("syncing");

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

      setStatusBarState("connected");
    } catch (err) {
      console.error("Error downloading attachment:", err);
      alert(`Error downloading ${attachment.Name}: ${err.message}`);
      setStatusBarState("error");
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
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle single click on email item
  const handleEmailSelect = (email) => {
    // Save current scroll position first
    if (requestDetailRef.current) {
      setRequestDetailScrollPos(requestDetailRef.current.scrollTop);
    }

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

    // Restore request detail scroll position
    setTimeout(() => {
      if (requestDetailRef.current) {
        requestDetailRef.current.scrollTop = requestDetailScrollPos;
      }
    }, 0);
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
    // Save scroll position
    if (requestDetailRef.current) {
      setRequestDetailScrollPos(requestDetailRef.current.scrollTop);
    }

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

    // Restore scroll position
    setTimeout(() => {
      if (requestDetailRef.current) {
        requestDetailRef.current.scrollTop = requestDetailScrollPos;
      }
    }, 10);
  };

  const setReadFilter = (value) => {
    setIsRead(value);
    setShowFilterDropdown(false);
  };

  // Toggle filter dropdown
  const toggleFilterDropdown = () => {
    setShowFilterDropdown(!showFilterDropdown);
  };

  // Handle reply button clicks
  const handleReplyClick = (type) => {
    // Save request detail scroll position
    if (requestDetailRef.current) {
      setRequestDetailScrollPos(requestDetailRef.current.scrollTop);
    }

    setReplyMode(type);
    setShowReplyForm(true);
    // Exit full screen mode if active
    setFullScreenMode(false);
  };

  // Handle reply form close
  const handleReplyFormClose = () => {
    setShowReplyForm(false);
    setReplyMode(null);

    // Restore request detail scroll position
    setTimeout(() => {
      if (requestDetailRef.current) {
        requestDetailRef.current.scrollTop = requestDetailScrollPos;
      }
    }, 10);
  };

  // Handle successful email send
  const handleEmailSent = (replyFormScrollPos) => {
    // Show syncing status
    setStatusBarState("syncing");

    // Store the scroll position from the reply form if provided
    // This ensures we have the most recent scroll position
    if (replyFormScrollPos !== undefined) {
      setRequestDetailScrollPos(replyFormScrollPos);
    }

    // Refresh emails list after a short delay
    setTimeout(() => {
      fetchEmails();
      setShowReplyForm(false);
      setReplyMode(null);

      // Restore request detail scroll position
      setTimeout(() => {
        if (requestDetailRef.current) {
          requestDetailRef.current.scrollTop = requestDetailScrollPos;
        }
      }, 100); // Increased timeout for more reliable scrolling
    }, 1000);
  };

  // Toggle full screen mode
  const toggleFullScreen = () => {
    setFullScreenMode(!fullScreenMode);
  };

  // Toggle expanded mode (fill entire RequestDetail page)
  const toggleExpandedMode = () => {
    setExpandedMode(!expandedMode);
    // If going into expanded mode, exit full screen or reply mode
    if (!expandedMode) {
      setFullScreenMode(false);
      if (showReplyForm) {
        setShowReplyForm(false);
        setReplyMode(null);
      }
    }
  };

  // Separate inbox and sent emails if needed
  const inboxEmails = userEmail
    ? emails.filter((email) => email.Sender !== userEmail)
    : emails;
  const sentEmails = userEmail
    ? emails.filter((email) => email.Sender === userEmail)
    : [];

  // If emails are not enabled
  if (!emailsEnabled) {
    return (
      <div className="p-4">
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-amber-500 mr-2 mt-0.5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-xs font-medium text-amber-800">
              Email Management Not Available
            </h3>
            <p className="mt-1 text-xs text-amber-700">
              Email management is not enabled for this request. Please contact
              your administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  // Main UI Render with expanded mode support
  return (
    <div
      ref={containerRef}
      className={`${
        expandedMode ? "fixed inset-0 z-50 bg-white" : "relative"
      } flex flex-col ${
        expandedMode ? "h-screen" : "h-[650px]"
      } bg-slate-50 text-slate-700 overflow-hidden rounded-lg border border-slate-200`}
    >
      {/* Top Bar */}
      <EmailHeader
        colors={colors}
        expandedMode={expandedMode}
        toggleExpandedMode={toggleExpandedMode}
      />

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
          showReadFilter={showFilterDropdown}
          isRead={isRead}
          setReadFilter={setReadFilter}
          handleEmailSelect={handleEmailSelect}
          handleEmailDoubleClick={handleEmailDoubleClick}
          colors={colors}
        />

        {/* Right Panel - Email Content or Reply Form */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {showReplyForm ? (
            <StreamlinedEmailReplyForm
              requestId={requestid}
              selectedEmail={selectedEmail}
              onClose={handleReplyFormClose}
              onSuccess={handleEmailSent}
              replyType={replyMode}
              parentScrollElement={requestDetailRef.current}
            />
          ) : selectedEmail ? (
            <ImprovedEmailView
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
                className="h-10 w-10 mb-2"
                style={{ color: colors.primaryLight }}
              />
              <div className="text-sm mb-1">Select an email to view</div>
              <div className="text-xs">No email selected</div>
            </div>
          )}
        </div>
      </div>

      {/* Status Bar - Now always visible and attached to bottom */}
      <div className="w-full sticky bottom-0 z-10">
        <StatusBar status={statusBarState} />
      </div>
    </div>
  );
};

export default FinalMailInfoTab;
