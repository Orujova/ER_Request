import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardData,
  fetchReferenceData,
  toggleFilters,
  setCurrentPage,
  clearFilters,
  updateSorting,
} from "../redux/slices/dashboardSlice";
import { fetchERMembers } from "../redux/slices/erMembersSlice";

// Components
import StatusOverview from "../components/dashboard/StatusOverview";
import FiltersPanel from "../components/dashboard/FiltersPanel";
import RequestsTable from "../components/dashboard/RequestsTable";
import Pagination from "../components/common/Pagination";
import LoadingState from "../components/common/LoadingState";

// Icons
import { FilterIcon, ArrowUpDownIcon } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get state from Redux store
  const {
    requests,
    stats,
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

  // Fetch dashboard data with filters
  useEffect(() => {
    dispatch(
      fetchDashboardData({
        currentPage,
        itemsPerPage,
        orderBy,
        filters: activeFilters,
      })
    );
  }, [dispatch, currentPage, itemsPerPage, orderBy, activeFilters]);

  const handleSortChange = (e) => {
    dispatch(updateSorting(e.target.value));
  };

  const handleToggleFilters = () => {
    dispatch(toggleFilters());
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  // View details handler
  const handleViewDetails = (requestId) => {
    navigate(`/request/${requestId}`);
  };

  return (
    <div className="space-y-6 p-1 bg-gray-50 min-h-screen">
      {/* Status Overview Cards */}
      <StatusOverview stats={stats} />

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
                {/* Sort dropdown */}
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

            {/* Filters panel */}
            {showFilters && (
              <FiltersPanel onClearFilters={handleClearFilters} />
            )}

            {/* Table or loading/error states */}
            {loading ? (
              <LoadingState />
            ) : (
              <>
                <RequestsTable
                  requests={requests}
                  onViewDetails={handleViewDetails}
                />

                {/* Pagination */}
                {requests.length > 0 && (
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
    </div>
  );
};

export default Dashboard;
