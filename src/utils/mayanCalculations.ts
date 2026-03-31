import { NahualDB, TonoDB } from '@/hooks/useMayanData';

/**
 * Cruz Maya - Lógica basada en el Cholq'ij K'iche'
 *
 * ANCLA: 08/08/2002 = 12 E (Tono 12, Nahual E index 12)
 *
 * VECTORES DE CÁLCULO:
 * - Eje Vertical (Tiempo): -8 Concepción, +8 Destino
 * - Eje Horizontal (Espacio): -6 Derecha (Material), +6 Izquierda (Espiritual)
 * - Esquinas: Aplicar eje horizontal a Concepción y Destino
 */

// Función mod matemática verdadera (maneja negativos correctamente)
export const mod = (n: number, m: number): number => {
  return ((n % m) + m) % m;
};

// ANCLA: 08/08/2002 = 12 E
// E es index_num 12 en la base de datos (Imox=1, Iq'=2, ... E=12, ... Ajpu=20)
const ANCHOR_DATE = new Date(Date.UTC(2002, 7, 8, 12, 0, 0)); // 8 de Agosto 2002
const ANCHOR_TONE = 12;
const ANCHOR_NAHUAL_INDEX = 12; // E = índice 12

// Constantes del Cholq'ij
const NUM_NAHUALES = 20;
const NUM_TONOS = 13;
const OFFSET_VERTICAL = 8;   // Concepción (-8) y Destino (+8)
const OFFSET_HORIZONTAL = 6; // Derecha (-6) e Izquierda (+6)

export interface MayanKinDB {
  nahual: NahualDB;
  tone: TonoDB;
  kinNumber: number;
}

export interface CrossPositionDB {
  kin: MayanKinDB;
  position: string;
  meaning: string;
}

export interface MayanCrossDB {
  nacimiento: {
    centro: CrossPositionDB;
    izquierdo: CrossPositionDB;
    derecho: CrossPositionDB;
  };
  concepcion: {
    centro: CrossPositionDB;
    izquierdo: CrossPositionDB;
    derecho: CrossPositionDB;
  };
  destino: {
    centro: CrossPositionDB;
    izquierdo: CrossPositionDB;
    derecho: CrossPositionDB;
  };
}

// Get Nahual by index (1-20)
function getNahualByIndex(nahuales: NahualDB[], index: number): NahualDB | undefined {
  return nahuales.find(n => n.index_num === index);
}

// Get Tono by number (1-13)
function getTonoByNumber(tonos: TonoDB[], number: number): TonoDB | undefined {
  return tonos.find(t => t.numero === number);
}

/**
 * Calcula el Kin Maya para una fecha usando el ancla GMT
 */
export function calculateMayanKinFromDB(
  birthDate: Date,
  nahuales: NahualDB[],
  tonos: TonoDB[]
): MayanKinDB | null {
  if (nahuales.length === 0 || tonos.length === 0) return null;

  // Normalizar ambas fechas a mediodía UTC para evitar errores de timezone
  const normalizedBirth = Date.UTC(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate(),
    12,
    0,
    0
  );
  const normalizedAnchor = ANCHOR_DATE.getTime();

  // Calcular días transcurridos desde el ancla
  const daysElapsed = Math.floor((normalizedBirth - normalizedAnchor) / (1000 * 60 * 60 * 24));

  // Calcular índice de Nahual (ciclo de 20 días, índices 1-20)
  // Usamos mod para manejar negativos correctamente
  const nahualIndex = mod(ANCHOR_NAHUAL_INDEX - 1 + daysElapsed, NUM_NAHUALES) + 1;

  // Calcular Tono (ciclo de 13 días, valores 1-13)
  const toneValue = mod(ANCHOR_TONE - 1 + daysElapsed, NUM_TONOS) + 1;

  const nahual = getNahualByIndex(nahuales, nahualIndex);
  const tone = getTonoByNumber(tonos, toneValue);

  if (!nahual || !tone) {
    console.error('No se encontró nahual o tono:', { nahualIndex, toneValue, daysElapsed });
    return null;
  }

  // Calcular número de Kin (1-260)
  const kinNumber = mod((toneValue - 1) * 20 + (nahualIndex - 1), 260) + 1;

  return { nahual, tone, kinNumber };
}

/**
 * Calcula un Kin desplazado desde un Kin central usando offsets de signo y tono
 */
function calculateOffsetKin(
  centerKin: MayanKinDB,
  signOffset: number,
  toneOffset: number,
  nahuales: NahualDB[],
  tonos: TonoDB[]
): MayanKinDB | null {
  // Calcular nuevo índice de nahual (1-20)
  const newNahualIndex = mod(centerKin.nahual.index_num - 1 + signOffset, NUM_NAHUALES) + 1;
  
  // Calcular nuevo tono (1-13)
  const newToneValue = mod(centerKin.tone.numero - 1 + toneOffset, NUM_TONOS) + 1;

  const nahual = getNahualByIndex(nahuales, newNahualIndex);
  const tone = getTonoByNumber(tonos, newToneValue);

  if (!nahual || !tone) {
    console.error('No se encontró nahual o tono offset:', { newNahualIndex, newToneValue });
    return null;
  }

  const kinNumber = mod((newToneValue - 1) * 20 + (newNahualIndex - 1), 260) + 1;

  return { nahual, tone, kinNumber };
}

/**
 * Calcula la Cruz Maya completa de 9 Nahuales
 * 
 * Estructura:
 * 
 *   [Esq.Sup.Izq] [Concepción] [Esq.Sup.Der]
 *   [Izquierdo]   [Centro]     [Derecho]
 *   [Esq.Inf.Izq] [Destino]    [Esq.Inf.Der]
 * 
 * Vectores:
 * - Concepción = Centro - 8 signos, - 8 tonos
 * - Destino = Centro + 8 signos, + 8 tonos
 * - Derecho = Centro - 6 signos, - 6 tonos (Material)
 * - Izquierdo = Centro + 6 signos, + 6 tonos (Espiritual)
 * - Esquinas = Aplicar -6/+6 a Concepción y Destino
 */
export function calculateMayanCrossFromDB(
  birthDate: Date,
  nahuales: NahualDB[],
  tonos: TonoDB[]
): MayanCrossDB | null {
  if (nahuales.length === 0 || tonos.length === 0) return null;

  // === CENTRO: Nacimiento ===
  const centroKin = calculateMayanKinFromDB(birthDate, nahuales, tonos);
  if (!centroKin) return null;

  // === EJE VERTICAL (TIEMPO) ===
  // Concepción: Centro - 8 signos, - 8 tonos (hacia atrás en el tiempo)
  const concepcionKin = calculateOffsetKin(centroKin, -OFFSET_VERTICAL, -OFFSET_VERTICAL, nahuales, tonos);
  if (!concepcionKin) return null;

  // Destino: Centro + 8 signos, + 8 tonos (hacia adelante en el tiempo)
  const destinoKin = calculateOffsetKin(centroKin, OFFSET_VERTICAL, OFFSET_VERTICAL, nahuales, tonos);
  if (!destinoKin) return null;

  // === EJE HORIZONTAL DEL CENTRO (ESPACIO) ===
  // Derecho: Centro - 6 (Apoyo Material)
  const centroDerechoKin = calculateOffsetKin(centroKin, -OFFSET_HORIZONTAL, -OFFSET_HORIZONTAL, nahuales, tonos);
  if (!centroDerechoKin) return null;

  // Izquierdo: Centro + 6 (Desafío Espiritual)
  const centroIzquierdoKin = calculateOffsetKin(centroKin, OFFSET_HORIZONTAL, OFFSET_HORIZONTAL, nahuales, tonos);
  if (!centroIzquierdoKin) return null;

  // === ESQUINAS DE CONCEPCIÓN ===
  // Derecho de Concepción: Concepción - 6
  const concepcionDerechoKin = calculateOffsetKin(concepcionKin, -OFFSET_HORIZONTAL, -OFFSET_HORIZONTAL, nahuales, tonos);
  if (!concepcionDerechoKin) return null;

  // Izquierdo de Concepción: Concepción + 6
  const concepcionIzquierdoKin = calculateOffsetKin(concepcionKin, OFFSET_HORIZONTAL, OFFSET_HORIZONTAL, nahuales, tonos);
  if (!concepcionIzquierdoKin) return null;

  // === ESQUINAS DE DESTINO ===
  // Derecho de Destino: Destino - 6
  const destinoDerechoKin = calculateOffsetKin(destinoKin, -OFFSET_HORIZONTAL, -OFFSET_HORIZONTAL, nahuales, tonos);
  if (!destinoDerechoKin) return null;

  // Izquierdo de Destino: Destino + 6
  const destinoIzquierdoKin = calculateOffsetKin(destinoKin, OFFSET_HORIZONTAL, OFFSET_HORIZONTAL, nahuales, tonos);
  if (!destinoIzquierdoKin) return null;

  return {
    nacimiento: {
      centro: {
        kin: centroKin,
        position: "Centro - Nacimiento (Ruk'u'x)",
        meaning: "Tu Nahual principal. Define quién eres, tu esencia y personalidad. Es tu identidad energética, el Corazón de tu existencia."
      },
      derecho: {
        kin: centroDerechoKin,
        position: "Brazo Derecho - Apoyo Material",
        meaning: "Tu energía de apoyo. Representa los recursos, la familia y las fuerzas que te sostienen en el mundo material."
      },
      izquierdo: {
        kin: centroIzquierdoKin,
        position: "Brazo Izquierdo - Desafío Espiritual",
        meaning: "Tu energía de desafío. Representa las pruebas espirituales, la intuición y las lecciones que debes aprender."
      }
    },
    concepcion: {
      centro: {
        kin: concepcionKin,
        position: "Cabeza - Concepción (Engendramiento)",
        meaning: "El Nahual de tu fecundación. Las raíces del árbol de la vida, la herencia genética y espiritual de tus ancestros."
      },
      derecho: {
        kin: concepcionDerechoKin,
        position: "Esquina Superior Derecha",
        meaning: "El apoyo material que influenció tu concepción. Los dones ancestrales que traes al mundo físico."
      },
      izquierdo: {
        kin: concepcionIzquierdoKin,
        position: "Esquina Superior Izquierda",
        meaning: "La guía espiritual desde antes de nacer. La sabiduría y rectitud que heredas de tus abuelos."
      }
    },
    destino: {
      centro: {
        kin: destinoKin,
        position: "Pies - Destino (Misión)",
        meaning: "Tu Nahual de Destino. Hacia dónde debes evolucionar, tu misión de vida y el legado que dejarás al mundo."
      },
      derecho: {
        kin: destinoDerechoKin,
        position: "Esquina Inferior Derecha",
        meaning: "El apoyo material para tu destino. Las fuerzas que te ayudarán a cumplir tu misión en el mundo."
      },
      izquierdo: {
        kin: destinoIzquierdoKin,
        position: "Esquina Inferior Izquierda",
        meaning: "La conexión ancestral con tu destino. El trabajo espiritual que vienes a completar en esta vida."
      }
    }
  };
}

/**
 * Calcula la Trecena (periodo de 13 días) a la que pertenece un Kin.
 * La Trecena es el Nahual que rige cuando el Tono es 1.
 * 
 * Lógica: Retroceder (tono - 1) posiciones en la rueda de 20 nahuales
 * para encontrar qué Nahual cayó en el día 1 de esta trecena.
 */
export function calculateTrecena(
  kin: MayanKinDB,
  nahuales: NahualDB[]
): NahualDB | null {
  if (!kin || nahuales.length === 0) return null;
  
  // Cuántos días retroceder para llegar al tono 1
  const pasosAtras = kin.tone.numero - 1;
  
  // Calcular el índice del nahual de la trecena (1-20)
  // Si estamos en tono 1, el nahual de la trecena es el mismo
  const indiceTrecena = mod(kin.nahual.index_num - 1 - pasosAtras, NUM_NAHUALES) + 1;
  
  return getNahualByIndex(nahuales, indiceTrecena);
}
