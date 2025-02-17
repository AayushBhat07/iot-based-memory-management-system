
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://gyswblkrrbsnunfarudj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd5c3dibGtycmJzbnVuZmFydWRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkwOTA1ODUsImV4cCI6MjA1NDY2NjU4NX0.fFsNHrRvBzLcksLRKBCrxopZBlh8u8IcZH3zv2DVqZY";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    storageKey: 'photographer-auth-token',
    storage: {
      getItem: (key) => {
        try {
          const item = document.cookie
            .split('; ')
            .find(row => row.startsWith(`${key}=`))
            ?.split('=')[1];
          return item ? JSON.parse(decodeURIComponent(item)) : null;
        } catch {
          return null;
        }
      },
      setItem: (key, value) => {
        document.cookie = `${key}=${encodeURIComponent(JSON.stringify(value))}; path=/; secure; samesite=strict; max-age=604800`; // 7 days
      },
      removeItem: (key) => {
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict`;
      },
    },
  },
  db: {
    schema: 'public',
  },
});
