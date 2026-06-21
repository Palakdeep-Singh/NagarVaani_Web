import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { ShieldCheck, Lock, User, Eye, EyeOff } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginUser } = useStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser(username, password)) {
      setError('Invalid credentials or unauthorized access.');
    }
  };

  return (
    <div className="min-h-screen bg-[#050C1A] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute top-0 w-full h-1.5 flex">
        <div className="h-full bg-[#FF9933]" style={{ width: '33.33%' }} />
        <div className="h-full bg-white" style={{ width: '33.33%' }} />
        <div className="h-full bg-[#138808]" style={{ width: '33.33%' }} />
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 px-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            <ShieldCheck size={32} className="text-indigo-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">NagarVaani Portal</h1>
          <p className="text-sm text-slate-400 font-medium">District Magistrate Interface (Shahdara)</p>
        </div>

        <div className="bg-[#0D1730] border border-[#1E2D47] rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg font-medium text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Govt ID / Username</label>
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="e.g. dm.shahdara"
                  className="w-full bg-[#080F22] border border-[#1E2D47] text-white rounded-xl pl-11 pr-4 py-3 outline-none focus:border-indigo-500 transition-colors text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Secure Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full bg-[#080F22] border border-[#1E2D47] text-white rounded-xl pl-11 pr-12 py-3 outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-900/20 active:scale-[0.98] flex justify-center items-center gap-2 mt-4"
            >
              <ShieldCheck size={18} /> Enter Secure Portal
            </button>
          </form>

          <div className="mt-8 text-center border-t border-[#1E2D47] pt-6">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold leading-relaxed">
              Govt. of NCT of Delhi<br/>
              Access strictly monitored under IT Act, 2000
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
