// src/components/RequestForm/TemplatePanel.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { closeTemplatePanel } from "../../redux/slices/uiSlice";
import { X, Download, FileText } from "lucide-react";

// Templates in the public directory
const templates = {
  act: {
    id: 1,
    name: "Act Template",
    file: "AKT-davamiyyət.doc",
    path: "/templates/AKT-davamiyyət.doc", // Files should be in public/templates folder
  },
  presentation: {
    id: 1,
    name: "Presentation Template",
    file: "Təqdimat nümunə.docx",
    path: "/templates/Təqdimat nümunə.docx",
  },
  explanation: {
    id: 1,
    name: "Explanation Template",
    file: "İzahat Blankı.docx",
    path: "/templates/İzahat Blankı.docx",
  },
};

const TemplatePanel = () => {
  const dispatch = useDispatch();
  const { activeTemplateType } = useSelector((state) => state.ui);
  const { requestType, subCase } = useSelector((state) => state.formData);
  const { subCases } = useSelector((state) => state.requestForm);

  // Get the selected subCase object with whitespace handling
  const selectedSubCaseObj = subCases.find(
    (sc) => sc.Description?.trim() === subCase?.trim()
  );

  const handleClose = () => {
    dispatch(closeTemplatePanel());
  };

  const handleDownload = (template) => {
    try {
      // Create the full URL using the current origin
      const fullUrl = window.location.origin + template.path;

      // Open the file in a new tab
      window.open(fullUrl, "_blank");
    } catch (error) {
      console.error("Error downloading template:", error);
      alert(`Failed to download template. Error: ${error.message}`);
    }
  };

  // Determine the title and instructions based on template type
  let title = "Template";
  let requiredText = "";

  if (activeTemplateType === "act") {
    title = "Act Template";
    if (selectedSubCaseObj?.IsActRequired) {
      requiredText = "Act document is required for this request type.";
    }
  } else if (activeTemplateType === "presentation") {
    title = "Presentation Template";
    if (selectedSubCaseObj?.IsPresentationRequired) {
      requiredText = "Presentation is required for this request type.";
    }
  } else if (activeTemplateType === "explanation") {
    title = "Explanation Template";
    if (selectedSubCaseObj?.IsExplanationRequired) {
      requiredText = "Explanation document is required for this request type.";
    }
  }

  const currentTemplate = templates[activeTemplateType];
  if (!currentTemplate) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {requiredText && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
            <p className="text-sm">{requiredText}</p>
          </div>
        )}

        <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex flex-col items-center">
            <FileText size={48} className="text-sky-600 mb-3" />
            <h4 className="text-lg font-medium text-gray-800">
              {currentTemplate.name}
            </h4>
            <p className="text-sm text-gray-500 mt-1">{currentTemplate.file}</p>

            <button
              type="button"
              onClick={() => handleDownload(currentTemplate)}
              className="mt-4 flex items-center px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
            >
              <Download size={18} className="mr-2" />
              Download Template
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-sm text-blue-700">
            Please download and fill out this template. Once completed, upload
            it to the appropriate section.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TemplatePanel;
