import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getNahualFromSlug } from '@/data/nahualSlugs';

export interface NahualCompleto {
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
  // Conocimiento expandido
  significado_profundo?: string;
  ceremonias_rituales?: string;
  mensaje_espiritual?: string;
  polaridad_positiva?: string[];
  polaridad_negativa?: string[];
  trabajo_espiritual?: string;
  relacion_naturaleza?: string;
}

export function useNahualBySlug(slug: string | undefined) {
  const [nahual, setNahual] = useState<NahualCompleto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNahual() {
      if (!slug) {
        setLoading(false);
        return;
      }

      const nahualName = getNahualFromSlug(slug);
      if (!nahualName) {
        setError('Nahual no encontrado');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: queryError } = await supabase
          .from('nahuales')
          .select(`
            *,
            nahual_conocimiento_expandido (
              significado_profundo,
              ceremonias_rituales,
              mensaje_espiritual,
              polaridad_positiva,
              polaridad_negativa,
              trabajo_espiritual,
              relacion_naturaleza
            )
          `)
          .eq('nombre', nahualName)
          .single();

        if (queryError) throw queryError;

        if (data) {
          const expanded = data.nahual_conocimiento_expandido;
          setNahual({
            ...data,
            significado_profundo: expanded?.significado_profundo,
            ceremonias_rituales: expanded?.ceremonias_rituales,
            mensaje_espiritual: expanded?.mensaje_espiritual,
            polaridad_positiva: expanded?.polaridad_positiva,
            polaridad_negativa: expanded?.polaridad_negativa,
            trabajo_espiritual: expanded?.trabajo_espiritual,
            relacion_naturaleza: expanded?.relacion_naturaleza,
          });
        }
      } catch (err: any) {
        console.error('Error fetching nahual:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchNahual();
  }, [slug]);

  return { nahual, loading, error };
}
