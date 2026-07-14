import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';

type TableName = keyof Database['public']['Tables'];

export function useRealtimeData<T extends TableName>(
  tableName: T,
  orderBy = 'created_at',
  ascending = false
) {
  type Row = Database['public']['Tables'][T]['Row'];
  const [data, setData] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchInitialData() {
      try {
        const { data: initialData, error } = await supabase
          .from(tableName)
          .select('*')
          .order(orderBy, { ascending });

        if (error) throw error;
        if (mounted) {
          setData((initialData as Row[]) || []);
        }
      } catch (err: any) {
        console.error(`Error fetching ${tableName}:`, err);
        if (mounted) setError(err.message || 'Error fetching data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchInitialData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`public:${tableName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            setData((current) => {
              // Add to beginning or end based on order
              const newRow = payload.new as Row;
              return ascending ? [...current, newRow] : [newRow, ...current];
            });
          } else if (payload.eventType === 'UPDATE') {
            setData((current) =>
              current.map((item) =>
                item.id === payload.new.id ? (payload.new as Row) : item
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setData((current) =>
              current.filter((item) => item.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [tableName, orderBy, ascending]);

  return { data, loading, error };
}
