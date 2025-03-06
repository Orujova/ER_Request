import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileText,
  Calendar,
  Check,
  Loader,
  CheckSquare,
  XSquare,
  HelpCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import { getStoredTokens } from "../../utils/authHandler";
import { themeColors } from "../../styles/theme";
import { showToast } from "../../toast/toast";
const UpdateRequestForm = ({
  id,
  request,
  disciplinaryViolations,
  disciplinaryActionResults,
  API_BASE_URL,
  setSuccess,
  setError,
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

  // Initialize form data when request changes or direct API call
  const fetchRequestDetails = async () => {
    try {
      setFetchingData(true);
      const { token } = getStoredTokens();

      const response = await fetch(`${API_BASE_URL}/api/ERRequest/${id}`, {
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching request details: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data); // Logging to debug

      // Handle the case where IsEligible is null
      const isEligibleValue =
        data.IsEligible === null ? true : Boolean(data.IsEligible);

      // Format the date properly (YYYY-MM-DD)
      let formattedContractEndDate = data.ContractEndDate || "";
      if (data.ContractEndDate) {
        const date = new Date(data.ContractEndDate);
        formattedContractEndDate = date.toISOString().split("T")[0];
      }

      const newFormData = {
        Id: parseInt(id),
        DisciplinaryActionId: data.DisciplinaryActionId
          ? data.DisciplinaryActionId.toString()
          : "",
        DisciplinaryActionResultId: data.DisciplinaryActionResultId
          ? data.DisciplinaryActionResultId.toString()
          : "",
        DisciplinaryViolationId: data.DisciplinaryViolationId
          ? data.DisciplinaryViolationId.toString()
          : "",
        Note: data.Note || "",
        Reason: data.Reason || "",
        IsEligible: isEligibleValue,
        ContractEndDate: formattedContractEndDate,
        OrderNumber: data.OrderNumber || "",
      };

      setFormData(newFormData);
      setInitialFormData(newFormData);
      setIsEligible(isEligibleValue);
      setFetchingData(false);

      // If the action result ID exists, we should fetch corresponding actions
      if (data.DisciplinaryActionResultId) {
        fetchDisciplinaryActions(data.DisciplinaryActionResultId.toString());
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
        DisciplinaryActionId: request.disciplinaryActionId
          ? request.disciplinaryActionId.toString()
          : "",
        DisciplinaryActionResultId: request.disciplinaryActionResultId
          ? request.disciplinaryActionResultId.toString()
          : "",
        DisciplinaryViolationId: request.disciplinaryViolationId
          ? request.disciplinaryViolationId.toString()
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
      const { token } = getStoredTokens();

      const response = await fetch(
        `${API_BASE_URL}/GetDisciplinaryActions?DisciplinaryActionResultId=${actionResultId}`,
        {
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error fetching disciplinary actions: ${response.status}`
        );
      }

      const data = await response.json();
      setLocalDisciplinaryActions(data || []);
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

    if (isEligible) {
      if (!formData.ContractEndDate) {
        errors.ContractEndDate = "Contract end date is required when eligible";
      }

      if (!formData.OrderNumber.trim()) {
        errors.OrderNumber = "Order number is required when eligible";
      }
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

    setFormData({
      ...formData,
      [name]: newValue,
    });

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
      const { token } = getStoredTokens();

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

      // Log the URL and parameters for debugging
      console.log(
        "Request URL:",
        `${API_BASE_URL}/api/ERRequest/UpdateERRequest?${params.toString()}`
      );

      // Make the PUT request
      const response = await fetch(
        `${API_BASE_URL}/api/ERRequest/UpdateERRequest?${params.toString()}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            Authorization: `Bearer ${token}`,
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

  // If we're fetching initial data, show a loading state
  if (fetchingData) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader size={30} className="animate-spin text-primary mr-3" />
        <span className="text-lg text-gray-600">Loading request data...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Refresh button for direct data reload */}
      <button
        type="button"
        onClick={fetchRequestDetails}
        className="absolute top-0 right-0 p-2 text-gray-500 hover:text-primary"
        title="Refresh data from server"
      >
        <RefreshCw size={16} className={fetchingData ? "animate-spin" : ""} />
      </button>

      {/* Unsaved changes indicator */}
      {unsavedChanges && (
        <div className="mb-4 p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center">
          <Info size={16} className="mr-2 flex-shrink-0" />
          You have unsaved changes
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-textLight mb-2">
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
                    : "text-textLight"
                }
              />
            </div>
            <select
              name="DisciplinaryViolationId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryViolationId
                  ? "border-red-300 focus:border-red-500"
                  : "border-border focus:border-primary"
              } bg-background pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
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
          <label className="block text-sm font-medium text-textLight mb-2">
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
                    : "text-textLight"
                }
              />
            </div>
            <select
              name="DisciplinaryActionResultId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryActionResultId
                  ? "border-red-300 focus:border-red-500"
                  : "border-border focus:border-primary"
              } bg-background pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
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
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-textLight mb-2">
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
                    ? "text-gray-300"
                    : formErrors.DisciplinaryActionId
                    ? "text-red-500"
                    : "text-textLight"
                }
              />
            </div>
            {loading && formData.DisciplinaryActionResultId && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Loader size={16} className="animate-spin text-primary" />
              </div>
            )}
            <select
              name="DisciplinaryActionId"
              className={`block w-full rounded-lg border ${
                formErrors.DisciplinaryActionId
                  ? "border-red-300 focus:border-red-500"
                  : "border-border focus:border-primary"
              } bg-background pl-10 pr-4 py-3 text-sm transition-all
              focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm ${
                !formData.DisciplinaryActionResultId
                  ? "bg-secondaryDark text-gray-400 cursor-not-allowed"
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
                <div className="mt-1 text-xs text-warning">
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
          <label className="block text-sm font-medium text-textLight mb-2">
            Reason
            {formErrors.Reason && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            name="Reason"
            rows={3}
            className={`block w-full rounded-lg border ${
              formErrors.Reason
                ? "border-red-300 focus:border-red-500"
                : "border-border focus:border-primary"
            } bg-background px-4 py-3 text-sm transition-all
            focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
            placeholder="Enter reason..."
            value={formData.Reason}
            onChange={handleChange}
            disabled={loading || fetchingData}
          />
          {formErrors.Reason && (
            <p className="mt-1 text-xs text-red-500">{formErrors.Reason}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-textLight mb-2">
            Note
            <span className="text-xs text-gray-500 ml-2">(Optional)</span>
          </label>
          <textarea
            name="Note"
            rows={3}
            className="block w-full rounded-lg border border-border bg-background px-4 py-3 text-sm transition-all
            focus:border-primary focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm"
            placeholder="Enter note..."
            value={formData.Note}
            onChange={handleChange}
            disabled={loading || fetchingData}
          />
        </div>

        {/* Eligibility Radio Buttons */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-textLight mb-3">
            Eligibility Status
          </label>
          <div className="flex gap-6">
            <div className="flex items-center">
              <input
                id="eligibleOption"
                name="eligibilityOption"
                type="radio"
                value="eligible"
                className="h-4 w-4 text-primary focus:ring-0 focus:outline-none border-border"
                checked={isEligible}
                onChange={handleChange}
                required
                disabled={loading || fetchingData}
              />
              <label
                htmlFor="eligibleOption"
                className="ml-2 block text-sm text-text"
              >
                <span className="flex items-center">
                  <CheckSquare size={16} className="mr-1 text-success" />
                  Eligible
                </span>
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="notEligibleOption"
                name="eligibilityOption"
                type="radio"
                value="notEligible"
                className="h-4 w-4 text-error focus:ring-0 focus:outline-none border-border"
                checked={!isEligible}
                onChange={handleChange}
                required
                disabled={loading || fetchingData}
              />
              <label
                htmlFor="notEligibleOption"
                className="ml-2 block text-sm text-text"
              >
                <span className="flex items-center">
                  <XSquare size={16} className="mr-1 text-error" />
                  Not Eligible
                </span>
              </label>
            </div>
            <div className="relative ml-1">
              <HelpCircle
                size={16}
                className="text-textLight cursor-pointer"
                onMouseEnter={() => setShowTooltip("eligibility")}
                onMouseLeave={() => setShowTooltip("")}
              />
              {showTooltip === "eligibility" && (
                <div className="absolute z-10 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg -mt-2 left-6">
                  When marked as eligible, contract end date and order number
                  are required. If not eligible, these fields are not needed.
                </div>
              )}
            </div>
          </div>
        </div>

        {isEligible && (
          <>
            <div>
              <label className="block text-sm font-medium text-textLight mb-2">
                Contract End Date
                {formErrors.ContractEndDate && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Calendar
                    size={16}
                    className={
                      formErrors.ContractEndDate
                        ? "text-red-500"
                        : "text-textLight"
                    }
                  />
                </div>
                <input
                  type="date"
                  name="ContractEndDate"
                  className={`block w-full rounded-lg border ${
                    formErrors.ContractEndDate
                      ? "border-red-300 focus:border-red-500"
                      : "border-border focus:border-primary"
                  } bg-background pl-10 pr-4 py-3 text-sm transition-all
                  focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
                  value={formData.ContractEndDate}
                  onChange={handleChange}
                  required={isEligible}
                  disabled={loading || fetchingData}
                />
                {formErrors.ContractEndDate && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.ContractEndDate}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-textLight mb-2">
                Order Number
                {formErrors.OrderNumber && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FileText
                    size={16}
                    className={
                      formErrors.OrderNumber ? "text-red-500" : "text-textLight"
                    }
                  />
                </div>
                <input
                  type="text"
                  name="OrderNumber"
                  className={`block w-full rounded-lg border ${
                    formErrors.OrderNumber
                      ? "border-red-300 focus:border-red-500"
                      : "border-border focus:border-primary"
                  } bg-background pl-10 pr-4 py-3 text-sm transition-all
                  focus:ring-0 focus:outline-none hover:border-borderHover shadow-sm`}
                  placeholder="Enter order number..."
                  value={formData.OrderNumber}
                  onChange={handleChange}
                  required={isEligible}
                  disabled={loading || fetchingData}
                />
                {formErrors.OrderNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {formErrors.OrderNumber}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        {unsavedChanges && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 shadow-sm"
            onClick={handleReset}
            disabled={loading || fetchingData}
          >
            Reset
          </button>
        )}

        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-medium text-white shadow-sm hover:shadow-md transition-all disabled:opacity-70"
          style={{
            background:
              loading || fetchingData
                ? "#CBD5E1"
                : `linear-gradient(to right, ${themeColors.primaryGradientStart}, ${themeColors.primaryGradientEnd})`,
          }}
          disabled={loading || fetchingData}
        >
          {loading ? (
            <>
              <Loader size={18} className="animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Check size={18} className="mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default UpdateRequestForm;
