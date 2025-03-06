import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";

const Alert = ({
  variant,
  message,
  onDismiss,
  autoDismiss = true,
  duration = 3000,
}) => {
  const [visible, setVisible] = useState(true);

  // Handle auto-dismissal
  useEffect(() => {
    if (autoDismiss && visible && message) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onDismiss) onDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, duration, message, onDismiss, visible]);

  if (!message || !visible) return null;

  const variants = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: <AlertCircle size={18} className="text-red-500" />,
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      text: "text-green-700",
      icon: <CheckCircle size={18} className="text-green-500" />,
    },
  };

  const style = variants[variant];

  // Handle manual dismissal
  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  return (
    <div
      className={`mb-5 px-4 py-3 rounded-md ${style.bg} ${style.border} ${style.text} flex items-start gap-2`}
    >
      {style.icon}
      <div className="text-sm flex-1">{message}</div>
      {(onDismiss || autoDismiss) && (
        <button
          onClick={handleDismiss}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default Alert;
