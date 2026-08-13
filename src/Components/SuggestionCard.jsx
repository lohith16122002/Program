function SuggestionCard({ suggestions }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">

      <h2 className="text-xl font-bold mb-4">
        AI Suggestions
      </h2>

      <ul className="space-y-3">

        {suggestions.map((item, index) => (
          <li key={index}>
            ✅ {item}
          </li>
        ))}

      </ul>

    </div>
  );
}

export default SuggestionCard;