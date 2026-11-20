import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { atributosCanon } from '@/data/maices';

import type { NahualDB, TonoDB } from '../types/mayan';
export type { NahualDB, TonoDB };

export function useMayanData() {
  const [nahuales, setNahuales] = useState<NahualDB[]>([]);
  const [tonos, setTonos] = useState<TonoDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [nahualRes, tonoRes] = await Promise.all([
          supabase.from('nahuales').select('*').order('index_num'),
          supabase.from('tonos').select('*').order('numero')
        ]);

        if (nahualRes.error) throw nahualRes.error;
        if (tonoRes.error) throw tonoRes.error;

        setNahuales((nahualRes.data || []).map(atributosCanon));
        setTonos(tonoRes.data || []);
      } catch (err: any) {
        console.error('Error fetching Mayan data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { nahuales, tonos, loading, error };
}
