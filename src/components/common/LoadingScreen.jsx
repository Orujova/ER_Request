import React from "react";
import { themeColors } from "../../styles/theme";
import { FileText } from "lucide-react";

// Loading component for all loading states
export const Loading = () => {
  return (
    <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center">
      <div
        className="p-8 flex flex-col items-center justify-center rounded-2xl"
        style={{
          backgroundColor: themeColors.background,
          boxShadow: themeColors.cardShadow,
        }}
      >
        <div className="w-16 h-16 mb-4 relative">
          <div
            className="w-16 h-16 rounded-full animate-pulse"
            style={{ backgroundColor: themeColors.secondaryDark }}
          ></div>
          <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
            <FileText
              className="w-8 h-8"
              style={{ color: themeColors.primary }}
            />
          </div>
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: themeColors.text }}
        >
          Loading ...
        </h2>
        <p className="mb-6" style={{ color: themeColors.textLight }}>
          Please wait while we fetch the request
        </p>
        <div className="flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full mx-1 animate-bounce"
            style={{
              backgroundColor: themeColors.primary,
              animationDelay: "0s",
            }}
          ></div>
          <div
            className="w-2 h-2 rounded-full mx-1 animate-bounce"
            style={{
              backgroundColor: themeColors.primary,
              animationDelay: "0.2s",
            }}
          ></div>
          <div
            className="w-2 h-2 rounded-full mx-1 animate-bounce"
            style={{
              backgroundColor: themeColors.primary,
              animationDelay: "0.4s",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
