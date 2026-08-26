import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../Layouts/DashboardLayout";
import HistoryTable from "../Components/HistoryTable";
import api from "../api/axios";

function History() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.get("/resume/my-resumes")
      .then((res) => setResumes(res.data.resumes || []))
      .catch(() => toast.error("Failed to load history"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this resume analysis?")) return;
    try {
      await api.delete(`/resume/${id}`);
      toast.success("Deleted");
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = resumes.filter((r) =>
    r.originalName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Analysis History</h1>

      <input
        type="text"
        placeholder="Search resume..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-96 border rounded-lg px-4 py-3 mb-6"
      />

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <HistoryTable
          data={filtered}
          onView={(id) => navigate(`/analysis/${id}`)}
          onDelete={handleDelete}
          searching={search.length > 0}
        />
      )}
    </DashboardLayout>
  );
}

export default History;
