import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Table as TableIcon,
  Image as ImageIcon,
  Columns,
  Heading1,
  Heading2,
  Heading3,
  Plus,
  Minus,
  ChevronDown,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  FileText,
  Menu,
} from "lucide-react";

const ToolbarButton = ({ icon, tooltip, active, onClick, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-1 rounded transition-colors ${
        active ? "bg-gray-700 text-white" : "text-gray-700 hover:bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={tooltip}
    >
      {icon}
    </button>
  );
};

/**
 * Divider component for toolbar
 */
const ToolbarDivider = () => <div className="h-5 w-px bg-gray-300 mx-1"></div>;

/**
 * Dropdown item component
 */
const DropdownItem = ({ icon, label, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center px-3 py-1.5 text-xs rounded ${
        active ? "bg-gray-200 text-gray-800" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </button>
  );
};

/**
 * Dropdown component
 */
const Dropdown = ({
  triggerIcon,
  label,
  isOpen,
  setIsOpen,
  width = "w-40",
  children,
}) => {
  const ref = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative" ref={ref}>
      <ToolbarButton
        icon={
          <>
            {triggerIcon}
            <ChevronDown size={12} className="ml-1" />
          </>
        }
        tooltip={label}
        onClick={() => setIsOpen(!isOpen)}
      />

      {isOpen && (
        <div
          className={`absolute top-full left-0 mt-1 ${width} bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

const EditorToolbar = ({ editor, onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  if (!editor) {
    return (
      <div className="border-b border-gray-200 bg-gray-100 rounded-t-lg p-1">
        Loading editor...
      </div>
    );
  }

  // Toggle dropdown visibility
  const toggleDropdown = (name) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setActiveDropdown(null);
  };

  // Insert a link
  const handleLinkInsert = () => {
    const url = window.prompt("Enter URL");
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
    }
    closeAllDropdowns();
  };

  // Insert an image
  const handleImageInsert = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    closeAllDropdowns();
  };

  // Insert a table
  const insertTable = () => {
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    closeAllDropdowns();
  };

  return (
    <div className="border-b border-gray-200 bg-gray-100 rounded-t-lg py-1 px-2">
      <div className="flex flex-wrap items-center gap-1">
        {/* Heading dropdown */}
        <Dropdown
          triggerIcon={<Heading1 size={14} />}
          label="Headings"
          isOpen={activeDropdown === "heading"}
          setIsOpen={(isOpen) =>
            isOpen ? toggleDropdown("heading") : closeAllDropdowns()
          }
        >
          <DropdownItem
            icon={<Heading1 size={14} />}
            label="Heading 1"
            active={editor.isActive("heading", { level: 1 })}
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<Heading2 size={14} />}
            label="Heading 2"
            active={editor.isActive("heading", { level: 2 })}
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<Heading3 size={14} />}
            label="Heading 3"
            active={editor.isActive("heading", { level: 3 })}
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<FileText size={14} />}
            label="Normal Text"
            active={editor.isActive("paragraph")}
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              closeAllDropdowns();
            }}
          />
        </Dropdown>

        <ToolbarDivider />

        {/* Text formatting */}
        <ToolbarButton
          icon={<Bold size={14} />}
          tooltip="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={<Italic size={14} />}
          tooltip="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={<UnderlineIcon size={14} />}
          tooltip="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />

        <ToolbarDivider />

        {/* Text alignment dropdown */}
        <Dropdown
          triggerIcon={<AlignLeft size={14} />}
          label="Text Alignment"
          isOpen={activeDropdown === "alignment"}
          setIsOpen={(isOpen) =>
            isOpen ? toggleDropdown("alignment") : closeAllDropdowns()
          }
        >
          <DropdownItem
            icon={<AlignLeft size={14} />}
            label="Align Left"
            active={editor.isActive({ textAlign: "left" })}
            onClick={() => {
              editor.chain().focus().setTextAlign("left").run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<AlignCenter size={14} />}
            label="Align Center"
            active={editor.isActive({ textAlign: "center" })}
            onClick={() => {
              editor.chain().focus().setTextAlign("center").run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<AlignRight size={14} />}
            label="Align Right"
            active={editor.isActive({ textAlign: "right" })}
            onClick={() => {
              editor.chain().focus().setTextAlign("right").run();
              closeAllDropdowns();
            }}
          />
        </Dropdown>

        <ToolbarDivider />

        {/* Lists dropdown */}
        <Dropdown
          triggerIcon={<List size={14} />}
          label="Lists"
          isOpen={activeDropdown === "list"}
          setIsOpen={(isOpen) =>
            isOpen ? toggleDropdown("list") : closeAllDropdowns()
          }
        >
          <DropdownItem
            icon={<List size={14} />}
            label="Bullet List"
            active={editor.isActive("bulletList")}
            onClick={() => {
              editor.chain().focus().toggleBulletList().run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<ListOrdered size={14} />}
            label="Numbered List"
            active={editor.isActive("orderedList")}
            onClick={() => {
              editor.chain().focus().toggleOrderedList().run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<CheckSquare size={14} />}
            label="Task List"
            active={editor.isActive("taskList")}
            onClick={() => {
              editor.chain().focus().toggleTaskList().run();
              closeAllDropdowns();
            }}
          />
        </Dropdown>

        <ToolbarDivider />

        {/* Block formatting */}
        <ToolbarButton
          icon={<Quote size={14} />}
          tooltip="Blockquote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={<Code size={14} />}
          tooltip="Code Block"
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />

        <ToolbarDivider />

        {/* Insert dropdown */}
        <Dropdown
          triggerIcon={<Plus size={14} />}
          label="Insert"
          isOpen={activeDropdown === "insert"}
          setIsOpen={(isOpen) =>
            isOpen ? toggleDropdown("insert") : closeAllDropdowns()
          }
          width="w-44"
        >
          <DropdownItem
            icon={<TableIcon size={14} />}
            label="Table"
            onClick={() => insertTable()}
          />
          <DropdownItem
            icon={<ImageIcon size={14} />}
            label="Image"
            onClick={() => handleImageInsert()}
          />
          <DropdownItem
            icon={<Columns size={14} />}
            label="Columns"
            onClick={() => {
              // Placeholder for columns functionality
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<Minus size={14} />}
            label="Horizontal Rule"
            onClick={() => {
              editor.chain().focus().setHorizontalRule().run();
              closeAllDropdowns();
            }}
          />
          <DropdownItem
            icon={<LinkIcon size={14} />}
            label="Hyperlink"
            onClick={() => handleLinkInsert()}
          />
          <DropdownItem
            icon={<List size={14} />}
            label="Table of Contents"
            onClick={() => {
              // Placeholder for table of contents
              closeAllDropdowns();
            }}
          />
        </Dropdown>

        <div className="flex-1"></div>

        {/* Context Menu Button */}
        <ToolbarButton
          icon={<Menu size={14} />}
          tooltip="Formatting Options"
          onClick={onMenuClick}
        />

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          icon={<Undo size={14} />}
          tooltip="Undo"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        />
        <ToolbarButton
          icon={<Redo size={14} />}
          tooltip="Redo"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        />
      </div>
    </div>
  );
};

export default EditorToolbar;
