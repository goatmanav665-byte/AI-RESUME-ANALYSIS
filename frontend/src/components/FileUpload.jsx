import { useState } from 'react';
import { Upload, CheckCircle2 } from 'lucide-react';

export default function FileUpload({ onFileSelect }) {
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Only PDF documents are supported!');
        return;
      }
      setFileName(selectedFile.name);
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-300 mb-2">
        Upload Resume (PDF)
      </label>
      <div className="relative border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 bg-slate-800/50 hover:bg-slate-800 transition-all cursor-pointer flex flex-col items-center justify-center text-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {fileName ? (
          <div className="flex items-center space-x-3 text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-slate-200">{fileName}</p>
              <p className="text-xs text-emerald-400">PDF Loaded & Ready</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-10 h-10 text-indigo-400" />
            <p className="text-sm font-medium text-slate-200">
              Click to upload or drag and drop your resume
            </p>
            <p className="text-xs text-slate-400">PDF format only (Max 5MB)</p>
          </div>
        )}
      </div>
    </div>
  );
}