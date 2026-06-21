import React, { useState } from 'react';
import api from '../utils/api';

export default function VoterUploadModal({ isOpen, onClose, boothId, acId, user }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please select a PDF file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('voterList', file);
      formData.append('boothId', boothId);
      formData.append('acId', acId);
      const res = await api.post('/voters/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(res.data.message);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose} style={overlayStyle}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={modalStyle}>
        <h2>Upload Voter List (PDF)</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            disabled={uploading}
          />
          <br />
          <button type="submit" disabled={uploading} style={buttonStyle}>
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
          <button type="button" onClick={onClose} disabled={uploading} style={buttonStyle}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalStyle = {
  background: '#fff',
  padding: '24px',
  borderRadius: '12px',
  width: '320px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
};

const buttonStyle = {
  marginTop: '12px',
  marginRight: '8px',
  padding: '8px 16px',
  borderRadius: '6px',
  border: 'none',
  cursor: 'pointer',
};
