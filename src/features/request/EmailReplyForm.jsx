// File: components/email/EmailReplyForm.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, X, Paperclip, ChevronDown, AlertCircle } from "lucide-react";
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

// Import components
import EditorToolbar from "../../components/email/EditorToolbar";
import EmailInput from "../../components/email/EmailInput";
import AttachmentList from "../../components/email/AttachmentList";
import SuccessMessage from "../../components/email/SuccessMessage";
import TipTapStyles from "../../components/email/TipTapStyles";

const EmailReplyForm = ({
  requestId,
  selectedEmail,
  onClose,
  onSuccess,
  replyType = "Reply",
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
  const [showCcField, setShowCcField] = useState(ccRecipients.length > 0);
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
      Placeholder.configure({
        placeholder: "Write your email here...",
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "focus:outline-none prose prose-sm max-w-none px-3 py-2 min-h-[200px]",
      },
    },
  });

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

  // Force show CC field for Reply All
  useEffect(() => {
    if (replyType === "ReplyAll") {
      setShowCcField(true);
    }
  }, [replyType]);

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editor || !editor.getHTML() || editor.isEmpty) {
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
      // Prepare the form data
      const formData = new FormData();

      // Add required fields
      formData.append("AccessToken", accessToken);
      formData.append("ERRequestId", requestId);
      formData.append("Subject", subject);
      formData.append("BodyContent", editor.getHTML());
      formData.append("ReplyType", replyType);

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
            onSuccess();
          }, 1500);
        }
      } else {
        throw new Error(data.Message || "Failed to send email");
      }
    } catch (err) {
      console.error("Error sending email:", err);
      setError(err.message || "An error occurred while sending the email");
    } finally {
      setLoading(false);
    }
  };

  // If success, show confirmation message
  if (success) {
    return <SuccessMessage onClose={onClose} />;
  }

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-md">
      {/* Header */}
      <div
        className="px-4 py-3 rounded-t-lg flex justify-between items-center"
        style={{
          background: `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
          color: "white",
        }}
      >
        <h2 className="text-base font-medium">
          {replyType === "Reply"
            ? "Reply"
            : replyType === "ReplyAll"
            ? "Reply All"
            : "Forward"}
        </h2>
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-white hover:bg-opacity-20 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Email Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col overflow-y-auto"
      >
        <div className="p-4 space-y-3 border-b border-slate-200">
          {/* To Recipients */}
          <EmailInput
            recipients={toRecipients}
            setRecipients={setToRecipients}
            placeholder="Enter recipient email or search Azure users..."
            label="To"
            type="to"
          />

          {/* CC Recipients or Toggle */}
          {showCcField ? (
            <EmailInput
              recipients={ccRecipients}
              setRecipients={setCcRecipients}
              placeholder="Enter CC email or search Azure users..."
              label="CC"
              type="cc"
            />
          ) : (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowCcField(true)}
                className="text-xs text-cyan-600 hover:text-cyan-800 flex items-center transition-colors"
              >
                <ChevronDown className="h-3 w-3 mr-1" />
                <span>Show CC</span>
              </button>
            </div>
          )}

          {/* Subject */}
          <div className="flex flex-col mt-3">
            <label className="text-xs font-medium text-slate-600 mb-1">
              Subject:
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border border-slate-300 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-200 focus:border-cyan-400 transition-all"
              placeholder="Email subject"
            />
          </div>
        </div>

        {/* Email Body - Rich Text Editor */}
        <div className="flex-1 overflow-hidden border-b border-slate-200">
          <div className="border-b border-slate-200">
            {editor && <EditorToolbar editor={editor} />}
          </div>
          <div className="h-full overflow-auto">
            <EditorContent editor={editor} className="h-full" />
          </div>
        </div>

        {/* Attachments Section */}
        <div className="px-4 py-1.5 border-t border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-700">
              Attachments:
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs bg-cyan-50 border border-cyan-200 px-3 py-1.5 rounded-md flex items-center hover:bg-cyan-100 text-cyan-700 transition-colors"
            >
              <Paperclip className="h-3 w-3 mr-1.5" />
              <span>Add Files</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              multiple
            />
          </div>

          {/* Attachments List Component */}
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
          <div className="px-4 py-2 bg-red-50 border-t border-red-100 flex items-start">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5" />
            <span className="text-sm text-red-600">{error}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex justify-between items-center rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-md text-xs font-medium text-white flex items-center justify-center min-w-[120px] shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-300"
            style={{
              background: loading
                ? colors.primaryLight
                : `linear-gradient(to right, ${colors.primaryGradientStart}, ${colors.primaryGradientEnd})`,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* TipTap Editor Styles */}
      <TipTapStyles />
    </div>
  );
};

export default EmailReplyForm;
