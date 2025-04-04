import React, { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  FileText,
  Calendar,
  Check,
  Loader,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  RefreshCw,
  PencilLine,
  File,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
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
}) => {
  // Default to true if null
  const [isEligible, setIsEligible] = useState(true);
  const [formData, setFormData] = useState({
    Id: parseInt(id),
    DisciplinaryActionId: "",
    DisciplinaryActionResultId: "",
    DisciplinaryViolationId: "",
    Note: "",
    Reason: "",
    IsEligible: true,
    ContractEndDate: "",
    OrderNumber: "",
  });
  const [initialFormData, setInitialFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(false);
  const [localDisciplinaryActions, setLocalDisciplinaryActions] = useState([]);
  const [showTooltip, setShowTooltip] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const TERMINATION_RESULT_IDS = ["6"]; // Example IDs - replace with actual termination-related IDs

  // Initialize form data when request changes or direct API call
  const fetchRequestDetails = async () => {
    try {
      setFetchingData(true);
      const { jwtToken } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}/api/ERRequest/${id}`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching request details: ${response.status}`);
      }

      const data = await response.json();

      // Extract the actual request data if it's nested
      const requestData = data[0]?.ERRequests?.[0] || data;

      // Handle the case where IsEligible is null
      const isEligibleValue =
        requestData.IsEligible === null
          ? true
          : Boolean(requestData.IsEligible);

      // Format the date properly (YYYY-MM-DD)
      let formattedContractEndDate = requestData.ContractEndDate || "";
      if (requestData.ContractEndDate) {
        const date = new Date(requestData.ContractEndDate);
        formattedContractEndDate = date.toISOString().split("T")[0];
      }

      const newFormData = {
        Id: parseInt(id),
        DisciplinaryActionId: requestData.DisciplinaryActionId
          ? requestData.DisciplinaryActionId.toString()
          : "",
        DisciplinaryActionResultId: requestData.DisciplinaryActionResultId
          ? requestData.DisciplinaryActionResultId.toString()
          : "",
        DisciplinaryViolationId: requestData.DisciplinaryViolationId
          ? requestData.DisciplinaryViolationId.toString()
          : "",
        Note: requestData.Note || "",
        Reason: requestData.Reason || "",
        IsEligible: isEligibleValue,
        ContractEndDate: formattedContractEndDate,
        OrderNumber: requestData.OrderNumber || "",
      };

      setFormData(newFormData);
      setInitialFormData(newFormData);
      setIsEligible(isEligibleValue);
      setFetchingData(false);

      // If the action result ID exists, we should fetch corresponding actions
      if (requestData.DisciplinaryActionResultId) {
        fetchDisciplinaryActions(
          requestData.DisciplinaryActionResultId.toString()
        );
      }
    } catch (err) {
      console.error("Error fetching request details:", err);
      setError(err.message);
      setFetchingData(false);
    }
  };

  // Use both initialize methods - API fetch and props
  useEffect(() => {
    // Direct API call for the freshest data
    fetchRequestDetails();

    // Initialize from props if available (as backup)
    if (request) {
      // Handle the case where IsEligible is null
      const isEligibleValue =
        request.isEligible === null ? true : Boolean(request.isEligible);

      const newFormData = {
        Id: parseInt(id),
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
        DisciplinaryViolationId:
          request.disciplinaryAction?.violationId ||
          request.disciplinaryViolationId
            ? (
                request.disciplinaryAction?.violationId ||
                request.disciplinaryViolationId
              ).toString()
            : "",
        Note: request.note || "",
        Reason: request.reason || "",
        IsEligible: isEligibleValue,
        ContractEndDate: request.contractEndDate || "",
        OrderNumber: request.orderNumber || "",
      };

      // Only set if we don't have initialFormData yet
      if (!initialFormData) {
        setFormData(newFormData);
        setInitialFormData(newFormData);
        setIsEligible(isEligibleValue);
      }
    }
  }, [id]);

  // Fetch disciplinary actions when action result changes
  const fetchDisciplinaryActions = async (actionResultId) => {
    if (!actionResultId) {
      setLocalDisciplinaryActions([]);
      return;
    }

    try {
      setLoading(true);
      const { jwtToken } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/GetDisciplinaryActions?DisciplinaryActionResultId=${actionResultId}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching disciplinary actions: ${response.status}`
        );
      }

      const data = await response.json();
      setLocalDisciplinaryActions(data[0]?.DisciplinaryActions || data || []);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching disciplinary actions:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // When action result changes in the form
  useEffect(() => {
    if (formData.DisciplinaryActionResultId) {
      fetchDisciplinaryActions(formData.DisciplinaryActionResultId);

      // Auto-set IsEligible to false if termination is selected
      if (
        TERMINATION_RESULT_IDS.includes(formData.DisciplinaryActionResultId)
      ) {
        setIsEligible(false);
        setFormData((prev) => ({
          ...prev,
          IsEligible: false,
        }));
      }

      // Reset disciplinary action selection when action result changes
      // Only if it's different from initial load
      if (
        initialFormData &&
        formData.DisciplinaryActionResultId !==
          initialFormData.DisciplinaryActionResultId
      ) {
        setFormData((prev) => ({
          ...prev,
          DisciplinaryActionId: "",
        }));
      }
    } else {
      setLocalDisciplinaryActions([]);
    }
  }, [formData.DisciplinaryActionResultId]);

  // Track unsaved changes
  useEffect(() => {
    if (initialFormData) {
      const hasChanges =
        initialFormData.DisciplinaryActionId !==
          formData.DisciplinaryActionId ||
        initialFormData.DisciplinaryActionResultId !==
          formData.DisciplinaryActionResultId ||
        initialFormData.DisciplinaryViolationId !==
          formData.DisciplinaryViolationId ||
        initialFormData.Note !== formData.Note ||
        initialFormData.Reason !== formData.Reason ||
        initialFormData.IsEligible !== formData.IsEligible ||
        initialFormData.ContractEndDate !== formData.ContractEndDate ||
        initialFormData.OrderNumber !== formData.OrderNumber;

      setUnsavedChanges(hasChanges);
    }
  }, [formData, initialFormData]);

  // Form validation
  const validateForm = () => {
    const errors = {};

    if (!formData.DisciplinaryViolationId) {
      errors.DisciplinaryViolationId = "Please select a violation";
    }

    if (!formData.DisciplinaryActionResultId) {
      errors.DisciplinaryActionResultId = "Please select an action result";
    }

    if (
      formData.DisciplinaryActionResultId &&
      !formData.DisciplinaryActionId &&
      localDisciplinaryActions.length > 0
    ) {
      errors.DisciplinaryActionId = "Please select an action";
    }

    if (!formData.Reason.trim()) {
      errors.Reason = "Reason is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form change
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

    // If the user is changing the action result to a termination one, auto-set eligibility to false
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

    // Clear error for this field when user makes a change
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null,
      });
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      setError("Please fix the highlighted errors before submitting.");
      return;
    }

    try {
      setLoading(true);
      const { jwtToken } = getStoredTokens();

      // Get the query parameters from the formData
      const params = new URLSearchParams();
      params.append("Id", id);
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
      params.append(
        "DisciplinaryViolationId",
        formData.DisciplinaryViolationId
          ? formData.DisciplinaryViolationId
          : "0"
      );
      params.append("Note", formData.Note || "");
      params.append("Reason", formData.Reason || "");
      params.append("IsEligible", isEligible.toString());
      params.append("ContractEndDate", formData.ContractEndDate || "");
      params.append("OrderNumber", formData.OrderNumber || "");

      // Make the PUT request
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
        // Try to get error details if available
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
      setLoading(false);
      setUnsavedChanges(false);

      // Update initial form data to match current state
      setInitialFormData({ ...formData });
    } catch (err) {
      console.error("Error updating request:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Reset form handler
  const handleReset = () => {
    if (initialFormData) {
      setFormData({ ...initialFormData });
      setIsEligible(initialFormData.IsEligible);
      setFormErrors({});
    }
  };

  // Get Action Result Name
  const getActionResultName = (resultId) => {
    if (!resultId) return "";
    const result = disciplinaryActionResults.find(
      (r) => r.Id.toString() === resultId
    );
    return result ? result.Name : "";
  };

  // If we're fetching initial data, show a loading state
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
      {/* Refresh button for direct data reload */}
      <button
        type="button"
        onClick={fetchRequestDetails}
        className="absolute top-0 right-0 p-2 text-slate-400 hover:text-sky-500 transition-colors"
        title="Refresh data from server"
      >
        <RefreshCw size={16} className={fetchingData ? "animate-spin" : ""} />
      </button>

      {/* Unsaved changes indicator */}
      {unsavedChanges && (
        <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center">
          <Info size={18} className="mr-3 flex-shrink-0" />
          <div>
            <p className="font-medium">You have unsaved changes</p>
            <p className="text-xs text-amber-600 mt-1">
              Click Save Changes button to save your updates
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
                <option key={violation.Id} value={violation.Id}>
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
                  formErrors.DisciplinaryActionResultId
                    ? "text-red-500"
                    : "text-slate-400"
                }
              />
            </div>
            <select
              name="DisciplinaryActionResultId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryActionResultId
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
              } bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm`}
              value={formData.DisciplinaryActionResultId}
              onChange={handleChange}
              disabled={loading || fetchingData}
            >
              <option value="">Select Action Result</option>
              {disciplinaryActionResults.map((result) => (
                <option key={result.Id} value={result.Id}>
                  {result.Name}
                </option>
              ))}
            </select>
            {formErrors.DisciplinaryActionResultId && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.DisciplinaryActionResultId}
              </p>
            )}

            {/* Show auto-eligibility notice when termination is selected */}
            {TERMINATION_RESULT_IDS.includes(
              formData.DisciplinaryActionResultId
            ) && (
              <div className="mt-1.5 text-xs flex items-center text-indigo-600">
                <Info size={12} className="mr-1" />
                <span>
                  Termination selected - Employee automatically marked as not
                  eligible for rehire
                </span>
              </div>
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
                  !formData.DisciplinaryActionResultId
                    ? "text-slate-300"
                    : formErrors.DisciplinaryActionId
                    ? "text-red-500"
                    : "text-slate-400"
                }
              />
            </div>
            {loading && formData.DisciplinaryActionResultId && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Loader size={16} className="animate-spin text-sky-500" />
              </div>
            )}
            <select
              name="DisciplinaryActionId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryActionId
                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                  : "border-slate-200 focus:border-sky-500 focus:ring-sky-100"
              } bg-white pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-2 focus:outline-none hover:border-slate-300 shadow-sm ${
                !formData.DisciplinaryActionResultId
                  ? "bg-slate-50 text-slate-400 cursor-not-allowed"
                  : ""
              }`}
              value={formData.DisciplinaryActionId}
              onChange={handleChange}
              disabled={
                !formData.DisciplinaryActionResultId || loading || fetchingData
              }
            >
              <option value="">Select Action</option>
              {localDisciplinaryActions.map((action) => (
                <option key={action.Id} value={action.Id}>
                  {action.Name}
                </option>
              ))}
            </select>
            {formData.DisciplinaryActionResultId &&
              localDisciplinaryActions.length === 0 &&
              !loading && (
                <div className="mt-1 text-xs text-amber-600 flex items-center">
                  <AlertCircle size={12} className="mr-1" />
                  No actions available for this result
                </div>
              )}
            {formErrors.DisciplinaryActionId && (
              <p className="mt-1 text-xs text-red-500">
                {formErrors.DisciplinaryActionId}
              </p>
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

        {/* Rehiring Eligibility Section */}
        <div className="md:col-span-2 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Rehiring Eligibility */}
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

            {/* Contract End Date */}
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

            {/* Order Number */}
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

      {/* Form Action Buttons */}
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
