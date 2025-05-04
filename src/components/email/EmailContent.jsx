import React, { useEffect, useRef } from "react";

const EmailContent = ({ content }) => {
  const iframeRef = useRef(null);

  if (!content) return null;

  if (content.ContentType === "html") {
    // Add default styles to make email content more consistent, but keep iframe height minimal
    const contentWithStyles = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              font-size: 0.85rem;
              line-height: 1.4;
              color: #334155;
              margin: 0;
              padding: 12px;
              overflow-y: hidden;
            }
            /* Email specific styles */
            .email-container {
              max-width: 100%;
              word-break: break-word;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            /* Table styles - but don't override user's own table styles */
            table:not([style]) {
              border-collapse: collapse;
              width: 100%;
              margin-bottom: 0.8em;
            }
            th:not([style]) {
              background-color: #f8fafc;
              font-weight: 600;
            }
            th:not([style]), td:not([style]) {
              border: 1px solid #e2e8f0;
              padding: 6px;
              text-align: left;
            }
            /* Keep all original styles */
            table[style], th[style], td[style] {
              background-color: inherit;
              border: inherit;
              padding: inherit;
              text-align: inherit;
            }
            pre, code {
              white-space: pre-wrap;
              background-color: #f1f5f9;
              border-radius: 4px;
              padding: 2px 4px;
              font-family: monospace;
            }
            blockquote {
              border-left: 3px solid #e2e8f0;
              margin-left: 0;
              padding-left: 12px;
              color: #64748b;
            }
            a {
              color: #0891b2;
              text-decoration: underline;
            }
            p {
              margin-top: 0.4em;
              margin-bottom: 0.4em;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 0.8em;
              margin-bottom: 0.4em;
              color: #1e293b;
            }
            
            /* Hide scrollbars */
            ::-webkit-scrollbar {
              display: none;
            }
            
            * {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            ${content.Content}
          </div>
          <script>
            // Auto-resize iframe based on content height
            document.addEventListener('DOMContentLoaded', function() {
              const height = document.body.scrollHeight;
              window.parent.postMessage({ type: 'resize-iframe', height: height }, '*');
              
              // Make tables responsive
              const tables = document.querySelectorAll('table');
              tables.forEach(table => {
                if (table.offsetWidth > document.body.offsetWidth) {
                  table.style.maxWidth = '100%';
                  table.style.overflowX = 'auto';
                  table.style.display = 'block';
                }
              });
            });
          </script>
        </body>
      </html>
    `;

    // Handle iframe resize messages
    useEffect(() => {
      const handleIframeResize = (event) => {
        const { data } = event;
        if (data && data.type === "resize-iframe" && iframeRef.current) {
          // Add a small buffer to avoid scrollbars
          iframeRef.current.style.height = `${data.height + 16}px`;
        }
      };

      window.addEventListener("message", handleIframeResize);
      return () => {
        window.removeEventListener("message", handleIframeResize);
      };
    }, []);

    return (
      <iframe
        ref={iframeRef}
        srcDoc={contentWithStyles}
        title="Email content"
        className="w-full border-none overflow-hidden"
        style={{ height: "200px", maxWidth: "100%" }}
        sandbox="allow-same-origin allow-scripts"
        scrolling="no"
      />
    );
  }

  // Text content with better formatting
  return (
    <div className="whitespace-pre-wrap text-xs leading-relaxed p-3 text-slate-700 overflow-hidden">
      {content.Content}
    </div>
  );
};

export default EmailContent;
