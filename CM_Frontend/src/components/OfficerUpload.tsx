import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { UploadCloud, FileCheck2, AlertCircle, X, Users, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/Store';

interface UploadResult {
  imported: number;
  skipped: number;
}

export const OfficerUpload: React.FC<{ onUploadSuccess?: () => void }> = ({ onUploadSuccess }) => {
  const { importOfficersFromCSV } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f && f.name.endsWith('.csv')) { setFile(f); setError(null); setResult(null); }
    else setError('Please drop a valid .csv file.');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setError(null); setResult(null); }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, '_'),
      complete: (results) => {
        try {
          if (!results.data || results.data.length === 0) {
            setError('CSV file is empty or has no data rows.');
            setUploading(false);
            return;
          }

          // Validate at least one useful column exists
          const firstRow = results.data[0];
          const hasName = 'name' in firstRow || 'full_name' in firstRow;
          if (!hasName) {
            setError(
              'CSV must have a "name" or "full_name" column. ' +
              `Found columns: ${Object.keys(firstRow).join(', ')}`
            );
            setUploading(false);
            return;
          }

          const r = importOfficersFromCSV(results.data);
          setResult(r);
          setUploading(false);
          onUploadSuccess?.();
        } catch (err: any) {
          setError('Error processing CSV: ' + err.message);
          setUploading(false);
        }
      },
      error: (err) => {
        setError('Error parsing CSV file: ' + err.message);
        setUploading(false);
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-sm">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">Bulk Import Officials via CSV</h3>
            <p className="text-xs text-slate-500">Upload hierarchy data — processed entirely on-device</p>
          </div>
        </div>
        {(file || result) && (
          <button
            onClick={reset}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-5">
        {/* Success state */}
        {result && (
          <div className="flex flex-col items-center py-4 gap-3 animate-in fade-in duration-300">
            <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-slate-800">Import Complete!</p>
              <p className="text-xs text-slate-500 mt-1">
                <span className="text-emerald-700 font-bold">{result.imported}</span> officers imported
                {result.skipped > 0 && (
                  <span className="text-amber-600 font-bold"> · {result.skipped} skipped (missing name)</span>
                )}
              </p>
            </div>
            <div className="flex gap-2 mt-1">
              <button
                onClick={reset}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                Import Another File
              </button>
            </div>
          </div>
        )}

        {/* Drop zone — shown when no file and no result */}
        {!file && !result && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
              dragging
                ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileSelect}
            />
            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-all ${dragging ? 'bg-indigo-100 scale-110' : 'bg-slate-100'}`}>
              <UploadCloud className={`h-6 w-6 ${dragging ? 'text-indigo-600' : 'text-slate-400'}`} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Click to upload or drag & drop</p>
            <p className="text-xs text-slate-400 mt-1">CSV files only</p>

            {/* Column guide */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-left w-full max-w-sm">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wide mb-1.5">Accepted Columns</p>
              <div className="flex flex-wrap gap-1.5">
                {['name*', 'designation', 'role', 'state', 'district', 'department', 'email', 'phone'].map((col) => (
                  <span key={col} className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${col.endsWith('*') ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                    {col}
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">* required &nbsp;·&nbsp; matches sample_officers.csv format</p>
            </div>
          </div>
        )}

        {/* File selected — ready to process */}
        {file && !result && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                  <FileCheck2 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB · CSV</p>
                </div>
              </div>

              {!uploading ? (
                <button
                  onClick={handleUpload}
                  className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-sm transition-all"
                >
                  Process & Import
                </button>
              ) : (
                <div className="flex items-center gap-2 text-indigo-600 text-sm font-bold">
                  <div className="animate-spin h-4 w-4 border-2 border-indigo-600 border-t-transparent rounded-full" />
                  Importing…
                </div>
              )}
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Upload Failed</p>
                  <p className="opacity-90 mt-0.5">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error shown in drop-zone state (wrong file type) */}
        {!file && !result && error && (
          <div className="mt-3 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};
