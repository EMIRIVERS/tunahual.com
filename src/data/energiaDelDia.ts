// Guía de las 13 Potencias energéticas de los días.
//
// Destilada del material de Azul Anaité (PDF "NAHUALES" — "Los Nombres y los
// Valores Intrínsecos de las 13 Potencias"). Tono editorial y sobrio, en
// clave de "qué conviene caminar hoy". Es contenido editable: la clienta
// puede afinar cada línea sin tocar la lógica.
//
// Se usa en el widget "Energía de hoy" (ver src/components/EnergiaDelDia.tsx),
// combinando la Potencia (el tono del día) con el Nahual del día.

export interface PotenciaGuia {
  /** Esencia de la Potencia, una línea. */
  esencia: string;
  /** Tres indicaciones de lo que conviene caminar en un día de esta Potencia. */
  indicaciones: [string, string, string];
}

export const potenciasGuia: Record<number, PotenciaGuia> = {
  1: {
    esencia: "Unidad e inicio.",
    indicaciones: [
      "Comienza eso que has estado postergando: hoy se abre un ciclo.",
      "Confía en las ideas nuevas; es día de soluciones creativas.",
      "Pon una intención clara para lo que quieres sembrar.",
    ],
  },
  2: {
    esencia: "Dualidad y unión.",
    indicaciones: [
      "Acércate a tu familia y a tus amistades; cuida los vínculos.",
      "Buen día para acuerdos, sociedades y conversaciones honestas.",
      "Busca el equilibrio entre lo que das y lo que recibes.",
    ],
  },
  3: {
    esencia: "Comunicación, creatividad y optimismo.",
    indicaciones: [
      "Expresa lo que traes dentro; usa tu imaginación sin reservas.",
      "Comunica con claridad y buen ánimo.",
      "Atiende a tus hijos, tus proyectos y los frutos de tu esfuerzo.",
    ],
  },
  4: {
    esencia: "Estabilidad, firmeza y seguridad.",
    indicaciones: [
      "Ordena y da cimientos firmes a lo que emprendes.",
      "Toma decisiones que busquen raíz y seguridad.",
      "Honra los cuatro rumbos: cuerpo, mente, corazón y espíritu.",
    ],
  },
  5: {
    esencia: "Libertad, carisma y buena fortuna.",
    indicaciones: [
      "Anímate a hacer un cambio; el día favorece lo inesperado.",
      "Ábrete al amor y a los encuentros afortunados.",
      "Muévete hacia lo que deseas con confianza.",
    ],
  },
  6: {
    esencia: "Aprendizaje, cambios y responsabilidad.",
    indicaciones: [
      "Agradece lo recibido y devuélvelo a tu comunidad.",
      "Resuelve un asunto pendiente con responsabilidad.",
      "Recibe los cambios como aprendizaje, no como carga.",
    ],
  },
  7: {
    esencia: "Espiritualidad, intuición e introspección.",
    indicaciones: [
      "Dedica tiempo al silencio y a mirar hacia adentro.",
      "Reflexiona antes de actuar: no es día de grandes decisiones.",
      "Cultiva tu equilibrio interior.",
    ],
  },
  8: {
    esencia: "Autoridad y energía material.",
    indicaciones: [
      "Aprovecha la energía física para el trabajo y lo concreto.",
      "Atiende tus finanzas; es buen día para ahorrar.",
      "Toma tu lugar con autoridad serena.",
    ],
  },
  9: {
    esencia: "Fuerza femenina, compasión y sabiduría.",
    indicaciones: [
      "Actúa con compasión y ayuda a quien lo necesite.",
      "Pide y ofrece perdón; suelta lo que pesa.",
      "Cierra lo que dejaste inconcluso.",
    ],
  },
  10: {
    esencia: "Manifestación e integridad.",
    indicaciones: [
      "Lleva a buen término un proyecto que ya empezaste.",
      "Trabaja con integridad y rectitud.",
      "Sostén tu centro ante los altibajos del día.",
    ],
  },
  11: {
    esencia: "Aprendizaje a través de la experiencia.",
    indicaciones: [
      "Ten paciencia: hoy se aprende viviendo.",
      "Evita decisiones importantes; observa y comparte.",
      "Recibe las pruebas como maestras.",
    ],
  },
  12: {
    esencia: "Creatividad, retos y sueños.",
    indicaciones: [
      "Da forma concreta a un sueño que traes.",
      "Fortalece tu autoconfianza y ayuda a los demás.",
      "Reconoce tu lugar en la familia y la comunidad.",
    ],
  },
  13: {
    esencia: "Plenitud, realización y cierre de ciclo.",
    indicaciones: [
      "Cierra tu ciclo con gratitud; celebra lo logrado.",
      "Comparte tus dones y aconseja a quien te busque.",
      "Dedica el día a lo sagrado y a la recompensa merecida.",
    ],
  },
};

export function getPotenciaGuia(toneNumero: number): PotenciaGuia | null {
  return potenciasGuia[toneNumero] ?? null;
}
