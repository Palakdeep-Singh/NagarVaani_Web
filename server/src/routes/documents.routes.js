/**
 * documents.routes.js
 * Place: server/src/routes/documents.routes.js
 *
 * CORRECTED FLOW:
 * - Citizen uploads → auto-status "available" → instantly usable in scheme apps
 * - No admin approval needed to use documents
 * - Admin can only flag/unflag suspicious documents
 * - Document Locker = personal secure file cabinet, not approval queue
 */
import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { supabase } from '../config/supabase.js';
import { encryptBuffer, decryptBuffer } from '../utils/file.crypto.js';

const router = express.Router();
const BUCKET = 'nagarvaani-docs';

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
  await supabase.storage.createBucket(BUCKET, { public: false, fileSizeLimit: 25165824 });
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
      const filePath = `${req.user.userId}/${docType}_${Date.now()}.enc`;

      console.log(`[UPLOAD] Encrypting: ${req.file.originalname} (${req.file.size} bytes)`);

      // Encrypt before upload
      const encryptedBuffer = encryptBuffer(req.file.buffer);

      const { error: upErr } = await supabase.storage.from(BUCKET).upload(
        filePath, encryptedBuffer,
        { contentType: 'application/octet-stream', cacheControl: '3600', upsert: false }
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

      console.log(`[UPLOAD] ✅ Encrypted & stored: ${filePath}`);

      // Save to DB — status is immediately 'available', no approval needed
      const { data: doc, error: dbErr } = await supabase.from('documents').insert({
        user_id: req.user.userId,
        doc_type: docType,
        doc_name: docName,
        status: 'available',    // ← instantly usable, no approval gate
        file_path: filePath,
        file_url: null,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        scheme_id: schemeId,
        milestone_id: milestoneId,
      }).select().single();

      if (dbErr) {
        console.error('[UPLOAD] DB error:', dbErr.message);
        return res.json({
          id: null, path: filePath, doc_type: docType,
          doc_name: docName, status: 'available', db_error: dbErr.message,
        });
      }

      console.log('[UPLOAD] ✅ Saved to DB, id:', doc.id);
      return res.json({ ...doc, file_url: `/api/documents/view/${doc.id}` });

    } catch (err) {
      console.error('[UPLOAD] Error:', err.message);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ── GET /api/documents/view/:id — decrypt and stream to owner ─────────────────
router.get('/view/:id',
  (req, _res, next) => {
    if (req.query.token && !req.headers.authorization)
      req.headers.authorization = `Bearer ${req.query.token}`;
    next();
  },
  protect,
  async (req, res) => {
    try {
      const { data: doc, error } = await supabase.from('documents')
        .select('user_id,file_path,mime_type,doc_name')
        .eq('id', req.params.id).single();

      if (error || !doc) return res.status(404).json({ error: 'Document not found' });
      
      const isOwner = doc.user_id === req.user.userId;
      const isAdmin = ['central', 'state', 'district'].includes(req.user.role);

      if (!isOwner && !isAdmin) {
        console.warn(`[DOC VIEW] 403 Forbidden: Owner(${doc.user_id}) != Requester(Citizen:${req.user.userId}, Admin:${req.user.adminId})`);
        return res.status(403).json({ error: 'Not authorized' });
      }
      
      if (!doc.file_path) return res.status(404).json({ error: 'No file stored' });

      const { data: blob, error: dlErr } = await supabase.storage
        .from(BUCKET).download(doc.file_path);
      if (dlErr) return res.status(500).json({ error: 'Download failed: ' + dlErr.message });

      const decryptedBuffer = decryptBuffer(Buffer.from(await blob.arrayBuffer()));

      res.set({
        'Content-Type': doc.mime_type || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${doc.doc_name}"`,
        'Content-Length': decryptedBuffer.length,
        'Cache-Control': 'private, no-store',
      });
      return res.send(decryptedBuffer);

    } catch (err) {
      if (err.code === 'ERR_CRYPTO_GCM_AUTH_TAG_MISMATCH')
        return res.status(500).json({ error: 'File integrity check failed' });
      return res.status(500).json({ error: err.message });
    }
  }
);

// ── GET /api/documents/my ─────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents')
      .select('id,user_id,doc_type,doc_name,file_path,file_size,mime_type,status,scheme_id,milestone_id,created_at,updated_at')
      .eq('user_id', req.user.userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);

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
    if (doc.file_path) await supabase.storage.from(BUCKET).remove([doc.file_path]);
    await supabase.from('documents').delete().eq('id', req.params.id);
    return res.json({ success: true });
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── GET /api/documents/for-scheme — get citizen's available docs for scheme ───
// Used when applying to a scheme — returns list of available docs
router.get('/for-scheme', protect, async (req, res) => {
  try {
    const { data, error } = await supabase.from('documents')
      .select('id,doc_type,doc_name,file_size,mime_type,status,created_at')
      .eq('user_id', req.user.userId)
      .eq('status', 'available')
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return res.json(data || []);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── ADMIN: GET flagged/all docs — scoped by role ──────────────────────────────
router.get('/admin/all', protect, async (req, res) => {
  try {
    let query = supabase.from('documents')
      .select('id,doc_type,doc_name,file_size,mime_type,status,created_at,user_id,users!inner(full_name,phone,district,state)')
      .order('created_at', { ascending: false }).limit(200);

    // Role-based scoping
    if (req.user?.role === 'district') {
      query = query.eq('users.district', req.user.district);
    } else if (req.user?.role === 'state') {
      query = query.eq('users.state', req.user.state);
    }
    // Central sees all

    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return res.json((data || []).map(d => ({
      ...d, file_url: `/api/documents/view/${d.id}`,
    })));
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── ADMIN: Flag a suspicious document ────────────────────────────────────────
router.patch('/admin/:id/flag', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const { data: doc, error } = await supabase.from('documents').update({
      status: 'flagged',
      updated_at: new Date().toISOString(),
    }).eq('id', req.params.id).select().single();
    if (error) throw new Error(error.message);

    await notify(doc.user_id, 'warning', '⚠️ Document Flagged',
      `Your ${doc.doc_name} was flagged by District Admin. Reason: ${reason || 'Please re-upload a clearer copy.'}`,
      'p-docs');
    return res.json(doc);
  } catch (err) { return res.status(500).json({ error: err.message }); }
});

// ── ADMIN: View a document ───────────────────────────────────────────────────
router.get('/admin/view/:id', protect, async (req, res) => {
  try {
    const { data: doc, error } = await supabase.from('documents')
      .select('*, users!inner(district,state)')
      .eq('id', req.params.id).single();

    if (error || !doc) return res.status(404).json({ error: 'Document not found' });

    // Scoping check
    if (req.user.role === 'district' && doc.users.district !== req.user.district)
      return res.status(403).json({ error: 'Not authorized for this district' });
    if (req.user.role === 'state' && doc.users.state !== req.user.state)
      return res.status(403).json({ error: 'Not authorized for this state' });

    const { data: blob, error: dlErr } = await supabase.storage
      .from(BUCKET).download(doc.file_path);
    if (dlErr) return res.status(500).json({ error: 'Download failed: ' + dlErr.message });

    const decryptedBuffer = decryptBuffer(Buffer.from(await blob.arrayBuffer()));

    res.set({
      'Content-Type': doc.mime_type || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${doc.doc_name}"`,
      'Content-Length': decryptedBuffer.length,
      'Cache-Control': 'private, no-store',
    });
    return res.send(decryptedBuffer);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;