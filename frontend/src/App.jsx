import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AdminPanel from "./pages/AdminPanel";
import Dashboard from "./pages/Dashboard";
import DocumentDetail from "./pages/DocumentDetail";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UploadDocument from "./pages/UploadDocument";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="min-h-screen md:pl-64">
        <Navbar />
        <main className="px-4 pb-8 pt-20 md:px-8">
          <div className="page-enter">{children}</div>
        </main>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-panel px-8 py-7 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
          <p className="mt-3 text-sm font-medium text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
      />

      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/upload"
        element={
          <ProtectedRoute allowedRoles={["employee", "admin", "manager"]}>
            <Layout>
              <UploadDocument />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/documents/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <DocumentDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Layout>
              <AdminPanel />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastContainer
          position="bottom-right"
          theme="light"
          toastStyle={{
            borderRadius: "0.9rem",
            border: "1px solid #dbe2ef",
            fontSize: "14px",
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
