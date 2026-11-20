/**
 * ¿La petición viene de nuestro propio sitio? Compara el HOST exacto, no un
 * prefijo: `https://tunahual.com.evil.com` y `https://evil.com/?tunahual.com`
 * NO pasan. OJO: `Origin`/`Referer` los puede escribir cualquiera con curl; esto
 * frena navegadores ajenos y errores, no a un atacante. El control real de los
 * endpoints que cuestan dinero es su bandera de servidor.
 */
export function origenPermitido(origen: string, env: Record<string, string | undefined> = process.env): boolean {
  let u: URL;
  try {
    u = new URL(origen);
  } catch {
    return false;
  }
  const host = u.hostname.toLowerCase();
  if (u.protocol === "https:" && (host === "tunahual.com" || host === "www.tunahual.com")) return true;
  // Previews de ESTE proyecto (tu-nahual-<hash>-emi-rivers-projects.vercel.app), no cualquier *.vercel.app.
  if (u.protocol === "https:" && /^tu-nahual(-[a-z0-9]+)*-emi-rivers-projects\.vercel\.app$/.test(host)) return true;
  // localhost solo fuera de producción.
  if (env.VERCEL_ENV !== "production" && u.protocol === "http:" && (host === "localhost" || host === "127.0.0.1")) return true;
  return false;
}
