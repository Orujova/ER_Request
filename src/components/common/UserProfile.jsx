// src/components/common/UserProfile.jsx
import React, { useState, useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { callMsGraph } from "../../utils/authService";
import { getLoginParameters } from "../../utils/authService";
import {
  Box,
  Card,
  Flex,
  Text,
  Avatar,
  Button,
  Heading,
  Separator,
  Badge,
} from "@radix-ui/themes";
import {
  User,
  Mail,
  Briefcase,
  RefreshCw,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { themeColors } from "../../styles/theme";

const ProfileField = ({ icon: Icon, label, value, emphasized = false }) => {
  if (!value) return null;

  return (
    <Flex
      align="center"
      gap="3"
      className="p-3 hover:bg-sky-50 transition-colors rounded-lg"
    >
      <Box
        className="flex items-center justify-center w-10 h-10 rounded-md"
        style={{
          background: emphasized
            ? `linear-gradient(135deg, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`
            : "rgba(6, 182, 212, 0.1)",
          color: emphasized ? "#ffffff" : themeColors.primary,
        }}
      >
        <Icon size={18} />
      </Box>
      <Box>
        <Text
          size="1"
          style={{
            color: themeColors.textLight,
            fontWeight: 500,
            marginRight: "8px",
          }}
        >
          {label}
        </Text>
        <Text
          size="2"
          style={{
            color: themeColors.text,
            fontWeight: emphasized ? 600 : 400,
          }}
        >
          {value}
        </Text>
      </Box>
    </Flex>
  );
};

const UserProfile = () => {
  const { instance, accounts } = useMsal();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadSuccess, setLoadSuccess] = useState(false);

  const fetchProfileData = async () => {
    if (accounts.length === 0) return;

    setIsLoading(true);
    setError(null);
    setLoadSuccess(false);

    try {
      const request = {
        ...getLoginParameters(),
        account: accounts[0],
      };

      const response = await instance.acquireTokenSilent(request);
      const data = await callMsGraph(response.accessToken);
      setProfileData(data);
      setLoadSuccess(true);

      // Reset success indicator after 3 seconds
      setTimeout(() => setLoadSuccess(false), 3000);
    } catch (silentError) {
      // Silent token acquisition failed, falling back to redirect
      if (
        silentError instanceof Error &&
        silentError.message.includes("interaction_required")
      ) {
        try {
          await instance.acquireTokenRedirect(getLoginParameters());
        } catch (redirectError) {
          setError("Failed to acquire token: " + redirectError.message);
        }
      } else {
        setError("Error fetching profile data: " + silentError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchProfileData();
    }
  }, [accounts]);

  if (isLoading) {
    return (
      <Card
        className="p-8 w-full shadow-md min-h-[300px] flex items-center justify-center"
        style={{
          boxShadow: themeColors.cardShadow,
          backgroundColor: themeColors.cardBg,
          borderRadius: "16px",
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Box className="relative w-12 h-12">
            <Box
              className="absolute inset-0 rounded-full animate-ping opacity-25"
              style={{ backgroundColor: themeColors.primary }}
            />
            <Box
              className="relative animate-spin rounded-full h-12 w-12 border-4 border-transparent"
              style={{
                borderTopColor: themeColors.primary,
                borderRightColor: themeColors.primary,
              }}
            />
          </Box>
          <Text style={{ color: themeColors.textLight }}>
            Loading profile data...
          </Text>
        </Flex>
      </Card>
    );
  }

  if (error) {
    return (
      <Card
        className="p-8 w-full shadow-md"
        style={{
          boxShadow: themeColors.cardShadow,
          backgroundColor: "rgba(254, 242, 242, 0.7)",
          borderRadius: "16px",
          border: "1px solid rgba(239, 68, 68, 0.2)",
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Box
            className="rounded-full p-3"
            style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
          >
            <AlertCircle size={24} style={{ color: themeColors.error }} />
          </Box>
          <Heading size="3" style={{ color: themeColors.text }}>
            Unable to Load Profile
          </Heading>
          <Text style={{ color: themeColors.textLight }} align="center">
            {error}
          </Text>
          <Button
            onClick={fetchProfileData}
            size="2"
            style={{
              marginTop: "8px",
              backgroundColor: themeColors.primary,
              color: "white",
              borderRadius: "8px",
              padding: "0 16px",
            }}
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
        </Flex>
      </Card>
    );
  }

  if (!profileData) {
    return (
      <Card
        className="p-8 w-full shadow-md"
        style={{
          boxShadow: themeColors.cardShadow,
          backgroundColor: themeColors.cardBg,
          borderRadius: "16px",
          border: `1px solid ${themeColors.border}`,
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Heading size="3" style={{ color: themeColors.text }}>
            Profile Information
          </Heading>
          <Text style={{ color: themeColors.textLight }} align="center">
            Your profile information is not loaded yet. Click the button below
            to fetch your data.
          </Text>
          <Button
            onClick={fetchProfileData}
            size="3"
            style={{
              marginTop: "8px",
              background: `linear-gradient(135deg, ${themeColors.gradientStart}, ${themeColors.gradientEnd})`,
              color: "white",
              borderRadius: "8px",
              padding: "0 20px",
              boxShadow: "0 4px 6px rgba(14, 116, 144, 0.15)",
            }}
          >
            <RefreshCw size={16} />
            Fetch Profile Information
          </Button>
        </Flex>
      </Card>
    );
  }

  const userInitial = profileData.displayName
    ? profileData.displayName.charAt(0).toUpperCase()
    : "U";

  return (
    <Card
      className="w-full overflow-hidden shadow-md"
      style={{
        boxShadow: themeColors.cardShadow,
        backgroundColor: themeColors.cardBg,
        borderRadius: "16px",
        border: `1px solid ${themeColors.border}`,
      }}
    >
      {/* Header with refresh button and success indicator */}
      <Flex
        justify="between"
        align="center"
        p="4"
        className="border-b"
        style={{ borderColor: themeColors.border }}
      >
        <Heading size="3" style={{ color: themeColors.text }}>
          User Profile
        </Heading>
        <Flex gap="2" align="center">
          {loadSuccess && (
            <Badge
              color="green"
              variant="soft"
              className="flex items-center gap-1"
            >
              <CheckCircle2 size={12} />
              Updated
            </Badge>
          )}
          <Button
            onClick={fetchProfileData}
            variant="ghost"
            style={{ color: themeColors.primary }}
            className="hover:bg-sky-50"
            disabled={isLoading}
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </Flex>
      </Flex>

      {/* Profile content */}
      <Box>
        {/* Profile header with avatar */}
        <Flex
          direction="column"
          align="center"
          className="py-8 px-4"
          style={{
            background:
              "linear-gradient(to bottom, rgba(6, 182, 212, 0.08), rgba(255, 255, 255, 0))",
          }}
        >
          <Avatar
            size="6"
            src={profileData.photo || ""}
            fallback={userInitial}
            radius="full"
            className="mb-4 ring-4 ring-white shadow-lg"
            style={{
              color: "white",
            }}
          />
          <Heading size="5" mb="1" style={{ color: themeColors.text }}>
            {profileData.displayName || "User"}
          </Heading>
          {profileData.jobTitle && (
            <Badge variant="soft" className="mb-2">
              {profileData.jobTitle}
            </Badge>
          )}
          {profileData.mail && (
            <Text size="2" style={{ color: themeColors.textLight }}>
              {profileData.mail}
            </Text>
          )}
        </Flex>

        <Separator size="4" style={{ backgroundColor: themeColors.border }} />

        {/* Profile details */}
        <Box className="p-4">
          <Text
            size="2"
            weight="medium"
            mb="3"
            style={{ color: themeColors.textLight }}
          >
            PERSONAL INFORMATION
          </Text>

          <Flex direction="column" gap="1">
            <ProfileField
              icon={User}
              label="Full Name"
              value={profileData.displayName}
              emphasized={true}
            />
            <ProfileField
              icon={User}
              label="First Name"
              value={profileData.givenName}
            />
            <ProfileField
              icon={User}
              label="Last Name"
              value={profileData.surname}
            />
            <ProfileField
              icon={Briefcase}
              label="Job Title"
              value={profileData.jobTitle}
            />
            <ProfileField
              icon={Mail}
              label="Email"
              value={profileData.mail || profileData.userPrincipalName}
              emphasized={true}
            />
          </Flex>
        </Box>
      </Box>
    </Card>
  );
};

export default UserProfile;
