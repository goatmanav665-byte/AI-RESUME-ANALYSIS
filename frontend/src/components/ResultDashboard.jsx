import { CheckCircle, XCircle, Lightbulb, FileSearch } from 'lucide-react';

export default function ResultDashboard({ result }) {
  if (!result) return null;

  const { atsScore, matchingSkills, missingKeywords, improvementSuggestions, summary } = result;

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500 bg-emerald-950/30';
    if (score >= 60) return 'text-amber-400 border-amber-500 bg-amber-950/30';
    return 'text-rose-400 border-rose-500 bg-rose-950/30';
  };

  return (
    <div className="mt-10 space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-2xl border flex flex-col items-center justify-center ${getScoreColor(atsScore)}`}>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">ATS Match Score</span>
          <span className="text-6xl font-black">{atsScore}%</span>
        </div>
        
        <div className="md:col-span-2 p-6 bg-slate-800 rounded-2xl border border-slate-700 flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-indigo-400 mb-2">
            <FileSearch className="w-5 h-5" />
            <h3 className="font-bold text-slate-200">Executive Match Summary</h3>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{summary}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2 text-emerald-400 mb-4">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold text-slate-200">Matched Skills ({matchingSkills.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {matchingSkills.map((skill, idx) => (
              <span key={idx} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs px-3 py-1.5 rounded-full font-medium">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6">
          <div className="flex items-center space-x-2 text-rose-400 mb-4">
            <XCircle className="w-5 h-5" />
            <h3 className="font-bold text-slate-200">Missing Keywords ({missingKeywords.length})</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((keyword, idx) => (
              <span key={idx} className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs px-3 py-1.5 rounded-full font-medium">
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/70 border border-slate-700/80 rounded-2xl p-6">
        <div className="flex items-center space-x-2 text-amber-400 mb-4">
          <Lightbulb className="w-5 h-5" />
          <h3 className="font-bold text-slate-200">Actionable Suggestions</h3>
        </div>
        <ul className="space-y-3">
          {improvementSuggestions.map((item, idx) => (
            <li key={idx} className="flex items-start space-x-3 text-slate-300 text-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0"></span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}