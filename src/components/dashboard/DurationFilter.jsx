import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateFilterValue } from "../../redux/slices/dashboardSlice";

const DurationFilter = () => {
  const dispatch = useDispatch();
  const { activeFilters } = useSelector((state) => state.dashboard);

  const handleMinDurationChange = (e) => {
    dispatch(
      updateFilterValue({
        key: "durationMin",
        value: e.target.value,
      })
    );
  };

  const handleMaxDurationChange = (e) => {
    dispatch(
      updateFilterValue({
        key: "durationMax",
        value: e.target.value,
      })
    );
  };

  return (
    <div>
      <label
        htmlFor="durationFilter"
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        Duration (Days)
      </label>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          id="durationMin"
          min="0"
          placeholder="Min days"
          className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
          value={activeFilters.durationMin}
          onChange={handleMinDurationChange}
        />
        <input
          type="number"
          id="durationMax"
          min="0"
          placeholder="Max days"
          className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#06b6d4] focus:border-[#06b6d4]"
          value={activeFilters.durationMax}
          onChange={handleMaxDurationChange}
        />
      </div>
    </div>
  );
};

export default DurationFilter;
