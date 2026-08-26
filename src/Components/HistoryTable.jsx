function HistoryTable({ data, onView, onDelete, searching }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        {searching ? "No resumes match your search." : "No resume analyses yet. Upload one to get started."}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Resume</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Score</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.map((resume) => {
              const score = resume.atsScore ?? resume.score ?? 0;
              const badgeColor =
                score >= 80 ? "bg-green-100 text-green-700" :
                score >= 60 ? "bg-blue-100 text-blue-700" :
                score >= 40 ? "bg-yellow-100 text-yellow-700" :
                "bg-red-100 text-red-700";

              return (
                <tr key={resume._id ?? resume.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 max-w-xs truncate font-medium">
                    {resume.originalName ?? resume.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`${badgeColor} px-2 py-1 rounded-full text-xs font-semibold`}>
                      {score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {resume.createdAt
                      ? new Date(resume.createdAt).toLocaleDateString()
                      : resume.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold">
                      Completed
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onView && onView(resume._id ?? resume.id)}
                      className="text-blue-600 hover:underline font-medium mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDelete && onDelete(resume._id ?? resume.id)}
                      className="text-red-500 hover:underline font-medium"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryTable;
