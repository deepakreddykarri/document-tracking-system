import React from "react";

const statusClasses = {
  Submitted: "border border-slate-300 bg-slate-100 text-slate-700",
  "Under Review": "border border-amber-300 bg-amber-50 text-amber-700",
  Approved: "border border-emerald-300 bg-emerald-50 text-emerald-700",
  Rejected: "border border-rose-300 bg-rose-50 text-rose-700",
};

const StatusBadge = ({ status }) => {
  const className = statusClasses[status] || statusClasses.Submitted;

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {status || "Submitted"}
    </span>
  );
};

export default StatusBadge;
