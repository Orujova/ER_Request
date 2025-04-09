// File: components/email/TipTapStyles.jsx
import React from "react";

const TipTapStyles = () => {
  return (
    <style jsx global>{`
      /* Basic editor styles */
      .ProseMirror {
        outline: none;
        font-size: 0.875rem;
        height: 100%;
        overflow-y: auto;
        padding: 1rem;
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

      /* Links */
      .ProseMirror a {
        color: #0891b2;
        text-decoration: underline;
      }
    `}</style>
  );
};

export default TipTapStyles;
