// Supabase 직접 연결 클라이언트 (Supabase JS 없이 REST API 사용)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// ⚠️ 환경 변수로 이동 - 절대 Git에 커밋하지 마세요!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string } | null;
}

export const supabaseDirect = {
  from: (table: string) => ({
    select: async (columns = '*', filters?: Record<string, unknown>) => {
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

    insert: async (values: Record<string, unknown>) => {
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

    update: async (id: number, values: Record<string, unknown>) => {
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

