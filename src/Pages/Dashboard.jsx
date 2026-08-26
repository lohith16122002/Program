import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../Layouts/DashboardLayout";
import StatCard from "../Components/StatCard";
import api from "../api/axios";

function Dashboard() {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/resume/my-resumes")
      .then((res) => setResumes(res.data.resumes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const avgScore = resumes.length
    ? Math.round(resumes.reduce((sum, r) => sum + r.atsScore, 0) / resumes.length)
    : 0;

  const bestScore = resumes.length
    ? Math.max(...resumes.map((r) => r.atsScore))
    : 0;

  const scoreColor =
    avgScore >= 80 ? "text-green-600" :
    avgScore >= 60 ? "text-blue-600" :
    avgScore >= 40 ? "text-yellow-500" : "text-red-600";

  return (
    <DashboardLayout>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Uploads" value={resumes.length} />
        <StatCard title="Avg ATS Score" value={`${avgScore}%`} color={scoreColor} />
        <StatCard title="Best Score" value={`${bestScore}%`} />
        <StatCard
          title="Latest Score"
          value={resumes.length ? `${resumes[0].atsScore}%` : "—"}
        />
      </div>

      {/* Recent table */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold">Recent Analyses</h2>
          <button
            onClick={() => navigate("/upload")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            + New Analysis
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : resumes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-5xl mb-4">📄</p>
            <p className="text-gray-500 mb-4">No resumes analyzed yet.</p>
            <button
              onClick={() => navigate("/upload")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Upload Your First Resume
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-gray-500">
                  <th className="pb-3 font-medium">Resume</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {resumes.slice(0, 5).map((r) => {
                  const sc = r.atsScore;
                  const badgeColor =
                    sc >= 80 ? "bg-green-100 text-green-700" :
                    sc >= 60 ? "bg-blue-100 text-blue-700" :
                    sc >= 40 ? "bg-yellow-100 text-yellow-700" :
                    "bg-red-100 text-red-700";
                  return (
                    <tr key={r._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 max-w-xs truncate">{r.originalName}</td>
                      <td className="py-3">
                        <span className={`${badgeColor} px-2 py-1 rounded-full text-xs font-semibold`}>
                          {sc}%
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => navigate(`/analysis/${r._id}`)}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {resumes.length > 5 && (
              <button
                onClick={() => navigate("/history")}
                className="mt-4 text-blue-600 hover:underline text-sm"
              >
                View all {resumes.length} analyses →
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
