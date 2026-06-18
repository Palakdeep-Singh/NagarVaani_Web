# 🚀 Nagarvaani

A full-stack application built with **React + Vite** (frontend) and **Express + Supabase** (backend).

## 📁 Project Structure

```
nagarvaani/
├── server/          # Backend (Express + Supabase)
├── client/          # Frontend (React + Vite)
└── README.md
```

## 🛠️ Setup Instructions

### Backend Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   JWT_SECRET=your_jwt_secret
   ```

4. Start the server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env`:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_KEY=your_supabase_key
   ```

4. Start the dev server:
   ```bash
   npm run dev
   ```

## 🔐 Features in Progress

- ✅ Authentication (Signup/Login/Logout)
- 🔄 Global State Management (AuthContext)
- 🔄 API Integration (Axios)
- ⏳ Components (Next Phase)
- ⏳ Real-time Hooks (Next Phase)
- ⏳ Middleware & Error Handling (Next Phase)

## 📝 License

MIT
