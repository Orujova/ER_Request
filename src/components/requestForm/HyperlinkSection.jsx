// src/components/RequestForm/HyperlinkSection.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addHyperlink,
  updateHyperlink,
  removeHyperlink,
} from "../../redux/slices/formDataSlice";
import SectionContainer from "./SectionContainer";
import { Plus, X } from "lucide-react";

const HyperlinkSection = () => {
  const dispatch = useDispatch();

  // Get form data with fallbacks to prevent errors
  const formData = useSelector((state) => state.formData || {});

  // Ensure hyperlinks is always an array
  const hyperlinks =
    Array.isArray(formData.hyperlinks) && formData.hyperlinks.length > 0
      ? formData.hyperlinks
      : [""];

  // Debug the current state
  console.log("Hyperlinks in current state:", hyperlinks);

  const handleAddHyperlink = () => {
    dispatch(addHyperlink());
  };

  const handleUpdateHyperlink = (index, value) => {
    console.log(`Updating hyperlink at index ${index} to: ${value}`);
    dispatch(updateHyperlink({ index, value }));
  };

  const handleRemoveHyperlink = (index) => {
    if (hyperlinks.length > 1) {
      // Keep at least one hyperlink field
      dispatch(removeHyperlink(index));
    } else {
      // If only one link is left, just clear it
      dispatch(updateHyperlink({ index: 0, value: "" }));
    }
  };

  const infoText =
    "İntizam pozuntusu ilə əlaqəli video materialların linkini bu bölmədə yerləşdirə bilərsiniz.";

  return (
    <SectionContainer title="Hyperlink" infoText={infoText}>
      {hyperlinks.map((link, index) => (
        <div key={index} className="mb-4 flex space-x-2">
          <div className="flex-grow">
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-colors"
              placeholder="Enter URL"
              value={link || ""}
              onChange={(e) => handleUpdateHyperlink(index, e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveHyperlink(index)}
            className="p-3 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddHyperlink}
        className="mt-2 px-4 py-2 flex items-center text-sky-600 hover:text-sky-800 font-medium rounded-md hover:bg-sky-50 transition-colors"
      >
        <Plus size={20} className="mr-1" />
        Add More Links
      </button>
    </SectionContainer>
  );
};

export default HyperlinkSection;
