import React from "react";
import { MdApproval, MdDescription, MdManageHistory, MdSecurity } from "react-icons/md";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "Track Every Document",
    description:
      "Monitor document lifecycle from submission to final decision with complete visibility.",
    icon: MdDescription,
  },
  {
    title: "Structured Workflow",
    description:
      "Route documents through review stages with clear ownership and accountability.",
    icon: MdApproval,
  },
  {
    title: "Audit-Ready History",
    description:
      "Maintain action logs for forwards, approvals, and rejections for compliance reporting.",
    icon: MdManageHistory,
  },
  {
    title: "Secure Access",
    description:
      "Role-based access ensures employees, managers, and admins see only what they should.",
    icon: MdSecurity,
  },
];

const Landing = () => {
  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-14 pt-10 text-slate-900 md:px-8 md:pt-16">
      <div className="pointer-events-none absolute -left-24 top-10 h-80 w-80 rounded-full bg-blue-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-72 w-72 rounded-full bg-indigo-300/25 blur-3xl" />

      <section className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className="stagger-1">
            <span className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-600">
              Document Tracking System
            </span>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
              Paperwork that moves
              <span className="block bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-transparent">
                as fast as your team.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-slate-600 md:text-lg">
              Centralize document operations with role-based workflows, real-time status updates,
              and complete movement history across departments.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="btn-primary px-6 py-3 text-center">
                Login
              </Link>
              <Link to="/register" className="btn-secondary px-6 py-3 text-center">
                Create Account
              </Link>
            </div>
          </div>

          <div className="stagger-2 glass-panel bg-gradient-to-br from-white/90 via-blue-50/70 to-indigo-50/65 p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700">Workspace Snapshot</p>
              <span className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-500">
                live
              </span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {featureCards.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="card-muted group p-4 transition hover:-translate-y-0.5 hover:bg-white"
                  >
                    <Icon className="mb-2 text-2xl text-blue-700 transition group-hover:scale-105" />
                    <h2 className="text-sm font-semibold text-slate-900">{feature.title}</h2>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">{feature.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
