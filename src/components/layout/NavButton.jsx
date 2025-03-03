// src/components/layout/NavButton.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@radix-ui/themes";
import { themeColors } from "../../styles/theme";

const NavButton = ({
  to,
  icon: Icon,
  variant = "soft",
  children,
  isActive = false,
}) => {
  const isHighlighted = variant === "primary";
  const isActiveStyle =
    isActive && !isHighlighted
      ? {
          backgroundColor: "rgba(8, 145, 178, 0.08)",
          fontWeight: 500,
        }
      : {};

  return (
    <Link to={to} className="no-underline">
      <Button
        variant={isHighlighted ? "solid" : "ghost"}
        size="2"
        className="transition-all duration-200 flex items-center gap-2 px-3.5 py-1.5"
        style={{
          backgroundColor: isHighlighted
            ? themeColors.primary
            : isActiveStyle.backgroundColor || "transparent",
          color: isHighlighted ? "#ffffff" : themeColors.text,
          fontWeight: isHighlighted ? 500 : isActiveStyle.fontWeight || 400,
          borderRadius: "8px",
          boxShadow: isHighlighted
            ? `0 2px 4px ${themeColors.shadowMedium}`
            : "none",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {isHighlighted && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.3) 40%, transparent 60%)`,
              backgroundSize: "200% 200%",
              animation: "shimmer 2s infinite",
            }}
          />
        )}
        <Icon size={17} className={isHighlighted ? "text-white" : ""} />
        <span>{children}</span>
      </Button>
    </Link>
  );
};

export default NavButton;
