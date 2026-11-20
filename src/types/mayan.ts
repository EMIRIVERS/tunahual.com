// Tipos de las filas de nahuales y tonos. Viven aparte para que el cálculo (también usado por api/) no arrastre el cliente de Supabase.
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
