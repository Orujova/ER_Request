// src/components/requestMatrix/DisciplinaryActionFormPage.jsx
import React from "react";
import DisciplinaryActionForm from "./DisciplinaryActionForm";

const DisciplinaryActionFormPage = ({
  isCreating,
  selectedAction,
  disciplinaryResults,
  onSubmit,
  onCancel,
}) => {
  const initialAction = isCreating
    ? {
        Name: "",
        DisciplinaryActionResultId: disciplinaryResults[0]?.Id || 0,
      }
    : selectedAction;

  const formTitle = isCreating
    ? "Create Disciplinary Action"
    : "Edit Disciplinary Action";
  const submitLabel = isCreating ? "Create" : "Update";

  return (
    <DisciplinaryActionForm
      action={initialAction}
      onSubmit={onSubmit}
      onCancel={onCancel}
      results={disciplinaryResults}
      formTitle={formTitle}
      submitLabel={submitLabel}
    />
  );
};

export default DisciplinaryActionFormPage;
