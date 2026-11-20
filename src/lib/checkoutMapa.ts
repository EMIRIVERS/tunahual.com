/**
 * Cobro del «Mapa de Energía» (Stripe Checkout, 11 USD, pago único).
 * El botón solo aparece con VITE_CHECKOUT_MAPA=1 (se hornea en el build): así
 * el sitio no ofrece un cobro que aún no tiene llaves de Stripe detrás.
 */
import type { Genero } from "@/lib/oraculo/genero";

export const CHECKOUT_MAPA_HABILITADO = (import.meta.env.VITE_CHECKOUT_MAPA as string | undefined)?.trim() === "1";

export interface DatosMapa {
  kinSlug: string;
  nahualSlug: string;
  tono: number;
  nahual: string;
  /** YYYY-MM-DD */
  fechaNacimiento: string;
  nombre: string;
  genero: Genero;
}

/** Fecha local como YYYY-MM-DD (toISOString la correría un día en husos al oeste de UTC). */
export function fechaISOLocal(d: Date): string {
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/** Pide la sesión de pago y devuelve la URL de Stripe. Lanza con un mensaje apto para mostrar. */
export async function crearCheckoutMapa(d: DatosMapa): Promise<string> {
  let respuesta: Response;
  try {
    respuesta = await fetch("/api/create-checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kinSlug: d.kinSlug,
        nahualSlug: d.nahualSlug,
        tono: d.tono,
        nahual: d.nahual,
        fecha_nacimiento: d.fechaNacimiento,
        nombre: d.nombre,
        genero: d.genero,
      }),
    });
  } catch {
    throw new Error("No pudimos conectar. Revisa tu conexión e inténtalo de nuevo.");
  }
  const cuerpo = (await respuesta.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!respuesta.ok || !cuerpo.url) {
    throw new Error(
      respuesta.status === 503
        ? "El pago aún no está disponible. Vuelve a intentarlo en unos días."
        : "No se pudo iniciar el pago. Inténtalo de nuevo."
    );
  }
  return cuerpo.url;
}
