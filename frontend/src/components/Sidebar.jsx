import React from "react";
import { MdAdminPanelSettings, MdDashboard, MdUploadFile } from "react-icons/md";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { user } = useAuth();

  const links = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: MdDashboard,
      show: true,
    },
    {
      to: "/upload",
      label: "Upload Document",
      icon: MdUploadFile,
      show: true,
    },
    {
      to: "/admin",
      label: "Admin Panel",
      icon: MdAdminPanelSettings,
      show: user?.role === "admin",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r border-slate-200 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 px-3 pt-20 text-white md:block">
      <div className="mb-5 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs text-slate-200/90">
        Navigation
      </div>
      <nav className="space-y-2">
        {links
          .filter((link) => link.show)
          .map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  [
                    "group mx-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-white text-slate-900 shadow-[0_6px_18px_rgba(15,23,42,0.18)]"
                      : "text-slate-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon className="text-lg" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;
