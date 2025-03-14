// src/components/RequestForm/SectionContainer.js
import React from "react";

const SectionContainer = ({ title, children, infoText }) => {
  return (
    <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center relative pl-4 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 before:bg-sky-600 before:rounded">
        {title}
      </h3>

      {infoText && (
        <div className="mb-5 relative overflow-hidden">
          <div className="pl-6 py-4 pr-4 bg-gradient-to-r from-blue-50 via-blue-50 to-transparent rounded-lg border border-blue-100">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {infoText}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default SectionContainer;
