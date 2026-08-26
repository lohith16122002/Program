function JobDescription({ value, onChange }) {
  return (
    <div className="mt-8">
      <label className="block text-lg font-semibold mb-2">
        Job Description
      </label>

      <textarea
        rows="8"
        placeholder="Paste the job description here..."
        value={value}
        onChange={onChange}
        className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none"
      />
    </div>
  );
}

export default JobDescription;