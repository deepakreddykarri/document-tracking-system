import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";
import api, { getServerBaseUrl } from "../services/api";
import { getSocket } from "../services/socket";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const DocumentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [document, setDocument] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [remarks, setRemarks] = useState("");
  const [newFile, setNewFile] = useState(null);

  const [action, setAction] = useState("Approve");
  const [assignedTo, setAssignedTo] = useState("");
  const [targetDepartment, setTargetDepartment] = useState("");

  const [loadingDocument, setLoadingDocument] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingMetadata, setSavingMetadata] = useState(false);
  const [submittingWorkflow, setSubmittingWorkflow] = useState(false);

  const isAssignedToMe = useMemo(() => {
    if (!document?.workflow?.assignedTo || !user?._id) return false;
    const assignedId =
      typeof document.workflow.assignedTo === "string"
        ? document.workflow.assignedTo
        : document.workflow.assignedTo._id;
    return assignedId?.toString() === user._id?.toString();
  }, [document, user]);

  const isUploader = useMemo(() => {
    if (!document?.uploadedBy || !user?._id) return false;
    const uploaderId =
      typeof document.uploadedBy === "string"
        ? document.uploadedBy
        : document.uploadedBy._id;
    return uploaderId?.toString() === user._id?.toString();
  }, [document, user]);

  const canManageWorkflow = user?.role === "admin" || user?.role === "manager" || isAssignedToMe;
  const canAccessActions = canManageWorkflow && !isUploader;
  const canEditMetadata = canAccessActions;

  const assigneeDisplay = useMemo(() => {
    const assignee = document?.workflow?.assignedTo;

    if (!assignee) {
      return "Unassigned";
    }

    return `${assignee.name} (${assignee.role})`;
  }, [document?.workflow?.assignedTo]);

  const fetchDocument = useCallback(async () => {
    setLoadingDocument(true);

    try {
      const response = await api.get(`/documents/${id}`);
      const data = response.data;

      setDocument(data);
      setTitle(data.title || "");
      setDescription(data.description || "");
      setDepartment(data.department || "");
      setRemarks(data.remarks || "");

      const assignedValue = data.workflow?.assignedTo;
      setAssignedTo(
        assignedValue
          ? typeof assignedValue === "string"
            ? assignedValue
            : assignedValue._id
          : ""
      );
      const assignedDepartment =
        typeof assignedValue === "object" && assignedValue?.department
          ? assignedValue.department
          : "";
      setTargetDepartment(assignedDepartment || data.department || "");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch document";
      toast.error(message);
    } finally {
      setLoadingDocument(false);
    }
  }, [id]);

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);

    try {
      const response = await api.get(`/documents/${id}/logs`);
      setLogs(response.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch document logs";
      toast.error(message);
    } finally {
      setLoadingLogs(false);
    }
  }, [id]);

  const fetchAssignableUsers = useCallback(async () => {
    if (!canManageWorkflow) {
      return;
    }

    setLoadingUsers(true);

    try {
      const response = await api.get("/users/assignable");
      setUsers(response.data || []);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to fetch users";
      toast.error(message);
    } finally {
      setLoadingUsers(false);
    }
  }, [canManageWorkflow]);

  useEffect(() => {
    fetchDocument();
    fetchLogs();
    fetchAssignableUsers();
  }, [fetchAssignableUsers, fetchDocument, fetchLogs]);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socket = getSocket(token);

    if (!socket) {
      return undefined;
    }

    socket.emit("document:subscribe", id);

    const handleDocumentUpdated = (payload) => {
      if (payload?.documentId !== id) {
        return;
      }

      fetchDocument();
      fetchLogs();
    };

    socket.on("document:updated", handleDocumentUpdated);

    return () => {
      socket.emit("document:unsubscribe", id);
      socket.off("document:updated", handleDocumentUpdated);
    };
  }, [fetchDocument, fetchLogs, id, token]);

  const handleMetadataUpdate = async (event) => {
    event.preventDefault();
    setSavingMetadata(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("remarks", remarks);
      if ((user?.role === "admin" || user?.role === "manager") && department) {
        formData.append("department", department);
      }
      if (newFile) {
        formData.append("file", newFile);
      }

      await api.put(`/documents/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setNewFile(null);
      toast.success("Document details updated");
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update document details";
      toast.error(message);
    } finally {
      setSavingMetadata(false);
    }
  };

  const handleWorkflowSubmit = async (event) => {
    event.preventDefault();
    setSubmittingWorkflow(true);

    try {
      await api.put(`/workflow/${id}`, {
        action,
        assignedTo: action === "Forward" ? (assignedTo || null) : null,
        remarks,
        targetDepartment: action === "Forward" ? targetDepartment : undefined,
      });

      toast.success(`Document ${action.toLowerCase()}d successfully`);
      await Promise.all([fetchDocument(), fetchLogs()]);
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to update workflow";
      toast.error(message);
    } finally {
      setSubmittingWorkflow(false);
    }
  };

  if (loadingDocument) {
    return (
      <div className="min-h-full p-6">
        <div className="mx-auto mt-20 h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-full p-6 text-sm text-slate-500">
        Unable to load document details.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1100px] page-enter">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="mb-4 cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-800"
      >
        {"<- Back to Dashboard"}
      </button>

      <div className="glass-panel p-6 md:p-7">
        <h1 className="mb-4 text-2xl font-bold text-slate-900">{document.title}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="mb-1 text-xs text-slate-500">Department</p>
            <p className="text-sm font-medium text-slate-700">{document.department || "-"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Status</p>
            <StatusBadge status={document.workflow?.currentStage || document.status || "Submitted"} />
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Assigned To</p>
            <p className="text-sm font-medium text-slate-700">{assigneeDisplay}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Uploaded By</p>
            <p className="text-sm font-medium text-slate-700">{document.uploadedBy?.name || "-"}</p>
          </div>
          <div>
            <p className="mb-1 text-xs text-slate-500">Date</p>
            <p className="text-sm font-medium text-slate-700">{formatDate(document.createdAt)}</p>
          </div>
        </div>

        {document.fileUrl && (
          <div>
            <p className="mb-1 text-xs text-slate-500">File</p>
            <a
              href={`${getServerBaseUrl()}${document.fileUrl}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-slate-700 underline decoration-slate-300"
            >
              View File
            </a>
          </div>
        )}
      </div>

      {canEditMetadata && (
        <form
          onSubmit={handleMetadataUpdate}
          className="glass-panel mt-6 p-6 md:p-7"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Update Document Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="input-soft"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
              <select
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
                disabled={!(user?.role === "admin" || user?.role === "manager")}
                className="input-soft disabled:opacity-70"
              >
                <option value="">Select Department</option>
                {DEPARTMENT_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="input-soft resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Remarks</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              className="input-soft resize-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Update Document File (Optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(event) => setNewFile(event.target.files?.[0] || null)}
              className="input-soft"
            />
            {newFile && <p className="mt-1 text-xs text-slate-600">Replacing with: {newFile.name}</p>}
          </div>

          <button type="submit" disabled={savingMetadata} className="btn-primary mt-4 px-5">
            {savingMetadata ? "Saving..." : "Save Details"}
          </button>
        </form>
      )}

      {canAccessActions && (
        <form
          onSubmit={handleWorkflowSubmit}
          className="glass-panel mt-6 p-6 md:p-7"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Workflow Action</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Action</label>
              <select
                value={action}
                onChange={(event) => setAction(event.target.value)}
                className="input-soft"
              >
                <option value="Approve">Approve</option>
                <option value="Reject">Reject</option>
                <option value="Forward">Forward</option>
              </select>
            </div>

            {action === "Forward" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Assign To</label>
                <select
                  value={assignedTo}
                  onChange={(event) => {
                    const val = event.target.value;
                    setAssignedTo(val);

                    const selectedUser = users.find((item) => item._id === val);
                    setTargetDepartment(selectedUser?.department || "");
                  }}
                  className="input-soft"
                  required
                >
                  <option value="">Select Assignee</option>
                  {users.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.role}){item.department ? ` - ${item.department}` : ""}
                    </option>
                  ))}
                </select>
                {loadingUsers && (
                  <div className="mt-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                  </div>
                )}
              </div>
            )}

            {action === "Forward" && (
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Target Department</label>
                <input
                  type="text"
                  value={targetDepartment}
                  readOnly
                  placeholder="Select assignee first"
                  className="input-soft cursor-not-allowed bg-slate-100"
                  required
                />
              </div>
            )}
          </div>

          <button type="submit" disabled={submittingWorkflow} className="btn-primary mt-4 px-5">
            {submittingWorkflow ? "Submitting..." : `Submit ${action}`}
          </button>
        </form>
      )}

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Document History</h2>
        <div className="table-shell">
          {loadingLogs ? (
            <div className="py-10">
              <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            </div>
          ) : logs.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No history available</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Updated By</th>
                  <th className="px-4 py-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td className="px-4 py-3 font-semibold text-slate-800">{log.action}</td>
                    <td className="px-4 py-3">{log.updatedBy?.name || "-"}</td>
                    <td className="px-4 py-3">{formatDate(log.timestamp)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
};

export default DocumentDetail;
