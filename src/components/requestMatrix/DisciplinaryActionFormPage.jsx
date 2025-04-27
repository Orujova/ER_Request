// src/components/requestMatrix/DisciplinaryActionFormPage.jsx
import React, { useState, useEffect } from "react";
import DisciplinaryActionForm from "./DisciplinaryActionForm";
import { fetchDisciplinaryResults } from "../../services/disciplinaryService";

const DisciplinaryActionFormPage = ({
  isCreating,
  selectedAction,
  onSubmit,
  onCancel,
}) => {
  const [disciplinaryResults, setDisciplinaryResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch results on component mount
  useEffect(() => {
    const loadResults = async () => {
      const results = await fetchDisciplinaryResults(setLoading, setError);
      setDisciplinaryResults(results);
    };

    loadResults();
  }, []);

  const initialAction = isCreating
    ? {
        Id: 0,
        Name: "",
        DisciplinaryActionResultId: disciplinaryResults[0]?.Id || 0,
      }
    : selectedAction;

  const formTitle = isCreating
    ? "Create Disciplinary Action"
    : "Edit Disciplinary Action";
  const submitLabel = isCreating ? "Create" : "Update";

  return (
    <>
      {loading ? (
        <div className="text-center py-6">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-opacity-25 border-t-transparent"></div>
          <p className="mt-2 text-sm">Loading...</p>
        </div>
      ) : (
        <DisciplinaryActionForm
          action={initialAction}
          onSubmit={onSubmit}
          onCancel={onCancel}
          results={disciplinaryResults}
          formTitle={formTitle}
          submitLabel={submitLabel}
        />
      )}
    </>
  );
};

export default DisciplinaryActionFormPage;
