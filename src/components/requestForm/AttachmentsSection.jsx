// src/components/RequestForm/AttachmentsSection.js
import React, { useRef, useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addActFile,
  addPresentationFile,
  addExplanationFile,
  addOtherFile,
  removeActFile,
  removePresentationFile,
  removeExplanationFile,
  removeOtherFile,
} from "../../redux/slices/formDataSlice";
import { openTemplatePanel } from "../../redux/slices/uiSlice";
import SectionContainer from "./SectionContainer";
import { FileUp, X, FileText, Download } from "lucide-react";

// Individual attachment section component
const AttachmentSection = ({
  title,
  files,
  onAddFiles,
  onRemoveFile,
  required,
  templateType, // 'act', 'presentation', 'explanation', or null for "other"
  dispatch,
  fileCache,
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      try {
        // console.log(
        //   `Files selected for ${title}:`,
        //   Array.from(e.target.files).map((f) => f.name)
        // );

        // Convert FileList to array of files
        const fileArray = Array.from(e.target.files);

        // Create serializable metadata for Redux
        const fileMetadata = fileArray.map((file) => {
          // Create a unique ID for the file with the proper category prefix
          const fileType = templateType || "other"; // Use template type or default to "other"
          const id = `${fileType}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;

          // Store the actual File object in fileCache ref with its type
          if (fileCache?.current) {
            fileCache.current.set(id, {
              file,
              type: fileType, // Store the file type explicitly
            });
            // console.log(
            //   `Cached file with ID: ${id}, name: ${file.name}, type: ${fileType}`
            // );
          } else {
            console.warn("fileCache not available");
          }

          // Return only serializable metadata for Redux
          return {
            id,
            name: file.name,
            type: file.type,
            size: file.size,
            category: fileType, // Store category in metadata too for reference
          };
        });

        // Pass the metadata to the handler
        onAddFiles(fileMetadata);
      } catch (error) {
        console.error("Error handling file selection:", error);
      } finally {
        // Reset input to enable selecting the same file again
        e.target.value = "";
      }
    }
  };

  const handleOpenTemplates = () => {
    if (templateType) {
      dispatch(openTemplatePanel(templateType));
    }
  };

  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium text-gray-700">
          {title}
          {required && <span className="text-red-500 ml-1">*</span>}
        </h3>

        {templateType && (
          <button
            type="button"
            onClick={handleOpenTemplates}
            className="text-xs text-sky-600 hover:text-sky-800 flex items-center"
          >
            <Download size={14} className="mr-1" />
            Template
          </button>
        )}
      </div>

      <div className="mb-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 px-3 border border-dashed border-gray-300 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors text-sm"
        >
          <FileUp size={16} className="text-gray-400" />
          <span className="text-gray-600">Add File</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
          accept="*/*"
        />
      </div>

      {files && files.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {files.map((file, index) => (
            <div
              key={file.id || index}
              className="flex items-center justify-between py-1 px-2 bg-white rounded text-xs"
            >
              <div className="flex items-center overflow-hidden">
                <FileText
                  size={14}
                  className="flex-shrink-0 text-sky-600 mr-1"
                />
                <span className="truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveFile(index)}
                className="ml-1 p-1 text-gray-400 hover:text-red-500"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {required && (!files || files.length === 0) && (
        <p className="mt-1 text-xs text-red-500">Required</p>
      )}
    </div>
  );
};

// Creating a local storage mechanism if fileCache is not available
const createLocalStorage = () => {
  const storage = new Map();
  // console.log("Created local file storage as fallback");
  return { current: storage };
};

const AttachmentsSection = ({ fileCache }) => {
  const dispatch = useDispatch();

  // Create a local fallback storage if fileCache is not provided
  const [localFileCache] = useState(createLocalStorage());
  const effectiveFileCache = fileCache || localFileCache;

  // console.log("AttachmentsSection rendered, fileCache available:", !!fileCache);

  // Get data from Redux store with fallbacks
  const formData = useSelector((state) => state.formData || {});
  const requestForm = useSelector((state) => state.requestForm || {});

  const actFiles = formData.actFiles || [];
  const presentationFiles = formData.presentationFiles || [];
  const explanationFiles = formData.explanationFiles || [];
  const otherFiles = formData.otherFiles || [];

  // Log the current files for debugging
  // useEffect(() => {
  //   console.log("Files in state:", {
  //     act: actFiles.length,
  //     presentation: presentationFiles.length,
  //     explanation: explanationFiles.length,
  //     other: otherFiles.length,
  //   });

  //   console.log("Files in cache:", effectiveFileCache.current.size);
  // }, [
  //   actFiles,
  //   presentationFiles,
  //   explanationFiles,
  //   otherFiles,
  //   effectiveFileCache,
  // ]);

  const requestType = formData.requestType || "";
  const subCase = formData.subCase || "";
  const subCases = requestForm.subCases || [];

  // Get the selected subCase object
  const selectedSubCaseObj = subCases.find((sc) => sc.Description === subCase);

  // Check if specific document types are required
  const isActRequired = selectedSubCaseObj?.IsActRequired || false;
  const isPresentationRequired =
    selectedSubCaseObj?.IsPresentationRequired || false;
  const isExplanationRequired =
    selectedSubCaseObj?.IsExplanationRequired || false;

  // Create instruction text for required documents
  let infoText =
    "Please attach any relevant documents to support your request.";

  if (requestType && subCase) {
    let requiredTypes = [];
    if (isActRequired) requiredTypes.push("Act");
    if (isPresentationRequired) requiredTypes.push("Presentation");
    if (isExplanationRequired) requiredTypes.push("Explanation");

    if (requiredTypes.length > 0) {
      infoText = `For this request type, the following documents are required: ${requiredTypes.join(
        ", "
      )}.`;
    }
  }

  // Handle adding files
  const handleActFileUpload = (fileMetadata) => {
   
    dispatch(addActFile(fileMetadata));
  };

  const handlePresentationFileUpload = (fileMetadata) => {
   
    dispatch(addPresentationFile(fileMetadata));
  };

  const handleExplanationFileUpload = (fileMetadata) => {
 
    dispatch(addExplanationFile(fileMetadata));
  };

  const handleOtherFileUpload = (fileMetadata) => {
    
    dispatch(addOtherFile(fileMetadata));
  };

  // Handle removing files
  const handleRemoveActFile = (index) => {
    const fileToRemove = actFiles[index];
    if (fileToRemove?.id && effectiveFileCache.current) {
      effectiveFileCache.current.delete(fileToRemove.id);
      
    }
    dispatch(removeActFile(index));
  };

  const handleRemovePresentationFile = (index) => {
    const fileToRemove = presentationFiles[index];
    if (fileToRemove?.id && effectiveFileCache.current) {
      effectiveFileCache.current.delete(fileToRemove.id);
     
    }
    dispatch(removePresentationFile(index));
  };

  const handleRemoveExplanationFile = (index) => {
    const fileToRemove = explanationFiles[index];
    if (fileToRemove?.id && effectiveFileCache.current) {
      effectiveFileCache.current.delete(fileToRemove.id);
      
    }
    dispatch(removeExplanationFile(index));
  };

  const handleRemoveOtherFile = (index) => {
    const fileToRemove = otherFiles[index];
    if (fileToRemove?.id && effectiveFileCache.current) {
      effectiveFileCache.current.delete(fileToRemove.id);
     
    }
    dispatch(removeOtherFile(index));
  };

  // Create simplified attachment sections
  const attachmentSections = [
    {
      title: "Act Document",
      files: actFiles,
      addFiles: handleActFileUpload,
      removeFile: handleRemoveActFile,
      required: isActRequired,
      templateType: "act",
    },
    {
      title: "Presentation",
      files: presentationFiles,
      addFiles: handlePresentationFileUpload,
      removeFile: handleRemovePresentationFile,
      required: isPresentationRequired,
      templateType: "presentation",
    },
    {
      title: "Explanation Document",
      files: explanationFiles,
      addFiles: handleExplanationFileUpload,
      removeFile: handleRemoveExplanationFile,
      required: isExplanationRequired,
      templateType: "explanation",
    },
    {
      title: "Other Files",
      files: otherFiles,
      addFiles: handleOtherFileUpload,
      removeFile: handleRemoveOtherFile,
      required: false,
      templateType: null,
    },
  ];

  return (
    <SectionContainer title="Attachments" infoText={infoText}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attachmentSections.map((section, idx) => (
          <AttachmentSection
            key={idx}
            title={section.title}
            files={section.files}
            onAddFiles={section.addFiles}
            onRemoveFile={section.removeFile}
            required={section.required}
            templateType={section.templateType}
            dispatch={dispatch}
            fileCache={effectiveFileCache}
          />
        ))}
      </div>
    </SectionContainer>
  );
};

export default AttachmentsSection;
