// File: components/email/TipTapStyles.jsx
import React from "react";

const TipTapStyles = () => {
  return (
    <style jsx global>{`
      /* Hide scrollbar for Chrome, Safari and Opera */
      .no-scrollbar::-webkit-scrollbar {
        display: none;
      }

      /* Hide scrollbar for IE, Edge and Firefox */
      .no-scrollbar {
        -ms-overflow-style: none; /* IE and Edge */
        scrollbar-width: none; /* Firefox */
      }

      /* Basic editor styles */
      .ProseMirror {
        outline: none;
        font-size: 0.875rem;
        height: 100%;
        overflow-y: auto;
        padding: 1rem;
        max-width: 100%;
        width: 100%;
        box-sizing: border-box;
      }

      /* Typography */
      .ProseMirror p {
        margin: 0.5em 0;
        line-height: 1.5;
      }

      .ProseMirror h1 {
        font-size: 1.3rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 1em 0 0.5em;
      }

      .ProseMirror h2 {
        font-size: 1.2rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 1em 0 0.5em;
      }

      .ProseMirror h3 {
        font-size: 1.1rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 1em 0 0.5em;
      }

      /* Placeholder */
      .ProseMirror p.is-editor-empty:first-child::before {
        content: attr(data-placeholder);
        float: left;
        color: #9ca3af;
        pointer-events: none;
        height: 0;
      }

      /* Lists */
      .ProseMirror ul,
      .ProseMirror ol {
        padding-left: 1.5rem;
        margin: 0.5em 0;
      }

      .ProseMirror li {
        margin: 0.2em 0;
      }

      /* Better list styling */
      .ProseMirror ul {
        list-style-type: disc;
      }

      .ProseMirror ol {
        list-style-type: decimal;
      }

      .ProseMirror ul ul {
        list-style-type: circle;
      }

      .ProseMirror ul ul ul {
        list-style-type: square;
      }

      .ProseMirror ol ol {
        list-style-type: lower-alpha;
      }

      .ProseMirror ol ol ol {
        list-style-type: lower-roman;
      }

      /* Links */
      .ProseMirror a {
        color: #0891b2;
        text-decoration: underline;
      }

      /* Tables */
      .ProseMirror table {
        border-collapse: collapse;
        table-layout: fixed;
        width: 100%;
        margin: 1em 0;
        overflow: hidden;
      }

      .ProseMirror th {
        background-color: #f8fafc;
        font-weight: 600;
      }

      .ProseMirror th,
      .ProseMirror td {
        border: 1px solid #e2e8f0;
        padding: 0.5em;
        position: relative;
        vertical-align: top;
      }

      /* Blockquotes */
      .ProseMirror blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 1em;
        margin-left: 0;
        margin-right: 0;
      }

      /* Preserve original email formatting */
      .ProseMirror blockquote .original-email-content * {
        font-family: inherit;
        font-size: inherit;
        line-height: inherit;
        color: inherit;
      }

      /* Prevent form submission on enter - these styles will help visually indicate the editor is separate from the form */
      .ProseMirror {
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        transition: border-color 0.15s ease-in-out;
      }

      .ProseMirror:focus {
        border-color: #0891b2;
        box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1);
      }

      /* Task Lists */
      ul[data-type="taskList"] {
        list-style: none;
        padding: 0;
      }

      ul[data-type="taskList"] li {
        display: flex;
        align-items: center;
      }

      ul[data-type="taskList"] li > label {
        margin-right: 0.5rem;
        user-select: none;
      }

      ul[data-type="taskList"] li > div {
        flex: 1 1 auto;
      }

      /* Ensure proper focus indicator */
      .ProseMirror-focused {
        border-color: #0891b2;
        box-shadow: 0 0 0 2px rgba(8, 145, 178, 0.1);
      }
    `}</style>
  );
};

export default TipTapStyles;
