import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import DashboardLayout from "../Layouts/DashboardLayout";
import api from "../api/axios";

/* ── helpers ──────────────────────────────────────────────────────────── */

function healthLabel(score) {
  if (score >= 80) return { text: "Excellent",  color: "text-green-600",  bg: "bg-green-100",  ring: "ring-green-400" };
  if (score >= 65) return { text: "Good",        color: "text-blue-600",   bg: "bg-blue-100",   ring: "ring-blue-400"  };
  if (score >= 45) return { text: "Needs Work",  color: "text-yellow-600", bg: "bg-yellow-100", ring: "ring-yellow-400"};
  return              { text: "Critical",    color: "text-red-600",    bg: "bg-red-100",    ring: "ring-red-400"   };
}

function getTrend(chartData) {
  if (chartData.length < 2) return null;
  const first = chartData[0].score;
  const last  = chartData[chartData.length - 1].score;
  const diff  = last - first;
  if (diff > 0)  return { icon: "📈", text: `Up ${diff}pts since your first analysis`, color: "text-green-600" };
  if (diff < 0)  return { icon: "📉", text: `Down ${Math.abs(diff)}pts since your first analysis`, color: "text-red-500" };
  return              { icon: "➡️", text: "Score is steady across all analyses", color: "text-gray-500" };
}

/* ── custom tooltip ───────────────────────────────────────────────────── */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white shadow-lg rounded-xl p-3 text-sm border border-gray-100 max-w-xs">
      <p className="font-semibold text-gray-800 truncate">{d.name}</p>
      <p className="text-blue-600 font-bold text-lg">{d.score}%</p>
      <p className="text-gray-400 text-xs">{d.date}</p>
    </div>
  );
}

/* ── main component ───────────────────────────────────────────────────── */
export default function CareerInsights() {
  const navigate = useNavigate();
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get("/resume/my-resumes?limit=50")
      .then((res) => setResumes((res.data.resumes || []).reverse())) // oldest first for chart
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (resumes.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-500 mb-4">No analyses yet. Upload a resume to start tracking your career progress.</p>
          <button onClick={() => navigate("/upload")} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
            Upload Resume
          </button>
        </div>
      </DashboardLayout>
    );
  }

  /* ── compute insights ──────────────────────────────────────────────── */

  // Score timeline
  const chartData = resumes.map((r, i) => ({
    index: i + 1,
    score: r.atsScore,
    name: r.originalName,
    date: new Date(r.createdAt).toLocaleDateString(),
  }));

  // Health score = weighted avg (recent analyses count more)
  const weights    = resumes.map((_, i) => i + 1);
  const weightSum  = weights.reduce((a, b) => a + b, 0);
  const healthScore = Math.round(
    resumes.reduce((sum, r, i) => sum + r.atsScore * weights[i], 0) / weightSum
  );
  const health = healthLabel(healthScore);

  // Skill frequency across all analyses
  const allMissing  = resumes.flatMap((r) => r.missingSkills || []);
  const allMatched  = resumes.flatMap((r) => r.matchedSkills || []);

  const missingFreq = allMissing.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const matchedFreq = allMatched.reduce((acc, s) => { acc[s] = (acc[s] || 0) + 1; return acc; }, {});

  // Persistent weak spots = skills missing in >50% of analyses
  const threshold   = Math.ceil(resumes.length * 0.5);
  const weakSpots   = Object.entries(missingFreq)
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Consistent strengths = skills matched in >50% of analyses
  const strengths   = Object.entries(matchedFreq)
    .filter(([, count]) => count >= threshold)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Improvement signal: skills that were missing early but matched recently
  const earlyMissing = new Set(resumes.slice(0, Math.ceil(resumes.length / 2)).flatMap((r) => r.missingSkills || []));
  const recentMatched = new Set(resumes.slice(-Math.ceil(resumes.length / 2)).flatMap((r) => r.matchedSkills || []));
  const improved = [...earlyMissing].filter((s) => recentMatched.has(s)).slice(0, 6);

  const trend       = getTrend(chartData);
  const avgScore    = Math.round(resumes.reduce((s, r) => s + r.atsScore, 0) / resumes.length);
  const bestScore   = Math.max(...resumes.map((r) => r.atsScore));
  const latestScore = resumes[resumes.length - 1]?.atsScore ?? 0;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-1">Career Insights</h1>
      <p className="text-gray-500 text-sm mb-8">
        Patterns and progress across all {resumes.length} of your analyses
      </p>

      {/* ── Top stats ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Resume Health",  value: `${healthScore}%`, sub: health.text,  color: health.color },
          { label: "Latest Score",   value: `${latestScore}%`, sub: "most recent" },
          { label: "Best Score",     value: `${bestScore}%`,   sub: "all time"    },
          { label: "Avg Score",      value: `${avgScore}%`,    sub: `${resumes.length} analyses` },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">{label}</p>
            <p className={`text-3xl font-bold mt-1 ${color || "text-gray-900"}`}>{value}</p>
            <p className="text-gray-400 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Score timeline chart ─────────────────────────────────────── */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-bold">Score Timeline</h2>
          {trend && (
            <span className={`text-sm font-medium ${trend.color}`}>
              {trend.icon} {trend.text}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-xs mb-4">ATS score across each analysis in chronological order</p>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="index"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              label={{ value: "Analysis #", position: "insideBottom", offset: -2, fontSize: 11, fill: "#9ca3af" }}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={60} stroke="#93c5fd" strokeDasharray="4 4" label={{ value: "Target 60%", fill: "#93c5fd", fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ fill: "#2563eb", r: 4 }}
              activeDot={{ r: 6, fill: "#1d4ed8" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Skills analysis grid ─────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6 mb-6">

        {/* Persistent weak spots */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-bold mb-1">🔴 Persistent Weak Spots</h2>
          <p className="text-gray-400 text-xs mb-4">Skills missing in most of your job descriptions</p>
          {weakSpots.length === 0 ? (
            <p className="text-gray-400 text-sm">No recurring gaps — great job!</p>
          ) : (
            <div className="space-y-2">
              {weakSpots.map(([skill, count]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-red-400 h-1.5 rounded-full"
                        style={{ width: `${Math.round((count / resumes.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{count}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consistent strengths */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-bold mb-1">🟢 Consistent Strengths</h2>
          <p className="text-gray-400 text-xs mb-4">Skills you consistently match across jobs</p>
          {strengths.length === 0 ? (
            <p className="text-gray-400 text-sm">Analyze more resumes to see your strengths.</p>
          ) : (
            <div className="space-y-2">
              {strengths.map(([skill, count]) => (
                <div key={skill} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{skill}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-green-400 h-1.5 rounded-full"
                        style={{ width: `${Math.round((count / resumes.length) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400">{count}x</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Skills you improved */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-base font-bold mb-1">⚡ Skills You've Gained</h2>
          <p className="text-gray-400 text-xs mb-4">Missing early, now matching in recent analyses</p>
          {improved.length === 0 ? (
            <p className="text-gray-400 text-sm">
              {resumes.length < 3
                ? "Upload more resumes to track skill improvement."
                : "Keep improving — gains will appear here."}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {improved.map((skill) => (
                <span key={skill} className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full capitalize">
                  ✓ {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Resume health card ───────────────────────────────────────── */}
      <div className={`${health.bg} rounded-xl p-6 flex flex-col md:flex-row items-center gap-6`}>
        <div className={`w-24 h-24 rounded-full ring-4 ${health.ring} flex items-center justify-center flex-shrink-0 bg-white`}>
          <span className={`text-3xl font-black ${health.color}`}>{healthScore}%</span>
        </div>
        <div>
          <h2 className={`text-xl font-bold ${health.color}`}>Resume Health: {health.text}</h2>
          <p className="text-gray-600 text-sm mt-1 max-w-lg">
            {healthScore >= 80 && "Your resume is in excellent shape. You're consistently matching job requirements. Keep targeting roles that match your skill set."}
            {healthScore >= 65 && healthScore < 80 && "Good overall profile. Focus on closing the skill gaps in your weak spots to push your health score above 80%."}
            {healthScore >= 45 && healthScore < 65 && "Your resume needs targeted improvements. Address the persistent weak spots above — adding even 2-3 of those skills can jump your score significantly."}
            {healthScore < 45 && "Your resume needs significant work. Start by adding the most common weak spot skills and tailoring your resume more specifically to each job description."}
          </p>
          <button
            onClick={() => navigate("/upload")}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition"
          >
            Analyze New Resume
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
