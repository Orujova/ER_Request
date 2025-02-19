import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Flex,
  Text,
  Card,
  Box,
  Heading,
  IconButton,
  Grid,
  ScrollArea,
} from "@radix-ui/themes";
import {
  EyeIcon,
  UserCheckIcon,
  CheckCircleIcon,
  FileTextIcon,
  UsersIcon,
  CalendarIcon,
  FilterIcon,
} from "lucide-react";

// Import FilterSection - fayl adının BOŞLUQSUZ olduğundan əmin olun!!!
import FilterSection from "../components/FilterSection";

const Dashboard = () => {
  const [requests] = useState([
    {
      id: 1,
      erMember: "John Doe",
      project: "Project Alpha",
      employee: "Sarah Smith",
      case: "Performance Review",
      subcase: "Annual Review",
      status: "Pending Review",
      date: "2024-03-25",
    },
    {
      id: 2,
      erMember: "Jane Wilson",
      project: "Project Beta",
      employee: "Mike Johnson",
      case: "Promotion Review",
      subcase: "Senior Position",
      status: "Under Review",
      date: "2024-03-24",
    },
    {
      id: 3,
      erMember: "Robert Brown",
      project: "Project Gamma",
      employee: "Lisa Anderson",
      case: "Performance Review",
      subcase: "Quarterly Review",
      status: "Review Complete",
      date: "2024-03-23",
    },
  ]);

  // Default filter dəyərləri təyin edin - BU ÇOX VACİBDİR!
  const [filters, setFilters] = useState({
    erMember: "",
    project: "",
    employee: "",
    case: "",
    subcase: "",
    date: "",
    status: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  const filteredRequests = requests.filter((request) => {
    return Object.keys(filters).every((key) => {
      if (!filters[key]) return true;
      return request[key]
        .toString()
        .toLowerCase()
        .includes(filters[key].toLowerCase());
    });
  });

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      erMember: "",
      project: "",
      employee: "",
      case: "",
      subcase: "",
      date: "",
      status: "",
    });
  };

  const getStatusStyle = (status) => {
    switch (status.toLowerCase()) {
      case "pending review":
        return {
          color: "yellow",
          icon: <UserCheckIcon size={14} />,
          bgClass: "bg-amber-50",
          textClass: "text-amber-700",
        };
      case "under review":
        return {
          color: "blue",
          icon: <EyeIcon size={14} />,
          bgClass: "bg-blue-50",
          textClass: "text-blue-700",
        };
      case "review complete":
        return {
          color: "green",
          icon: <CheckCircleIcon size={14} />,
          bgClass: "bg-green-50",
          textClass: "text-green-700",
        };
      default:
        return {
          color: "gray",
          bgClass: "bg-gray-50",
          textClass: "text-gray-700",
        };
    }
  };

  return (
    <>
      {/* Stats Overview */}
      <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="4" mb="6">
        <Card size="2" className="bg-blue-50">
          <Flex align="center" gap="3" p="4">
            <IconButton
              size="3"
              variant="soft"
              color="blue"
              className="bg-blue-100"
            >
              <FileTextIcon />
            </IconButton>
            <Box>
              <Text size="2" color="gray" mb="1">
                Total Reviews
              </Text>
              <Heading size="4" color="blue">
                147
              </Heading>
            </Box>
          </Flex>
        </Card>
        <Card size="2" className="bg-amber-50">
          <Flex align="center" gap="3" p="4">
            <IconButton
              size="3"
              variant="soft"
              color="yellow"
              className="bg-amber-100"
            >
              <UsersIcon />
            </IconButton>
            <Box>
              <Text size="2" color="gray" mb="1">
                Pending Review
              </Text>
              <Heading size="4" color="yellow">
                23
              </Heading>
            </Box>
          </Flex>
        </Card>
        <Card size="2" className="bg-green-50">
          <Flex align="center" gap="3" p="4">
            <IconButton
              size="3"
              variant="soft"
              color="green"
              className="bg-green-100"
            >
              <CheckCircleIcon />
            </IconButton>
            <Box>
              <Text size="2" color="gray" mb="1">
                Completed
              </Text>
              <Heading size="4" color="green">
                89
              </Heading>
            </Box>
          </Flex>
        </Card>
      </Grid>

      {/* Main Dashboard Card */}
      <Card className="shadow-sm bg-white">
        <Box p={{ initial: "4", md: "6" }}>
          <Flex direction="column" gap="6">
            <Flex
              justify="between"
              align={{ initial: "start", sm: "center" }}
              direction={{ initial: "column", sm: "row" }}
              gap={{ initial: "3", sm: "0" }}
            >
              <Box>
                <Heading size={{ initial: "4", md: "5" }} mb="1">
                  Employee Reviews Dashboard
                </Heading>
                <Text size="2" color="gray">
                  Track and manage employee reviews
                </Text>
              </Box>
              <Button
                variant="soft"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-gray-100 hover:bg-gray-200"
              >
                <FilterIcon size={16} />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
            </Flex>

            {/* ÖNƏMLİ: FilterSection komponentinə bütün propsları düzgün ötürün */}
            {showFilters && (
              <FilterSection
                filters={filters}
                handleFilterChange={handleFilterChange}
                clearAllFilters={clearAllFilters}
              />
            )}

            <ScrollArea
              type="always"
              scrollbars="horizontal"
              className="w-full"
            >
              <Box className="min-w-[900px]">
                <Table.Root variant="surface">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">ER Member</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Project</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Employee</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Case</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Subcase</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Date</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Status</Text>
                      </Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell className="bg-gray-50">
                        <Text weight="medium">Actions</Text>
                      </Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>

                  <Table.Body>
                    {filteredRequests.map((request) => {
                      const statusStyle = getStatusStyle(request.status);

                      return (
                        <Table.Row
                          key={request.id}
                          className="hover:bg-gray-50"
                        >
                          <Table.Cell>
                            <Text weight="medium">{request.erMember}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="gray">{request.project}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="gray">{request.employee}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="gray">{request.case}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text color="gray">{request.subcase}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <CalendarIcon
                                size={14}
                                className="text-gray-400"
                              />
                              <Text size="2" color="gray">
                                {request.date}
                              </Text>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Flex align="center" gap="2">
                              <IconButton
                                size="1"
                                variant="ghost"
                                color={statusStyle.color}
                              >
                                {statusStyle.icon}
                              </IconButton>
                              <Text
                                size="2"
                                className={`px-2 py-1 rounded-full ${statusStyle.bgClass} ${statusStyle.textClass}`}
                              >
                                {request.status}
                              </Text>
                            </Flex>
                          </Table.Cell>
                          <Table.Cell>
                            <Button
                              onClick={() => navigate(`/request/${request.id}`)}
                              variant="soft"
                              color="blue"
                              className="bg-blue-50 hover:bg-blue-100"
                            >
                              <EyeIcon size={14} />
                              View Details
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Box>
            </ScrollArea>
          </Flex>
        </Box>
      </Card>
    </>
  );
};

export default Dashboard;
