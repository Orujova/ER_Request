// src/components/layout/NavHeader.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Flex,
  Button,
  Box,
  Text,
  IconButton,
  DropdownMenu,
  Avatar,
  Separator,
} from "@radix-ui/themes";

import {
  HomeIcon,
  Settings2,
  LayoutGrid,
  PlusCircle,
  BellIcon,
  Menu,
  UserCircle,
  LogOut,
} from "lucide-react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { SignInButton } from "../common/SignInButton";
import { loginRequest } from "../../../authConfig";
import { callMsGraph } from "../../utils/authService";

// Theme colors
const themeColors = {
  primary: "#0284c7",
  primaryGradientStart: "#0ea5e9",
  primaryGradientEnd: "#0369a1",
  primaryHover: "#0369a1",
  secondary: "#f9fafb",
  secondaryHover: "#f3f4f6",
  border: "#e5e7eb",
  borderHover: "#d1d5db",
  text: "#111827",
  textLight: "#6b7280",
  background: "#ffffff",
  error: "#ef4444",
  success: "#10b981",
  shadowLight: "rgba(0, 0, 0, 0.05)",
  shadowMedium: "rgba(0, 0, 0, 0.08)",
};

// Nav button component
const NavButton = ({ to, icon: Icon, variant = "soft", children }) => {
  const isHighlighted = variant === "primary";

  return (
    <Link to={to} className="no-underline">
      <Button
        variant={isHighlighted ? "solid" : "ghost"}
        size="2"
        className="transition-all duration-150 flex items-center gap-1.5 px-3"
        style={{
          backgroundColor: isHighlighted ? themeColors.primary : "transparent",
          color: isHighlighted ? "#ffffff" : themeColors.text,
          fontWeight: isHighlighted ? 500 : 400,
          borderRadius: "6px",
          boxShadow: isHighlighted
            ? `0 1px 2px ${themeColors.shadowLight}`
            : "none",
        }}
      >
        <Icon size={16} />
        {children}
      </Button>
    </Link>
  );
};

function NavHeader() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts, inProgress } = useMsal();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const activeAccount = instance.getActiveAccount();

  // Use the active account if available, otherwise fallback to the first account
  const currentAccount = activeAccount || accounts[0];
  const username = currentAccount?.username || currentAccount?.name || "";

  // Debug logging
  useEffect(() => {
    console.log("Auth status:", {
      isAuthenticated,
      inProgress,
      activeAccount,
      accountsCount: accounts.length,
    });

    if (accounts.length > 0) {
      console.log("Available accounts:", accounts);
    }
  }, [isAuthenticated, inProgress, accounts, activeAccount]);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !currentAccount || inProgress !== "none") {
        return;
      }

      try {
        console.log("Attempting to acquire token for account:", currentAccount);

        // Check if MSAL is initialized
        if (!instance.getActiveAccount() && accounts.length > 0) {
          console.log("No active account set, setting first available account");
          instance.setActiveAccount(accounts[0]);
        }

        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: currentAccount,
        });

        console.log("Token acquired successfully", response);

        try {
          const graphData = await callMsGraph(response.accessToken);
          console.log("Graph data retrieved:", graphData);
          setUserData(graphData);
        } catch (graphError) {
          console.error("Error fetching MS Graph data:", graphError);
        }
      } catch (error) {
        console.error("Token acquisition failed:", error);

        // If silent token acquisition fails, try interactive
        if (error.name === "InteractionRequiredAuthError") {
          try {
            console.log("Interaction required, attempting redirect login");
            await instance.acquireTokenRedirect({
              ...loginRequest,
              account: currentAccount,
            });
          } catch (redirectError) {
            console.error(
              "Interactive token acquisition failed:",
              redirectError
            );
          }
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, currentAccount, instance, inProgress, accounts]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin + "/login",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Handle login (if you need to customize the sign-in button)
  const handleLogin = async () => {
    if (inProgress !== "none") {
      console.log("Authentication already in progress:", inProgress);
      return;
    }

    try {
      // Make sure MSAL is initialized
      if (!instance.initialized) {
        console.log("Waiting for MSAL to initialize...");
        await instance.initialize();
        console.log("MSAL initialized");
      }

      console.log("Starting login redirect flow");
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      console.error("Login redirect failed:", error);

      // Fallback to popup if redirect fails
      try {
        console.log("Trying popup login as fallback");
        await instance.loginPopup(loginRequest);
      } catch (popupError) {
        console.error("Login popup also failed:", popupError);
      }
    }
  };

  // Get first letter of username for avatar
  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  // Get display name (before @ in email)
  const displayName = username ? username.split("@")[0] : "";

  // Use graph data display name if available
  const graphDisplayName = userData?.displayName || displayName;

  return (
    <Box
      className="sticky top-0 z-50 w-full bg-white border-b shadow-sm"
      style={{
        borderColor: themeColors.border,
        backgroundColor: themeColors.background,
        boxShadow: `0 1px 3px ${themeColors.shadowLight}`,
      }}
    >
      <Box className="mx-auto px-4 md:px-6 max-w-[1340px]">
        <Flex py="4" justify="between" align="center">
          <Flex align="center" gap="6">
            <Link
              to={isAuthenticated ? "/" : "/login"}
              className="flex items-center gap-2 no-underline"
            >
              <Box
                className="p-1.5 rounded-md flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
                }}
              >
                <HomeIcon className="text-white" size={18} />
              </Box>
              <Text
                size="3"
                weight="medium"
                style={{ color: themeColors.text }}
              >
                ER Request Management
              </Text>
            </Link>
          </Flex>

          {/* Authenticated View */}
          <AuthenticatedTemplate>
            {/* Desktop Actions */}
            <Flex
              gap="3"
              align="center"
              display={{ initial: "none", md: "flex" }}
            >
              <NavButton to="/admin" icon={Settings2}>
                Admin
              </NavButton>

              <NavButton to="/request-matrix" icon={LayoutGrid}>
                Matrix
              </NavButton>

              <NavButton
                to="/create-request"
                icon={PlusCircle}
                variant="primary"
              >
                New Request
              </NavButton>

              <Separator orientation="vertical" size="1" className="mx-1" />

              <Flex gap="3" align="center">
                <Box className="relative">
                  <IconButton
                    variant="ghost"
                    size="2"
                    style={{ color: themeColors.textLight }}
                    className="hover:bg-slate-50 transition-colors rounded-full p-1"
                  >
                    <BellIcon size={18} />
                  </IconButton>
                  <Box
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-white"
                    style={{ backgroundColor: themeColors.error }}
                  />
                </Box>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Box className="cursor-pointer">
                      <Avatar
                        size="2"
                        src={userData?.photo || ""}
                        fallback={userInitial}
                        radius="full"
                        className="hover:ring-2 ring-offset-2 transition-all duration-200"
                        style={{
                          ringColor: themeColors.primary,
                          backgroundColor: !userData?.photo
                            ? themeColors.primary
                            : undefined,
                          color: !userData?.photo ? "white" : undefined,
                        }}
                      />
                    </Box>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Label>
                      <Text size="2" weight="medium">
                        {graphDisplayName}
                      </Text>
                      {userData?.mail && (
                        <Text size="1" style={{ color: themeColors.textLight }}>
                          {userData.mail}
                        </Text>
                      )}
                    </DropdownMenu.Label>
                    <DropdownMenu.Item>
                      <Link
                        to="/profile"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <UserCircle size={16} />
                          Profile
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Flex gap="2" align="center">
                        <Settings2 size={16} />
                        Settings
                      </Flex>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color="red" onClick={handleLogout}>
                      <Flex gap="2" align="center">
                        <LogOut size={16} />
                        Log Out
                      </Flex>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            </Flex>

            {/* Mobile Navigation */}
            <Box display={{ initial: "block", md: "none" }}>
              <Flex gap="3" align="center">
                <Box className="relative">
                  <IconButton
                    variant="ghost"
                    size="2"
                    style={{ color: themeColors.textLight }}
                    className="rounded-full p-1"
                  >
                    <BellIcon size={18} />
                  </IconButton>
                  <Box
                    className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white"
                    style={{ backgroundColor: themeColors.error }}
                  />
                </Box>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton
                      variant="ghost"
                      size="2"
                      className="rounded-full hover:bg-slate-50 transition-colors"
                    >
                      <Menu size={18} />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Label>
                      <Text size="2" weight="medium">
                        {graphDisplayName}
                      </Text>
                    </DropdownMenu.Label>
                    <DropdownMenu.Item>
                      <Link
                        to="/admin"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <Settings2 size={16} />
                          Admin Panel
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Link
                        to="/request-matrix"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <LayoutGrid size={16} />
                          Request Matrix
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item>
                      <Link
                        to="/create-request"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <PlusCircle size={16} />
                          Create Request
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item>
                      <Link
                        to="/profile"
                        className="no-underline text-inherit w-full"
                      >
                        <Flex gap="2" align="center">
                          <UserCircle size={16} />
                          Profile
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color="red" onClick={handleLogout}>
                      <Flex gap="2" align="center">
                        <LogOut size={16} />
                        Log Out
                      </Flex>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            </Box>
          </AuthenticatedTemplate>

          {/* Unauthenticated View */}
          <UnauthenticatedTemplate>
            <Button
              onClick={handleLogin}
              className="py-2 px-4"
              style={{
                backgroundColor: themeColors.primary,
                color: "#ffffff",
                fontWeight: 500,
                borderRadius: "6px",
              }}
            >
              Sign In
            </Button>
          </UnauthenticatedTemplate>
        </Flex>
      </Box>
    </Box>
  );
}

export default NavHeader;
