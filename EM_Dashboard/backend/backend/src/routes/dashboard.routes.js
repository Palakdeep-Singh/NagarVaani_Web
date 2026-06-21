/**
 * dashboard.routes.js
 * Serves real-time telemetry from MongoDB — Booths, ElectionDay, Incidents.
 */
import express from 'express';
import Booth from '../models/Booth.js';
import ElectionDay from '../models/ElectionDay.js';
import Incident from '../models/Incident.js';
import Checklist from '../models/Checklist.js';
import Complaint from '../models/Complaint.js';
import Directive from '../models/Directive.js';
import Asset from '../models/Asset.js';

const router = express.Router();

// ─── Helper: map DB docs → frontend booth payload ─────────────────────────────
function buildBoothPayload(booth, ed, incidents) {
  const voted   = ed?.currentTurnout?.voted || 0;
  const total   = booth.totalVotersRegistered || 1;
  const pct     = ed?.currentTurnout?.percentage ?? Math.round((voted / total) * 100);
  const qCount  = ed?.queueStatus?.count || 0;
  const qWait   = ed?.queueStatus?.estimatedWait || 0;
  const evmStat = ed?.evmStatus?.health || booth.evm?.status || 'Operational';
  const evmBatt = ed?.evmStatus?.batteryLevel ?? booth.evm?.batteryLevel ?? 100;

  // Determine sector status
  const hasEVMFault = evmStat === 'EVM Fault' || evmStat === 'Battery Low';
  const hasLongQueue = qCount > 50;
  const hasTurnoutDelay = pct < 35 && voted > 0;
  const hasStaffMissing = incidents.some(i => i.type === 'Staff Missing' && i.status === 'Open');

  let sectorStatus = 'Healthy';
  if (hasEVMFault)       sectorStatus = 'EVM Fault';
  else if (hasLongQueue) sectorStatus = 'Long Queue';
  else if (hasTurnoutDelay) sectorStatus = 'Turnout Delay';

  const soVisit = ed?.presenceVerification;
  const visitStatus = soVisit?.soVisitTime ? 'Visited' : 'Pending';
  const visitTime = soVisit?.soVisitNote || null;

  // Health score calculation (0-100)
  let healthScore = 100;
  if (hasEVMFault)       healthScore -= 30;
  if (evmBatt < 20)      healthScore -= 15;
  if (hasLongQueue)      healthScore -= 20;
  if (hasTurnoutDelay)   healthScore -= 10;
  if (hasStaffMissing)   healthScore -= 10;
  healthScore = Math.max(30, healthScore);

  return {
    id:          booth.boothNumber,
    _id:         booth._id,
    boothCode:   booth.boothCode,
    name:        booth.location?.buildingName || `Booth ${booth.boothNumber}`,
    ward:        booth.location?.ward || '',
    constituency: 'AC-40 New Delhi',
    status:      sectorStatus,
    turnout: {
      percentage: pct,
      voted,
      total,
    },
    queue: {
      length:   qCount > 50 ? 'High' : qCount > 20 ? 'Medium' : 'Low',
      count:    qCount,
      waitTime: qWait,
    },
    health: {
      score: healthScore,
      checks: {
        evm:      !hasEVMFault,
        power:    true,
        queue:    hasLongQueue ? 'error' : qCount > 20 ? 'warning' : 'ok',
        internet: true,
        staff:    !hasStaffMissing,
      },
    },
    evm: {
      id:          booth.evm?.cuSerial || `EVM-${booth.boothNumber}`,
      status:      evmStat,
      battery:     evmBatt,
      lastChecked: booth.evm?.lastChecked || new Date(),
    },
    evmBattery:  evmBatt,
    evmSignal:   evmBatt > 70 ? 'Strong' : evmBatt > 40 ? 'Medium' : 'Weak',
    evmStatus:   evmStat,
    voters:      total,
    voted,
    queueCount:  qCount,
    visitStatus,
    visitTime,
    gpsVerified: !!soVisit?.soGpsLat,
    incidents:   incidents.map(i => ({
      id:       i.incidentCode,
      _id:      i._id,
      type:     i.type,
      severity: i.severity,
      status:   i.status,
      time:     i.createdAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
      detail:   i.description,
      boothId:  booth.boothNumber,
    })),
    hourlyTurnout: ed?.turnoutLog?.map((t, idx) => ({
      hour: t.time?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || `H${idx}`,
      value: t.votersVoted,
    })) || [],
    sectorDirective: null,
  };
}

// ─── GET /api/booth/status ─────────────────────────────────────────────────────
// Returns summary of all booths, or a single booth if ?booth_id= is specified.
router.get('/booth/status', async (req, res) => {
  try {
    const booths = await Booth.find({ isActive: true }).lean();

    // Fetch all ElectionDay records for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const edDocs = await ElectionDay.find({ electionDate: { $gte: today } }).lean();
    const incDocs = await Incident.find({ status: { $ne: 'Resolved' } }).lean();

    // Build lookup maps
    const edByBooth  = {};
    edDocs.forEach(ed => { edByBooth[ed.boothId.toString()] = ed; });
    const incByBooth = {};
    incDocs.forEach(i => {
      const key = i.boothId?.toString();
      if (!key) return;
      if (!incByBooth[key]) incByBooth[key] = [];
      incByBooth[key].push(i);
    });

    const allBooths = booths.map(b => {
      const ed   = edByBooth[b._id.toString()] || null;
      const incs = incByBooth[b._id.toString()] || [];
      return buildBoothPayload(b, ed, incs);
    });

    // Single booth view
    if (req.query.booth_id) {
      const boothId = parseInt(req.query.booth_id, 10);
      const booth   = allBooths.find(b => b.id === boothId) || allBooths[0];
      
      // Fetch directives for this booth or its audience
      const directives = await Directive.find({
        $or: [
          { targetAudience: 'All' },
          { targetAudience: 'Specific Booth', targetBoothId: booth._id },
          { targetAudience: 'All PROs in AC' } // Assumes AC match in a larger system
        ]
      }).sort({ createdAt: -1 }).limit(5).lean();

      // Fetch checklists for this booth
      const checklists = await Checklist.find({ boothId: booth._id }).lean();

      return res.json({
        ...booth,
        spareOfficers: [
          { name: 'Ramesh Kumar', status: 'Standby', contact: '+91 98765 43210' },
          { name: 'Suresh Singh', status: 'Standby', contact: '+91 98765 43211' },
          { name: 'Anita Sharma', status: 'Standby', contact: '+91 98765 43212' },
        ],
        returningOfficerRequests: directives.map(d => ({
          id: d._id.toString(),
          text: d.messageText,
          time: new Date(d.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          status: 'Pending', // Simplified for now
          priority: d.priority
        })),
        checklists: checklists.map(c => ({
          id: c.milestoneName.toLowerCase().replace(/ /g, '-'),
          label: c.milestoneName,
          time: c.completedAt ? new Date(c.completedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          checked: c.status === 'Completed'
        }))
      });
    }

    // Summary list view (for SO / RO / DEO / above dashboards)
    const summary = allBooths.map(b => ({
      id:             b.id,
      _id:            b._id,
      name:           b.name,
      constituency:   b.constituency,
      status:         b.status,
      turnout:        b.turnout,
      queue:          b.queue,
      healthScore:    b.health.score,
      healthChecks:   b.health.checks,
      evmBattery:     b.evmBattery,
      evmStatus:      b.evmStatus,
      evmSignal:      b.evmSignal,
      voters:         b.voters,
      voted:          b.voted,
      queueCount:     b.queueCount,
      visitStatus:    b.visitStatus,
      visitTime:      b.visitTime,
      gpsVerified:    b.gpsVerified,
      incidentsCount: b.incidents.length,
    }));

    // Aggregate KPIs
    const totalVoted     = allBooths.reduce((s, b) => s + b.turnout.voted, 0);
    const totalRegistered = allBooths.reduce((s, b) => s + b.turnout.total, 0);
    const sectorTurnout  = totalRegistered > 0 ? Math.round((totalVoted / totalRegistered) * 100) : 0;
    const openIncidents  = incDocs.filter(i => i.status !== 'Resolved');
    const alerts         = openIncidents.map(i => {
      const booth = booths.find(b => b._id.toString() === i.boothId?.toString());
      return {
        id:       i.incidentCode,
        boothId:  booth?.boothNumber,
        type:     i.type,
        detail:   i.description,
        priority: i.severity,
        time:     i.createdAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
      };
    });

    return res.json({
      booths: summary,
      kpi: {
        totalBooths:      allBooths.length,
        activeBooths:     allBooths.length,
        sectorTurnout,
        totalVoted,
        totalRegistered,
        visitsComplete:   allBooths.filter(b => b.visitStatus === 'Visited').length,
        openAlerts:       openIncidents.length,
        evmFaults:        allBooths.filter(b => b.evmStatus === 'EVM Fault').length,
      },
      alerts,
      incidents: openIncidents.map(i => ({
        id:       i.incidentCode,
        type:     i.type,
        severity: i.severity,
        status:   i.status,
        boothId:  booths.find(b => b._id.toString() === i.boothId?.toString())?.boothNumber,
        time:     i.createdAt?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) || 'N/A',
      })),
      spareOfficers: [
        { name: 'Ramesh Kumar', status: 'Standby', contact: '+91 98765 43210' },
        { name: 'Suresh Singh', status: 'Standby', contact: '+91 98765 43211' },
        { name: 'Anita Sharma', status: 'Standby', contact: '+91 98765 43212' },
      ],
      returningOfficerRequests: [
        { id: 'RO-REQ-101', text: 'Verify EVM battery at Booth 104 immediately.', time: '11:00 AM', status: 'Pending' },
        { id: 'RO-REQ-102', text: 'Report on voter queue at Government School.', time: '10:30 AM', status: 'Acknowledged' },
      ],
    });
  } catch (err) {
    console.error('[GET /booth/status]', err);
    res.status(500).json({ error: 'Failed to fetch booth telemetry' });
  }
});

// ─── POST /api/complaints ─────────────────────────────────────────────────────
// Log a new citizen complaint / incident to MongoDB
router.post('/complaints', async (req, res) => {
  try {
    const { id, type, citizen, description } = req.body;
    const boothCode = req.query.booth_id;

    // Find the booth
    const booth = boothCode
      ? await Booth.findOne({ boothNumber: parseInt(boothCode, 10) })
      : await Booth.findOne({});

    const getCategory = (t = '') => {
      const lc = t.toLowerCase();
      if (lc.includes('evm')) return 'EVM Fault';
      if (lc.includes('queue') || lc.includes('line')) return 'Long Queue';
      if (lc.includes('power')) return 'Power Cut';
      if (lc.includes('security') || lc.includes('dispute')) return 'Law & Order';
      return 'Other';
    };

    const incType = getCategory(type);
    const count   = await Complaint.countDocuments();
    const complaint = await Complaint.create({
      complaintCode:   id || `CMP-CIT-${count + 1}`,
      citizenName:     citizen || 'Anonymous',
      type:            incType,
      description:     description || type,
      boothId:         booth?._id,
      acId:            booth?.acId,
      status:          'Open',
      severity:        incType === 'EVM Fault' || incType === 'Law & Order' ? 'High' : 'Medium',
      resolutionTimeline: [{ action: 'Reported by Citizen', note: 'Logged via API', timestamp: new Date() }],
    });

    // Update ElectionDay queue if it's a queue complaint
    if (booth && incType === 'Long Queue') {
      await ElectionDay.findOneAndUpdate(
        { boothId: booth._id },
        { $inc: { 'queueStatus.count': 5, 'queueStatus.estimatedWait': 6 }, 'queueStatus.lastUpdated': new Date() }
      );
    }

    return res.json({ status: 'success', message: 'Complaint registered', incidentId: complaint.complaintCode });
  } catch (err) {
    console.error('[POST /complaints]', err);
    res.status(500).json({ error: 'Failed to register complaint' });
  }
});

// ─── POST /api/actions ────────────────────────────────────────────────────────
// Performs lifecycle actions on incidents and election day telemetry
router.post('/actions', async (req, res) => {
  try {
    const { action, payload } = req.body;
    const boothNum = parseInt(req.query.booth_id || 147, 10);
    const booth = await Booth.findOne({ boothNumber: boothNum });

    // ── Resolve Complaint ────────────────────────────────────────────────────
    if (action === 'resolve_complaint') {
      await Incident.findOneAndUpdate(
        { incidentCode: payload?.id },
        { status: 'Resolved', resolvedAt: new Date(), $push: { timeline: { action: 'Resolved', actorRole: 'Officer', timestamp: new Date() } } }
      );
      return res.json({ status: 'success', message: `Complaint ${payload?.id} resolved` });
    }

    // ── Escalate Complaint ───────────────────────────────────────────────────
    if (action === 'escalate_complaint') {
      await Incident.findOneAndUpdate(
        { incidentCode: payload?.id },
        { status: 'Escalated', $push: { timeline: { action: 'Escalated', actorRole: 'Officer', timestamp: new Date() } } }
      );
      return res.json({ status: 'success', message: `Complaint ${payload?.id} escalated` });
    }

    // ── Verify Complaint ─────────────────────────────────────────────────────
    if (action === 'verify_complaint') {
      await Incident.findOneAndUpdate(
        { incidentCode: payload?.id },
        { status: 'Acknowledged', $push: { timeline: { action: 'Verified by PO', actorRole: 'PRO', timestamp: new Date() } } }
      );
      return res.json({ status: 'success', message: `Complaint ${payload?.id} verified` });
    }

    // ── Report Queue ─────────────────────────────────────────────────────────
    if (action === 'report_queue') {
      if (booth) {
        await ElectionDay.findOneAndUpdate(
          { boothId: booth._id },
          { $inc: { 'queueStatus.count': 5, 'queueStatus.estimatedWait': 6 }, 'queueStatus.lastUpdated': new Date() }
        );
      }
      return res.json({ status: 'success', message: 'Queue reported' });
    }

    // ── Report EVM Fault ─────────────────────────────────────────────────────
    if (action === 'report_fault') {
      if (booth) {
        await Booth.findByIdAndUpdate(booth._id, { 'evm.status': 'EVM Fault' });
        await ElectionDay.findOneAndUpdate(
          { boothId: booth._id },
          { 'evmStatus.health': 'EVM Fault' }
        );
        await Incident.create({
          incidentCode: `INC-EVM-${Date.now()}`,
          boothId: booth._id,
          acId: booth.acId,
          reportedByRole: 'PRO',
          type: 'EVM Fault',
          severity: 'Critical',
          description: 'EVM Fault reported by Presiding Officer',
          status: 'Open',
          timeline: [{ action: 'EVM Fault Reported', actorRole: 'PRO', timestamp: new Date() }],
        });
      }
      return res.json({ status: 'success', message: 'EVM fault reported' });
    }

    // ── Dispatch Spare Officer ───────────────────────────────────────────────
    if (action === 'dispatch_spare_officer') {
      const { officerName } = payload || {};
      return res.json({ status: 'success', message: `Spare officer ${officerName} dispatched` });
    }

    // ── Send PO Directive ────────────────────────────────────────────────────
    if (action === 'send_po_directive') {
      const { boothId: targetBoothNum, message } = payload || {};
      const targetBooth = await Booth.findOne({ boothNumber: targetBoothNum });
      if (targetBooth) {
        await Incident.create({
          incidentCode: `INC-DIR-${Date.now()}`,
          boothId: targetBooth._id,
          acId: targetBooth.acId,
          reportedByRole: 'SO',
          type: 'Other',
          severity: 'Low',
          description: `DIRECTIVE: ${message}`,
          status: 'Acknowledged',
          timeline: [{ action: 'Directive Sent by SO', actorRole: 'SO', note: message, timestamp: new Date() }],
        });
      }
      return res.json({ status: 'success', message: `Directive sent to Booth ${targetBoothNum}` });
    }

    // ── Report Custom Incident ───────────────────────────────────────────────
    if (action === 'report_incident') {
      if (booth) {
        const count = await Incident.countDocuments();
        await Incident.create({
          incidentCode: `INC-${count + 1}`,
          boothId: booth._id,
          acId: booth.acId,
          reportedByRole: 'Officer',
          type: 'Other',
          severity: 'Medium',
          description: payload?.type || 'Custom Incident',
          status: 'Open',
          timeline: [{ action: 'Reported', actorRole: 'Officer', timestamp: new Date() }],
        });
      }
      return res.json({ status: 'success', message: 'Custom incident logged' });
    }

    // ── Acknowledge Directive ────────────────────────────────────────────────
    if (action === 'acknowledge_directive') {
      return res.json({ status: 'success', message: 'Directive acknowledged' });
    }

    // ── Acknowledge RO Request ───────────────────────────────────────────────
    if (action === 'acknowledge_ro_request') {
      return res.json({ status: 'success', message: `RO Request ${payload?.id} acknowledged` });
    }

    // ── Request Staff ────────────────────────────────────────────────────────
    if (action === 'request_staff') {
      if (booth) {
        const count = await Incident.countDocuments();
        await Incident.create({
          incidentCode: `INC-STAFF-${count + 1}`,
          boothId: booth._id,
          acId: booth.acId,
          reportedByRole: 'PRO',
          type: 'Staff Missing',
          severity: 'Medium',
          description: 'Extra staff requested by Presiding Officer',
          status: 'Open',
          timeline: [{ action: 'Staff Request', actorRole: 'PRO', timestamp: new Date() }],
        });
      }
      return res.json({ status: 'success', message: 'Extra staff requested' });
    }

    // ── Request EVM Replacement ──────────────────────────────────────────────
    if (action === 'request_replacement') {
      if (booth) {
        await Booth.findByIdAndUpdate(booth._id, { 'evm.status': 'Awaiting Replacement' });
        await ElectionDay.findOneAndUpdate(
          { boothId: booth._id },
          { 'evmStatus.health': 'Awaiting Replacement' }
        );
      }
      return res.json({ status: 'success', message: 'EVM replacement requested' });
    }

    // ── Checklist Toggle ─────────────────────────────────────────────────────
    if (action === 'checklist_toggle') {
      return res.json({ status: 'success', message: 'Checklist updated' });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err) {
    console.error('[POST /actions]', err);
    res.status(500).json({ error: 'Action failed' });
  }
});

// ─── POST /api/checklist/:id ──────────────────────────────────────────────────
router.post('/checklist/:id', async (req, res) => {
  try {
    const boothIdParam = req.query.booth_id;
    const milestoneName = req.params.id.replace(/-/g, ' '); // e.g., 'mock-poll' -> 'mock poll'

    let booth;
    if (boothIdParam) {
      booth = await Booth.findOne({ boothNumber: parseInt(boothIdParam, 10) });
    }

    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' });
    }

    // Upsert the checklist
    const checklist = await Checklist.findOneAndUpdate(
      { boothId: booth._id, milestoneName: { $regex: new RegExp(milestoneName, 'i') } },
      { 
        status: 'Completed', 
        completedAt: new Date()
      },
      { new: true, upsert: true }
    );

    return res.json({ status: 'success', message: `Checklist item '${milestoneName}' toggled`, checklist });
  } catch (err) {
    console.error('[POST /checklist/:id]', err);
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// ─── POST /api/assistant/ask ──────────────────────────────────────────────────
router.post('/assistant/ask', async (req, res) => {
  const { question } = req.body;
  const q = (question || '').toLowerCase();

  let ans = 'Election Day SOP Guideline: For details check the official Handbook for Presiding Officers (2026 Edition) or contact your designated Sector Officer immediately.';
  if (q.includes('wrong booth'))          ans = 'As per EC SOP 4.2 - Politely inform the voter and guide them to their correct booth.';
  else if (q.includes('evm'))             ans = 'As per EC SOP 7.1 - If EVM malfunctions, halt polling immediately. Notify the Sector Officer for replacement.';
  else if (q.includes('document') || q.includes('id card')) ans = 'As per EC Guidelines - Voters can use EPIC or any of the 12 alternative documents including Aadhaar, PAN, passport.';
  else if (q.includes('agent'))           ans = 'As per EC SOP 3.4 - Polling agents must present credentials signed by candidates.';
  else if (q.includes('queue'))           ans = 'Deploy additional queue management barriers and request spare staff from Sector Officer via the Resource Deployment panel.';

  return res.json({ answer: ans });
});

export default router;
