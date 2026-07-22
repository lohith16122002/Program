function ScoreCard({ score, label }) {
  const color =
    score >= 80 ? "bg-green-600" :
    score >= 60 ? "bg-blue-600" :
    score >= 40 ? "bg-yellow-500" : "bg-red-600";

  return (
    <div className={`${color} text-white rounded-xl p-8 text-center shadow`}>
      <h2 className="text-xl font-semibold">ATS Score</h2>
      <h1 className="text-6xl font-bold mt-4">{score}%</h1>
      <p className="mt-2">{label || "Match Score"}</p>
    </div>
  );
}

export default ScoreCard;
