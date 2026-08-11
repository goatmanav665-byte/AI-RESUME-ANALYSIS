import { useState } from "react";
import axios from "axios";

export default function App() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file || !jobDescription) {
      setError("Please upload a PDF resume and provide a job description.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await axios.post("http://localhost:5000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnalysisResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to analyze resume.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b101d] text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-white">AI ATS Resume Optimizer</h1>
          <p className="text-slate-400 text-sm">Powered by Gemini & MongoDB Atlas</p>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Upload Resume (PDF)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 bg-[#12192a] hover:border-slate-500 rounded-xl p-6 text-center flex flex-col items-center justify-center transition-all cursor-pointer">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {file ? (
                <div className="flex items-center space-x-3 text-emerald-400">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold">✓</div>
                  <div className="text-left">
                    <p className="font-semibold text-white">{file.name}</p>
                    <p className="text-xs text-emerald-400">PDF Ready for Analysis</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">
                  <span className="text-indigo-400 font-medium">Click to upload</span> or drag and drop PDF
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-200">
              Target Job Description
            </label>
            <textarea
              rows={5}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste job description requirements here..."
              className="w-full bg-[#12192a] border border-slate-700 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            {loading ? "Generating Live AI Analysis..." : "✨ Run AI ATS Audit"}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800 rounded-xl text-rose-300 text-sm">
            {error}
          </div>
        )}

        {analysisResult && (
          <div className="bg-[#12192a] border border-slate-700/80 rounded-xl p-6 space-y-6 shadow-xl">
            <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-6 text-center">
              <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 uppercase">Overall Match</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">{analysisResult.matchScore}%</p>
              </div>
              <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 uppercase">Skills Fit</p>
                <p className="text-3xl font-extrabold text-indigo-400 mt-1">{analysisResult.skillsScore}%</p>
              </div>
              <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
                <p className="text-xs text-slate-400 uppercase">Experience Fit</p>
                <p className="text-3xl font-extrabold text-cyan-400 mt-1">{analysisResult.experienceScore}%</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase text-slate-400 mb-2">Executive Summary</h3>
              <p className="text-slate-300 text-sm leading-relaxed">{analysisResult.summary}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
                <h3 className="text-xs font-semibold uppercase text-emerald-400 mb-3">Matching Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.matchingSkills?.map((skill, idx) => (
                    <span key={idx} className="bg-emerald-950/60 text-emerald-300 text-xs px-2.5 py-1 rounded-md border border-emerald-800/60">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
                <h3 className="text-xs font-semibold uppercase text-rose-400 mb-3">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.missingKeywords?.map((skill, idx) => (
                    <span key={idx} className="bg-rose-950/60 text-rose-300 text-xs px-2.5 py-1 rounded-md border border-rose-800/60">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {analysisResult.actionableImprovements?.length > 0 && (
              <div className="bg-[#0b101d] p-4 rounded-lg border border-slate-800">
                <h3 className="text-xs font-semibold uppercase text-amber-400 mb-3">Actionable Resume Improvements</h3>
                <ul className="list-disc list-inside space-y-1.5 text-slate-300 text-sm">
                  {analysisResult.actionableImprovements.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}