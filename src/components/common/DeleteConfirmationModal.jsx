import React, { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";
import { themeColors } from "../../styles/theme";

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  itemToDelete = null,
  itemType = "item",
}) => {
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (itemToDelete && itemToDelete.Id) {
      onConfirm(itemToDelete.Id);
    } else {
      onConfirm();
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <div
        ref={modalRef}
        className="relative max-w-md w-full mx-4 rounded-lg overflow-hidden"
        style={{
          backgroundColor: themeColors.background,
          boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${themeColors.border}`,
        }}
      >
        {/* Header */}
        <div
          className="p-4 flex items-center justify-between"
          style={{
            borderBottom: `1px solid ${themeColors.border}`,
            backgroundColor: `${themeColors.secondaryLight}50`,
          }}
        >
          <h3
            className="text-lg font-medium flex items-center"
            style={{ color: themeColors.text }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start">
            <div
              className="p-3 rounded-full mr-4"
              style={{
                backgroundColor: "#FEF2F2", // light red
                color: "#DC2626", // red-600
              }}
            >
              <AlertTriangle size={24} strokeWidth={2} />
            </div>
            <div>
              <p style={{ color: themeColors.text }}>{message}</p>
              {itemToDelete && itemToDelete.Description && (
                <div
                  className="mt-3 p-3 rounded-md"
                  style={{
                    backgroundColor: `${themeColors.secondaryLight}50`,
                    color: themeColors.textLight,
                    border: `1px solid ${themeColors.border}`,
                  }}
                >
                  <p className="text-sm font-medium mb-1">
                    {itemType} details:
                  </p>
                  <p className="text-sm">
                    {itemToDelete.Description ||
                      itemToDelete.name ||
                      `${itemType} #${itemToDelete.Id}`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-4 flex justify-end space-x-3"
          style={{
            borderTop: `1px solid ${themeColors.border}`,
            backgroundColor: `${themeColors.secondaryLight}30`,
          }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: themeColors.background,
              color: themeColors.text,
              border: `1px solid ${themeColors.border}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 rounded-md"
            style={{
              backgroundColor: "#DC2626", // red-600
              color: "white",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
