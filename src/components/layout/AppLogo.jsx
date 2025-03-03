// src/components/layout/AppLogo.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Text } from "@radix-ui/themes";
import { HomeIcon } from "lucide-react";
import { themeColors } from "../../styles/theme";

const AppLogo = ({ isAuthenticated }) => {
  return (
    <Flex align="center" gap="6">
      <Link
        to={isAuthenticated ? "/" : "/login"}
        className="flex items-center gap-2.5 no-underline transition-transform hover:scale-102 duration-200"
      >
        <Box
          className="p-2 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
            boxShadow: `0 3px 6px rgba(14, 116, 144, 0.15)`,
          }}
        >
          <HomeIcon className="text-white" size={18} />
        </Box>
        <Text
          size="4"
          weight="medium"
          style={{
            color: themeColors.text,
            letterSpacing: "-0.01em",
          }}
        >
          ER Request
          <span
            style={{
              background: `linear-gradient(90deg, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 600,
            }}
          >
            {" "}
            Management
          </span>
        </Text>
      </Link>
    </Flex>
  );
};

export default AppLogo;
