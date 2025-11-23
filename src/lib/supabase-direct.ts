// Supabase 직접 연결 클라이언트 (Supabase JS 없이 REST API 사용)

const SUPABASE_URL = 'https://sqwobsmtrgjuhgymfwtl.supabase.co';
// Service Role Key - 모든 권한을 가진 비밀 키 (서버에서만 사용)
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxd29ic210cmdqdWhneW1md3RsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjY3Nzk4OCwiZXhwIjoyMDc4MjUzOTg4fQ.OKVm1qdziTvtTvSi3zxwAaVYfecsnZUUUIKFjSq-zU4';

interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export const supabaseDirect = {
  from: (table: string) => ({
    select: async (columns = '*', filters?: Record<string, any>) => {
      try {
        let url = `${SUPABASE_URL}/rest/v1/${table}?select=${columns}`;
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            url += `&${key}=eq.${value}`;
          });
        }

        const response = await fetch(url, {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { data: null, error: { message: errorText } };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error: { message: String(error) } };
      }
    },

    insert: async (values: any) => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { data: null, error: { message: errorText } };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error: { message: String(error) } };
      }
    },

    update: async (id: number, values: any) => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(values),
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { data: null, error: { message: errorText } };
        }

        const data = await response.json();
        return { data, error: null };
      } catch (error) {
        return { data: null, error: { message: String(error) } };
      }
    },

    delete: async (id: number) => {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
          method: 'DELETE',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { data: null, error: { message: errorText } };
        }

        return { data: null, error: null };
      } catch (error) {
        return { data: null, error: { message: String(error) } };
      }
    },
  }),
};

