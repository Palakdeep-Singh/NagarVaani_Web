db.users.deleteMany({});
db.officers.deleteMany({});
db.complaints.deleteMany({});
db.projects.deleteMany({});
db.generalmetrics.deleteMany({});
db.schoolsmartboards.deleteMany({});
db.healthbeds.deleteMany({});
db.healthinventories.deleteMany({});
db.digitalfiles.deleteMany({});
db.messages.deleteMany({});

db.users.insertMany([
  {
    username: "cm",
    password: "$2a$10$bfSgD3w3y3ke1j/wO7P6E.VxMdevv6Vy/UzBOt40.Gfn0CPuvPtX2", // cm123
    role: "Chief Minister",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: "newdelhidm",
    password: "$2a$10$nURDZWPzTOJNfC3b/Qyliu4kZo8fQ5gqbs8WmSc9cGnCx7Q/TblVC", // dm123
    role: "District Magistrate",
    district: "New Delhi",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    username: "healthhead",
    password: "$2a$10$N4wmydyhv1e64CRjDEmpKe35KsRPqGptSdYkWHaLpUWE6CA6.FRlC", // dept123
    role: "Department Head",
    department: "Health & Family Welfare",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.officers.insertMany([
  { id: "OFF-001", name: "Smt. Alice Vaz (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "New Delhi", resolutionRate: 92, avgResolutionTime: 4.2, activeComplaints: 2, completedComplaints: 28, rating: 4.5, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-002", name: "Shri Amit Kumar (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "West Delhi", resolutionRate: 85, avgResolutionTime: 5.1, activeComplaints: 4, completedComplaints: 22, rating: 4.1, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-003", name: "Smt. Cheshta Yadav (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "South Delhi", resolutionRate: 88, avgResolutionTime: 4.8, activeComplaints: 3, completedComplaints: 25, rating: 4.3, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-004", name: "Shri Anil Bankar (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "Shahdara", resolutionRate: 90, avgResolutionTime: 4.6, activeComplaints: 1, completedComplaints: 24, rating: 4.4, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-005", name: "Shri Vikram Singh (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "North East Delhi", resolutionRate: 79, avgResolutionTime: 6.2, activeComplaints: 7, completedComplaints: 19, rating: 3.8, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-006", name: "Dr. Shalini Gupta", designation: "Director Health Services", department: "Health & Family Welfare", resolutionRate: 94, avgResolutionTime: 3.8, activeComplaints: 1, completedComplaints: 36, rating: 4.7, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-007", name: "Shri Himanshu Gupta (IAS)", designation: "Director of Education", department: "Education Department", resolutionRate: 91, avgResolutionTime: 4.0, activeComplaints: 2, completedComplaints: 31, rating: 4.6, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-008", name: "Er. R.K. Bhardwaj", designation: "Chief Engineer", department: "PWD & Infrastructure", resolutionRate: 83, avgResolutionTime: 5.4, activeComplaints: 5, completedComplaints: 29, rating: 4.0, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-009", name: "Smt. Isha Khosla (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "Central Delhi", resolutionRate: 89, avgResolutionTime: 4.5, activeComplaints: 3, completedComplaints: 26, rating: 4.3, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-010", name: "Shri Santosh Kumar (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "North West Delhi", resolutionRate: 87, avgResolutionTime: 4.9, activeComplaints: 4, completedComplaints: 23, rating: 4.2, createdAt: new Date(), updatedAt: new Date() },
  { id: "OFF-011", name: "Shri Pradeep Kumar (IAS)", designation: "District Magistrate", department: "Revenue & Grievance", district: "East Delhi", resolutionRate: 90, avgResolutionTime: 4.3, activeComplaints: 2, completedComplaints: 27, rating: 4.4, createdAt: new Date(), updatedAt: new Date() }
]);

db.complaints.insertMany([
  {
    id: "NV-1001",
    title: "Sewer line blockage causing overflow on Main Road 4",
    category: "Water & Sewage",
    description: "The main sewer line has been completely blocked for the past three days. Dirty water is overflowing onto the streets, causing severe public distress and traffic bottlenecks.",
    status: "Pending",
    priority: "High",
    district: "New Delhi",
    department: "Delhi Jal Board",
    citizenName: "Rajesh Sharma",
    citizenPhone: "9810234567",
    dateFiled: "2026-06-18T09:15:00Z",
    timeline: [
      { date: "2026-06-18T09:15:00Z", action: "Grievance Logged", actor: "Citizen Portal", notes: "Complaint registered successfully." }
    ],
    ward: "Ward 45",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "NV-1002",
    title: "Streetlight outage near Metro Pillar 124",
    category: "Electricity & Power",
    description: "Entire stretch of streetlights between pillar 120 and 130 is dark. This is a safety issue for female commuters walking back late from the metro station.",
    status: "Active",
    priority: "Medium",
    district: "New Delhi",
    department: "Power Department",
    citizenName: "Neha Gupta",
    citizenPhone: "9910543210",
    dateFiled: "2026-06-19T21:40:00Z",
    timeline: [
      { date: "2026-06-19T21:40:00Z", action: "Grievance Logged", actor: "Citizen Portal" },
      { date: "2026-06-20T09:30:00Z", action: "Nodal Officer Assigned", actor: "Power Dept Head", notes: "Allocated to field executive for pole replacement." }
    ],
    ward: "Ward 12",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "NV-1003",
    title: "Pothole clusters on Outer Ring Road underpass",
    category: "Civic Infrastructure",
    description: "Multiple deep potholes have formed right under the underpass. Vehicles are brake-slamming, causing high risk of rear-end collisions.",
    status: "Resolved",
    priority: "Emergency",
    district: "West Delhi",
    department: "PWD & Infrastructure",
    citizenName: "Sunil Varma",
    citizenPhone: "9899123456",
    dateFiled: "2026-06-15T08:00:00Z",
    timeline: [
      { date: "2026-06-15T08:00:00Z", action: "Grievance Logged", actor: "Citizen Portal" },
      { date: "2026-06-15T12:00:00Z", action: "Work Order Issued", actor: "PWD Executive Engineer" },
      { date: "2026-06-16T17:00:00Z", action: "Resolved", actor: "PWD Field Team", notes: "Potholes filled with bituminous concrete. Quality report uploaded." }
    ],
    ward: "Ward 88",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "NV-1004",
    title: "Shortage of essential medicines at Mohalla Clinic #42",
    category: "Public Health",
    description: "Dengue diagnostic kits and paracetamol are out of stock. Monsoon cases are rising daily and patients are being sent to private labs.",
    status: "Escalated",
    priority: "Emergency",
    district: "New Delhi",
    department: "Health & Family Welfare",
    citizenName: "Dr. Vinay Saxena",
    citizenPhone: "9560112233",
    dateFiled: "2026-06-12T11:00:00Z",
    timeline: [
      { date: "2026-06-12T11:00:00Z", action: "Grievance Logged", actor: "Clinic Superintendent" },
      { date: "2026-06-13T10:00:00Z", action: "Active Investigation", actor: "District Health Officer" },
      { date: "2026-06-16T09:00:00Z", action: "Escalated", actor: "System", notes: "SLA Breach: No stock delivery within 72 hours. Escalated to Health Department Nodal Head." }
    ],
    ward: "Ward 3",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "NV-1005",
    title: "Broken smart board display in Model Sr. Sec. School Room 10B",
    category: "Education & Schools",
    description: "The digital smart board display screen has cracked during laboratory renovation. Lectures are disrupted.",
    status: "Pending",
    priority: "Low",
    district: "New Delhi",
    department: "Education Department",
    citizenName: "Asha Devi (Principal)",
    citizenPhone: "9717889900",
    dateFiled: "2026-06-20T14:10:00Z",
    timeline: [
      { date: "2026-06-20T14:10:00Z", action: "Grievance Logged", actor: "School Portal" }
    ],
    ward: "Ward 17",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.projects.insertMany([
  {
    id: "PRJ-201",
    title: "Model Smart Schools Classroom Digitalization",
    department: "Education Department",
    budgetAllocated: 45000000,
    budgetSpent: 28000000,
    physicalProgress: 65,
    startDate: "2026-01-10",
    endDate: "2026-09-30",
    status: "On Track",
    manager: "Shri Himanshu Gupta (IAS)",
    description: "Transitioning 100 state secondary schools to modern interactive model classrooms.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "PRJ-202",
    title: "Monsoon Preparedness Hospital ICU Bed Auditing Plan",
    department: "Health & Family Welfare",
    budgetAllocated: 12000000,
    budgetSpent: 11500000,
    physicalProgress: 95,
    startDate: "2026-04-01",
    endDate: "2026-07-15",
    status: "Completed",
    manager: "Dr. Shalini Gupta",
    description: "Installing real-time occupancy sensor grids in 12 major public hospital ICU wards.",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "PRJ-203",
    title: "Sewage Network Interceptor Pipeline Phase IV",
    department: "Delhi Jal Board",
    budgetAllocated: 85000000,
    budgetSpent: 62000000,
    physicalProgress: 55,
    startDate: "2025-09-01",
    endDate: "2026-08-31",
    status: "Delayed",
    manager: "Er. Amit Kumar",
    description: "Expanding interceptor sewage pipelines to prevent direct discharge into Yamuna tributaries.",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.generalmetrics.insertMany([
  { key: "education_smart_schools_count", value: "65" },
  { key: "education_student_teacher_ratio", value: "25 : 1" },
  { key: "health_clinic_count", value: "520" }
]);

db.schoolsmartboards.insertMany([
  { school: "Sarvodaya Bal Vidyalaya, Cantonment", zone: "Zone A (New Delhi)", boards: "12 / 12", progress: 100, status: "Completed" },
  { school: "Govt. Co-ed Sr. Sec. School, Dwarka Sec-10", zone: "Zone B (West Delhi)", boards: "8 / 12", progress: 66, status: "Active" },
  { school: "Rajkiya Pratibha Vikas Vidyalaya, Lajpat Nagar", zone: "Zone C (South Delhi)", boards: "0 / 8", progress: 0, status: "Delayed" }
]);

db.healthbeds.insertMany([
  { hospital: "Lok Nayak Jai Prakash Hospital (LNJP)", total: 150, occupied: 110, status: "Stable" },
  { hospital: "Guru Teg Bahadur Hospital (GTBH)", total: 100, occupied: 92, status: "Critical" },
  { hospital: "Dr. Baba Saheb Ambedkar Hospital", total: 80, occupied: 78, status: "Emergency" }
]);

db.healthinventories.insertMany([
  { item: "ORS Concentrates (500ml packs)", status: "Safe", stockLevel: "45,000 Units", demand: "Medium" },
  { item: "Paracetamol IV Liquids", status: "Restocking", stockLevel: "8,500 Units", demand: "High" },
  { item: "Dengue NS1 Antigen Rapid Test Kits", status: "Critical Shortage", stockLevel: "200 Kits", demand: "Urgent" }
]);

db.digitalfiles.insertMany([
  {
    id: "FILE-MCD-8921",
    title: "Allocation of Emergency Paving Material for Ward 4",
    priority: "Urgent",
    dateCreated: "2026-06-20T10:00:00Z",
    initiator: "Ward Officer (New Delhi)",
    currentOwner: "Smt. Alice Vaz (IAS)",
    department: "Revenue & Grievance",
    path: ["Ward Officer", "District Magistrate", "Chief Engineer (PWD)"],
    currentStep: 1,
    totalSteps: 3,
    status: "Pending Approval",
    remarks: [
      { author: "Ward Officer", action: "Initiated File", text: "Urgent request for bituminous concrete allocation due to underpass pothole hazard.", date: "2026-06-20T10:00:00Z" }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

db.messages.insertMany([
  {
    id: "MSG-001",
    senderName: "Smt. Alice Vaz (IAS)",
    senderRole: "District Magistrate",
    receiverRole: "Chief Minister",
    content: "CM Sir, the sewer blockage grievance at Ward 45 (NV-1001) is active. The Jal Board executive engineer is present on the spot with drainage equipment. We expect clearing in the next 3 hours.",
    timestamp: "2026-06-21T18:00:00Z",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

print("Seeded NagarVaani Database successfully with clean test records.");
