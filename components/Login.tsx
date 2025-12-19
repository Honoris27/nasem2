
import React, { useState } from 'react';
import { UserRole } from '../types';
import { ShieldCheck, Eye, EyeOff, Lock, ArrowRight, Building2 } from 'lucide-react';

interface LoginProps {
  onLogin: (role: UserRole) => void;
  viewerPassword: string;
}

const Login: React.FC<LoginProps> = ({ onLogin, viewerPassword }) => {
  const [role, setRole] = useState<UserRole>('viewer');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'admin' && password === '142536789') onLogin('admin');
    else if (role === 'viewer' && password === viewerPassword) onLogin('viewer');
    else setError('Hatalı yetkilendirme şifresi!');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -mr-96 -mt-96"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -ml-64 -mb-64"></div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-1000">
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-black/50 overflow-hidden border border-white/10">
          <div className="p-12 bg-slate-900 text-white text-center relative">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30">
              <Building2 size={36} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter">Kurumsal Portal</h1>
            <p className="text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest opacity-60">ProAnaliz V1.0 Enterprise</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-12 space-y-8">
            <div className="flex bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => { setRole('admin'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  role === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Lock size={14} /> Yönetici
              </button>
              <button
                type="button"
                onClick={() => { setRole('viewer'); setError(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  role === 'viewer' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <Eye size={14} /> İzleyici
              </button>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Erişim Anahtarı"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                />
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              
              {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95"
            >
              Sisteme Giriş Yap <ArrowRight size={18} />
            </button>
          </form>
          
          <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">SECURE CORPORATE INFRASTRUCTURE</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
