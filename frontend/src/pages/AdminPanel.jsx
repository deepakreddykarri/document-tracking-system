import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { resetAdminFilters, setAdminFilters } from "../store/documentFiltersSlice";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("documents");
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [userEdits, setUserEdits] = useState({});
  const [savingUserId, setSavingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");
  const [loadingDocuments, setLoadingDocuments] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.documentFilters.admin);
  const { token } = useAuth();
  const navigate = useNavigate();

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set("search", filters.search);
    }

    if (filters.status) {
      params.set("status", filters.status);
    }

    if (filters.department) {
      params.set("department", filters.department);
    }

    return params.toString();
  }, [filters.department, filters.search, filters.status]);

  const fetchDocuments = useCallback(
    async (showLoader = true) => {
      if (showLoader) {
        setLoadingDocuments(true);
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
          setLoadingDocuments(false);
        }
      }
    },
    [queryString]
  );

  const fetchUsers = async () => {
    setLoadingUsers(true);

    try {
      const response = await api.get("/users");
      const userData = response.data || [];
      setUsers(userData);
      setUserEdits(
        userData.reduce((acc, user) => {
          acc[user._id] = {
            role: user.role,
            department: user.department || "",
          };
          return acc;
        }, {})
      );
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments();
    } else {
      fetchUsers();
    }
  }, [activeTab, fetchDocuments]);

  useEffect(() => {
    if (!token || activeTab !== "documents") {
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
  }, [activeTab, fetchDocuments, token]);

  const handleUserFieldChange = (userId, key, value) => {
    setUserEdits((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        [key]: value,
      },
    }));
  };

  const handleSaveUser = async (userId) => {
    const payload = userEdits[userId];

    if (!payload) {
      return;
    }

    setSavingUserId(userId);

    try {
      await api.put(`/users/${userId}`, {
        role: payload.role,
        department: payload.department,
      });
      toast.success("User updated successfully");
      await fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update user";
      toast.error(message);
    } finally {
      setSavingUserId("");
    }
  };

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);

    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted successfully");
      await fetchUsers();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to delete user";
      toast.error(message);
    } finally {
      setDeletingUserId("");
    }
  };

  const roleClassName = (role) => {
    if (role === "admin") {
      return "rounded-full border border-slate-700 bg-slate-900 px-2 py-0.5 text-xs text-white";
    }

    if (role === "manager") {
      return "rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs text-blue-700";
    }

    return "rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-600";
  };

  return (
    <div className="mx-auto max-w-[1250px] page-enter">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">Admin Panel</h1>
      <p className="mb-6 text-sm text-slate-500">Manage all documents, roles, and departments.</p>

      <div className="mb-6 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveTab("documents")}
          className={
            activeTab === "documents"
              ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              : "cursor-pointer rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }
        >
          Documents
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("users")}
          className={
            activeTab === "users"
              ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              : "cursor-pointer rounded-lg px-4 py-2 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          }
        >
          Users
        </button>
      </div>

      {activeTab === "documents" ? (
        <div>
          <div className="glass-panel mb-4 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input
                type="text"
                value={filters.search}
                placeholder="Search title/description"
                onChange={(event) =>
                  dispatch(
                    setAdminFilters({
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
                    setAdminFilters({
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
                onChange={(event) =>
                  dispatch(
                    setAdminFilters({
                      department: event.target.value,
                    })
                  )
                }
                className="input-soft"
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
                onClick={() => dispatch(resetAdminFilters())}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="table-shell">
            {loadingDocuments ? (
              <div className="py-10">
                <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
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
      ) : (
        <div className="table-shell">
          {loadingUsers ? (
            <div className="py-10">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{item.name}</td>
                    <td className="px-4 py-3">{item.username}</td>
                    <td className="px-4 py-3">{item.email}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={roleClassName(userEdits[item._id]?.role || item.role)}>
                          {userEdits[item._id]?.role || item.role}
                        </span>
                        <select
                          value={userEdits[item._id]?.role || item.role}
                          onChange={(event) =>
                            handleUserFieldChange(item._id, "role", event.target.value)
                          }
                          className="input-soft px-2 py-1 text-xs"
                        >
                          <option value="employee">employee</option>
                          <option value="manager">manager</option>
                          <option value="admin">admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={userEdits[item._id]?.department || ""}
                        onChange={(event) =>
                          handleUserFieldChange(item._id, "department", event.target.value)
                        }
                        className="input-soft w-full px-2 py-1 text-xs"
                      >
                        <option value="">Select Department</option>
                        {DEPARTMENT_OPTIONS.map((department) => (
                          <option key={department} value={department}>
                            {department}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveUser(item._id)}
                          disabled={savingUserId === item._id}
                          className="btn-primary px-3 py-1.5 text-xs"
                        >
                          {savingUserId === item._id ? "Saving" : "Save"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(item._id)}
                          disabled={deletingUserId === item._id}
                          className="rounded-xl border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-70"
                        >
                          {deletingUserId === item._id ? "Deleting" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
