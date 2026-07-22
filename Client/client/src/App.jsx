import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./Pages/Home";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import Dashboard from "./Pages/Dashboard";
import UploadResume from "./Pages/UploadResume";
import Analysis from "./Pages/Analysis";
import History from "./Pages/History";
import Profile from "./Pages/Profile";
import ProtectedRoute from "./Components/ProtectedRoute";

const CareerInsights = lazy(() => import("./Pages/CareerInsights"));

function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/upload"        element={<ProtectedRoute><UploadResume /></ProtectedRoute>} />
      <Route path="/UploadResume"  element={<Navigate to="/upload" replace />} />
      <Route path="/analysis/:id"  element={<ProtectedRoute><Analysis /></ProtectedRoute>} />
      {/* bare /analysis redirects to history so it doesn't crash */}
      <Route path="/analysis"      element={<Navigate to="/history" replace />} />
      <Route path="/history"       element={<ProtectedRoute><History /></ProtectedRoute>} />
      <Route path="/insights"      element={<ProtectedRoute><CareerInsights /></ProtectedRoute>} />
      <Route path="/profile"       element={<ProtectedRoute><Profile /></ProtectedRoute>} />

      {/* catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
