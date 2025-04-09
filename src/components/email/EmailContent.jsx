// File: components/email/EmailContent.jsx
import React from "react";

const EmailContent = ({ content }) => {
  if (!content) return null;

  if (content.ContentType === "html") {
    // HTML content styles
    const contentWithSmallerFont = `
    <style>
      body {
        font-size: 0.85rem !important; /* 12px */
        line-height: 1.25rem !important; /* 20px */
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      }
        .container{
        max-width:900px !important
        }
      * {
        font-size: inherit !important;
      }
    </style>
    ${content.Content}
  `;

    return (
      <iframe
        srcDoc={contentWithSmallerFont}
        title="Email content"
        className="w-full h-full border-none"
        sandbox="allow-same-origin"
      />
    );
  }

  // Text content with small font
  return (
    <div className="whitespace-pre-wrap text-xs leading-5 px-4 py-3">
      {content.Content}
    </div>
  );
};

export default EmailContent;
