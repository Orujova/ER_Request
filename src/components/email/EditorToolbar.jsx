// File: components/email/EditorToolbar.jsx (Basit Versiyon)
import React from "react";
import axios from "axios";
// Projenizdeki API adresini tutan konfigürasyon dosyasını import edin
// Bu yol kendi projenize göre değişebilir, örnek olarak verilmiştir.
import { API_BASE_URL } from "../../../apiConfig";

const EditorToolbar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const safeClick = (fn) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => {
      fn();
    }, 10);
  };

  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("ImageFile", file);

      try {
        // <<< DEĞİŞİKLİK BURADA: API_BASE_URL eklendi >>>
        const response = await axios.post(
          `${API_BASE_URL}/api/ERRequest/UploadERMailImage`,
          formData,
          {
            headers: { 
              "Content-Type": "multipart/form-data",
              // Gerekliyse, buraya Authorization token ekleyebilirsiniz
              // 'Authorization': `Bearer your_token_here`
            },
          }
        );

        if (response.data.IsSuccess) {
          editor
            .chain()
            .focus()
            .setImage({ src: response.data.ImageUrl })
            .run();
        } else {
          alert(`Image upload failed: ${response.data.message}`);
        }
      } catch (error) {
        console.error("Image upload error:", error);
        alert("An error occurred while uploading the image.");
      }
    };
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 p-1 flex flex-wrap items-center gap-0.5">
      <button
        type="button"
        onClick={safeClick(() => editor.chain().focus().toggleBold().run())}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive("bold")
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Bold"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
          <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path>
        </svg>
      </button>

      <button
        type="button"
        onClick={safeClick(() => editor.chain().focus().toggleItalic().run())}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive("italic")
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Italic"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="19" y1="4" x2="10" y2="4"></line>
          <line x1="14" y1="20" x2="5" y2="20"></line>
          <line x1="15" y1="4" x2="9" y2="20"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={safeClick(() =>
          editor.chain().focus().toggleUnderline().run()
        )}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive("underline")
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Underline"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"></path>
          <line x1="4" y1="21" x2="20" y2="21"></line>
        </svg>
      </button>

      <span className="mx-1 text-gray-300">|</span>

      <button
        type="button"
        onClick={safeClick(() => {
          try {
            editor.chain().focus().toggleBulletList().run();
          } catch (error) {
            console.error("Error toggling bullet list:", error);
          }
        })}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive("bulletList")
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Bullet List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            try {
              editor.commands.focus();
              editor.commands.toggleOrderedList();
            } catch (error) {
              console.error("Error toggling ordered list:", error);
            }
          }, 10);
        }}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive("orderedList")
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Numbered List"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="10" y1="6" x2="21" y2="6"></line>
          <line x1="10" y1="12" x2="21" y2="12"></line>
          <line x1="10" y1="18" x2="21" y2="18"></line>
          <path d="M4 6h1v4"></path>
          <path d="M4 10h2"></path>
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"></path>
        </svg>
      </button>

      <span className="mx-1 text-gray-300">|</span>

      <button
        type="button"
        onClick={safeClick(() =>
          editor.chain().focus().setTextAlign("left").run()
        )}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive({ textAlign: "left" })
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Align Left"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="17" y1="10" x2="3" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="17" y1="18" x2="3" y2="18"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={safeClick(() =>
          editor.chain().focus().setTextAlign("center").run()
        )}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive({ textAlign: "center" })
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Align Center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="10" x2="6" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="18" y1="18" x2="6" y2="18"></line>
        </svg>
      </button>

      <button
        type="button"
        onClick={safeClick(() =>
          editor.chain().focus().setTextAlign("right").run()
        )}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive({ textAlign: "right" })
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Align Right"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="21" y1="10" x2="7" y2="10"></line>
          <line x1="21" y1="6" x2="3" y2="6"></line>
          <line x1="21" y1="14" x2="3" y2="14"></line>
          <line x1="21" y1="18" x2="7" y2="18"></line>
        </svg>
      </button>

      <span className="mx-1 text-gray-300">|</span>

      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            const url = window.prompt("Enter the link URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }, 10);
        }}
        className={`p-1.5 rounded hover:bg-gray-200 ${
          editor.isActive("link")
            ? "bg-gray-200 text-cyan-600"
            : "text-gray-700"
        }`}
        title="Add Link"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
      
      <button
        type="button"
        onClick={safeClick(handleImageUpload)}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-700"
        title="Add Image"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      </button>
      
      <span className="mx-1 text-gray-300">|</span>

      <button
        type="button"
        onClick={safeClick(() => editor.chain().focus().undo().run())}
        disabled={!editor.can().undo()}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50"
        title="Undo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 7v6h6"></path>
          <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path>
        </svg>
      </button>

      <button
        type="button"
        onClick={safeClick(() => editor.chain().focus().redo().run())}
        disabled={!editor.can().redo()}
        className="p-1.5 rounded hover:bg-gray-200 text-gray-700 disabled:opacity-50"
        title="Redo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 7v6h-6"></path>
          <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"></path>
        </svg>
      </button>
    </div>
  );
};

export default EditorToolbar;