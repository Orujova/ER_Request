import PropTypes from "prop-types";
import {
  Button,
  Flex,
  Text,
  Card,
  Box,
  Heading,
  Grid,
  TextField,
} from "@radix-ui/themes";
import { XIcon } from "lucide-react";

const FilterSection = ({
  filters = {},
  handleFilterChange = () => {},
  clearAllFilters = () => {},
}) => {
  const statusOptions = ["Pending Review", "Under Review", "Review Complete"];

  // Providing default values to prevent undefined errors
  const {
    erMember = "",
    project = "",
    employee = "",
    case: caseValue = "",
    subcase = "",
    date = "",
    status = "",
  } = filters;

  return (
    <Card className="mb-4 shadow-sm">
      <Box p="4">
        <Flex justify="between" align="center" mb="4">
          <Heading size="3">Filters</Heading>
          <Button
            variant="soft"
            onClick={clearAllFilters}
            className="bg-gray-100 hover:bg-gray-200"
          >
            <XIcon size={14} />
            Clear All
          </Button>
        </Flex>

        <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4">
          {/* ER Member Filter */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              ER Member
            </Text>
            <TextField.Root size="2">
              <TextField.Input
                placeholder="Filter by ER Member"
                value={erMember}
                onChange={(e) => handleFilterChange("erMember", e.target.value)}
              />
            </TextField.Root>
          </Box>

          {/* Project Filter */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              Project
            </Text>
            <TextField.Root size="2">
              <TextField.Input
                placeholder="Filter by Project"
                value={project}
                onChange={(e) => handleFilterChange("project", e.target.value)}
              />
            </TextField.Root>
          </Box>

          {/* Employee Filter */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              Employee
            </Text>
            <TextField.Root size="2">
              <TextField.Input
                placeholder="Filter by Employee"
                value={employee}
                onChange={(e) => handleFilterChange("employee", e.target.value)}
              />
            </TextField.Root>
          </Box>

          {/* Case Filter */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              Case
            </Text>
            <TextField.Root size="2">
              <TextField.Input
                placeholder="Filter by Case"
                value={caseValue}
                onChange={(e) => handleFilterChange("case", e.target.value)}
              />
            </TextField.Root>
          </Box>

          {/* Subcase Filter */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              Subcase
            </Text>
            <TextField.Root size="2">
              <TextField.Input
                placeholder="Filter by Subcase"
                value={subcase}
                onChange={(e) => handleFilterChange("subcase", e.target.value)}
              />
            </TextField.Root>
          </Box>

          {/* Date Filter */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              Date
            </Text>
            <TextField.Root size="2">
              <TextField.Input
                placeholder="Filter by Date"
                value={date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                type="date"
              />
            </TextField.Root>
          </Box>

          {/* Status Filter - using regular HTML select instead of Radix Select */}
          <Box>
            <Text size="2" weight="medium" mb="2">
              Status
            </Text>
            <select
              className="w-full px-3 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              {statusOptions.map((statusOption) => (
                <option key={statusOption} value={statusOption}>
                  {statusOption}
                </option>
              ))}
            </select>
          </Box>
        </Grid>
      </Box>
    </Card>
  );
};

// PropTypes - set them as not required with default values
FilterSection.propTypes = {
  filters: PropTypes.shape({
    erMember: PropTypes.string,
    project: PropTypes.string,
    employee: PropTypes.string,
    case: PropTypes.string,
    subcase: PropTypes.string,
    date: PropTypes.string,
    status: PropTypes.string,
  }),
  handleFilterChange: PropTypes.func,
  clearAllFilters: PropTypes.func,
};

export default FilterSection;
