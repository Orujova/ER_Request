import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRequest,
  addMessage,
  setMessages,
  updateMessage,
  deleteMessage,
} from "./requestSlice";
import {
  Send,
  Paperclip,
  Link2,
  Mail,
  ArrowRight,
  Edit2,
  Trash2,
  Users,
  AtSign,
  Check,
  X,
  AlertTriangle,
  FileText,
  Calendar,
  User,
  MoreHorizontal,
  ExternalLink,
  Loader,
  Clock,
  CheckCircle2,
  Copy,
  MessageCircle,
  ChevronRight,
  HelpCircle,
  BadgeAlert,
  UserRound,
  Building2,
  CircleUser,
  MailOpen,
} from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens, getUserId } from "../../utils/authHandler";
import { themeColors } from "../../styles/theme";

// Helper function to convert ERRequestStatus enum to readable text
const getStatusText = (statusCode) => {
  switch (statusCode) {
    case 0:
      return "Pending";
    case 1:
      return "Under Review";
    case 2:
      return "Decision Made";
    case 3:
      return "Order Created";
    case 4:
      return "Completed";
    case 5:
      return "Order Canceled";
    default:
      return "Unknown";
  }
};

// Helper function to get status color classes
const getStatusColors = (status) => {
  switch (status) {
    case "Pending":
      return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };
    case "Under Review":
      return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
    case "Decision Made":
      return { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" };
    case "Order Created":
      return { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" };
    case "Completed":
      return { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" };
    case "Order Canceled":
      return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
    default:
      return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };
  }
};

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const request = useSelector((state) => state.request.currentRequest);
  const messages = useSelector((state) => state.request.messages);

  // State management
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("case");
  const [childRequests, setChildRequests] = useState([]);
  const [erMembers, setErMembers] = useState([]);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editMessageText, setEditMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  // Refs
  const messageEndRef = useRef(null);
  const mentionInputRef = useRef(null);
  const messageContainerRef = useRef(null);
  const actionMenuRef = useRef(null);

  // Get current user ID
  const currentUserId = getUserId();

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target)
      ) {
        setActionMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchRequestData(), fetchERMembers()]);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Fetch request data
  const fetchRequestData = async () => {
    try {
      const { token } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}/api/ERRequest/${id}`, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching request data: ${response.status}`);
      }

      const data = await response.json();

      // Transform API data to match our component structure
      const transformedRequest = {
        id: data.Id,
        caseId: data.CaseId,
        case: data.CaseName,
        subCaseId: data.SubCaseId,
        subCase: data.SubCaseDescription,
        status: getStatusText(data.ERRequestStatus),
        statusCode: data.ERRequestStatus,
        employeeInfo: {
          id: data.EmployeeId,
          name: data.EmployeeName,
          badge: data.EmployeeBadge,
          project: data.ProjectName,
          projectId: data.ProjectId,
          projectCode: data.ProjectCode,
          position: data.PositionName,
          positionId: data.PositionId,
          section: data.SectionName,
          sectionId: data.SectionId,
          subSection: data.SubSectionName,
          subSectionId: data.SubSectionId,
        },
        mailInfo: {
          to: data.MailToAdresses,
          cc: data.MailCcAddresses,
          body: data.MailBody,
        },
        attachments: [], // API doesn't provide this information
        hyperlinks: data.ERHyperLink ? [data.ERHyperLink] : [],
        erMember: data.ERMember,
        createdDate: data.CreatedDate,
        parentId: data.ParentId,
        requestType: data.RequestType,
        orderNumber: data.OrderNumber,
        note: data.Note,
        reason: data.Reason,
        disciplinaryAction: {
          id: data.DisciplinaryActionId,
          name: data.DisciplinaryActionName,
          resultId: data.DisciplinaryActionResultId,
          resultName: data.DisciplinaryActionResultName,
          violationId: data.DisciplinaryViolationId,
          violationName: data.DisciplinaryViolationName,
        },
        isEligible: data.IsEligible,
        contractEndDate: data.ContractEndDate,
      };

      dispatch(setRequest(transformedRequest));

      // Fetch messages for this request
      await fetchMessages(data.Id);

      // Fetch child requests if this is a parent request
      await fetchChildRequests(data.Id);

      return data;
    } catch (err) {
      console.error("Error fetching request data:", err);
      throw err;
    }
  };

  // Fetch messages for a request
  const fetchMessages = async (requestId) => {
    try {
      const { token } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage?ERRequestId=${requestId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching messages: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0) {
        const transformedMessages = data.map((msg) => ({
          id: msg.Id,
          senderId: msg.SenderId,
          sender: msg.SenderName,
          message: msg.MessageContent,
          timestamp: new Date(msg.CreatedDate).toLocaleString(),
          isRead: msg.IsRead,
          isEdited: msg.IsEdited,
        }));

        dispatch(setMessages(transformedMessages));

        // Mark unread messages as read
        if (currentUserId) {
          const unreadMsgIds = data
            .filter(
              (msg) => !msg.IsRead && msg.SenderId !== parseInt(currentUserId)
            )
            .map((msg) => msg.Id);

          if (unreadMsgIds.length > 0) {
            markMessagesAsRead(unreadMsgIds);
          }
        }
      } else {
        dispatch(setMessages([]));
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Fetch child requests
  const fetchChildRequests = async (parentId) => {
    try {
      const { token } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${parentId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching child requests: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0 && data[0].ERRequests) {
        setChildRequests(data[0].ERRequests);
      }
    } catch (err) {
      console.error("Error fetching child requests:", err);
    }
  };

  // Fetch ER members for @mention feature
  const fetchERMembers = async () => {
    try {
      const { token } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching ER members: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0 && data[0].AppUsers) {
        setErMembers(data[0].AppUsers);
      }
    } catch (err) {
      console.error("Error fetching ER members:", err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (messageIds) => {
    try {
      // Only proceed if we have message IDs
      if (!messageIds || messageIds.length === 0) return;

      const { token } = getStoredTokens();
      const currentUserId = getUserId();

      if (!currentUserId) return;

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage/IsReadMessages?currentUserId=${currentUserId}&ids=${messageIds.join(
          ","
        )}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        console.error("Error marking messages as read");
      }
    } catch (err) {
      console.error("Error marking messages as read:", err);
    }
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      setMessageError(null);

      const { token } = getStoredTokens();
      const userId = getUserId();
      console.log(userId);

      if (!userId) {
        setMessageError("User ID not found");
        setSendingMessage(false);
        return;
      }

      const formData = new FormData();
      formData.append("ERRequestId", id);
      formData.append("SenderId", userId);
      formData.append("MessageContent", newMessage);

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage/AddERRequestMessage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );
      console.log(formData);
      if (!response.ok) {
        throw new Error(`Error sending message: ${response.status}`);
      }

      const result = await response.json();

      if (result && result.Data) {
        // Optimistic update in UI with response data
        dispatch(
          addMessage({
            id: result.Data.Id || Date.now(),
            senderId: parseInt(userId),
            sender: result.Data.SenderName || "Current User",
            message: newMessage,
            timestamp: new Date().toLocaleString(),
            isRead: true,
            isEdited: false,
          })
        );
      } else {
        // Fallback if response structure is different
        dispatch(
          addMessage({
            id: Date.now(),
            senderId: parseInt(userId),
            sender: "Current User",
            message: newMessage,
            timestamp: new Date().toLocaleString(),
            isRead: true,
            isEdited: false,
          })
        );
      }

      setNewMessage("");
      setShowMentionDropdown(false);

      // Refresh messages to get the correct data from the server
      await fetchMessages(id);

      // Scroll to bottom
      if (messageEndRef.current) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      setMessageError(err.message);
      console.error("Error sending message:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  // Edit an existing message
  const handleEditMessage = async () => {
    if (!editMessageText.trim() || !editingMessageId) return;

    try {
      setSendingMessage(true);
      setMessageError(null);

      const { token } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        setMessageError("User ID not found");
        setSendingMessage(false);
        return;
      }

      const updateData = {
        MessageId: editingMessageId,
        UserId: parseInt(userId),
        MessageContent: editMessageText,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage/UpdateERRequest`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating message: ${response.status}`);
      }

      // Optimistic update in UI
      dispatch(
        updateMessage({
          id: editingMessageId,
          message: editMessageText,
          isEdited: true,
        })
      );

      setEditingMessageId(null);
      setEditMessageText("");

      // Refresh messages to get the correct data from the server
      await fetchMessages(id);
    } catch (err) {
      setMessageError(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    try {
      setSendingMessage(true);
      setMessageError(null);

      const { token } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        setMessageError("User ID not found");
        setSendingMessage(false);
        return;
      }

      const deleteData = {
        MessageId: messageId,
        RequesterId: parseInt(userId),
      };

      const response = await fetch(`${API_BASE_URL}/api/ERRequestMessage`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(deleteData),
      });

      if (!response.ok) {
        throw new Error(`Error deleting message: ${response.status}`);
      }

      // Optimistic UI update
      dispatch(deleteMessage(messageId));

      // Refresh messages after deletion
      await fetchMessages(id);
    } catch (err) {
      setMessageError(err.message);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle @mention functionality
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

  // Navigation handlers
  const handleNavigationToChild = (childId) => {
    navigate(`/request/${childId}`);
  };

  const navigateToAction = () => {
    navigate(`/request/${id}/action`);
  };

  // Scroll to the bottom of the messages when new ones arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get status colors
  const statusColors = request
    ? getStatusColors(request.status)
    : getStatusColors("Pending");

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center">
        <div
          className="p-8 flex flex-col items-center justify-center rounded-2xl"
          style={{
            backgroundColor: themeColors.background,
            boxShadow: themeColors.cardShadow,
          }}
        >
          <div className="w-16 h-16 mb-4 relative">
            <div
              className="w-16 h-16 rounded-full animate-pulse"
              style={{ backgroundColor: themeColors.secondaryDark }}
            ></div>
            <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
              <FileText
                className="w-8 h-8"
                style={{ color: themeColors.primary }}
              />
            </div>
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: themeColors.text }}
          >
            Loading Request
          </h2>
          <p className="mb-6" style={{ color: themeColors.textLight }}>
            Please wait while we fetch the request details
          </p>
          <div className="flex items-center justify-center">
            <div
              className="w-2 h-2 rounded-full mx-1 animate-bounce"
              style={{
                backgroundColor: themeColors.primary,
                animationDelay: "0s",
              }}
            ></div>
            <div
              className="w-2 h-2 rounded-full mx-1 animate-bounce"
              style={{
                backgroundColor: themeColors.primary,
                animationDelay: "0.2s",
              }}
            ></div>
            <div
              className="w-2 h-2 rounded-full mx-1 animate-bounce"
              style={{
                backgroundColor: themeColors.primary,
                animationDelay: "0.4s",
              }}
            ></div>
          </div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div
          className="rounded-xl p-8 flex flex-col items-center"
          style={{
            backgroundColor: themeColors.background,
            boxShadow: themeColors.cardShadow,
            border: `1px solid ${themeColors.error}`,
          }}
        >
          <AlertTriangle
            className="w-12 h-12 mb-4"
            style={{ color: themeColors.error }}
          />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: themeColors.error }}
          >
            Error Loading Request
          </h2>
          <p className="mb-6" style={{ color: themeColors.error }}>
            {error}
          </p>
          <button
            className="px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: themeColors.secondary,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
            }}
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Render not found state
  if (!request) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div
          className="rounded-xl p-8 flex flex-col items-center"
          style={{
            backgroundColor: themeColors.background,
            boxShadow: themeColors.cardShadow,
            border: `1px solid ${themeColors.border}`,
          }}
        >
          <FileText
            className="w-12 h-12 mb-4"
            style={{ color: themeColors.textLight }}
          />
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: themeColors.text }}
          >
            Request Not Found
          </h2>
          <p className="mb-6" style={{ color: themeColors.textLight }}>
            The requested information could not be found.
          </p>
          <button
            className="px-4 py-2 rounded-md transition-colors"
            style={{
              backgroundColor: themeColors.primary,
              color: themeColors.background,
            }}
            onClick={() => navigate("/requests")}
          >
            Back to Requests
          </button>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Section */}
      <div
        className="rounded-xl mb-6 overflow-hidden"
        style={{
          backgroundColor: themeColors.background,
          boxShadow: themeColors.cardShadow,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <div className="p-5 md:p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            {/* Request ID and Status */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 w-full lg:w-auto">
              <div>
                <h1
                  className="text-2xl font-bold flex items-center gap-2"
                  style={{ color: themeColors.text }}
                >
                  Request #{id}
                  {request.parentId && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: themeColors.secondary,
                        color: themeColors.textLight,
                        border: `1px solid ${themeColors.border}`,
                      }}
                    >
                      Child Request
                    </span>
                  )}
                </h1>
                <div
                  className="text-sm mt-1 flex items-center gap-1"
                  style={{ color: themeColors.textLight }}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Created {formatDate(request.createdDate)}</span>
                </div>
              </div>

              <div
                className="h-10 w-px mx-2 hidden md:block"
                style={{ backgroundColor: themeColors.border }}
              ></div>

              <div>
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: statusColors.bg,
                    color: statusColors.text,
                    border: `1px solid ${statusColors.border}`,
                  }}
                >
                  {request.status}
                </span>
              </div>

              <div
                className="h-10 w-px mx-2 hidden md:block"
                style={{ backgroundColor: themeColors.border }}
              ></div>

              <div>
                <div
                  className="text-sm font-medium flex items-center gap-1.5"
                  style={{ color: themeColors.text }}
                >
                  <UserRound
                    className="w-4 h-4"
                    style={{ color: themeColors.primary }}
                  />
                  <span>{request.erMember || "Unassigned"}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors w-full lg:w-auto"
                style={{
                  backgroundColor: themeColors.background,
                  color: themeColors.text,
                  border: `1px solid ${themeColors.border}`,
                }}
                onClick={() => window.history.back()}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>

              <button
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors w-full lg:w-auto"
                style={{
                  backgroundColor: themeColors.primary,
                  color: themeColors.background,
                }}
                onClick={navigateToAction}
              >
                <ExternalLink className="w-4 h-4" />
                Go to Action
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
          {/* Tabs Navigation */}
          <div
            className="rounded-t-xl overflow-hidden"
            style={{
              backgroundColor: themeColors.background,
              boxShadow: themeColors.cardShadow,
              border: `1px solid ${themeColors.border}`,
              borderBottom: "none",
            }}
          >
            <div className="flex flex-wrap overflow-x-auto" aria-label="Tabs">
              <button
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "case" ? "" : "border-transparent"
                }`}
                style={{
                  borderColor:
                    activeTab === "case" ? themeColors.primary : "transparent",
                  color:
                    activeTab === "case"
                      ? themeColors.primary
                      : themeColors.textLight,
                }}
                onClick={() => setActiveTab("case")}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Case Info
                </div>
              </button>
              <button
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "employee" ? "" : "border-transparent"
                }`}
                style={{
                  borderColor:
                    activeTab === "employee"
                      ? themeColors.primary
                      : "transparent",
                  color:
                    activeTab === "employee"
                      ? themeColors.primary
                      : themeColors.textLight,
                }}
                onClick={() => setActiveTab("employee")}
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Employee
                </div>
              </button>
              <button
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "mail" ? "" : "border-transparent"
                }`}
                style={{
                  borderColor:
                    activeTab === "mail" ? themeColors.primary : "transparent",
                  color:
                    activeTab === "mail"
                      ? themeColors.primary
                      : themeColors.textLight,
                }}
                onClick={() => setActiveTab("mail")}
              >
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Mail
                </div>
              </button>
              <button
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "attachments" ? "" : "border-transparent"
                }`}
                style={{
                  borderColor:
                    activeTab === "attachments"
                      ? themeColors.primary
                      : "transparent",
                  color:
                    activeTab === "attachments"
                      ? themeColors.primary
                      : themeColors.textLight,
                }}
                onClick={() => setActiveTab("attachments")}
              >
                <div className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4" />
                  Attachments
                </div>
              </button>
              {request.statusCode >= 2 && (
                <button
                  className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "disciplinary" ? "" : "border-transparent"
                  }`}
                  style={{
                    borderColor:
                      activeTab === "disciplinary"
                        ? themeColors.primary
                        : "transparent",
                    color:
                      activeTab === "disciplinary"
                        ? themeColors.primary
                        : themeColors.textLight,
                  }}
                  onClick={() => setActiveTab("disciplinary")}
                >
                  <div className="flex items-center gap-2">
                    <BadgeAlert className="w-4 h-4" />
                    Disciplinary
                  </div>
                </button>
              )}
              {(request.parentId || childRequests.length > 0) && (
                <button
                  className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "related" ? "" : "border-transparent"
                  }`}
                  style={{
                    borderColor:
                      activeTab === "related"
                        ? themeColors.primary
                        : "transparent",
                    color:
                      activeTab === "related"
                        ? themeColors.primary
                        : themeColors.textLight,
                  }}
                  onClick={() => setActiveTab("related")}
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Related
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div
            className="rounded-b-xl mb-6 overflow-hidden"
            style={{
              backgroundColor: themeColors.background,
              boxShadow: themeColors.cardShadow,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            {/* Case Info Tab Content */}
            <div className={`p-6 ${activeTab !== "case" && "hidden"}`}>
              <h3
                className="text-lg font-semibold mb-5 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <FileText
                  className="w-5 h-5"
                  style={{ color: themeColors.primary }}
                />
                Case Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Case Name
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.case}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Sub Case
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.subCase}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Created Date
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {formatDate(request.createdDate)}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    ER Member
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.erMember}
                  </div>
                </div>
              </div>
            </div>

            {/* Employee Info Tab Content */}
            <div className={`p-6 ${activeTab !== "employee" && "hidden"}`}>
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    backgroundColor: themeColors.primary + "20",
                    color: themeColors.primary,
                  }}
                >
                  {request.employeeInfo.name
                    ? request.employeeInfo.name.charAt(0)
                    : "E"}
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: themeColors.text }}
                  >
                    {request.employeeInfo.name}
                  </h3>
                  <p style={{ color: themeColors.textLight }}>
                    {request.employeeInfo.position || "Position not specified"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Employee ID
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.employeeInfo.id}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Badge Number
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.employeeInfo.badge}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Project Name
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.employeeInfo.project}
                  </div>
                </div>

                <div
                  className="p-4 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <div
                    className="font-medium mb-1"
                    style={{ color: themeColors.textLight }}
                  >
                    Project Code
                  </div>
                  <div
                    className="font-medium"
                    style={{ color: themeColors.text }}
                  >
                    {request.employeeInfo.projectCode}
                  </div>
                </div>

                {request.employeeInfo.section && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.secondary,
                      border: `1px solid ${themeColors.border}`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Section
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.employeeInfo.section}
                    </div>
                  </div>
                )}

                {request.employeeInfo.subSection && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.secondary,
                      border: `1px solid ${themeColors.border}`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Sub-Section
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.employeeInfo.subSection}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mail Info Tab Content */}
            <div className={`p-6 ${activeTab !== "mail" && "hidden"}`}>
              <div className="flex items-center gap-2 mb-5">
                <MailOpen
                  className="w-5 h-5"
                  style={{ color: themeColors.primary }}
                />
                <h3
                  className="text-lg font-semibold"
                  style={{ color: themeColors.text }}
                >
                  Mail Information
                </h3>
              </div>

              <div className="flex flex-col gap-6">
                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: themeColors.border }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center gap-2"
                    style={{
                      backgroundColor: themeColors.secondary,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      To
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {request.mailInfo.to ? (
                        request.mailInfo.to.split(";").map((email, idx) => (
                          <span
                            key={`to-${idx}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: themeColors.primary + "15",
                              color: themeColors.primary,
                            }}
                          >
                            {email.trim()}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: themeColors.textLight }}>
                          No recipients specified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: themeColors.border }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center gap-2"
                    style={{
                      backgroundColor: themeColors.secondary,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      CC
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {request.mailInfo.cc ? (
                        request.mailInfo.cc.split(";").map((email, idx) => (
                          <span
                            key={`cc-${idx}`}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: themeColors.primary + "15",
                              color: themeColors.primary,
                            }}
                          >
                            {email.trim()}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: themeColors.textLight }}>
                          No CC recipients
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: themeColors.border }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center gap-2"
                    style={{
                      backgroundColor: themeColors.secondary,
                      borderColor: themeColors.border,
                    }}
                  >
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      Email Content
                    </div>
                  </div>
                  <div className="p-4">
                    {request.mailInfo.body ? (
                      <div
                        className="p-4 rounded whitespace-pre-wrap"
                        style={{
                          backgroundColor: themeColors.secondary,
                          color: themeColors.text,
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        {request.mailInfo.body}
                      </div>
                    ) : (
                      <span style={{ color: themeColors.textLight }}>
                        No email content
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Attachments Tab Content */}
            <div className={`p-6 ${activeTab !== "attachments" && "hidden"}`}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: themeColors.border }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center gap-2"
                    style={{
                      backgroundColor: themeColors.secondary,
                      borderColor: themeColors.border,
                    }}
                  >
                    <Paperclip
                      className="w-4 h-4"
                      style={{ color: themeColors.primary }}
                    />
                    <h3
                      className="font-semibold"
                      style={{ color: themeColors.text }}
                    >
                      Attachments
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      {request.attachments && request.attachments.length > 0 ? (
                        request.attachments.map((file, index) => (
                          <button
                            key={`file-${index}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-left w-full transition-colors"
                            style={{
                              backgroundColor: themeColors.secondary,
                              color: themeColors.text,
                              border: `1px solid ${themeColors.border}`,
                            }}
                          >
                            <Paperclip
                              className="w-4 h-4"
                              style={{ color: themeColors.textLight }}
                            />
                            {file}
                          </button>
                        ))
                      ) : (
                        <div
                          className="text-center py-8"
                          style={{ color: themeColors.textLight }}
                        >
                          <Paperclip
                            className="w-8 h-8 mx-auto mb-2"
                            style={{ color: themeColors.border }}
                          />
                          <p>No attachments</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-xl overflow-hidden border"
                  style={{ borderColor: themeColors.border }}
                >
                  <div
                    className="px-4 py-3 border-b flex items-center gap-2"
                    style={{
                      backgroundColor: themeColors.secondary,
                      borderColor: themeColors.border,
                    }}
                  >
                    <Link2
                      className="w-4 h-4"
                      style={{ color: themeColors.primary }}
                    />
                    <h3
                      className="font-semibold"
                      style={{ color: themeColors.text }}
                    >
                      Hyperlinks
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex flex-col gap-2">
                      {request.hyperlinks && request.hyperlinks.length > 0 ? (
                        request.hyperlinks.map((link, index) => (
                          <a
                            key={`link-${index}`}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-left w-full transition-colors group"
                            style={{
                              backgroundColor: themeColors.secondary,
                              color: themeColors.text,
                              border: `1px solid ${themeColors.border}`,
                            }}
                          >
                            <Link2
                              className="w-4 h-4"
                              style={{ color: themeColors.textLight }}
                            />
                            <span className="truncate flex-1">{link}</span>
                            <ExternalLink
                              className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: themeColors.primary }}
                            />
                          </a>
                        ))
                      ) : (
                        <div
                          className="text-center py-8"
                          style={{ color: themeColors.textLight }}
                        >
                          <Link2
                            className="w-8 h-8 mx-auto mb-2"
                            style={{ color: themeColors.border }}
                          />
                          <p>No hyperlinks</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disciplinary Actions Tab Content */}
            <div className={`p-6 ${activeTab !== "disciplinary" && "hidden"}`}>
              <h3
                className="text-lg font-semibold mb-5 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <BadgeAlert
                  className="w-5 h-5"
                  style={{ color: themeColors.warning }}
                />
                Disciplinary Actions
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {request.disciplinaryAction?.name && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Action Type
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.disciplinaryAction.name}
                    </div>
                  </div>
                )}

                {request.disciplinaryAction?.resultName && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Action Result
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.disciplinaryAction.resultName}
                    </div>
                  </div>
                )}

                {request.disciplinaryAction?.violationName && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Violation Type
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.disciplinaryAction.violationName}
                    </div>
                  </div>
                )}

                {request.contractEndDate && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Contract End Date
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {formatDate(request.contractEndDate)}
                    </div>
                  </div>
                )}

                {request.isEligible !== undefined && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Eligibility
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.isEligible ? "Eligible" : "Not Eligible"}
                    </div>
                  </div>
                )}
                {request.orderNumber && (
                  <div
                    className="p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Order Number
                    </div>
                    <div
                      className="font-medium"
                      style={{ color: themeColors.text }}
                    >
                      {request.orderNumber}
                    </div>
                  </div>
                )}

                {request.note && (
                  <div
                    className="col-span-2 p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Note
                    </div>
                    <div
                      className="whitespace-pre-wrap"
                      style={{ color: themeColors.text }}
                    >
                      {request.note}
                    </div>
                  </div>
                )}

                {request.reason && (
                  <div
                    className="col-span-2 p-4 rounded-xl"
                    style={{
                      backgroundColor: themeColors.warning + "15",
                      border: `1px solid ${themeColors.warning}30`,
                    }}
                  >
                    <div
                      className="font-medium mb-1"
                      style={{ color: themeColors.textLight }}
                    >
                      Reason
                    </div>
                    <div
                      className="whitespace-pre-wrap"
                      style={{ color: themeColors.text }}
                    >
                      {request.reason}
                    </div>
                  </div>
                )}
              </div>

              {!request.disciplinaryAction?.name &&
                !request.disciplinaryAction?.resultName &&
                !request.disciplinaryAction?.violationName &&
                !request.contractEndDate &&
                request.isEligible === undefined && (
                  <div
                    className="text-center py-10 rounded-xl"
                    style={{
                      backgroundColor: themeColors.secondary,
                      color: themeColors.textLight,
                      border: `1px solid ${themeColors.border}`,
                    }}
                  >
                    <AlertTriangle
                      className="w-8 h-8 mx-auto mb-2"
                      style={{ color: themeColors.border }}
                    />
                    <p>No disciplinary action information available</p>
                  </div>
                )}
            </div>
            {/* Related Requests Tab Content */}
            <div className={`p-6 ${activeTab !== "related" && "hidden"}`}>
              <h3
                className="text-lg font-semibold mb-5 flex items-center gap-2"
                style={{ color: themeColors.text }}
              >
                <Users
                  className="w-5 h-5"
                  style={{ color: themeColors.primary }}
                />
                Related Requests
              </h3>

              {request.parentId && (
                <div className="mb-6">
                  <h4
                    className="font-medium mb-3 flex items-center gap-2"
                    style={{ color: themeColors.text }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: themeColors.primary + "20",
                        color: themeColors.primary,
                      }}
                    >
                      P
                    </span>
                    Parent Request
                  </h4>
                  <button
                    onClick={() => navigate(`/request/${request.parentId}`)}
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-left w-full transition-colors"
                    style={{
                      backgroundColor: themeColors.primary + "15",
                      color: themeColors.text,
                      border: `1px solid ${themeColors.primary}30`,
                    }}
                  >
                    <ArrowRight
                      className="w-4 h-4 rotate-180"
                      style={{ color: themeColors.primary }}
                    />
                    <span style={{ color: themeColors.text }}>
                      Request #{request.parentId}
                    </span>
                  </button>
                </div>
              )}

              {childRequests.length > 0 && (
                <div>
                  <h4
                    className="font-medium mb-3 flex items-center gap-2"
                    style={{ color: themeColors.text }}
                  >
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                      style={{
                        backgroundColor: themeColors.success + "20",
                        color: themeColors.success,
                      }}
                    >
                      C
                    </span>
                    Child Requests
                  </h4>
                  <div className="space-y-3">
                    {childRequests.map((child) => (
                      <button
                        key={`child-${child.Id}`}
                        onClick={() => handleNavigationToChild(child.Id)}
                        className="inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left w-full transition-colors"
                        style={{
                          backgroundColor: themeColors.secondary,
                          color: themeColors.text,
                          border: `1px solid ${themeColors.border}`,
                        }}
                      >
                        <div>
                          <span
                            className="font-medium"
                            style={{ color: themeColors.text }}
                          >
                            Request #{child.Id}
                          </span>
                          <p
                            className="text-sm mt-1"
                            style={{ color: themeColors.textLight }}
                          >
                            {child.EmployeeFullName}
                          </p>
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: themeColors.textLight }}
                          >
                            {child.SubCaseDescription}
                          </p>
                        </div>
                        <ChevronRight
                          className="w-4 h-4"
                          style={{ color: themeColors.textLight }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!request.parentId && childRequests.length === 0 && (
                <div
                  className="text-center py-10 rounded-xl"
                  style={{
                    backgroundColor: themeColors.secondary,
                    color: themeColors.textLight,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <Users
                    className="w-8 h-8 mx-auto mb-2"
                    style={{ color: themeColors.border }}
                  />
                  <p>No related requests found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Takes 1/3 of the space */}
        <div className="space-y-6">
          {/* Chat Panel */}
          <div
            className="rounded-xl overflow-hidden flex flex-col h-[calc(100vh-22rem)]"
            style={{
              backgroundColor: themeColors.background,
              boxShadow: themeColors.cardShadow,
              border: `1px solid ${themeColors.border}`,
            }}
          >
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

            <div
              className="flex-1 overflow-y-auto p-5"
              ref={messageContainerRef}
              style={{ backgroundColor: themeColors.background }}
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
                <div className="flex flex-col gap-5">
                  {messages.map((msg) => (
                    <div
                      key={`msg-${msg.id}`}
                      className={`flex flex-col ${
                        msg.senderId === parseInt(currentUserId)
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                          style={{
                            backgroundColor:
                              msg.senderId === parseInt(currentUserId)
                                ? themeColors.primary + "20"
                                : themeColors.secondary,
                            color:
                              msg.senderId === parseInt(currentUserId)
                                ? themeColors.primary
                                : themeColors.textLight,
                          }}
                        >
                          {msg.sender ? msg.sender.charAt(0) : "?"}
                        </div>
                        <span
                          className="text-sm font-medium"
                          style={{ color: themeColors.text }}
                        >
                          {msg.sender}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: themeColors.textLight }}
                        >
                          {typeof msg.timestamp === "string"
                            ? msg.timestamp
                            : msg.timestamp.toLocaleString()}
                        </span>
                        {msg.isEdited && (
                          <span
                            className="text-xs"
                            style={{ color: themeColors.textLight }}
                          >
                            (edited)
                          </span>
                        )}
                      </div>

                      {editingMessageId === msg.id ? (
                        <div className="w-full max-w-md">
                          <div className="flex">
                            <input
                              type="text"
                              value={editMessageText}
                              onChange={(e) =>
                                setEditMessageText(e.target.value)
                              }
                              className="w-full px-3 py-2 rounded-l-md"
                              style={{
                                backgroundColor: themeColors.background,
                                color: themeColors.text,
                                border: `1px solid ${themeColors.border}`,
                                borderRight: "none",
                                outline: "none",
                              }}
                              autoFocus
                              onKeyPress={(e) =>
                                e.key === "Enter" && handleEditMessage()
                              }
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
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => {
                                setEditingMessageId(null);
                                setEditMessageText("");
                              }}
                              className="text-xs"
                              style={{ color: themeColors.textLight }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative group">
                          <div
                            className="max-w-md p-3 rounded-lg"
                            style={{
                              backgroundColor:
                                msg.senderId === parseInt(currentUserId)
                                  ? themeColors.primary + "15"
                                  : themeColors.secondary,
                              color: themeColors.text,
                            }}
                          >
                            <span className="text-sm whitespace-pre-wrap break-words">
                              {msg.message}
                            </span>
                          </div>

                          {msg.senderId === parseInt(currentUserId) && (
                            <div className="absolute top-0 right-0 -mt-2 -mr-2 hidden group-hover:flex gap-1">
                              <button
                                onClick={() => {
                                  setEditingMessageId(msg.id);
                                  setEditMessageText(msg.message);
                                }}
                                className="p-1.5 rounded-full shadow transition-colors"
                                style={{
                                  backgroundColor: themeColors.background,
                                  color: themeColors.text,
                                }}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="p-1.5 rounded-full shadow transition-colors"
                                style={{
                                  backgroundColor: themeColors.background,
                                  color: themeColors.error,
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            {/* Message error display */}
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

            {/* Message input */}
            <div
              className="border-t p-4"
              style={{ borderColor: themeColors.border }}
            >
              <div className="relative">
                <input
                  type="text"
                  ref={mentionInputRef}
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyPress={(e) =>
                    e.key === "Enter" && !sendingMessage && handleSendMessage()
                  }
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
                  onClick={handleSendMessage}
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
                          className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors"
                          style={{
                            color: themeColors.text,
                            hoverColor: themeColors.secondary,
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
        </div>
      </div>
    </div>
  );
}

export default RequestDetail;
