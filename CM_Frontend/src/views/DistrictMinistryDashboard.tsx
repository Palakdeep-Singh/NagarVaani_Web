import React, { useState, useMemo } from 'react';
import { useStore } from '../context/Store';
import { getStatusBadgeStyle, getPriorityBadgeStyle } from '../utils/helper';
import { MapPin, User, PlusCircle, FileSpreadsheet, PhoneCall, Video, Award, Calendar, Check, X } from 'lucide-react';
import type { ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../types';

interface ReviewMeeting {
  id: number;
  date: string;
  topic: string;
  departments: string[];
  status: 'Scheduled' | 'Completed';
}

interface RevenueCase {
  id: string;
  title: string;
  type: 'Land Dispute' | 'Mutation' | 'Property Registration';
  deadline: string;
  status: 'Pending' | 'Resolved';
}

export const DistrictMinistryDashboard: React.FC = () => {
  const {
    activeDistrict,
    complaints,
    officers,
    updateComplaintStatus,
    addComplaint,
    setActiveTab
  } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [remarkText, setRemarkText] = useState<Record<string, string>>({});
  
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<ComplaintCategory>('Civic Infrastructure');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('Medium');
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetTopic, setMeetTopic] = useState('');
  const [meetDate, setMeetDate] = useState('');
  const [meetDept, setMeetDept] = useState('PWD & Infrastructure');
  const [meetings, setMeetings] = useState<ReviewMeeting[]>([]);

  const [revenueCases] = useState<RevenueCase[]>([]);

  const district = activeDistrict || 'New Delhi';
  const districtComplaints = complaints.filter(c => c.district === district);
  const dmProfile = officers.find(o => o.district === district);

  const getDaysOpen = (dateStr: string) => {
    return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  };

  const getDepartmentForCategory = (cat: ComplaintCategory): string => {
    const mappings: Record<ComplaintCategory, string> = {
      'Civic Infrastructure': 'PWD & Infrastructure',
      'Water & Sewage': 'Delhi Jal Board',
      'Electricity & Power': 'Power Department',
      'Public Health': 'Health & Family Welfare',
      'Education & Schools': 'Education Department',
      'Law & Policing': 'Delhi Police',
      'Transport & Roads': 'Transport Department',
      'Social Welfare': 'Social Welfare Department',
      'Revenue & Land': 'Revenue & Grievance',
      'Sanitation': 'Municipal Corporation',
      'Noise Pollution': 'Delhi Police',
      'Stray Animals': 'Municipal Corporation'
    };
    return mappings[cat];
  };

  const handleCreateFieldComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !citizenName || !citizenPhone) return;

    addComplaint({
      title: newTitle,
      description: newDesc,
      category: newCategory,
      priority: newPriority,
      district: district,
      department: getDepartmentForCategory(newCategory),
      citizenName,
      citizenPhone,
      status: 'Pending'
    });

    setNewTitle('');
    setNewDesc('');
    setCitizenName('');
    setCitizenPhone('');
    setShowForm(false);
  };

  const handleAction = (id: string, newStatus: ComplaintStatus, remark?: string) => {
    updateComplaintStatus(id, newStatus, remark || 'Field inspection confirmed resolution.', `${district} DM`);
    setRemarkText(prev => ({ ...prev, [id]: '' }));
  };

  const handleAuditApprove = (id: string) => {
    updateComplaintStatus(id, 'Resolved', 'Audit Approved: Verified and archived resolution on-site.', `${district} DM`);
  };

  const handleAuditReject = (id: string) => {
    const note = remarkText[id] || 'Audit Rejected: Resolution standards not met. Ground verification failed.';
    updateComplaintStatus(id, 'Active', `Resolution Rejected by DM: ${note}`, `${district} DM`);
    setRemarkText(prev => ({ ...prev, [id]: '' }));
  };

  const handleEscalateToSecretary = (id: string, dept: string) => {
    const note = remarkText[id] || `Escalated directly to Principal Secretary of ${dept} due to SLA breach.`;
    updateComplaintStatus(id, 'Escalated', `DM Direct Escalation: ${note}`, `${district} DM`);
    setRemarkText(prev => ({ ...prev, [id]: '' }));
    alert(`Complaint ${id} escalated directly to the Secretary of ${dept}`);
  };

  const handleSendInterimReply = (id: string) => {
    updateComplaintStatus(
      id,
      'Active',
      '📩 [Interim Reply Sent to Citizen]: Your grievance has been audited by the DM. Resolution is scheduled and monitored under DM supervision.',
      `${district} DM`
    );
    alert(`Interim reply dispatched to citizen for ticket ${id}`);
  };

  const handleSdmAssign = (complaintId: string, sdmId: string) => {
    const sdmName = officers.find(o => o.id === sdmId)?.name || 'SDM';
    updateComplaintStatus(
      complaintId,
      'Active',
      `Assigned to SDM officer: ${sdmName} for ground verification and load monitoring.`,
      `${district} DM`
    );
    alert(`Complaint ${complaintId} assigned to SDM ${sdmName}.`);
  };

  const handleScheduleMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetTopic || !meetDate) return;
    setMeetings(prev => [
      ...prev,
      {
        id: Date.now(),
        date: meetDate,
        topic: meetTopic,
        departments: [meetDept],
        status: 'Scheduled'
      }
    ]);
    setMeetTopic('');
    setMeetDate('');
    setShowMeetingForm(false);
  };

  const filtered = districtComplaints.filter(c => {
    if (statusFilter === 'All') return true;
    return c.status === statusFilter;
  });

  const activeCount = districtComplaints.filter(c => c.status !== 'Resolved').length;
  const resolvedCount = districtComplaints.filter(c => c.status === 'Resolved').length;
  const totalCount = districtComplaints.length;
  const performanceScore = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 100;
  const slaBreachCount = districtComplaints.filter(c => c.status !== 'Resolved' && getDaysOpen(c.dateFiled) > 21).length;
  const rtiRequestsCount = 0;

  const deptLeaderboard = useMemo(() => {
    const departmentsList = [
      'PWD & Infrastructure',
      'Delhi Jal Board',
      'Health & Family Welfare',
      'Power Department',
      'Transport Department',
      'Education Department'
    ];
    return departmentsList.map(dept => {
      const deptComplaints = districtComplaints.filter(c => c.department === dept);
      const total = deptComplaints.length;
      const resolved = deptComplaints.filter(c => c.status === 'Resolved').length;
      const sla = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return { name: dept, resolved, total, sla };
    }).sort((a, b) => b.sla - a.sla);
  }, [districtComplaints]);

  const wardOfficers = useMemo(() => {
    return officers
      .filter(o => o.district === district && o.designation?.toLowerCase().includes('ward'))
      .map(o => ({
        name: o.name,
        ward: o.designation || 'Ward Officer',
        rating: o.rating || 0,
        performance: o.resolutionRate || 0
      }));
  }, [officers, district]);

  const sdmList = useMemo(() => {
    return officers
      .filter(o => o.district === district && o.designation?.toLowerCase().includes('sdm'))
      .map(o => ({
        id: o.id,
        name: o.name,
        pending: o.activeComplaints || 0
      }));
  }, [officers, district]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
            District Grievance Monitoring System (District Level)
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
            <MapPin className="h-5 w-5 text-indigo-600" />
            District Ministry Dashboard — {district}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit ground resolution reports, monitor department performance leaderboards, and coordinate district round actions.
          </p>
        </div>

        <div className="flex gap-2">
          <button className="gov-btn gov-btn-outline gov-btn-sm flex items-center gap-1.5 text-xs">
            <PhoneCall size={14} className="text-emerald-600 animate-pulse" />
            CM Hotline
          </button>
          <button 
            onClick={() => setActiveTab('VideoCall')}
            className="gov-btn gov-btn-primary gov-btn-sm flex items-center gap-1.5 text-xs cursor-pointer"
          >
            <Video size={14} />
            Joint Video Conference
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-indigo-600">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total District Cases</span>
          <div className="text-xl font-extrabold text-slate-800 mt-1">{totalCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Logged from your district</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-amber-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unresolved / SLA</span>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{activeCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">{slaBreachCount} tickets breaching SLA</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-emerald-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Overall SLA Score</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{performanceScore}%</div>
          <p className="text-[10px] text-slate-400 mt-1">Overall resolution rate</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-purple-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">DM Rating</span>
          <div className="text-xl font-extrabold text-purple-600 mt-1">
            {dmProfile?.rating ? `★ ${dmProfile.rating.toFixed(1)}` : 'N/A'}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Citizen feedback rating</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-rose-500">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">RTI Requests</span>
          <div className="text-xl font-extrabold text-rose-600 mt-1">{rtiRequestsCount}</div>
          <p className="text-[10px] text-slate-400 mt-1">Disposed: 100% compliant</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-t-4 border-indigo-600">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-indigo-600">
                <User className="h-7 w-7" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">District Magistrate</span>
                <h3 className="text-md font-extrabold text-slate-800 mt-0.5">{dmProfile?.name || 'N/A'}</h3>
                <p className="text-xs text-slate-500 font-semibold">{dmProfile?.designation || 'Revenue & Admin'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Award className="h-4 w-4 text-amber-500" />
              Department SLA Leaderboard
            </h3>
            <div className="space-y-3">
              {deptLeaderboard.map((dept, index) => (
                <div key={dept.name} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-600">#{index + 1}</span>
                    <span className="font-medium text-slate-700">{dept.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-850">{dept.sla}%</span>
                    <span className="text-[9px] text-slate-400 block">{dept.resolved}/{dept.total} resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <User className="h-4 w-4 text-indigo-600" />
              Ward Officer Directory
            </h3>
            <div className="space-y-3">
              {wardOfficers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50/20 rounded-xl border border-slate-100">
                  No ward officers active in database.
                </div>
              ) : (
                wardOfficers.map(officer => (
                  <div key={officer.name} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-800 block">{officer.name}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{officer.ward}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-600">{officer.performance}% SLA</span>
                      <span className="text-[9px] text-slate-455 block">Rating: ★{officer.rating}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-4 w-4 text-indigo-600" />
              SDM Workload & Rebalancing
            </h3>
            <div className="space-y-3">
              {sdmList.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50/20 rounded-xl border border-slate-100">
                  No SDM workloads active in database.
                </div>
              ) : (
                sdmList.map(sdm => {
                  const limit = 15;
                  const ratio = Math.min(100, Math.round((sdm.pending / limit) * 100));
                  return (
                    <div key={sdm.id} className="text-xs space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex justify-between font-bold text-slate-750">
                        <span>{sdm.name}</span>
                        <span>{sdm.pending} cases pending</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${ratio > 75 ? 'bg-red-500' : ratio > 45 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-600" />
              Revenue & Land Disputes Tracker
            </h3>
            <div className="space-y-3">
              {revenueCases.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50/20 rounded-xl border border-slate-100">
                  No pending land disputes in database.
                </div>
              ) : (
                revenueCases.map(c => (
                  <div key={c.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-extrabold text-slate-800 block leading-tight">{c.title}</span>
                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">{c.type} · Deadline: {c.deadline}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-amber-50 text-amber-700 border border-amber-150'}`}>
                      {c.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">DM Field Rounds</h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                {showForm ? 'Close Form' : 'Log Round'}
              </button>
            </div>

            {showForm ? (
              <form onSubmit={handleCreateFieldComplaint} className="space-y-4 pt-1 animate-in fade-in duration-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Grievance Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="E.g., Broken water valve CP Block B"
                    className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Issue</label>
                  <textarea
                    required
                    rows={3}
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="Describe findings during field round..."
                    className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value as ComplaintCategory)}
                      className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none mt-1"
                    >
                      <option value="Civic Infrastructure">Civic Infra</option>
                      <option value="Water & Sewage">Water & Sewer</option>
                      <option value="Electricity & Power">Electricity</option>
                      <option value="Public Health">Health</option>
                      <option value="Education & Schools">Education</option>
                      <option value="Transport & Roads">Roads/Transport</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as ComplaintPriority)}
                      className="w-full bg-slate-50 border border-slate-205 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none mt-1"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Emergency">Emergency</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Citizen Name</label>
                    <input
                      type="text"
                      required
                      value={citizenName}
                      onChange={e => setCitizenName(e.target.value)}
                      placeholder="Amit Verma"
                      className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Citizen Phone</label>
                    <input
                      type="text"
                      required
                      value={citizenPhone}
                      onChange={e => setCitizenPhone(e.target.value)}
                      placeholder="9999XXXXXX"
                      className="w-full bg-slate-50 border border-slate-250 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 mt-1"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.02]"
                >
                  Log Grievance & Dispatch
                </button>
              </form>
            ) : (
              <div className="text-xs leading-relaxed text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                Log on-the-spot issues noticed during ward inspections. Filed complaints are immediately routed to Nodal Departments with priority flags.
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekly Review Meetings</h3>
              <button
                onClick={() => setShowMeetingForm(!showMeetingForm)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg"
              >
                <Calendar className="h-3.5 w-3.5" />
                {showMeetingForm ? 'Cancel' : 'Schedule'}
              </button>
            </div>

            {showMeetingForm ? (
              <form onSubmit={handleScheduleMeeting} className="space-y-3 pt-1 animate-in fade-in duration-200">
                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Meeting Topic</label>
                  <input
                    type="text"
                    required
                    value={meetTopic}
                    onChange={e => setMeetTopic(e.target.value)}
                    placeholder="E.g., SLA compliance review"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Date</label>
                    <input
                      type="date"
                      required
                      value={meetDate}
                      onChange={e => setMeetDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-750 focus:outline-none mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Department</label>
                    <select
                      value={meetDept}
                      onChange={e => setMeetDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none mt-1"
                    >
                      <option value="PWD & Infrastructure">PWD</option>
                      <option value="Delhi Jal Board">Jal Board</option>
                      <option value="Power Department">Power Dept</option>
                      <option value="Health & Family Welfare">Health Welfare</option>
                    </select>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer transition-all mt-1"
                >
                  Schedule Review Session
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                {meetings.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400 font-medium bg-slate-50/20 rounded-xl border border-slate-100">
                    No review meetings scheduled.
                  </div>
                ) : (
                  meetings.map(meeting => (
                    <div key={meeting.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-slate-800 block">{meeting.topic}</strong>
                        <span className="text-[9px] text-slate-455 block mt-0.5">Date: {meeting.date} · Depts: {meeting.departments.join(', ')}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${meeting.status === 'Scheduled' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-slate-150 text-slate-500'}`}>
                        {meeting.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" />
              District Grievance Audit Registry ({districtComplaints.length})
            </div>

            <div className="flex bg-slate-50 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
              {['All', 'Pending', 'Active', 'Escalated', 'Resolved'].map(state => (
                <button
                  key={state}
                  onClick={() => setStatusFilter(state)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    statusFilter === state ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500 text-xs font-semibold">
                No active complaints registered under this filter in {district}.
              </div>
            ) : (
              filtered.map(comp => {
                const daysOpen = getDaysOpen(comp.dateFiled);
                const daysLeft = Math.max(0, 21 - daysOpen);

                return (
                  <div key={comp.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-350 transition-colors shadow-sm space-y-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                          {comp.id} | Department: {comp.department}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-800 mt-1 leading-snug">
                          {comp.title}
                        </h4>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getStatusBadgeStyle(comp.status)}`}>
                          {comp.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityBadgeStyle(comp.priority)}`}>
                          {comp.priority}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-655 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      {comp.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between text-xs bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-50/50">
                      <span className="font-bold text-slate-600">SLA Countdown:</span>
                      <span className={`font-extrabold ${daysLeft <= 6 ? 'text-red-600' : daysLeft <= 12 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {daysLeft} days remaining (of 21-day DARPG limit)
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Audit Trail:</span>
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                        {comp.timeline.map((step, idx) => (
                          <div key={idx} className="text-xs border-l-2 border-indigo-500 pl-2.5 py-0.5 leading-tight">
                            <span className="font-bold text-slate-700">{step.action}</span>
                            <span className="text-[10px] text-slate-400 ml-2">({step.actor} · {step.date})</span>
                            {step.notes && <p className="text-slate-500 italic mt-0.5 text-[11px]">"{step.notes}"</p>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {comp.status !== 'Resolved' && (
                      <div className="pt-3 border-t border-slate-150 space-y-3">
                        <div className="flex flex-wrap items-center gap-3 justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-xs font-bold text-slate-700">Assign SDM Oversight:</span>
                          <select
                            value=""
                            onChange={e => handleSdmAssign(comp.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 outline-none"
                          >
                            <option value="">Select SDM to Assign...</option>
                            {sdmList.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.pending} load)</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {comp.status === 'Resolved' && (
                      <div className="pt-3 border-t border-slate-100 space-y-3">
                        <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-950">
                          <Check className="h-4.5 w-4.5 text-emerald-600" />
                          <span>Resolution ATR pending validation by DM Executive Office.</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex-1 flex gap-2 min-w-[200px]">
                            <input
                              type="text"
                              placeholder="Provide audit feedback or rejection remarks..."
                              value={remarkText[comp.id] || ''}
                              onChange={e => setRemarkText(prev => ({ ...prev, [comp.id]: e.target.value }))}
                              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex-1"
                            />
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAuditReject(comp.id)}
                              className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <X size={13} />
                              Reject & Reopen
                            </button>
                            
                            <button
                              onClick={() => handleAuditApprove(comp.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                            >
                              <Check size={13} />
                              Approve & Archive
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {comp.status !== 'Resolved' && (
                      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex-1 flex gap-2 min-w-[200px]">
                          <input
                            type="text"
                            placeholder="Log inspection notes or remarks..."
                            value={remarkText[comp.id] || ''}
                            onChange={e => setRemarkText(prev => ({ ...prev, [comp.id]: e.target.value }))}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 flex-1"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSendInterimReply(comp.id)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors border border-slate-200"
                            title="Send status update to citizen"
                          >
                            Send Interim Reply
                          </button>
                          
                          <button
                            onClick={() => handleEscalateToSecretary(comp.id, comp.department)}
                            className="bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors"
                          >
                            Escalate Case
                          </button>
                          
                          <button
                            onClick={() => handleAction(comp.id, 'Resolved', remarkText[comp.id] || 'Field inspection confirmed resolution.')}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
                          >
                            Resolve Grievance
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
