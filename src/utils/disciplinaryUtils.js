// src/utils/disciplinaryUtils.js

/**
 * Filter disciplinary data based on search term
 * @param {Array} data - Array of disciplinary data
 * @param {String} searchTerm - Search term to filter by
 * @returns {Array} - Filtered array
 */
export const filterDisciplinaryData = (data, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === "") {
    return data;
  }

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  return data.filter(
    (item) =>
      (item.Name && item.Name.toLowerCase().includes(lowerCaseSearchTerm)) ||
      (item.Id && item.Id.toString().includes(searchTerm))
  );
};

/**
 * Get result name by ID from results list
 * @param {Array} results - Array of disciplinary results
 * @param {Number} resultId - Result ID to find
 * @returns {String} - Result name or "Unknown"
 */
export const getResultNameById = (results, resultId) => {
  const result = results.find((r) => r.Id === resultId);
  return result ? result.Name : "Unknown";
};

/**
 * Validate disciplinary item data
 * @param {Object} item - Disciplinary item to validate
 * @returns {Object} - Validation result { isValid, message }
 */
export const validateDisciplinaryItem = (item) => {
  if (!item.Name || !item.Name.trim()) {
    return { isValid: false, message: "Name cannot be empty" };
  }

  return { isValid: true, message: "" };
};

/**
 * Create label and description for empty states based on type and search term
 * @param {String} type - Type of disciplinary item (action, result, violation)
 * @param {String} searchTerm - Current search term
 * @returns {Object} - { title, message, buttonText }
 */
export const getEmptyStateProps = (type, searchTerm) => {
  const typeLabels = {
    actions: {
      title: "No Disciplinary Actions Found",
      message: searchTerm
        ? `No actions match your search for "${searchTerm}"`
        : "Get started by creating your first disciplinary action",
      buttonText: searchTerm ? "Clear Search" : "Create Action",
    },
    results: {
      title: "No Action Results Found",
      message: searchTerm
        ? `No results match your search for "${searchTerm}"`
        : "Get started by creating your first action result",
      buttonText: searchTerm ? "Clear Search" : "Create Result",
    },
    violations: {
      title: "No Policy Violations Found",
      message: searchTerm
        ? `No violations match your search for "${searchTerm}"`
        : "Get started by creating your first policy violation",
      buttonText: searchTerm ? "Clear Search" : "Create Violation",
    },
  };

  return typeLabels[type] || typeLabels.actions;
};
