// src/components/requestMatrix/DisciplinaryResultTable.jsx
import React from "react";
import { Edit3, Trash2, Tag } from "lucide-react";
import { themeColors } from "../../styles/theme";
import EmptyState from "./EmptyState";
import { getEmptyStateProps } from "../../utils/disciplinaryUtils";

const DisciplinaryResultTable = ({
  results,
  searchTerm,
  hasPermission,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  if (results.length === 0) {
    const emptyStateProps = getEmptyStateProps("results", searchTerm);

    return (
      <EmptyState
        icon={() => (
          <Tag size={64} strokeWidth={1.5} className="text-gray-400" />
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
          {results.map((result) => (
            <tr
              key={result.Id}
              className="hover:bg-gray-50 transition-colors duration-150"
              style={{ backgroundColor: themeColors.background }}
            >
              <td
                className="px-6 py-4 whitespace-nowrap text-sm"
                style={{ color: themeColors.textLight }}
              >
                {result.Id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="text-sm font-medium"
                  style={{ color: themeColors.text }}
                >
                  {result.Name}
                </div>
              </td>
              {hasPermission && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(result)}
                    style={{ color: themeColors.primary }}
                  >
                    <Edit3 size={16} className="inline mr-1" />
                  </button>
                  <button onClick={() => onDelete(result, "result")}>
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

export default DisciplinaryResultTable;
