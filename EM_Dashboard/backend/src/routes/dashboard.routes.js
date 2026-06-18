import express from 'express';

const router = express.Router();

// Mock database state for multiple booths with advanced complaint statuses
const boothStates = {
  147: {
    booth: {
      id: 147,
      name: "Government School, Ward 12",
      constituency: "56 - North City",
      status: "Operational"
    },
    turnout: {
      percentage: 42,
      voted: 543,
      total: 1287
    },
    queue: {
      length: "Medium",
      count: 15,
      waitTime: 18
    },
    time: {
      current: "11:34 AM",
      date: "25 Apr 2024"
    },
    health: {
      score: 87,
      checks: {
        evm: true,
        power: true,
        queue: "warning",
        internet: true,
        staff: true
      }
    },
    officers: [
      { id: 1, name: "Polling Officer 1", status: "Present" },
      { id: 2, name: "Polling Officer 2", status: "Present" },
      { id: 3, name: "Polling Officer 3", status: "Present" },
      { id: 4, name: "Polling Officer 4", status: "Not Checked In" }
    ],
    hourlyTurnout: [
      { hour: "8 AM", value: 7 },
      { hour: "9 AM", value: 18 },
      { hour: "10 AM", value: 29 },
      { hour: "11 AM", value: 42 },
      { hour: "12 PM", value: null },
      { hour: "1 PM", value: null },
      { hour: "2 PM", value: null }
    ],
    incidents: [
      { id: "INC-721", type: "Power Fluctuation", time: "10:58 AM", status: "In Progress" },
      { id: "INC-720", type: "Voter Assistance Required", time: "09:41 AM", status: "Resolved" }
    ],
    evm: {
      id: "EVM-147A",
      status: "Operational",
      battery: 87,
      lastChecked: "11:20 AM"
    },
    complaints: [
      { id: "XXX45", type: "Power Outage in Booth", citizen: "Citizen ID: XXX45", time: "11:10 AM", status: "pending", category: "Power", logs: [] },
      { id: "XXX12", type: "Long Queue Outside Booth", citizen: "Citizen ID: XXX12", time: "11:08 AM", status: "pending", category: "Queue", logs: [] }
    ],
    complaintsHistory: [],
    checklist: [
      { id: 1, label: "Mock Poll Completed", time: "07:15 AM", checked: true },
      { id: 2, label: "EVM Sealed", time: "07:25 AM", checked: true },
      { id: 3, label: "Staff Present", time: "07:30 AM", checked: true },
      { id: 4, label: "Materials Received", time: "07:35 AM", checked: true },
      { id: 5, label: "Poll Opened", time: "07:45 AM", checked: true }
    ]
  },
  148: {
    booth: {
      id: 148,
      name: "Community Center, Ward 15",
      constituency: "56 - North City",
      status: "Operational"
    },
    turnout: {
      percentage: 58,
      voted: 702,
      total: 1210
    },
    queue: {
      length: "Low",
      count: 6,
      waitTime: 5
    },
    time: {
      current: "11:34 AM",
      date: "25 Apr 2024"
    },
    health: {
      score: 95,
      checks: {
        evm: true,
        power: true,
        queue: "ok",
        internet: true,
        staff: true
      }
    },
    officers: [
      { id: 1, name: "Polling Officer 5", status: "Present" },
      { id: 2, name: "Polling Officer 6", status: "Present" },
      { id: 3, name: "Polling Officer 7", status: "Present" }
    ],
    hourlyTurnout: [
      { hour: "8 AM", value: 12 },
      { hour: "9 AM", value: 25 },
      { hour: "10 AM", value: 43 },
      { hour: "11 AM", value: 58 }
    ],
    incidents: [
      { id: "INC-780", type: "Voter ID Card Dispute", time: "08:15 AM", status: "Resolved" }
    ],
    evm: {
      id: "EVM-148B",
      status: "Operational",
      battery: 92,
      lastChecked: "11:05 AM"
    },
    complaints: [],
    complaintsHistory: [],
    checklist: [
      { id: 1, label: "Mock Poll Completed", time: "07:05 AM", checked: true },
      { id: 2, label: "EVM Sealed", time: "07:10 AM", checked: true },
      { id: 3, label: "Staff Present", time: "07:00 AM", checked: true },
      { id: 4, label: "Materials Received", time: "07:15 AM", checked: true },
      { id: 5, label: "Poll Opened", time: "07:30 AM", checked: true }
    ]
  },
  149: {
    booth: {
      id: 149,
      name: "Panchayat Office, Ward 3",
      constituency: "57 - South City",
      status: "Critical Issue"
    },
    turnout: {
      percentage: 21,
      voted: 295,
      total: 1400
    },
    queue: {
      length: "High",
      count: 42,
      waitTime: 50
    },
    time: {
      current: "11:34 AM",
      date: "25 Apr 2024"
    },
    health: {
      score: 55,
      checks: {
        evm: false,
        power: true,
        queue: "error",
        internet: true,
        staff: true
      }
    },
    officers: [
      { id: 1, name: "Polling Officer 8", status: "Present" },
      { id: 2, name: "Polling Officer 9", status: "Not Checked In" }
    ],
    hourlyTurnout: [
      { hour: "8 AM", value: 5 },
      { hour: "9 AM", value: 10 },
      { hour: "10 AM", value: 16 },
      { hour: "11 AM", value: 21 }
    ],
    incidents: [
      { id: "INC-791", type: "EVM Machine Hanging", time: "11:15 AM", status: "In Progress" },
      { id: "INC-790", type: "Long Wait Queue Complaint", time: "10:45 AM", status: "In Progress" }
    ],
    evm: {
      id: "EVM-149C",
      status: "Awaiting Replacement",
      battery: 32,
      lastChecked: "11:15 AM"
    },
    complaints: [
      { id: "YYY88", type: "EVM Out of Order / Faulty", citizen: "Citizen ID: YYY88", time: "11:14 AM", status: "escalated", category: "EVM", logs: ["Escalated to Sector Officer"] }
    ],
    complaintsHistory: [],
    checklist: [
      { id: 1, label: "Mock Poll Completed", time: "07:30 AM", checked: true },
      { id: 2, label: "EVM Sealed", time: "07:35 AM", checked: true },
      { id: 3, label: "Staff Present", time: "07:45 AM", checked: true },
      { id: 4, label: "Materials Received", time: "07:50 AM", checked: true },
      { id: 5, label: "Poll Opened", time: "08:00 AM", checked: true }
    ]
  }
};

const spareOfficers = [
  { name: "Ramesh Kumar", status: "Standby", contact: "+91 98765 43210" },
  { name: "Suresh Singh", status: "Standby", contact: "+91 98765 43211" },
  { name: "Anita Sharma", status: "Standby", contact: "+91 98765 43212" }
];

const returningOfficerRequests = [
  { id: "RO-REQ-101", text: "Verify EVM battery levels at Booth 149 immediately.", time: "11:00 AM", status: "Pending" },
  { id: "RO-REQ-102", text: "Report on voter queue accumulation at Ward 12 Government School.", time: "10:30 AM", status: "Acknowledged" }
];

// Map raw issue titles to clean UI categories
const getIssueCategory = (type) => {
  const t = type.toLowerCase();
  if (t.includes('evm') || t.includes('electronic')) return 'EVM';
  if (t.includes('queue') || t.includes('line') || t.includes('wait')) return 'Queue';
  if (t.includes('power') || t.includes('light') || t.includes('electricity')) return 'Power';
  if (t.includes('disability') || t.includes('accessibility') || t.includes('assistance')) return 'Accessibility';
  if (t.includes('security') || t.includes('sos') || t.includes('dispute') || t.includes('fight')) return 'Security';
  return 'Operations';
};

// GET booth status / multi-booth oversight list
router.get('/booth/status', (req, res) => {
  const boothId = parseInt(req.query.booth_id || 147, 10);
  const data = boothStates[boothId] || boothStates[147];

  // Dynamic updates
  const voted = data.turnout.voted;
  const total = data.turnout.total;
  data.turnout.percentage = Math.round((voted / total) * 100);

  // Sync booth overall status
  const hasEscalated = data.complaints.some(c => c.status === 'escalated');
  if (hasEscalated || !data.health.checks.evm) {
    data.booth.status = "Critical Issue";
  } else {
    data.booth.status = "Operational";
  }

  // If asking for a specific booth, return it
  if (req.query.booth_id) {
    return res.json({
      ...data,
      spareOfficers,
      returningOfficerRequests
    });
  }

  // If asking for summary overview (CM list), return summary of all booths
  const summary = Object.keys(boothStates).map(id => {
    const b = boothStates[id];
    // Sync status of each booth
    const boothHasEscalated = b.complaints.some(c => c.status === 'escalated');
    b.booth.status = (boothHasEscalated || !b.health.checks.evm) ? "Critical Issue" : "Operational";

    return {
      id: b.booth.id,
      name: b.booth.name,
      constituency: b.booth.constituency,
      status: b.booth.status,
      turnout: b.turnout,
      queue: b.queue,
      healthScore: b.health.score,
      healthChecks: b.health.checks,
      incidentsCount: b.incidents.length,
      complaintsCount: b.complaints.filter(c => c.status === 'pending').length,
      escalatedCount: b.complaints.filter(c => c.status === 'escalated').length
    };
  });

  return res.json({
    booths: summary,
    selectedBooth: data,
    spareOfficers,
    returningOfficerRequests
  });
});

// POST register complaint from citizen
router.post('/complaints', (req, res) => {
  const { id, type, citizen, time, description } = req.body;
  const boothId = parseInt(req.query.booth_id || 147, 10);
  const data = boothStates[boothId] || boothStates[147];

  const category = getIssueCategory(type);
  const newComplaint = {
    id,
    type,
    citizen: citizen || `Citizen ID: ${id}`,
    time: time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    description,
    status: "pending",
    category: category,
    logs: []
  };

  data.complaints.unshift(newComplaint);

  // Update queue telemetry if voter reports a long queue
  if (category === "Queue") {
    data.queue.count += 2;
    data.queue.waitTime += 3;
    if (data.queue.count > 25) {
      data.queue.length = "High";
      data.health.checks.queue = "error";
    } else {
      data.queue.length = "Medium";
      data.health.checks.queue = "warning";
    }
  }

  // Calculate health score dynamically
  let penalty = 0;
  if (!data.health.checks.evm) penalty += 15;
  if (data.health.checks.queue === 'error') penalty += 15;
  if (data.health.checks.queue === 'warning') penalty += 5;
  data.health.score = Math.max(40, 100 - penalty);

  return res.json({ status: "success", message: "Complaint registered" });
});

// POST dashboard actions (Lifecycle state controller)
router.post('/actions', (req, res) => {
  const { action, payload } = req.body;
  const boothId = parseInt(req.query.booth_id || 147, 10);
  const data = boothStates[boothId] || boothStates[147];

  // 1. Verify Complaint (pending -> verified)
  if (action === "verify_complaint") {
    const complaintId = payload?.id;
    const complaint = data.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = "verified";
      complaint.verifiedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      complaint.logs.push(`Verified by Presiding Officer at ${complaint.verifiedAt}`);
      
      // Update health score penalty
      let penalty = 5; // Verified issues have small starting health deduction
      if (complaint.category === 'Security') penalty += 15;
      data.health.score = Math.max(40, data.health.score - penalty);
    }
    return res.json({ status: "success", message: `Complaint ${complaintId} verified` });
  }

  // 2. Reject Complaint (pending -> removed)
  if (action === "reject_complaint") {
    const complaintId = payload?.id;
    const complaint = data.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = "rejected";
      complaint.rejectedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      complaint.logs.push(`Rejected by Presiding Officer at ${complaint.rejectedAt}`);
      data.complaintsHistory = data.complaintsHistory || [];
      data.complaintsHistory.push(complaint);
      data.complaints = data.complaints.filter(c => c.id !== complaintId);
    }
    return res.json({ status: "success", message: `Complaint ${complaintId} rejected` });
  }

  // 3. Dispatch Personnel to resolve verified complaints
  if (action === "dispatch_personnel") {
    const { complaintId, personnel } = payload;
    const complaint = data.complaints.find(c => c.id === complaintId);
    if (complaint) {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const logMsg = `Dispatched ${personnel} at ${timeStr}`;
      complaint.logs.push(logMsg);
      complaint.dispatches = complaint.dispatches || [];
      complaint.dispatches.push({ personnel, time: timeStr });

      // Add to incident list
      data.incidents.unshift({
        id: `INC-DISP-${Math.floor(Math.random() * 800) + 100}`,
        type: `${personnel} Dispatched for ${complaint.category}`,
        time: "Just Now",
        status: "In Progress"
      });
    }
    return res.json({ status: "success", message: `Personnel ${personnel} dispatched` });
  }

  // 4. Resolve Complaint (verified/escalated -> resolved/removed)
  if (action === "resolve_complaint") {
    const complaintId = payload?.id;
    const complaintIndex = data.complaints.findIndex(c => c.id === complaintId);
    if (complaintIndex !== -1) {
      const complaint = data.complaints[complaintIndex];
      complaint.status = "resolved";
      complaint.resolvedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      complaint.logs.push(`Resolved by Presiding Officer at ${complaint.resolvedAt}`);
      
      data.complaintsHistory = data.complaintsHistory || [];
      data.complaintsHistory.push(complaint);

      // Add to resolved incident log
      data.incidents.unshift({
        id: `INC-RES-${complaintId}`,
        type: `Resolved: ${complaint.type}`,
        time: "Just Now",
        status: "Resolved"
      });

      // Remove from active complaints
      data.complaints.splice(complaintIndex, 1);

      // Restore queue states if long queue resolved
      if (complaint.category === "Queue") {
        data.queue.count = Math.max(5, data.queue.count - 8);
        data.queue.waitTime = Math.max(5, data.queue.waitTime - 10);
        data.queue.length = "Low";
        data.health.checks.queue = "ok";
      }
    }

    // Recalculate health
    let penalty = 0;
    if (!data.health.checks.evm) penalty += 15;
    if (data.health.checks.queue === 'error') penalty += 15;
    if (data.health.checks.queue === 'warning') penalty += 5;
    data.health.score = Math.max(40, 100 - penalty);

    return res.json({ status: "success", message: `Complaint ${complaintId} resolved` });
  }

  // 5. Escalate Complaint (verified -> escalated)
  if (action === "escalate_complaint") {
    const complaintId = payload?.id;
    const complaint = data.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = "escalated";
      complaint.escalatedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const logMsg = `Escalated to Sector Officer at ${complaint.escalatedAt}`;
      complaint.logs.push(logMsg);

      // Force booth status to critical
      data.booth.status = "Critical Issue";

      // Add to incident list
      data.incidents.unshift({
        id: `INC-ESC-${complaintId}`,
        type: `ESCALATION: ${complaint.type}`,
        time: "Just Now",
        status: "In Progress"
      });

      // Deduct health heavily due to escalation
      data.health.score = Math.max(30, data.health.score - 25);
    }
    return res.json({ status: "success", message: `Complaint ${complaintId} escalated` });
  }

  // 6. Resolve Escalation from Above (escalated -> resolved_above)
  if (action === "resolve_from_above") {
    const complaintId = payload?.id;
    const summary = payload?.summary || "Resolved by Higher Authority";
    const complaint = data.complaints.find(c => c.id === complaintId);
    if (complaint) {
      complaint.status = "resolved_above";
      complaint.resolvedAboveSummary = summary;
      complaint.resolvedAboveAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      complaint.logs.push(`Resolved from above by CM at ${complaint.resolvedAboveAt} with summary: "${summary}"`);
    }
    return res.json({ status: "success", message: `Complaint ${complaintId} resolved from above` });
  }

  // 7. Complete Complaint (resolved_above -> completed/removed)
  if (action === "complete_complaint") {
    const complaintId = payload?.id;
    const complaintIndex = data.complaints.findIndex(c => c.id === complaintId);
    if (complaintIndex !== -1) {
      const complaint = data.complaints[complaintIndex];
      complaint.status = "completed";
      complaint.completedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      complaint.logs.push(`Completed by Presiding Officer at ${complaint.completedAt}`);
      
      data.complaintsHistory = data.complaintsHistory || [];
      data.complaintsHistory.push(complaint);

      // Add to resolved incident log
      data.incidents.unshift({
        id: `INC-COMP-${complaintId}`,
        type: `Completed: ${complaint.type}`,
        time: "Just Now",
        status: "Resolved"
      });

      // Remove from active complaints
      data.complaints.splice(complaintIndex, 1);

      // Restore queue states if long queue resolved
      if (complaint.category === "Queue") {
        data.queue.count = Math.max(5, data.queue.count - 8);
        data.queue.waitTime = Math.max(5, data.queue.waitTime - 10);
        data.queue.length = "Low";
        data.health.checks.queue = "ok";
      }
    }

    // Recalculate health
    let penalty = 0;
    if (!data.health.checks.evm) penalty += 15;
    if (data.health.checks.queue === 'error') penalty += 15;
    if (data.health.checks.queue === 'warning') penalty += 5;
    data.health.score = Math.max(40, 100 - penalty);

    return res.json({ status: "success", message: `Complaint ${complaintId} completed` });
  }

  // 8. Send Sector Officer Directive to Presiding Officer
  if (action === "send_po_directive") {
    const { boothId: targetBoothId, message } = payload;
    const targetBooth = boothStates[targetBoothId];
    if (targetBooth) {
      targetBooth.booth.sectorDirective = {
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        acknowledged: false
      };
      
      // Also add to incidents and logs
      targetBooth.incidents.unshift({
        id: `INC-DIR-${Math.floor(Math.random() * 800) + 100}`,
        type: `DIRECTIVE: ${message}`,
        time: "Just Now",
        status: "In Progress"
      });
    }
    return res.json({ status: "success", message: `Directive sent to Booth ${targetBoothId}` });
  }

  // 9. Acknowledge Sector Officer Directive
  if (action === "acknowledge_directive") {
    const targetBoothId = payload?.boothId || boothId;
    const targetBooth = boothStates[targetBoothId];
    if (targetBooth && targetBooth.booth.sectorDirective) {
      targetBooth.booth.sectorDirective.acknowledged = true;
      targetBooth.incidents.unshift({
        id: `INC-DIR-ACK-${targetBoothId}`,
        type: `Directive Acknowledged`,
        time: "Just Now",
        status: "Resolved"
      });
    }
    return res.json({ status: "success", message: `Directive acknowledged` });
  }

  // 10. Dispatch Standby Spare Officer
  if (action === "dispatch_spare_officer") {
    const { boothId: targetBoothId, officerName } = payload;
    const targetBooth = boothStates[targetBoothId];
    const officer = spareOfficers.find(o => o.name === officerName);
    if (targetBooth && officer) {
      officer.status = `Dispatched to Booth ${targetBoothId}`;
      
      // Add officer to the booth's officers list
      const nextId = targetBooth.officers.length + 1;
      targetBooth.officers.push({
        id: nextId,
        name: `${officerName} (Spare PO)`,
        status: "Present"
      });

      // Add to incident list
      targetBooth.incidents.unshift({
        id: `INC-STAFF-${targetBoothId}`,
        type: `Spare Officer Dispatched: ${officerName}`,
        time: "Just Now",
        status: "Resolved"
      });
    }
    return res.json({ status: "success", message: `Spare officer ${officerName} dispatched to Booth ${targetBoothId}` });
  }

  // 11. Acknowledge RO Request
  if (action === "acknowledge_ro_request") {
    const requestId = payload?.id;
    const req = returningOfficerRequests.find(r => r.id === requestId);
    if (req) {
      req.status = "Acknowledged";
    }
    return res.json({ status: "success", message: `RO Request ${requestId} acknowledged` });
  }

  // Backwards compatible actions
  if (action === "report_queue") {
    data.queue.count += 5;
    data.queue.waitTime += 6;
    if (data.queue.count > 25) {
      data.queue.length = "High";
      data.health.checks.queue = "error";
    } else {
      data.queue.length = "Medium";
      data.health.checks.queue = "warning";
    }
    let penalty = 0;
    if (!data.health.checks.evm) penalty += 15;
    if (data.health.checks.queue === 'error') penalty += 15;
    if (data.health.checks.queue === 'warning') penalty += 5;
    data.health.score = Math.max(40, 100 - penalty);
    return res.json({ status: "success", queue: data.queue });
  }

  if (action === "request_staff") {
    data.incidents.unshift({
      id: "INC-STAFF",
      type: "Extra Staff Requested",
      time: "Just Now",
      status: "In Progress"
    });
    return res.json({ status: "success", message: "Extra staff requested" });
  }

  if (action === "report_fault") {
    data.evm.status = "Checking Fault";
    data.health.checks.evm = false;
    data.incidents.unshift({
      id: "INC-EVM",
      type: "EVM Fault Reported",
      time: "Just Now",
      status: "In Progress"
    });
    let penalty = 15;
    if (data.health.checks.queue === 'error') penalty += 15;
    if (data.health.checks.queue === 'warning') penalty += 5;
    data.health.score = Math.max(40, 100 - penalty);
    data.booth.status = "Critical Issue";
    return res.json({ status: "success", message: "EVM fault reported" });
  }

  if (action === "request_replacement") {
    data.evm.status = "Awaiting Replacement";
    data.health.checks.evm = false;
    let penalty = 20;
    if (data.health.checks.queue === 'error') penalty += 15;
    if (data.health.checks.queue === 'warning') penalty += 5;
    data.health.score = Math.max(40, 100 - penalty);
    return res.json({ status: "success", message: "EVM replacement requested" });
  }

  if (action === "report_incident") {
    const type = payload?.type || "Custom Incident";
    data.incidents.unshift({
      id: `INC-${Math.floor(Math.random() * 900) + 100}`,
      type: type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: "In Progress"
    });
    return res.json({ status: "success", message: "Custom incident logged" });
  }

  return res.status(400).json({ error: "Unknown action" });
});

// POST toggle checklist item
router.post('/checklist/:id', (req, res) => {
  const itemId = parseInt(req.params.id, 10);
  const { checked } = req.body;
  const boothId = parseInt(req.query.booth_id || 147, 10);
  const data = boothStates[boothId] || boothStates[147];

  const item = data.checklist.find(c => c.id === itemId);
  if (item) {
    item.checked = checked;
    return res.json({ status: "success", item });
  }

  return res.status(404).json({ error: "Checklist item not found" });
});

// POST SOP guidelines question matcher
router.post('/assistant/ask', (req, res) => {
  const { question } = req.body;
  const q = (question || '').toLowerCase();

  let ans = "Election Day SOP Guideline: For details regarding this operational inquiry, check the official Handbook for Presiding Officers (2026 Edition) or contact your designated Sector Officer immediately.";

  if (q.includes("wrong booth")) {
    ans = "As per EC SOP 4.2 - Politely inform the voter and guide them to their correct booth. Do not allow them to vote at the wrong booth.";
  } else if (q.includes("evm") || q.includes("electronic voting")) {
    ans = "As per EC SOP 7.1 - If EVM malfunctions during voting, halt polling immediately. Notify the Sector Officer for replacement. Do not try to dismantle or repair on site.";
  } else if (q.includes("document") || q.includes("id card") || q.includes("identity")) {
    ans = "As per EC Guidelines - Voters can use EPIC (Voter ID) or any of the 12 alternative documents including Aadhaar, PAN Card, passport, driving license, etc.";
  } else if (q.includes("agent") || q.includes("polling agent")) {
    ans = "As per EC SOP 3.4 - Polling agents must present their credentials signed by candidates. They are permitted to verify EVM seal before mock poll and polling start.";
  }

  return res.json({ answer: ans });
});

// POST mock authentication login for EM Dashboard
router.post('/auth/login', (req, res) => {
  const { role, password } = req.body;

  const validRoles = [
    "CM", "CEO", "DEO", 
    "Returning Officer", "Sector Officer", 
    "Presiding Officer", "Polling Officer", "ECI"
  ];

  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: "Invalid officer level" });
  }

  return res.json({
    token: `mock-officer-token-${role.toLowerCase().replace(' ', '-')}`,
    user: {
      name: `${role} Admin`,
      role: role,
      id: `OFF-${Math.floor(Math.random() * 9000) + 1000}`
    }
  });
});

export default router;
