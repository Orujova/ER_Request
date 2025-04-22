// // src/hooks/useFormValidation.js
// import { useSelector } from "react-redux";

// export const useFormValidation = () => {
//   const formData = useSelector((state) => state.formData) || {};
//   const requestForm = useSelector((state) => state.requestForm) || {};

//   const validateRequestInfo = () => {
//     return formData.requestType && formData.subCase;
//   };

//   const validateEmployeeInfo = () => {
//     if (formData.activeTab === "employee") {
//       return !!formData.selectedEmployee;
//     }
//     return true; // Not required for general tab
//   };

//   const validateMailBody = () => {
//     return !!formData.mailBody?.trim();
//   };

//   const validateAttachments = () => {
//     const hasHyperlinks = formData.hyperlinks?.some((link) => link?.trim());
//     const hasFiles =
//       formData.actFiles?.length > 0 ||
//       formData.presentationFiles?.length > 0 ||
//       formData.explanationFiles?.length > 0 ||
//       formData.otherFiles?.length > 0;

//     // Require either a hyperlink or at least one attachment
//     return hasHyperlinks || hasFiles;
//   };

//   // Check if required document types are present based on selected subcase
//   const validateRequiredDocuments = () => {
//     const subCases = requestForm.subCases || [];
//     const selectedSubCaseObj = subCases.find(
//       (sc) => sc.Description === formData.subCase
//     );

//     if (!selectedSubCaseObj) return true; // No specific requirements if no subcase is selected

//     if (selectedSubCaseObj.IsActRequired && formData.actFiles?.length === 0) {
//       return false;
//     }

//     if (
//       selectedSubCaseObj.IsPresentationRequired &&
//       formData.presentationFiles?.length === 0
//     ) {
//       return false;
//     }

//     if (
//       selectedSubCaseObj.IsExplanationRequired &&
//       formData.explanationFiles?.length === 0
//     ) {
//       return false;
//     }

//     return true;
//   };

//   const isFormValid = () => {
//     return (
//       validateRequestInfo() &&
//       validateEmployeeInfo() &&
//       validateMailBody() &&
//       validateAttachments() &&
//       validateRequiredDocuments()
//     );
//   };

//   return {
//     isFormValid,
//     validateRequestInfo,
//     validateEmployeeInfo,
//     validateMailBody,
//     validateAttachments,
//     validateRequiredDocuments,
//   };
// };

// src/hooks/useFormValidation.js
import { useSelector } from "react-redux";

export const useFormValidation = () => {
  const formData = useSelector((state) => state.formData) || {};
  const requestForm = useSelector((state) => state.requestForm) || {};

  /**
   * Validates the request type and subcase information
   * @returns {boolean} True if valid
   */
  const validateRequestInfo = () => {
    const requestType = formData.requestType?.trim();
    const subCase = formData.subCase?.trim();

    if (!requestType || !subCase) {
      console.log("Validation failed: Request type or subcase missing");
      return false;
    }
    return true;
  };

  /**
   * Validates employee information based on active tab
   * @returns {boolean} True if valid
   */
  const validateEmployeeInfo = () => {
    if (formData.activeTab === "employee") {
      if (!formData.selectedEmployee) {
        console.log("Validation failed: No employee selected");
        return false;
      }
    }
    // No specific validation for general tab
    return true;
  };

  /**
   * Validates mail body
   * @returns {boolean} True if valid
   */
  const validateMailBody = () => {
    if (!formData.mailBody?.trim()) {
      console.log("Validation failed: Mail body is empty");
      return false;
    }
    return true;
  };

  /**
   * Validates that either hyperlinks or files are provided
   * @returns {boolean} True if valid
   */
  const validateAttachments = () => {
    // Check if any hyperlinks are provided
    const hasHyperlinks = formData.hyperlinks?.some(
      (link) => link && link.trim().length > 0
    );

    // Check if any files are attached
    const hasFiles =
      (formData.actFiles && formData.actFiles.length > 0) ||
      (formData.presentationFiles && formData.presentationFiles.length > 0) ||
      (formData.explanationFiles && formData.explanationFiles.length > 0) ||
      (formData.otherFiles && formData.otherFiles.length > 0);

    // Require either hyperlinks or attachments
    if (!hasHyperlinks && !hasFiles) {
      console.log("Validation failed: No hyperlinks or attachments provided");
      return false;
    }

    return true;
  };

  /**
   * Validates that all required document types are present based on the selected subcase
   * @returns {boolean} True if valid
   */
  const validateRequiredDocuments = () => {
    // Get the selected subcase
    const subCase = formData.subCase?.trim();
    if (!subCase) return true; // Skip validation if no subcase is selected

    const subCases = requestForm.subCases || [];
    const selectedSubCaseObj = subCases.find(
      (sc) => sc.Description?.trim() === subCase
    );

    // Skip validation if subcase object is not found
    if (!selectedSubCaseObj) return true;

    // Check required document types
    if (
      selectedSubCaseObj.IsActRequired &&
      (!formData.actFiles || formData.actFiles.length === 0)
    ) {
      console.log("Validation failed: Act document is required");
      return false;
    }

    if (
      selectedSubCaseObj.IsPresentationRequired &&
      (!formData.presentationFiles || formData.presentationFiles.length === 0)
    ) {
      console.log("Validation failed: Presentation is required");
      return false;
    }

    if (
      selectedSubCaseObj.IsExplanationRequired &&
      (!formData.explanationFiles || formData.explanationFiles.length === 0)
    ) {
      console.log("Validation failed: Explanation document is required");
      return false;
    }

    return true;
  };

  /**
   * Main validation function that combines all validation checks
   * @returns {boolean} True if the entire form is valid
   */
  const isFormValid = () => {
    const requestInfoValid = validateRequestInfo();
    const employeeInfoValid = validateEmployeeInfo();
    const mailBodyValid = validateMailBody();
    const attachmentsValid = validateAttachments();
    const requiredDocumentsValid = validateRequiredDocuments();

    // Log validation result
    console.log("Form validation result:", {
      requestInfoValid,
      employeeInfoValid,
      mailBodyValid,
      attachmentsValid,
      requiredDocumentsValid,
    });

    return (
      requestInfoValid &&
      employeeInfoValid &&
      mailBodyValid &&
      attachmentsValid &&
      requiredDocumentsValid
    );
  };

  // Return all validation functions for use in components
  return {
    isFormValid,
    validateRequestInfo,
    validateEmployeeInfo,
    validateMailBody,
    validateAttachments,
    validateRequiredDocuments,
  };
};

export default useFormValidation;
