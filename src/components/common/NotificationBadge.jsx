import React from "react";
import { Box } from "@radix-ui/themes";
import { themeColors } from "../../styles/theme";

const NotificationBadge = ({ count }) => (
  <Box
    className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[0.6rem]   text-white rounded-full border-2 border-white"
    style={{ backgroundColor: themeColors.error }}
  >
    {count > 9 ? "9+" : count}
  </Box>
);

export default NotificationBadge;
