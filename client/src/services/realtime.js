/**
 * realtime.js
 * Place: client/src/services/realtime.js
 */
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);
export default supabase;

export const subscribeToMilestones = (userId, onChange) => {
  const ch = supabase.channel(`ms_${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_milestone_progress', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
};

export const subscribeToComplaints = (userId, onChange) => {
  const ch = supabase.channel(`comp_${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
};

export const subscribeToComplaintTimeline = (complaintId, onChange) => {
  const ch = supabase.channel(`tl_${complaintId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'complaint_timeline', filter: `complaint_id=eq.${complaintId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
};

export const subscribeToDocuments = (userId, onChange) => {
  const ch = supabase.channel(`docs_${userId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'documents', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
};

export const subscribeToNotifications = (userId, onChange) => {
  const ch = supabase.channel(`notif_${userId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => supabase.removeChannel(ch);
};

export const subscribeToDistrictComplaints = (_district, onChange) => {
  const ch = supabase.channel(`district_all`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'complaints' }, p => onChange({ ...p, table: 'complaints' }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'user_milestone_progress' }, p => onChange({ ...p, table: 'milestones' }))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, p => onChange({ ...p, table: 'documents' }))
    .subscribe();
  return () => supabase.removeChannel(ch);
};

/**
 * uploadDocument
 * Sends file as multipart/form-data to Express server.
 * Server uploads to Supabase Storage AND saves metadata to DB.
 * Returns the saved document record with signed file_url.
 */
export const uploadDocument = async (_userId, file, docType, extra = {}) => {
  if (file.size > 20 * 1024 * 1024) throw new Error('File too large. Max 20 MB.');

  const ALLOWED = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
    'image/heic', 'image/heif', 'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (!ALLOWED.includes(file.type)) {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const okExt = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'pdf', 'doc', 'docx'].includes(ext);
    if (!okExt) throw new Error(`File type "${file.type}" not supported. Use JPG, PNG, PDF, WEBP or DOCX.`);
  }

  const token = localStorage.getItem('token');
  const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);
  formData.append('doc_name', file.name);
  if (extra.scheme_id) formData.append('scheme_id', extra.scheme_id);
  if (extra.milestone_id) formData.append('milestone_id', extra.milestone_id);

  const res = await fetch(`${API_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    // Do NOT set Content-Type — browser sets multipart/form-data with boundary
    body: formData,
  });

  if (!res.ok) {
    let msg = `Upload failed (${res.status})`;
    try { const j = await res.json(); msg = j.error || msg; } catch { }
    throw new Error(msg);
  }

  return await res.json();
};