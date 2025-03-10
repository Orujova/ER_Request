import React from "react";
import { themeColors } from "../../styles/theme";

// LoadingScreen component for initial loading
export const LoadingScreen = () => {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: themeColors.secondary }}
    >
      <div
        className="p-6 rounded-lg max-w-md w-full text-center"
        style={{
          backgroundColor: themeColors.background,
          boxShadow: themeColors.cardShadow,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: `${themeColors.primary}20`,
              animationDuration: "1.5s",
            }}
          ></div>
          <svg
            className="relative animate-spin h-20 w-20"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            style={{ color: themeColors.primary }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h2
          className="text-xl font-semibold mb-2"
          style={{ color: themeColors.text }}
        >
          Loading Case Management System
        </h2>
        <p style={{ color: themeColors.textLight }}>
          Please wait while we load your data...
        </p>
      </div>
    </div>
  );
};

// LoadingOverlay component for operation loading
export const LoadingOverlay = () => {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: `${themeColors.text}10` }}
    >
      <div
        className="p-2 rounded-lg flex items-center"
        style={{
          backgroundColor: themeColors.background,
          boxShadow: themeColors.cardShadow,
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <svg
          className="animate-spin h-6 w-6 mr-3"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          style={{ color: themeColors.primary }}
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span style={{ color: themeColors.text }} className="font-medium">
          Processing...
        </span>
      </div>
    </div>
  );
};

export default { LoadingScreen, LoadingOverlay };

// import React from "react";
// import { themeColors } from "../../styles/theme";

// // LoadingScreen component for initial loading
// export const Loading = () => {
//   return (
//     <div className="min-h-[calc(100vh-16rem)] flex flex-col items-center justify-center">
//       <div
//         className="p-8 flex flex-col items-center justify-center rounded-2xl"
//         style={{
//           backgroundColor: themeColors.background,
//           boxShadow: themeColors.cardShadow,
//         }}
//       >
//         <div className="w-16 h-16 mb-4 relative">
//           <div
//             className="w-16 h-16 rounded-full animate-pulse"
//             style={{ backgroundColor: themeColors.secondaryDark }}
//           ></div>
//           <div className="w-full h-full absolute top-0 left-0 flex items-center justify-center">
//             <FileText
//               className="w-8 h-8"
//               style={{ color: themeColors.primary }}
//             />
//           </div>
//         </div>
//         <h2
//           className="text-xl font-semibold mb-2"
//           style={{ color: themeColors.text }}
//         >
//           Loading Request
//         </h2>
//         <p className="mb-6" style={{ color: themeColors.textLight }}>
//           Please wait while we fetch the request details
//         </p>
//         <div className="flex items-center justify-center">
//           <div
//             className="w-2 h-2 rounded-full mx-1 animate-bounce"
//             style={{
//               backgroundColor: themeColors.primary,
//               animationDelay: "0s",
//             }}
//           ></div>
//           <div
//             className="w-2 h-2 rounded-full mx-1 animate-bounce"
//             style={{
//               backgroundColor: themeColors.primary,
//               animationDelay: "0.2s",
//             }}
//           ></div>
//           <div
//             className="w-2 h-2 rounded-full mx-1 animate-bounce"
//             style={{
//               backgroundColor: themeColors.primary,
//               animationDelay: "0.4s",
//             }}
//           ></div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default { Loading };
