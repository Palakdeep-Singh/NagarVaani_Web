# 🏛️ NagarVaani: Election Management Dashboard

NagarVaani is a comprehensive, multi-tiered Election Management System designed to simulate live election-day operations. It provides role-specific dashboards ranging from the ground-level Polling Officers all the way up to the Election Commission of India (ECI), providing real-time analytics, queue monitoring, and incident reporting.

## ✨ Key Features

- **Hierarchy-Based Access:** A dynamic, step-by-step drill-down selector allows you to log in as specific officials (e.g., choosing a specific CEO -> DEO -> RO -> SO -> Presiding Officer).
- **Dynamic Mock Data:** Instead of static placeholders, the system uses an automated randomization engine. Every time you log in, metrics like "Voters Processed", "Queue Count", and "Average Processing Time" are dynamically generated within realistic bounds. Officer names are also realistically randomized.
- **Role-Specific Dashboards:**
  - **Polling Officer:** Manages voter verification, ink marking, and EVM operation.
  - **Presiding Officer:** Oversees the polling booth, resolves complaints, and coordinates with the Sector Officer.
  - **Sector Officer:** Monitors multiple booths, tracks EVM health, and manages security incidents.
  - **Returning Officer (RO):** Oversees the entire constituency, tracking counting rounds and candidate telemetry.
  - **District Election Officer (DEO):** Monitors district-wide logistics, force deployment, and strong rooms.
  - **Chief Electoral Officer (CEO):** Oversees state-wide turnout trends and MCC violations.
  - **Election Commission of India (ECI):** Provides a national command center overview of the entire election.
  - **Voter Portal / User Complaints:** A public-facing portal for citizens to register complaints and view live polling data.
- **Intuitive UI:** Built with a modern, dark-themed, glassmorphism design for optimal readability during high-stress election operations.

## 🛠️ Technology Stack

- **Frontend:** React (Vite), Lucide-React for iconography, custom Vanilla CSS.
- **Backend:** Node.js, Express.js.
- **Database / Auth:** Supabase (for persistent storage and authentication logic).

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### 1. Start the Backend Server
```bash
cd EM_Dashboard/backend
npm install

# Copy environment variables (Make sure to configure your Supabase URL/Key if using live data)
cp .env.example .env

# Start the server (runs on port 5001)
npm run dev
```

### 2. Start the Frontend Application
```bash
cd EM_Dashboard/frontend
npm install

# Start the Vite development server (runs on port 5173)
npm run dev
```

### 3. Usage
Open your browser and navigate to `http://localhost:5173`. 
You will be presented with the main NagarVaani selection menu. Click on any role to begin navigating the hierarchy and accessing the dashboards!

## 🔐 Authentication & Navigation
- The system currently bypasses strict authentication for demonstration purposes, utilizing the `HierarchySelector` to securely navigate the mock organizational tree.
- A global `🏠 Home` button allows instant return to the main dashboard selector.
- `Logout` safely returns the user to the selection tree for their current role, preserving their place in the hierarchy.

---
*© 2026 NagarVaani Election System. All rights reserved.*
