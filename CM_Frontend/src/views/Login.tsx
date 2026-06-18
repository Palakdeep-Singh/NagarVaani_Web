import React, { useState } from 'react';
import { useStore } from '../context/Store';
import type { DistrictName } from '../types';
import { ShieldCheck, Lock, User, Sparkles, Building, MapPin, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginUser, registerUser } = useStore();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');

  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  
  const [role, setRole] = useState<'Chief Minister' | 'District Magistrate' | 'Department Head'>('District Magistrate');
  const [district, setDistrict] = useState<DistrictName>('New Delhi');
  const [department, setDepartment] = useState<'Education & Schools' | 'Public Health' | 'PWD & Infrastructure'>('Public Health');

  const districts: DistrictName[] = [
    'New Delhi', 'North Delhi', 'North West Delhi', 'West Delhi',
    'South West Delhi', 'South Delhi', 'South East Delhi', 'Central Delhi',
    'East Delhi', 'Shahdara', 'North East Delhi'
  ];

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password) {
      setErrorMsg('Please enter both username and password.');
      return;
    }
    const success = loginUser(username, password);
    if (!success) {
      setErrorMsg('Invalid username or password.');
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!username.trim() || !password) {
      setErrorMsg('Please fill in all credentials fields.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('Password should be at least 4 characters long.');
      return;
    }
    const success = registerUser(
      username,
      password,
      role,
      role === 'District Magistrate' ? district : undefined,
      role === 'Department Head' ? department : undefined
    );
    if (!success) {
      setErrorMsg('Username is already taken.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden font-sans">
            <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-100/40 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-teal-100/30 blur-[120px]" />

      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 md:p-8 z-10 relative">
                <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/10 text-white font-extrabold text-xl mb-3">
            N
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">NAGARVAANI</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Delhi CM Grievance Portal</p>
        </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-6">
          <button
            onClick={() => {
              setActiveTab('signin');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'signin' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'signup' ? 'bg-white text-slate-800 shadow-sm border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

                {errorMsg && (
          <div className="mb-4 bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 font-medium">
            <AlertCircle className="h-4.5 w-4.5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

                {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. cm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="h-4 w-4" /> Authenticate Session
            </button>
          </form>
        )}

                {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Choose Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. westdelhidm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
                <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Security Password</label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                />
                <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Administrative Role</label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold appearance-none"
                >
                  <option value="District Magistrate">District Magistrate (DM)</option>
                  <option value="Department Head">Department Head / Nodal Officer</option>
                  <option value="Chief Minister">Chief Minister (CM)</option>
                </select>
                <Building className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

                        {role === 'District Magistrate' && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Assigned District Zone</label>
                <div className="relative">
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value as DistrictName)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold appearance-none"
                  >
                    {districts.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <MapPin className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

                        {role === 'Department Head' && (
              <div className="space-y-1 animate-in slide-in-from-top-1 duration-200">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Assigned Department Portfolio</label>
                <div className="relative">
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer font-semibold appearance-none"
                  >
                    <option value="Public Health">Health & Family Welfare</option>
                    <option value="Education & Schools">Education Department</option>
                    <option value="PWD & Infrastructure">PWD & Infrastructure</option>
                  </select>
                  <Building className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 text-teal-300" /> Register & Authenticate
            </button>
          </form>
        )}

        {/* Fast Dev Bypass Authorization */}
        <div className="mt-6 pt-4 border-t border-slate-200/80">
          <div className="text-xs font-extrabold text-amber-600 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
            ⚡ Fast Authorization Access (Dev Mode)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => loginUser('cm', 'cm123')}
              className="py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
            >
              👑 CM View
            </button>
            <button
              onClick={() => loginUser('newdelhidm', 'dm123')}
              className="py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
            >
              🏢 DM View
            </button>
            <button
              onClick={() => loginUser('healthhead', 'dept123')}
              className="py-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-700 font-bold rounded-xl text-[10px] transition-colors cursor-pointer text-center"
            >
              💼 Dept Nodal
            </button>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 bg-slate-50/50 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-slate-200">
          <div className="font-bold text-slate-700 mb-2 flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            Evaluation Credentials:
          </div>
          <div className="space-y-1.5 text-xs leading-tight">
            <div>• CM: <span className="font-bold text-slate-700 bg-slate-200/50 px-1 rounded">cm</span> / <span className="font-bold text-slate-700 bg-slate-200/50 px-1 rounded">cm123</span></div>
            <div>• DM: <span className="font-bold text-slate-700 bg-slate-200/50 px-1 rounded">newdelhidm</span> / <span className="font-bold text-slate-700 bg-slate-200/50 px-1 rounded">dm123</span></div>
            <div>• Dept Nodal: <span className="font-bold text-slate-700 bg-slate-200/50 px-1 rounded">healthhead</span> / <span className="font-bold text-slate-700 bg-slate-200/50 px-1 rounded">dept123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
