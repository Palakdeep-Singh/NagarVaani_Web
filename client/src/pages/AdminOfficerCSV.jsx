import React, { useState, useRef } from 'react';
import API from '../api/api.js';

export default function AdminOfficerCSV({ role, creatorState }) {
  const [file, setFile] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [errors, setErrors] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileRef = useRef();

  const parseCSV = (text) => {
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { data: [], errors: ['File is empty or missing headers.'] };

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const req = ['name', 'email', 'role'];
    const missing = req.filter(r => !headers.includes(r));
    if (missing.length) return { data: [], errors: [`Missing required headers: ${missing.join(', ')}`] };

    const data = [];
    const errs = [];

    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, j) => { row[h] = vals[j]; });

      if (!row.name || !row.email || !row.role) {
        errs.push(`Row ${i + 1}: Missing name, email or role.`);
        continue;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
        errs.push(`Row ${i + 1}: Invalid email ${row.email}.`);
        continue;
      }
      if (!['district', 'state'].includes(row.role)) {
        errs.push(`Row ${i + 1}: Role must be 'district' or 'state'.`);
        continue;
      }
      
      data.push(row);
    }
    
    return { data, errors: errs };
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResults(null);
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      const res = parseCSV(evt.target.result);
      setParsedData(res.data);
      setErrors(res.errors);
    };
    reader.readAsText(f);
  };

  const handleUpload = async () => {
    if (!parsedData.length) return;
    setUploading(true);
    try {
      const payload = { rows: parsedData };
      const { data } = await API.post('/api/admin/bulk-create-admins', payload);
      setResults(data);
      setParsedData([]);
      setFile(null);
      if (fileRef.current) fileRef.current.value = '';
    } catch (e) {
      alert(e.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ animation: 'nv-fadein .4s ease' }}>
      <div className="bc">Admin › <span>Officer CSV Import</span></div>
      <div className="ph" style={{ marginBottom: 20 }}>
        <h1>📂 Bulk Officer Import</h1>
        <p>Upload a CSV file to bulk create officer accounts. Central admins can create State and District admins. State admins can create District admins.</p>
      </div>

      <div style={{ background: 'var(--wh)', padding: 24, borderRadius: 'var(--r)', border: '.5px solid var(--gy-m)' }}>
        <div style={{ marginBottom: 16 }}>
          <strong>CSV Format:</strong> name, email, role, state, district, designation, phone
        </div>
        <input type="file" accept=".csv" onChange={handleFileChange} ref={fileRef} />
        
        {errors.length > 0 && (
          <div style={{ marginTop: 20, color: 'var(--rd)' }}>
            <strong>Errors:</strong>
            <ul style={{ paddingLeft: 20, fontSize: 13 }}>
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        {parsedData.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 14 }}>Ready to upload <strong>{parsedData.length}</strong> officers.</p>
            <button className="btn b-nv" onClick={handleUpload} disabled={uploading}>
              {uploading ? 'Processing...' : 'Confirm Upload'}
            </button>
          </div>
        )}

        {results && (
          <div style={{ marginTop: 20, background: 'var(--wh)', padding: 16, borderRadius: 8, border: '1px solid var(--gy-m)' }}>
            <h3 style={{ marginBottom: 12 }}>Upload Results</h3>
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ padding: 10, background: 'var(--gn-l)', borderRadius: 6, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--gn)' }}>{results.summary?.created || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Created</div>
              </div>
              <div style={{ padding: 10, background: 'var(--am-l)', borderRadius: 6, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--am)' }}>{results.summary?.skipped || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Skipped</div>
              </div>
              <div style={{ padding: 10, background: 'var(--rd-l)', borderRadius: 6, flex: 1, textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--rd)' }}>{results.summary?.errors || 0}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase' }}>Errors</div>
              </div>
            </div>
            
            {results.results && results.results.length > 0 && (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <table className="dtbl" style={{ width: '100%', fontSize: 12 }}>
                  <thead><tr><th>Email</th><th>Status</th><th>Details</th></tr></thead>
                  <tbody>
                    {results.results.map((r, i) => (
                      <tr key={i}>
                        <td>{r.email}</td>
                        <td>
                          <span className={`pill ${r.status === 'created' ? 'p-gn' : r.status === 'skipped' ? 'p-am' : 'p-rd'}`}>
                            {r.status}
                          </span>
                        </td>
                        <td>
                          {r.status === 'created' ? (
                            <span style={{ fontFamily: 'monospace', color: 'var(--nv)' }}>{r.password}</span>
                          ) : (
                            <span style={{ color: 'var(--t3)' }}>{r.reason}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
