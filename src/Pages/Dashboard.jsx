import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardData,
  fetchReferenceData,
  toggleFilters,
  setCurrentPage,
  clearFilters,
  updateSorting,
  fetchTotalStats,
} from "../redux/slices/dashboardSlice";
import { fetchERMembers } from "../redux/slices/erMembersSlice";

// Components
import StatusOverview from "../components/dashboard/StatusOverview";
import FiltersPanel from "../components/dashboard/FiltersPanel";
import RequestsTable from "../components/dashboard/RequestsTable";
import Pagination from "../components/common/Pagination";
import LoadingState from "../components/common/LoadingState";
import ExportColumnsModal from "../components/dashboard/ExportColumnsModal ";

// Icons
import { FilterIcon, ArrowUpDownIcon, Download } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Add state for export modal
  const [showExportModal, setShowExportModal] = useState(false);
  // Add state to track if filters have been applied
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Get state from Redux store
  const {
    requests,
    stats,
    totalStats,
    totalStatsLoading,
    loading,
    error,
    currentPage,
    itemsPerPage,
    totalItems,
    orderBy,
    showFilters,
    activeFilters,
  } = useSelector((state) => state.dashboard);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchReferenceData());
    dispatch(fetchERMembers());
  }, [dispatch]);

  // Fetch dashboard data with filters and pagination
  useEffect(() => {
    dispatch(
      fetchDashboardData({
        currentPage,
        itemsPerPage,
        orderBy,
        filters: activeFilters,
      })
    );

    // If this request was triggered by a filter change, set filtersApplied flag
    if (currentPage === 1) {
      setFiltersApplied(true);
    }
  }, [dispatch, currentPage, itemsPerPage, orderBy, activeFilters]);

  // Fetch total stats when filters change but not when pagination changes
  useEffect(() => {
    // Always fetch total stats when filters or sorting changes
    dispatch(fetchTotalStats());
  }, [dispatch, activeFilters, orderBy]); // Don't include currentPage or itemsPerPage

  const handleSortChange = (e) => {
    dispatch(updateSorting(e.target.value));
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setFiltersApplied(false);
  };

  // Apply filters from FiltersPanel
  const handleApplyFilters = () => {
    setFiltersApplied(true);
    // No need to dispatch any actions here as the filter values are already in Redux
    // and will trigger the useEffect for fetching data automatically
  };

  // View details handler
  const handleViewDetails = (requestId) => {
    navigate(`/request/${requestId}`);
  };

  // Export handler
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Choose which stats to display - always use totalStats when filters are applied
  const displayStats = totalStatsLoading
    ? stats // Use page stats while total stats are loading
    : filtersApplied
    ? totalStats
    : stats; // Use totalStats if filters are applied, else use page stats

  return (
    <div className="space-y-6 p-1 bg-gray-50 min-h-screen">
      {/* Status Overview Cards - Pass the loading state */}
      <StatusOverview stats={displayStats} isLoading={totalStatsLoading} />

      {/* Main Dashboard Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Header with search and filters */}
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Employee Reviews Dashboard
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Track and manage employee reviews
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Export button */}
                <button
                  onClick={handleExport}
                  className="inline-flex items-center justify-center px-4 py-2 border hover:bg-[#f5fcfd] border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white focus:outline-none focus:ring-0"
                >
                  <Download className="h-4 w-4 text-gray-500 mr-2" />
                  Export
                </button>

                {/* Sort dropdown - Add duration sorting options */}
                <div className="relative">
                  <select
                    value={orderBy}
                    onChange={handleSortChange}
                    className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md text-sm
                      focus:outline-none focus:ring-1 focus:ring-[#0D9BBF] focus:border-[#0D9BBF] appearance-none"
                  >
                    <option value="createddate_desc">Date (Newest)</option>
                    <option value="createddate">Date (Oldest)</option>
                    <option value="ermember">ER Member (A-Z)</option>
                    <option value="ermember_desc">ER Member (Z-A)</option>
                    {/* Add new duration sorting options */}
                    <option value="duration">Duration (Shortest)</option>
                    <option value="duration_desc">Duration (Longest)</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <ArrowUpDownIcon className="h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Filter button */}
                <button
                  onClick={handleToggleFilters}
                  className="inline-flex items-center justify-center px-4 py-2 border hover:bg-[#f5fcfd] border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white focus:outline-none focus:ring-0"
                >
                  <FilterIcon className="h-4 w-4 text-gray-500 mr-2" />
                  {showFilters ? "Hide Filters" : "Show Filters"}
                </button>
              </div>
            </div>

            {/* Filters panel - Add onApply prop */}
            {showFilters ? (
              <FiltersPanel
                key={`filters-panel-${showFilters}`}
                onClearFilters={handleClearFilters}
                onApply={handleApplyFilters}
              />
            ) : null}

            {/* Table or loading/error states */}
            {loading ? (
              <LoadingState />
            ) : error ? (
              <div className="text-center py-6 text-red-500">
                Error loading data: {error}
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No requests found matching your filters
              </div>
            ) : (
              <>
                <RequestsTable
                  requests={requests}
                  onViewDetails={handleViewDetails}
                />

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                  <Pagination
                    currentPage={currentPage}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => dispatch(setCurrentPage(page))}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Export Columns Modal */}
      <ExportColumnsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        activeFilters={activeFilters}
      />
    </div>
  );
};

export default Dashboard;
