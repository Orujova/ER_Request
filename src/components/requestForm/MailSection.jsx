// src/components/RequestForm/MailSection.js
import React, { useState, useEffect, useRef } from "react";
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
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Check,
  Quote,
  Code,
  Table as TableIcon,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Plus,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

import "../../styles/editor.css";

// Add table management script
const TableManager = () => {
  const dispatch = useDispatch();
  const editorRef = useRef(null);

  useEffect(() => {
    // Initialize the table manager after component mounts
    const init = () => {
      initializeTableManagement(editorRef.current, (content) => {
        dispatch(setMailBody(content));
      });
    };

    // Wait for DOM to be ready
    if (editorRef.current) {
      init();
    } else {
      const checkInterval = setInterval(() => {
        if (editorRef.current) {
          init();
          clearInterval(checkInterval);
        }
      }, 100);

      return () => clearInterval(checkInterval);
    }
  }, [dispatch]);

  return <div ref={editorRef} id="editor-container" className="relative"></div>;
};

// Table management function
function initializeTableManagement(containerRef, updateContentCallback) {
  if (!containerRef) return;

  // Find the editor content element
  const editorContent = containerRef.querySelector(".ProseMirror");
  if (!editorContent) return;

  // Add styles for selected tables
  const style = document.createElement("style");
  style.textContent = `
    .selected-table {
      outline: 2px solid #3b82f6;
    }
    
    .table-control-buttons {
      display: flex;
      align-items: center;
    }
    
    .table-control-buttons button {
      cursor: pointer;
      border: none;
      background: transparent;
    }
  `;
  document.head.appendChild(style);

  // Add click event listener to the editor content
  editorContent.addEventListener("click", function (e) {
    // Check if a table was clicked
    const table = findTableElement(e.target);

    if (table) {
      // Remove any existing selection
      removeSelectionHighlight();

      // Add highlight to the selected table
      table.classList.add("selected-table");

      // Show table controls if they don't exist
      showTableControls(table, updateContentCallback);
    } else if (!e.target.closest(".table-control-buttons")) {
      // If clicked outside of a table and not on the control buttons,
      // remove selection and controls
      removeSelectionHighlight();
      removeTableControls();
    }
  });

  // Listen for keydown to handle deletion
  editorContent.addEventListener("keydown", function (e) {
    if (e.key === "Delete" || e.key === "Backspace") {
      const selectedTable = document.querySelector(".selected-table");
      if (selectedTable) {
        e.preventDefault(); // Prevent default action
        deleteTable(selectedTable, updateContentCallback);
      }
    }
  });
}

function findTableElement(element) {
  // Traverse up to find if the clicked element is in a table
  while (element && element !== document.body) {
    if (element.tagName === "TABLE") {
      return element;
    }
    element = element.parentElement;
  }
  return null;
}

function showTableControls(table, updateContentCallback) {
  // Remove any existing controls
  removeTableControls();

  // Create control buttons container
  const controls = document.createElement("div");
  controls.className =
    "table-control-buttons fixed bg-white shadow-md rounded p-1 z-10";
  controls.style.top =
    table.getBoundingClientRect().top + window.scrollY - 30 + "px";
  controls.style.left = table.getBoundingClientRect().left + "px";

  // Add move up button
  const moveUpBtn = document.createElement("button");
  moveUpBtn.type = "button";
  moveUpBtn.className = "p-1 rounded hover:bg-gray-200 text-gray-700 mr-1";
  moveUpBtn.title = "Move table up";
  moveUpBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 15 5-5 5 5"/></svg>';
  moveUpBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveTableUp(table, updateContentCallback);
  });

  // Add move down button
  const moveDownBtn = document.createElement("button");
  moveDownBtn.type = "button";
  moveDownBtn.className = "p-1 rounded hover:bg-gray-200 text-gray-700 mr-1";
  moveDownBtn.title = "Move table down";
  moveDownBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 9 5 5 5-5"/></svg>';
  moveDownBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    moveTableDown(table, updateContentCallback);
  });

  // Add delete button
  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "p-1 rounded hover:bg-gray-200 text-red-500";
  deleteBtn.title = "Delete table";
  deleteBtn.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';
  deleteBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTable(table, updateContentCallback);
  });

  // Add buttons to container
  controls.appendChild(moveUpBtn);
  controls.appendChild(moveDownBtn);
  controls.appendChild(deleteBtn);

  // Add to document
  document.body.appendChild(controls);
}

function removeTableControls() {
  const controls = document.querySelector(".table-control-buttons");
  if (controls) {
    controls.remove();
  }
}

function removeSelectionHighlight() {
  const selectedTables = document.querySelectorAll(".selected-table");
  selectedTables.forEach((table) => {
    table.classList.remove("selected-table");
  });
}

function moveTableUp(table, updateCallback) {
  const contentNode = findContentNode(table);
  if (!contentNode) return;

  const previousNode = findPreviousContentNode(contentNode);
  if (previousNode) {
    contentNode.parentNode.insertBefore(contentNode, previousNode);
    updateEditorContent(updateCallback);
  }
}

function moveTableDown(table, updateCallback) {
  const contentNode = findContentNode(table);
  if (!contentNode) return;

  const nextNode = contentNode.nextElementSibling;
  if (nextNode) {
    contentNode.parentNode.insertBefore(nextNode, contentNode);
    updateEditorContent(updateCallback);
  }
}

function deleteTable(table, updateCallback) {
  const contentNode = findContentNode(table);
  if (contentNode) {
    contentNode.remove();
    removeTableControls();
    updateEditorContent(updateCallback);
  }
}

function findContentNode(element) {
  // Find the content block that contains this element
  // This will depend on your editor's structure
  while (element && element !== document.body) {
    if (element.classList.contains("ProseMirror-node")) {
      return element;
    }
    element = element.parentElement;
  }
  return element.closest("p, div, table");
}

function findPreviousContentNode(node) {
  let prev = node.previousElementSibling;
  while (
    prev &&
    (prev.classList.contains("table-control-buttons") ||
      getComputedStyle(prev).display === "none")
  ) {
    prev = prev.previousElementSibling;
  }
  return prev;
}

function updateEditorContent(updateCallback) {
  // Get editor content
  const editorElement = document.querySelector(".ProseMirror");
  if (!editorElement) return;

  const content = editorElement.innerHTML;

  // Update content using the callback
  if (typeof updateCallback === "function") {
    updateCallback(content);
  }
}

const MenuBar = ({ editor }) => {
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showInsertMenu, setShowInsertMenu] = useState(false);
  const [showListMenu, setShowListMenu] = useState(false);

  if (!editor) {
    return null;
  }

  const toggleHeadingMenu = (e) => {
    e.preventDefault();
    setShowHeadingMenu(!showHeadingMenu);
    setShowInsertMenu(false);
    setShowListMenu(false);
  };

  const toggleInsertMenu = (e) => {
    e.preventDefault();
    setShowInsertMenu(!showInsertMenu);
    setShowHeadingMenu(false);
    setShowListMenu(false);
  };

  const toggleListMenu = (e) => {
    e.preventDefault();
    setShowListMenu(!showListMenu);
    setShowHeadingMenu(false);
    setShowInsertMenu(false);
  };

  const closeAllMenus = () => {
    setShowHeadingMenu(false);
    setShowInsertMenu(false);
    setShowListMenu(false);
  };

  // Function to handle image insertion
  const handleImageInsert = (e) => {
    e.preventDefault();
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
    closeAllMenus();
  };

  // Function to insert a table
  const insertTable = (e) => {
    e.preventDefault();
    editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
    closeAllMenus();
  };

  // Function to insert horizontal rule
  const insertHorizontalRule = (e) => {
    e.preventDefault();
    editor.chain().focus().setHorizontalRule().run();
    closeAllMenus();
  };

  return (
    <div className="border-b border-gray-200 bg-gray-100 rounded-t-lg flex flex-wrap items-center">
      {/* Main toolbar */}
      <div className="flex items-center space-x-1 p-1 w-full">
        <div className="flex items-center space-x-1 flex-1">
          <button
            type="button"
            onClick={toggleHeadingMenu}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 flex items-center"
            title="Heading"
          >
            <Heading1 size={16} />
            <ChevronDown size={14} />
          </button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBold().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("bold")
                ? "bg-gray-200 text-sky-600"
                : "text-gray-700"
            }`}
            title="Bold"
          >
            <Bold size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleItalic().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("italic")
                ? "bg-gray-200 text-sky-600"
                : "text-gray-700"
            }`}
            title="Italic"
          >
            <Italic size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleUnderline().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("underline")
                ? "bg-gray-200 text-sky-600"
                : "text-gray-700"
            }`}
            title="Underline"
          >
            <UnderlineIcon size={16} />
          </button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={toggleListMenu}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 flex items-center"
            title="Lists"
          >
            <List size={16} />
            <ChevronDown size={14} />
          </button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleBlockquote().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("blockquote")
                ? "bg-gray-200 text-sky-600"
                : "text-gray-700"
            }`}
            title="Quote"
          >
            <Quote size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().toggleCodeBlock().run();
            }}
            className={`p-1.5 rounded hover:bg-gray-200 ${
              editor.isActive("codeBlock")
                ? "bg-gray-200 text-sky-600"
                : "text-gray-700"
            }`}
            title="Code"
          >
            <Code size={16} />
          </button>

          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={toggleInsertMenu}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700 flex items-center"
            title="Insert"
          >
            <Plus size={16} />
            <ChevronDown size={14} />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <div className="h-5 w-px bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().undo().run();
            }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7v6h6"></path>
              <path d="M3 13c0-4.4 3.6-8 8-8h6"></path>
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              editor.chain().focus().redo().run();
            }}
            className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 7v6h-6"></path>
              <path d="M21 13c0-4.4-3.6-8-8-8H7"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Heading dropdown menu */}
      {showHeadingMenu && (
        <div className="absolute bg-white shadow-lg rounded-md z-10 mt-8 ml-1 border border-gray-200">
          <div className="p-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
                closeAllMenus();
              }}
              className={`p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full ${
                editor.isActive("heading", { level: 1 })
                  ? "bg-gray-100 text-sky-600"
                  : ""
              }`}
            >
              <Heading1 size={16} className="mr-2" />
              <span>Heading 1</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
                closeAllMenus();
              }}
              className={`p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full ${
                editor.isActive("heading", { level: 2 })
                  ? "bg-gray-100 text-sky-600"
                  : ""
              }`}
            >
              <Heading2 size={16} className="mr-2" />
              <span>Heading 2</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
                closeAllMenus();
              }}
              className={`p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full ${
                editor.isActive("heading", { level: 3 })
                  ? "bg-gray-100 text-sky-600"
                  : ""
              }`}
            >
              <Heading3 size={16} className="mr-2" />
              <span>Heading 3</span>
            </button>
          </div>
        </div>
      )}

      {/* List dropdown menu */}
      {showListMenu && (
        <div className="absolute bg-white shadow-lg rounded-md z-10 mt-8 ml-16 border border-gray-200">
          <div className="p-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBulletList().run();
                closeAllMenus();
              }}
              className={`p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full ${
                editor.isActive("bulletList") ? "bg-gray-100 text-sky-600" : ""
              }`}
            >
              <List size={16} className="mr-2" />
              <span>Bullet List</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleOrderedList().run();
                closeAllMenus();
              }}
              className={`p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full ${
                editor.isActive("orderedList") ? "bg-gray-100 text-sky-600" : ""
              }`}
            >
              <ListOrdered size={16} className="mr-2" />
              <span>Numbered List</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleTaskList().run();
                closeAllMenus();
              }}
              className={`p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full ${
                editor.isActive("taskList") ? "bg-gray-100 text-sky-600" : ""
              }`}
            >
              <Check size={16} className="mr-2" />
              <span>Task List</span>
            </button>
          </div>
        </div>
      )}

      {/* Insert dropdown menu */}
      {showInsertMenu && (
        <div className="absolute bg-white shadow-lg rounded-md z-10 mt-8 ml-64 border border-gray-200">
          <div className="p-1">
            <button
              type="button"
              onClick={insertTable}
              className="p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full"
            >
              <TableIcon size={16} className="mr-2" />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={handleImageInsert}
              className="p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full"
            >
              <ImageIcon size={16} className="mr-2" />
              <span>Image</span>
            </button>
            <button
              type="button"
              onClick={insertHorizontalRule}
              className="p-2 rounded hover:bg-gray-100 text-gray-700 flex items-center w-full"
            >
              <Minus size={16} className="mr-2" />
              <span>Horizontal Rule</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MailSection = () => {
  const dispatch = useDispatch();

  // Add fallbacks for undefined state
  const formData = useSelector((state) => state.formData) || {};
  const mailBody = formData.mailBody || "";
  const selectedCCUsers = formData.selectedCCUsers || [];

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
    ],
    content: mailBody,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      dispatch(setMailBody(html));
    },
    editorProps: {
      // Prevent form submission on Enter key
      handleKeyDown: (view, event) => {
        if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
          // Allow new line on Ctrl/Cmd+Enter
          return false;
        }
        // Prevent Enter from submitting form
        if (event.key === "Enter" && !event.shiftKey && event.target.form) {
          event.preventDefault();
          return true; // Handle the event
        }
        return false; // Don't handle other events
      },
      attributes: {
        class: "focus:outline-none prose prose-sm max-w-none",
      },
    },
  });

  const handleSelectCCUser = (user) => {
    dispatch(addCCUser(user));
  };

  const handleRemoveCCUser = (user) => {
    dispatch(removeCCUser(user));
  };

  // Handle any click events that might bubble up to parents
  const handleEditorClick = (e) => {
    e.stopPropagation(); // Prevent event from bubbling up
  };

  const infoText =
    "Siz bu bölmədə intizam pozuntusunu ətraflı şəkildə açıqlamalı və əlaqədər şəxsləri CC bölmədə təyin etməlisiniz. Bu bölmədə məktubun ünvanlanacağı müvafiq ER üzvü avtomatik təyin olunur.";

  return (
    <SectionContainer title="Mail" infoText={infoText}>
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          CC
        </label>

        <AzureUsers
          onSelect={handleSelectCCUser}
          selectedUsers={selectedCCUsers}
          onRemove={handleRemoveCCUser}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Mail Body
        </label>

        <div
          className="border border-gray-200 rounded-lg overflow-hidden shadow-sm relative"
          onClick={handleEditorClick}
          onKeyDown={(e) => {
            // Prevent form submission on Enter key
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
            }
          }}
        >
          <MenuBar editor={editor} />
          <div className="px-4 py-3 min-h-64 bg-white relative">
            <EditorContent editor={editor} className="editor-content" />
            <TableManager />
          </div>
        </div>

        {/* Custom style for editor */}
        <style jsx global>{`
          /* Table styles */
          .ProseMirror table {
            border-collapse: collapse;
            table-layout: fixed;
            width: 100%;
            margin: 0.5em 0;
            overflow: hidden;
          }

          .ProseMirror td,
          .ProseMirror th {
            min-width: 1em;
            border: 2px solid #ced4da;
            padding: 3px 5px;
            vertical-align: top;
            box-sizing: border-box;
            position: relative;
          }

          .ProseMirror th {
            font-weight: bold;
            background-color: #f8f9fa;
          }

          /* Selected table style */
          .selected-table {
            outline: 2px solid #3b82f6;
          }

          /* Fix table control buttons */
          .table-control-buttons {
            z-index: 20;
          }

          /* Task list styles */
          .ProseMirror ul[data-type="taskList"] {
            list-style: none;
            padding: 0;
          }

          .ProseMirror ul[data-type="taskList"] li {
            display: flex;
            align-items: flex-start;
            margin-bottom: 0.5em;
          }

          .ProseMirror ul[data-type="taskList"] li > label {
            flex: 0 0 auto;
            margin-right: 0.5em;
            user-select: none;
          }

          .ProseMirror ul[data-type="taskList"] li > div {
            flex: 1 1 auto;
          }

          /* Placeholder text */
          .ProseMirror p.is-editor-empty:first-child::before {
            color: #adb5bd;
            content: "Type your message here...";
            float: left;
            height: 0;
            pointer-events: none;
          }
        `}</style>
      </div>
    </SectionContainer>
  );
};

export default MailSection;
