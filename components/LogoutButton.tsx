
import React from 'react';
import { supabase } from '../lib/supabase';
import { LogOut } from 'lucide-react';

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2"
      title="Sair do Sistema"
    >
      <LogOut size={18} />
      <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">Sair</span>
    </button>
  );
};

export default LogoutButton;
