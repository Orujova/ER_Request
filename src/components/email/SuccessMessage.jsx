// File: components/email/SuccessMessage.jsx
import React from "react";
import { Check } from "lucide-react";

const SuccessMessage = ({ onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white p-8 rounded-lg shadow-md">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-lg font-medium text-slate-800 mb-2">
        Email Sent Successfully
      </h2>
      <p className="text-slate-600 text-center mb-6">
        Your email has been sent successfully!
      </p>
      <button
        onClick={onClose}
        className="px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors"
      >
        Close
      </button>
    </div>
  );
};

export default SuccessMessage;
