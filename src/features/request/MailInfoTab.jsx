import React from "react";
import { MailOpen, Mail } from "lucide-react";

const EmailPill = ({ email }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
    {email.trim()}
  </span>
);

const EmailSection = ({ title, emails }) => {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
        <div className="font-medium text-slate-800">{title}</div>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2">
          {emails ? (
            emails
              .split(";")
              .map((email, idx) => (
                <EmailPill
                  key={`${title.toLowerCase()}-${idx}`}
                  email={email}
                />
              ))
          ) : (
            <span className="text-slate-500">
              No {title.toLowerCase()} recipients
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const MailInfoTab = ({ request }) => {
  if (!request || !request.mailInfo) return null;

  const { mailInfo } = request;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2 mb-5">
        <MailOpen className="w-5 h-5 text-sky-600" />
        <h3 className="text-lg font-semibold text-slate-900">
          Mail Information
        </h3>
      </div>

      <div className="space-y-6">
        {/* To Recipients */}
        <EmailSection title="To" emails={mailInfo.to} />

        {/* CC Recipients */}
        <EmailSection title="CC" emails={mailInfo.cc} />

        {/* Email Content */}
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
            <div className="font-medium text-slate-800">Email Content</div>
          </div>
          <div className="p-4">
            {mailInfo.body ? (
              <div className="p-4 rounded bg-slate-50 whitespace-pre-wrap border border-slate-200 text-slate-700">
                {mailInfo.body}
              </div>
            ) : (
              <span className="text-slate-500">No email content</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MailInfoTab;
