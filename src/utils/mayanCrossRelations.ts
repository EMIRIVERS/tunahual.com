/**
 * Cruz Maya - Relaciones de la Cruz de 9 Nahuales
 * 
 * Este archivo ahora es un auxiliar simplificado.
 * La lógica principal de cálculo está en mayanCalculations.ts
 * usando los vectores correctos del Cholq'ij K'iche':
 * 
 * - Eje Vertical: -8/+8 (Concepción/Destino)
 * - Eje Horizontal: -6/+6 (Derecha Material/Izquierda Espiritual)
 * 
 * Nota histórica: La matriz estática HORIZONTAL_RELATIONS fue reemplazada
 * por el cálculo dinámico basado en offsets, que es más fiel a la
 * tradición maya y permite verificación matemática.
 */

import { NahualDB, TonoDB } from '@/hooks/useMayanData';
import { MayanKinDB, mod } from './mayanCalculations';

const NUM_NAHUALES = 20;
const NUM_TONOS = 13;
const OFFSET_HORIZONTAL = 6;

// Get Nahual by index (1-20)
function getNahualByIndex(nahuales: NahualDB[], index: number): NahualDB | undefined {
  return nahuales.find(n => n.index_num === index);
}

// Get Tono by number (1-13)
function getTonoByNumber(tonos: TonoDB[], number: number): TonoDB | undefined {
  return tonos.find(t => t.numero === number);
}

/**
 * Calcula los brazos horizontales de un Kin central
 * Usando offsets -6/+6 según la tradición K'iche'
 */
export function getCrossRow(
  centerKin: MayanKinDB,
  nahuales: NahualDB[],
  tonos: TonoDB[]
): { izquierdo: MayanKinDB; centro: MayanKinDB; derecho: MayanKinDB } | null {
  
  // === DERECHO: Centro - 6 (Apoyo Material) ===
  const derechoNahualIndex = mod(centerKin.nahual.index_num - 1 - OFFSET_HORIZONTAL, NUM_NAHUALES) + 1;
  const derechoToneValue = mod(centerKin.tone.numero - 1 - OFFSET_HORIZONTAL, NUM_TONOS) + 1;
  
  const derechoNahual = getNahualByIndex(nahuales, derechoNahualIndex);
  const derechoTone = getTonoByNumber(tonos, derechoToneValue);
  
  if (!derechoNahual || !derechoTone) {
    console.error('No se encontró nahual/tono derecho:', { derechoNahualIndex, derechoToneValue });
    return null;
  }
  
  const derechoKinNumber = mod((derechoToneValue - 1) * 20 + (derechoNahualIndex - 1), 260) + 1;
  const derechoKin: MayanKinDB = { nahual: derechoNahual, tone: derechoTone, kinNumber: derechoKinNumber };

  // === IZQUIERDO: Centro + 6 (Desafío Espiritual) ===
  const izquierdoNahualIndex = mod(centerKin.nahual.index_num - 1 + OFFSET_HORIZONTAL, NUM_NAHUALES) + 1;
  const izquierdoToneValue = mod(centerKin.tone.numero - 1 + OFFSET_HORIZONTAL, NUM_TONOS) + 1;
  
  const izquierdoNahual = getNahualByIndex(nahuales, izquierdoNahualIndex);
  const izquierdoTone = getTonoByNumber(tonos, izquierdoToneValue);
  
  if (!izquierdoNahual || !izquierdoTone) {
    console.error('No se encontró nahual/tono izquierdo:', { izquierdoNahualIndex, izquierdoToneValue });
    return null;
  }
  
  const izquierdoKinNumber = mod((izquierdoToneValue - 1) * 20 + (izquierdoNahualIndex - 1), 260) + 1;
  const izquierdoKin: MayanKinDB = { nahual: izquierdoNahual, tone: izquierdoTone, kinNumber: izquierdoKinNumber };

  return {
    derecho: derechoKin,
    centro: centerKin,
    izquierdo: izquierdoKin
  };
}
