/**
 * AuthContext.jsx — Fixed
 *
 * FIX 1: LoginUser was calling login() which didn't exist — only loginCitizen existed.
 *         Added `login` as an alias for loginCitizen so both work.
 *
 * FIX 2: restore() was checking data.userId but /api/auth/me returns the full user
 *         row which has `id` not `userId`. Fixed the check.
 *
 * FIX 3: loginCitizen now correctly reads user object from response shape:
 *         OTP verify returns { token, user: {...}, role: 'citizen' }
 *         Register  returns { token, user: {...}, role: 'citizen' }
 */
import { createContext, useState, useEffect, useCallback } from 'react';
import API from '../api/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  // ── Restore session from localStorage ────────────────────────────────────────
  const restore = useCallback(async () => {
    const saved = localStorage.getItem('nc_token');
    if (!saved) { setLoading(false); return; }
    try {
      const { data } = await API.get('/api/auth/me', {
        headers: { Authorization: `Bearer ${saved}` },
      });
      // /api/auth/me returns full user/admin row — has `id` field
      // Admin rows have role=district/state/central, citizen rows have role=citizen
      if (data && (data.id || data.adminId)) {
        setUser(data);
        setToken(saved);
      } else {
        localStorage.removeItem('nc_token');
      }
    } catch {
      localStorage.removeItem('nc_token');
    }
    setLoading(false);
  }, []);

  useEffect(() => { restore(); }, [restore]);

  // ── Citizen login ─────────────────────────────────────────────────────────────
  // Called after OTP verify or registration
  // Response shape: { token, user: { id, phone, full_name, ... }, role: 'citizen' }
  const loginCitizen = (userData, jwt) => {
    // Handle both loginCitizen(userData, jwt) and loginCitizen(fullResponse)
    let actualUser = userData;
    let actualJwt = jwt;

    if (!jwt && userData?.token) {
      // Called as loginCitizen(fullResponse) — extract fields
      actualJwt = userData.token;
      actualUser = userData.user || userData;
    }

    localStorage.setItem('nc_token', actualJwt);
    setToken(actualJwt);
    setUser({ ...actualUser, role: actualUser.role || 'citizen' });
  };

  // Alias — LoginUser.jsx was calling login() before the fix
  const login = loginCitizen;

  // ── Admin login ───────────────────────────────────────────────────────────────
  // Called after email+password login
  // Response shape: { token, admin: { id, name, email, role, state, district, ... } }
  const loginAdmin = (adminData, jwt) => {
    localStorage.setItem('nc_token', jwt);
    setToken(jwt);
    setUser({ ...adminData });
    setShowAdmin(false);
  };

  // ── Logout ────────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('nc_token');
    setToken(null);
    setUser(null);
    setShowAdmin(false);
  };

  const switchToAdmin = () => setShowAdmin(true);
  const switchToUser = () => setShowAdmin(false);

  // isAdmin — true for district/state/central roles
  const isAdmin = ['central', 'state', 'district'].includes(user?.role);

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAdmin, showAdmin,
      loginCitizen,
      login,        // alias — keeps backward compat if anything calls login()
      loginAdmin,
      logout,
      switchToAdmin,
      switchToUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}