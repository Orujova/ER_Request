// src/containers/RequestForm/index.js
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDependencies,
  submitRequest,
  resetSubmitStatus,
} from "../redux/slices/requestFormSlice";
import { resetForm } from "../redux/slices/formDataSlice";

import { useFormValidation } from "../hooks/useFormValidation";
import RequestTypeTabs from "../components/requestForm/RequestTypeTabs";
import RequestInfoSection from "../components/requestForm/RequestInfoSection";
import EmployeeInfoSection from "../components/requestForm/EmployeeInfoSection";
import MailSection from "../components/requestForm/MailSection";
import HyperlinkSection from "../components/requestForm/HyperlinkSection";
import AttachmentsSection from "../components/requestForm/AttachmentsSection";
import SubmitButton from "../components/requestForm/SubmitButton";
import TemplatePanel from "../components/requestForm/TemplatePanel";
import Loading from "../components/common/LoadingScreen";
import { showToast } from "../toast/toast";

const RequestForm = () => {
  const dispatch = useDispatch();
  const { isFormValid } = useFormValidation();

  const fileCache = useRef(new Map());

  // Adding null checks with default values to prevent destructuring errors
  const requestFormState = useSelector((state) => state.requestForm) || {};
  const formDataState = useSelector((state) => state.formData) || {};
  const uiState = useSelector((state) => state.ui) || {};

  const loading = requestFormState.loading || false;
  const error = requestFormState.error || null;
  const submitLoading = requestFormState.submitLoading || false;
  const isTemplatePanelOpen = uiState.isTemplatePanelOpen || false;

  // Track uploaded files to handle non-serializable File objects
  useEffect(() => {
    const trackFiles = (files, type) => {
      if (files && files.length) {
        files.forEach((file) => {
          if (!fileCache.current.has(file.id)) {
            console.log(
              `Tracking file in useEffect: ${file.id}, type: ${type}`
            );
            fileCache.current.set(file.id, {
              file: file.file,
              type,
            });
          }
        });
      }
    };

    // Log current state for debugging
    console.log("Current files state in RequestForm:", {
      actFiles: formDataState.actFiles?.length || 0,
      presentationFiles: formDataState.presentationFiles?.length || 0,
      explanationFiles: formDataState.explanationFiles?.length || 0,
      otherFiles: formDataState.otherFiles?.length || 0,
    });

    // Track files from all categories
    trackFiles(formDataState.actFiles, "act");
    trackFiles(formDataState.presentationFiles, "presentation");
    trackFiles(formDataState.explanationFiles, "explanation");
    trackFiles(formDataState.otherFiles, "other");
  }, [
    formDataState.actFiles,
    formDataState.presentationFiles,
    formDataState.explanationFiles,
    formDataState.otherFiles,
  ]);

  // Show error toast if there's an error loading the form
  useEffect(() => {
    if (error) {
      showToast(error, "error");
    }
  }, [error]);

  // Fetch dependencies on mount
  useEffect(() => {
    dispatch(fetchDependencies());
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isFormValid()) {
      // Prepare file data for submission, retrieving actual File objects from cache
      const actFileMetadata = formDataState.actFiles || [];
      const presentationFileMetadata = formDataState.presentationFiles || [];
      const explanationFileMetadata = formDataState.explanationFiles || [];
      const otherFileMetadata = formDataState.otherFiles || [];

      console.log("Files for submission:", {
        act: actFileMetadata.length,
        presentation: presentationFileMetadata.length,
        explanation: explanationFileMetadata.length,
        other: otherFileMetadata.length,
      });
      console.log("Files in cache:", fileCache.current.size);

      // Prepare files with their proper type classification
      const fileData = [];

      // Add act files
      actFileMetadata.forEach((metadata) => {
        const cachedData = fileCache.current.get(metadata.id);
        if (cachedData?.file) {
          fileData.push({
            file: cachedData.file,
            type: "act",
            metadata,
          });
        } else {
          console.warn(`Act file not found in cache: ${metadata.id}`);
        }
      });

      // Add presentation files
      presentationFileMetadata.forEach((metadata) => {
        const cachedData = fileCache.current.get(metadata.id);
        if (cachedData?.file) {
          fileData.push({
            file: cachedData.file,
            type: "presentation",
            metadata,
          });
        } else {
          console.warn(`Presentation file not found in cache: ${metadata.id}`);
        }
      });

      // Add explanation files
      explanationFileMetadata.forEach((metadata) => {
        const cachedData = fileCache.current.get(metadata.id);
        if (cachedData?.file) {
          fileData.push({
            file: cachedData.file,
            type: "explanation",
            metadata,
          });
        } else {
          console.warn(`Explanation file not found in cache: ${metadata.id}`);
        }
      });

      // Add other files
      otherFileMetadata.forEach((metadata) => {
        const cachedData = fileCache.current.get(metadata.id);
        if (cachedData?.file) {
          fileData.push({
            file: cachedData.file,
            type: "other",
            metadata,
          });
        } else {
          console.warn(`Other file not found in cache: ${metadata.id}`);
        }
      });

      // Store files in global window object for submission
      window.submissionFiles = fileData;
      console.log("Prepared files for submission:", fileData.length);

      dispatch(submitRequest())
        .unwrap()
        .then(() => {
          showToast("Request submitted successfully", "success");
          // Clear the file cache after successful submission
          fileCache.current.clear();
          window.submissionFiles = null;
        })
        .catch((error) => {
          showToast(error || "Failed to submit request", "error");
          window.submissionFiles = null;
        });
    } else {
      showToast("Please fill in all required fields", "error");
    }
  };

  // Handle reset form
  const handleReset = () => {
    dispatch(resetForm());
    dispatch(resetSubmitStatus());
    fileCache.current.clear();
    showToast("Form has been reset", "info");
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-6xl mx-auto my-8 p-10 bg-white rounded-3xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center relative after:content-[''] after:absolute after:bottom-[-0.5rem] after:left-1/2 after:transform after:-translate-x-1/2 after:w-16 after:h-1 after:bg-sky-600 after:rounded">
        Create New Request
      </h2>

      <form onSubmit={handleSubmit}>
        <RequestTypeTabs />

        <RequestInfoSection />

        <EmployeeInfoSection />

        <MailSection />

        <HyperlinkSection />

        {/* Pass fileCache prop explicitly */}
        <AttachmentsSection fileCache={fileCache} />

        <SubmitButton
          isLoading={submitLoading}
          isValid={isFormValid()}
          onReset={handleReset}
        />
      </form>

      {isTemplatePanelOpen && <TemplatePanel />}
    </div>
  );
};

export default RequestForm;
