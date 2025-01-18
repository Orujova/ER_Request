import { useState, useEffect } from "react";
import { useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import { styled, keyframes } from "@stitches/react";
import { ChevronDownIcon } from "@radix-ui/react-icons";

// Enhanced theme colors
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

// Animations
const slideDown = keyframes({
  "0%": { transform: "translateY(-10px)", opacity: 0 },
  "100%": { transform: "translateY(0)", opacity: 1 },
});

const fadeIn = keyframes({
  "0%": { opacity: 0 },
  "100%": { opacity: 1 },
});

// Enhanced styled components
const StyledCard = styled("div", {
  maxWidth: "64rem",
  margin: "2rem auto",
  padding: "2.5rem",
  backgroundColor: theme.colors.background,
  borderRadius: "1.25rem",
  boxShadow: `
    0 0 0 1px ${theme.colors.shadowLight},
    0 4px 6px -1px ${theme.colors.shadowLight},
    0 2px 4px -2px ${theme.colors.shadowMedium}
  `,
  border: `1px solid ${theme.colors.border}`,
  animation: `${fadeIn} 0.6s ease-out`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: `
      0 0 0 1px ${theme.colors.shadowLight},
      0 8px 12px -1px ${theme.colors.shadowLight},
      0 4px 8px -2px ${theme.colors.shadowMedium}
    `,
  },
});

const Title = styled("h2", {
  fontSize: "2rem",
  fontWeight: "700",
  color: theme.colors.text,
  marginBottom: "2.5rem",
  textAlign: "center",
  position: "relative",
  "&:after": {
    content: "",
    position: "absolute",
    bottom: "-0.75rem",
    left: "50%",
    transform: "translateX(-50%)",
    width: "4rem",
    height: "0.25rem",
    background: `linear-gradient(to right, ${theme.colors.primaryGradientStart}, ${theme.colors.primaryGradientEnd})`,
    borderRadius: "0.25rem",
  },
});

const StyledTabsList = styled(Tabs.List, {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1rem",
  marginBottom: "2.5rem",
  padding: "0.75rem",
  backgroundColor: theme.colors.secondary,
  borderRadius: "1rem",
  boxShadow: `inset 0 2px 4px ${theme.colors.shadowLight}`,
});

const StyledTabsTrigger = styled(Tabs.Trigger, {
  padding: "1.25rem",
  backgroundColor: "transparent",
  border: "none",
  borderRadius: "0.75rem",
  fontSize: "1rem",
  fontWeight: "600",
  color: theme.colors.textLight,
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  overflow: "hidden",

  '&[data-state="active"]': {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
    boxShadow: `0 2px 4px ${theme.colors.shadowLight}`,
    "&:before": {
      content: '""',
      position: "absolute",
      bottom: 0,
      left: "10%",
      width: "80%",
      height: "2px",
      background: `linear-gradient(to right, ${theme.colors.primaryGradientStart}, ${theme.colors.primaryGradientEnd})`,
      borderRadius: "1px",
    },
  },

  "&:hover": {
    backgroundColor: theme.colors.background,
    color: theme.colors.primary,
    transform: "translateY(-1px)",
  },
});

const FormSection = styled("div", {
  marginBottom: "2.5rem",
  padding: "2rem",
  backgroundColor: theme.colors.secondary,
  borderRadius: "1rem",
  border: `1px solid ${theme.colors.border}`,
  transition: "all 0.3s ease-in-out",
  animation: `${slideDown} 0.5s ease-out`,

  "&:hover": {
    backgroundColor: theme.colors.background,
    boxShadow: `
      0 4px 6px -1px ${theme.colors.shadowLight},
      0 2px 4px -2px ${theme.colors.shadowMedium}
    `,
  },
});

const SectionTitle = styled("h3", {
  fontSize: "1.25rem",
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: "1.75rem",
  display: "flex",
  alignItems: "center",
  position: "relative",
  paddingLeft: "1rem",

  "&:before": {
    content: '""',
    position: "absolute",
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    width: "4px",
    height: "1.5rem",
    background: `linear-gradient(to bottom, ${theme.colors.primaryGradientStart}, ${theme.colors.primaryGradientEnd})`,
    borderRadius: "2px",
  },
});

const FormGrid = styled("div", {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "1.75rem",
});

const FormField = styled("div", {
  marginBottom: "1.5rem",
  transition: "all 0.3s ease-in-out",

  "&:hover label": {
    color: theme.colors.primary,
  },
});

const Label = styled("label", {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: "600",
  color: theme.colors.text,
  marginBottom: "0.5rem",
  transition: "color 0.3s ease",
});

const Input = styled("input", {
  width: "100%",
  padding: "0.875rem 1.25rem",
  border: `2px solid ${theme.colors.border}`,
  borderRadius: "0.75rem",
  fontSize: "0.875rem",
  backgroundColor: theme.colors.background,
  transition: "all 0.3s ease-in-out",

  "&:focus": {
    outline: "none",
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 4px ${theme.colors.primary}15`,
    transform: "translateY(-1px)",
  },

  "&:hover": {
    borderColor: theme.colors.borderHover,
  },

  "&::placeholder": {
    color: theme.colors.textLight,
  },

  '&[type="file"]': {
    padding: "0.75rem",

    "&::file-selector-button": {
      padding: "0.75rem 1.25rem",
      border: "none",
      borderRadius: "0.5rem",
      background: `linear-gradient(to right, ${theme.colors.primaryGradientStart}, ${theme.colors.primaryGradientEnd})`,
      color: "white",
      cursor: "pointer",
      marginRight: "1rem",
      transition: "all 0.3s ease-in-out",

      "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: `0 2px 4px ${theme.colors.shadowMedium}`,
      },
    },
  },
});

const Textarea = styled("textarea", {
  width: "100%",
  padding: "0.875rem 1.25rem",
  border: `2px solid ${theme.colors.border}`,
  borderRadius: "0.75rem",
  fontSize: "0.875rem",
  backgroundColor: theme.colors.background,
  minHeight: "12rem",
  resize: "vertical",
  transition: "all 0.3s ease-in-out",

  "&:focus": {
    outline: "none",
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 4px ${theme.colors.primary}15`,
    transform: "translateY(-1px)",
  },

  "&:hover": {
    borderColor: theme.colors.borderHover,
  },
});

const StyledTrigger = styled(Select.Trigger, {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
  padding: "0.875rem 1.25rem",
  border: `2px solid ${theme.colors.border}`,
  borderRadius: "0.75rem",
  fontSize: "0.875rem",
  backgroundColor: theme.colors.background,
  color: theme.colors.text,
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",

  "&:focus": {
    outline: "none",
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 4px ${theme.colors.primary}15`,
  },

  "&:hover": {
    borderColor: theme.colors.borderHover,
    transform: "translateY(-1px)",
  },

  "&[data-placeholder]": {
    color: theme.colors.textLight,
  },
});

const StyledContent = styled(Select.Content, {
  overflow: "hidden",
  backgroundColor: theme.colors.background,
  borderRadius: "0.75rem",
  boxShadow: `
    0 4px 6px -1px ${theme.colors.shadowLight},
    0 2px 4px -2px ${theme.colors.shadowMedium}
  `,
  border: `1px solid ${theme.colors.border}`,
  animation: `${slideDown} 0.2s ease-out`,
});

const StyledItem = styled(Select.Item, {
  fontSize: "0.875rem",
  padding: "0.875rem 1.25rem",
  cursor: "pointer",
  color: theme.colors.text,
  transition: "all 0.2s ease-in-out",
  position: "relative",

  "&[data-highlighted]": {
    backgroundColor: theme.colors.secondary,
    color: theme.colors.primary,

    "&:before": {
      content: '""',
      position: "absolute",
      left: 0,
      top: "50%",
      transform: "translateY(-50%)",
      width: "3px",
      height: "50%",
      background: `linear-gradient(to bottom, ${theme.colors.primaryGradientStart}, ${theme.colors.primaryGradientEnd})`,
      borderRadius: "1px",
    },
  },
});

const Button = styled("button", {
  width: "100%",
  padding: "1.25rem",
  background: `linear-gradient(to right, ${theme.colors.primaryGradientStart}, ${theme.colors.primaryGradientEnd})`,
  color: "white",
  border: "none",
  borderRadius: "0.75rem",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  position: "relative",
  overflow: "hidden",

  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: `0 4px 6px -1px ${theme.colors.shadowLight}`,

    "&:before": {
      transform: "translateX(100%)",
    },
  },

  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    )`,
    transition: "transform 0.5s ease-in-out",
  },

  "&:active": {
    transform: "translateY(0)",
  },
});

// Complete case structure from the table
const caseStructure = {
  Davamiyyət: [
    "İşə gecikmə",
    "Bir gün tam işə gəlməmə",
    "3 gün və daha çox işə gəlməmək",
    "3 gün və daha çox işə gəlməmək (qayıtmadığı hal)",
  ],
  Oğurluq: [
    "Wastage oğurluq",
    "Kassadan oğurluq",
    "Seyfdən oğurluq",
    "Məhsul oğurluğu",
    "Avadanlıq oğurluğu",
  ],
  SOP: [],
  "Daxili nizam-intizam qaydası": [
    "Dress code",
    "Subordinasiya qaydasının pozulması",
    "Əlbəyaxa mübahisə",
    "Əməkdaşlara kobud rəftar",
    "Daxili istifadə məsullarını mənimsəmə",
  ],
  "Sui-istifadə və saxtakarlıq": [
    "Yanlış məhsul qəbulu",
    "ƏDV çekləri",
    "Umico",
    "Tarixi bitmiş məhsullar",
  ],
  "Vəzifə öhdəlikləri": [
    "Verilmiş tapşırığın icra edilməməsi",
    "Kassada yanlışlıq",
    "Müştəriyə qarşı kobudluq",
    "Avadanlığın korlanması/ Yanlış istifadə",
  ],
  "Müştəri şikayəti": [],
  "Speak up": [
    "İş yerində rəhbər şəxslər tərəfindən düzgün olmayan münasibət, qısnama və ya zorakılıq halları",
    "Etik davranış qaydalarının digər prinsiplərinin pozulması",
    "İşçi hüquqlarının pozulması /iş şəraiti",
    "Diskriminasiya, iş yerində digər əməkdaşlar tərəfindən düzgün olmayan münasibət",
    "Digər səbəblər",
  ],
};

// Mock employee data
const mockEmployees = [
  { badge: "E001", name: "John Doe", position: "Manager", department: "IT" },
  {
    badge: "E002",
    name: "Jane Smith",
    position: "Developer",
    department: "Engineering",
  },
  {
    badge: "E003",
    name: "Alice Johnson",
    position: "Analyst",
    department: "Finance",
  },
];

const SearchableSelect = styled("div", {
  position: "relative",
  width: "100%",
});

const SearchIcon = styled("div", {
  position: "absolute",
  right: "1rem",
  top: "50%",
  transform: "translateY(-50%)",
  color: theme.colors.textLight,
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
});

const SearchInput = styled("input", {
  width: "100%",
  padding: "0.75rem 2.5rem 0.75rem 1rem",
  border: `1px solid ${theme.colors.border}`,
  borderRadius: "0.5rem",
  fontSize: "0.875rem",
  backgroundColor: theme.colors.background,
  transition: "all 0.2s ease-in-out",
  color: theme.colors.text,

  "&:focus": {
    outline: "none",
    borderColor: theme.colors.primary,
    boxShadow: `0 0 0 2px ${theme.colors.primary}15`,
  },

  "&:hover:not(:disabled)": {
    borderColor: theme.colors.borderHover,
  },

  "&:disabled": {
    backgroundColor: theme.colors.secondary,
    cursor: "not-allowed",
    color: theme.colors.textLight,
  },
});

const SearchResults = styled("div", {
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  right: 0,
  backgroundColor: theme.colors.background,
  borderRadius: "0.5rem",
  border: `1px solid ${theme.colors.border}`,
  boxShadow:
    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  maxHeight: "15rem",
  overflowY: "auto",
  zIndex: 50,
  animation: `${slideDown} 0.2s ease-out`,
});

const SearchResult = styled("div", {
  padding: "0.75rem 1rem",
  cursor: "pointer",
  fontSize: "0.875rem",
  transition: "all 0.2s ease-in-out",
  color: theme.colors.text,

  "&:hover": {
    backgroundColor: theme.colors.secondary,
  },

  "&:first-child": {
    borderTopLeftRadius: "0.5rem",
    borderTopRightRadius: "0.5rem",
  },

  "&:last-child": {
    borderBottomLeftRadius: "0.5rem",
    borderBottomRightRadius: "0.5rem",
  },
});

const RequestForm = () => {
  const dropdownRefs = useRef({});
  const [requestType, setRequestType] = useState("");
  const [subCase, setSubCase] = useState("");
  const [activeTab, setActiveTab] = useState("employee");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [searchQueries, setSearchQueries] = useState({
    case: "",
    subCase: "",
    badge: "",
    name: "",
  });
  const [showDropdowns, setShowDropdowns] = useState({
    case: false,
    subCase: false,
    badge: false,
    name: false,
  });

  // Filter functions
  const getFilteredCases = () => {
    return Object.keys(caseStructure).filter((caseType) =>
      caseType.toLowerCase().includes(searchQueries.case.toLowerCase())
    );
  };

  const getFilteredSubCases = () => {
    if (!requestType) return [];
    return caseStructure[requestType].filter((subCase) =>
      subCase.toLowerCase().includes(searchQueries.subCase.toLowerCase())
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((key) => {
        if (
          dropdownRefs.current[key] &&
          !dropdownRefs.current[key].contains(event.target)
        ) {
          setShowDropdowns((prev) => ({ ...prev, [key]: false }));
        }
      });
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (field, value) => {
    if (field === "case" && value === "") {
      setRequestType("");
      setSubCase("");
    }
    if (field === "subCase" && value === "") {
      setSubCase("");
    }
    if ((field === "badge" || field === "name") && value === "") {
      setSelectedEmployee(null);
    }
    setSearchQueries((prev) => ({ ...prev, [field]: value }));
    setShowDropdowns((prev) => ({ ...prev, [field]: true }));
  };

  const handleSelect = (field, value) => {
    switch (field) {
      case "case":
        setRequestType(value);
        setSubCase("");
        break;
      case "subCase":
        setSubCase(value);
        break;
      case "badge":
        const empByBadge = mockEmployees.find((emp) => emp.badge === value);
        setSelectedEmployee(empByBadge);
        break;
      case "name":
        const empByName = mockEmployees.find((emp) => emp.name === value);
        setSelectedEmployee(empByName);
        break;
    }
    setSearchQueries((prev) => ({ ...prev, [field]: "" }));
    setShowDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      requestType,
      subCase,
      employee: selectedEmployee,
      // Add other form fields here
    });
  };

  return (
    <StyledCard>
      <Title>Create New Request</Title>

      <Tabs.Root defaultValue="employee" onValueChange={setActiveTab}>
        <StyledTabsList>
          <StyledTabsTrigger value="employee">
            Əməkdaş üçün sorğu
          </StyledTabsTrigger>
          <StyledTabsTrigger value="general">Ümumi sorğu</StyledTabsTrigger>
        </StyledTabsList>

        <form onSubmit={handleSubmit}>
          {/* Request Information */}
          <FormSection>
            <SectionTitle>Sorğu Məlumatları</SectionTitle>
            <FormGrid>
              <FormField>
                <Label>Case</Label>
                <div ref={(el) => (dropdownRefs.current.case = el)}>
                  <SearchableSelect>
                    <SearchInput
                      placeholder="Search case type..."
                      value={requestType || searchQueries.case}
                      onChange={(e) => handleSearch("case", e.target.value)}
                      onFocus={() =>
                        setShowDropdowns((prev) => ({ ...prev, case: true }))
                      }
                    />
                    <SearchIcon>
                      <ChevronDownIcon />
                    </SearchIcon>
                    {showDropdowns.case && (
                      <SearchResults>
                        {getFilteredCases().map((caseType, index) => (
                          <SearchResult
                            key={index}
                            onClick={() => handleSelect("case", caseType)}
                          >
                            {caseType}
                          </SearchResult>
                        ))}
                      </SearchResults>
                    )}
                  </SearchableSelect>
                </div>
              </FormField>

              <FormField>
                <Label>Sub Case</Label>
                <div
                  ref={(el) => (dropdownRefs.current.subCase = el)}
                  className="relative"
                >
                  <SearchableSelect>
                    <div className="relative">
                      <SearchInput
                        placeholder={
                          !requestType
                            ? "First select a case"
                            : "Search sub case..."
                        }
                        value={subCase || searchQueries.subCase}
                        onChange={(e) =>
                          handleSearch("subCase", e.target.value)
                        }
                        onFocus={() => {
                          if (requestType) {
                            setShowDropdowns((prev) => ({
                              ...prev,
                              subCase: true,
                            }));
                          }
                        }}
                        disabled={!requestType}
                      />
                      <SearchIcon>
                        <ChevronDownIcon size={20} />
                      </SearchIcon>
                    </div>

                    {showDropdowns.subCase && requestType && (
                      <SearchResults>
                        {caseStructure[requestType]?.length > 0 ? (
                          getFilteredSubCases().map((subCaseItem, index) => (
                            <SearchResult
                              key={index}
                              onClick={() => {
                                handleSelect("subCase", subCaseItem);
                                setShowDropdowns((prev) => ({
                                  ...prev,
                                  subCase: false,
                                }));
                              }}
                            >
                              {subCaseItem}
                            </SearchResult>
                          ))
                        ) : (
                          <SearchResult
                            css={{
                              color: theme.colors.textLight,
                              cursor: "default",
                              textAlign: "center",
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            No sub cases available
                          </SearchResult>
                        )}
                        {getFilteredSubCases().length === 0 &&
                          caseStructure[requestType]?.length > 0 && (
                            <SearchResult
                              css={{
                                color: theme.colors.textLight,
                                cursor: "default",
                                textAlign: "center",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                },
                              }}
                            >
                              No results found
                            </SearchResult>
                          )}
                      </SearchResults>
                    )}
                  </SearchableSelect>
                </div>
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection>
            <SectionTitle>Employee Related Information</SectionTitle>
            <FormGrid>
              {activeTab === "employee" && (
                <>
                  <FormField>
                    <Label>Badge</Label>
                    <div ref={(el) => (dropdownRefs.current.badge = el)}>
                      <SearchableSelect>
                        <SearchInput
                          placeholder="Search by badge..."
                          value={selectedEmployee?.badge || searchQueries.badge}
                          onChange={(e) =>
                            handleSearch("badge", e.target.value)
                          }
                          onFocus={() =>
                            setShowDropdowns((prev) => ({
                              ...prev,
                              badge: true,
                            }))
                          }
                        />
                        {showDropdowns.badge && (
                          <SearchResults>
                            {mockEmployees
                              .filter((emp) =>
                                emp.badge
                                  .toLowerCase()
                                  .includes(searchQueries.badge.toLowerCase())
                              )
                              .map((emp, index) => (
                                <SearchResult
                                  key={index}
                                  onClick={() =>
                                    handleSelect("badge", emp.badge)
                                  }
                                >
                                  {emp.badge} - {emp.name}
                                </SearchResult>
                              ))}
                          </SearchResults>
                        )}
                      </SearchableSelect>
                    </div>
                  </FormField>
                  <FormField>
                    <Label>A.S.A</Label>
                    <div ref={(el) => (dropdownRefs.current.name = el)}>
                      <SearchableSelect>
                        <SearchInput
                          placeholder="Search by name..."
                          value={selectedEmployee?.name || searchQueries.name}
                          onChange={(e) => handleSearch("name", e.target.value)}
                          onFocus={() =>
                            setShowDropdowns((prev) => ({
                              ...prev,
                              name: true,
                            }))
                          }
                        />
                        {showDropdowns.name && (
                          <SearchResults>
                            {mockEmployees
                              .filter((emp) =>
                                emp.name
                                  .toLowerCase()
                                  .includes(searchQueries.name.toLowerCase())
                              )
                              .map((emp, index) => (
                                <SearchResult
                                  key={index}
                                  onClick={() => handleSelect("name", emp.name)}
                                >
                                  {emp.name} ({emp.badge})
                                </SearchResult>
                              ))}
                          </SearchResults>
                        )}
                      </SearchableSelect>
                    </div>
                  </FormField>
                  <FormField>
                    <Label>Position</Label>
                    <Input
                      type="text"
                      value={selectedEmployee?.position || ""}
                      readOnly
                      css={{ backgroundColor: theme.colors.secondary }}
                    />
                  </FormField>
                  <FormField>
                    <Label>Department</Label>
                    <Input
                      type="text"
                      value={selectedEmployee?.department || ""}
                      readOnly
                      css={{ backgroundColor: theme.colors.secondary }}
                    />
                  </FormField>
                </>
              )}
              <FormField>
                <Label>Business Unit</Label>
                <Input type="text" placeholder="Enter business unit" />
              </FormField>
              <FormField>
                <Label>Project</Label>
                <Input type="text" placeholder="Enter project" />
              </FormField>
            </FormGrid>
          </FormSection>

          {/* Mail Information */}
          <FormSection>
            <SectionTitle>Mail</SectionTitle>
            <FormField>
              <Label>CC</Label>
              <Input type="text" placeholder="Enter CC email addresses" />
            </FormField>
            <FormField>
              <Label>Mail Body</Label>
              <Textarea placeholder="Enter your message here..." />
            </FormField>
            <FormField>
              <Label>Mail Attachments</Label>
              <Input type="file" multiple />
            </FormField>
          </FormSection>

          {/* Hyperlink */}
          <FormSection>
            <SectionTitle>Hyperlink</SectionTitle>
            <FormField>
              <Label>Hyperlink</Label>
              <Input type="url" placeholder="Enter URL" />
            </FormField>
          </FormSection>

          {/* Attachments */}
          <FormSection>
            <SectionTitle>Attachments</SectionTitle>

            <FormField>
              <Label>Other Attachments</Label>
              <Input type="file" multiple />
            </FormField>
          </FormSection>

          {/* ER Member */}
          <FormSection>
            <SectionTitle>ER Member</SectionTitle>
            <FormField>
              <Select.Root>
                <StyledTrigger>
                  <Select.Value placeholder="Select ER Member" />
                  <Select.Icon>
                    <ChevronDownIcon />
                  </Select.Icon>
                </StyledTrigger>
                <Select.Portal>
                  <StyledContent>
                    <Select.Viewport>
                      <StyledItem value="member1">Member 1</StyledItem>
                      <StyledItem value="member2">Member 2</StyledItem>
                      <StyledItem value="member3">Member 3</StyledItem>
                    </Select.Viewport>
                  </StyledContent>
                </Select.Portal>
              </Select.Root>
            </FormField>
          </FormSection>

          <Button type="submit">Submit Request</Button>
        </form>
      </Tabs.Root>
    </StyledCard>
  );
};

export default RequestForm;

// Davamiyyət

// İşə gecikmə

// Davamiyyət

// Bir gün tam işə gəlməmə

// Davamiyyət

// 3 gün və daha çox işə gəlməmək

// Oğurluq

// Wastage oğurluq

// Oğurluq

// Kassadan oğurluq

// Oğurluq

// Seyfdən oğurluq

// Oğurluq

// Məhsul oğurluğu

// Oğurluq

// Avadanlıq oğurluğu

// SOP

// Daxili nizam-intizam qaydası

// Dress code

// Daxili nizam-intizam qaydası

// Subordinasiya qaydasının pozulması

// Daxili nizam-intizam qaydası

// Əlbəyaxa mübahisə

// Daxili nizam-intizam qaydası

// Əməkdaşlara kobud rəftar

// Daxili nizam-intizam qaydası

// Daxili istifadə məsullarını mənimsəmə

// Sui-istifadə və saxtakarlıq

// Yanlış məhsul qəbulu

// Sui-istifadə və saxtakarlıq

// ƏDV çekləri

// Sui-istifadə və saxtakarlıq

// Umico

// Vəzifə öhdəlikləri

// Tarixi bitmiş məhsullar

// Vəzifə öhdəlikləri

// Verilmiş tapşırığın icra edilməməsi

// Vəzifə öhdəlikləri

// Kassada yanlışlıq

// Vəzifə öhdəlikləri

// Müştəriyə qarşı kobudluq

// Vəzifə öhdəlikləri

// Avadanlığın korlanması/ Yanlış istifadə

// Müştəri şikayəti

// Davamiyyət

// İşə gecikmə

// Davamiyyət

// Bir gün tam işə gəlməmə

// Davamiyyət

// 3 gün və daha çox işə gəlməmək

// Daxili nizam-intizam qaydası

// Dress code

// Daxili nizam-intizam qaydası

// Subordinasiya qaydasının pozulması

// Daxili nizam-intizam qaydası

// Əlbəyaxa mübahisə

// Daxili nizam-intizam qaydası

// Əməkdaşlara kobud rəftar

// Daxili nizam-intizam qaydası

// Daxili istifadə məsullarını mənimsəmə

// Vəzifə öhdəlikləri

// Verilmiş tapşırığın icra edilməməsi

// Speak up

// İş yerində rəhbər şəxslər tərəfindən düzgün olmayan münasibət, qısnama və ya zorakılıq halları

// Speak up

// Etik davranış qaydalarının digər prinsiplərinin pozulması

// Speak up

// İşçi hüquqlarının pozulması /iş şəraiti

// Speak up

// Diskriminasiya, iş yerində digər əməkdaşlar tərəfindən düzgün olmayan münasibət

// Speak up

// Digər səbəblər

// Davamiyyət

// 3 gün və daha çox işə gəlməmək (qayıtmadığı hal)
