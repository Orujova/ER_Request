import { Box } from "@radix-ui/themes";
// import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <Box className="min-h-screen bg-[#F8FAFC]">
      {/* <Navbar /> */}
      {children}
    </Box>
  );
}

export default Layout;
