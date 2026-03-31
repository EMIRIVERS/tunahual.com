// Animal guide images - Mayan glyph line art style
import cocodriloImg from "@/assets/animals/cocodrilo.png";
import colibriImg from "@/assets/animals/colibri.png";
import murcielagoImg from "@/assets/animals/murcielago.png";
import aranaImg from "@/assets/animals/arana.png";
import serpienteImg from "@/assets/animals/serpiente.png";
import buhoImg from "@/assets/animals/buho.png";
import venadoImg from "@/assets/animals/venado.png";
import conejoImg from "@/assets/animals/conejo.png";
import tiburonImg from "@/assets/animals/tiburon.png";
import perroImg from "@/assets/animals/perro.png";
import monoImg from "@/assets/animals/mono.png";
import pumaImg from "@/assets/animals/puma.png";
import armadilloImg from "@/assets/animals/armadillo.png";
import jaguarImg from "@/assets/animals/jaguar.png";
import aguilaImg from "@/assets/animals/aguila.png";
import abejaImg from "@/assets/animals/abeja.png";
import pajaroCarpinteroImg from "@/assets/animals/pajaro_carpintero.png";
import pezEspadaImg from "@/assets/animals/pez_espada.png";
import tortugaImg from "@/assets/animals/tortuga.png";
import guacamayaImg from "@/assets/animals/guacamaya.png";

// Map animal names to their images
export const animalImages: Record<string, string> = {
  // Imox
  "Cocodrilo": cocodriloImg,
  // Iq'
  "Colibrí": colibriImg,
  // Aq'ab'al
  "Murciélago": murcielagoImg,
  // K'at
  "Araña": aranaImg,
  // Kan
  "Serpiente Emplumada": serpienteImg,
  // Kame
  "Búho": buhoImg,
  // Kej
  "Venado": venadoImg,
  // Q'anil
  "Conejo": conejoImg,
  // Toj
  "Tiburón": tiburonImg,
  // Tz'i'
  "Perro/Coyote": perroImg,
  // B'atz'
  "Mono": monoImg,
  // E
  "Gato/Puma": pumaImg,
  // Aj
  "Armadillo": armadilloImg,
  // I'x
  "Jaguar": jaguarImg,
  // Tz'ikin
  "Águila/Quetzal": aguilaImg,
  // Ajmaq
  "Abeja": abejaImg,
  // No'j
  "Pájaro Carpintero": pajaroCarpinteroImg,
  // Tijax
  "Pez Espada": pezEspadaImg,
  // Kawoq
  "Tortuga": tortugaImg,
  // Ajpu
  "Guacamaya": guacamayaImg,
};

export function getAnimalImage(animalName: string): string | undefined {
  return animalImages[animalName];
}
