
import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import AuthPage from './AuthPage';
import { Loader2 } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Subscribe to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-['Inter']">
        <Loader2 className="animate-spin text-[#FFD700] mb-4" size={48} strokeWidth={1} />
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Checking Access...</span>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return <>{children}</>;
};

export default AuthGate;
