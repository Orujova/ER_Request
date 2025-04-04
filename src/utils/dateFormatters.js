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

// dateUtils.js - Add this as a separate utility file

/**
 * Format a timestamp in WhatsApp style (Today, Yesterday, or Date)
 * @param {string} timestamp - The timestamp to format
 * @returns {string} Formatted date label
 */
export const formatMessageDate = (timestamp) => {
  // Parse the date from the timestamp
  const messageDate = new Date(timestamp);

  // Handle invalid dates
  if (isNaN(messageDate.getTime())) {
    return "";
  }

  // Current date for comparison
  const today = new Date();

  // Set to start of day for date comparison
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  // Set message date to start of day for comparison
  const messageStart = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  // Format options
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
  const dateOptions = { day: "numeric", month: "short", year: "numeric" };

  // Get time string
  const timeString = messageDate.toLocaleTimeString([], timeOptions);

  // Compare dates and return appropriate format
  if (messageStart.getTime() === todayStart.getTime()) {
    return `Today, ${timeString}`;
  } else if (messageStart.getTime() === yesterdayStart.getTime()) {
    return `Yesterday, ${timeString}`;
  } else {
    // For older messages, show the full date
    const dateString = messageDate.toLocaleDateString([], dateOptions);
    return `${dateString}, ${timeString}`;
  }
};

/**
 * Extract time from a full datetime string
 * @param {string} formattedDateTime - The datetime string (e.g., "2025-04-02 12:27:44")
 * @returns {string} Time portion (HH:MM)
 */
export const extractTimeFromFormattedDate = (formattedDateTime) => {
  if (!formattedDateTime) return "";

  // Try to extract the time portion from a formatted date
  const parts = formattedDateTime.split(" ");
  if (parts.length >= 2) {
    // Get the time part and return just hours and minutes
    const timePart = parts[1].substring(0, 5);
    return timePart;
  }

  return "";
};
