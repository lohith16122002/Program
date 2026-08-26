function StatCard({ title, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
      <h2 className={`text-3xl font-bold mt-2 ${color}`}>{value}</h2>
    </div>
  );
}

export default StatCard;
