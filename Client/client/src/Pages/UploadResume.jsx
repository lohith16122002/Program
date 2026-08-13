import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../Layouts/DashboardLayout";
import UploadBox from "../Components/UploadBox";
import JobDescription from "../Components/JobDescription";
import Button from "../Components/Button";
import api from "../api/axios";

function UploadResume() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!file) {
      toast.error("Please select a PDF resume");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("jobDescription", jobDescription);

      const res = await api.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.duplicate) {
        toast("This resume was already analyzed for this job description. Showing existing result.", {
          icon: "ℹ️",
        });
      } else if (res.data.aiPowered) {
        toast.success("AI analysis complete! ✨");
      } else {
        toast.success("Analysis complete!");
      }
      navigate(`/analysis/${res.data.resume._id}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
        <h1 className="text-3xl font-bold mb-8">Upload Resume</h1>
        <UploadBox file={file} setFile={setFile} />
        <JobDescription
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <div className="mt-8">
          <Button onClick={handleAnalyze} loading={loading}>
            Analyze Resume
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default UploadResume;
