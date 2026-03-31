// Static glyph images for each Nahual
import imoxGlifo from "@/assets/glifos/imox.jpg";
import iqGlifo from "@/assets/glifos/iq.jpg";
import aqabalGlifo from "@/assets/glifos/aqabal.jpg";
import katGlifo from "@/assets/glifos/kat.jpg";
import kanGlifo from "@/assets/glifos/kan.jpg";
import kameGlifo from "@/assets/glifos/kame.jpg";
import kejGlifo from "@/assets/glifos/kej.jpg";
import qanilGlifo from "@/assets/glifos/qanil.jpg";
import tojGlifo from "@/assets/glifos/toj.jpg";
import tziGlifo from "@/assets/glifos/tzi.jpg";
import batzGlifo from "@/assets/glifos/batz.jpg";
import eGlifo from "@/assets/glifos/e.jpg";
import ajGlifo from "@/assets/glifos/aj.jpg";
import ixGlifo from "@/assets/glifos/ix.jpg";
import tzikinGlifo from "@/assets/glifos/tzikin.jpg";
import ajmaqGlifo from "@/assets/glifos/ajmaq.jpg";
import nojGlifo from "@/assets/glifos/noj.jpg";
import tijaxGlifo from "@/assets/glifos/tijax.jpg";
import kawoqGlifo from "@/assets/glifos/kawoq.jpg";
import ajpuGlifo from "@/assets/glifos/ajpu.jpg";

// Map nahual names to their glyph images - All 20 nahuales complete!
export const nahualGlifos: Record<string, string> = {
  "Imox": imoxGlifo,
  "Iq'": iqGlifo,
  "Aq'ab'al": aqabalGlifo,
  "K'at": katGlifo,
  "Kan": kanGlifo,
  "Kame": kameGlifo,
  "Kej": kejGlifo,
  "Q'anil": qanilGlifo,
  "Toj": tojGlifo,
  "Tz'i'": tziGlifo,
  "B'atz'": batzGlifo,
  "E": eGlifo,
  "Aj": ajGlifo,
  "I'x": ixGlifo,
  "Tz'ikin": tzikinGlifo,
  "Ajmaq": ajmaqGlifo,
  "No'j": nojGlifo,
  "Tijax": tijaxGlifo,
  "Kawoq": kawoqGlifo,
  "Ajpu": ajpuGlifo,
};

export function getNahualGlifo(nahualName: string): string | undefined {
  return nahualGlifos[nahualName];
}
