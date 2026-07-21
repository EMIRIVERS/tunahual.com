import { LucideIcon, Waves, Wind, Sunrise, Grid3X3, Zap, Skull, TreeDeciduous, Sprout, Flame, Scale, Palette, Route, Home, Cat, Bird, Eye, Brain, Swords, Cloud, Sun } from "lucide-react";
import { getNahualConocimiento, NahualConocimientoExpandido } from "./mayanKnowledge";

export interface Nahual {
  index: number;
  name: string;
  meaning: string;
  description: string;
  element: string;
  icon: LucideIcon;
  animalGuia: string;
  puntoCardinal: string;
  colorMaiz: string;
  parteDelCuerpo: string;
  lugarDelPoder: string;
  elementoConexion: string;
  cualidades: string[];
  sombras: string[]; // Aspectos a trabajar
  fecundadoEn?: string; // Nahual de fecundación
}

export interface Tone {
  number: number;
  name: string;
  meaning: string;
  description: string;
  cualidades: string[];
}

export const nahuales: Nahual[] = [
  {
    index: 0,
    name: "Imox",
    meaning: "Agua / Sueños",
    element: "Agua",
    icon: Waves,
    animalGuia: "Lagarto",
    puntoCardinal: "Este",
    colorMaiz: "Rojo",
    parteDelCuerpo: "Sangre",
    lugarDelPoder: "Lagos y ríos",
    elementoConexion: "Agua ceremonial",
    cualidades: ["Intuitivo", "Creativo", "Sensible", "Visionario", "Adaptable"],
    sombras: ["Inestabilidad emocional", "Tendencia al escapismo", "Dificultad para concretar", "Hipersensibilidad", "Confusión mental"],
    description: "Imox representa el lado izquierdo del cerebro, lo inusual, lo excéntrico. Es la energía de los sueños y el subconsciente. Las personas nacidas bajo este signo tienen una conexión profunda con el mundo espiritual y poseen una sensibilidad extraordinaria. Son creativos, intuitivos y tienen la capacidad de percibir lo que otros no pueden ver. El agua es su elemento, representando la fluidez emocional y la capacidad de adaptación."
  },
  {
    index: 1,
    name: "Iq'",
    meaning: "Viento / Comunicación",
    element: "Aire",
    icon: Wind,
    animalGuia: "Colibrí",
    puntoCardinal: "Norte",
    colorMaiz: "Blanco",
    parteDelCuerpo: "Respiración",
    lugarDelPoder: "Cimas de montañas",
    elementoConexion: "Viento sagrado",
    cualidades: ["Comunicativo", "Ágil", "Mensajero", "Versátil", "Espiritual"],
    sombras: ["Inconstancia", "Superficialidad", "Tendencia al chisme", "Dispersión mental", "Cambios de humor repentinos"],
    description: "Iq' es el soplo de vida, el viento sagrado que comunica los mensajes entre el cielo y la tierra. Representa la comunicación, la respiración y el espíritu. Las personas de este signo son mensajeros naturales, con una capacidad innata para transmitir ideas y conectar personas. Poseen una mente ágil y cambiante como el viento, con gran habilidad para adaptarse a diferentes situaciones."
  },
  {
    index: 2,
    name: "Aq'ab'al",
    meaning: "Amanecer / Dualidad",
    element: "Luz y Oscuridad",
    icon: Sunrise,
    animalGuia: "Murciélago",
    puntoCardinal: "Oeste",
    colorMaiz: "Negro",
    parteDelCuerpo: "Ojos",
    lugarDelPoder: "Cuevas sagradas",
    elementoConexion: "Luz del amanecer",
    cualidades: ["Renovador", "Equilibrado", "Sabio", "Guía", "Transformador"],
    sombras: ["Dualidad interna conflictiva", "Dificultad para tomar decisiones", "Tendencia a la ambigüedad", "Ocultamiento de verdades", "Vivir entre dos mundos sin definirse"],
    description: "Aq'ab'al simboliza el amanecer, el momento sagrado entre la noche y el día. Representa la dualidad, los nuevos comienzos y la renovación. Quienes nacen bajo este signo tienen el don de ver ambos lados de cada situación. Son personas de transición, capaces de traer luz a la oscuridad y comprensión donde hay confusión. Poseen una sabiduría especial para guiar a otros en momentos de cambio."
  },
  {
    index: 3,
    name: "K'at",
    meaning: "Red / Abundancia",
    element: "Fuego",
    icon: Grid3X3,
    animalGuia: "Araña",
    puntoCardinal: "Sur",
    colorMaiz: "Amarillo",
    parteDelCuerpo: "Manos",
    lugarDelPoder: "Selvas tropicales",
    elementoConexion: "Red de conexión cósmica",
    cualidades: ["Abundante", "Conectador", "Manifestador", "Generoso", "Próspero"],
    sombras: ["Apego material excesivo", "Tendencia a acumular", "Dificultad para soltar", "Enredarse en problemas ajenos", "Codicia o avaricia"],
    description: "K'at es la red que atrapa y guarda, representa la abundancia, la cosecha y la capacidad de manifestar. Es el signo de quienes saben guardar y multiplicar. Las personas K'at tienen un talento natural para atraer prosperidad y crear redes de apoyo. Sin embargo, deben cuidar de no caer en el apego material. Su lección es aprender a fluir con la abundancia, dando y recibiendo en equilibrio."
  },
  {
    index: 4,
    name: "Kan",
    meaning: "Serpiente / Energía Vital",
    element: "Fuego",
    icon: Zap,
    animalGuia: "Quétzal",
    puntoCardinal: "Este",
    colorMaiz: "Rojo",
    parteDelCuerpo: "Columna vertebral",
    lugarDelPoder: "Templos sagrados",
    elementoConexion: "Fuego kundalini",
    cualidades: ["Poderoso", "Transformador", "Líder", "Magnético", "Evolutivo"],
    sombras: ["Orgullo excesivo", "Manipulación", "Celos intensos", "Ira descontrolada", "Uso del poder para dominar"],
    description: "Kan es la serpiente emplumada, símbolo de la energía kundalini y la fuerza vital. Representa la evolución espiritual, la justicia y la verdad. Las personas nacidas bajo Kan poseen una energía magnética y una presencia poderosa. Son líderes naturales con una capacidad innata para inspirar a otros. La serpiente les enseña a mudar de piel, a transformarse y evolucionar constantemente hacia versiones más elevadas de sí mismos."
  },
  {
    index: 5,
    name: "Kame",
    meaning: "Transformación / Ancestros",
    element: "Tierra",
    icon: Skull,
    animalGuia: "Lechuza",
    puntoCardinal: "Norte",
    colorMaiz: "Blanco",
    parteDelCuerpo: "Huesos",
    lugarDelPoder: "Cementerios ancestrales",
    elementoConexion: "Portal ancestral",
    cualidades: ["Clarividente", "Ancestral", "Protector", "Sabio", "Transformador"],
    sombras: ["Miedo a la muerte o al cambio", "Pesimismo", "Quedarse atrapado en el pasado", "Pensamientos morbidos", "Dificultad para avanzar"],
    description: "Kame representa la muerte como transformación, no como final. Es el signo de los ancestros, la memoria y la conexión con quienes ya partieron. Las personas Kame tienen un vínculo especial con el mundo espiritual y frecuentemente reciben mensajes de sus antepasados. Poseen el don de la clarividencia y una comprensión profunda de los ciclos de la vida. Son guardianes de la tradición y la sabiduría ancestral."
  },
  {
    index: 6,
    name: "Kej",
    meaning: "Venado / Naturaleza",
    element: "Aire",
    icon: TreeDeciduous,
    animalGuia: "Venado",
    puntoCardinal: "Oeste",
    colorMaiz: "Negro",
    parteDelCuerpo: "Extremidades",
    lugarDelPoder: "Bosques sagrados",
    elementoConexion: "Naturaleza viva",
    cualidades: ["Protector", "Elegante", "Líder sereno", "Armonioso", "Fuerte"],
    sombras: ["Rigidez mental", "Terquedad", "Distanciamiento emocional", "Dificultad para pedir ayuda", "Aislamiento autoimpuesto"],
    description: "Kej es el venado sagrado, guardián de los bosques y símbolo de la armonía con la naturaleza. Representa los cuatro pilares del universo, la fuerza y la elegancia. Las personas nacidas bajo Kej son protectores naturales con una conexión profunda con los animales y la tierra. Poseen gracia, agilidad mental y física, y un sentido innato de orientación. Son líderes serenos que guían con el ejemplo."
  },
  {
    index: 7,
    name: "Q'anil",
    meaning: "Semilla / Vida",
    element: "Tierra",
    icon: Sprout,
    animalGuia: "Conejo",
    puntoCardinal: "Sur",
    colorMaiz: "Amarillo",
    parteDelCuerpo: "Órganos reproductivos",
    lugarDelPoder: "Campos de cultivo",
    elementoConexion: "Semilla sagrada",
    cualidades: ["Fértil", "Optimista", "Nutridor", "Renovador", "Esperanzador"],
    sombras: ["Exceso de optimismo irreal", "Impaciencia por ver resultados", "Dispersión de energía", "Iniciar sin terminar", "Ingenuidad que lleva a decepciones"],
    description: "Q'anil es la semilla, el potencial infinito de la vida. Representa la fertilidad, la abundancia y todo lo que está por germinar. Las personas Q'anil son sembradoras naturales, ya sea de ideas, proyectos o vida. Tienen el don de nutrir y hacer crecer todo lo que tocan. Son optimistas por naturaleza y poseen una fe inquebrantable en el futuro. Su energía es de renacimiento y nuevos comienzos."
  },
  {
    index: 8,
    name: "Toj",
    meaning: "Ofrenda / Fuego Sagrado",
    element: "Fuego",
    icon: Flame,
    animalGuia: "Fuego",
    puntoCardinal: "Este",
    colorMaiz: "Rojo",
    parteDelCuerpo: "Oídos",
    lugarDelPoder: "Altares ceremoniales",
    elementoConexion: "Fuego ceremonial",
    cualidades: ["Generoso", "Equilibrador", "Sanador", "Ceremonial", "Agradecido"],
    sombras: ["Culpa excesiva", "Sentirse en deuda constante", "Sacrificio excesivo por otros", "Complejo de mártir", "Dificultad para recibir"],
    description: "Toj representa la ofrenda, el pago sagrado y el equilibrio kármico. Es el fuego ceremonial que purifica y transforma. Las personas nacidas bajo Toj comprenden intuitivamente la ley del dar y recibir. Son generosas y tienen una conexión profunda con lo ceremonial y lo sagrado. Poseen el don de la sanación emocional y la capacidad de restaurar el equilibrio en situaciones de conflicto."
  },
  {
    index: 9,
    name: "Tz'i'",
    meaning: "Justicia / Ley",
    element: "Agua",
    icon: Scale,
    animalGuia: "Perro/Coyote",
    puntoCardinal: "Norte",
    colorMaiz: "Blanco",
    parteDelCuerpo: "Nariz",
    lugarDelPoder: "Tribunales de justicia",
    elementoConexion: "Ley cósmica",
    cualidades: ["Justo", "Leal", "Verdadero", "Fiel", "Defensor"],
    sombras: ["Ser demasiado crítico", "Juzgar duramente a otros", "Obsesión con la justicia", "Inflexibilidad moral", "Dificultad para perdonar"],
    description: "Tz'i' es el perro, guardián de la ley divina y la justicia. Representa la fidelidad, la lealtad y la verdad. Las personas nacidas bajo este signo tienen un sentido innato de lo correcto y lo incorrecto. Son defensores naturales de los desfavorecidos y buscan siempre el equilibrio y la justicia. Poseen una lealtad inquebrantable hacia quienes aman y una capacidad especial para discernir la verdad."
  },
  {
    index: 10,
    name: "B'atz'",
    meaning: "Hilo del Tiempo / Arte",
    element: "Aire",
    icon: Palette,
    animalGuia: "Mono",
    puntoCardinal: "Oeste",
    colorMaiz: "Negro",
    parteDelCuerpo: "Dedos",
    lugarDelPoder: "Talleres artísticos",
    elementoConexion: "Hilo del tiempo",
    cualidades: ["Artístico", "Creativo", "Tejedor", "Visionario", "Maestro"],
    sombras: ["Vanidad artística", "Perfeccionismo paralizante", "Manipulación sutil", "Enredarse en dramas", "Dificultad para simplificar"],
    description: "B'atz' es el mono artesano, tejedor del tiempo y creador de la vida. Representa el arte, la creatividad y el hilo que conecta todo en el universo. Es el primer día del calendario sagrado Cholq'ij. Las personas B'atz' son artistas naturales con una capacidad extraordinaria para crear belleza en todas sus formas. Poseen el don de ver los patrones ocultos de la vida y tejer destinos con sus manos creativas."
  },
  {
    index: 11,
    name: "E",
    meaning: "Camino / Destino",
    element: "Tierra",
    icon: Route,
    animalGuia: "Gato Montés",
    puntoCardinal: "Sur",
    colorMaiz: "Amarillo",
    parteDelCuerpo: "Pies",
    lugarDelPoder: "Caminos sagrados",
    elementoConexion: "Sendero sagrado",
    cualidades: ["Explorador", "Guía", "Buscador", "Curioso", "Orientador"],
    sombras: ["Inquietud constante", "Incapacidad para echar raíces", "Huir de compromisos", "Perderse en búsquedas sin fin", "Inestabilidad de vida"],
    description: "E es el camino sagrado, la ruta del destino y la guía divina. Representa los viajes, tanto físicos como espirituales, y la búsqueda del propósito. Las personas nacidas bajo E son viajeros eternos, exploradores de mundos internos y externos. Tienen el don de encontrar su camino incluso en la oscuridad y de guiar a otros hacia su destino. Son buscadores de verdad con una curiosidad insaciable."
  },
  {
    index: 12,
    name: "Aj",
    meaning: "Caña / Hogar",
    element: "Fuego",
    icon: Home,
    animalGuia: "Armadillo",
    puntoCardinal: "Este",
    colorMaiz: "Rojo",
    parteDelCuerpo: "Espalda",
    lugarDelPoder: "Hogares ancestrales",
    elementoConexion: "Pilar central",
    cualidades: ["Protector familiar", "Tradicional", "Fuerte", "Responsable", "Arraigado"],
    sombras: ["Rigidez en tradiciones", "Autoritarismo familiar", "Resistencia al cambio", "Cargar responsabilidades ajenas", "Control excesivo del hogar"],
    description: "Aj representa la caña de maíz, el pilar central del hogar y la familia. Es el signo de la autoridad, la tradición y la columna vertebral de la comunidad. Las personas Aj son pilares de fortaleza para quienes los rodean. Tienen un profundo sentido de responsabilidad familiar y una conexión especial con sus raíces. Son constructores de hogares, tanto físicos como emocionales, y guardianes de las tradiciones."
  },
  {
    index: 13,
    name: "I'x",
    meaning: "Jaguar / Magia Femenina",
    element: "Tierra",
    icon: Cat,
    animalGuia: "Jaguar",
    puntoCardinal: "Norte",
    colorMaiz: "Blanco",
    parteDelCuerpo: "Músculos",
    lugarDelPoder: "Selvas nocturnas",
    elementoConexion: "Magia lunar",
    cualidades: ["Misterioso", "Intuitivo", "Poderoso", "Mágico", "Protector"],
    sombras: ["Secretismo excesivo", "Manipulación oculta", "Uso incorrecto del poder", "Desconfianza crónica", "Tendencia a la venganza silenciosa"],
    description: "I'x es el jaguar, guardián de la noche y símbolo del poder femenino. Representa la magia, la intuición y la fuerza interior. Las personas nacidas bajo I'x poseen una energía misteriosa y magnética. Son intuitivos naturales con acceso a conocimientos ocultos. El jaguar les otorga la capacidad de moverse entre mundos y de ver en la oscuridad lo que otros no pueden percibir. Son protectores de lo sagrado."
  },
  {
    index: 14,
    name: "Tz'ikin",
    meaning: "Águila / Visión",
    element: "Aire",
    icon: Bird,
    animalGuia: "Águila/Quetzal",
    puntoCardinal: "Oeste",
    colorMaiz: "Negro",
    parteDelCuerpo: "Ojos",
    lugarDelPoder: "Cimas y cielos",
    elementoConexion: "Visión cósmica",
    cualidades: ["Visionario", "Libre", "Próspero", "Elevado", "Mensajero divino"],
    sombras: ["Materialismo excesivo", "Orgullo por logros", "Sueños poco realistas", "Desconexión de lo terrenal", "Soberbia espiritual"],
    description: "Tz'ikin es el águila y el quetzal, mensajeros entre el cielo y la tierra. Representa la visión, la libertad y la conexión con el Gran Espíritu. Las personas Tz'ikin tienen una perspectiva elevada de la vida y la capacidad de ver el panorama completo. Son visionarios naturales con el don de la prosperidad y la abundancia. El águila les otorga la libertad de espíritu y la capacidad de elevarse sobre los problemas."
  },
  {
    index: 15,
    name: "Ajmaq",
    meaning: "Perdón / Sabiduría",
    element: "Tierra",
    icon: Eye,
    animalGuia: "Abeja",
    puntoCardinal: "Sur",
    colorMaiz: "Amarillo",
    parteDelCuerpo: "Memoria",
    lugarDelPoder: "Cuevas ancestrales",
    elementoConexion: "Perdón divino",
    cualidades: ["Sabio", "Perdonador", "Ancestral", "Introspectivo", "Sanador"],
    sombras: ["Culpa crónica", "Secretos que pesan", "Evitar responsabilidades", "Vivir en el pasado", "Dificultad para perdonarse"],
    description: "Ajmaq representa el perdón, la sabiduría de los ancestros y la conexión con los que ya partieron. Es el signo de la introspección y la búsqueda de respuestas profundas. Las personas Ajmaq tienen acceso a la sabiduría antigua y una comprensión profunda de los misterios de la vida y la muerte. Poseen el don del perdón y la capacidad de sanar heridas del pasado, tanto propias como ajenas."
  },
  {
    index: 16,
    name: "No'j",
    meaning: "Conocimiento / Ciencia",
    element: "Aire",
    icon: Brain,
    animalGuia: "Pájaro Carpintero",
    puntoCardinal: "Este",
    colorMaiz: "Rojo",
    parteDelCuerpo: "Cerebro",
    lugarDelPoder: "Bibliotecas y templos de conocimiento",
    elementoConexion: "Conocimiento ancestral",
    cualidades: ["Inteligente", "Analítico", "Curioso", "Innovador", "Maestro"],
    sombras: ["Sobre-análisis paralizante", "Orgullo intelectual", "Desconexión emocional", "Frialdad en relaciones", "Menospreciar la intuición"],
    description: "No'j representa el conocimiento, la sabiduría y el movimiento del pensamiento. Es el signo de la inteligencia y la capacidad de comprensión profunda. Las personas No'j son pensadores naturales con una mente analítica y curiosa. Tienen el don de comprender conceptos complejos y de encontrar soluciones innovadoras. Son buscadores de conocimiento con una sed insaciable de aprender y enseñar."
  },
  {
    index: 17,
    name: "Tijax",
    meaning: "Obsidiana / Sanación",
    element: "Fuego",
    icon: Swords,
    animalGuia: "Cuchillo de Obsidiana",
    puntoCardinal: "Norte",
    colorMaiz: "Blanco",
    parteDelCuerpo: "Lengua",
    lugarDelPoder: "Lugares de sanación",
    elementoConexion: "Obsidiana sagrada",
    cualidades: ["Sanador", "Guerrero", "Directo", "Cortante", "Purificador"],
    sombras: ["Palabras hirientes", "Agresividad verbal", "Cortar relaciones bruscamente", "Crueldad involuntaria", "Dificultad para ser sutil"],
    description: "Tijax es la obsidiana, el cuchillo de doble filo que corta y sana. Representa la medicina, la cirugía espiritual y la capacidad de eliminar lo que no sirve. Las personas Tijax son sanadores naturales con el poder de cortar energías negativas y restaurar la salud. Poseen una mente aguda y la capacidad de ir directo al corazón de los problemas. Son guerreros espirituales que luchan por el bienestar de todos."
  },
  {
    index: 18,
    name: "Kawoq",
    meaning: "Tormenta / Comunidad",
    element: "Agua",
    icon: Cloud,
    animalGuia: "Tortuga",
    puntoCardinal: "Oeste",
    colorMaiz: "Negro",
    parteDelCuerpo: "Corazón",
    lugarDelPoder: "Centros comunitarios",
    elementoConexion: "Tormenta purificadora",
    cualidades: ["Comunitario", "Nurtridor", "Protector", "Transformador", "Unificador"],
    sombras: ["Involucrarse demasiado en vidas ajenas", "Chisme comunitario", "Dependencia del grupo", "Perder identidad propia", "Conflictos familiares recurrentes"],
    description: "Kawoq es la tormenta, la fuerza transformadora que limpia y renueva. Representa la comunidad, la familia extendida y el poder del grupo. Las personas Kawoq son líderes comunitarios con una capacidad innata para unir a las personas. Tienen el don de la fertilidad en todos los sentidos y la capacidad de nutrir a grandes grupos. Son protectores del bienestar colectivo y catalizadores de cambio social."
  },
  {
    index: 19,
    name: "Ajpu",
    meaning: "Sol / Cazador",
    element: "Fuego",
    icon: Sun,
    animalGuia: "Guardián del Sol",
    puntoCardinal: "Sur",
    colorMaiz: "Amarillo",
    parteDelCuerpo: "Pecho",
    lugarDelPoder: "Pirámides solares",
    elementoConexion: "Luz solar",
    cualidades: ["Guerrero de luz", "Carismático", "Victorioso", "Inspirador", "Certero"],
    sombras: ["Ego inflado", "Necesidad de reconocimiento", "Arrogancia", "Dificultad para aceptar derrotas", "Quemar a otros con su intensidad"],
    description: "Ajpu es el sol, el cazador divino y héroe gemelo del Popol Vuh. Representa la luz, la claridad y la victoria sobre la oscuridad. Las personas Ajpu son guerreros de luz con una misión clara de servicio. Poseen carisma natural y la capacidad de inspirar a otros hacia sus propósitos más elevados. El sol les otorga vitalidad, certeza y la fuerza para superar cualquier adversidad con gracia y determinación."
  }
];

export const tones: Tone[] = [
  { number: 1, name: "Jun", meaning: "Inicio", cualidades: ["Pionero", "Iniciador", "Valiente", "Original"], description: "La unidad, el principio de todo. Representa nuevos comienzos y el potencial ilimitado." },
  { number: 2, name: "Keb'", meaning: "Dualidad", cualidades: ["Cooperador", "Diplomático", "Equilibrado", "Sensible"], description: "La polaridad, el complemento. Representa las relaciones, la cooperación y el equilibrio entre opuestos." },
  { number: 3, name: "Oxib'", meaning: "Acción", cualidades: ["Comunicativo", "Expresivo", "Activo", "Creativo"], description: "El movimiento, la creatividad. Representa la comunicación, la expresión y la acción decidida." },
  { number: 4, name: "Kajib'", meaning: "Estabilidad", cualidades: ["Estructurado", "Estable", "Organizado", "Firme"], description: "Los cuatro puntos cardinales. Representa la estabilidad, la estructura y los cimientos sólidos." },
  { number: 5, name: "Job'", meaning: "Empoderamiento", cualidades: ["Empoderado", "Central", "Fuerte", "Determinado"], description: "El centro, el poder personal. Representa el empoderamiento, la acción y la fuerza interior." },
  { number: 6, name: "Waqib'", meaning: "Flujo", cualidades: ["Armonioso", "Responsable", "Familiar", "Fluido"], description: "La responsabilidad, el equilibrio. Representa el flujo natural, las relaciones familiares y la armonía." },
  { number: 7, name: "Wuqub'", meaning: "Reflexión", cualidades: ["Místico", "Reflexivo", "Espiritual", "Perfeccionista"], description: "El misticismo, la perfección. Representa la reflexión profunda, la espiritualidad y la conexión divina." },
  { number: 8, name: "Wajxaqib'", meaning: "Justicia", cualidades: ["Justo", "Organizador", "Armónico", "Kármico"], description: "La armonía, la organización. Representa la justicia, el karma y el equilibrio cósmico." },
  { number: 9, name: "B'elejeb'", meaning: "Paciencia", cualidades: ["Paciente", "Persistente", "Pleno", "Completador"], description: "La plenitud, la vida. Representa la paciencia, la persistencia y la culminación de ciclos." },
  { number: 10, name: "Lajuj", meaning: "Manifestación", cualidades: ["Manifestador", "Colaborador", "Materializador", "Equipo"], description: "La manifestación, la cooperación. Representa la materialización de deseos y el trabajo en equipo." },
  { number: 11, name: "Junlajuj", meaning: "Liberación", cualidades: ["Liberador", "Resolutivo", "Libre", "Desapegado"], description: "La resolución, la liberación. Representa la disolución de obstáculos y la libertad espiritual." },
  { number: 12, name: "Kab'lajuj", meaning: "Entendimiento", cualidades: ["Comprensivo", "Maduro", "Sabio", "Estable"], description: "La comprensión, la estabilidad. Representa el entendimiento profundo y la sabiduría madura." },
  { number: 13, name: "Oxlajuj", meaning: "Ascensión", cualidades: ["Trascendente", "Cósmico", "Elevado", "Transformador"], description: "La transformación suprema. Representa la ascensión espiritual, la conexión cósmica y la trascendencia." }
];

// Corrected anchor date: January 1, 2000 = 11 Iq'
// Verified: February 10, 1976 = 8 Ajmaq
const ANCHOR_DATE = new Date(2000, 0, 1);
const ANCHOR_NAHUAL_INDEX = 1; // Iq'
const ANCHOR_TONE = 11;

export interface MayanKin {
  nahual: Nahual;
  tone: Tone;
  kinNumber: number;
}

// Interfaz para la Cruz Maya con 9 Nahuales
export interface CrossPosition {
  kin: MayanKin;
  position: string;
  meaning: string;
}

export interface MayanCross {
  // Centro: Nacimiento
  nacimiento: {
    centro: CrossPosition;
    izquierdo: CrossPosition;
    derecho: CrossPosition;
  };
  // Arriba: Concepción/Engendramiento
  concepcion: {
    centro: CrossPosition;
    izquierdo: CrossPosition;
    derecho: CrossPosition;
  };
  // Abajo: Destino/Misión
  destino: {
    centro: CrossPosition;
    izquierdo: CrossPosition;
    derecho: CrossPosition;
  };
}

export function calculateMayanKin(birthDate: Date): MayanKin {
  // Normalize both dates to midnight UTC to avoid timezone issues
  const normalizedBirth = Date.UTC(birthDate.getFullYear(), birthDate.getMonth(), birthDate.getDate());
  const normalizedAnchor = Date.UTC(2000, 0, 1);
  
  // Calculate days elapsed since anchor date
  const daysElapsed = Math.floor((normalizedBirth - normalizedAnchor) / (1000 * 60 * 60 * 24));

  // Calculate Nahual index (20-day cycle)
  let nahualIndex = (ANCHOR_NAHUAL_INDEX + daysElapsed) % 20;
  if (nahualIndex < 0) nahualIndex += 20;

  // Calculate Tone (13-day cycle)
  let toneValue = ((ANCHOR_TONE - 1 + daysElapsed) % 13);
  if (toneValue < 0) toneValue += 13;
  toneValue += 1; // Tones are 1-13, not 0-12

  const nahual = nahuales[nahualIndex];
  const tone = tones[toneValue - 1];

  // Calculate Kin number (1-260)
  const kinNumber = ((toneValue - 1) * 20 + nahualIndex) % 260 + 1;

  return { nahual, tone, kinNumber };
}

// Función auxiliar para calcular un Kin a partir de días desde la fecha base
function calculateKinFromDate(date: Date): MayanKin {
  const normalizedDate = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const normalizedAnchor = Date.UTC(2000, 0, 1);
  const daysElapsed = Math.floor((normalizedDate - normalizedAnchor) / (1000 * 60 * 60 * 24));

  let nahualIndex = (ANCHOR_NAHUAL_INDEX + daysElapsed) % 20;
  if (nahualIndex < 0) nahualIndex += 20;

  let toneValue = ((ANCHOR_TONE - 1 + daysElapsed) % 13);
  if (toneValue < 0) toneValue += 13;
  toneValue += 1;

  const nahual = nahuales[nahualIndex];
  const tone = tones[toneValue - 1];
  const kinNumber = ((toneValue - 1) * 20 + nahualIndex) % 260 + 1;

  return { nahual, tone, kinNumber };
}

// Función para calcular el tono de los brazos según la tabla tradicional
// Tabla: Centro | Izquierda (Centro-6) | Derecha (Centro+6)
// 1 -> 8, 7 | 2 -> 9, 8 | ... | 7 -> 1, 13 | 10 -> 4, 3 | 13 -> 7, 6
function calculateArmTone(centerTone: number, isLeft: boolean): number {
  if (isLeft) {
    // Brazo Izquierdo: Centro - 6 (mod 13)
    let newTone = centerTone - 6;
    if (newTone <= 0) newTone += 13;
    return newTone;
  } else {
    // Brazo Derecho: Centro + 6 (mod 13)
    let newTone = centerTone + 6;
    if (newTone > 13) newTone -= 13;
    return newTone;
  }
}

// Función auxiliar para obtener el Nahual anterior/siguiente con tono calculado
function getAdjacentNahual(baseKin: MayanKin, nahualOffset: number, isLeftArm: boolean): MayanKin {
  // Calcular nuevo nahual (ciclo de 20)
  let newNahualIndex = (baseKin.nahual.index + nahualOffset) % 20;
  if (newNahualIndex < 0) newNahualIndex += 20;
  
  const nahual = nahuales[newNahualIndex];
  
  // Calcular nuevo tono usando la tabla tradicional
  const newToneNumber = calculateArmTone(baseKin.tone.number, isLeftArm);
  const tone = tones[newToneNumber - 1];
  
  const kinNumber = ((newToneNumber - 1) * 20 + newNahualIndex) % 260 + 1;

  return { nahual, tone, kinNumber };
}

// Calcular la Cruz Maya completa con 9 Nahuales
export function calculateMayanCross(birthDate: Date): MayanCross {
  // Nahual de Nacimiento (centro de la cruz)
  const nacimientoKin = calculateMayanKin(birthDate);
  
  // Nahual de Concepción: 260 días antes del nacimiento
  const concepcionDate = new Date(birthDate);
  concepcionDate.setDate(concepcionDate.getDate() - 260);
  const concepcionKin = calculateKinFromDate(concepcionDate);
  
  // Nahual de Destino: 52 días después del nacimiento
  const destinoDate = new Date(birthDate);
  destinoDate.setDate(destinoDate.getDate() + 52);
  const destinoKin = calculateKinFromDate(destinoDate);

  return {
    nacimiento: {
      centro: {
        kin: nacimientoKin,
        position: "Centro - Nacimiento",
        meaning: "Tu Nahual principal. Define quién eres, tu esencia y personalidad. Es tu identidad energética en esta vida."
      },
      izquierdo: {
        kin: getAdjacentNahual(nacimientoKin, -1, true),
        position: "Brazo Izquierdo - Femenino",
        meaning: "Tu energía femenina/receptiva. Representa tu vida espiritual, intuición, mundo interior y conexión con lo sutil."
      },
      derecho: {
        kin: getAdjacentNahual(nacimientoKin, 1, false),
        position: "Brazo Derecho - Masculino",
        meaning: "Tu energía masculina/activa. Representa tu vida material, acción en el mundo, capacidad de manifestar y proyección externa."
      }
    },
    concepcion: {
      centro: {
        kin: concepcionKin,
        position: "Centro - Concepción",
        meaning: "El Nahual de tu fecundación. La energía con la que fuiste concebido(a), tu esencia primordial heredada de tus ancestros."
      },
      izquierdo: {
        kin: getAdjacentNahual(concepcionKin, -1, true),
        position: "Concepción Izquierdo",
        meaning: "Tu guía espiritual desde antes de nacer. La sabiduría ancestral que te acompaña desde la concepción."
      },
      derecho: {
        kin: getAdjacentNahual(concepcionKin, 1, false),
        position: "Concepción Derecho",
        meaning: "Tu potencial material heredado. Los dones y recursos que traes de tus ancestros para manifestar en el mundo."
      }
    },
    destino: {
      centro: {
        kin: destinoKin,
        position: "Centro - Destino",
        meaning: "Tu Nahual de Destino. Hacia dónde debes evolucionar, tu misión de vida y propósito superior en esta encarnación."
      },
      izquierdo: {
        kin: getAdjacentNahual(destinoKin, -1, true),
        position: "Destino Izquierdo",
        meaning: "Tu misión espiritual. El trabajo interno que vienes a realizar y el legado espiritual que dejarás."
      },
      derecho: {
        kin: getAdjacentNahual(destinoKin, 1, false),
        position: "Destino Derecho",
        meaning: "Tu misión en el mundo material. La contribución concreta que harás a tu comunidad y al planeta."
      }
    }
  };
}
