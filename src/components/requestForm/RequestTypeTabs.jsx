// src/components/requestForm/RequestTypeTabs.js
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../redux/slices/formDataSlice";
import { showToast } from "../../toast/toast";
import TabSwitchConfirmationModal from "./TabSwitchConfirmationModal";

const RequestTypeTabs = () => {
  const dispatch = useDispatch();

  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetTab, setTargetTab] = useState(null);

  // Add fallback to prevent error from undefined state
  const formData = useSelector((state) => state.formData) || {};
  const activeTab = formData.activeTab || "employee"; // Default to 'employee' if undefined

  const handleTabChange = (tab) => {
    // Only do something if we're actually changing tabs
    if (tab !== activeTab) {
      // Open the confirmation modal and store the target tab
      setTargetTab(tab);
      setIsModalOpen(true);
    }
  };

  const handleConfirmTabSwitch = (tab) => {
    dispatch(setActiveTab(tab));
    showToast(
      `Switched to ${tab === "employee" ? "Employee" : "General"} Request form`,
      "info"
    );
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4 p-3 mb-8 bg-gray-50 rounded-xl">
        <button
          type="button"
          className={`py-4 px-6 rounded-xl text-base font-semibold transition-colors ${
            activeTab === "employee"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-gray-500 hover:bg-white hover:text-sky-600"
          }`}
          onClick={() => handleTabChange("employee")}
          title="Submit a request related to a specific employee"
        >
          Employee Request
        </button>
        <button
          type="button"
          className={`py-4 px-6 rounded-xl text-base font-semibold transition-colors ${
            activeTab === "general"
              ? "bg-white text-sky-600 shadow-sm"
              : "text-gray-500 hover:bg-white hover:text-sky-600"
          }`}
          onClick={() => handleTabChange("general")}
          title="Submit a general request not related to a specific employee"
        >
          General Request
        </button>
      </div>

      {/* Tab Switch Confirmation Modal */}
      <TabSwitchConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmTabSwitch}
        targetTab={targetTab}
        title="Change Tab?"
        message="Switching tabs will reset the form data. Do you want to continue?"
      />
    </>
  );
};

export default RequestTypeTabs;
