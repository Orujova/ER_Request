import React, { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip, AlertCircle, Maximize2 } from "lucide-react";
import { API_BASE_URL } from "../../../apiConfig";
import { getStoredTokens } from "../../utils/authHandler";
import { useMsal } from "@azure/msal-react";

// TipTap imports for rich text editor
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";

// Import components
import EditorToolbar from "../../components/email/EditorToolbar";
import SimplifiedEmailInput from "../../components/email/EmailInput";
import AttachmentList from "../../components/email/AttachmentList";
import SuccessMessage from "../../components/email/SuccessMessage";
import TipTapStyles from "../../components/email/TipTapStyles";

const StreamlinedEmailReplyForm = ({
  requestId,
  selectedEmail,
  onClose,
  onSuccess,
  replyType = "Reply",
  parentScrollElement = null,
}) => {
  // MSAL for Azure AD integration
  const { instance, accounts } = useMsal();

  // State management
  const [subject, setSubject] = useState(
    selectedEmail
      ? replyType === "Forward"
        ? `Fw: ${selectedEmail.Subject}`
        : `Re: ${selectedEmail.Subject}`
      : ""
  );
  const [attachments, setAttachments] = useState([]);
  const [forwardedAttachments, setForwardedAttachments] = useState([]);
  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [editorHeight, setEditorHeight] = useState(120);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [formScrollPosition, setFormScrollPosition] = useState(0);
  const [parentScrollPosition, setParentScrollPosition] = useState(0);

  // Track the original email content (to separate it from user's additions)
  const [originalEmailContent, setOriginalEmailContent] = useState("");

  const formRef = useRef(null);
  const parentViewportRef = useRef(null);

  // User inputs
  const currentUserEmail = localStorage.getItem("email");
  const [toRecipients, setToRecipients] = useState(() => {
    if (replyType === "Reply") {
      return selectedEmail?.Sender ? [selectedEmail.Sender] : [];
    } else if (replyType === "ReplyAll") {
      const sender = selectedEmail?.Sender;
      return sender ? [sender] : [];
    } else {
      return [];
    }
  });

  const [ccRecipients, setCcRecipients] = useState(() => {
    if (replyType === "ReplyAll") {
      const originalCC = [...(selectedEmail?.CC || [])];
      const originalTo = (selectedEmail?.To || []).filter(
        (email) => email !== selectedEmail?.Sender && email !== currentUserEmail
      );
      const allCCRecipients = new Set([...originalCC, ...originalTo]);
      return Array.from(allCCRecipients).filter(
        (email) =>
          email !== currentUserEmail && email !== undefined && email !== null
      );
    } else {
      return [];
    }
  });

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Auth tokens
  const { jwtToken } = getStoredTokens();
  const accessToken = localStorage.getItem("access_token");

  // Colors
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

  // Prepare original email content with special markers for later identification
  const prepareOriginalEmailContent = () => {
    if (!selectedEmail) return "";

    // Format date for display
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    let content = "";

    if (replyType === "Forward") {
      content = `<div data-original-email="true">
        <p>---------- Forwarded message ----------</p>
        <p><strong>From:</strong> ${selectedEmail.SenderName} &lt;${
        selectedEmail.Sender
      }&gt;</p>
        <p><strong>Date:</strong> ${formatDate(
          selectedEmail.ReceivedDateTime
        )}</p>
        <p><strong>Subject:</strong> ${selectedEmail.Subject}</p>
        <p><strong>To:</strong> ${selectedEmail.To.join(", ")}</p>
        ${
          selectedEmail.CC && selectedEmail.CC.length > 0
            ? `<p><strong>CC:</strong> ${selectedEmail.CC.join(", ")}</p>`
            : ""
        }
        <p>----------------------------------------</p>`;

      // Add original content with marker
      if (selectedEmail.Body) {
        if (selectedEmail.Body.ContentType === "html") {
          content += `<div data-original-email="true">${selectedEmail.Body.Content}</div>`;
        } else {
          // Convert plain text to HTML
          content += `<div data-original-email="true">
            ${selectedEmail.Body.Content.split("\n")
              .map((line) => `<p>${line || "&nbsp;"}</p>`)
              .join("")}
          </div>`;
        }
      }

      content += "</div>";
    } else {
      // For Reply and ReplyAll
      content = `<div data-original-email="true">
        <p>On ${formatDate(selectedEmail.ReceivedDateTime)}, ${
        selectedEmail.SenderName
      } &lt;${selectedEmail.Sender}&gt; wrote:</p>
        <blockquote style="margin: 0 0 0 0.5em; padding: 0 0 0 0.5em; border-left: 2px solid #e5e7eb;">`;

      // Add original content with marker
      if (selectedEmail.Body) {
        if (selectedEmail.Body.ContentType === "html") {
          content += `<div data-original-email="true">${selectedEmail.Body.Content}</div>`;
        } else {
          // Convert plain text to HTML
          content += `<div data-original-email="true">
            ${selectedEmail.Body.Content.split("\n")
              .map((line) => `<p>${line || "&nbsp;"}</p>`)
              .join("")}
          </div>`;
        }
      }

      content += "</blockquote></div>";
    }

    return content;
  };

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({
        placeholder: "Write your email here...",
      }),
    ],
    content: "", // Start with empty content, we'll add original content after initialization
    editorProps: {
      attributes: {
        class: "focus:outline-none prose prose-sm max-w-none px-2 py-1",
        style: `min-height: ${isFullScreen ? "300px" : editorHeight + "px"}`,
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-adjust height of editor based on content
      const element = editor.view.dom;
      if (element && element.scrollHeight > editorHeight && !isFullScreen) {
        setEditorHeight(Math.min(element.scrollHeight, 300));
      }
    },
  });

  // Set up editor content once editor is initialized
  useEffect(() => {
    if (editor && !originalEmailContent) {
      // Prepare the original content
      const preparedContent = prepareOriginalEmailContent();
      setOriginalEmailContent(preparedContent);

      // Add a empty paragraph for user input, followed by original content
      editor.commands.setContent(`<p></p>${preparedContent}`);

      // Focus at the beginning of the content (before original email)
      setTimeout(() => {
        editor.commands.focus("start");
      }, 100);
    }
  }, [editor, originalEmailContent]);

  // Save parent document scroll position
  useEffect(() => {
    const saveParentScrollPosition = () => {
      if (parentScrollElement) {
        setParentScrollPosition(parentScrollElement.scrollTop);
      }
    };

    // Record the initial position
    saveParentScrollPosition();

    // Set up listeners
    if (parentScrollElement) {
      parentScrollElement.addEventListener("scroll", saveParentScrollPosition);
    }

    // Clean up listener on unmount
    return () => {
      if (parentScrollElement) {
        parentScrollElement.removeEventListener(
          "scroll",
          saveParentScrollPosition
        );
      }
    };
  }, [parentScrollElement]);

  // Save scroll position when user scrolls within form
  const handleFormScroll = () => {
    if (formRef.current) {
      setFormScrollPosition(formRef.current.scrollTop);
    }
  };

  // Set up form scroll listener and restore position after re-render
  useEffect(() => {
    if (formRef.current) {
      formRef.current.addEventListener("scroll", handleFormScroll);

      // Restore previous scroll position
      if (formScrollPosition > 0) {
        formRef.current.scrollTop = formScrollPosition;
      }
    }

    return () => {
      if (formRef.current) {
        formRef.current.removeEventListener("scroll", handleFormScroll);
      }
    };
  }, [formRef.current, formScrollPosition]);

  // Update editor height when changed
  useEffect(() => {
    if (editor) {
      editor.setOptions({
        editorProps: {
          attributes: {
            class: "focus:outline-none prose prose-sm max-w-none px-2 py-1",
            style: `min-height: ${
              isFullScreen ? "300px" : editorHeight + "px"
            }`,
          },
        },
      });
    }
  }, [editorHeight, editor, isFullScreen]);

  // For Forward email, copy original attachments
  useEffect(() => {
    if (
      replyType === "Forward" &&
      selectedEmail?.HasAttachments &&
      selectedEmail?.Attachments
    ) {
      setForwardedAttachments(selectedEmail.Attachments);
    } else if (replyType !== "Forward") {
      setForwardedAttachments([]);
    }
  }, [replyType, selectedEmail]);

  // Toggle full screen mode for the entire form
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);

    // Save scroll positions before changing mode
    if (formRef.current) {
      setFormScrollPosition(formRef.current.scrollTop);
    }
    if (parentScrollElement) {
      setParentScrollPosition(parentScrollElement.scrollTop);
    }

    // When entering full screen, disable the body scroll
    if (!isFullScreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  // Handle removing an attachment
  const handleRemoveAttachment = (fileName) => {
    setAttachments(attachments.filter((file) => file.name !== fileName));
  };

  // Handle removing a forwarded attachment
  const handleRemoveForwardedAttachment = (attachmentId) => {
    setForwardedAttachments(
      forwardedAttachments.filter(
        (attachment) => attachment.Id !== attachmentId
      )
    );
  };

  // Download original attachment from forwarded email
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

  // Extract user content by removing the original email parts
  const extractUserContent = (fullHTML) => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = fullHTML;

    // Remove all elements that are marked as original email content
    const originalElements = tempDiv.querySelectorAll(
      '[data-original-email="true"]'
    );
    originalElements.forEach((element) => {
      element.remove();
    });

    // Return the cleaned content (user input only)
    return tempDiv.innerHTML;
  };

  // Handle form submission with content separation
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save current scroll positions before submission
    if (formRef.current) {
      setFormScrollPosition(formRef.current.scrollTop);
    }
    if (parentScrollElement) {
      setParentScrollPosition(parentScrollElement.scrollTop);
    }

    if (!editor || editor.isEmpty) {
      setError("Email body cannot be empty");
      return;
    }

    if (toRecipients.length === 0) {
      setError("Please add at least one recipient");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get the full content from the editor
      const fullContent = editor.getHTML();

      // Extract only the user's content (removing original email parts)
      const userContent = extractUserContent(fullContent);

      // Check if user added any content
      if (!userContent || userContent === "" || userContent === "<p></p>") {
        setError("Please add your message before sending");
        setLoading(false);
        return;
      }

      // Backend API processing - only send user's content
      const formData = new FormData();

      // Add required fields
      formData.append("AccessToken", accessToken);
      formData.append("ERRequestId", requestId);
      formData.append("Subject", subject);
      formData.append("BodyContent", userContent); // Send only user's content!
      formData.append("ReplyType", replyType);
      formData.append("PreserveFormatting", "true");

      // Add MessageId if available
      if (selectedEmail && selectedEmail.Id) {
        formData.append("MessageId", selectedEmail.Id);
      }

      // Add Communicated flag (default to false)
      const communicated =
        document.getElementById("email-communicated")?.checked || false;
      formData.append("Communicated", communicated);

      // Add recipients
      toRecipients.forEach((recipient) => {
        formData.append("ToRecipients", recipient);
      });

      // Add CC recipients if any
      ccRecipients.forEach((recipient) => {
        formData.append("CcRecipients", recipient);
      });

      // Add new attachments
      attachments.forEach((file) => {
        formData.append("Attachments", file);
      });

      // If forwarding, add the original attachment IDs
      if (replyType === "Forward" && forwardedAttachments.length > 0) {
        forwardedAttachments.forEach((attachment) => {
          formData.append("ForwardedAttachmentIds", attachment.Id);
        });
      }

      // Send the request
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/SendEmailReply`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.IsSuccess) {
        setSuccess(true);

        // Notify parent component about successful submission
        if (onSuccess) {
          setTimeout(() => {
            // Pass the scroll position to parent component
            onSuccess(parentScrollPosition);
          }, 1000);
        }
      } else {
        throw new Error(data.Message || "Failed to send email");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err.message || "An error occurred while sending the email");

      // Restore scroll positions when error occurs
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollTop = formScrollPosition;
        }
        if (parentScrollElement) {
          parentScrollElement.scrollTop = parentScrollPosition;
        }
      }, 0);
    } finally {
      setLoading(false);
    }
  };

  // If success, show confirmation message
  if (success) {
    return <SuccessMessage onClose={onClose} />;
  }

  return (
    <div
      className={`${
        isFullScreen
          ? "fixed inset-0 z-[1000] w-screen h-screen"
          : "h-full relative"
      } flex flex-col bg-white border border-slate-200 rounded-lg shadow-md`}
      ref={parentViewportRef}
    >
      {/* Ultra-compact Header */}
      <div
        className="px-2 py-1.5 rounded-t-lg flex justify-between items-center"
        style={{
          background: `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
          color: "white",
        }}
      >
        <h2 className="text-xs font-medium">
          {replyType === "Reply"
            ? "Reply"
            : replyType === "ReplyAll"
            ? "Reply All"
            : "Forward"}
        </h2>
        <div className="flex items-center">
           <button
        type="button"
            onClick={toggleFullScreen}
            className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
            title={isFullScreen ? "Exit Full Screen" : "Full Screen Mode"}
          >
            <Maximize2 className="h-3 w-3" />
          </button>
           <button
        type="button"
            onClick={onClose}
            className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors ml-1"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Ultra-compact Email Form - With stacked layout */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col overflow-auto w-full"
      >
        {/* Compact vertical layout for inputs */}
        <div className="p-1.5 border-b border-slate-200 flex flex-col gap-1.5">
          {/* To field */}
          <div className="flex items-center">
            <SimplifiedEmailInput
              recipients={toRecipients}
              setRecipients={setToRecipients}
              placeholder="To..."
              label="To"
            />
          </div>

          {/* CC field */}
          <div className="flex items-center">
            <SimplifiedEmailInput
              recipients={ccRecipients}
              setRecipients={setCcRecipients}
              placeholder="CC..."
              label="CC"
            />
          </div>

          {/* Subject field */}
          <div className="flex items-center">
            <label className="text-[10px] font-medium text-slate-600 w-10 mr-1 flex-shrink-0">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 border border-slate-300 rounded-sm p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-cyan-200 focus:border-cyan-400 transition-all"
            />
          </div>
        </div>

        {/* Email Body - Rich Text Editor */}
        <div className="flex-1 overflow-hidden border-b border-slate-200">
          <div className="border-b border-slate-200">
            <div className="flex-1">
              {editor && <EditorToolbar editor={editor} />}
            </div>
          </div>
          <div className="h-full overflow-auto w-full pr-0 no-scrollbar pb-16">
            <EditorContent
              editor={editor}
              className="h-full transition-all duration-300 max-w-full"
            />
          </div>
        </div>

        {/* Attachments Section - Fixed at bottom */}
        <div className="border-t border-slate-200 p-1.5 sticky bottom-0 bg-white shadow-md z-10">
          <div className="flex items-center justify-between mb-1">
             <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded-sm flex items-center hover:bg-cyan-100 text-cyan-700 transition-colors"
            >
              <Paperclip className="h-2.5 w-2.5 mr-1" />
              <span>Add Files</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />

            <div className="flex space-x-1.5">
              <label className="flex items-center text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  id="email-communicated"
                  className="rounded text-cyan-600 border-slate-300 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50 mr-1 h-3 w-3"
                />
                <span>Mark as communicated</span>
              </label>

               <button
                type="submit"
                disabled={loading}
                className="px-2 py-1.5 rounded-sm text-xs font-medium text-white flex items-center justify-center min-w-[60px] shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-cyan-300"
                style={{
                  background: loading
                    ? colors.primaryLight
                    : `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <>
                    <div className="animate-spin h-2.5 w-2.5 border-2 border-white border-t-transparent rounded-full mr-1" />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    <span>Send</span>
                  </>
                )}
              </button>

               <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 border border-slate-300 rounded-sm text-[10px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Attachments List Component */}
          <div className="max-h-[80px] overflow-y-auto">
            <AttachmentList
              attachments={attachments}
              forwardedAttachments={forwardedAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              onRemoveForwardedAttachment={handleRemoveForwardedAttachment}
              onDownloadAttachment={downloadAttachment}
              downloadingAttachmentId={downloadingAttachmentId}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-1.5 py-1 bg-red-50 border border-red-100 rounded-sm flex items-start px-2">
              <AlertCircle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-red-600">{error}</span>
            </div>
          )}
        </div>
      </form>

      {/* TipTap Editor Styles */}
      <TipTapStyles />
    </div>
  );
};

export default StreamlinedEmailReplyForm;
