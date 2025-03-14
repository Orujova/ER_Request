// src/utils/dateFormatters.js

/**
 * Format a date string to a localized format
 * @param {string} dateString - The date string to format
 * @param {object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return "";

  const defaultOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const date = new Date(dateString);

  return date.toLocaleDateString("en-US", mergedOptions);
};

/**
 * Format a date string to include time
 * @param {string} dateString - The date string to format
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Get relative time (e.g., "2 days ago")
 * @param {string} dateString - The date string
 * @returns {string} Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 1) {
    return "just now";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  } else {
    return formatDate(dateString);
  }
};

/**
 * Format duration between two dates
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string (defaults to now if not provided)
 * @returns {string} Formatted duration string
 */
export const formatDuration = (startDate, endDate = null) => {
  if (!startDate) return "";

  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();

  const diffTime = Math.abs(end - start);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 1) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"}`;
    }
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"}`;
  } else if (diffDays < 30) {
    return `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
  } else if (diffDays < 365) {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"}`;
  } else {
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} ${diffYears === 1 ? "year" : "years"}`;
  }
};
