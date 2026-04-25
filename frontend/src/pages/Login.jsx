import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token, ...userData } = response.data;

      login(userData, token);
      navigate("/dashboard");
    } catch (error) {
      const message = error?.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute -left-20 top-6 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-14 bottom-8 h-64 w-64 rounded-full bg-indigo-300/25 blur-3xl" />

      <div className="glass-panel stagger-1 w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="inline-flex rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Welcome Back
          </span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">Sign in to DocTrack</h1>
          <p className="mt-1 text-sm text-slate-500">Continue where your workflow left off.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="input-soft"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="input-soft"
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-4 w-full py-2.5">
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link to="/register" className="font-semibold text-slate-800 underline decoration-slate-300">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
