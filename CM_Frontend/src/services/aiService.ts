// ─── AI SERVICE LAYER ─────────────────────────────────────────────────────
//
// Powered by Groq API
//
// ────────────────────────────────────────────────────────────────────────────

import type { Booth, Complaint } from '../types';

const USE_LIVE_AI = true;

export interface AIInsight {
  id: string;
  severity: 'info' | 'watch' | 'critical';
  title: string;
  detail: string;
}

// ─── Helper: General Groq Chat Completion Call ─────────────────────────────
async function callGroqAPI(systemPrompt: string, userPrompt: string, responseFormatJson: boolean = false): Promise<string> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_AI_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API Key not configured');
  }

  const payload: any = {
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.2
  };

  if (responseFormatJson) {
    payload.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Public API used by the UI ─────────────────────────────────────────────

export async function getBoothInsights(booths: Booth[]): Promise<AIInsight[]> {
  if (USE_LIVE_AI) {
    try {
      const system = `You are an election-day operations analyst. Given the booth data, analyze and return the top operational risks and recommended actions as JSON.
Response format MUST be a JSON object with an 'insights' array containing objects with: id, severity (info, watch, critical), title, detail.`;
      const user = `Booth Data:\n${JSON.stringify(booths.map(b => ({ id: b.id, name: b.name, number: b.boothNumber, district: b.district, status: b.status, turnout: b.turnoutPct, queueMins: b.queueLengthMins, unresolvedIncidents: b.incidents.filter(i => i.status !== 'Resolved').length })))}`;
      const result = await callGroqAPI(system, user, true);
      const parsed = JSON.parse(result);
      return parsed.insights || [];
    } catch (err) {
      console.error('getBoothInsights failed, falling back to local:', err);
      return localBoothHeuristics(booths);
    }
  }
  return localBoothHeuristics(booths);
}

export async function getComplaintInsights(complaints: Complaint[]): Promise<AIInsight[]> {
  if (USE_LIVE_AI) {
    try {
      const system = `You are a municipal grievance supervisor. Given the complaint data, summarize systemic patterns and urgent items.
Response format MUST be a JSON object with an 'insights' array containing objects with: id, severity (info, watch, critical), title, detail.`;
      const user = `Complaint Data:\n${JSON.stringify(complaints.slice(0, 100).map(c => ({ id: c.id, category: c.category, status: c.status, district: c.district, priority: c.priority, title: c.title })))}${complaints.length > 100 ? `\n(Truncated, total count is ${complaints.length})` : ''}`;
      const result = await callGroqAPI(system, user, true);
      const parsed = JSON.parse(result);
      return parsed.insights || [];
    } catch (err) {
      console.error('getComplaintInsights failed, falling back to local:', err);
      return localComplaintHeuristics(complaints);
    }
  }
  return localComplaintHeuristics(complaints);
}

export async function askAI(question: string, context: { booths: Booth[]; complaints: Complaint[] }): Promise<string> {
  if (USE_LIVE_AI) {
    try {
      const system = `You are the NagarVaani CM Executive Assistant. Answer questions based on municipal context. Be concise, professional, and reference administrative norms (like DARPG rules) where helpful.`;
      const user = `Question: ${question}\n\nContext:\n- Total complaints: ${context.complaints.length}\n- Active/Pending/Escalated: ${context.complaints.filter(c => c.status !== 'Resolved').length}\n- Resolved: ${context.complaints.filter(c => c.status === 'Resolved').length}\n- Booths monitored: ${context.booths.length}\nSample complaints:\n${JSON.stringify(context.complaints.slice(0, 20).map(c => ({ id: c.id, title: c.title, status: c.status, district: c.district })))}\n`;
      return await callGroqAPI(system, user, false);
    } catch (err) {
      console.error('askAI failed, falling back to local:', err);
      return localAnswer(question, context);
    }
  }
  return localAnswer(question, context);
}

export function isLiveAIConnected(): boolean {
  return USE_LIVE_AI;
}

// ─── Dynamic Live AI Summaries for Knowledge Graph ────────────────────────

export async function getNodeAISummaryLive(type: string, label: string, meta: any): Promise<string> {
  try {
    const system = `You are the NagarVaani AI Executive Analyst. Generate a highly analytical, professional performance and intelligence report for a senior government official/politician regarding a specific administrative node.
Format your response in clean markdown using:
- Bullet points (* ) for key facts
- Subheadings (### ) if needed
- No introduction or conversational filler, start directly with the content.`;

    const user = `Node Type: ${type}
Node Label: ${label}
Node Metadata: ${JSON.stringify(meta)}`;

    return await callGroqAPI(system, user, false);
  } catch (err) {
    console.error('getNodeAISummaryLive failed, using local static:', err);
    return getNodeAISummary(type, label, meta);
  }
}

// ─── Dynamic AI Policy & Suggestions Generator ────────────────────────────

export async function getDynamicAISuggestions(complaints: Complaint[]): Promise<{ rule: string, desc: string }[]> {
  try {
    const system = `You are a Delhi municipal administration policy adviser. You must analyze the list of complaints and generate exactly 3 actionable policy/administrative recommendations.
Each recommendation must reference a specific governing framework or rule (e.g., DARPG OM on 21-day SLA, Delhi Citizen Charter Act, RTI Act Sec 7, Central Secretariat Manual of Office Procedure, etc.).
Response format MUST be a JSON object with a 'suggestions' array containing objects with: rule (the regulation/OM name), desc (the contextual recommendation based on current complaint figures).`;

    const unresolved = complaints.filter(c => c.status !== 'Resolved');
    const escalated = complaints.filter(c => c.status === 'Escalated');
    const active = complaints.filter(c => c.status === 'Active');
    const pending = complaints.filter(c => c.status === 'Pending');

    const user = `Active Complaints: ${active.length}
Pending: ${pending.length}
Escalated: ${escalated.length}
Total Unresolved: ${unresolved.length}
Sample unresolved: ${JSON.stringify(unresolved.slice(0, 10).map(c => ({ id: c.id, title: c.title, category: c.category, district: c.district, daysOpen: Math.floor((Date.now() - new Date(c.dateFiled).getTime()) / 86400000) })))}`;

    const result = await callGroqAPI(system, user, true);
    const parsed = JSON.parse(result);
    return parsed.suggestions || [];
  } catch (err) {
    console.error('getDynamicAISuggestions failed, returning static fallback:', err);
    return [
      { rule: 'DOPT OM 43011/2/2014', desc: `${complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved').length} emergency complaints require immediate DM oversight.` },
      { rule: 'Delhi Citizen Charter Act 2023', desc: `${complaints.filter(c => c.status !== 'Resolved' && Math.floor((Date.now() - new Date(c.dateFiled).getTime()) / 86400000) > 21).length} tickets exceed the 21-day DARPG limit.` },
      { rule: 'RTI Act 2005 Sec 7', desc: 'Active complaints require urgent redistribution of resources to prevent penalty appeals.' }
    ];
  }
}

// ─── Local Heuristic Fallbacks (Offline-Capable) ──────────────────────────

function localBoothHeuristics(booths: Booth[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const critical = booths.filter(b => b.status === 'Critical');
  if (critical.length > 0) {
    insights.push({
      id: 'crit-booths',
      severity: 'critical',
      title: `${critical.length} booth${critical.length > 1 ? 's' : ''} flagged critical`,
      detail: `${critical.slice(0, 3).map(b => `Booth ${b.boothNumber} (${b.district})`).join(', ')} ${critical.length > 3 ? `and ${critical.length - 3} more ` : ''}need immediate attention.`,
    });
  }

  const longQueues = booths.filter(b => b.queueLengthMins >= 45);
  if (longQueues.length > 0) {
    insights.push({
      id: 'long-queues',
      severity: 'watch',
      title: `${longQueues.length} booth${longQueues.length > 1 ? 's' : ''} with queues over 45 minutes`,
      detail: `Consider deploying additional staff or a second queue line at ${longQueues[0].name}.`,
    });
  }

  return insights;
}

function localComplaintHeuristics(complaints: Complaint[]): AIInsight[] {
  const insights: AIInsight[] = [];
  const emergency = complaints.filter(c => c.priority === 'Emergency' && c.status !== 'Resolved');
  if (emergency.length > 0) {
    insights.push({
      id: 'emergency-complaints',
      severity: 'critical',
      title: `${emergency.length} unresolved emergency-priority complaint${emergency.length > 1 ? 's' : ''}`,
      detail: `${emergency.slice(0, 3).map(c => c.title).join(', ')} require escalation within the hour.`,
    });
  }
  return insights;
}

function localAnswer(question: string, context: { booths: Booth[]; complaints: Complaint[] }): string {
  const q = question.toLowerCase();
  if (q.includes('critical') || q.includes('worst')) {
    const critical = context.booths.filter(b => b.status === 'Critical');
    return critical.length > 0
      ? `Critical booths: ${critical.map(b => `${b.boothNumber} (${b.district})`).join(', ')}.`
      : 'No booths are currently marked critical.';
  }
  return 'Please ensure your Groq key is set in .env.';
}

export function getNodeAISummary(type: string, label: string, meta: any): string {
  if (type === 'cm') {
    return `### 🤖 CM Office AI Intelligence Summary
*   **Active Supervision**: Tracking Delhi Districts.
*   **Resolution Health**: Overall resolution rate stands at **${meta?.resolutionRate || 88}%**.
*   **Actionable Advice**: Recommend targeting bottlenecks.`;
  }
  return `Select a node to view static summary (${label}).`;
}
