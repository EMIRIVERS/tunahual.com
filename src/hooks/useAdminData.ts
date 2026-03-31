import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Lead {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string;
  nahual: string | null;
  tono: number | null;
  kin_completo: string | null;
  created_at: string;
}

export interface Nahual {
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
  icon_name: string | null;
}

export interface Tono {
  id: string;
  numero: number;
  nombre: string;
  significado: string;
  descripcion: string;
  cualidades: string[];
}

export interface Guardian {
  id: string;
  nombre: string;
  nombre_maya: string;
  significado: string;
  invocacion: string | null;
}

export interface ConceptoFundamental {
  id: string;
  nombre: string;
  nombre_maya: string | null;
  descripcion: string;
  ensenanza: string;
}

export interface NahualConocimiento {
  id: string;
  nahual_id: string;
  nombre_completo: string;
  significado_profundo: string;
  ceremonias_rituales: string;
  fecundado_en: string;
  mensaje_espiritual: string;
  polaridad_positiva: string[];
  polaridad_negativa: string[];
  trabajo_espiritual: string;
  relacion_naturaleza: string;
}

export function useAdminData() {
  const { toast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [nahuales, setNahuales] = useState<Nahual[]>([]);
  const [tonos, setTonos] = useState<Tono[]>([]);
  const [guardianes, setGuardianes] = useState<Guardian[]>([]);
  const [conceptos, setConceptos] = useState<ConceptoFundamental[]>([]);
  const [conocimiento, setConocimiento] = useState<NahualConocimiento[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    // Fetch all leads without the 1000 row limit
    const { count } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true });
    
    const allLeads: Lead[] = [];
    const pageSize = 1000;
    const totalPages = Math.ceil((count || 0) / pageSize);
    
    for (let page = 0; page < totalPages; page++) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        toast({ title: 'Error', description: 'No se pudieron cargar los leads', variant: 'destructive' });
        return;
      }
      allLeads.push(...(data || []));
    }
    
    setLeads(allLeads);
  };

  const fetchNahuales = async () => {
    const { data, error } = await supabase
      .from('nahuales')
      .select('*')
      .order('index_num', { ascending: true });
    
    if (!error) setNahuales(data || []);
  };

  const fetchTonos = async () => {
    const { data, error } = await supabase
      .from('tonos')
      .select('*')
      .order('numero', { ascending: true });
    
    if (!error) setTonos(data || []);
  };

  const fetchGuardianes = async () => {
    const { data, error } = await supabase
      .from('guardianes')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (!error) setGuardianes(data || []);
  };

  const fetchConceptos = async () => {
    const { data, error } = await supabase
      .from('conceptos_fundamentales')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (!error) setConceptos(data || []);
  };

  const fetchConocimiento = async () => {
    const { data, error } = await supabase
      .from('nahual_conocimiento_expandido')
      .select('*');
    
    if (!error) setConocimiento(data || []);
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchLeads(),
      fetchNahuales(),
      fetchTonos(),
      fetchGuardianes(),
      fetchConceptos(),
      fetchConocimiento()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Update functions
  const updateNahual = async (id: string, updates: Partial<Nahual>) => {
    const { error } = await supabase
      .from('nahuales')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el nahual', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Nahual actualizado correctamente' });
    await fetchNahuales();
    return true;
  };

  const updateTono = async (id: string, updates: Partial<Tono>) => {
    const { error } = await supabase
      .from('tonos')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el tono', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Tono actualizado correctamente' });
    await fetchTonos();
    return true;
  };

  const updateGuardian = async (id: string, updates: Partial<Guardian>) => {
    const { error } = await supabase
      .from('guardianes')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el guardián', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Guardián actualizado correctamente' });
    await fetchGuardianes();
    return true;
  };

  const updateConcepto = async (id: string, updates: Partial<ConceptoFundamental>) => {
    const { error } = await supabase
      .from('conceptos_fundamentales')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el concepto', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Concepto actualizado correctamente' });
    await fetchConceptos();
    return true;
  };

  const updateConocimiento = async (id: string, updates: Partial<NahualConocimiento>) => {
    const { error } = await supabase
      .from('nahual_conocimiento_expandido')
      .update(updates)
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el conocimiento', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Conocimiento actualizado correctamente' });
    await fetchConocimiento();
    return true;
  };

  // Create functions
  const createGuardian = async (guardian: Omit<Guardian, 'id'>) => {
    const { error } = await supabase
      .from('guardianes')
      .insert(guardian);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo crear el guardián', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Guardián creado correctamente' });
    await fetchGuardianes();
    return true;
  };

  const createConcepto = async (concepto: Omit<ConceptoFundamental, 'id'>) => {
    const { error } = await supabase
      .from('conceptos_fundamentales')
      .insert(concepto);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo crear el concepto', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Concepto creado correctamente' });
    await fetchConceptos();
    return true;
  };

  // Delete functions
  const deleteGuardian = async (id: string) => {
    const { error } = await supabase
      .from('guardianes')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el guardián', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Guardián eliminado correctamente' });
    await fetchGuardianes();
    return true;
  };

  const deleteConcepto = async (id: string) => {
    const { error } = await supabase
      .from('conceptos_fundamentales')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el concepto', variant: 'destructive' });
      return false;
    }
    toast({ title: 'Éxito', description: 'Concepto eliminado correctamente' });
    await fetchConceptos();
    return true;
  };

  return {
    leads,
    nahuales,
    tonos,
    guardianes,
    conceptos,
    conocimiento,
    loading,
    refreshAll,
    updateNahual,
    updateTono,
    updateGuardian,
    updateConcepto,
    updateConocimiento,
    createGuardian,
    createConcepto,
    deleteGuardian,
    deleteConcepto
  };
}
