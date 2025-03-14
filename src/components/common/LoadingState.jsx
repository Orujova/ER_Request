import React from "react";

const LoadingState = () => {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D9BBF] mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading data...</p>
      </div>
    </div>
  );
};

export default LoadingState;
