
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

type AuthMode = 'login' | 'signup' | 'reset';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email for the confirmation link.");
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage("Password reset link sent to your email.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-['Inter']">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-md bg-[#080808] border border-white/5 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="inline-block mb-4">
            <span className="text-3xl font-black text-white tracking-tighter">
              BH<span className="text-[#FFD700]">•</span>EVER
            </span>
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-widest">
            {mode === 'login' ? 'Acesso Restrito' : mode === 'signup' ? 'Novo Cadastro' : 'Recuperar Senha'}
          </h1>
          <p className="text-gray-500 text-xs mt-2 uppercase font-bold tracking-[0.2em]">
            Squad VSL Asset Library
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FFD700] transition-colors" size={16} />
              <input
                type="email"
                required
                className="w-full bg-black border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-[#FFD700] outline-none transition-all"
                placeholder="editor@bhever.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#FFD700] transition-colors" size={16} />
                <input
                  type="password"
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-[#FFD700] outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-2">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-[11px] text-red-400 font-bold uppercase leading-tight">{error}</p>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl animate-in slide-in-from-top-2">
              <AlertCircle className="text-green-500 shrink-0" size={18} />
              <p className="text-[11px] text-green-400 font-bold uppercase leading-tight">{message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#FFD700] text-black rounded-2xl text-xs font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#FFD700]/10 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                {mode === 'login' ? 'ENTRAR NO SISTEMA' : mode === 'signup' ? 'CRIAR MINHA CONTA' : 'ENVIAR LINK'}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center">
          {mode === 'login' ? (
            <>
              <button onClick={() => setMode('signup')} className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                Não tem conta? <span className="text-[#FFD700]">Cadastre-se</span>
              </button>
              <button onClick={() => setMode('reset')} className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                Esqueceu a senha?
              </button>
            </>
          ) : (
            <button onClick={() => setMode('login')} className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
              Voltar para o <span className="text-[#FFD700]">Login</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
