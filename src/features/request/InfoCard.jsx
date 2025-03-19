import React from "react";

const InfoCard = ({
  label,
  value,
  theme = "default",
  fullWidth = false,
  multiline = false,
  icon = null,
  animateHover = true,
}) => {
  // Theme styles based on the project's theme colors
  const getThemeStyles = () => {
    switch (theme) {
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-slate-800",
          labelColor: "text-amber-700",
          iconColor: "text-amber-600",
          // hoverBg: "hover:bg-amber-100",
          emptyText: "text-amber-300",
        };
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-slate-800",
          labelColor: "text-emerald-700",
          iconColor: "text-emerald-600",
          // hoverBg: "hover:bg-emerald-100",
          emptyText: "text-emerald-300",
        };
      case "danger":
        return {
          bg: "bg-rose-50",
          border: "border-rose-200",
          text: "text-slate-800",
          labelColor: "text-rose-700",
          iconColor: "text-rose-600",
          hoverBg: "hover:bg-rose-100",
          emptyText: "text-rose-300",
        };
      case "info":
        return {
          bg: "bg-sky-50",
          border: "border-sky-200",
          text: "text-slate-800",
          labelColor: "text-sky-700",
          iconColor: "text-sky-600",
          hoverBg: "hover:bg-sky-100",
          emptyText: "text-sky-300",
        };
      case "primary":
        return {
          bg: "bg-sky-50",
          border: "border-sky-200",
          text: "text-slate-800",
          labelColor: "text-sky-700",
          iconColor: "text-sky-600",
          hoverBg: "hover:bg-sky-100",
          emptyText: "text-sky-300",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-800",
          labelColor: "text-slate-600",
          iconColor: "text-slate-500",
          hoverBg: "hover:bg-slate-100",
          emptyText: "text-slate-300",
        };
    }
  };

  const themeStyles = getThemeStyles();
  const isEmpty = !value || value === "";

  return (
    <div
      className={`p-4 rounded-xl ${themeStyles.bg} border ${
        themeStyles.border
      } ${fullWidth ? "col-span-2" : ""} transition-all duration-200 ${
        animateHover ? `${themeStyles.hoverBg} hover:shadow-sm` : ""
      }`}
    >
      <div
        className={`text-sm font-medium mb-1.5 ${themeStyles.labelColor} flex items-center gap-2`}
      >
        {icon && <span className={themeStyles.iconColor}>{icon}</span>}
        {label}
      </div>
      <div
        className={`font-medium ${
          isEmpty ? themeStyles.emptyText + " italic" : themeStyles.text
        } ${multiline ? "whitespace-pre-wrap" : "truncate"}`}
      >
        {isEmpty ? "Not specified" : value}
      </div>
    </div>
  );
};

export default InfoCard;
