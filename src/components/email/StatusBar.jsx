// File: components/email/StatusBar.jsx
import React from "react";

const StatusBar = () => {
  return (
    <div className="bg-slate-100 border-t border-slate-200 p-1.5 text-xs text-slate-500 flex justify-between">
      <div>Connected to ER Request Email Management System</div>
      <div>Last updated: {new Date().toLocaleTimeString()}</div>
    </div>
  );
};

export default StatusBar;
