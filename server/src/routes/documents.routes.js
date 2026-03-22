/**
 * documents.routes.js — with AES-256-GCM file encryption
 * Place: server/src/routes/documents.routes.js
 *
 * Flow:
 *   Client → multipart file → Express encrypts with AES-256-GCM
 *          → stores encrypted blob in Supabase Storage (.enc extension)
 *          → on download: fetches encrypted blob, decrypts, streams to client
 *
 * Even if someone accesses Supabase Storage directly they get unreadable bytes.
 */
import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { encryptBuffer, decryptBuffer } from '../utils/file.crypto.js';

const router = express.Router();
const BUCKET = 'nagarvaani-docs';
const URL_TTL = 7 * 24 * 60 * 60; // 7 days

const ALLOWED_MIME = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif',
  'image/heic', 'image/heif', 'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif', 'pdf', 'doc', 'docx'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (ALLOWED_MIME.includes(file.mimetype) || ALLOWED_EXT.includes(ext)) cb(null, true);
    else cb(new Error(`Not supported: ${file.mimetype}. Use JPG, PNG, PDF, WEBP, HEIC or DOCX.`));
  },
});

const ensureBucket = async () => {
  const { data } = await supabase.storage.listBuckets();
  if (data?.some(b => b.name === BUCKET)) return;
  await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 25165824 }); // 24MB (encrypted slightly larger)
  console.log(`✅ Bucket "${BUCKET}" ready`);
};
ensureBucket().catch(e => console.warn('Bucket init:', e.message));

const notify = async (userId, type, title, message, link) => {
  try { await supabase.from('notifications').insert({ user_id: userId, type, title, message, link }); }
  catch (_e) { }
};

// ── POST /api/documents/upload ────────────────────────────────────────────────
router.post('/upload',
  protect,
  (req, res, next) => {
    upload.single('file')(req, res, err => {
      if (!err) return next();
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE')
        return res.status(400).json({ error: 'File too large. Max 20 MB.' });
      return res.status(400).json({ error: err.message });
    });
  },
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file received' });

      const docType = req.body.doc_type || 'custom';
      const docName = req.body.doc_name || req.file.originalname;
      const schemeId = req.body.scheme_id || null;
      const milestoneId = req.body.milestone_id || null;
      const ext = req.file.originalname.split('.').pop()?.toLowerCase() || 'bin';

      // Store as .enc — no one can tell what it is
      const filePath = `${req.user.userId}/${docType}_${Date.now()}.enc`;

      console.log(`[UPLOAD] Encrypting: ${req.file.originalname} (${req.file.size} bytes)`);

      // ── Encrypt the file buffer ──────────────────────────────────────────
      const encryptedBuffer = encryptBuffer(req.file.buffer);
      console.log(`[UPLOAD] Encrypted size: ${encryptedBuffer.length} bytes`);

      // ── Upload encrypted blob to Supabase Storage ────────────────────────
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(
        filePath, encryptedBuffer,
        {
          contentType: 'application/octet-stream', // always binary — reveals nothing
          cacheControl: '3600',
          upsert: false,
        }
      );

      if (upErr) {
        if (upErr.message?.toLowerCase().includes('bucket')) {
          await ensureBucket();
          const { error: r2 } = await supabase.storage.from(BUCKET).upload(
            filePath, encryptedBuffer,
            { contentType: 'application/octet-stream', cacheControl: '3600', upsert: false }
          );
          if (r2) return res.status(500).json({ error: 'Storage: ' + r2.message });
        } else {
          return res.status(500).json({ error: 'Storage: ' + upErr.message });
        }
      }

      console.log(`[UPLOAD] ✅ Encrypted file stored: ${filePath}`);

      // ── Save metadata to DB ───────────────────────────────────────────────
      const { data: doc, error: dbErr } = await supabase.from('documents').insert({
        user_id: req.user.userId,
        doc_type: docType,
        doc_name: docName,
        status: 'pending',
        file_path: filePath,
        file_url: null,          // no pre-signed URL — we decrypt on demand
        file_size: req.file.size, // store original size for display
        mime_type: req.file.mimetype,
        scheme_id: schemeId,
        milestone_id: milestoneId,
      }).select().single();

      if (dbErr) {
        console.error('[UPLOAD] DB error:', dbErr.message);
        return res.json({
          id: null, path: filePath,
          doc_type: docType, doc_name: docName, status: 'pending',
          db_error: dbErr.message,
        });
      }

      console.log('[UPLOAD] ✅ DB saved, id:', doc.id);
      await notify(req.user.userId, 'info', 'Document Uploaded',
        `${docName} uploaded securely. Pending admin verification.`, 'p-docs');

      // Return doc with a view URL (our decrypt endpoint)
      return res.json({ ...doc, file_url: `/api/documents/view/${doc.id}` });

    } catch (err) {
      console.error('[UPLOAD] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ── GET /api/documents/view/:id — decrypt and stream ─────────────────────────
// Only the owner can view. Decrypts on the fly, streams original file.
router.get("/view/:id",
  // Accept token from query param (for img/iframe src)
  (req, _res, next) => { if (req.query.token && !req.headers.authorization) { req.headers.authorization = `Bearer ${req.query.token}`; } next(); },
  protect, async (req, res) => {
    try {
      const { data: doc, error } = await supabase.from('documents')
        .select('user_id,file_path,mime_type,doc_name')
        .eq('id', req.params.id).single();

      if (error || !doc) return res.status(404).json({ error: 'Document not found' });
      if (doc.user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
      if (!doc.file_path) return res.status(404).json({ error: 'No file stored' });

      // Download encrypted blob from storage
      const { data: blob, error: dlErr } = await supabase.storage
        .from(BUCKET).download(doc.file_path);
      if (dlErr) return res.status(500).json({ error: 'Storage download failed: ' + dlErr.message });

      // Convert blob to buffer
      const encryptedBuffer = Buffer.from(await blob.arrayBuffer());

      // Decrypt
      const decryptedBuffer = decryptBuffer(encryptedBuffer);

      // Stream original file to client
      res.set({
        'Content-Type': doc.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${doc.doc_name || 'document'}"`,
        'Content-Length': decryptedBuffer.length,
        'Cache-Control': 'private, no-store', // never cache decrypted content
      });
      return res.send(decryptedBuffer);

    } catch (err) {
      if (err.code === 'ERR_CRYPTO_GCM_AUTH_TAG_MISMATCH') {
        return res.status(500).json({ error: 'File integrity check failed — file may be corrupted or tampered' });
      }
      return res.status(500).json({ error: err.message });
    }
  });

// ── GET /api/documents/my ─────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents')
      .select('id,user_id,doc_type,doc_name,file_path,file_size,mime_type,status,verified_by,verified_at,reject_reason,scheme_id,milestone_id,created_at,updated_at')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

    // Add view URL — decrypt on demand, no pre-signed URL needed
    const docs = (data || []).map(doc => ({
      ...doc,
      file_url: doc.file_path ? `/api/documents/view/${doc.id}` : null,
    }));
    return res.json(docs);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── DELETE /api/documents/:id ─────────────────────────────────────────────────
router.delete('/:id', protect, async (req, res) => {
  try {
    const { data: doc } = await supabase.from('documents')
      .select('user_id,file_path').eq('id', req.params.id).single();
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.user_id !== req.user.userId) return res.status(403).json({ error: 'Not authorized' });
    if (doc.file_path) {
      await supabase.storage.from(BUCKET).remove([doc.file_path]);
    }
    await supabase.from('documents').delete().eq('id', req.params.id);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── GET /api/documents/admin/pending ─────────────────────────────────────────
router.get('/admin/pending', protect, async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents')
      .select('id,doc_type,doc_name,file_path,file_size,mime_type,status,created_at,user_id,users(full_name,phone,district)')
      .eq('status', 'pending').order('created_at', { ascending: true });
    if (error) throw new Error(error.message);

    // Admin uses the same decrypt endpoint
    const docs = (data || []).map(d => ({
      ...d,
      file_url: d.file_path ? `/api/documents/view/${d.id}` : null,
    }));
    return res.json(docs);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── PATCH /api/documents/admin/:id ───────────────────────────────────────────
router.patch('/admin/:id', protect, async (req, res) => {
  try {
    const { action, reject_reason } = req.body;
    if (!['verified', 'rejected'].includes(action))
      return res.status(400).json({ error: 'action must be verified or rejected' });

    const { data: doc, error } = await supabase.from('documents').update({
      status: action,
      verified_by: 'District Admin',
      verified_at: new Date().toISOString(),
      reject_reason: reject_reason || null,
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw new Error(error.message);

    await notify(
      doc.user_id,
      action === 'verified' ? 'success' : 'error',
      action === 'verified' ? '✅ Document Verified!' : '❌ Document Rejected',
      action === 'verified'
        ? `Your ${doc.doc_name} has been verified by District Admin.`
        : `Your ${doc.doc_name} was rejected. Reason: ${reject_reason || 'Invalid document'}. Please re-upload.`,
      'p-docs'
    );

    if (doc.milestone_id && action === 'verified') {
      try {
        await supabase.from('user_milestone_progress').update({
          status: 'completed', completed_at: new Date().toISOString(),
        }).eq('milestone_id', doc.milestone_id).eq('user_id', doc.user_id);
      } catch (_e) { }
    }

    return res.json({ ...doc, file_url: `/api/documents/view/${doc.id}` });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── POST /api/documents/admin/bulk ───────────────────────────────────────────
router.post('/admin/bulk', protect, async (req, res) => {
  try {
    const { ids, action, reject_reason } = req.body;
    if (!ids?.length) return res.status(400).json({ error: 'No IDs provided' });

    const { data: docs, error } = await supabase.from('documents').update({
      status: action,
      verified_by: 'District Admin',
      verified_at: new Date().toISOString(),
      reject_reason: reject_reason || null,
    }).in('id', ids).select('id,user_id,doc_name');
    if (error) throw new Error(error.message);

    if (docs?.length) {
      try {
        await supabase.from('notifications').insert(
          docs.map(d => ({
            user_id: d.user_id,
            type: action === 'verified' ? 'success' : 'error',
            title: action === 'verified' ? '✅ Document Verified' : '❌ Document Rejected',
            message: action === 'verified'
              ? `${d.doc_name} verified by District Admin.`
              : `${d.doc_name} rejected. ${reject_reason || 'Please re-upload.'}`,
            link: 'p-docs',
          }))
        );
      } catch (_e) { }
    }
    return res.json({ updated: ids.length });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

export default router;