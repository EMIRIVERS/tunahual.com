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
