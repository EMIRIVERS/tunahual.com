import { Illumination, Body, MoonPhase, SearchMoonPhase } from "astronomy-engine";

/**
 * Ciclos de la luna con Astronomy Engine (corre en el navegador, sin servidor).
 * Ocho fases; los significados los escribe Azul Anaité (aquí solo hay nombre).
 */

export type FaseLuna =
  | "nueva" | "creciente" | "cuarto-creciente" | "gibosa-creciente"
  | "llena" | "gibosa-menguante" | "cuarto-menguante" | "menguante";

export const FASES_LUNA: { id: FaseLuna; nombre: string }[] = [
  { id: "nueva", nombre: "Luna nueva" },
  { id: "creciente", nombre: "Luna creciente" },
  { id: "cuarto-creciente", nombre: "Cuarto creciente" },
  { id: "gibosa-creciente", nombre: "Luna creciente gibosa" },
  { id: "llena", nombre: "Luna llena" },
  { id: "gibosa-menguante", nombre: "Luna menguante gibosa" },
  { id: "cuarto-menguante", nombre: "Cuarto menguante" },
  { id: "menguante", nombre: "Luna menguante" },
];

export interface LunaResult {
  fase: FaseLuna;
  nombre: string;
  /** Porcentaje iluminado, 0–100. */
  iluminacion: number;
  /** Elongación eclíptica 0–360° (0 nueva, 180 llena). */
  angulo: number;
}

/** Mediodía local de la fecha: evita saltos de día por zona horaria. */
function mediodia(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0);
}

export function calcularLuna(date: Date): LunaResult {
  const t = mediodia(date);
  const angulo = MoonPhase(t);
  const iluminacion = Math.round(Illumination(Body.Moon, t).phase_fraction * 100);
  const idx = Math.floor(((angulo + 22.5) % 360) / 45);
  const fase = FASES_LUNA[idx];
  return { fase: fase.id, nombre: fase.nombre, iluminacion, angulo };
}

export interface LunaEvento {
  tipo: "nueva" | "llena";
  fecha: Date;
  /** Día dentro de la ventana (1 = primer día). */
  dia: number;
}

/**
 * Lunas nuevas y llenas que caen en los `dias` siguientes a `inicio`
 * (por defecto 13, una trecena). Material para rituales y correos.
 */
export function lunasEnRango(inicio: Date, dias = 13): LunaEvento[] {
  const desde = mediodia(inicio);
  const hasta = new Date(desde.getTime() + dias * 86400000);
  const eventos: LunaEvento[] = [];
  for (const [grados, tipo] of [[0, "nueva"], [180, "llena"]] as const) {
    let cursor = desde;
    for (let i = 0; i < 3; i++) {
      const hit = SearchMoonPhase(grados, cursor, dias + 31);
      if (!hit || hit.date > hasta) break;
      const f = hit.date;
      const dia = Math.floor((new Date(f.getFullYear(), f.getMonth(), f.getDate()).getTime() -
        new Date(desde.getFullYear(), desde.getMonth(), desde.getDate()).getTime()) / 86400000) + 1;
      if (f >= desde) eventos.push({ tipo, fecha: f, dia });
      cursor = new Date(f.getTime() + 86400000);
    }
  }
  return eventos.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
}
