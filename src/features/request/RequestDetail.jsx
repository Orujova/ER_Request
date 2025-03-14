// import { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   setRequest,
//   addMessage,
//   setMessages,
//   updateMessage,
//   deleteMessage,
// } from "../../redux/slices/requestSlice";
// import {
//   Paperclip,
//   Link2,
//   Mail,
//   ArrowRight,
//   Users,
//   AlertTriangle,
//   FileText,
//   User,
//   ExternalLink,
//   Clock,
//   ChevronRight,
//   BadgeAlert,
//   UserRound,
//   MailOpen,
// } from "lucide-react";
// import { API_BASE_URL } from "../../../apiConfig";
// import { getStoredTokens, getUserId } from "../../utils/authHandler";
// import { themeColors } from "../../styles/theme";
// import { ChatPanel } from "../../components/Chat"; // Import our chat component

// // Helper function to convert ERRequestStatus enum to readable text
// const getStatusText = (statusCode) => {
//   switch (statusCode) {
//     case 0:
//       return "Pending";
//     case 1:
//       return "Under Review";
//     case 2:
//       return "Decision Made";
//     case 3:
//       return "Order Created";
//     case 4:
//       return "Completed";
//     case 5:
//       return "Order Canceled";
//     default:
//       return "Unknown";
//   }
// };

// // Helper function to get status color classes
// const getStatusColors = (status) => {
//   switch (status) {
//     case "Pending":
//       return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };
//     case "Under Review":
//       return { bg: "#fef3c7", text: "#92400e", border: "#fde68a" };
//     case "Decision Made":
//       return { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" };
//     case "Order Created":
//       return { bg: "#f3e8ff", text: "#6b21a8", border: "#e9d5ff" };
//     case "Completed":
//       return { bg: "#d1fae5", text: "#065f46", border: "#a7f3d0" };
//     case "Order Canceled":
//       return { bg: "#fee2e2", text: "#b91c1c", border: "#fecaca" };
//     default:
//       return { bg: "#f8fafc", text: "#64748b", border: "#e2e8f0" };
//   }
// };

// // Format date helper
// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const date = new Date(dateString);
//   return date.toLocaleDateString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//   });
// };

// function RequestDetail() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const request = useSelector((state) => state.request.currentRequest);
//   const messages = useSelector((state) => state.request.messages);

//   // State management
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeTab, setActiveTab] = useState("case");
//   const [childRequests, setChildRequests] = useState([]);
//   const [erMembers, setErMembers] = useState([]);
//   const [actionMenuOpen, setActionMenuOpen] = useState(false);

//   // Refs
//   const actionMenuRef = useRef(null);

//   // Get current user ID
//   const currentUserId = getUserId();

//   // Close action menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         actionMenuRef.current &&
//         !actionMenuRef.current.contains(event.target)
//       ) {
//         setActionMenuOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   // Fetch data on component mount
//   useEffect(() => {
//     const fetchAllData = async () => {
//       try {
//         setLoading(true);
//         await Promise.all([fetchRequestData(), fetchERMembers()]);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchAllData();
//   }, [id]);

//   // Fetch request data
//   const fetchRequestData = async () => {
//     try {
//       const { token } = getStoredTokens();

//       const response = await fetch(`${API_BASE_URL}/api/ERRequest/${id}`, {
//         method: "GET",
//         headers: {
//           accept: "*/*",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!response.ok) {
//         throw new Error(`Error fetching request data: ${response.status}`);
//       }

//       const data = await response.json();

//       // Transform API data to match our component structure
//       const transformedRequest = {
//         id: data.Id,
//         caseId: data.CaseId,
//         case: data.CaseName,
//         subCaseId: data.SubCaseId,
//         subCase: data.SubCaseDescription,
//         status: getStatusText(data.ERRequestStatus),
//         statusCode: data.ERRequestStatus,
//         employeeInfo: {
//           id: data.EmployeeId,
//           name: data.EmployeeName,
//           badge: data.EmployeeBadge,
//           project: data.ProjectName,
//           projectId: data.ProjectId,
//           projectCode: data.ProjectCode,
//           position: data.PositionName,
//           positionId: data.PositionId,
//           section: data.SectionName,
//           sectionId: data.SectionId,
//           subSection: data.SubSectionName,
//           subSectionId: data.SubSectionId,
//         },
//         mailInfo: {
//           to: data.MailToAdresses,
//           cc: data.MailCcAddresses,
//           body: data.MailBody,
//         },
//         attachments: [], // API doesn't provide this information
//         hyperlinks: data.ERHyperLink ? [data.ERHyperLink] : [],
//         erMember: data.ERMember,
//         createdDate: data.CreatedDate,
//         parentId: data.ParentId,
//         requestType: data.RequestType,
//         orderNumber: data.OrderNumber,
//         note: data.Note,
//         reason: data.Reason,
//         disciplinaryAction: {
//           id: data.DisciplinaryActionId,
//           name: data.DisciplinaryActionName,
//           resultId: data.DisciplinaryActionResultId,
//           resultName: data.DisciplinaryActionResultName,
//           violationId: data.DisciplinaryViolationId,
//           violationName: data.DisciplinaryViolationName,
//         },
//         isEligible: data.IsEligible,
//         contractEndDate: data.ContractEndDate,
//       };

//       dispatch(setRequest(transformedRequest));

//       // Fetch messages for this request
//       await fetchMessages(data.Id);

//       // Fetch child requests if this is a parent request
//       await fetchChildRequests(data.Id);

//       return data;
//     } catch (err) {
//       console.error("Error fetching request data:", err);
//       throw err;
//     }
//   };

//   // Fetch messages for a request
//   const fetchMessages = async (requestId) => {
//     try {
//       const { token } = getStoredTokens();
//       const response = await fetch(
//         `${API_BASE_URL}/api/ERRequestMessage?ERRequestId=${requestId}`,
//         {
//           method: "GET",
//           headers: {
//             accept: "*/*",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error fetching messages: ${response.status}`);
//       }

//       const data = await response.json();
//       const messages = data[0].ERRequestMessages;

//       if (messages && messages.length > 0) {
//         const transformedMessages = messages.map((msg) => ({
//           id: msg.Id,
//           senderId: msg.AppuserId,
//           sender: msg.SenderFullName,
//           message: msg.MessageContent,
//           timestamp: new Date(msg.CreatedDate).toLocaleString(),
//           isRead: msg.IsRead,
//           isEdited: msg.IsEdited,
//         }));

//         dispatch(setMessages(transformedMessages));

//         // Mark unread messages as read
//         if (currentUserId) {
//           const unreadMsgIds = data
//             .filter(
//               (msg) => !msg.IsRead && msg.SenderId !== parseInt(currentUserId)
//             )
//             .map((msg) => msg.Id);

//           if (unreadMsgIds.length > 0) {
//             markMessagesAsRead(unreadMsgIds);
//           }
//         }
//       } else {
//         dispatch(setMessages([]));
//       }
//     } catch (err) {
//       console.error("Error fetching messages:", err);
//     }
//   };

//   // Fetch child requests
//   const fetchChildRequests = async (parentId) => {
//     try {
//       const { token } = getStoredTokens();
//       const response = await fetch(
//         `${API_BASE_URL}/api/ERRequest/GetAllChildRequest?ParentId=${parentId}`,
//         {
//           method: "GET",
//           headers: {
//             accept: "*/*",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error fetching child requests: ${response.status}`);
//       }

//       const data = await response.json();

//       if (data && data.length > 0 && data[0].ERRequests) {
//         setChildRequests(data[0].ERRequests);
//       }
//     } catch (err) {
//       console.error("Error fetching child requests:", err);
//     }
//   };

//   // Fetch ER members for @mention feature
//   const fetchERMembers = async () => {
//     try {
//       const { token } = getStoredTokens();
//       const response = await fetch(
//         `${API_BASE_URL}/api/AdminApplicationUser/GetAllERMemberUser`,
//         {
//           method: "GET",
//           headers: {
//             accept: "*/*",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error fetching ER members: ${response.status}`);
//       }

//       const data = await response.json();
//       if (data && data.length > 0 && data[0].AppUsers) {
//         setErMembers(data[0].AppUsers);
//       }
//     } catch (err) {
//       console.error("Error fetching ER members:", err);
//     }
//   };

//   // Mark messages as read
//   const markMessagesAsRead = async (messageIds) => {
//     try {
//       // Only proceed if we have message IDs
//       if (!messageIds || messageIds.length === 0) return;

//       const { token } = getStoredTokens();
//       const currentUserId = getUserId();

//       if (!currentUserId) return;

//       const response = await fetch(
//         `${API_BASE_URL}/api/ERRequestMessage/IsReadMessages?currentUserId=${currentUserId}&ids=${messageIds.join(
//           ","
//         )}`,
//         {
//           method: "GET",
//           headers: {
//             accept: "*/*",
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       if (!response.ok) {
//         console.error("Error marking messages as read");
//       }
//     } catch (err) {
//       console.error("Error marking messages as read:", err);
//     }
//   };

//   // Send a new message
//   const handleSendMessage = async (messageText) => {
//     try {
//       const { token } = getStoredTokens();
//       const userId = getUserId();

//       if (!userId) {
//         throw new Error("User ID not found");
//       }

//       const formData = new FormData();
//       formData.append("ERRequestId", id);
//       formData.append("SenderId", userId);
//       formData.append("MessageContent", messageText);

//       const response = await fetch(
//         `${API_BASE_URL}/api/ERRequestMessage/AddERRequestMessage`,
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//           body: formData,
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error sending message: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result && result.Data) {
//         // Optimistic update in UI with response data
//         dispatch(
//           addMessage({
//             id: result.Data.Id || Date.now(),
//             senderId: parseInt(userId),
//             sender: result.Data.SenderName || "Current User",
//             message: messageText,
//             timestamp: new Date().toLocaleString(),
//             isRead: true,
//             isEdited: false,
//           })
//         );
//       } else {
//         // Fallback if response structure is different
//         dispatch(
//           addMessage({
//             id: Date.now(),
//             senderId: parseInt(userId),
//             sender: "Current User",
//             message: messageText,
//             timestamp: new Date().toLocaleString(),
//             isRead: true,
//             isEdited: false,
//           })
//         );
//       }

//       // Refresh messages to get the correct data from the server
//       await fetchMessages(id);

//       return result;
//     } catch (err) {
//       console.error("Error sending message:", err);
//       throw err;
//     }
//   };

//   // Edit an existing message
//   const handleEditMessage = async (messageId, newContent) => {
//     try {
//       const { token } = getStoredTokens();
//       const userId = getUserId();

//       if (!userId) {
//         throw new Error("User ID not found");
//       }

//       const updateData = {
//         MessageId: messageId,
//         UserId: parseInt(userId),
//         MessageContent: newContent,
//       };

//       const response = await fetch(
//         `${API_BASE_URL}/api/ERRequestMessage/UpdateERRequest`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify(updateData),
//         }
//       );

//       if (!response.ok) {
//         throw new Error(`Error updating message: ${response.status}`);
//       }

//       // Optimistic update in UI
//       dispatch(
//         updateMessage({
//           id: messageId,
//           message: newContent,
//           isEdited: true,
//         })
//       );

//       // Refresh messages to get the correct data from the server
//       await fetchMessages(id);

//       return response;
//     } catch (err) {
//       console.error("Error editing message:", err);
//       throw err;
//     }
//   };

//   // Delete a message
//   const handleDeleteMessage = async (messageId) => {
//     try {
//       const { token } = getStoredTokens();
//       const userId = getUserId();

//       if (!userId) {
//         throw new Error("User ID not found");
//       }

//       const deleteData = {
//         MessageId: messageId,
//         RequesterId: parseInt(userId),
//       };

//       const response = await fetch(`${API_BASE_URL}/api/ERRequestMessage`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(deleteData),
//       });

//       if (!response.ok) {
//         throw new Error(`Error deleting message: ${response.status}`);
//       }

//       // Optimistic UI update
//       dispatch(deleteMessage(messageId));

//       // Refresh messages after deletion
//       await fetchMessages(id);

//       return response;
//     } catch (err) {
//       console.error("Error deleting message:", err);
//       throw err;
//     }
//   };

//   // Navigation handlers
//   const handleNavigationToChild = (childId) => {
//     navigate(`/request/${childId}`);
//   };

//   const navigateToAction = () => {
//     navigate(`/request/${id}/action`);
//   };

//   // Get status colors
//   const statusColors = request
//     ? getStatusColors(request.status)
//     : getStatusColors("Pending");

//   // Render the Chat Panel in the right column
//   const renderChatPanel = () => {
//     if (!request) return null;

//     return (
//       <ChatPanel
//         messages={messages}
//         currentUserId={currentUserId}
//         handleSendMessage={handleSendMessage}
//         handleEditMessage={handleEditMessage}
//         handleDeleteMessage={handleDeleteMessage}
//         erMembers={erMembers}
//       />
//     );
//   };

//   // Render loading state
//   if (loading) {
//     return (
//       <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center">
//         <div
//           className="p-8 flex flex-col items-center justify-center rounded-2xl"
//           style={{
//             backgroundColor: themeColors.background,
//             boxShadow: themeColors.cardShadow,
//           }}
//         >
//           <div className="w-16 h-16 mb-4 relative">
//             <div
//               className="w-16 h-16 rounded-full animate-pulse"
//               style={{ backgroundColor: themeColors.secondaryDark }}
//             ></div>
//             <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
//               <FileText
//                 className="w-8 h-8"
//                 style={{ color: themeColors.primary }}
//               />
//             </div>
//           </div>
//           <h2
//             className="text-xl font-semibold mb-2"
//             style={{ color: themeColors.text }}
//           >
//             Loading Request
//           </h2>
//           <p className="mb-6" style={{ color: themeColors.textLight }}>
//             Please wait while we fetch the request details
//           </p>
//           <div className="flex items-center justify-center">
//             <div
//               className="w-2 h-2 rounded-full mx-1 animate-bounce"
//               style={{
//                 backgroundColor: themeColors.primary,
//                 animationDelay: "0s",
//               }}
//             ></div>
//             <div
//               className="w-2 h-2 rounded-full mx-1 animate-bounce"
//               style={{
//                 backgroundColor: themeColors.primary,
//                 animationDelay: "0.2s",
//               }}
//             ></div>
//             <div
//               className="w-2 h-2 rounded-full mx-1 animate-bounce"
//               style={{
//                 backgroundColor: themeColors.primary,
//                 animationDelay: "0.4s",
//               }}
//             ></div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render error state
//   if (error) {
//     return (
//       <div className="max-w-7xl mx-auto p-6">
//         <div
//           className="rounded-xl p-8 flex flex-col items-center"
//           style={{
//             backgroundColor: themeColors.background,
//             boxShadow: themeColors.cardShadow,
//             border: `1px solid ${themeColors.error}`,
//           }}
//         >
//           <AlertTriangle
//             className="w-12 h-12 mb-4"
//             style={{ color: themeColors.error }}
//           />
//           <h2
//             className="text-xl font-semibold mb-2"
//             style={{ color: themeColors.error }}
//           >
//             Error Loading Request
//           </h2>
//           <p className="mb-6" style={{ color: themeColors.error }}>
//             {error}
//           </p>
//           <button
//             className="px-4 py-2 rounded-md transition-colors"
//             style={{
//               backgroundColor: themeColors.secondary,
//               color: themeColors.text,
//               border: `1px solid ${themeColors.border}`,
//             }}
//             onClick={() => window.location.reload()}
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Render not found state
//   if (!request) {
//     return (
//       <div className="max-w-7xl mx-auto p-6">
//         <div
//           className="rounded-xl p-8 flex flex-col items-center"
//           style={{
//             backgroundColor: themeColors.background,
//             boxShadow: themeColors.cardShadow,
//             border: `1px solid ${themeColors.border}`,
//           }}
//         >
//           <FileText
//             className="w-12 h-12 mb-4"
//             style={{ color: themeColors.textLight }}
//           />
//           <h2
//             className="text-xl font-semibold mb-2"
//             style={{ color: themeColors.text }}
//           >
//             Request Not Found
//           </h2>
//           <p className="mb-6" style={{ color: themeColors.textLight }}>
//             The requested information could not be found.
//           </p>
//           <button
//             className="px-4 py-2 rounded-md transition-colors"
//             style={{
//               backgroundColor: themeColors.primary,
//               color: themeColors.background,
//             }}
//             onClick={() => navigate("/requests")}
//           >
//             Back to Requests
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // Main render
//   return (
//     <div className="max-w-7xl mx-auto p-4 md:p-6">
//       {/* Header Section */}
//       <div
//         className="rounded-xl mb-6 overflow-hidden"
//         style={{
//           backgroundColor: themeColors.background,
//           boxShadow: themeColors.cardShadow,
//           border: `1px solid ${themeColors.border}`,
//         }}
//       >
//         <div className="p-5 md:p-6">
//           <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
//             {/* Request ID and Status */}
//             <div className="flex flex-col md:flex-row md:items-center gap-4 w-full lg:w-auto">
//               <div>
//                 <h1
//                   className="text-2xl font-bold flex items-center gap-2"
//                   style={{ color: themeColors.text }}
//                 >
//                   Request #{id}
//                   {request.parentId && (
//                     <span
//                       className="text-xs px-2 py-0.5 rounded-full"
//                       style={{
//                         backgroundColor: themeColors.secondary,
//                         color: themeColors.textLight,
//                         border: `1px solid ${themeColors.border}`,
//                       }}
//                     >
//                       Child Request
//                     </span>
//                   )}
//                 </h1>
//                 <div
//                   className="text-sm mt-1 flex items-center gap-1"
//                   style={{ color: themeColors.textLight }}
//                 >
//                   <Clock className="w-3.5 h-3.5" />
//                   <span>Created {formatDate(request.createdDate)}</span>
//                 </div>
//               </div>

//               <div
//                 className="h-10 w-px mx-2 hidden md:block"
//                 style={{ backgroundColor: themeColors.border }}
//               ></div>

//               <div>
//                 <span
//                   className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
//                   style={{
//                     backgroundColor: statusColors.bg,
//                     color: statusColors.text,
//                     border: `1px solid ${statusColors.border}`,
//                   }}
//                 >
//                   {request.status}
//                 </span>
//               </div>

//               <div
//                 className="h-10 w-px mx-2 hidden md:block"
//                 style={{ backgroundColor: themeColors.border }}
//               ></div>

//               <div>
//                 <div
//                   className="text-sm font-medium flex items-center gap-1.5"
//                   style={{ color: themeColors.text }}
//                 >
//                   <UserRound
//                     className="w-4 h-4"
//                     style={{ color: themeColors.primary }}
//                   />
//                   <span>{request.erMember || "Unassigned"}</span>
//                 </div>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
//               <button
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors w-full lg:w-auto"
//                 style={{
//                   backgroundColor: themeColors.background,
//                   color: themeColors.text,
//                   border: `1px solid ${themeColors.border}`,
//                 }}
//                 onClick={() => window.history.back()}
//               >
//                 <ArrowRight className="w-4 h-4 rotate-180" />
//                 Back
//               </button>

//               <button
//                 className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md transition-colors w-full lg:w-auto"
//                 style={{
//                   backgroundColor: themeColors.primary,
//                   color: themeColors.background,
//                 }}
//                 onClick={navigateToAction}
//               >
//                 <ExternalLink className="w-4 h-4" />
//                 Go to Action
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Grid */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Left Column - Takes 2/3 of the space */}
//         <div className="lg:col-span-2">
//           {/* Tabs Navigation */}
//           <div
//             className="rounded-t-xl overflow-hidden"
//             style={{
//               backgroundColor: themeColors.background,
//               boxShadow: themeColors.cardShadow,
//               border: `1px solid ${themeColors.border}`,
//               borderBottom: "none",
//             }}
//           >
//             <div className="flex flex-wrap overflow-x-auto" aria-label="Tabs">
//               <button
//                 className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === "case" ? "" : "border-transparent"
//                 }`}
//                 style={{
//                   borderColor:
//                     activeTab === "case" ? themeColors.primary : "transparent",
//                   color:
//                     activeTab === "case"
//                       ? themeColors.primary
//                       : themeColors.textLight,
//                 }}
//                 onClick={() => setActiveTab("case")}
//               >
//                 <div className="flex items-center gap-2">
//                   <FileText className="w-4 h-4" />
//                   Case Info
//                 </div>
//               </button>
//               <button
//                 className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === "employee" ? "" : "border-transparent"
//                 }`}
//                 style={{
//                   borderColor:
//                     activeTab === "employee"
//                       ? themeColors.primary
//                       : "transparent",
//                   color:
//                     activeTab === "employee"
//                       ? themeColors.primary
//                       : themeColors.textLight,
//                 }}
//                 onClick={() => setActiveTab("employee")}
//               >
//                 <div className="flex items-center gap-2">
//                   <User className="w-4 h-4" />
//                   Employee
//                 </div>
//               </button>
//               <button
//                 className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === "mail" ? "" : "border-transparent"
//                 }`}
//                 style={{
//                   borderColor:
//                     activeTab === "mail" ? themeColors.primary : "transparent",
//                   color:
//                     activeTab === "mail"
//                       ? themeColors.primary
//                       : themeColors.textLight,
//                 }}
//                 onClick={() => setActiveTab("mail")}
//               >
//                 <div className="flex items-center gap-2">
//                   <Mail className="w-4 h-4" />
//                   Mail
//                 </div>
//               </button>
//               <button
//                 className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
//                   activeTab === "attachments" ? "" : "border-transparent"
//                 }`}
//                 style={{
//                   borderColor:
//                     activeTab === "attachments"
//                       ? themeColors.primary
//                       : "transparent",
//                   color:
//                     activeTab === "attachments"
//                       ? themeColors.primary
//                       : themeColors.textLight,
//                 }}
//                 onClick={() => setActiveTab("attachments")}
//               >
//                 <div className="flex items-center gap-2">
//                   <Paperclip className="w-4 h-4" />
//                   Attachments
//                 </div>
//               </button>
//               {request.statusCode >= 2 && (
//                 <button
//                   className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
//                     activeTab === "disciplinary" ? "" : "border-transparent"
//                   }`}
//                   style={{
//                     borderColor:
//                       activeTab === "disciplinary"
//                         ? themeColors.primary
//                         : "transparent",
//                     color:
//                       activeTab === "disciplinary"
//                         ? themeColors.primary
//                         : themeColors.textLight,
//                   }}
//                   onClick={() => setActiveTab("disciplinary")}
//                 >
//                   <div className="flex items-center gap-2">
//                     <BadgeAlert className="w-4 h-4" />
//                     Disciplinary
//                   </div>
//                 </button>
//               )}
//               {(request.parentId || childRequests.length > 0) && (
//                 <button
//                   className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors ${
//                     activeTab === "related" ? "" : "border-transparent"
//                   }`}
//                   style={{
//                     borderColor:
//                       activeTab === "related"
//                         ? themeColors.primary
//                         : "transparent",
//                     color:
//                       activeTab === "related"
//                         ? themeColors.primary
//                         : themeColors.textLight,
//                   }}
//                   onClick={() => setActiveTab("related")}
//                 >
//                   <div className="flex items-center gap-2">
//                     <Users className="w-4 h-4" />
//                     Related
//                   </div>
//                 </button>
//               )}
//             </div>
//           </div>

//           <div
//             className="rounded-b-xl mb-6 overflow-hidden"
//             style={{
//               backgroundColor: themeColors.background,
//               boxShadow: themeColors.cardShadow,
//               border: `1px solid ${themeColors.border}`,
//             }}
//           >
//             {/* Case Info Tab Content */}
//             <div className={`p-6 ${activeTab !== "case" && "hidden"}`}>
//               <h3
//                 className="text-lg font-semibold mb-5 flex items-center gap-2"
//                 style={{ color: themeColors.text }}
//               >
//                 <FileText
//                   className="w-5 h-5"
//                   style={{ color: themeColors.primary }}
//                 />
//                 Case Information
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Case Name
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.case}
//                   </div>
//                 </div>

//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Sub Case
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.subCase}
//                   </div>
//                 </div>

//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Created Date
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {formatDate(request.createdDate)}
//                   </div>
//                 </div>

//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     ER Member
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.erMember}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Employee Info Tab Content */}
//             <div className={`p-6 ${activeTab !== "employee" && "hidden"}`}>
//               <div className="flex items-center gap-3 mb-5">
//                 <div
//                   className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
//                   style={{
//                     backgroundColor: themeColors.primary + "20",
//                     color: themeColors.primary,
//                   }}
//                 >
//                   {request.employeeInfo.name
//                     ? request.employeeInfo.name.charAt(0)
//                     : "E"}
//                 </div>
//                 <div>
//                   <h3
//                     className="text-lg font-semibold"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.employeeInfo.name}
//                   </h3>
//                   <p style={{ color: themeColors.textLight }}>
//                     {request.employeeInfo.position || "Position not specified"}
//                   </p>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Employee ID
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.employeeInfo.id}
//                   </div>
//                 </div>

//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Badge Number
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.employeeInfo.badge}
//                   </div>
//                 </div>

//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Project Name
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.employeeInfo.project}
//                   </div>
//                 </div>

//                 <div
//                   className="p-4 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <div
//                     className="font-medium mb-1"
//                     style={{ color: themeColors.textLight }}
//                   >
//                     Project Code
//                   </div>
//                   <div
//                     className="font-medium"
//                     style={{ color: themeColors.text }}
//                   >
//                     {request.employeeInfo.projectCode}
//                   </div>
//                 </div>

//                 {request.employeeInfo.section && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       border: `1px solid ${themeColors.border}`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Section
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.employeeInfo.section}
//                     </div>
//                   </div>
//                 )}

//                 {request.employeeInfo.subSection && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       border: `1px solid ${themeColors.border}`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Sub-Section
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.employeeInfo.subSection}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Mail Info Tab Content */}
//             <div className={`p-6 ${activeTab !== "mail" && "hidden"}`}>
//               <div className="flex items-center gap-2 mb-5">
//                 <MailOpen
//                   className="w-5 h-5"
//                   style={{ color: themeColors.primary }}
//                 />
//                 <h3
//                   className="text-lg font-semibold"
//                   style={{ color: themeColors.text }}
//                 >
//                   Mail Information
//                 </h3>
//               </div>

//               <div className="flex flex-col gap-6">
//                 <div
//                   className="rounded-xl overflow-hidden border"
//                   style={{ borderColor: themeColors.border }}
//                 >
//                   <div
//                     className="px-4 py-3 border-b flex items-center gap-2"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       borderColor: themeColors.border,
//                     }}
//                   >
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       To
//                     </div>
//                   </div>
//                   <div className="p-4">
//                     <div className="flex flex-wrap gap-2">
//                       {request.mailInfo.to ? (
//                         request.mailInfo.to.split(";").map((email, idx) => (
//                           <span
//                             key={`to-${idx}`}
//                             className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
//                             style={{
//                               backgroundColor: themeColors.primary + "15",
//                               color: themeColors.primary,
//                             }}
//                           >
//                             {email.trim()}
//                           </span>
//                         ))
//                       ) : (
//                         <span style={{ color: themeColors.textLight }}>
//                           No recipients specified
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-xl overflow-hidden border"
//                   style={{ borderColor: themeColors.border }}
//                 >
//                   <div
//                     className="px-4 py-3 border-b flex items-center gap-2"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       borderColor: themeColors.border,
//                     }}
//                   >
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       CC
//                     </div>
//                   </div>
//                   <div className="p-4">
//                     <div className="flex flex-wrap gap-2">
//                       {request.mailInfo.cc ? (
//                         request.mailInfo.cc.split(";").map((email, idx) => (
//                           <span
//                             key={`cc-${idx}`}
//                             className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
//                             style={{
//                               backgroundColor: themeColors.primary + "15",
//                               color: themeColors.primary,
//                             }}
//                           >
//                             {email.trim()}
//                           </span>
//                         ))
//                       ) : (
//                         <span style={{ color: themeColors.textLight }}>
//                           No CC recipients
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-xl overflow-hidden border"
//                   style={{ borderColor: themeColors.border }}
//                 >
//                   <div
//                     className="px-4 py-3 border-b flex items-center gap-2"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       borderColor: themeColors.border,
//                     }}
//                   >
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       Email Content
//                     </div>
//                   </div>
//                   <div className="p-4">
//                     {request.mailInfo.body ? (
//                       <div
//                         className="p-4 rounded whitespace-pre-wrap"
//                         style={{
//                           backgroundColor: themeColors.secondary,
//                           color: themeColors.text,
//                           border: `1px solid ${themeColors.border}`,
//                         }}
//                       >
//                         {request.mailInfo.body}
//                       </div>
//                     ) : (
//                       <span style={{ color: themeColors.textLight }}>
//                         No email content
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Attachments Tab Content */}
//             <div className={`p-6 ${activeTab !== "attachments" && "hidden"}`}>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div
//                   className="rounded-xl overflow-hidden border"
//                   style={{ borderColor: themeColors.border }}
//                 >
//                   <div
//                     className="px-4 py-3 border-b flex items-center gap-2"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       borderColor: themeColors.border,
//                     }}
//                   >
//                     <Paperclip
//                       className="w-4 h-4"
//                       style={{ color: themeColors.primary }}
//                     />
//                     <h3
//                       className="font-semibold"
//                       style={{ color: themeColors.text }}
//                     >
//                       Attachments
//                     </h3>
//                   </div>
//                   <div className="p-4">
//                     <div className="flex flex-col gap-2">
//                       {request.attachments && request.attachments.length > 0 ? (
//                         request.attachments.map((file, index) => (
//                           <button
//                             key={`file-${index}`}
//                             className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-left w-full transition-colors"
//                             style={{
//                               backgroundColor: themeColors.secondary,
//                               color: themeColors.text,
//                               border: `1px solid ${themeColors.border}`,
//                             }}
//                           >
//                             <Paperclip
//                               className="w-4 h-4"
//                               style={{ color: themeColors.textLight }}
//                             />
//                             {file}
//                           </button>
//                         ))
//                       ) : (
//                         <div
//                           className="text-center py-8"
//                           style={{ color: themeColors.textLight }}
//                         >
//                           <Paperclip
//                             className="w-8 h-8 mx-auto mb-2"
//                             style={{ color: themeColors.border }}
//                           />
//                           <p>No attachments</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div
//                   className="rounded-xl overflow-hidden border"
//                   style={{ borderColor: themeColors.border }}
//                 >
//                   <div
//                     className="px-4 py-3 border-b flex items-center gap-2"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       borderColor: themeColors.border,
//                     }}
//                   >
//                     <Link2
//                       className="w-4 h-4"
//                       style={{ color: themeColors.primary }}
//                     />
//                     <h3
//                       className="font-semibold"
//                       style={{ color: themeColors.text }}
//                     >
//                       Hyperlinks
//                     </h3>
//                   </div>
//                   <div className="p-4">
//                     <div className="flex flex-col gap-2">
//                       {request.hyperlinks && request.hyperlinks.length > 0 ? (
//                         request.hyperlinks.map((link, index) => (
//                           <a
//                             key={`link-${index}`}
//                             href={link}
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-left w-full transition-colors group"
//                             style={{
//                               backgroundColor: themeColors.secondary,
//                               color: themeColors.text,
//                               border: `1px solid ${themeColors.border}`,
//                             }}
//                           >
//                             <Link2
//                               className="w-4 h-4"
//                               style={{ color: themeColors.textLight }}
//                             />
//                             <span className="truncate flex-1">{link}</span>
//                             <ExternalLink
//                               className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity"
//                               style={{ color: themeColors.primary }}
//                             />
//                           </a>
//                         ))
//                       ) : (
//                         <div
//                           className="text-center py-8"
//                           style={{ color: themeColors.textLight }}
//                         >
//                           <Link2
//                             className="w-8 h-8 mx-auto mb-2"
//                             style={{ color: themeColors.border }}
//                           />
//                           <p>No hyperlinks</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Disciplinary Actions Tab Content */}
//             <div className={`p-6 ${activeTab !== "disciplinary" && "hidden"}`}>
//               <h3
//                 className="text-lg font-semibold mb-5 flex items-center gap-2"
//                 style={{ color: themeColors.text }}
//               >
//                 <BadgeAlert
//                   className="w-5 h-5"
//                   style={{ color: themeColors.warning }}
//                 />
//                 Disciplinary Actions
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {request.disciplinaryAction?.name && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Action Type
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.disciplinaryAction.name}
//                     </div>
//                   </div>
//                 )}

//                 {request.disciplinaryAction?.resultName && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Action Result
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.disciplinaryAction.resultName}
//                     </div>
//                   </div>
//                 )}

//                 {request.disciplinaryAction?.violationName && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Violation Type
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.disciplinaryAction.violationName}
//                     </div>
//                   </div>
//                 )}

//                 {request.contractEndDate && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Contract End Date
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {formatDate(request.contractEndDate)}
//                     </div>
//                   </div>
//                 )}

//                 {request.isEligible !== undefined && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Eligibility
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.isEligible ? "Eligible" : "Not Eligible"}
//                     </div>
//                   </div>
//                 )}
//                 {request.orderNumber && (
//                   <div
//                     className="p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Order Number
//                     </div>
//                     <div
//                       className="font-medium"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.orderNumber}
//                     </div>
//                   </div>
//                 )}

//                 {request.note && (
//                   <div
//                     className="col-span-2 p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Note
//                     </div>
//                     <div
//                       className="whitespace-pre-wrap"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.note}
//                     </div>
//                   </div>
//                 )}

//                 {request.reason && (
//                   <div
//                     className="col-span-2 p-4 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.warning + "15",
//                       border: `1px solid ${themeColors.warning}30`,
//                     }}
//                   >
//                     <div
//                       className="font-medium mb-1"
//                       style={{ color: themeColors.textLight }}
//                     >
//                       Reason
//                     </div>
//                     <div
//                       className="whitespace-pre-wrap"
//                       style={{ color: themeColors.text }}
//                     >
//                       {request.reason}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {!request.disciplinaryAction?.name &&
//                 !request.disciplinaryAction?.resultName &&
//                 !request.disciplinaryAction?.violationName &&
//                 !request.contractEndDate &&
//                 request.isEligible === undefined && (
//                   <div
//                     className="text-center py-10 rounded-xl"
//                     style={{
//                       backgroundColor: themeColors.secondary,
//                       color: themeColors.textLight,
//                       border: `1px solid ${themeColors.border}`,
//                     }}
//                   >
//                     <AlertTriangle
//                       className="w-8 h-8 mx-auto mb-2"
//                       style={{ color: themeColors.border }}
//                     />
//                     <p>No disciplinary action information available</p>
//                   </div>
//                 )}
//             </div>
//             {/* Related Requests Tab Content */}
//             <div className={`p-6 ${activeTab !== "related" && "hidden"}`}>
//               <h3
//                 className="text-lg font-semibold mb-5 flex items-center gap-2"
//                 style={{ color: themeColors.text }}
//               >
//                 <Users
//                   className="w-5 h-5"
//                   style={{ color: themeColors.primary }}
//                 />
//                 Related Requests
//               </h3>

//               {request.parentId && (
//                 <div className="mb-6">
//                   <h4
//                     className="font-medium mb-3 flex items-center gap-2"
//                     style={{ color: themeColors.text }}
//                   >
//                     <span
//                       className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
//                       style={{
//                         backgroundColor: themeColors.primary + "20",
//                         color: themeColors.primary,
//                       }}
//                     >
//                       P
//                     </span>
//                     Parent Request
//                   </h4>
//                   <button
//                     onClick={() => navigate(`/request/${request.parentId}`)}
//                     className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-left w-full transition-colors"
//                     style={{
//                       backgroundColor: themeColors.primary + "15",
//                       color: themeColors.text,
//                       border: `1px solid ${themeColors.primary}30`,
//                     }}
//                   >
//                     <ArrowRight
//                       className="w-4 h-4 rotate-180"
//                       style={{ color: themeColors.primary }}
//                     />
//                     <span style={{ color: themeColors.text }}>
//                       Request #{request.parentId}
//                     </span>
//                   </button>
//                 </div>
//               )}

//               {childRequests.length > 0 && (
//                 <div>
//                   <h4
//                     className="font-medium mb-3 flex items-center gap-2"
//                     style={{ color: themeColors.text }}
//                   >
//                     <span
//                       className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
//                       style={{
//                         backgroundColor: themeColors.success + "20",
//                         color: themeColors.success,
//                       }}
//                     >
//                       C
//                     </span>
//                     Child Requests
//                   </h4>
//                   <div className="space-y-3">
//                     {childRequests.map((child) => (
//                       <button
//                         key={`child-${child.Id}`}
//                         onClick={() => handleNavigationToChild(child.Id)}
//                         className="inline-flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-left w-full transition-colors"
//                         style={{
//                           backgroundColor: themeColors.secondary,
//                           color: themeColors.text,
//                           border: `1px solid ${themeColors.border}`,
//                         }}
//                       >
//                         <div>
//                           <span
//                             className="font-medium"
//                             style={{ color: themeColors.text }}
//                           >
//                             Request #{child.Id}
//                           </span>
//                           <p
//                             className="text-sm mt-1"
//                             style={{ color: themeColors.textLight }}
//                           >
//                             {child.EmployeeFullName}
//                           </p>
//                           <p
//                             className="text-xs mt-0.5"
//                             style={{ color: themeColors.textLight }}
//                           >
//                             {child.SubCaseDescription}
//                           </p>
//                         </div>
//                         <ChevronRight
//                           className="w-4 h-4"
//                           style={{ color: themeColors.textLight }}
//                         />
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {!request.parentId && childRequests.length === 0 && (
//                 <div
//                   className="text-center py-10 rounded-xl"
//                   style={{
//                     backgroundColor: themeColors.secondary,
//                     color: themeColors.textLight,
//                     border: `1px solid ${themeColors.border}`,
//                   }}
//                 >
//                   <Users
//                     className="w-8 h-8 mx-auto mb-2"
//                     style={{ color: themeColors.border }}
//                   />
//                   <p>No related requests found</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Right Column - Takes 1/3 of the space */}
//         <div className="space-y-6">
//           {/* Chat Panel */}
//           {renderChatPanel()}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default RequestDetail;

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
// import NotFoundState from "../../components/common/NotFoundState";

// Import tabs
import CaseInfoTab from "./CaseInfoTab";
import EmployeeInfoTab from "./EmployeeInfoTab";
import MailInfoTab from "./MailInfoTab";
import AttachmentsTab from "./AttachmentsTab";
import DisciplinaryTab from "./DisciplinaryTab";
import RelatedRequestsTab from "./RelatedRequestsTab";

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
          id: index,
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

  // Handle attachment updates
  const handleAttachmentsUpdated = () => {
    // Refresh the request data to get updated attachments
    fetchRequestData();
  };

  // Send a new message
  const handleSendMessage = async (messageText) => {
    try {
      const { token } = getStoredTokens();
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
            Authorization: `Bearer ${token}`,
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
      const { token } = getStoredTokens();
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
            Authorization: `Bearer ${token}`,
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
      const { token } = getStoredTokens();
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
          Authorization: `Bearer ${token}`,
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

  // Render error state
  // if (error) {
  //   return (
  //     <NotFoundState
  //       message={error}
  //       onBackClick={() => navigate("/requests")}
  //     />
  //   );
  // }

  // // Render not found state
  // if (!request) {
  //   return (
  //     <NotFoundState
  //       title="Request Not Found"
  //       message="The requested information could not be found."
  //       onBackClick={() => navigate("/requests")}
  //     />
  //   );
  // }

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
            presentationAttachments={request.attachments.presentation}
            actAttachments={request.attachments.act}
            explanationAttachments={request.attachments.explanation}
            generalAttachments={request.attachments.general}
            hyperLinks={request.hyperLinks}
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

  // Main render
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      {/* Header Section */}
      <RequestHeader
        id={id}
        request={request}
        handleGoBack={handleGoBack}
        navigateToAction={navigateToAction}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Takes 2/3 of the space */}
        <div className="lg:col-span-2">
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
          <div className="bg-white rounded-b-xl mb-6 overflow-hidden shadow-sm border border-gray-200 transition-all hover:shadow-md">
            <div className="p-6">{renderActiveTabContent()}</div>
          </div>
        </div>

        {/* Right Column - Takes 1/3 of the space */}
        <div className="space-y-6">
          {/* Chat Panel */}
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
    </div>
  );
}

export default RequestDetail;
