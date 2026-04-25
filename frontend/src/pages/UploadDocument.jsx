import React, { useState } from "react";
import { MdUploadFile } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const UploadDocument = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("department", department);
      formData.append("file", file);

      await api.post("/documents", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Document uploaded successfully");
      navigate("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Upload failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl page-enter">
      <div className="stagger-1 mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Upload Document</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add document details and assign a department to start workflow tracking.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-panel stagger-2 max-w-3xl p-6 md:p-8"
      >
        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title</label>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="input-soft"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="input-soft resize-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="input-soft"
              required
            >
              <option value="">Select Department</option>
              {DEPARTMENT_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">File</label>
            <label
              htmlFor="file-upload"
              className="block cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/50 p-7 text-center transition hover:border-blue-400 hover:bg-white"
            >
              <MdUploadFile className="mx-auto mb-2 text-4xl text-blue-700" />
              <p className="text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
              <p className="mt-1 text-xs text-slate-500">PDF, DOC, DOCX, PNG, JPG (max 5MB)</p>
              {file && <p className="mt-3 text-sm font-medium text-slate-800">{file.name}</p>}
            </label>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5">
            {loading ? "Loading..." : "Submit"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="btn-secondary px-6 py-2.5"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;
