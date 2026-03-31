// Lazy-loaded animal images for better initial bundle size
// Images are dynamically imported only when needed

const animalImageModules: Record<string, () => Promise<{ default: string }>> = {
  "Cocodrilo": () => import("@/assets/animals/cocodrilo.png"),
  "Colibrí": () => import("@/assets/animals/colibri.png"),
  "Murciélago": () => import("@/assets/animals/murcielago.png"),
  "Araña": () => import("@/assets/animals/arana.png"),
  "Serpiente Emplumada": () => import("@/assets/animals/serpiente.png"),
  "Búho": () => import("@/assets/animals/buho.png"),
  "Venado": () => import("@/assets/animals/venado.png"),
  "Conejo": () => import("@/assets/animals/conejo.png"),
  "Tiburón": () => import("@/assets/animals/tiburon.png"),
  "Perro/Coyote": () => import("@/assets/animals/perro.png"),
  "Mono": () => import("@/assets/animals/mono.png"),
  "Gato/Puma": () => import("@/assets/animals/puma.png"),
  "Armadillo": () => import("@/assets/animals/armadillo.png"),
  "Jaguar": () => import("@/assets/animals/jaguar.png"),
  "Águila/Quetzal": () => import("@/assets/animals/aguila.png"),
  "Abeja": () => import("@/assets/animals/abeja.png"),
  "Pájaro Carpintero": () => import("@/assets/animals/pajaro_carpintero.png"),
  "Pez Espada": () => import("@/assets/animals/pez_espada.png"),
  "Tortuga": () => import("@/assets/animals/tortuga.png"),
  "Guacamaya": () => import("@/assets/animals/guacamaya.png"),
};

// Cache for loaded images
const imageCache: Record<string, string> = {};

export async function getAnimalImageLazy(animalName: string): Promise<string | undefined> {
  // Check cache first
  if (imageCache[animalName]) {
    return imageCache[animalName];
  }

  const loader = animalImageModules[animalName];
  if (!loader) return undefined;

  try {
    const module = await loader();
    imageCache[animalName] = module.default;
    return module.default;
  } catch {
    return undefined;
  }
}

// Check if animal has an image available (synchronous)
export function hasAnimalImage(animalName: string): boolean {
  return animalName in animalImageModules;
}
