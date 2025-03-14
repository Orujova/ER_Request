// src/components/RequestForm/RequestInfoSection.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setRequestType,
  setSubCase,
  setSearchQuery,
} from "../../redux/slices/formDataSlice";
import SearchableDropdown from "../common/SearchableDropdown";
import SectionContainer from "./SectionContainer";

const RequestInfoSection = () => {
  const dispatch = useDispatch();

  // Add fallbacks for undefined state
  const formData = useSelector((state) => state.formData) || {};
  const requestForm = useSelector((state) => state.requestForm) || {};

  const cases = requestForm.cases || [];
  const subCases = requestForm.subCases || [];
  const requestType = formData.requestType || "";
  const subCase = formData.subCase || "";
  const searchQueries = formData.searchQueries || { case: "", subCase: "" };

  // Clean up case and subcase options by trimming whitespace
  const getFilteredCases = () => {
    return cases
      .filter((caseItem) =>
        caseItem?.CaseName?.toLowerCase()
          .trim()
          .includes((searchQueries.case || "").toLowerCase().trim())
      )
      .map((caseItem) => caseItem.CaseName.trim()); // Trim case names
  };

  const getFilteredSubCases = () => {
    if (!requestType) return [];

    // Trim the requestType for comparison
    const trimmedRequestType = requestType.trim();
    const selectedCaseId = cases.find(
      (c) => c.CaseName.trim() === trimmedRequestType
    )?.Id;

    return subCases
      .filter(
        (subCaseItem) =>
          subCaseItem.CaseId === selectedCaseId &&
          subCaseItem.Description?.toLowerCase()
            .trim()
            .includes((searchQueries.subCase || "").toLowerCase().trim())
      )
      .map((subCaseItem) => subCaseItem.Description.trim()); // Trim subcase descriptions
  };

  const handleSearch = (field, value) => {
    dispatch(setSearchQuery({ field, value }));
  };

  const handleSelectCase = (value) => {
    // Trim value before dispatching
    dispatch(setRequestType(value ? value.trim() : ""));
  };

  const handleSelectSubCase = (value) => {
    // Trim value before dispatching
    dispatch(setSubCase(value ? value.trim() : ""));
  };

  return (
    <SectionContainer title="Sorğu Məlumatları">
      <div className="grid grid-cols-2 gap-6">
        <SearchableDropdown
          label="Case"
          placeholder="Search case type..."
          value={requestType}
          onSearch={(value) => handleSearch("case", value)}
          onSelect={handleSelectCase}
          options={getFilteredCases()}
          searchQuery={searchQueries.case || ""}
          setSearchQuery={(value) => handleSearch("case", value)}
          allowClear={true}
        />

        <SearchableDropdown
          label="Sub Case"
          placeholder={
            !requestType ? "First select a case" : "Search sub case..."
          }
          value={subCase}
          onSearch={(value) => handleSearch("subCase", value)}
          onSelect={handleSelectSubCase}
          options={getFilteredSubCases()}
          disabled={!requestType}
          searchQuery={searchQueries.subCase || ""}
          setSearchQuery={(value) => handleSearch("subCase", value)}
          allowClear={true}
        />
      </div>
    </SectionContainer>
  );
};

export default RequestInfoSection;
