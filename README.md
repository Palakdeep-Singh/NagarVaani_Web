# 🚀 NagarVaani

A comprehensive administrative and citizen grievance management ecosystem for the Government of NCT of Delhi, comprising:
1. **Express Backend API** connected to Supabase PostgreSQL database.
2. **Admin & Nodal Agency Client** for managing grievances, municipal officers, and public records.
3. **CM Executive Dashboard** featuring a Force-Directed Knowledge Graph, AI Suggestions, and SLA Performance Monitoring.
4. **Standalone Calling System Package** (bundled in `calling-system.zip`).

---

## 📁 Project Structure

```
nagarvaani/
├── server/             # Backend API (Express, Socket.IO, Supabase)
├── client/             # Admin & Nodal Agency Client (React + Vite)
├── CM_Frontend/        # Chief Minister's Executive Dashboard (React + Vite, Tailwind CSS)
├── calling-system.zip  # Standalone calling module package
└── README.md
```

---

## 🛠️ Setup Instructions

### 1. Backend Server Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` environment variables:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```
4. Start the server (development mode with Nodemon):
   ```bash
   npm run dev
   ```

### 2. Admin & Nodal Client Setup
1. Navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` environment variables:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_key
   ```
4. Start the client:
   ```bash
   npm run dev
   ```

### 3. CM Dashboard Setup
1. Navigate to the CM Dashboard folder:
   ```bash
   cd CM_Frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   *(By default, this will run on `http://localhost:5174` if `http://localhost:5173` is occupied by the Admin client).*

---

## 🛡️ Key Features

*   **Executive Knowledge Graph**: An interactive, force-directed network showing live relationships between CM Office, Districts, Wards, assigned officers, and citizen complaints.
*   **Performance Monitoring & Leaderboards**: Automated district ranking algorithms evaluating SLA compliance scores.
*   **Digital File Management**: MCD e-office mock workflow supporting routing, remarks, and approval chains.
*   **Compliance Features**: Embedded model disclosures and safety notifications aligning with ECI/DOPT guidelines.
*   **Integrated Calling System Overlay**: An in-app WebRTC calling overlay for instant coordination between officials.

---

## 📝 License
MIT
