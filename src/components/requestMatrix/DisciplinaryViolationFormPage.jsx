// src/components/requestMatrix/DisciplinaryViolationFormPage.jsx
import React from "react";
import DisciplinaryViolationForm from "./DisciplinaryViolationForm";

const DisciplinaryViolationFormPage = ({
  isCreating,
  selectedViolation,
  onSubmit,
  onCancel,
}) => {
  const initialViolation = isCreating ? { Name: "" } : selectedViolation;

  const formTitle = isCreating
    ? "Create Policy Violation"
    : "Edit Policy Violation";
  const submitLabel = isCreating ? "Create" : "Update";

  return (
    <DisciplinaryViolationForm
      violation={initialViolation}
      onSubmit={onSubmit}
      onCancel={onCancel}
      formTitle={formTitle}
      submitLabel={submitLabel}
    />
  );
};

export default DisciplinaryViolationFormPage;
