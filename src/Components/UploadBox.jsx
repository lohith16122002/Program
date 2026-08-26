import { useRef, useState } from "react";

function UploadBox({ file, setFile }) {
  const fileInputRef = useRef();
  const [dragging, setDragging] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  };

  const validateAndSet = (selected) => {
    if (selected.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    setFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) validateAndSet(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  return (
    <>
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition ${
          dragging
            ? "border-blue-600 bg-blue-50"
            : "border-blue-400 hover:bg-blue-50"
        }`}
        onClick={() => fileInputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="text-5xl mb-3">📄</div>
        <h2 className="text-xl font-semibold">
          {dragging ? "Drop it here!" : "Drag & Drop Your Resume"}
        </h2>
        <p className="text-gray-500 mt-2 text-sm">
          Upload your CV / Resume — PDF only, max 10MB
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Must be a resume or CV. Invoices, certificates and other documents won't be accepted.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <span className="text-green-700 font-medium text-sm">✅ {file.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); setFile(null); }}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        </div>
      )}
    </>
  );
}

export default UploadBox;
