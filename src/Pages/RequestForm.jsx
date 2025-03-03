import React, { useState, useEffect } from "react";
import { useRef } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import * as Select from "@radix-ui/react-select";
import { styled, keyframes } from "@stitches/react";
import { ChevronDownIcon } from "@radix-ui/react-icons";
import { getStoredTokens, getUserId } from "../utils/authHandler";

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

const ERRequestType = {
  EmployeeRequest: 0,
  GeneralRequest: 1,
};

const RequestForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRefs = useRef({});
  const [requestType, setRequestType] = useState("");
  const [subCase, setSubCase] = useState("");
  const [activeTab, setActiveTab] = useState("employee");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formData, setFormData] = useState({
    projectId: null,

    ccAddresses: "",
    mailBody: "",
    hyperlink: "",
    attachments: [],
    erMemberId: null,
  });
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

  // Fetch dependencies (Cases, Employees, Projects, etc.)
  const [cases, setCases] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [erMembers, setErMembers] = useState([]);
  const [subCases, setSubCases] = useState([]);

  useEffect(() => {
    const fetchDependencies = async () => {
      try {
        const { jwtToken } = getStoredTokens();
        const userId = getUserId();

        const fetchOptions = {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            Accept: "application/json",
          },
        };

        // Fetch Cases
        const casesResponse = await fetch(
          "https://192.168.148.89:7252/api/Case",
          fetchOptions
        );
        const casesData = await casesResponse.json();
        const fetchedCases = casesData[0]?.Cases || [];
        setCases(fetchedCases);

        // Fetch SubCases
        const subCasesResponse = await fetch(
          "https://192.168.148.89:7252/api/SubCase",
          fetchOptions
        );
        const subCasesData = await subCasesResponse.json();
        const fetchedSubCases = subCasesData[0]?.SubCases || [];
        setSubCases(fetchedSubCases);

        // Fetch Employees
        const employeesResponse = await fetch(
          "https://192.168.148.89:7252/api/Employee",
          fetchOptions
        );
        const employeesData = await employeesResponse.json();
        const fetchedEmployees = employeesData[0]?.Employees || [];
        setEmployees(fetchedEmployees);

        // Fetch Projects
        const projectsResponse = await fetch(
          "https://192.168.148.89:7252/api/Project",
          fetchOptions
        );
        const projectsData = await projectsResponse.json();
        const fetchedProjects = projectsData[0]?.Projects || [];
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Failed to fetch dependencies", err);
        setError("Failed to load form data");

        // Set default empty arrays to prevent undefined errors
        setCases([]);
        setSubCases([]);
        setEmployees([]);
        setProjects([]);
        setErMembers([]);
      }
    };

    fetchDependencies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { jwtToken } = getStoredTokens();

      // Prepare request payload
      const payload = {
        CaseId: cases.find((c) => c.CaseName === requestType)?.Id || 0,
        SubCaseId: subCases.find((sc) => sc.Description === subCase)?.Id || 0,
        ProjectId: formData.projectId || 0,
        EmployeeId: selectedEmployee?.Id || 0,
        ERHyperLink: formData.hyperlink,

        MailCcAddresses: formData.ccAddresses,
        MailBody: formData.mailBody,
        RequestType:
          activeTab === "employee"
            ? ERRequestType.EmployeeRequest
            : ERRequestType.GeneralRequest,
        Attachments: formData.attachments,
      };

      // Submit request
      const response = await fetch(
        "https://192.168.148.89:7252/api/ERRequest/AddERRequest",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Submission failed");
      }

      // Handle successful submission
      alert("Request submitted successfully");

      // Reset form
      resetForm();
    } catch (err) {
      console.error("Submission failed", err);
      setError(err.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setRequestType("");
    setSubCase("");
    setSelectedEmployee(null);
    setFormData({
      projectId: null,

      ccAddresses: "",
      mailBody: "",
      hyperlink: "",
      attachments: [],
      erMemberId: null,
    });
  };

  // File upload handler
  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files);
    // Convert files to base64 or prepare for upload
    const filePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    });

    Promise.all(filePromises).then((base64Files) => {
      setFormData((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...base64Files],
      }));
    });
  };

  // Filtering methods with additional null checks
  const getFilteredCases = () => {
    if (!cases) return [];
    return cases
      .filter((caseItem) =>
        caseItem?.CaseName?.toLowerCase().includes(
          searchQueries.case.toLowerCase() || ""
        )
      )
      .map((caseItem) => caseItem.CaseName);
  };

  const getFilteredSubCases = () => {
    if (!requestType || !subCases) return [];
    const selectedCaseId = cases.find((c) => c.CaseName === requestType)?.Id;
    return subCases
      .filter(
        (subCaseItem) =>
          subCaseItem.CaseId === selectedCaseId &&
          subCaseItem.Description?.toLowerCase().includes(
            searchQueries.subCase.toLowerCase() || ""
          )
      )
      .map((subCaseItem) => subCaseItem.Description);
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

  const handleSearch = (field, value = "") => {
    // Ensure value is a string
    const searchValue = value || "";

    // Reset states based on search field
    switch (field) {
      case "case":
        if (searchValue === "") {
          setRequestType("");
          setSubCase("");
        }
        break;
      case "subCase":
        if (searchValue === "") {
          setSubCase("");
        }
        break;
      case "badge":
      case "name":
        if (searchValue === "") {
          setSelectedEmployee(null);
        }
        break;
    }

    // Update search queries and dropdown visibility
    setSearchQueries((prev) => ({
      ...prev,
      [field]: searchValue,
    }));
    setShowDropdowns((prev) => ({
      ...prev,
      [field]: true,
    }));
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
        const empByBadge = employees.find((emp) => emp.Badge === value);
        setSelectedEmployee(empByBadge);
        break;
      case "name":
        const empByName = employees.find((emp) => emp.FullName === value);
        setSelectedEmployee(empByName);
        break;
    }
    setSearchQueries((prev) => ({ ...prev, [field]: "" }));
    setShowDropdowns((prev) => ({ ...prev, [field]: false }));
  };

  return (
    <StyledCard>
      {error && (
        <div
          style={{
            backgroundColor: theme.colors.error,
            color: "white",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "0.5rem",
          }}
        >
          {error}
        </div>
      )}

      <Title>Create New Request</Title>

      <Tabs.Root
        defaultValue="employee"
        onValueChange={(value) => {
          setActiveTab(value);
          // Reset relevant fields when switching tabs
          setSelectedEmployee(null);
          setRequestType("");
          setSubCase("");
        }}
      >
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
                        {getFilteredSubCases().length > 0 ? (
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
                      </SearchResults>
                    )}
                  </SearchableSelect>
                </div>
              </FormField>
            </FormGrid>
          </FormSection>

          {/* Employee Related Information */}
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
                          value={selectedEmployee?.Badge || searchQueries.badge}
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
                            {employees
                              .filter((emp) =>
                                emp.Badge.toLowerCase().includes(
                                  searchQueries.badge.toLowerCase()
                                )
                              )
                              .map((emp, index) => (
                                <SearchResult
                                  key={index}
                                  onClick={() =>
                                    handleSelect("badge", emp.Badge)
                                  }
                                >
                                  {emp.Badge} - {emp.FullName}
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
                          value={
                            selectedEmployee?.FullName || searchQueries.name
                          }
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
                            {employees
                              .filter((emp) =>
                                emp.FullName.toLowerCase().includes(
                                  searchQueries.name.toLowerCase()
                                )
                              )
                              .map((emp, index) => (
                                <SearchResult
                                  key={index}
                                  onClick={() =>
                                    handleSelect("name", emp.FullName)
                                  }
                                >
                                  {emp.FullName} ({emp.Badge})
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
                      value={selectedEmployee?.Position?.Name || ""}
                      readOnly
                      css={{ backgroundColor: theme.colors.secondary }}
                    />
                  </FormField>

                  <FormField>
                    <Label>Department</Label>
                    <Input
                      type="text"
                      value={selectedEmployee?.Section?.Name || ""}
                      readOnly
                      css={{ backgroundColor: theme.colors.secondary }}
                    />
                  </FormField>
                </>
              )}

              <FormField>
                <Label>Project</Label>
                <Select.Root
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      projectId: projects.find((p) => p.ProjectName === value)
                        ?.Id,
                    }))
                  }
                >
                  <StyledTrigger>
                    <Select.Value placeholder="Select Project" />
                    <Select.Icon>
                      <ChevronDownIcon />
                    </Select.Icon>
                  </StyledTrigger>
                  <Select.Portal>
                    <StyledContent>
                      <Select.Viewport>
                        {projects.map((project) => (
                          <StyledItem
                            key={project.Id}
                            value={
                              project.ProjectName || `project-${project.Id}`
                            }
                          >
                            {project.ProjectName}
                          </StyledItem>
                        ))}
                      </Select.Viewport>
                    </StyledContent>
                  </Select.Portal>
                </Select.Root>
              </FormField>

              <FormField>
                <Label>Project</Label>
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
                        {getFilteredSubCases().length > 0 ? (
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
                      </SearchResults>
                    )}
                  </SearchableSelect>
                </div>
              </FormField>
            </FormGrid>
          </FormSection>

          {/* Mail Information */}
          <FormSection>
            <SectionTitle>Mail</SectionTitle>

            <FormField>
              <Label>CC</Label>
              <Input
                type="text"
                placeholder="Enter CC email addresses"
                value={formData.ccAddresses}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ccAddresses: e.target.value,
                  }))
                }
              />
            </FormField>
            <FormField>
              <Label>Mail Body</Label>
              <Textarea
                placeholder="Enter your message here..."
                value={formData.mailBody}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mailBody: e.target.value,
                  }))
                }
              />
            </FormField>
          </FormSection>

          {/* Hyperlink */}
          <FormSection>
            <SectionTitle>Hyperlink</SectionTitle>
            <FormField>
              <Label>Hyperlink</Label>
              <Input
                type="url"
                placeholder="Enter URL"
                value={formData.hyperlink}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    hyperlink: e.target.value,
                  }))
                }
              />
            </FormField>
          </FormSection>

          {/* Attachments */}
          <FormSection>
            <SectionTitle>Attachments</SectionTitle>
            <FormField>
              <Label>Other Attachments</Label>
              <Input
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e, "otherAttachments")}
              />
            </FormField>
          </FormSection>

          {/* ER Member */}
          <FormSection>
            <SectionTitle>ER Member</SectionTitle>
            <FormField>
              <Select.Root
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    erMemberId: erMembers.find((m) => m.Name === value)?.Id,
                  }))
                }
              >
                <StyledTrigger>
                  <Select.Value placeholder="Select ER Member" />
                  <Select.Icon>
                    <ChevronDownIcon />
                  </Select.Icon>
                </StyledTrigger>
                <Select.Portal>
                  <StyledContent>
                    <Select.Viewport>
                      {erMembers.map((member) => (
                        <StyledItem
                          key={member.Id}
                          value={member.Name || `member-${member.Id}`}
                        >
                          {member.Name}
                        </StyledItem>
                      ))}
                    </Select.Viewport>
                  </StyledContent>
                </Select.Portal>
              </Select.Root>
            </FormField>
          </FormSection>

          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </Tabs.Root>
    </StyledCard>
  );
};

export default RequestForm;
