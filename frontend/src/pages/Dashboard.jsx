import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MdInbox } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { resetDashboardFilters, setDashboardFilters } from "../store/documentFiltersSlice";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.documentFilters.dashboard);
  const { user, token } = useAuth();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.department && user?.role !== "manager") {
      params.set("department", filters.department);
    }

    return params.toString();
  }, [filters.department, filters.search, filters.status, user?.role]);

  useEffect(() => {
    if (user?.role === "manager") {
      dispatch(resetDashboardFilters());
    }
  }, [dispatch, user?.role]);

  const fetchDocuments = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const endpoint = queryString ? `/documents?${queryString}` : "/documents";
        const response = await api.get(endpoint);
        setDocuments(response.data || []);
      } catch (error) {
        const message = error?.response?.data?.message || "Failed to fetch documents";
        toast.error(message);
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [queryString]
  );

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = getSocket(token);

    if (!socket) {
      return undefined;
    }

    const handleDocumentsUpdated = () => {
      fetchDocuments(false);
    };

    socket.on("documents:updated", handleDocumentsUpdated);

    return () => {
      socket.off("documents:updated", handleDocumentsUpdated);
    };
  }, [fetchDocuments, token]);

  const titleMap = {
    employee: "My Documents",
    manager: "Pending Reviews",
    admin: "All Documents",
  };

  const title = titleMap[user?.role] || "Documents";

  return (
    <div className="mx-auto max-w-[1200px] page-enter">
      <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">Monitor status and move documents quickly.</p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/upload")}
          className="btn-primary px-5"
        >
          Upload Document
        </button>
      </div>

      <div className="glass-panel mb-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            value={filters.search}
            placeholder="Search title/description"
            onChange={(event) =>
              dispatch(
                setDashboardFilters({
                  search: event.target.value,
                })
              )
            }
            className="input-soft"
          />

          <select
            value={filters.status}
            onChange={(event) =>
              dispatch(
                setDashboardFilters({
                  status: event.target.value,
                })
              )
            }
            className="input-soft"
          >
            <option value="">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <select
            value={filters.department}
            disabled={user?.role === "manager"}
            onChange={(event) =>
              dispatch(
                setDashboardFilters({
                  department: event.target.value,
                })
              )
            }
            className="input-soft disabled:opacity-70"
          >
            <option value="">All Departments</option>
            {DEPARTMENT_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => dispatch(resetDashboardFilters())}
            className="btn-secondary"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="table-shell">
        {loading ? (
          <div className="py-10">
            <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          </div>
        ) : documents.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-sm text-slate-500">
            <MdInbox className="mb-2 text-4xl text-slate-400" />
            <span>No documents found</span>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Uploaded By</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document._id}>
                  <td className="px-4 py-3 font-semibold text-slate-800">{document.title}</td>
                  <td className="px-4 py-3">{document.department || "-"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={document.workflow?.currentStage || document.status || "Submitted"}
                    />
                  </td>
                  <td className="px-4 py-3">{document.uploadedBy?.name || "-"}</td>
                  <td className="px-4 py-3">{formatDate(document.createdAt)}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/documents/${document._id}`)}
                      className="text-sm font-semibold text-slate-700 underline decoration-slate-300 hover:text-slate-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
