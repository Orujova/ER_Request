// src/components/requestMatrix/DisciplinaryViolationTable.jsx
import React from "react";
import { Edit3, Trash2, AlertTriangle } from "lucide-react";
import { themeColors } from "../../styles/theme";
import EmptyState from "./EmptyState";
import { getEmptyStateProps } from "../../utils/disciplinaryUtils";

const DisciplinaryViolationTable = ({
  violations,
  searchTerm,
  hasPermission,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  if (violations.length === 0) {
    const emptyStateProps = getEmptyStateProps("violations", searchTerm);

    return (
      <EmptyState
        icon={() => (
          <AlertTriangle
            size={64}
            strokeWidth={1.5}
            className="text-gray-400"
          />
        )}
        title={emptyStateProps.title}
        message={emptyStateProps.message}
        buttonText={emptyStateProps.buttonText}
        buttonAction={searchTerm ? () => onCreateNew("") : onCreateNew}
        searchTerm={searchTerm}
        hideButton={!searchTerm && !hasPermission}
      />
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg shadow-sm"
      style={{ border: `1px solid ${themeColors.border}` }}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead style={{ backgroundColor: `${themeColors.secondaryLight}` }}>
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: themeColors.textLight }}
            >
              ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: themeColors.textLight }}
            >
              Name
            </th>
            {hasPermission && (
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                style={{ color: themeColors.textLight }}
              >
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {violations.map((violation) => (
            <tr
              key={violation.Id}
              className="hover:bg-gray-50 transition-colors duration-150"
              style={{ backgroundColor: themeColors.background }}
            >
              <td
                className="px-6 py-4 whitespace-nowrap text-sm"
                style={{ color: themeColors.textLight }}
              >
                {violation.Id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="text-sm font-medium"
                  style={{ color: themeColors.text }}
                >
                  {violation.Name}
                </div>
              </td>
              {hasPermission && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(violation)}
                    style={{ color: themeColors.primary }}
                  >
                    <Edit3 size={16} className="inline mr-1" />
                  </button>
                  <button onClick={() => onDelete(violation, "violation")}>
                    <Trash2
                      size={16}
                      className="inline ml-1 text-red-600 hover:bg-red-50"
                    />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DisciplinaryViolationTable;
