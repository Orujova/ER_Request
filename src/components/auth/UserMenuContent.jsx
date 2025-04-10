import React from "react";
import { DropdownMenu, Flex, Text, Box } from "@radix-ui/themes";
import { Link } from "react-router-dom";
import { UserCircle, LogOut } from "lucide-react";
import { themeColors } from "../../styles/theme";

const UserMenuContent = ({ userData, graphDisplayName, handleLogout }) => {
  return (
    <DropdownMenu.Content
      style={{
        borderRadius: "12px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        border: `1px solid ${themeColors.border}`,
        padding: "4px",
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        backdropFilter: "blur(8px)",
        maxWidth: "280px", // Added max width to ensure the dropdown has consistent sizing
      }}
    >
      <DropdownMenu.Label>
        <Flex
          direction="column"
          gap="1"
          className="px-2 py-2"
          style={{
            borderRadius: "8px",
            margin: "0 0 4px 0",
          }}
        >
          <Text
            size="2"
            weight="medium"
            style={{
              color: themeColors.text,
              letterSpacing: "-0.01em",
              maxWidth: "220px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap", // Prevents text from wrapping
            }}
          >
            {graphDisplayName}
          </Text>
          {userData?.mail && (
            <Text
              size="1"
              style={{
                color: themeColors.textLight,
                maxWidth: "220px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap", // Ensures email stays on one line
              }}
            >
              {userData.mail}
            </Text>
          )}
        </Flex>
      </DropdownMenu.Label>

      <DropdownMenu.Separator
        style={{
          margin: "6px 0",
          backgroundColor: "rgba(203, 213, 225, 0.5)",
        }}
      />

      <DropdownMenu.Item className="py-2 rounded-lg hover:bg-sky-50 transition-colors duration-150">
        <Link to="/profile" className="no-underline text-inherit w-full">
          <Flex gap="2" align="center">
            <Box
              style={{
                borderRadius: "6px",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <UserCircle size={16} style={{ color: themeColors.primary }} />
            </Box>
            <Text style={{ color: themeColors.text }}>Profile</Text>
          </Flex>
        </Link>
      </DropdownMenu.Item>

      <DropdownMenu.Separator
        style={{
          margin: "6px 0",
          backgroundColor: "rgba(203, 213, 225, 0.5)",
        }}
      />

      <DropdownMenu.Item
        onClick={handleLogout}
        className="py-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
      >
        <Flex gap="2" align="center">
          <Box
            style={{
              borderRadius: "6px",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LogOut size={16} style={{ color: "#ef4444" }} />
          </Box>
          <Text style={{ color: "#dc2626" }}>Log Out</Text>
        </Flex>
      </DropdownMenu.Item>
    </DropdownMenu.Content>
  );
};

export default UserMenuContent;
