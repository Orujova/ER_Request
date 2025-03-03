// src/Pages/ProfilePage.jsx
import React from "react";
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { Navigate } from "react-router-dom";
import UserProfile from "../components/UserProfile";
import { Box, Flex, Text, Heading, Tabs, Card, Button } from "@radix-ui/themes";
import {
  User,
  Settings,
  Bell,
  Lock,
  HelpCircle,
  ChevronLeft,
  Clock,
} from "lucide-react";

import { themeColors } from "../styles/theme";

// Activity history data for demonstration
const activityHistory = [
  {
    action: "Login",
    date: "2025-02-18T14:32:00Z",
    device: "Chrome on Windows",
  },
  {
    action: "Profile updated",
    date: "2025-02-15T09:17:00Z",
    device: "Edge on Windows",
  },
  {
    action: "Password changed",
    date: "2025-01-28T16:45:00Z",
    device: "Chrome on Windows",
  },
];

const ActivityItem = ({ activity }) => {
  const date = new Date(activity.date);
  const formattedDate = date.toLocaleString();

  return (
    <Flex
      gap="3"
      align="start"
      className="p-3 hover:bg-slate-50 rounded-lg transition-colors"
    >
      <Box
        className="mt-1 p-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: "rgba(8, 145, 178, 0.1)" }}
      >
        <Clock size={14} style={{ color: themeColors.primary }} />
      </Box>
      <Box>
        <Text size="2" weight="medium" style={{ color: themeColors.text }}>
          {activity.action}
        </Text>
        <Text size="1" style={{ color: themeColors.textLight }}>
          {formattedDate} • {activity.device}
        </Text>
      </Box>
    </Flex>
  );
};

const ProfilePage = () => {
  return (
    <>
      <AuthenticatedTemplate>
        <Box
          className="min-h-screen pb-12"
          style={{ backgroundColor: themeColors.secondary }}
        >
          {/* Header */}
          <Box
            className="sticky top-16 z-10 backdrop-blur-sm border-b py-6"
            style={{
              backgroundColor: themeColors.headerBg,
              borderColor: themeColors.border,
            }}
          >
            <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Flex justify="between" align="center">
                <Flex align="center" gap="3">
                  <Button
                    variant="ghost"
                    className="hover:bg-sky-50 rounded-full"
                    style={{ color: themeColors.textLight }}
                    asChild
                  >
                    <a href="/">
                      <ChevronLeft size={18} />
                    </a>
                  </Button>
                  <Heading size="5" style={{ color: themeColors.text }}>
                    Your Profile
                  </Heading>
                </Flex>
                <Button
                  size="2"
                  style={{
                    backgroundColor: themeColors.primary,
                    color: "white",
                    borderRadius: "8px",
                  }}
                >
                  <Settings size={16} />
                  Settings
                </Button>
              </Flex>
            </Box>
          </Box>

          {/* Main content */}
          <Box className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <Tabs.Root defaultValue="profile">
              <Box
                className="mb-6 border-b"
                style={{ borderColor: themeColors.border }}
              >
                <Tabs.List
                  className="max-w-3xl"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: themeColors.border,
                  }}
                >
                  <Tabs.Trigger value="profile" className="p-3">
                    <Flex gap="2" align="center">
                      <User size={16} />
                      Profile
                    </Flex>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="notifications" className="p-3">
                    <Flex gap="2" align="center">
                      <Bell size={16} />
                      Notifications
                    </Flex>
                  </Tabs.Trigger>
                  <Tabs.Trigger value="security" className="p-3">
                    <Flex gap="2" align="center">
                      <Lock size={16} />
                      Security
                    </Flex>
                  </Tabs.Trigger>
                </Tabs.List>
              </Box>

              <Flex gap="6" direction={{ initial: "column", md: "row" }}>
                <Box style={{ flex: "2" }}>
                  <Tabs.Content value="profile">
                    <UserProfile />
                  </Tabs.Content>

                  <Tabs.Content value="notifications">
                    <Card
                      className="w-full shadow-md p-8 flex items-center justify-center"
                      style={{
                        boxShadow:
                          "0 10px 25px rgba(0, 0, 0, 0.03), 0 5px 10px rgba(0, 0, 0, 0.02)",
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        border: `1px solid ${themeColors.border}`,
                        minHeight: "400px",
                      }}
                    >
                      <Flex direction="column" align="center" gap="4">
                        <Bell
                          size={48}
                          style={{ color: themeColors.textLight, opacity: 0.5 }}
                        />
                        <Heading size="3" style={{ color: themeColors.text }}>
                          Notification Preferences
                        </Heading>
                        <Text
                          style={{ color: themeColors.textLight }}
                          align="center"
                        >
                          Configure your notification preferences and settings
                          here.
                        </Text>
                        <Button
                          size="2"
                          style={{
                            backgroundColor: themeColors.primary,
                            color: "white",
                            borderRadius: "8px",
                            marginTop: "8px",
                          }}
                        >
                          Configure Settings
                        </Button>
                      </Flex>
                    </Card>
                  </Tabs.Content>

                  <Tabs.Content value="security">
                    <Card
                      className="w-full shadow-md p-8 flex items-center justify-center"
                      style={{
                        boxShadow:
                          "0 10px 25px rgba(0, 0, 0, 0.03), 0 5px 10px rgba(0, 0, 0, 0.02)",
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        border: `1px solid ${themeColors.border}`,
                        minHeight: "400px",
                      }}
                    >
                      <Flex direction="column" align="center" gap="4">
                        <Lock
                          size={48}
                          style={{ color: themeColors.textLight, opacity: 0.5 }}
                        />
                        <Heading size="3" style={{ color: themeColors.text }}>
                          Security Settings
                        </Heading>
                        <Text
                          style={{ color: themeColors.textLight }}
                          align="center"
                        >
                          Manage your password, two-factor authentication, and
                          security settings.
                        </Text>
                        <Button
                          size="2"
                          style={{
                            backgroundColor: themeColors.primary,
                            color: "white",
                            borderRadius: "8px",
                            marginTop: "8px",
                          }}
                        >
                          Security Options
                        </Button>
                      </Flex>
                    </Card>
                  </Tabs.Content>
                </Box>

                {/* Activity sidebar */}
                <Box
                  style={{ flex: "1" }}
                  display={{ initial: "none", lg: "block" }}
                >
                  <Card
                    className="w-full shadow-md"
                    style={{
                      boxShadow:
                        "0 10px 25px rgba(0, 0, 0, 0.03), 0 5px 10px rgba(0, 0, 0, 0.02)",
                      backgroundColor: "#ffffff",
                      borderRadius: "16px",
                      border: `1px solid ${themeColors.border}`,
                      position: "sticky",
                      top: "10rem",
                    }}
                  >
                    <Box
                      className="border-b p-4"
                      style={{ borderColor: themeColors.border }}
                    >
                      <Text
                        size="2"
                        weight="medium"
                        style={{ color: themeColors.text }}
                      >
                        Recent Activity
                      </Text>
                    </Box>
                    <Box className="p-3">
                      {activityHistory.map((activity, index) => (
                        <ActivityItem key={index} activity={activity} />
                      ))}

                      <Flex justify="center" mt="4">
                        <Button
                          variant="ghost"
                          size="1"
                          style={{ color: themeColors.primary }}
                          className="hover:bg-sky-50 text-sm w-full"
                        >
                          View All Activity
                        </Button>
                      </Flex>
                    </Box>
                  </Card>
                </Box>
              </Flex>
            </Tabs.Root>
          </Box>
        </Box>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <Navigate to="/login" replace />
      </UnauthenticatedTemplate>
    </>
  );
};

export default ProfilePage;
