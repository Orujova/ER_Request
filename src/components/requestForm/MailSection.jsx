import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setMailBody,
  addCCUser,
  removeCCUser,
} from "../../redux/slices/formDataSlice";
import SectionContainer from "./SectionContainer";
import AzureUsers from "../AzureUserSelector";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import EditorContextMenu from "../editor/EditorContextMenu";
import EditorToolbar from "../editor/EditorToolbar";

/**
 * Main Mail Section Component
 */
const MailSection = () => {
  const dispatch = useDispatch();
  const editorContainerRef = useRef(null);
  const [tableManager, setTableManager] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
  });

  // Get data from Redux store
  const formData = useSelector((state) => state.formData) || {};
  const mailBody = formData.mailBody || "";
  const selectedCCUsers = formData.selectedCCUsers || [];

  // Configure the editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: "Write your message here...",
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      Typography,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount.configure({
        limit: 50000,
      }),
    ],
    content: mailBody,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      dispatch(setMailBody(html));
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none prose prose-sm max-w-none px-3 py-2 min-h-[150px]",
      },
      handleKeyDown: (view, event) => {
        // Prevent form submission on Enter key
        if (event.key === "Enter" && !event.shiftKey && event.target.form) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  // Initialize table manager when editor is ready
  useEffect(() => {
    if (editor && editorContainerRef.current) {
      const manager = new TableManager(editor, editorContainerRef.current);
      manager.initialize();
      setTableManager(manager);

      return () => {
        if (manager) {
          manager.cleanup();
        }
      };
    }
  }, [editor]);

  // Handle menu button click
  const handleMenuButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // If menu is already visible, hide it
    if (contextMenu.visible) {
      setContextMenu({ visible: false, x: 0, y: 0 });
      return;
    }

    // Position menu near the button
    const buttonRect = e.currentTarget.getBoundingClientRect();

    setContextMenu({
      visible: true,
      x: buttonRect.left,
      y: buttonRect.bottom + 5,
    });
  };

  // Close context menu
  const closeContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // CC User handlers
  const handleSelectCCUser = (user) => {
    dispatch(addCCUser(user));
  };

  const handleRemoveCCUser = (user) => {
    dispatch(removeCCUser(user));
  };

  // Prevent event bubbling
  const handleEditorClick = (e) => {
    e.stopPropagation();
  };

  const infoText =
    "Siz bu bölmədə intizam pozuntusunu ətraflı şəkildə açıqlamalı və əlaqədər şəxsləri CC bölmədə təyin etməlisiniz. Bu bölmədə məktubun ünvanlanacağı müvafiq ER üzvü avtomatik təyin olunur.";

  return (
    <SectionContainer title="Mail" infoText={infoText}>
      <div className="space-y-4">
        {/* CC Users */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CC
          </label>
          <AzureUsers
            onSelect={handleSelectCCUser}
            selectedUsers={selectedCCUsers}
            onRemove={handleRemoveCCUser}
          />
        </div>

        {/* Mail Body Editor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mail Body
          </label>

          <div
            className="border border-gray-200 rounded-lg shadow-sm overflow-hidden editor-wrapper"
            onClick={handleEditorClick}
            ref={editorContainerRef}
          >
            {editor && (
              <EditorToolbar
                editor={editor}
                onMenuClick={handleMenuButtonClick}
              />
            )}

            <div className="bg-white relative">
              <EditorContent editor={editor} />
            </div>

            {/* Character & word count */}
            {editor && editor.storage.characterCount && (
              <div className="text-xs text-gray-500 flex justify-end mt-1 px-2 pb-1">
                <span className="mr-3">
                  {editor.storage.characterCount.words()} words
                </span>
                <span>
                  {editor.storage.characterCount.characters()} characters
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Context menu - rendered at portal level for proper positioning */}
      <EditorContextMenu
        x={contextMenu.x}
        y={contextMenu.y}
        editor={editor}
        onClose={closeContextMenu}
        isVisible={contextMenu.visible}
      />

      {/* Global editor styles */}
      <style jsx global>{`
        /* Basic editor styles */
        .ProseMirror {
          outline: none;
          font-size: 0.875rem;
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

        /* Task Lists */
        .ProseMirror ul[data-type="taskList"] {
          list-style-type: none;
          padding: 0;
        }

        .ProseMirror ul[data-type="taskList"] li {
          display: flex;
          align-items: flex-start;
          margin: 0.3em 0;
        }

        .ProseMirror ul[data-type="taskList"] li > label {
          margin-right: 0.5em;
          user-select: none;
        }

        /* Blockquotes */
        .ProseMirror blockquote {
          border-left: 3px solid #e5e7eb;
          padding-left: 0.8rem;
          color: #4b5563;
          margin: 0.8em 0;
        }

        /* Code blocks */
        .ProseMirror pre {
          background-color: #f3f4f6;
          border-radius: 0.25rem;
          padding: 0.5rem;
          font-family: monospace;
          font-size: 0.8rem;
          overflow-x: auto;
          margin: 0.8em 0;
        }

        /* Tables */
        .ProseMirror table {
          border-collapse: collapse;
          margin: 0.8em 0;
          overflow: hidden;
          width: 100%;
          table-layout: fixed;
          font-size: 0.85rem;
        }

        .ProseMirror th {
          background-color: #f9fafb;
          font-weight: 600;
        }

        .ProseMirror td,
        .ProseMirror th {
          border: 1px solid #e5e7eb;
          padding: 0.3rem 0.5rem;
          position: relative;
          vertical-align: top;
          box-sizing: border-box;
        }

        /* Images */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 0.8em 0;
        }

        /* Links */
        .ProseMirror a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </SectionContainer>
  );
};

// TableManager class implementation for table manipulation
class TableManager {
  constructor(editor, container) {
    this.editor = editor;
    this.container = container;
    this.selectedTable = null;
    this.controlsElement = null;
  }

  initialize() {
    if (!this.container) return;

    const editorDOM = this.container.querySelector(".ProseMirror");
    if (!editorDOM) return;

    this.setupStyles();
    this.setupEventListeners(editorDOM);
  }

  setupStyles() {
    const styleId = "table-management-styles";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      .selected-table {
        outline: 2px solid #3b82f6 !important;
      }
      
      .table-controls {
        position: absolute;
        display: flex;
        align-items: center;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 0.25rem;
        padding: 0.25rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        z-index: 30;
      }
      
      .table-control-button {
        cursor: pointer;
        border: none;
        background: transparent;
        padding: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 0.25rem;
        color: #4b5563;
        margin: 0 0.125rem;
      }
      
      .table-control-button:hover {
        background-color: #f3f4f6;
      }
      
      .table-control-button.danger:hover {
        background-color: #fee2e2;
        color: #dc2626;
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners(editorDOM) {
    // Handle clicks on tables
    editorDOM.addEventListener("click", (e) => {
      const table = this.findParentTable(e.target);

      if (table) {
        this.selectTable(table);
      } else if (!e.target.closest(".table-controls")) {
        this.deselectTable();
      }
    });

    // Handle keyboard actions
    editorDOM.addEventListener("keydown", (e) => {
      if (this.selectedTable && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        this.deleteTable();
      }
    });

    // Handle clicks outside the editor
    document.addEventListener("click", (e) => {
      if (
        !editorDOM.contains(e.target) &&
        !e.target.closest(".table-controls")
      ) {
        this.deselectTable();
      }
    });
  }

  findParentTable(element) {
    let current = element;
    while (current && current.tagName !== "TABLE") {
      current = current.parentElement;
      if (!current || current.classList.contains("ProseMirror")) {
        return null;
      }
    }
    return current;
  }

  selectTable(table) {
    this.deselectTable();

    this.selectedTable = table;
    table.classList.add("selected-table");

    this.showTableControls(table);
  }

  deselectTable() {
    if (this.selectedTable) {
      this.selectedTable.classList.remove("selected-table");
      this.selectedTable = null;
    }

    this.hideTableControls();
  }

  showTableControls(table) {
    this.hideTableControls();

    const tableRect = table.getBoundingClientRect();
    const editorRect = this.container.getBoundingClientRect();

    const controls = document.createElement("div");
    controls.className = "table-controls";
    controls.style.top = `${tableRect.top - editorRect.top - 35}px`;
    controls.style.left = `${tableRect.left - editorRect.left}px`;

    // Move up button
    const moveUpBtn = this.createControlButton(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>',
      "Move table up",
      () => this.moveTableUp()
    );

    // Move down button
    const moveDownBtn = this.createControlButton(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>',
      "Move table down",
      () => this.moveTableDown()
    );

    // Delete button
    const deleteBtn = this.createControlButton(
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>',
      "Delete table",
      () => this.deleteTable(),
      true
    );

    controls.appendChild(moveUpBtn);
    controls.appendChild(moveDownBtn);
    controls.appendChild(deleteBtn);

    this.container.appendChild(controls);
    this.controlsElement = controls;
  }

  createControlButton(icon, title, onClick, isDanger = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `table-control-button ${isDanger ? "danger" : ""}`;
    button.title = title;
    button.innerHTML = icon;
    button.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    });
    return button;
  }

  hideTableControls() {
    if (this.controlsElement) {
      this.controlsElement.remove();
      this.controlsElement = null;
    }
  }

  moveTableUp() {
    if (!this.editor || !this.selectedTable) return;

    const pos = this.editor.view.posAtDOM(this.selectedTable, 0);
    const $pos = this.editor.state.doc.resolve(pos);

    // Find the position of the table node
    let tablePos = null;
    for (let i = $pos.depth; i > 0; i--) {
      const node = $pos.node(i);
      if (node.type.name === "table") {
        tablePos = $pos.before(i);
        break;
      }
    }

    if (tablePos === null) return;

    // Find the previous node
    const previousPos = tablePos - 1;
    if (previousPos <= 0) return;

    const $previousPos = this.editor.state.doc.resolve(previousPos);
    if ($previousPos.nodeBefore) {
      this.editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const tableNode = tr.doc.nodeAt(tablePos);
          const tableNodeSize = tableNode.nodeSize;

          // Delete the table and insert it before the previous node
          tr.delete(tablePos, tablePos + tableNodeSize);
          tr.insert(previousPos - $previousPos.nodeBefore.nodeSize, tableNode);

          return true;
        })
        .run();

      // Reselect the table after moving
      setTimeout(() => {
        const tables = this.container.querySelectorAll("table");
        tables.forEach((t) => {
          if (t !== this.selectedTable) {
            t.classList.remove("selected-table");
          }
        });

        if (this.selectedTable) {
          this.showTableControls(this.selectedTable);
        }
      }, 10);
    }
  }

  moveTableDown() {
    if (!this.editor || !this.selectedTable) return;

    const pos = this.editor.view.posAtDOM(this.selectedTable, 0);
    const $pos = this.editor.state.doc.resolve(pos);

    // Find the position of the table node
    let tablePos = null;
    let tableNode = null;
    for (let i = $pos.depth; i > 0; i--) {
      const node = $pos.node(i);
      if (node.type.name === "table") {
        tablePos = $pos.before(i);
        tableNode = node;
        break;
      }
    }

    if (tablePos === null || tableNode === null) return;

    // Find the next node
    const nextPos = tablePos + tableNode.nodeSize;
    if (nextPos >= this.editor.state.doc.content.size) return;

    const $nextPos = this.editor.state.doc.resolve(nextPos);
    if ($nextPos.nodeAfter) {
      this.editor
        .chain()
        .focus()
        .command(({ tr }) => {
          const tableNodeSize = tableNode.nodeSize;

          // Delete the table and insert it after the next node
          tr.delete(tablePos, tablePos + tableNodeSize);
          tr.insert(nextPos, tableNode);

          return true;
        })
        .run();

      // Reselect the table after moving
      setTimeout(() => {
        const tables = this.container.querySelectorAll("table");
        tables.forEach((t) => {
          if (t !== this.selectedTable) {
            t.classList.remove("selected-table");
          }
        });

        if (this.selectedTable) {
          this.showTableControls(this.selectedTable);
        }
      }, 10);
    }
  }

  deleteTable() {
    if (!this.editor || !this.selectedTable) return;

    const pos = this.editor.view.posAtDOM(this.selectedTable, 0);
    const $pos = this.editor.state.doc.resolve(pos);

    // Find the position of the table node
    let tablePos = null;
    for (let i = $pos.depth; i > 0; i--) {
      const node = $pos.node(i);
      if (node.type.name === "table") {
        tablePos = $pos.before(i);
        break;
      }
    }

    if (tablePos === null) return;

    this.editor.chain().focus().deleteNode("table").run();
    this.deselectTable();
  }

  cleanup() {
    this.deselectTable();

    const editorDOM = this.container.querySelector(".ProseMirror");
    if (editorDOM) {
      editorDOM.removeEventListener("click", this.handleEditorClick);
      editorDOM.removeEventListener("keydown", this.handleKeyDown);
    }

    document.removeEventListener("click", this.handleDocumentClick);
  }
}

export default MailSection;
