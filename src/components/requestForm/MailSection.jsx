import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCCUser, removeCCUser } from "../../redux/slices/formDataSlice";
import SectionContainer from "./SectionContainer";
import AzureUsers from "../AzureUserSelector";
import MailBodyEditor from "../editor/MailBodyEditor";

/**
 * Main Mail Section Component
 */
const MailSection = () => {
  const dispatch = useDispatch();

  // Get data from Redux store
  const formData = useSelector((state) => state.formData) || {};
  const mailBody = formData.mailBody || "";
  const selectedCCUsers = formData.selectedCCUsers || [];

  // CC User handlers
  const handleSelectCCUser = (user) => {
    dispatch(addCCUser(user));
  };

  const handleRemoveCCUser = (user) => {
    dispatch(removeCCUser(user));
  };

  const infoText =
    "Siz bu bölmədə intizam pozuntusunu ətraflı şəkildə açıqlamalı və əlaqədər şəxsləri CC bölmədə təyin etməlisiniz. Bu bölmədə məktubun ünvanlanacağı müvafiq ER üzvü avtomatik təyin olunur.";

  return (
    <SectionContainer title="Mail" infoText={infoText}>
      <div className="space-y-4">
        {/* CC Users */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CC
          </label>
          <AzureUsers
            onSelect={handleSelectCCUser}
            selectedUsers={selectedCCUsers}
            onRemove={handleRemoveCCUser}
          />
        </div>

        {/* Mail Body Editor Component */}
        <MailBodyEditor initialContent={mailBody} />
      </div>
    </SectionContainer>
  );
};

export default MailSection;
