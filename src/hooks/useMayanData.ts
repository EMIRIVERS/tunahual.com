import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface NahualDB {
  id: string;
  index_num: number;
  nombre: string;
  significado: string;
  descripcion: string;
  elemento: string;
  animal_guia: string;
  punto_cardinal: string;
  color_maiz: string;
  parte_cuerpo: string;
  lugar_poder: string;
  elemento_conexion: string;
  cualidades: string[];
  sombras: string[];
  fecundado_en: string | null;
}

export interface TonoDB {
  id: string;
  numero: number;
  nombre: string;
  significado: string;
  descripcion: string;
  cualidades: string[];
}

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

        setNahuales(nahualRes.data || []);
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
