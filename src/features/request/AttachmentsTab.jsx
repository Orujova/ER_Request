import React from "react";
import { Paperclip, Link2 } from "lucide-react";
import AttachmentManager from "./AttachmentManager";

const AttachmentsTab = ({
  requestId,
  presentationAttachments = [],
  actAttachments = [],
  explanationAttachments = [],
  generalAttachments = [],
  hyperLinks = [],
  onAttachmentsUpdated,
}) => {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-5">
        <Paperclip className="w-5 h-5 text-sky-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          Attachments & Links
        </h3>
      </div>

      <AttachmentManager
        requestId={requestId}
        presentationAttachments={presentationAttachments}
        actAttachments={actAttachments}
        explanationAttachments={explanationAttachments}
        generalAttachments={generalAttachments}
        hyperLinks={hyperLinks}
        onAttachmentsUpdated={onAttachmentsUpdated}
      />
    </div>
  );
};

export default AttachmentsTab;
