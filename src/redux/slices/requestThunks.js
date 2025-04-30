import { createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens, getUserId } from "../../utils/authHandler";
import {
  setRequest,
  setMessages,
  setLoading,
  setError,
  clearRequest,
  updateMessage,
  deleteMessage,
  addMessage,
} from "./requestSlice";

// Fetch request data
export const fetchRequestData = createAsyncThunk(
  "request/fetchRequestData",
  async (requestId, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearRequest());

      const { jwtToken } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/${requestId}`,
        {
          method: "GET",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

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
        UserFullName: data.UserFullName,
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
      dispatch(fetchMessages(requestId));

      // Return the data in case we need it in the component
      return transformedRequest;
    } catch (err) {
      console.error("Error fetching request data:", err);
      dispatch(setError(err.message));
      return rejectWithValue(err.message);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

// Fetch messages
export const fetchMessages = createAsyncThunk(
  "request/fetchMessages",
  async (requestId, { dispatch, rejectWithValue }) => {
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
          timestamp: msg.CreatedDate,
          formattedTimestamp: msg.FormattedCreatedDate,
          isRead: Boolean(msg.IsRead),
          isEdited: Boolean(msg.IsEdit || msg.IsEdited),
        }));

        dispatch(setMessages(transformedMessages));

        // Mark unread messages as read
        const currentUserId = getUserId();
        if (currentUserId) {
          const unreadMsgIds = messages
            .filter(
              (msg) => !msg.IsRead && msg.AppuserId !== parseInt(currentUserId)
            )
            .map((msg) => msg.Id);

          if (unreadMsgIds.length > 0) {
            dispatch(markMessagesAsRead(unreadMsgIds));
          }
        }

        return transformedMessages;
      } else {
        dispatch(setMessages([]));
        return [];
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Mark messages as read
export const markMessagesAsRead = createAsyncThunk(
  "request/markMessagesAsRead",
  async (messageIds, { rejectWithValue }) => {
    try {
      // Only proceed if we have message IDs
      if (!messageIds || messageIds.length === 0) return;

      const { jwtToken } = getStoredTokens();
      const currentUserId = getUserId();

      if (!currentUserId) return;

      console.log(
        `Marking messages as read: ${messageIds.join(
          ","
        )} for user ${currentUserId}`
      );

      // Create the correct URL format with query parameters
      const url = new URL(
        `${API_BASE_URL}/api/ERRequestMessage/IsReadMessages`
      );
      url.searchParams.append("currentUserId", currentUserId);

      // Add each ID as an individual query parameter
      messageIds.forEach((id) => {
        url.searchParams.append("ids", id);
      });

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Error marking messages as read: ${response.status}`,
          errorText
        );
        return rejectWithValue(errorText);
      }

      // Parse the response to update our local message state
      const updatedMessages = await response.json();
      console.log("Messages marked as read:", updatedMessages);

      return updatedMessages;
    } catch (err) {
      console.error("Error marking messages as read:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  "request/sendMessage",
  async ({ requestId, messageText }, { dispatch, rejectWithValue }) => {
    try {
      const { jwtToken } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const formData = new FormData();
      formData.append("ERRequestId", requestId);
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

      // After successful send, refresh messages
      dispatch(fetchMessages(requestId));

      return true;
    } catch (err) {
      console.error("Error sending message:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Edit message
export const editMessage = createAsyncThunk(
  "request/editMessage",
  async (
    { messageId, newContent, requestId },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const { jwtToken } = getStoredTokens();
      const userId = getUserId();

      if (!userId) {
        throw new Error("User ID not found");
      }

      const updateData = {
        MessageId: parseInt(messageId),
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

      // Parse the response JSON
      const responseData = await response.json();

      // Check if the operation was successful based on the API response
      if (!responseData.IsSuccess) {
        console.error("API reported error:", responseData.Message);
        return rejectWithValue(responseData.Message);
      }

      // Update message in the Redux store immediately for optimistic UI
      dispatch(
        updateMessage({ id: messageId, message: newContent, isEdited: true })
      );

      // Also refresh all messages to ensure consistency with server
      dispatch(fetchMessages(requestId));

      return true;
    } catch (err) {
      console.error("Error editing message:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Delete message
export const deleteMessageThunk = createAsyncThunk(
  "request/deleteMessage",
  async ({ messageId, requestId }, { dispatch, rejectWithValue }) => {
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

      // Update the Redux store immediately for optimistic UI
      dispatch(deleteMessage(messageId));

      // Also refresh all messages to ensure consistency with server
      dispatch(fetchMessages(requestId));

      return true;
    } catch (err) {
      console.error("Error deleting message:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Fetch ER members
export const fetchERMembers = createAsyncThunk(
  "request/fetchERMembers",
  async (_, { rejectWithValue }) => {
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
        return data[0].AppUsers;
      }
      return [];
    } catch (err) {
      console.error("Error fetching ER members:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Fetch child requests
export const fetchChildRequests = createAsyncThunk(
  "request/fetchChildRequests",
  async (parentId, { rejectWithValue }) => {
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
        return data[0].ERRequests;
      }

      return [];
    } catch (err) {
      console.error("Error fetching child requests:", err);
      return rejectWithValue(err.message);
    }
  }
);

// Update attachments and hyperlinks
export const manageAttachments = createAsyncThunk(
  "request/manageAttachments",
  async (
    { requestId, attachmentType, file, hyperlink, hyperLinkIdToDelete },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const { jwtToken } = getStoredTokens();

      const formData = new FormData();
      formData.append("ERRequestId", requestId);

      // For file uploads
      if (file && attachmentType) {
        const uploadTypeMap = {
          presentation: "PresentationAttachments",
          act: "ActAttachments",
          explanation: "ExplanationAttachments",
          general: "GeneralAttachments",
        };

        formData.append(
          uploadTypeMap[attachmentType] || "GeneralAttachments",
          file
        );
      }

      // For hyperlink additions
      if (hyperlink) {
        formData.append("HyperLinksToAdd", hyperlink);
      }

      // For hyperlink deletions
      if (hyperLinkIdToDelete) {
        formData.append("HyperLinkIdsToDelete", hyperLinkIdToDelete);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/ManageERRequestAttachmentsAndHyperLinks`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Error managing attachments: ${errorText || response.status}`
        );
      }

      // After successful update, refresh the request data
      dispatch(fetchRequestData(requestId));

      return true;
    } catch (err) {
      console.error("Error managing attachments:", err);
      return rejectWithValue(err.message);
    }
  }
);
