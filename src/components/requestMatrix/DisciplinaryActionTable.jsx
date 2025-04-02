// src/components/requestMatrix/DisciplinaryActionTable.jsx
import React from "react";
import { Edit3, Trash2, BookOpen } from "lucide-react";
import { themeColors } from "../../styles/theme";
import EmptyState from "./EmptyState";
import {
  getResultNameById,
  getEmptyStateProps,
} from "../../utils/disciplinaryUtils";

const DisciplinaryActionTable = ({
  actions,
  results,
  searchTerm,
  hasPermission,
  onEdit,
  onDelete,
  onCreateNew,
}) => {
  if (actions.length === 0) {
    const emptyStateProps = getEmptyStateProps("actions", searchTerm);

    return (
      <EmptyState
        icon={() => (
          <BookOpen size={64} strokeWidth={1.5} className="text-gray-400" />
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
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
              style={{ color: themeColors.textLight }}
            >
              Result
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
          {actions.map((action) => (
            <tr
              key={action.Id}
              className="hover:bg-gray-50 transition-colors duration-150"
              style={{ backgroundColor: themeColors.background }}
            >
              <td
                className="px-6 py-4 whitespace-nowrap text-sm"
                style={{ color: themeColors.textLight }}
              >
                {action.Id}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className="text-sm font-medium"
                  style={{ color: themeColors.text }}
                >
                  {action.Name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full"
                  style={{
                    backgroundColor: "#e6f4f7",
                    color: "#0891b2",
                  }}
                >
                  {getResultNameById(
                    results,
                    action.DisciplinaryActionResultId
                  )}
                </span>
              </td>
              {hasPermission && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(action)}
                    style={{ color: themeColors.primary }}
                  >
                    <Edit3 size={16} className="inline mr-1" />
                  </button>
                  <button onClick={() => onDelete(action, "action")}>
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

export default DisciplinaryActionTable;
