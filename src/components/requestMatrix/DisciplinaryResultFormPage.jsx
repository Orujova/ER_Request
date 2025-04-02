// src/components/requestMatrix/DisciplinaryResultFormPage.jsx
import React from "react";
import DisciplinaryResultForm from "./DisciplinaryResultForm";

const DisciplinaryResultFormPage = ({
  isCreating,
  selectedResult,
  onSubmit,
  onCancel,
}) => {
  const initialResult = isCreating ? { Name: "" } : selectedResult;

  const formTitle = isCreating
    ? "Create Disciplinary Result"
    : "Edit Disciplinary Result";
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
