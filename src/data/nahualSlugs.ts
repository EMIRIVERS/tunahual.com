// Mapping of Nahual names to URL-friendly slugs
export const nahualToSlug: Record<string, string> = {
  "Imox": "imox",
  "Iq'": "iq",
  "Aq'ab'al": "aqabal",
  "K'at": "kat",
  "Kan": "kan",
  "Kame": "kame",
  "Kej": "kej",
  "Q'anil": "qanil",
  "Toj": "toj",
  "Tz'i'": "tzi",
  "B'atz'": "batz",
  "E": "e",
  "Aj": "aj",
  "I'x": "ix",
  "Tz'ikin": "tzikin",
  "Ajmaq": "ajmaq",
  "No'j": "noj",
  "Tijax": "tijax",
  "Kawoq": "kawoq",
  "Ajpu": "ajpu",
};

export const slugToNahual: Record<string, string> = Object.fromEntries(
  Object.entries(nahualToSlug).map(([name, slug]) => [slug, name])
);

export function getNahualSlug(nahualName: string): string {
  return nahualToSlug[nahualName] || nahualName.toLowerCase();
}

export function getNahualFromSlug(slug: string): string | undefined {
  return slugToNahual[slug];
}

// List of all nahuales in order for the index page
export const nahualOrder = [
  "Imox", "Iq'", "Aq'ab'al", "K'at", "Kan", "Kame", "Kej", 
  "Q'anil", "Toj", "Tz'i'", "B'atz'", "E", "Aj", "I'x", 
  "Tz'ikin", "Ajmaq", "No'j", "Tijax", "Kawoq", "Ajpu"
];

/** Tono, nahual, número de Kin y vecinos a partir de «7-aqabal». */
export function parseKinSlug(kinSlug: string | undefined) {
  if (!kinSlug) return null;
  const match = kinSlug.match(/^(\d+)-([a-z]+)$/i);
  if (!match) return null;

  const tonoNum = parseInt(match[1], 10);
  const nahualSlug = match[2].toLowerCase();
  const nahualName = slugToNahual[nahualSlug];

  if (!nahualName || tonoNum < 1 || tonoNum > 13) return null;

  const nahualIndex = nahualOrder.indexOf(nahualName);
  const kinNumber = ((tonoNum - 1) * 20 + nahualIndex) % 260 + 1;

  // Calculate prev/next Kin
  const prevKinNum = kinNumber === 1 ? 260 : kinNumber - 1;
  const nextKinNum = kinNumber === 260 ? 1 : kinNumber + 1;

  const getKinSlug = (num: number) => {
    // Reverse calculation: kinNumber = ((tono-1)*20 + nahualIndex) % 260 + 1
    // We need to find tono and nahualIndex for a given kinNumber
    const idx = num - 1;
    const nIdx = idx % 20;
    const tIdx = idx % 13;
    return `${tIdx + 1}-${nahualToSlug[nahualOrder[nIdx]]}`;
  };

  return {
    tonoNum,
    nahualName,
    nahualIndex,
    kinNumber,
    prevSlug: getKinSlug(prevKinNum),
    nextSlug: getKinSlug(nextKinNum),
    prevKin: prevKinNum,
    nextKin: nextKinNum,
  };
}

export type KinParsed = NonNullable<ReturnType<typeof parseKinSlug>>;
