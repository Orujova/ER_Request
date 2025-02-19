import { Box } from "@radix-ui/themes";

function MainContainer({ children }) {
  return (
    <Box className="pt-6 pb-8">
      <Box className="mx-auto px-4 md:px-6 max-w-[1340px]">{children}</Box>
    </Box>
  );
}

export default MainContainer;
