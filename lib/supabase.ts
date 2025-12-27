import { createClient } from '@supabase/supabase-js';

// Configurazione fornita dall'utente nel contesto
// NOTA: In produzione, usa variabili d'ambiente reali!
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://phadpdiznnqyponhxksw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBoYWRwZGl6bm5xeXBvbmh4a3N3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0Mjk5NTYsImV4cCI6MjA3ODAwNTk1Nn0.f0gX9Sypa4mc1DJ_ius15l2WCV6L8YicZ-RzZbgkHvs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipi per TypeScript allineati con lo schema SQL fornito (UUID)
export interface Contact {
  id: string; // UUID
  user_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  company?: string;
  tags?: string[]; // Array di stringhe come da tuo schema
  custom_fields?: any; // jsonb
  subscribed?: boolean;
  created_at?: string;
  // Mapping opzionale per compatibilità UI se i nomi colonne differiscono
  role?: string; 
  status?: string;
  source?: string;
  country?: string;
}

export interface Mailbox {
  id: string; // UUID
  user_id?: string;
  email: string;
  name?: string; // Dal tuo schema
  quota?: string; // Dal tuo schema
  active?: boolean; // Dal tuo schema (bool invece di status text)
  
  // Colonne aggiunte via SQL ALTER
  smtp_host?: string;
  smtp_port?: number;
  smtp_user?: string;
  smtp_pass?: string;
  
  created_at?: string;
}

export interface EmailQueueItem {
    id: number; // Questo rimane bigint/number
    mailbox_id: string; // UUID reference
    to_email: string;
    subject: string;
    body_html: string;
    status: 'pending' | 'sent' | 'failed';
    error_message?: string;
    created_at: string;
}