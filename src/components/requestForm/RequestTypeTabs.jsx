// src/components/RequestForm/RequestTypeTabs.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setActiveTab } from "../../redux/slices/formDataSlice";

const RequestTypeTabs = () => {
  const dispatch = useDispatch();
  // Add fallback to prevent error from undefined state
  const formData = useSelector((state) => state.formData) || {};
  const activeTab = formData.activeTab || "employee"; // Default to 'employee' if undefined

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-3 mb-8 bg-gray-50 rounded-xl">
      <button
        type="button"
        className={`py-4 px-6 rounded-xl text-base font-semibold transition-colors ${
          activeTab === "employee"
            ? "bg-white text-sky-600 shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-sky-600"
        }`}
        onClick={() => handleTabChange("employee")}
      >
        Əməkdaş üçün sorğu
      </button>
      <button
        type="button"
        className={`py-4 px-6 rounded-xl text-base font-semibold transition-colors ${
          activeTab === "general"
            ? "bg-white text-sky-600 shadow-sm"
            : "text-gray-500 hover:bg-white hover:text-sky-600"
        }`}
        onClick={() => handleTabChange("general")}
      >
        Ümumi sorğu
      </button>
    </div>
  );
};

export default RequestTypeTabs;
