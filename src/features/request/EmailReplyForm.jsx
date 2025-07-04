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
  const [attachments, setAttachments] = useState([]); // Kullanıcının yeni eklediği dosyalar
  const [forwardedAttachments, setForwardedAttachments] = useState([]); // Orijinal ekleri arayüzde göstermek için

  // YENİ MANTIK: Silinmesi istenen orijinal eklerin ID'lerini tutar
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState(new Set());

  const [downloadingAttachmentId, setDownloadingAttachmentId] = useState(null);
  const [editorHeight, setEditorHeight] = useState(120);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [formScrollPosition, setFormScrollPosition] = useState(0);
  const [parentScrollPosition, setParentScrollPosition] = useState(0);
  const [originalEmailContent, setOriginalEmailContent] = useState("");
  const formRef = useRef(null);
  const parentViewportRef = useRef(null);
  const fileInputRef = useRef(null);

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
        (email) => email && email !== currentUserEmail
      );
    } else {
      return [];
    }
  });

  // State for UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

  const prepareOriginalEmailContent = () => {
    if (!selectedEmail) return "";
    const formatDate = (dateString) =>
      new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    let content = "";
    if (replyType === "Forward") {
      content = `<div data-original-email="true"><p>---------- Forwarded message ----------</p><p><strong>From:</strong> ${
        selectedEmail.SenderName
      } <${selectedEmail.Sender}></p><p><strong>Date:</strong> ${formatDate(
        selectedEmail.ReceivedDateTime
      )}</p><p><strong>Subject:</strong> ${
        selectedEmail.Subject
      }</p><p><strong>To:</strong> ${selectedEmail.To.join(", ")}</p>${
        selectedEmail.CC && selectedEmail.CC.length > 0
          ? `<p><strong>CC:</strong> ${selectedEmail.CC.join(", ")}</p>`
          : ""
      }<p>----------------------------------------</p>`;
    } else {
      content = `<div data-original-email="true"><p>On ${formatDate(
        selectedEmail.ReceivedDateTime
      )}, ${selectedEmail.SenderName} <${
        selectedEmail.Sender
      }> wrote:</p><blockquote style="margin: 0 0 0 0.5em; padding: 0 0 0 0.5em; border-left: 2px solid #e5e7eb;">`;
    }
    if (selectedEmail.Body) {
      if (selectedEmail.Body.ContentType === "html") {
        content += `<div data-original-email="true">${selectedEmail.Body.Content}</div>`;
      } else {
        content += `<div data-original-email="true">${selectedEmail.Body.Content.split(
          "\n"
        )
          .map((line) => `<p>${line || " "}</p>`)
          .join("")}</div>`;
      }
    }
    content += replyType === "Forward" ? "</div>" : "</blockquote></div>";
    return content;
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Placeholder.configure({ placeholder: "Write your email here..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "focus:outline-none prose prose-sm max-w-none px-2 py-1",
        style: `min-height: ${isFullScreen ? "300px" : editorHeight + "px"}`,
      },
    },
    onUpdate: ({ editor }) => {
      const element = editor.view.dom;
      if (element && element.scrollHeight > editorHeight && !isFullScreen) {
        setEditorHeight(Math.min(element.scrollHeight, 300));
      }
    },
  });

  useEffect(() => {
    if (editor && !originalEmailContent) {
      const preparedContent = prepareOriginalEmailContent();
      setOriginalEmailContent(preparedContent);
      editor.commands.setContent(`<p></p>${preparedContent}`);
      setTimeout(() => editor.commands.focus("start"), 100);
    }
  }, [editor, originalEmailContent]);

  useEffect(() => {
    if (
      replyType === "Forward" &&
      selectedEmail?.HasAttachments &&
      selectedEmail?.Attachments
    ) {
      setForwardedAttachments(selectedEmail.Attachments);
    } else {
      setForwardedAttachments([]);
    }
  }, [replyType, selectedEmail]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const handleRemoveAttachment = (fileName) => {
    setAttachments(attachments.filter((file) => file.name !== fileName));
  };

  const handleToggleForwardedAttachment = (attachmentId) => {
    setRemovedAttachmentIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(attachmentId)) {
        newIds.delete(attachmentId);
      } else {
        newIds.add(attachmentId);
      }
      return newIds;
    });
  };

  const downloadAttachment = async (attachment) => {
    try {
      setDownloadingAttachmentId(attachment.Id);
      const response = await fetch(attachment.DownloadUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) throw new Error("Failed to download attachment");
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

  const extractUserContent = (fullHTML) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = fullHTML;
    tempDiv
      .querySelectorAll('[data-original-email="true"]')
      .forEach((el) => el.remove());
    return tempDiv.innerHTML;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editor || editor.isEmpty)
      return setError("Email body cannot be empty");
    if (replyType === "Forward" && toRecipients.length === 0)
      return setError("Please add at least one recipient for forwarding");

    setLoading(true);
    setError("");

    try {
      const userContent = extractUserContent(editor.getHTML());
      if (
        !userContent ||
        userContent.trim() === "" ||
        userContent.trim() === "<p></p>"
      ) {
        setLoading(false);
        return setError("Please add your message before sending");
      }

      const formData = new FormData();
      formData.append("AccessToken", accessToken);
      formData.append("ERRequestId", requestId);
      formData.append("Subject", subject);
      formData.append("BodyContent", userContent);
      formData.append("ReplyType", replyType);

      if (selectedEmail?.Id) formData.append("MessageId", selectedEmail.Id);

      formData.append(
        "Communicated",
        document.getElementById("email-communicated")?.checked || false
      );
      toRecipients.forEach((r) => formData.append("ToRecipients", r));
      ccRecipients.forEach((r) => formData.append("CcRecipients", r));
      attachments.forEach((f) => formData.append("Attachments", f));

      if (replyType === "Forward" && removedAttachmentIds.size > 0) {
        removedAttachmentIds.forEach((id) =>
          formData.append("RemovedAttachmentIds", id)
        );
      }

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/SendEmailReply`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwtToken}` },
          body: formData,
        }
      );
      const data = await response.json();

      if (data.IsSuccess) {
        setSuccess(true);
        if (onSuccess) setTimeout(() => onSuccess(parentScrollPosition), 1000);
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

  if (success) {
    return <SuccessMessage onClose={onClose} />;
  }

  return (
    <div
      ref={parentViewportRef}
      className={`${
        isFullScreen
          ? "fixed inset-0 z-[1000] w-screen h-screen"
          : "relative h-full"
      } flex flex-col bg-white border border-slate-200 rounded-lg shadow-md`}
    >
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
            onClick={() => setIsFullScreen(!isFullScreen)}
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

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col overflow-auto w-full"
      >
        <div className="p-1.5 border-b border-slate-200 flex flex-col gap-1.5">
          <SimplifiedEmailInput
            recipients={toRecipients}
            setRecipients={setToRecipients}
            placeholder="To..."
            label="To"
          />
          <SimplifiedEmailInput
            recipients={ccRecipients}
            setRecipients={setCcRecipients}
            placeholder="CC..."
            label="CC"
          />
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

        <div className="flex-1 flex flex-col overflow-hidden border-b border-slate-200">
          <div className="border-b border-slate-200">
            {editor && <EditorToolbar editor={editor} />}
          </div>
          <div className="flex-1 overflow-auto w-full pr-0 no-scrollbar">
            <EditorContent
              editor={editor}
              className="h-full transition-all duration-300 max-w-full"
            />
          </div>
        </div>

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
          </div>

          <div className="max-h-[80px] overflow-y-auto mb-2">
            <AttachmentList
              attachments={attachments}
              forwardedAttachments={forwardedAttachments}
              onRemoveAttachment={handleRemoveAttachment}
              onToggleForwardedAttachment={handleToggleForwardedAttachment}
              removedAttachmentIds={removedAttachmentIds}
              onDownloadAttachment={downloadAttachment}
              downloadingAttachmentId={downloadingAttachmentId}
            />
          </div>

          {error && (
            <div className="mb-2 py-1 bg-red-50 border border-red-100 rounded-sm flex items-start px-2">
              <AlertCircle className="h-3 w-3 text-red-500 mr-1 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-red-600">{error}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                id="email-communicated"
                className="rounded text-cyan-600 border-slate-300 shadow-sm focus:border-cyan-300 focus:ring focus:ring-cyan-200 focus:ring-opacity-50 mr-1 h-3 w-3"
              />
              <span>Mark as communicated</span>
            </label>
            <div className="flex space-x-1.5">
              <button
                type="button"
                onClick={onClose}
                className="px-2 py-1 border border-slate-300 rounded-sm text-[10px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-1 focus:ring-cyan-200 transition-colors"
              >
                Cancel
              </button>
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
            </div>
          </div>
        </div>
      </form>
      <TipTapStyles />
    </div>
  );
};

export default StreamlinedEmailReplyForm;
