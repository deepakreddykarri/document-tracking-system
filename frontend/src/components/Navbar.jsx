import React from "react";
import { MdDescription } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed left-0 right-0 top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl md:left-64">
      <div className="mx-auto flex h-16 w-full items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 text-slate-900">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 text-white shadow-lg">
            <MdDescription className="text-xl" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">DocTrack</p>
            <p className="text-xs text-slate-500">Document Control Center</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold text-slate-800">{user?.name || "User"}</p>
            <p className="text-xs text-slate-500 capitalize">{user?.role || "employee"}</p>
          </div>
          <span className="rounded-full border border-slate-300 bg-slate-50 px-2.5 py-1 text-xs font-medium capitalize text-slate-600">
            {user?.role || "employee"}
          </span>
          <button type="button" onClick={logout} className="btn-secondary px-3 py-2">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
