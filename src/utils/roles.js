// src/utils/roles.js

// local data
// export const ROLES = {
//   ADMIN: 3,
//   ER_ADMIN: 12,
//   ER_MEMBER: 13,
//   USER: 11,
// };

// Server data
export const ROLES = {
  ADMIN: 3,
  ER_ADMIN: 14,
  ER_MEMBER: 15,
  USER: 16,
};

// Role-based permissions
export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: {
    allowedRoutes: ["*"],
    defaultRedirect: "/",
  },
  [ROLES.ER_ADMIN]: {
    allowedRoutes: ["*"],
    defaultRedirect: "/",
  },
  [ROLES.ER_MEMBER]: {
    allowedRoutes: [
      "/",
      "/profile",
      "/request",
      "/create-request",
      "/request-matrix",
    ],
    defaultRedirect: "/",
  },
  [ROLES.USER]: {
    allowedRoutes: ["/profile", "/create-request", "/"],
    defaultRedirect: "/create-request",
  },
};

// Get user roles from localStorage as an array
export const getUserRoles = () => {
  const rolesString = localStorage.getItem("rols");
  if (!rolesString) return [];

  // Handle different formats: comma-separated string or JSON array
  try {
    if (rolesString.startsWith("[")) {
      // Handle JSON array format
      return JSON.parse(rolesString).map((role) => parseInt(role, 10));
    } else {
      // Handle comma-separated format
      return rolesString.split(",").map((role) => parseInt(role.trim(), 10));
    }
  } catch (error) {
    console.error("Error parsing user roles:", error);
    return [];
  }
};

// Get highest priority role (assuming lower role ID = higher priority)
export const getHighestPriorityRole = () => {
  const roles = getUserRoles();
  if (!roles.length) return null;

  // Sort roles by ID (assuming lower ID = higher priority)
  return Math.min(...roles);
};

// Helper to check if a user can access a specific route based on their roles
export const canAccessRoute = (path) => {
  const userRoles = getUserRoles();

  if (!userRoles.length) {
    return false;
  }

  // Check if any of the user's roles allows access to this path
  return userRoles.some((roleId) => {
    if (!ROLE_PERMISSIONS[roleId]) {
      return false;
    }

    const { allowedRoutes } = ROLE_PERMISSIONS[roleId];

    // Allow all routes if '*' is included
    if (allowedRoutes.includes("*")) {
      return true;
    }

    // Check for exact path matches first
    if (allowedRoutes.includes(path)) {
      return true;
    }

    if (
      path.match(/^\/request\/[\w-]+$/) &&
      allowedRoutes.includes("/request")
    ) {
      return true;
    }

    if (
      path.match(/^\/request\/[\w-]+\/action$/) &&
      allowedRoutes.includes("/request")
    ) {
      return true;
    }

    // No match found for this role
    return false;
  });
};

// Get user's default redirect path based on highest priority role
export const getDefaultRedirect = () => {
  const highestRoleId = getHighestPriorityRole();

  if (!highestRoleId || !ROLE_PERMISSIONS[highestRoleId]) {
    return "/login"; // Default fallback
  }

  return ROLE_PERMISSIONS[highestRoleId].defaultRedirect;
};

export const hasRole = (roleId) => {
  const userRoles = getUserRoles();
  return userRoles.includes(roleId);
};

export const hasAdminAccess = () => {
  return hasRole(ROLES.ADMIN) || hasRole(ROLES.ER_ADMIN);
};

export const hasAccess = () => {
  return (
    hasRole(ROLES.ADMIN) || hasRole(ROLES.ER_ADMIN) || hasRole(ROLES.ER_MEMBER)
  );
};

export const isErMember = () => {
  return hasRole(ROLES.ER_MEMBER);
};
