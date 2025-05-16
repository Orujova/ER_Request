import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  FileText,
  Calendar,
  Loader,
  HelpCircle,
  Info,
  RefreshCw,
  PencilLine,
  File,
  AlertCircle,
  Save,
} from "lucide-react";
import { getStoredTokens } from "../../utils/authHandler";

const UpdateRequestForm = ({
  id,
  request,
  disciplinaryViolations,
  disciplinaryActionResults,
  disciplinaryActions,
  API_BASE_URL,
  setSuccess,
  setError,
  showToast,
  fetchAllDisciplinaryActions,
  fetchDisciplinaryActionResults,
  fetchDisciplinaryViolations,
  fetchRequestDetails,
}) => {
  const [isEligible, setIsEligible] = useState(true);
  const [formData, setFormData] = useState({
    Id: parseInt(id),
    DisciplinaryViolationId: "",
    DisciplinaryActionId: "",
    DisciplinaryActionResultId: "",
    Note: "",
    Reason: "",
    IsEligible: true,
    ContractEndDate: "",
    OrderNumber: "",
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [filteredActionResults, setFilteredActionResults] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const TERMINATION_RESULT_IDS = ["6"];

  const initializeForm = useCallback(() => {
    if (request && Object.keys(request).length > 0) {
      const isEligibleValue =
        request.isEligible === null ? true : Boolean(request.isEligible);

      const newFormData = {
        Id: parseInt(id),
        DisciplinaryViolationId:
          request.disciplinaryAction?.violationId ||
          request.disciplinaryViolationId
            ? (
                request.disciplinaryAction?.violationId ||
                request.disciplinaryViolationId
              ).toString()
            : "",
        DisciplinaryActionId:
          request.disciplinaryAction?.id || request.disciplinaryActionId
            ? (
                request.disciplinaryAction?.id || request.disciplinaryActionId
              ).toString()
            : "",
        DisciplinaryActionResultId:
          request.disciplinaryAction?.resultId ||
          request.disciplinaryActionResultId
            ? (
                request.disciplinaryAction?.resultId ||
                request.disciplinaryActionResultId
              ).toString()
            : "",
        Note: request.note || "",
        Reason: request.reason || "",
        IsEligible: isEligibleValue,
        ContractEndDate: request.contractEndDate || "",
        OrderNumber: request.orderNumber || "",
      };

      setFormData(newFormData);
      setInitialFormData(newFormData);
      setIsEligible(isEligibleValue);

      if (newFormData.DisciplinaryActionId) {
        getActionResultsByActionId(newFormData.DisciplinaryActionId);
      }
    } else {
      const defaultFormData = {
        Id: parseInt(id),
        DisciplinaryViolationId: "",
        DisciplinaryActionId: "",
        DisciplinaryActionResultId: "",
        Note: "",
        Reason: "",
        IsEligible: true,
        ContractEndDate: "",
        OrderNumber: "",
      };
      setFormData(defaultFormData);
      setInitialFormData(defaultFormData);
      setIsEligible(true);
      setFilteredActionResults([]);
    }
  }, [id, request]);

  useEffect(() => {
    initializeForm();
  }, [initializeForm]);

  const getActionResultsByActionId = async (actionId) => {
    if (!actionId) {
      setFilteredActionResults([]);
      return;
    }

    try {
      setLoading(true);
      const { jwtToken } = getStoredTokens();

      const selectedAction = disciplinaryActions.find(
        (action) => action.Id.toString() === actionId
      );

      if (selectedAction && selectedAction.DisciplinaryActionResultId) {
        const matchingResults = disciplinaryActionResults.filter(
          (result) =>
            result.Id.toString() ===
            selectedAction.DisciplinaryActionResultId.toString()
        );
        setFilteredActionResults(matchingResults);
      } else {
        setFilteredActionResults(disciplinaryActionResults);
      }
    } catch (err) {
      console.error("Error fetching action results:", err);
      setFilteredActionResults(disciplinaryActionResults);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFormData) {
      const hasChanges =
        initialFormData.DisciplinaryViolationId !==
          formData.DisciplinaryViolationId ||
        initialFormData.DisciplinaryActionId !==
          formData.DisciplinaryActionId ||
        initialFormData.DisciplinaryActionResultId !==
          formData.DisciplinaryActionResultId ||
        initialFormData.Note !== formData.Note ||
        initialFormData.Reason !== formData.Reason ||
        initialFormData.IsEligible !== formData.IsEligible ||
        initialFormData.ContractEndDate !== formData.ContractEndDate ||
        initialFormData.OrderNumber !== formData.OrderNumber;

      setUnsavedChanges(hasChanges);
    }
  }, [formData, initialFormData]);

  useEffect(() => {
    if (formData.DisciplinaryActionId) {
      getActionResultsByActionId(formData.DisciplinaryActionId);

      if (
        initialFormData &&
        formData.DisciplinaryActionId !== initialFormData.DisciplinaryActionId
      ) {
        setFormData((prev) => ({
          ...prev,
          DisciplinaryActionResultId: "",
        }));
      }
    } else {
      setFilteredActionResults([]);
    }
  }, [
    formData.DisciplinaryActionId,
    disciplinaryActionResults,
    disciplinaryActions,
    initialFormData,
  ]);

  useEffect(() => {
    if (formData.DisciplinaryActionResultId) {
      if (
        TERMINATION_RESULT_IDS.includes(formData.DisciplinaryActionResultId)
      ) {
        setIsEligible(false);
        setFormData((prev) => ({
          ...prev,
          IsEligible: false,
        }));
      }
    }
  }, [formData.DisciplinaryActionResultId]);

  const validateForm = () => {
    const errors = {};

    if (!formData.DisciplinaryViolationId) {
      errors.DisciplinaryViolationId = "Please select a violation";
    }

    if (!formData.DisciplinaryActionId) {
      errors.DisciplinaryActionId = "Please select an action";
    }

    if (
      formData.DisciplinaryActionId &&
      !formData.DisciplinaryActionResultId &&
      filteredActionResults.length > 0
    ) {
      errors.DisciplinaryActionResultId = "Please select an action result";
    }

    if (!formData.Reason.trim()) {
      errors.Reason = "Reason is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    if (name === "eligibilityOption") {
      const isEligibleValue = value === "eligible";
      setIsEligible(isEligibleValue);
      setFormData({
        ...formData,
        IsEligible: isEligibleValue,
      });
      return;
    }

    if (
      name === "DisciplinaryActionResultId" &&
      TERMINATION_RESULT_IDS.includes(value)
    ) {
      setIsEligible(false);
      setFormData({
        ...formData,
        [name]: newValue,
        IsEligible: false,
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }

    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the highlighted errors.");
      return;
    }

    try {
      setLoading(true);
      const { jwtToken } = getStoredTokens();

      const params = new URLSearchParams();
      params.append("Id", id);
      params.append(
        "DisciplinaryViolationId",
        formData.DisciplinaryViolationId
          ? formData.DisciplinaryViolationId
          : "0"
      );
      params.append(
        "DisciplinaryActionId",
        formData.DisciplinaryActionId ? formData.DisciplinaryActionId : "0"
      );
      params.append(
        "DisciplinaryActionResultId",
        formData.DisciplinaryActionResultId
          ? formData.DisciplinaryActionResultId
          : "0"
      );
      params.append("Note", formData.Note || "");
      params.append("Reason", formData.Reason || "");
      params.append("IsEligible", isEligible.toString());
      params.append("ContractEndDate", formData.ContractEndDate || "");
      params.append("OrderNumber", formData.OrderNumber || "");

      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequest?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage;
        try {
          const errorData = await response.text();
          errorMessage =
            errorData || `Error updating request: ${response.status}`;
        } catch {
          errorMessage = `Error updating request: ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      setSuccess("Request updated successfully.");
      showToast("Request updated successfully.", "success");

      // Refresh the request data after successful save
      if (fetchRequestDetails) {
        await fetchRequestDetails();
      }

      setLoading(false);
      setUnsavedChanges(false);
      setInitialFormData({ ...formData });
    } catch (err) {
      console.error("Error updating request:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (initialFormData) {
      setFormData({ ...initialFormData });
      setIsEligible(initialFormData.IsEligible);
      setFormErrors({});
      setFilteredActionResults(
        initialFormData.DisciplinaryActionId
          ? disciplinaryActionResults.filter(
              (result) =>
                result.Id.toString() ===
                (
                  disciplinaryActions.find(
                    (action) =>
                      action.Id.toString() ===
                      initialFormData.DisciplinaryActionId
                  )?.DisciplinaryActionResultId || ""
                ).toString()
            )
          : []
      );
    } else {
      initializeForm();
    }
  };

  const refreshData = async () => {
    setFetchingData(true);
    try {
      if (fetchDisciplinaryViolations) await fetchDisciplinaryViolations();
      if (fetchAllDisciplinaryActions) await fetchAllDisciplinaryActions();
      if (fetchDisciplinaryActionResults)
        await fetchDisciplinaryActionResults();
      if (fetchRequestDetails) await fetchRequestDetails();
      initializeForm();
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("An error occurred while refreshing data.");
    } finally {
      setFetchingData(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader size={30} className="animate-spin text-sky-500 mr-3" />
        <span className="text-lg text-slate-600">Loading request data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <button
        type="button"
        onClick={refreshData}
        className="absolute top-0 right-0 p-2 text-slate-400 hover:text-sky-500 transition-colors"
        title="Refresh data from server"
      >
        <RefreshCw size={16} className={fetchingData ? "animate-spin" : ""} />
      </button>

      {unsavedChanges && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center">
          <Info size={18} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">You have unsaved changes</p>
            <p className="text-xs text-amber-600 mt-1">
              Click "Save Changes" button to save your updates
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Disciplinary Violation
            {formErrors.DisciplinaryViolationId && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AlertTriangle
                size={16}
                className={
                  formErrors.DisciplinaryViolationId
                    ? "text-red-500"
                    : "text-slate-400"
                }
              />
            </div>
            <select
              name="DisciplinaryViolationId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryViolationId
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
              } bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm`}
              value={formData.DisciplinaryViolationId}
              onChange={handleChange}
              disabled={loading || fetchingData}
            >
              <option value="">Select Violation</option>
              {disciplinaryViolations.map((violation) => (
                <option key={violation.Id} value={violation.Id.toString()}>
                  {violation.Name}
                </option>
              ))}
            </select>
            {formErrors.DisciplinaryViolationId && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.DisciplinaryViolationId}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Disciplinary Action
            {formErrors.DisciplinaryActionId && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FileText
                size={16}
                className={
                  formErrors.DisciplinaryActionId
                    ? "text-red-500"
                    : "text-slate-400"
                }
              />
            </div>
            <select
              name="DisciplinaryActionId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryActionId
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
              } bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm`}
              value={formData.DisciplinaryActionId}
              onChange={handleChange}
              disabled={loading || fetchingData}
            >
              <option value="">Select Action</option>
              {disciplinaryActions.map((action) => (
                <option key={action.Id} value={action.Id.toString()}>
                  {action.Name}
                  {action.DARName ? ` (${action.DARName})` : ""}
                </option>
              ))}
            </select>
            {formErrors.DisciplinaryActionId && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.DisciplinaryActionId}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Disciplinary Action Result
            {formErrors.DisciplinaryActionResultId && (
              <span className="text-red-500 ml-1">*</span>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FileText
                size={16}
                className={
                  !formData.DisciplinaryActionId
                    ? "text-slate-300"
                    : formErrors.DisciplinaryActionResultId
                    ? "text-red-500"
                    : "text-slate-400"
                }
              />
            </div>
            {loading && formData.DisciplinaryActionId && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Loader size={16} className="animate-spin text-sky-500" />
              </div>
            )}
            <select
              name="DisciplinaryActionResultId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryActionResultId
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
              } bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm ${
                !formData.DisciplinaryActionId
                  ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                  : ""
              }`}
              value={formData.DisciplinaryActionResultId}
              onChange={handleChange}
              disabled={
                !formData.DisciplinaryActionId || loading || fetchingData
              }
            >
              <option value="">Select Action Result</option>
              {filteredActionResults.map((result) => (
                <option key={result.Id} value={result.Id.toString()}>
                  {result.Name}
                </option>
              ))}
            </select>
            {formData.DisciplinaryActionId &&
              filteredActionResults.length === 0 &&
              !loading && (
                <div className="mt-1 text-xs text-amber-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  No results found for this action
                </div>
              )}
            {formErrors.DisciplinaryActionResultId && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.DisciplinaryActionResultId}
              </p>
            )}
            {TERMINATION_RESULT_IDS.includes(
              formData.DisciplinaryActionResultId
            ) && (
              <div className="mt-2 text-xs text-indigo-600 flex items-center">
                {/* <Info size={12} className="mr-1" /> */}
                {/* <span>
                  Termination selected - Employee automatically marked as not
                  eligible for rehire
                </span> */}
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Reason
            {formErrors.Reason && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <PencilLine
                size={16}
                className={
                  formErrors.Reason ? "text-red-500" : "text-slate-400"
                }
              />
            </div>
            <textarea
              name="Reason"
              rows={3}
              className={`block w-full rounded-lg border ${
                formErrors.Reason
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
              } bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm`}
              placeholder="Enter reason..."
              value={formData.Reason}
              onChange={handleChange}
              disabled={loading || fetchingData}
            />
          </div>
          {formErrors.Reason && (
            <p className="mt-1 text-xs text-red-500">{formErrors.Reason}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Note
            <span className="text-xs text-slate-400 ml-2">(Optional)</span>
          </label>
          <div className="relative">
            <div className="absolute top-3 left-3 pointer-events-none">
              <File size={16} className="text-slate-400" />
            </div>
            <textarea
              name="Note"
              rows={3}
              className="block w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none hover:border-slate-300 shadow-sm"
              placeholder="Enter note..."
              value={formData.Note}
              onChange={handleChange}
              disabled={loading || fetchingData}
            />
          </div>
        </div>

        <div className="md:col-span-2 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Rehiring Eligibility
              </label>
              <div className="flex items-center space-x-3">
                <select
                  name="eligibilityOption"
                  value={isEligible ? "eligible" : "not-eligible"}
                  onChange={handleChange}
                  disabled={
                    loading ||
                    fetchingData ||
                    TERMINATION_RESULT_IDS.includes(
                      formData.DisciplinaryActionResultId
                    )
                  }
                  className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm transition-all 
                  focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none"
                >
                  <option value="eligible">Eligible for Rehire</option>
                  <option value="not-eligible">Not Eligible</option>
                </select>
                {TERMINATION_RESULT_IDS.includes(
                  formData.DisciplinaryActionResultId
                ) && (
                  <HelpCircle
                    size={18}
                    className="text-indigo-500"
                    title="Automatically set to Not Eligible due to termination action"
                  />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Contract End Date
                <span className="text-xs text-slate-400 ml-2">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar size={16} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  name="ContractEndDate"
                  className="block w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm transition-all
                  focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none hover:border-slate-300"
                  onChange={handleChange}
                  disabled={loading || fetchingData}
                  value={formData.ContractEndDate}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">
                Order Number
                <span className="text-xs text-slate-400 ml-2">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText size={16} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  name="OrderNumber"
                  className="block w-full rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm transition-all
                  focus:border-sky-500 focus:ring-2 focus:ring-sky-100 focus:outline-none hover:border-slate-300"
                  placeholder="Enter order number"
                  value={formData.OrderNumber}
                  onChange={handleChange}
                  disabled={loading || fetchingData}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between items-center">
        <button
          type="button"
          onClick={handleReset}
          className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
          disabled={loading || fetchingData || !unsavedChanges}
        >
          Reset
        </button>

        <div className="flex space-x-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center"
            disabled={loading || fetchingData}
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UpdateRequestForm;
