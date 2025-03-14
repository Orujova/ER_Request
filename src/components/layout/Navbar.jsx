// src/components/layout/Navbar.jsx
import { Link, useLocation } from "react-router-dom"; // Add useLocation import
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
  Tooltip,
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
  ChevronDown,
} from "lucide-react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { AuthenticatedTemplate } from "@azure/msal-react";
import { loginRequest } from "../../../authConfig";
import { callMsGraph } from "../../utils/authService";
import { themeColors } from "../../styles/theme";
import NavButton from "./NavButton";
import NotificationBadge from "../common/NotificationBadge";
import UserMenuContent from "../auth/UserMenuContent";
import AppLogo from "./AppLogo";

function Navbar() {
  const isAuthenticated = useIsAuthenticated();
  const { instance, accounts, inProgress } = useMsal();
  const [userData, setUserData] = useState(null);
  const [notificationCount, setNotificationCount] = useState(3);

  // Use useLocation to track the current path
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState(location.pathname);

  const activeAccount = instance.getActiveAccount();
  const currentAccount = activeAccount || accounts[0];
  const username = currentAccount?.username || currentAccount?.name || "";

  // Update current path whenever location changes
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // Fetch user data when authenticated
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !currentAccount || inProgress !== "none") {
        return;
      }

      try {
        if (!instance.getActiveAccount() && accounts.length > 0) {
          instance.setActiveAccount(accounts[0]);
        }

        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: currentAccount,
        });

        try {
          const graphData = await callMsGraph(response.accessToken);
          setUserData(graphData);
        } catch (graphError) {
          console.error("Error fetching MS Graph data:", graphError);
        }
      } catch (error) {
        if (error.name === "InteractionRequiredAuthError") {
          try {
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

  // Get first letter of username for avatar
  const userInitial = username ? username.charAt(0).toUpperCase() : "U";

  // Get display name (before @ in email)
  const displayName = username ? username.split("@")[0] : "";

  // Use graph data display name if available
  const graphDisplayName = userData?.displayName || displayName;

  return (
    <AuthenticatedTemplate>
      <Box
        className="sticky top-0 z-50 w-full backdrop-blur-sm"
        style={{
          borderBottom: `1px solid ${themeColors.border}`,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: themeColors.navShadow,
        }}
      >
        <Box className="mx-auto px-4 md:px-6 max-w-layout">
          <Flex py="4" justify="between" align="center">
            {/* Logo & App Name */}
            <AppLogo isAuthenticated={isAuthenticated} />

            {/* Desktop Navigation */}
            <Flex
              gap="4"
              align="center"
              display={{ initial: "none", md: "flex" }}
            >
              <NavButton
                to="/admin"
                icon={Settings2}
                isActive={currentPath === "/admin"}
              >
                Admin
              </NavButton>

              <NavButton
                to="/request-matrix"
                icon={LayoutGrid}
                isActive={currentPath === "/request-matrix"}
              >
                Matrix
              </NavButton>

              <NavButton
                to="/create-request"
                icon={PlusCircle}
                variant="primary"
                isActive={currentPath === "/create-request"}
              >
                New Request
              </NavButton>

              <Separator
                orientation="vertical"
                size="1"
                className="mx-2 h-6"
                style={{ backgroundColor: themeColors.border }}
              />

              <Flex gap="4" align="center">
                <Tooltip content={`${notificationCount} notifications`}>
                  <Box className="relative">
                    <IconButton
                      variant="ghost"
                      size="2"
                      style={{ color: themeColors.textLight }}
                      className="hover:bg-slate-50 transition-colors rounded-full p-2"
                    >
                      <BellIcon size={19} />
                    </IconButton>
                    {notificationCount > 0 && (
                      <NotificationBadge count={notificationCount} />
                    )}
                  </Box>
                </Tooltip>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <Flex
                      align="center"
                      gap="2"
                      className="cursor-pointer group"
                    >
                      <Avatar
                        size="2"
                        src={userData?.photo || ""}
                        fallback={userInitial}
                        radius="full"
                        className="ring-2 ring-offset-2 group-hover:ring-opacity-100 transition-all duration-200"
                        style={{
                          ringColor: "rgba(8, 145, 178, 0.1)",
                          ringOpacity: "0.5",
                          color: !userData?.photo ? "white" : undefined,
                        }}
                      />
                    </Flex>
                  </DropdownMenu.Trigger>

                  <UserMenuContent
                    userData={userData}
                    graphDisplayName={graphDisplayName}
                    handleLogout={handleLogout}
                  />
                </DropdownMenu.Root>
              </Flex>
            </Flex>

            {/* Mobile Navigation */}
            <Box display={{ initial: "block", md: "none" }}>
              <Flex gap="4" align="center">
                <Tooltip content={`${notificationCount} notifications`}>
                  <Box className="relative">
                    <IconButton
                      variant="ghost"
                      size="2"
                      style={{ color: themeColors.textLight }}
                      className="rounded-full p-2 hover:bg-slate-50 transition-colors"
                    >
                      <BellIcon size={19} />
                    </IconButton>
                    {notificationCount > 0 && (
                      <NotificationBadge count={notificationCount} />
                    )}
                  </Box>
                </Tooltip>

                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton
                      variant="ghost"
                      size="2"
                      className="rounded-full hover:bg-slate-50 transition-colors p-2"
                    >
                      <Menu size={19} />
                    </IconButton>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content
                    style={{
                      borderRadius: "12px",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                      border: `1px solid ${themeColors.border}`,
                      padding: "6px",
                    }}
                  >
                    <DropdownMenu.Label>
                      <Flex align="center" gap="2" className="px-1 py-1.5">
                        <Avatar
                          size="2"
                          src={userData?.photo || ""}
                          fallback={userInitial}
                          radius="full"
                          style={{
                            backgroundColor: !userData?.photo
                              ? themeColors.primaryGradientEnd
                              : undefined,
                            color: !userData?.photo ? "white" : undefined,
                          }}
                        />
                        <Flex direction="column" align="start">
                          <Text size="2" weight="medium">
                            {graphDisplayName}
                          </Text>
                          {userData?.mail && (
                            <Text
                              size="1"
                              style={{ color: themeColors.textLight }}
                            >
                              {userData.mail.length > 25
                                ? userData.mail.substring(0, 25) + "..."
                                : userData.mail}
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </DropdownMenu.Label>
                    <DropdownMenu.Separator style={{ margin: "6px 0" }} />
                    <DropdownMenu.Item className="py-1.5 rounded-md">
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
                    <DropdownMenu.Item className="py-1.5 rounded-md">
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
                    <DropdownMenu.Item
                      className="py-1.5 rounded-md"
                      style={{
                        backgroundColor: themeColors.primary,
                        color: "white",
                      }}
                    >
                      <Link
                        to="/create-request"
                        className="no-underline text-white w-full"
                      >
                        <Flex gap="2" align="center">
                          <PlusCircle size={16} />
                          Create Request
                        </Flex>
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator style={{ margin: "6px 0" }} />
                    <DropdownMenu.Item className="py-1.5 rounded-md">
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
                    <DropdownMenu.Separator style={{ margin: "6px 0" }} />
                    <DropdownMenu.Item
                      color="red"
                      onClick={handleLogout}
                      className="py-1.5 rounded-md"
                    >
                      <Flex gap="2" align="center">
                        <LogOut size={16} />
                        Log Out
                      </Flex>
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </Flex>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Add shimmer animation keyframes */}
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </AuthenticatedTemplate>
  );
}

export default Navbar;
