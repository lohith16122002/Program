import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../Layouts/DashboardLayout";
import ScoreCard from "../Components/ScoreCard";
import SkillCard from "../Components/SkillCard";
import SuggestionCard from "../Components/SuggestionCard";
import Button from "../Components/Button";
import api from "../api/axios";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "Hindi" },
  { code: "te", label: "Telugu" },
  { code: "ta", label: "Tamil" },
  { code: "kn", label: "Kannada" },
  { code: "ml", label: "Malayalam" },
  { code: "mr", label: "Marathi" },
  { code: "bn", label: "Bengali" },
  { code: "gu", label: "Gujarati" },
  { code: "pa", label: "Punjabi" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese" },
  { code: "ar", label: "Arabic" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "it", label: "Italian" },
];

// Translate a single text via MyMemory (free, no API key)
async function translateText(text, targetLang) {
  if (!text || targetLang === "en") return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.responseStatus === 200) return data.responseData.translatedText;
  throw new Error("Translation failed");
}

function Analysis() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  // Translation state
  const [selectedLang, setSelectedLang] = useState("en");
  const [translating, setTranslating] = useState(false);
  const [translated, setTranslated] = useState(null); // { aiSummary, suggestions }

  useEffect(() => {
    if (!id) {
      toast.error("No analysis ID provided");
      navigate("/upload");
      return;
    }
    const fetchResume = async () => {
      try {
        const res = await api.get(`/resume/${id}`);
        setResume(res.data.resume);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load analysis");
        navigate("/upload");
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  // Reset translated text when language goes back to English
  useEffect(() => {
    if (selectedLang === "en") setTranslated(null);
  }, [selectedLang]);

  const handleTranslate = useCallback(async () => {
    if (!resume || selectedLang === "en") return;
    setTranslating(true);
    try {
      // Translate summary + each suggestion in parallel
      const [translatedSummary, ...translatedSuggestions] = await Promise.all([
        translateText(resume.aiSummary, selectedLang),
        ...resume.suggestions.map((s) => translateText(s, selectedLang)),
      ]);
      setTranslated({ aiSummary: translatedSummary, suggestions: translatedSuggestions });
      toast.success(`Translated to ${LANGUAGES.find((l) => l.code === selectedLang)?.label}`);
    } catch (err) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setTranslating(false);
    }
  }, [resume, selectedLang]);

  const displaySummary    = translated ? translated.aiSummary    : resume?.aiSummary;
  const displaySuggestions = translated ? translated.suggestions : resume?.suggestions;

  const handleDownload = () => {
    if (!resume) return;
    const scoreColor =
      resume.atsScore >= 80 ? "#16a34a" :
      resume.atsScore >= 60 ? "#2563eb" :
      resume.atsScore >= 40 ? "#d97706" : "#dc2626";

    const matchedHtml   = resume.matchedSkills.map((s) => `<span class="badge badge-green">${s}</span>`).join("");
    const missingHtml   = resume.missingSkills.map((s) => `<span class="badge badge-red">${s}</span>`).join("");
    const suggestionsHtml = (displaySuggestions || []).map((s) => `<li>✅ ${s}</li>`).join("");
    const langLabel     = LANGUAGES.find((l) => l.code === selectedLang)?.label || "English";

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Resume Analysis Report</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#1f2937; padding:40px; background:#fff; }
    .header { border-bottom:3px solid #2563eb; padding-bottom:16px; margin-bottom:28px; }
    .header h1 { font-size:26px; color:#2563eb; }
    .header p { font-size:13px; color:#6b7280; margin-top:4px; }
    .score-box { background:${scoreColor}; color:white; border-radius:12px; padding:28px; text-align:center; margin-bottom:28px; }
    .score-box .score { font-size:64px; font-weight:800; line-height:1; margin:8px 0; }
    .section { background:#f9fafb; border-radius:10px; padding:20px; margin-bottom:20px; border:1px solid #e5e7eb; }
    .section h3 { font-size:16px; font-weight:700; margin-bottom:12px; }
    .badge { display:inline-block; padding:4px 12px; border-radius:999px; font-size:12px; font-weight:600; margin:3px; }
    .badge-green { background:#dcfce7; color:#166534; }
    .badge-red { background:#fee2e2; color:#991b1b; }
    ul { list-style:none; }
    ul li { font-size:14px; margin-bottom:8px; line-height:1.5; color:#374151; }
    .footer { margin-top:36px; text-align:center; font-size:12px; color:#9ca3af; border-top:1px solid #e5e7eb; padding-top:16px; }
    .meta { display:flex; gap:24px; margin-bottom:28px; }
    .meta-item { background:#eff6ff; border-radius:8px; padding:12px 20px; flex:1; }
    .meta-item span { display:block; font-size:11px; color:#6b7280; font-weight:600; text-transform:uppercase; }
    .meta-item strong { font-size:14px; color:#1f2937; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📊 Resume Analysis Report</h1>
    <p>Generated on ${new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })} &nbsp;|&nbsp; Language: ${langLabel}</p>
  </div>
  <div class="meta">
    <div class="meta-item"><span>Resume File</span><strong>${resume.originalName}</strong></div>
    <div class="meta-item"><span>Analyzed On</span><strong>${new Date(resume.createdAt).toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })}</strong></div>
    <div class="meta-item"><span>ATS Score</span><strong>${resume.atsScore}%</strong></div>
  </div>
  <div class="score-box">
    <h2 style="font-size:14px;font-weight:600;letter-spacing:1px;text-transform:uppercase;">ATS Match Score</h2>
    <div class="score">${resume.atsScore}%</div>
  </div>
  <div class="section"><h3>✅ Matched Skills (${resume.matchedSkills.length})</h3><div>${matchedHtml || "<em>None</em>"}</div></div>
  <div class="section"><h3>❌ Missing Skills (${resume.missingSkills.length})</h3><div>${missingHtml || "<em>None</em>"}</div></div>
  <div class="section"><h3>📝 AI Summary</h3><p style="font-size:14px;line-height:1.7;color:#374151;">${displaySummary}</p></div>
  <div class="section"><h3>💡 Suggestions</h3><ul>${suggestionsHtml}</ul></div>
  <div class="footer">AI Resume Analyzer — Powered by GPT + ATS Engine</div>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const win  = window.open(url, "_blank");
    if (!win) { toast.error("Please allow popups to download the report."); URL.revokeObjectURL(url); return; }
    win.onload = () => { win.print(); URL.revokeObjectURL(url); };
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!resume) return null;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-3xl font-bold">Resume Analysis</h1>

        {/* Language Selector */}
        <div className="flex items-center gap-2 bg-white border rounded-xl px-3 py-2 shadow-sm">
          <span className="text-lg">🌐</span>
          <select
            value={selectedLang}
            onChange={(e) => { setSelectedLang(e.target.value); setTranslated(null); }}
            className="text-sm font-medium text-gray-700 outline-none bg-transparent cursor-pointer"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {selectedLang !== "en" && (
            <button
              onClick={handleTranslate}
              disabled={translating}
              className="ml-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1 rounded-lg transition flex items-center gap-1"
            >
              {translating
                ? <><span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Translating...</>
                : "Translate"}
            </button>
          )}
          {translated && (
            <span className="text-xs text-green-600 font-semibold ml-1">✓ Translated</span>
          )}
        </div>
      </div>

      <p className="text-gray-500 mb-8 text-sm">
        {resume.originalName} &mdash; {new Date(resume.createdAt).toLocaleDateString()}
      </p>

      <ScoreCard score={resume.atsScore} />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <SkillCard title="Matched Skills" skills={resume.matchedSkills} color="bg-green-600" />
        <SkillCard title="Missing Skills"  skills={resume.missingSkills}  color="bg-red-600"   />
      </div>

      {/* Summary — shows translated if available */}
      <div className="bg-white rounded-xl shadow p-6 mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">AI Summary</h2>
          {translated && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
              🌐 {LANGUAGES.find((l) => l.code === selectedLang)?.label}
            </span>
          )}
        </div>
        <p className="text-gray-700 leading-relaxed">
          {translating ? (
            <span className="text-gray-400 animate-pulse">Translating...</span>
          ) : displaySummary}
        </p>
      </div>

      {/* Suggestions — shows translated if available */}
      <div className="mt-8">
        <SuggestionCard suggestions={translating ? resume.suggestions : displaySuggestions} />
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Button onClick={() => navigate("/upload")}>Analyze Another Resume</Button>
        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 py-3 rounded-lg font-semibold transition text-sm"
        >
          ⬇ Download PDF Report
        </button>
      </div>
    </DashboardLayout>
  );
}

export default Analysis;
