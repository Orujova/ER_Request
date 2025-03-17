import React, { useEffect, useRef } from "react";
import {
  CircleX,
  Copy,
  Files,
  Trash2,
  Table2,
  TextCursorInput,
} from "lucide-react";

/**
 * Editor Context Menu Component
 */
const EditorContextMenu = ({ x, y, editor, onClose, isVisible }) => {
  const menuRef = useRef(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  // Handler for menu actions
  const handleAction = (action) => {
    if (!editor) return;

    switch (action) {
      case "clear":
        // Clear formatting from selected text
        editor.chain().focus().clearNodes().unsetAllMarks().run();
        break;

      case "copy":
        // Copy selected text to clipboard
        try {
          const { state } = editor;
          const { from, to } = state.selection;
          const selectedText = state.doc.textBetween(from, to, " ");
          navigator.clipboard.writeText(selectedText);
        } catch (err) {
          console.error("Failed to copy text: ", err);
        }
        break;

      case "duplicate":
        // Duplicate selected content
        try {
          const { state } = editor;
          const { from, to } = state.selection;

          if (from === to) {
            // No selection, nothing to duplicate
            break;
          }

          // Get the selected content as a slice
          const slice = state.doc.slice(from, to);

          // Insert the content at the end of the current selection
          editor.chain().focus().insertContentAt(to, slice.content).run();
        } catch (err) {
          console.error("Failed to duplicate content: ", err);
        }
        break;

      case "delete":
        // Delete selected content
        editor.chain().focus().deleteSelection().run();
        break;

      default:
        break;
    }

    onClose();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-lg text-gray-800 py-1 border border-gray-200"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        minWidth: "240px",
      }}
    >
      <div className="px-1">
        <button
          className="flex items-center w-full px-2 py-2 text-sm hover:bg-gray-100 rounded-md"
          onClick={() => handleAction("clear")}
        >
          <CircleX size={16} className="mr-3" />
          <span>Clear formatting</span>
        </button>

        <button
          className="flex items-center w-full px-2 py-2 text-sm hover:bg-gray-100 rounded-md"
          onClick={() => handleAction("copy")}
        >
          <Copy size={16} className="mr-3" />
          <span>Copy to clipboard</span>
        </button>

        <button
          className="flex items-center w-full px-2 py-2 text-sm hover:bg-gray-100 rounded-md"
          onClick={() => handleAction("duplicate")}
        >
          <Files size={16} className="mr-3" />
          <span>Duplicate</span>
        </button>

        <button
          className="flex items-center w-full px-2 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md"
          onClick={() => handleAction("delete")}
        >
          <Trash2 size={16} className="mr-3" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default EditorContextMenu;
