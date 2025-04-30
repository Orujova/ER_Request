import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

// Import selectors and thunks
import {
  selectCurrentRequest,
  selectMessages,
  selectIsLoading,
  selectError,
  selectERMembers,
  selectChildRequests,
  selectIsMessagesLoading,
} from "../../redux/slices/requestSlice";

import {
  fetchRequestData,
  fetchERMembers,
  fetchChildRequests,
  sendMessage,
  editMessage,
  deleteMessageThunk,
} from "../../redux/slices/requestThunks";

// Import components
import RequestHeader from "./DetailHeader";
import TabNavigation from "./TabNavigation";
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

// Import user info utility
import { getUserId } from "../../utils/authHandler";

function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Use selectors for Redux state
  const request = useSelector(selectCurrentRequest);
  const messages = useSelector(selectMessages);
  const loading = useSelector(selectIsLoading);
  const error = useSelector(selectError);
  const erMembers = useSelector(selectERMembers);
  const childRequests = useSelector(selectChildRequests);
  const messagesLoading = useSelector(selectIsMessagesLoading);

  // State management
  const [activeTab, setActiveTab] = useState("case");

  // Get current user ID
  const currentUserId = getUserId();

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch request data (which also fetches messages)
        await dispatch(fetchRequestData(id)).unwrap();

        // Fetch ER members for @mention feature
        await dispatch(fetchERMembers()).unwrap();

        // Fetch child requests if this is a parent request
        await dispatch(fetchChildRequests(id)).unwrap();
      } catch (err) {
        console.error("Error fetching initial data:", err);
      }
    };

    fetchAllData();
  }, [id, dispatch]);

  // Handle attachment updates - refreshes the request data
  const handleAttachmentsUpdated = () => {
    dispatch(fetchRequestData(id));
  };

  // Send a new message using the thunk
  const handleSendMessage = async (messageText) => {
    try {
      await dispatch(sendMessage({ requestId: id, messageText })).unwrap();
      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      return false;
    }
  };

  // Edit message using the thunk
  const handleEditMessage = async (messageId, newContent) => {
    try {
      // Check if the message is already read before sending the request
      const messageToEdit = messages.find((msg) => msg.id === messageId);
      if (messageToEdit && messageToEdit.isRead) {
        console.log("Cannot edit message: The message has already been read");
        return false;
      }

      await dispatch(
        editMessage({
          messageId,
          newContent,
          requestId: id,
        })
      ).unwrap();

      return true;
    } catch (err) {
      console.error("Error editing message:", err);
      return false;
    }
  };

  // Delete a message using the thunk
  const handleDeleteMessage = async (messageId) => {
    try {
      await dispatch(
        deleteMessageThunk({
          messageId,
          requestId: id,
        })
      ).unwrap();

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
        return (
          <div className="p-6">
            <CaseInfoTab request={request} />
          </div>
        );
      case "employee":
        return (
          <div className="p-6">
            <EmployeeInfoTab request={request} />
          </div>
        );
      case "mail":
        return <MailInfoTab request={request} requestid={id} />;
      case "attachments":
        return (
          <div className="p-6">
            <AttachmentsTab
              requestId={id}
              presentationAttachments={request?.attachments?.presentation || []}
              actAttachments={request?.attachments?.act || []}
              explanationAttachments={request?.attachments?.explanation || []}
              generalAttachments={request?.attachments?.general || []}
              hyperLinks={request?.hyperLinks || []}
              onAttachmentsUpdated={handleAttachmentsUpdated}
            />
          </div>
        );
      case "disciplinary":
        return (
          <div className="p-6">
            <DisciplinaryTab request={request} />
          </div>
        );
      case "related":
        return (
          <div className="p-6">
            <RelatedRequestsTab
              request={request}
              childRequests={childRequests}
              handleNavigationToChild={handleNavigationToChild}
              navigateToParent={navigateToParent}
            />
          </div>
        );
      default:
        return (
          <div className="p-6">
            <CaseInfoTab request={request} />
          </div>
        );
    }
  };

  // Main component render
  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      <div className="mx-auto py-4 md:py-6">
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
            {renderActiveTabContent()}
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
          isLoading={messagesLoading}
        />
      </div>
    </div>
  );
}

export default RequestDetail;
