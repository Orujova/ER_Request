//Navbar.jsx
import { Link } from "react-router-dom";
import {
  Flex,
  Button,
  Box,
  Text,
  Container,
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
} from "lucide-react";

const theme = {
  colors: {
    primary: "#0284c7",
    primaryGradientStart: "#0ea5e9",
    primaryGradientEnd: "#0369a1",
    primaryHover: "#0369a1",
    secondary: "#f8fafc",
    secondaryHover: "#f1f5f9",
    border: "#e2e8f0",
    borderHover: "#cbd5e1",
    text: "#1e293b",
    textLight: "#64748b",
    background: "#ffffff",
    error: "#ef4444",
    success: "#22c55e",
    shadowLight: "rgba(148, 163, 184, 0.1)",
    shadowMedium: "rgba(148, 163, 184, 0.2)",
  },
};

function Navbar() {
  return (
    <Box className="bg-white border-b border-slate-200">
      <Container size="4">
        <Flex py="4" justify="between" align="center">
          <Flex align="center" gap="6">
            <Link to="/" style={{ textDecoration: "none" }}>
              <Flex align="center" gap="2">
                <IconButton
                  size="3"
                  variant="soft"
                  color="blue"
                  className="bg-[theme.colors.primaryGradientStart]"
                >
                  <HomeIcon className="text-[theme.colors.primary]" size={18} />
                </IconButton>
                <Text
                  size="3"
                  weight="bold"
                  className="text-[theme.colors.text]"
                >
                  Request Management System
                </Text>
              </Flex>
            </Link>
          </Flex>

          {/* Desktop Navigation */}
          <Flex
            gap="6"
            align="center"
            display={{ initial: "none", md: "flex" }}
          >
            <Link to="/admin" style={{ textDecoration: "none" }}>
              <Button
                variant="soft"
                size="2"
                className="bg-[theme.colors.secondary] hover:bg-[theme.colors.secondaryHover]"
              >
                <Settings2 size={16} />
                Admin Panel
              </Button>
            </Link>
            <Link to="/request-matrix" style={{ textDecoration: "none" }}>
              <Button
                variant="soft"
                size="2"
                className="bg-[theme.colors.secondary] hover:bg-[theme.colors.secondaryHover]"
              >
                <LayoutGrid size={16} />
                Request Matrix
              </Button>
            </Link>
            <Link to="/create-request" style={{ textDecoration: "none" }}>
              <Button
                size="2"
                className="bg-[theme.colors.primary] hover:bg-[theme.colors.primaryHover] text-white"
              >
                <PlusCircle size={16} />
                Create Request
              </Button>
            </Link>
            <Separator orientation="vertical" size="1" />
            <IconButton
              variant="ghost"
              size="2"
              className="text-[theme.colors.textLight]"
            >
              <BellIcon size={18} />
            </IconButton>
            <Avatar
              size="2"
              src=""
              fallback="A"
              radius="full"
              className="cursor-pointer"
            />
          </Flex>

          {/* Mobile Navigation */}
          <Box display={{ initial: "block", md: "none" }}>
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton variant="soft" size="2">
                  <Menu size={18} />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Item>
                  <Link
                    to="/admin"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      width: "100%",
                    }}
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
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      width: "100%",
                    }}
                  >
                    <Flex gap="2" align="center">
                      <LayoutGrid size={16} />
                      Request Matrix
                    </Flex>
                  </Link>
                </DropdownMenu.Item>
                <DropdownMenu.Separator />
                <DropdownMenu.Item>
                  <Link
                    to="/create-request"
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      width: "100%",
                    }}
                  >
                    <Flex gap="2" align="center">
                      <PlusCircle size={16} />
                      Create Request
                    </Flex>
                  </Link>
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Box>
        </Flex>
      </Container>
    </Box>
  );
}

export default Navbar;
