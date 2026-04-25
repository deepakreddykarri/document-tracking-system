import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { DEPARTMENT_OPTIONS } from "../constants/departments";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "employee",
    department: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/register", formData);
      toast.success("Account created successfully");
      navigate("/login");
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute -left-16 top-10 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-6 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />

      <div className="glass-panel stagger-1 w-full max-w-lg p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            New Workspace Member
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Set up your profile to join approvals and routing.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="input-soft"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-soft"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-soft"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="input-soft"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
                className="input-soft"
            >
              <option value="employee">employee</option>
              <option value="manager">manager</option>
            </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
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
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-2 w-full py-2.5">
            {loading ? "Loading..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-slate-800 underline decoration-slate-300">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
