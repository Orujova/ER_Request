// src/utils/permissionChecks.js
import { hasAdminAccess } from "./roles";

// Check if user has permission to create/edit/delete
export const canManageContent = () => {
  return hasAdminAccess(); // Only admin (3) and ER admin (12) can manage content
};

// Check if actions should be disabled based on permissions
export const shouldDisableActions = () => {
  return !canManageContent();
};

// Get button style based on permission
export const getButtonStyle = (baseStyle, isDisabled = false) => {
  if (isDisabled || shouldDisableActions()) {
    return {
      ...baseStyle,
      opacity: 0.5,
      cursor: "not-allowed",
      pointerEvents: "none",
    };
  }
  return baseStyle;
};

// Wrap handler to only execute if user has permission
export const withPermissionCheck = (handler) => {
  return (...args) => {
    if (canManageContent()) {
      return handler(...args);
    }
    // Optional: Display a message that user doesn't have permission
    console.warn("You do not have permission to perform this action");
    return null;
  };
};
