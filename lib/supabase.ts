
import { createClient } from '@supabase/supabase-js';

// As chaves foram fornecidas diretamente pelo usuário para garantir a conexão imediata.
const supabaseUrl = 'https://xxtwdvmxvlcumhyovtmi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4dHdkdm14dmxjdW1oeW92dG1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2NDA3ODcsImV4cCI6MjA4MzIxNjc4N30.XavjWDYG5o3HxJodu1XiV1r4lHhwzNsPPGKA-6eXsDs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
