// src/hooks/useFormValidation.js
import { useSelector } from "react-redux";

export const useFormValidation = () => {
  const formData = useSelector((state) => state.formData) || {};
  const requestForm = useSelector((state) => state.requestForm) || {};

  const validateRequestInfo = () => {
    return formData.requestType && formData.subCase;
  };

  const validateEmployeeInfo = () => {
    if (formData.activeTab === "employee") {
      return !!formData.selectedEmployee;
    }
    return true; // Not required for general tab
  };

  const validateMailBody = () => {
    return !!formData.mailBody?.trim();
  };

  const validateAttachments = () => {
    const hasHyperlinks = formData.hyperlinks?.some((link) => link?.trim());
    const hasFiles =
      formData.actFiles?.length > 0 ||
      formData.presentationFiles?.length > 0 ||
      formData.explanationFiles?.length > 0 ||
      formData.otherFiles?.length > 0;

    // Require either a hyperlink or at least one attachment
    return hasHyperlinks || hasFiles;
  };

  // Check if required document types are present based on selected subcase
  const validateRequiredDocuments = () => {
    const subCases = requestForm.subCases || [];
    const selectedSubCaseObj = subCases.find(
      (sc) => sc.Description === formData.subCase
    );

    if (!selectedSubCaseObj) return true; // No specific requirements if no subcase is selected

    if (selectedSubCaseObj.IsActRequired && formData.actFiles?.length === 0) {
      return false;
    }

    if (
      selectedSubCaseObj.IsPresentationRequired &&
      formData.presentationFiles?.length === 0
    ) {
      return false;
    }

    if (
      selectedSubCaseObj.IsExplanationRequired &&
      formData.explanationFiles?.length === 0
    ) {
      return false;
    }

    return true;
  };

  const isFormValid = () => {
    return (
      validateRequestInfo() &&
      validateEmployeeInfo() &&
      validateMailBody() &&
      validateAttachments() &&
      validateRequiredDocuments()
    );
  };

  return {
    isFormValid,
    validateRequestInfo,
    validateEmployeeInfo,
    validateMailBody,
    validateAttachments,
    validateRequiredDocuments,
  };
};
