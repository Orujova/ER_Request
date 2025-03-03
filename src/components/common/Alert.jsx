import { AlertCircle, CheckCircle } from "lucide-react";

const Alert = ({ variant, message, onDismiss }) => {
  if (!message) return null;

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

  return (
    <div
      className={`mb-5 px-4 py-3 rounded-md ${style.bg} ${style.border} ${style.text} flex items-start gap-2`}
    >
      {style.icon}
      <div className="text-sm flex-1">{message}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
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
