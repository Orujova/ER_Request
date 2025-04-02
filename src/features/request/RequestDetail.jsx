import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setRequest,
  setMessages,
  setLoading,
  setError,
  clearRequest,
} from "../../redux/slices/requestSlice";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens, getUserId } from "../../utils/authHandler";

// Import components
import RequestHeader from "./DetailHeader";
import TabNavigation from "./TabNavigation";
import { ChatPanel } from "../../components/Chat";
import LoadingState from "../../components/common/LoadingState";

// Import tabs
import CaseInfoTab from "./CaseInfoTab";
import EmployeeInfoTab from "./EmployeeInfoTab";
import MailInfoTab from "./MailInfoTab";
import AttachmentsTab from "./AttachmentsTab";
import DisciplinaryTab from "./DisciplinaryTab";
import RelatedRequestsTab from "./RelatedRequestsTab";

import StatusTimeline from "./StatusTimeline";

import ChatPopup from "./ChatPopup";

function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const request = useSelector((state) => state.request.currentRequest);
  const messages = useSelector((state) => state.request.messages);
  const loading = useSelector((state) => state.request.loading);
  const error = useSelector((state) => state.request.error);

  // State management
  const [activeTab, setActiveTab] = useState("case");
  const [childRequests, setChildRequests] = useState([]);
  const [erMembers, setErMembers] = useState([]);

  // Get current user ID
  const currentUserId = getUserId();

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        dispatch(setLoading(true));
        dispatch(clearRequest());
        await Promise.all([fetchRequestData(), fetchERMembers()]);
        dispatch(setLoading(false));
      } catch (err) {
        dispatch(setError(err.message));
        dispatch(setLoading(false));
      }
    };

    fetchAllData();

    // Clean up when component unmounts
    return () => {
      dispatch(clearRequest());
    };
  }, [id, dispatch]);

  // Fetch request data
  const fetchRequestData = async () => {
    try {
      const { jwtToken } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}/api/ERRequest/${id}`, {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,
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
        status: data.ERRequestStatus,
        employeeInfo: {
          id: data.EmployeeId,
          name: data.EmployeeName,
          badge: data.EmployeeBadge || "",
          project: data.ProjectName,
          projectId: data.ProjectId,
          projectCode: data.ProjectCode,
          position: data.PositionName || "",
          positionId: data.PositionId,
          section: data.SectionName || "",
          sectionId: data.SectionId,
          subSection: data.SubSectionName || "",
          subSectionId: data.SubSectionId,
        },
        mailInfo: {
          to: data.MailToAdresses || "",
          cc: data.MailCcAddresses || "",
          body: data.MailBody || "",
        },
        attachments: {
          presentation: data.PresentationAttach || [],
          act: data.ActAttach || [],
          explanation: data.ExplanationAttach || [],
          general: data.GeneralAttachments || [],
        },
        hyperLinks: (data.ERHyperLinks || []).map((link, index) => ({
          id: data.ERHyperLinkIds?.[index] || index,
          url: link,
        })),
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
        // Timeline dates
        pendingDate: data.PendingDate,
        underReviewDate: data.UnderReviewDate,
        desicionMadeDate: data.DesicionMadeDate,
        reAssignedDate: data.ReAssignedDate,
        decisionCommunicatedDate: data.DecisionCommunicatedDate,
        completedDate: data.CompletedDate,
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
      const { jwtToken } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage?ERRequestId=${requestId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching messages: ${response.status}`);
      }

      const data = await response.json();
      const messages = data[0]?.ERRequestMessages || [];

      if (messages && messages.length > 0) {
        const transformedMessages = messages.map((msg) => ({
          id: msg.Id,
          senderId: msg.AppuserId,
          sender: msg.SenderFullName,
          message: msg.MessageContent,
          timestamp: new Date(msg.CreatedDate).toLocaleString(),
          isRead: msg.IsRead,
          isEdited: msg.IsEdited,
        }));

        dispatch(setMessages(transformedMessages));

        // Mark unread messages as read
        if (currentUserId) {
          const unreadMsgIds = messages
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
      const { jwtToken } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${parentId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching child requests: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.length > 0 && data[0].ERRequests) {
        setChildRequests(data[0].ERRequests);
      } else {
        setChildRequests([]);
      }
    } catch (err) {
      console.error("Error fetching child requests:", err);
    }
  };

  // Fetch ER members for @mention feature
  const fetchERMembers = async () => {
    try {
      const { jwtToken } = getStoredTokens();
      const response = await fetch(
        `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
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

      const { jwtToken } = getStoredTokens();
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
            Authorization: `Bearer ${jwtToken}`,
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

  // Handle attachment updates
  const handleAttachmentsUpdated = () => {
    // Refresh the request data to get updated attachments
    fetchRequestData();
  };

  // Send a new message
  const handleSendMessage = async (messageText) => {
    try {
      const { jwtToken } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const formData = new FormData();
      formData.append("ERRequestId", id);
      formData.append("SenderId", userId);
      formData.append("MessageContent", messageText);

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage/AddERRequestMessage`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error sending message: ${response.status}`);
      }

      // Refresh messages after sending
      await fetchMessages(id);

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      return false;
    }
  };

  // Edit an existing message
  const handleEditMessage = async (messageId, newContent) => {
    try {
      const { jwtToken } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const updateData = {
        MessageId: messageId,
        UserId: parseInt(userId),
        MessageContent: newContent,
      };

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequestMessage/UpdateERRequest`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        throw new Error(`Error updating message: ${response.status}`);
      }

      // Refresh messages to get the correct data from the server
      await fetchMessages(id);

      return true;
    } catch (err) {
      console.error("Error editing message:", err);
      return false;
    }
  };

  // Delete a message
  const handleDeleteMessage = async (messageId) => {
    try {
      const { jwtToken } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const deleteData = {
        MessageId: messageId,
        RequesterId: parseInt(userId),
      };

      const response = await fetch(`${API_BASE_URL}/api/ERRequestMessage`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify(deleteData),
      });

      if (!response.ok) {
        throw new Error(`Error deleting message: ${response.status}`);
      }

      // Refresh messages after deletion
      await fetchMessages(id);

      return true;
    } catch (err) {
      console.error("Error deleting message:", err);
      return false;
    }
  };

  // Navigation handlers
  const handleNavigationToChild = (childId) => {
    navigate(`/request/${childId}`);
  };

  const navigateToParent = (parentId) => {
    navigate(`/request/${parentId}`);
  };

  const navigateToAction = () => {
    navigate(`/request/${id}/action`);
  };

  // Go back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };

  // Render loading state
  if (loading) {
    return <LoadingState message="Loading request details..." />;
  }

  // Helper to render the active tab content
  const renderActiveTabContent = () => {
    switch (activeTab) {
      case "case":
        return <CaseInfoTab request={request} />;
      case "employee":
        return <EmployeeInfoTab request={request} />;
      case "mail":
        return <MailInfoTab request={request} />;
      case "attachments":
        return (
          <AttachmentsTab
            requestId={id}
            presentationAttachments={request?.attachments?.presentation || []}
            actAttachments={request?.attachments?.act || []}
            explanationAttachments={request?.attachments?.explanation || []}
            generalAttachments={request?.attachments?.general || []}
            hyperLinks={request?.hyperLinks || []}
            onAttachmentsUpdated={handleAttachmentsUpdated}
          />
        );
      case "disciplinary":
        return <DisciplinaryTab request={request} />;
      case "related":
        return (
          <RelatedRequestsTab
            request={request}
            childRequests={childRequests}
            handleNavigationToChild={handleNavigationToChild}
            navigateToParent={navigateToParent}
          />
        );
      default:
        return <CaseInfoTab request={request} />;
    }
  };

  // Main component render
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header Section */}
        <RequestHeader
          id={id}
          request={request}
          handleGoBack={handleGoBack}
          navigateToAction={navigateToAction}
        />

        {/* Timeline Component */}
        <StatusTimeline request={request} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6">
          {/* Tabs Navigation */}
          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            hasRelatedRequests={
              Boolean(request?.parentId) || childRequests.length > 0
            }
            showDisciplinary={request?.status >= 2}
          />

          {/* Tab Content */}
          <div className="bg-white rounded-b-xl mb-6 overflow-hidden shadow-sm border border-slate-200 transition-all hover:shadow-md">
            <div className="p-6">{renderActiveTabContent()}</div>
          </div>
        </div>

        {/* Chat Popup (Fixed Position) */}
        <ChatPopup
          messages={messages}
          currentUserId={currentUserId}
          handleSendMessage={handleSendMessage}
          handleEditMessage={handleEditMessage}
          handleDeleteMessage={handleDeleteMessage}
          erMembers={erMembers}
        />
      </div>
    </div>
  );
}

export default RequestDetail;
