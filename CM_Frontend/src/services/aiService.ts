// ─── AI SERVICE LAYER ─────────────────────────────────────────────────────
//
// This is the ONLY file you need to touch when you integrate a real AI API key.
//
// Right now every function below runs a local, deterministic heuristic over
// the actual booth/complaint data already in the store, so the dashboard is
// fully functional and demo-ready with zero external dependency.
//
// TO GO LIVE:
//   1. Put your key in a .env file at the project root:
//        VITE_AI_API_KEY=sk-xxxxxxxx
//        VITE_AI_API_URL=https://api.anthropic.com/v1/messages   (or your provider)
//   2. Flip USE_LIVE_AI to true below.
//   3. Fill in callLiveAI() with your provider's request/response shape.
//      (An Anthropic Messages API example is sketched in there already.)
//
// Nothing else in the app needs to change — every view calls the functions
// in this file, never an API directly.
// ────────────────────────────────────────────────────────────────────────────

import type { Booth, Complaint } from '../types';

const USE_LIVE_AI = false; // ← flip this to true once VITE_AI_API_KEY is set

const AI_API_KEY = import.meta.env.VITE_AI_API_KEY as string | undefined;
const AI_API_URL = (import.meta.env.VITE_AI_API_URL as string | undefined)
  ?? 'https://api.anthropic.com/v1/messages';

export interface AIInsight {
  id: string;
  severity: 'info' | 'watch' | 'critical';
  title: string;
  detail: string;
}

// ─── Public API used by the UI ─────────────────────────────────────────────

export async function getBoothInsights(booths: Booth[]): Promise<AIInsight[]> {
  if (USE_LIVE_AI && AI_API_KEY) {
    try {
      return await callLiveAI(buildBoothPrompt(booths));
    } catch (err) {
      console.error('Live AI call failed, falling back to local heuristics:', err);
      return localBoothHeuristics(booths);
    }
  }
  return localBoothHeuristics(booths);
}

export async function getComplaintInsights(complaints: Complaint[]): Promise<AIInsight[]> {
  if (USE_LIVE_AI && AI_API_KEY) {
    try {
      return await callLiveAI(buildComplaintPrompt(complaints));
    } catch (err) {
      console.error('Live AI call failed, falling back to local heuristics:', err);
      return localComplaintHeuristics(complaints);
    }
  }
  return localComplaintHeuristics(complaints);
}

export async function askAI(question: string, context: { booths: Booth[]; complaints: Complaint[] }): Promise<string> {
  if (USE_LIVE_AI && AI_API_KEY) {
    try {
      const insights = await callLiveAI(`${question}\n\nContext:\n${JSON.stringify(context).slice(0, 4000)}`);
      return insights.map(i => `${i.title}: ${i.detail}`).join('\n');
    } catch (err) {
      console.error('Live AI call failed, falling back to local answer:', err);
      return localAnswer(question, context);
    }
  }
  return localAnswer(question, context);
}

export function isLiveAIConnected(): boolean {
  return USE_LIVE_AI && Boolean(AI_API_KEY);
}

// ─── Local heuristics (no external calls, fully offline-capable) ──────────

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

  const districtAvg: Record<string, { total: number; count: number }> = {};
  booths.forEach(b => {
    districtAvg[b.district] = districtAvg[b.district] || { total: 0, count: 0 };
    districtAvg[b.district].total += b.turnoutPct;
    districtAvg[b.district].count += 1;
  });
  const sorted = Object.entries(districtAvg)
    .map(([d, v]) => ({ district: d, avg: v.total / v.count }))
    .sort((a, b) => a.avg - b.avg);
  if (sorted.length > 0) {
    insights.push({
      id: 'low-turnout-district',
      severity: 'info',
      title: `${sorted[0].district} showing lowest average turnout`,
      detail: `Average turnout of ${sorted[0].avg.toFixed(1)}% across booths in this district — may warrant a mobilisation push in the remaining hours.`,
    });
  }

  const staffShortage = booths.flatMap(b => b.incidents).filter(i => i.type === 'Staff Shortage' && i.status !== 'Resolved');
  if (staffShortage.length > 0) {
    insights.push({
      id: 'staff-shortage',
      severity: 'watch',
      title: `${staffShortage.length} open staff shortage incident${staffShortage.length > 1 ? 's' : ''}`,
      detail: `Unresolved staffing gaps reported — recommend reallocating reserve personnel from nearby booths.`,
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: 'all-clear',
      severity: 'info',
      title: 'All monitored booths operating normally',
      detail: 'No critical incidents, queue surges, or staffing gaps detected in the current data.',
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

  const byCategory: Record<string, number> = {};
  complaints.forEach(c => { byCategory[c.category] = (byCategory[c.category] || 0) + 1; });
  const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    insights.push({
      id: 'top-category',
      severity: 'info',
      title: `${top[0]} is the leading complaint category`,
      detail: `${top[1]} complaints filed in this category — a systemic pattern worth a departmental review.`,
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
  if (q.includes('turnout')) {
    const avg = context.booths.reduce((a, b) => a + b.turnoutPct, 0) / (context.booths.length || 1);
    return `Average turnout across monitored booths is ${avg.toFixed(1)}%.`;
  }
  return 'Connect a live AI key in src/services/aiService.ts to enable open-ended natural language answers. For now, try asking about "critical booths" or "turnout".';
}

// ─── Live AI call (fill in once you have a key) ───────────────────────────

function buildBoothPrompt(booths: Booth[]): string {
  return `You are an election-day operations analyst. Given this booth data, list the top operational risks and recommended actions as JSON insights.\n\n${JSON.stringify(booths).slice(0, 6000)}`;
}

function buildComplaintPrompt(complaints: Complaint[]): string {
  return `Summarize systemic patterns and urgent items in this complaint data as JSON insights.\n\n${JSON.stringify(complaints).slice(0, 6000)}`;
}

async function callLiveAI(prompt: string): Promise<AIInsight[]> {
  // Example shape for the Anthropic Messages API — adjust to your provider.
  const response = await fetch(AI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': AI_API_KEY as string,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.map((c: { text?: string }) => c.text || '').join('\n') ?? '';

  try {
    return JSON.parse(text);
  } catch {
    return [{ id: 'live-ai-raw', severity: 'info', title: 'AI Summary', detail: text }];
  }
}
