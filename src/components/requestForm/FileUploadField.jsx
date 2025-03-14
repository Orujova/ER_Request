// src/components/RequestForm/FileUploadField.js
import React, { useRef } from "react";
import { FileUp, X, FileText, Download } from "lucide-react";

const FileUploadField = ({
  label,
  files,
  onFileUpload,
  onRemoveFile,
  required = false,
  showTemplateButton = false,
  onOpenTemplates,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files);
      // Reset the input value to allow selecting the same file again
      e.target.value = "";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div className="file-upload-field">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {showTemplateButton && (
          <button
            type="button"
            onClick={onOpenTemplates}
            className="text-sm text-sky-600 hover:text-sky-800 flex items-center"
          >
            <Download size={16} className="mr-1" />
            View Templates
          </button>
        )}
      </div>

      <div
        className="relative border-2 border-dashed rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
        />

        <div className="flex flex-col items-center justify-center py-4">
          <FileUp size={32} className="text-gray-400 mb-2" />
          <p className="text-sm text-gray-700 mb-1">
            Drag & drop files here or click to browse
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="mt-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-md hover:bg-sky-200 transition-colors"
          >
            Select Files
          </button>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {files.length} {files.length === 1 ? "file" : "files"} selected
          </p>

          <div className="space-y-2 max-h-40 overflow-y-auto p-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 bg-sky-50 rounded-lg border border-sky-100"
              >
                <div className="flex items-center">
                  <FileText size={18} className="text-sky-600 mr-2" />
                  <span className="text-sm text-gray-700 truncate max-w-xs">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveFile(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {required && files.length === 0 && (
        <p className="mt-2 text-sm text-red-500">
          This document is required for your selected case type.
        </p>
      )}
    </div>
  );
};

export default FileUploadField;
