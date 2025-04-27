// src/components/requestMatrix/DisciplinaryResultFormPage.jsx
import React from "react";
import DisciplinaryResultForm from "./DisciplinaryResultForm";

const DisciplinaryResultFormPage = ({
  isCreating,
  selectedResult,
  onSubmit,
  onCancel,
}) => {
  // Create default result object for new entries
  const initialResult = isCreating
    ? {
        Id: 0,
        Name: "",
      }
    : selectedResult;

  const formTitle = isCreating
    ? "Create Disciplinary Action Result"
    : "Edit Disciplinary Action Result";

  const submitLabel = isCreating ? "Create" : "Update";

  return (
    <DisciplinaryResultForm
      result={initialResult}
      onSubmit={onSubmit}
      onCancel={onCancel}
      formTitle={formTitle}
      submitLabel={submitLabel}
    />
  );
};

export default DisciplinaryResultFormPage;
