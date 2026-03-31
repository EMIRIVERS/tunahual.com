/**
 * Base de Conocimiento Maya - Curanderas del Nuevo Tiempo
 * 
 * Esta base de datos integra la sabiduría ancestral maya de múltiples fuentes:
 * - Cosmovision Maya (Kajkan Felipe Mejia Sepet)
 * - El Libro del Destino / Ch'umilal Wuj (Carlos Barrios)
 * - Invocando a los Guardianes
 * - Programa Curanderas del Nuevo Tiempo (Azul Anaité)
 */

// =============================================================================
// GUARDIANES Y DEIDADES MAYAS
// =============================================================================

export interface Guardian {
  nombre: string;
  nombreMaya: string;
  significado: string;
  invocacion?: string;
}

export const guardianes: Guardian[] = [
  {
    nombre: "Corazón del Cielo - Corazón de la Tierra",
    nombreMaya: "Ruk'u'x Kaj - Ruk'u'x Ulew",
    significado: "La unidad suprema en la creación, el principio dual que sostiene todo lo existente."
  },
  {
    nombre: "Creador y Formador",
    nombreMaya: "Tz'aqol - B'itol",
    significado: "Las fuerzas creadoras primordiales. Tz'aqol es la voluntad divina que despierta la acción. B'itol es la fuerza formativa."
  },
  {
    nombre: "Serpiente Emplumada",
    nombreMaya: "Tepew - Q'ukumatz",
    significado: "La sabiduría y el poder transformador, símbolo de la conexión entre cielo y tierra."
  },
  {
    nombre: "Los Tres Rayos",
    nombreMaya: "Juraqan, Ch'ipi Kaqulja, Raxa Kaqulja",
    significado: "Las tres manifestaciones del rayo: Huracán (el rayo de una pierna), Rayo Pequeño y Rayo Verde/Repentino."
  },
  {
    nombre: "Madre y Padre de la Vida",
    nombreMaya: "Alom - K'ajolom",
    significado: "El germen de la palabra-acción del Gran Padre. La vitalidad que engendra toda vida."
  },
  {
    nombre: "Los Abuelos Primordiales",
    nombreMaya: "Ixpiyakok - Ixmukane'",
    significado: "La pareja de ancianos sabios, guardianes de la tradición y el tiempo."
  },
  {
    nombre: "El Señor y la Señora",
    nombreMaya: "Itzamná - Ixchel",
    significado: "El abuelo sol y la abuela luna, fuerzas complementarias del cosmos."
  },
  {
    nombre: "Los Mensajeros",
    nombreMaya: "Wak'(Wok) - Halcón Mensajero",
    significado: "Los mensajeros entre el cielo y la tierra."
  },
  {
    nombre: "Los Cazadores Gemelos",
    nombreMaya: "Junajpu'Wuch - Junajpu'Utiw",
    significado: "El cazador y el coyote, símbolos del guerrero espiritual."
  },
  {
    nombre: "El Sol Guerrero",
    nombreMaya: "Junajpu'",
    significado: "Sol, guerrero, cervatanero, cazador. Héroe del Popol Vuh."
  },
  {
    nombre: "Los Dadores de Vida",
    nombreMaya: "Iyom - Mamon",
    significado: "Energía dadora de los nietos y de las nietas."
  },
  {
    nombre: "Corazón de las Aguas",
    nombreMaya: "Ruk'u'x Choy - Ruk'u'x Palow",
    significado: "Corazón de los lagos, corazón de los mares."
  },
  {
    nombre: "Corazón de los Elementos",
    nombreMaya: "Ruk'u'x Kaq'iq - Ruk'u'x Q'aq'",
    significado: "Corazón del aire - corazón del fuego."
  },
  {
    nombre: "Corazón de la Tierra y el Agua",
    nombreMaya: "Ruk'u'x Ya' - Ruk'u'x Rowach'ulew",
    significado: "Corazón del agua - corazón de la superficie de la tierra."
  },
  {
    nombre: "Guardianes de la Naturaleza",
    nombreMaya: "Rajawal Juyu' - Rajawal Taq'aj",
    significado: "Guardianes de los cerros - guardianes de las planicies."
  },
  {
    nombre: "La Paga Sagrada",
    nombreMaya: "Tojil",
    significado: "La paga y la multa, el vínculo con el sagrado fuego. Retribución kármica."
  },
  {
    nombre: "La Abuela Nutricia",
    nombreMaya: "Awilix",
    significado: "La Abuela que nutre a sus nietos. El Abuelo que contribuye al sustento."
  },
  {
    nombre: "Los Cuatro Elementos",
    nombreMaya: "Jacawitz",
    significado: "Energía de los cuatro elementos que comparten los cerros y montañas."
  },
  {
    nombre: "La Doble Mirada",
    nombreMaya: "Kab'awil",
    significado: "Guardián de la doble mirada, el que ve los extremos al mismo tiempo."
  },
  {
    nombre: "Los Cuatro Rincones",
    nombreMaya: "Rukajtz'ux Ulew",
    significado: "Los cuatro rincones de la Tierra, los cuatro puntos cardinales."
  }
];

// =============================================================================
// COSMOVISION MAYA - CONCEPTOS FUNDAMENTALES
// =============================================================================

export interface ConceptoMaya {
  nombre: string;
  nombreMaya?: string;
  descripcion: string;
  ensenanza: string;
}

export const conceptosFundamentales: ConceptoMaya[] = [
  {
    nombre: "Dualidad Universal",
    descripcion: "En la cosmovisión maya no existe un principio supremo único, sino la complementariedad de opuestos: luz-oscuridad, día-noche, vida-muerte, Sol-Luna.",
    ensenanza: "Hay Luz en la oscuridad, pero también existe oscuridad dentro de la luz. La semilla necesariamente tiene que morir para que surja una nueva vida."
  },
  {
    nombre: "Interconexión con la Naturaleza",
    descripcion: "El ser humano no está por encima de la naturaleza, sino que es parte de ella. No existen barreras entre los seres humanos, la naturaleza y el universo.",
    ensenanza: "Cada elemento de la naturaleza tiene Ruk'ux (corazón, núcleo, vida, abundancia, soplo divino) y Rajawal (su guardián)."
  },
  {
    nombre: "El Tiempo como Energía",
    nombreMaya: "Najt (Espacio-Tiempo)",
    descripcion: "El tiempo no es solo medición de ciclos, sino una manifestación del cosmos que determina la vida en la concepción, gestación, nacimiento y desarrollo.",
    ensenanza: "Cada día tiene su energía específica que influye en todos los seres. El Cholq'ij nos conecta con este flujo."
  },
  {
    nombre: "El Ciclo de 260 Días",
    nombreMaya: "Cholq'ij",
    descripcion: "El calendario sagrado de 260 días corresponde tanto al ciclo completo de gestación humana como al ciclo agrícola fundamental del maíz.",
    ensenanza: "Lo que caminas durante 260 días se vuelve realidad en tu vida, porque no es información: es reprogramación, ritmo, repetición y encarnación."
  },
  {
    nombre: "Los Cuatro Primeros Hombres",
    nombreMaya: "B'alameb'",
    descripcion: "Los cuatro primeros hombres de maíz: B'alam K'itze' (Jaguar de la sonrisa), B'alam Aq'ab' (Jaguar madrugador), Majukutaj (El que no pide nada), Iq' B'alam (Jaguar del viento).",
    ensenanza: "Vinieron de las Pléyades como grandes sabios, visionarios y magos. Su tradición es nuestra tradición, su legado es nuestra norma de vida."
  },
  {
    nombre: "La Práctica Colectiva",
    nombreMaya: "Nimchomnik / Ch'ob'onïk",
    descripcion: "El bienestar personal nunca se ve como un fin en sí mismo. La prioridad es el bienestar de la comunidad.",
    ensenanza: "El éxito de la unidad colectiva radica en la organización comunitaria basada en el servicio comunal (K'axk'ol)."
  },
  {
    nombre: "El Maíz Sagrado",
    nombreMaya: "Ixim",
    descripcion: "El maíz representa los cuatro colores de la piel de la humanidad y los cuatro puntos cardinales. Es la planta de la que fuimos creados.",
    ensenanza: "De masa de maíz fueron creados los hombres verdaderos, los que poblamos la faz de la Madre Tierra."
  }
];

// =============================================================================
// INFORMACIÓN EXPANDIDA DE LOS 20 NAHUALES
// =============================================================================

export interface NahualConocimientoExpandido {
  nombre: string;
  nombreCompleto: string;
  significadoProfundo: string;
  ceremoniasYRituales: string;
  fecundadoEn: string;
  mensajeEspiritual: string;
  polaridadPositiva: string[];
  polaridadNegativa: string[];
  trabajoEspiritual: string;
  relacionConNaturaleza: string;
}

export const nahualConocimientoExpandido: Record<string, NahualConocimientoExpandido> = {
  "Imox": {
    nombre: "Imox",
    nombreCompleto: "Imox - El Mar, Intranquilidad, Locura",
    significadoProfundo: "Significa la doble personalidad, una sensibilidad profunda en los temas de la conducta humana. Es el día donde las fuerzas naturales se tornaron peligrosas. Día que propone orden como equilibrio del desorden.",
    ceremoniasYRituales: "Las ceremonias sirven para ayudar a las personas con estos males; para lograr curaciones y rezar ante la Madre Tierra.",
    fecundadoEn: "Aj",
    mensajeEspiritual: "No hay que olvidar que hielo, nubes, lagos, lagunas, mares, peces, cangrejos y todos los seres que viven en el agua, son fuerzas que muchas veces olvidamos. El agua es generador de calma pero también de gran destrucción.",
    polaridadPositiva: ["Sensibilidad profunda", "Conexión con el subconsciente", "Capacidad visionaria", "Intuición desarrollada"],
    polaridadNegativa: ["Influencia negativa por su día", "Debilidad", "Agresividad", "Problemas mentales si no se trabaja"],
    trabajoEspiritual: "Debe ser consultado con el Ajq'ij para buscar equilibrio. Los hombres que fueron creados y no fueron agradecidos, fueron destruidos con un gran diluvio.",
    relacionConNaturaleza: "Conectado con todo lo acuático: lagos, lagunas, mares, la lluvia, las nubes."
  },
  "Iq'": {
    nombre: "Iq'",
    nombreCompleto: "Iq' - Mundo, Naturaleza, Altares, Aire",
    significadoProfundo: "Es el día del Corazón del Cielo, Corazón de la Tierra, día de los altares. Representa el soplo de vida que comunica los mensajes entre el cielo y la tierra.",
    ceremoniasYRituales: "Las ceremonias se hacen para agradecer todo lo que existe ante la naturaleza y agradecer toda la obra del Creador y Formador y para que el viento se lleve los sufrimientos y todos los males.",
    fecundadoEn: "I'x",
    mensajeEspiritual: "Al igual que el agua; el viento y otros seres que no percibimos con nuestros cinco sentidos, están en todos los espacios de la tierra y en otros planos. Si creemos que nadie está observando nuestras actitudes, nos estamos engañando a nosotros mismos porque todo está conectado.",
    polaridadPositiva: ["Venerador del mundo", "Caminará largo tiempo sobre la Tierra", "Mensajero ante el Creador", "Conexión espiritual"],
    polaridadNegativa: ["Le perseguirán los males si desconoce su día", "Inconstancia", "Dispersión"],
    trabajoEspiritual: "Debe consultar con el sabio para no ser perseguido por los males.",
    relacionConNaturaleza: "Es el mensajero, el viento sagrado que conecta todos los espacios de la tierra."
  },
  "Aq'ab'al": {
    nombre: "Aq'ab'al",
    nombreCompleto: "Aq'ab'al - Aurora, Oscuridad, Llanto",
    significadoProfundo: "Es el símbolo de la mano, la aurora, la madrugada formada por los primeros rayos del sol que se asoman sobre las montañas ahuyentando las tinieblas y la oscuridad. Indica la señal del amanecer, de una nueva era, de una nueva vida perdurable.",
    ceremoniasYRituales: "Las ceremonias sirven para agradecimiento de ese amanecer y para que no invada la calumnia, el llanto y la mentira.",
    fecundadoEn: "Tz'ikin",
    mensajeEspiritual: "Los sueños y el descanso son parte importante de la vida. Es la otra parte de la vida. La noche y la madrugada; la oscuridad genera tranquilidad. En ella surgen nuestros viajes a otros planos de nuestra existencia.",
    polaridadPositiva: ["Proceden del amanecer alegre", "Capacidad de renovación", "Conexión con los sueños", "Sabiduría de la dualidad"],
    polaridadNegativa: ["Día de llanto, sufrimiento", "Dado a la calumnia, la mentira, las difamaciones si no se consulta el Ajq'ij"],
    trabajoEspiritual: "Hay mucha energía reunida en la noche; la mitad del mundo queda desconectado en una oscuridad que tiene vida y en donde se sigue adquiriendo conocimiento.",
    relacionConNaturaleza: "Conectado con el momento sagrado entre la noche y el día, las cuevas sagradas."
  },
  "K'at": {
    nombre: "K'at",
    nombreCompleto: "K'at - Fuego, Red, Opresión",
    significadoProfundo: "Simboliza la red, la red donde se guardan las mazorcas, la red con que se pesca, la red donde mueren los peces. Significa energía, fuerza, el calor de los corazones. Es el día para pagar a los antepasados.",
    ceremoniasYRituales: "El fuego forma parte de la ceremonia, elemento que une a las personas como la red y ayuda para liberarse de los males entre la gente.",
    fecundadoEn: "Ajmaq",
    mensajeEspiritual: "Hay un momento y espacio para todo y lo hay también para la parte cuando no hay salida hacia ningún lado. Las redes y el encierro invisible nos generan angustia. Es un honor tener libertad y fuego interno que nos hace brillar.",
    polaridadPositiva: ["Personas de fuego en sus manos y corazones", "Capacidad de manifestar abundancia", "Conexión con la red cósmica"],
    polaridadNegativa: ["Perdedores de su libertad si no se fijan en su día", "Sin logro de producciones", "Tendencia al apego"],
    trabajoEspiritual: "Hay que trabajar para ganarse el bienestar de la libertad y el fuego interno.",
    relacionConNaturaleza: "Conectado con las selvas tropicales, la red de conexión cósmica que une todo."
  },
  "Kan": {
    nombre: "Kan",
    nombreCompleto: "Kan - La Serpiente, La Madre Tierra, Respeto",
    significadoProfundo: "Significa serpiente emplumada y justicia. Cuando apareció en el horizonte la claridad, el calor del Kan, Q'uq'kumatz, que al erigirse tuvo comunicación la tierra con el cielo e indicó la existencia de Corazón del Cielo, Corazón de la Tierra.",
    ceremoniasYRituales: "Las ceremonias son para pedir justicia, sabiduría, fuerza, igualdad y que no haya desequilibrio sobre la Madre Naturaleza.",
    fecundadoEn: "No'j",
    mensajeEspiritual: "Todo lo que adquirimos y somos como seres humanos se lo debemos a Nuestra Madre Tierra y es a través del respeto a todas las formas de vida que sostiene es que podemos reflejar el respeto y el agradecimiento que le tenemos.",
    polaridadPositiva: ["Llamados para ser autoridades", "Buenos aplicadores de justicia", "Capacidad de curaciones", "Pueden llegar a ser Ajq'ij"],
    polaridadNegativa: ["Por lo regular son enojados", "Tendencia al orgullo", "Manipulación si no están alineados"],
    trabajoEspiritual: "Si se forman con el Ajq'ij, desarrollan su potencial de liderazgo y justicia.",
    relacionConNaturaleza: "Conectado con los templos sagrados, el fuego kundalini, la columna vertebral de la tierra."
  },
  "Kame": {
    nombre: "Kame",
    nombreCompleto: "Kame - Día de los Difuntos, Alegría, Serenidad, Muerte",
    significadoProfundo: "Es el símbolo de la muerte como transformación. Es el guardián de todas las personas que mueren repentinamente. Habiendo conocido la justicia del Kan sobre la tierra, los abuelos con serenidad y alegría dijeron: 'Vamos ya al descanso, al Kame.'",
    ceremoniasYRituales: "Las ceremonias son para pedir por el descanso de los difuntos y para que sean ellos nuestros guías y nos acompañen siempre por buenos caminos, caminos planos.",
    fecundadoEn: "Tijax",
    mensajeEspiritual: "Nuestras actitudes son como si la vida fuera a ser eterna, y no nos damos cuenta que cada día es solo uno menos en nuestra oportunidad de hacerla provechosa. Recordemos que nada muere, solo se transforma.",
    polaridadPositiva: ["Pacientes", "De buena actitud", "No existe día difícil para ellos si están en armonía"],
    polaridadNegativa: ["Propensos a una muerte accidental si no están en armonía con su día"],
    trabajoEspiritual: "Es necesario tener en cuenta la transformación para pasar al otro plano de existencia sin quedarnos enganchados y así trascender.",
    relacionConNaturaleza: "Conectado con los cementerios ancestrales, el portal entre mundos."
  },
  "Kej": {
    nombre: "Kej",
    nombreCompleto: "Kej - Venado, Fuerza, Cuatro Puntos Cardinales",
    significadoProfundo: "Simboliza venado, los cuatro sostenes, los cuatro pilares: los cuatro puntos cardinales. Los cuatro puntos cardinales fueron creados desde un principio para sostener con fuerza y energía la Tierra, la Luna y las estrellas.",
    ceremoniasYRituales: "Las ceremonias son para pedir fuerzas, para pedir por la gestación; curación y protección de los niños y adultos. Día de la entrega del mando como padre y madre; del valor de la vara de la autoridad.",
    fecundadoEn: "Kawoq",
    mensajeEspiritual: "Cuando la mesa, la silla, la piedra de moler, los animales, las personas no tienen su soporte correctamente, surge inestabilidad y desequilibrio. La fuerza se usa para ayudar a las personas débiles en su caminar.",
    polaridadPositiva: ["Fuertes en cuerpo y espíritu", "Pueden formarse como Ajq'ij", "Liderazgo sereno"],
    polaridadNegativa: ["Rigidez", "Terquedad si no trabajan su energía"],
    trabajoEspiritual: "Según lo determinen el Ajq'ij y la numeración que acompaña su día, pueden desarrollar su camino espiritual.",
    relacionConNaturaleza: "Conectado con los bosques sagrados, los cuatro pilares del universo."
  },
  "Q'anil": {
    nombre: "Q'anil",
    nombreCompleto: "Q'anil - Semilla, Alimento, Las Siembras",
    significadoProfundo: "Simboliza los cuatro colores del maíz existentes en Mesoamérica: rojo, negro, blanco y amarillo. Los cuatro colores de la piel de la humanidad. Los cuatro puntos cardinales del universo.",
    ceremoniasYRituales: "Las ceremonias son para agradecer por todo lo que nos brinda la naturaleza. En el Wajxaqib' Q'anil se pide por buenas siembras, buenas cosechas y que no los dañe animal alguno.",
    fecundadoEn: "Ajpu",
    mensajeEspiritual: "Hay que tener un punto orientador en la oscuridad. Se siembra para cosechar, y a veces por puro descuido y pereza, se cosecha lo que no se desea. Hay que estar atentos para que la cosecha sea la que hemos deseado.",
    polaridadPositiva: ["Buenos cultivadores de la Madre Tierra", "Pueden llegar a ser K'utunel (pedidores del alimento)", "Capacidad de nutrir"],
    polaridadNegativa: ["Dispersión si no mantienen enfoque", "Impaciencia por ver resultados"],
    trabajoEspiritual: "Día de agradecimiento al Creador y Formador, por la naturaleza, por todos los seres vivos y por los cuatro colores del maíz.",
    relacionConNaturaleza: "Conectado con los campos de cultivo, la semilla sagrada del maíz."
  },
  "Toj": {
    nombre: "Toj",
    nombreCompleto: "Toj - Enfermedad, Dolor, Ofrenda, Pena",
    significadoProfundo: "Simboliza ofrenda, la paga o la nivelación en la justicia. La invocación, la ofrenda al Creador y Formador, fue la paga que hicieron los primeros abuelos por nuestro entorno y el universo infinito.",
    ceremoniasYRituales: "Día para agradecer y pedir mediante la ofrenda la buena aplicación de la justicia, para proteger la vida de las personas propensas a muertes accidentales y estar en comunicación con el Creador y Formador.",
    fecundadoEn: "Imox",
    mensajeEspiritual: "Tarde o temprano todo retorna hacia uno mismo; las palabras, las promesas, las actitudes, las peticiones, los deseos. Cada uno de nuestros deseos son escuchados y se nos conceden. Se debe pensar hasta qué punto puede influir nuestras peticiones.",
    polaridadPositiva: ["Capacidad de ofrenda", "Conexión con lo ceremonial", "Equilibradores kármicos"],
    polaridadNegativa: ["Suelen padecer enfermedades y problemas", "Pagan los males de la familia o la sociedad"],
    trabajoEspiritual: "Puede llegar a ser guía espiritual o bien dar siempre sus ofrendas, según le sea aconsejado por su Ajq'ij.",
    relacionConNaturaleza: "Conectado con los altares ceremoniales, el fuego sagrado."
  },
  "Tz'i'": {
    nombre: "Tz'i'",
    nombreCompleto: "Tz'i' - Perro, Juego, Adulterio, Día del Parto",
    significadoProfundo: "Hecho el universo y creado el hombre sobre la bendita faz de la tierra también se creó al perro como símbolo de desequilibrio si se desorienta la sabiduría. Representa la ley y la justicia.",
    ceremoniasYRituales: "Se ofrecen ceremonias para que no triunfen las fuerzas negativas y que la autoridad tenga mística, visión y entendimiento para una buena aplicación de la justicia. Kab'lajuj Tz'i' es día del trabajo de la comadrona.",
    fecundadoEn: "Iq'",
    mensajeEspiritual: "La justicia espiritual al igual que la física no puede ser ignorada pues llega momentos en que son balanceadas nuestras acciones y surgen reacciones de consecuencia muchas veces bruscas y de cambios radicales.",
    polaridadPositiva: ["Guardianes de la ley divina", "Fidelidad", "Capacidad de discernimiento"],
    polaridadNegativa: ["Propensos a crear enemistades y discordias", "Desvíos mentales si no buscan protección"],
    trabajoEspiritual: "Para evitar desvíos mentales deben buscar protección con el Ajq'ij.",
    relacionConNaturaleza: "Conectado con la ley cósmica, los tribunales de justicia espiritual."
  },
  "B'atz'": {
    nombre: "B'atz'",
    nombreCompleto: "B'atz' - Hilo, Inicio, El Tejido",
    significadoProfundo: "Simboliza el tiempo. Nuestros antepasados representaron el tiempo con un hilo enrollado a un carrizo debajo de la tierra. Este hilo se va desenrollando a medida que el tiempo pasa. La historia se teje con el tiempo.",
    ceremoniasYRituales: "En el año nuevo Maya, Wajxaqib' B'atz', se ponen marimbas y se baila alrededor del fuego. Día especial para dar la ofrenda, para iniciar un trabajo, día bueno para el matrimonio.",
    fecundadoEn: "Aq'ab'al",
    mensajeEspiritual: "La vida va siendo como un hilo que poco a poco se va desenvolviendo hasta convertirse en otra madeja (transformación), agregándole las manifestaciones artísticas que son reflejos del corazón.",
    polaridadPositiva: ["Vocación de Chuch Qajaw (guía espiritual)", "Artistas naturales", "Tejedores del tiempo"],
    polaridadNegativa: ["Vanidad artística", "Enredarse en dramas si no trabajan su energía"],
    trabajoEspiritual: "La vocación debe ser reforzada con la buena actitud. Wajxaqi' B'atz' es día bueno para pedir por toda la humanidad, para pedir cosechas, siembras, inicio de una vida.",
    relacionConNaturaleza: "Conectado con el hilo del tiempo, la creatividad del universo."
  },
  "E": {
    nombre: "E",
    nombreCompleto: "E - Camino, Diente, Autoridad, Alimento",
    significadoProfundo: "Simboliza un buen día. Es camino. Es destino, el que nos lleva a un punto fijo. Es el desarrollo de la historia que empieza en B'atz' y termina en Tz'i'. Día del fuego en el hogar, día de las plantas, las estrellas, el cielo.",
    ceremoniasYRituales: "En el Wajxaqib' E, puede hacerse peticiones para los buenos alimentos, pedir protección, pedir bienestar físico y mental, para agradecer las ocupaciones existentes y la palabra de la autoridad.",
    fecundadoEn: "K'at",
    mensajeEspiritual: "Destino; cada persona tiene obligaciones que le son asignadas desde el día de su concepción, y no puede negarse a ello porque sería estar en contra de sí mismo. El compromiso de ser parte de 'un todo' hace que la búsqueda del camino sea interminable.",
    polaridadPositiva: ["Buena personalidad", "Pueden formarse como Ajwaja' (guía mediador de abundancia)", "Guías naturales"],
    polaridadNegativa: ["Inquietud constante", "Dificultad para echar raíces si no trabajan su energía"],
    trabajoEspiritual: "Dado a que puede formarse como guía espiritual mediador de la abundancia, del sustento diario.",
    relacionConNaturaleza: "Conectado con los caminos sagrados, las estrellas, el sendero de vida."
  },
  "Aj": {
    nombre: "Aj",
    nombreCompleto: "Aj - Maíz, Siembra, Animales Domésticos, Niños, Hogar, Familia",
    significadoProfundo: "Símbolo de la siembra que se hizo de las cañas en casa de la Abuela de Jun Ajpu' e Ixbalankej. La persona que nace ante este día será como la semilla ante la naturaleza, se multiplicará.",
    ceremoniasYRituales: "En el Wajxaqib' Aj, se celebran las ceremonias para pedir la siembra de un(a) niño(a) en gestación, siembra de un recién nacido. Es el día protector de la vida.",
    fecundadoEn: "Kan",
    mensajeEspiritual: "Cuando se trabaja y se sobrevive en equilibrio no se puede descuidar la energía del hogar: el adoratorio familiar y a los niños que son la alegría de la casa.",
    polaridadPositiva: ["Multiplicadores", "Protectores del hogar", "Pilares de la comunidad"],
    polaridadNegativa: ["Rigidez en tradiciones", "Control excesivo si no equilibran"],
    trabajoEspiritual: "Es un día bueno para ayudar a los gemelos y pedir que no se destruya la humanidad.",
    relacionConNaturaleza: "Conectado con los hogares ancestrales, el pilar central del maíz."
  },
  "I'x": {
    nombre: "I'x",
    nombreCompleto: "I'x - B'alam - Montañas, Planicies, Jaguar, Fuerza, Vigor",
    significadoProfundo: "Representa el altar Maya Tab'al. Es el día de las montañas, cerros y planicies. El jaguar es el guardián de la noche y símbolo del poder femenino.",
    ceremoniasYRituales: "Las ceremonias que se ofrecen son para pedir perdón de la explotación que hace la humanidad a la naturaleza y pedir el retorno de las plantas.",
    fecundadoEn: "Kame",
    mensajeEspiritual: "Por la energía que nos proporcionan los distintos centros de energía, hay complemento y sostenibilidad de vida. No hay que olvidar que todos esos Rincones Especiales son los puntos energéticos que alimentan los espacios.",
    polaridadPositiva: ["Fuertes y vigorosos", "Edificadores", "Conexión con la magia femenina"],
    polaridadNegativa: ["Coléricos, ladrones, malhechores si no se protegen ante su día"],
    trabajoEspiritual: "Debe protegerse ante su día para ser edificador y no caer en sombra.",
    relacionConNaturaleza: "Conectado con las selvas nocturnas, las montañas, la magia lunar."
  },
  "Tz'ikin": {
    nombre: "Tz'ikin",
    nombreCompleto: "Tz'ikin - Águila, Bienes y Producción",
    significadoProfundo: "Es el águila y el quetzal, mensajeros entre el cielo y la tierra. Representa la visión, la libertad y la conexión con el Gran Espíritu.",
    ceremoniasYRituales: "Ceremonias para la prosperidad, la visión y la conexión con lo divino.",
    fecundadoEn: "Kej",
    mensajeEspiritual: "El águila otorga la libertad de espíritu y la capacidad de elevarse sobre los problemas para ver el panorama completo.",
    polaridadPositiva: ["Visionarios naturales", "Don de la prosperidad", "Mensajeros divinos"],
    polaridadNegativa: ["Materialismo excesivo", "Desconexión de lo terrenal si no equilibran"],
    trabajoEspiritual: "Desarrollar la visión elevada manteniendo los pies en la tierra.",
    relacionConNaturaleza: "Conectado con las cimas, los cielos, la visión cósmica."
  },
  "Ajmaq": {
    nombre: "Ajmaq",
    nombreCompleto: "Ajmaq - Perdón, Sabiduría Ancestral",
    significadoProfundo: "Representa el perdón, la sabiduría de los ancestros y la conexión con los que ya partieron. Es el signo de la introspección y la búsqueda de respuestas profundas.",
    ceremoniasYRituales: "Ceremonias para el perdón, la conexión ancestral y la sanación de heridas del pasado.",
    fecundadoEn: "Q'anil",
    mensajeEspiritual: "Poseen el don del perdón y la capacidad de sanar heridas del pasado, tanto propias como ajenas.",
    polaridadPositiva: ["Acceso a la sabiduría antigua", "Comprensión de misterios", "Sanadores del perdón"],
    polaridadNegativa: ["Culpa crónica", "Vivir en el pasado si no trabajan su energía"],
    trabajoEspiritual: "Desarrollar la capacidad de perdonar y perdonarse.",
    relacionConNaturaleza: "Conectado con las cuevas ancestrales, el perdón divino."
  },
  "No'j": {
    nombre: "No'j",
    nombreCompleto: "No'j - Conocimiento, Ciencia",
    significadoProfundo: "Representa el conocimiento, la sabiduría y el movimiento del pensamiento. Es el signo de la inteligencia y la capacidad de comprensión profunda.",
    ceremoniasYRituales: "Ceremonias para el conocimiento, la claridad mental y la sabiduría.",
    fecundadoEn: "Toj",
    mensajeEspiritual: "Pensadores naturales con una mente analítica y curiosa. Tienen el don de comprender conceptos complejos y encontrar soluciones innovadoras.",
    polaridadPositiva: ["Mente analítica", "Buscadores de conocimiento", "Innovadores"],
    polaridadNegativa: ["Sobre-análisis paralizante", "Orgullo intelectual si no equilibran"],
    trabajoEspiritual: "Equilibrar la mente con el corazón, el análisis con la intuición.",
    relacionConNaturaleza: "Conectado con los templos de conocimiento, la sabiduría ancestral."
  },
  "Tijax": {
    nombre: "Tijax",
    nombreCompleto: "Tijax - Obsidiana, Sanación",
    significadoProfundo: "Es la obsidiana, el cuchillo de doble filo que corta y sana. Representa la medicina, la cirugía espiritual y la capacidad de eliminar lo que no sirve.",
    ceremoniasYRituales: "Ceremonias para la sanación, cortar energías negativas y restaurar la salud.",
    fecundadoEn: "Tz'i'",
    mensajeEspiritual: "Sanadores naturales con el poder de cortar energías negativas y restaurar la salud. Poseen una mente aguda y la capacidad de ir directo al corazón de los problemas.",
    polaridadPositiva: ["Sanadores naturales", "Guerreros espirituales", "Capacidad de cortar lo innecesario"],
    polaridadNegativa: ["Palabras hirientes", "Crueldad involuntaria si no trabajan su energía"],
    trabajoEspiritual: "Usar el poder de cortar con compasión y sabiduría.",
    relacionConNaturaleza: "Conectado con los lugares de sanación, la obsidiana sagrada."
  },
  "Kawoq": {
    nombre: "Kawoq",
    nombreCompleto: "Kawoq - Tormenta, Comunidad",
    significadoProfundo: "Es la tormenta, la fuerza transformadora que limpia y renueva. Representa la comunidad, la familia extendida y el poder del grupo.",
    ceremoniasYRituales: "Ceremonias para la comunidad, la fertilidad y la protección del bienestar colectivo.",
    fecundadoEn: "B'atz'",
    mensajeEspiritual: "Líderes comunitarios con una capacidad innata para unir a las personas. Tienen el don de la fertilidad en todos los sentidos y la capacidad de nutrir a grandes grupos.",
    polaridadPositiva: ["Unificadores", "Nutricios", "Catalizadores de cambio social"],
    polaridadNegativa: ["Involucrarse demasiado en vidas ajenas", "Perder identidad propia si no equilibran"],
    trabajoEspiritual: "Servir a la comunidad manteniendo la propia identidad.",
    relacionConNaturaleza: "Conectado con la tormenta purificadora, los centros comunitarios."
  },
  "Ajpu": {
    nombre: "Ajpu",
    nombreCompleto: "Ajpu - Sol, Cazador",
    significadoProfundo: "Es el sol, el cazador divino y héroe gemelo del Popol Vuh. Representa la luz, la claridad y la victoria sobre la oscuridad.",
    ceremoniasYRituales: "Ceremonias para la victoria, la claridad y la conexión con el Gran Espíritu.",
    fecundadoEn: "E",
    mensajeEspiritual: "Guerreros de luz con una misión clara de servicio. Poseen carisma natural y la capacidad de inspirar a otros hacia sus propósitos más elevados.",
    polaridadPositiva: ["Guerreros de luz", "Carismáticos", "Inspiradores"],
    polaridadNegativa: ["Ego inflado", "Necesidad de reconocimiento si no trabajan su energía"],
    trabajoEspiritual: "Usar el carisma para servir, no para dominar.",
    relacionConNaturaleza: "Conectado con las pirámides solares, la luz del sol."
  }
};

// =============================================================================
// PROGRAMA CURANDERAS DEL NUEVO TIEMPO
// =============================================================================

export const programaCuranderas = {
  nombre: "Curanderas del Nuevo Tiempo",
  duracion: "260 días",
  descripcion: "Un proceso de 260 días: ciclo completo del calendario maya y también ciclo completo de gestación humana.",
  
  mensajeMadre: `Curanderas del Nuevo Tiempo es un proceso de 260 días: ciclo completo del calendario maya y también ciclo completo de gestación humana.

Lo que caminas durante 260 días se vuelve realidad en tu vida, porque no es información: es reprogramación, ritmo, repetición y encarnación.

Aquí no venimos a "probar". Venimos a darnos a luz.

En esos 260 días despiertas 20 energías / 20 sentidos (20 nahuales) que ya viven dentro de ti. Cada trecena abre una puerta, y la puerta se sostiene cuando no rompes secuencia.

Por eso este camino funciona como embarazo: si lo interrumpes, no es castigo… es que se corta continuidad, y sin continuidad no hay gestación completa.`,

  estructura: {
    trecena: {
      descripcion: "Cada trecena es un bloque de 13 días de práctica guiada",
      contenido: [
        "Audio/meditación AM para cada día",
        "Audio/meditación PM para cada día", 
        "Claves y lectura energética del día"
      ],
      bonos: "Clases, talleres y recursos extra que existen para sostenerte mientras caminas la secuencia completa"
    },
    
    acceso: {
      unaTrecena: {
        descripcion: "Acceso al núcleo de esa trecena (13 días de audios + material del día)",
        bonos: "Acceso a bonos por 1 ciclo (13 días)",
        nota: "Ideal para vivir trecena completa como experiencia"
      },
      secuenciaCompleta: {
        descripcion: "Si continúas sin cortar secuencia (trecena tras trecena)",
        beneficio: "Mantienes bonos activos mientras sigues caminando consecutivo"
      },
      cicloCompleto: {
        descripcion: "Si completas 20 trecenas / 260 días sin saltarte ninguna",
        beneficio: "Acceso de por vida a material completo, bonos, activaciones y biblioteca viva del camino"
      }
    }
  },

  filosofia: `Este proceso funciona como embarazo: si lo interrumpes, no es castigo… es que se corta continuidad, y sin continuidad no hay gestación completa.

Yo no sostengo este portal para que alguien solo acumule contenido. Yo sostengo este portal para que mujer cambie vida.

Y transformación real necesita:
• repetición
• ritmo  
• continuidad
• compromiso
• no interrumpir gestación`,

  decretoFinal: `"Camino mi proceso completo. Sostengo mi secuencia. Me doy a luz.
Lo que inicio, lo termino. Lo que elijo, lo encarno.
Esto era lo que estaba buscando."`
};

// =============================================================================
// INVOCACIONES Y ORACIONES
// =============================================================================

export const invocaciones = {
  oracionPopWuj: `¡Oh tu Tz'aqol Bitol! ¡Míranos, escúchanos! Envoltorio de la Majestad.
¡No nos dejes, no nos desampares. Tu Tohil, tu Avilix tu Hacavitz,
Oh Ajaw, que estás en el Cielo y en la Tierra. Bóveda del Cielo, superficie de la Tierra,
Corazón del Cielo, corazón de la Tierra! Los cuatro rincones, los cuatro puntos cardinales.

¡Que sólo haya paz y tranquilidad ante tu boca, ante tu presencia.
¡Que amanezca y que llegue la aurora!
¡Danos muchos buenos caminos, caminos planos!
¡Que los pueblos tengan paz, mucha paz y sean felices,
y danos buena vida y útil existencia!

¡Oh tu Huracán, Chipi Caculhá, Raxa Caculhá.
Chipi – Nanauac, Raxa Nanauac
Voc, Hunahpú, Tepeu, Gucumatz,
Alom, Qajolom, Ixpiyacoc, Ixmucané

Abuela del sol
Abuela de la luz!
Que amanezca, que llegue la aurora!
¡Oh tú, hermosura del día. ¡Tú Huracán;
tú, Corazón del Cielo, Corazón de la Tierra!
¡Tú dador de la riqueza,
y dador de las hijas y de los hijos!

Vuelve hacia acá tu gloria y tu riqueza;
Concédeles la vida y el desarrollo a mis hijos y vasallos,
Que se multipliquen y que crezcan
Los que han de alimentarte y mantenerte;
Los que te invocan en los campos, en los caminos
A la orilla de los ríos, en los barrancos, bajo los bejucos.

Dale sus hijos e hijas.
Que no encuentren desgracia ni infortunio,
Que no se introduzca el engañador
Ni detrás, ni delante de ellos.
Que no caigan y no sean heridos,
Que no caigan ni en la bajada, ni en la subida del camino.
Que no encuentren obstáculos ni detrás ni delante de ellos,
Ni cosa que los golpee.

Concédeles buenos caminos, hermosos caminos, caminos planos.
Que no tengan infortunio, ni desgracia,
A ti, Corazón de la Tierra.`
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getNahualConocimiento(nombreNahual: string): NahualConocimientoExpandido | undefined {
  return nahualConocimientoExpandido[nombreNahual];
}

export function getGuardianPorNombre(nombre: string): Guardian | undefined {
  return guardianes.find(g => 
    g.nombre.toLowerCase().includes(nombre.toLowerCase()) || 
    g.nombreMaya.toLowerCase().includes(nombre.toLowerCase())
  );
}

export function getConceptoPorNombre(nombre: string): ConceptoMaya | undefined {
  return conceptosFundamentales.find(c => 
    c.nombre.toLowerCase().includes(nombre.toLowerCase())
  );
}
