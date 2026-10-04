import { test, expect } from "@playwright/test";

// Errores de consola permitidos en preview local (las funciones /api no
// corren bajo `vite preview`; en Vercel sí existen).
const IGNORABLE = [/\/api\//, /status of 40[0-9]/, /status of 406/];
function realErrors(errors: string[]) {
  return errors.filter((e) => !IGNORABLE.some((re) => re.test(e)));
}

test("home: calcular muestra la lectura primero (sin muro)", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push("pageerror: " + e.message));

  await page.goto("/");
  await page.fill('input[type="date"]', "1990-05-15");
  await page.click('button:has-text("Conocer mi Nahual")');

  // La lectura aparece directamente; NO debe pedir datos antes.
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('input[placeholder="Tu nombre"]')).toHaveCount(0);

  expect(realErrors(errors)).toEqual([]);
});

// Nunca escribir leads de prueba en la base real: se simula la respuesta.
async function simularLeads(page: import("@playwright/test").Page) {
  await page.route("**/rest/v1/leads*", (r) => r.fulfill({ status: 201, body: "" }));
  await page.route("**/api/**", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":false}' }));
}

async function calcular(page: import("@playwright/test").Page, fecha = "1990-03-15") {
  await page.goto("/");
  await page.fill('input[type="date"]', fecha);
  await page.click('button:has-text("Conocer mi Nahual")');
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 15000 });
}

test("capas: el nahual es libre y la Cruz Maya espera el correo", async ({ page }) => {
  await calcular(page);
  // 15 mar 1990 = 7 Aq'ab'al (verificado), ya visible sin dejar datos
  await expect(page.locator('[role="dialog"]').getByText(/Aq'ab'al/).first()).toBeVisible();

  await page.getByRole("tab", { name: /Cruz/i }).click();
  await expect(page.getByText("Tus nueve energías te esperan")).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir mi Cruz Maya" }).first()).toBeVisible();
});

test("elemento de Aq'ab'al es Tierra (maíz negro), no 'Luz y Oscuridad'", async ({ page }) => {
  await calcular(page);
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog.getByText("Tierra", { exact: true }).first()).toBeVisible();
  await expect(dialog.getByText("Luz y Oscuridad")).toHaveCount(0);
});

test("flujo: dejar correo y WhatsApp abre la Cruz Maya y el cielo de nacimiento", async ({ page }) => {
  await simularLeads(page);
  await calcular(page);

  await page.getByRole("button", { name: /Recibir mi lectura por email/i }).click();
  await expect(page.locator('input[placeholder="Tu nombre"]')).toBeVisible();
  await page.fill('input[placeholder="Tu nombre"]', "QA Smoke");
  await page.fill('input[type="email"]', "qa.smoke@example.com");
  await page.fill("#telefono", "12345678");
  await page.click("#terms");
  await page.click('button:has-text("Abrir mi Cruz Maya")');

  await expect(page.getByText(/Te enviamos tu lectura|quedó guardada|guardada/i).first()).toBeVisible({ timeout: 10000 });

  const dialog = page.locator('[role="dialog"]');
  // Cielo de nacimiento: Cuenta Larga y Haab' verificados para el 15 mar 1990
  await expect(dialog.getByText("12.18.16.16.3")).toBeVisible();
  await expect(dialog.getByText("1 Kumk'u")).toBeVisible();
  await expect(dialog.getByText("Luna menguante gibosa")).toBeVisible();

  await page.getByRole("tab", { name: /Cruz/i }).click();
  await expect(page.getByText("Tus nueve energías te esperan")).toHaveCount(0);

  // Queda recordado: otra visita ya no pide el correo
  await page.reload();
  await page.fill('input[type="date"]', "1990-03-15");
  await page.click('button:has-text("Conocer mi Nahual")');
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 15000 });
  await page.getByRole("tab", { name: /Cruz/i }).click();
  await expect(page.getByText("Tus nueve energías te esperan")).toHaveCount(0);
});

test("energía de hoy muestra la luna", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/Luna .*·\s*\d+%|Cuarto .*·\s*\d+%/).first()).toBeVisible({ timeout: 15000 });
});

test("tarjeta para historia genera una imagen PNG 9:16", async ({ page }) => {
  await calcular(page);
  const descarga = page.waitForEvent("download");
  await page.getByRole("button", { name: /Tarjeta para mi historia/i }).click();
  const d = await descarga;
  expect(d.suggestedFilename()).toMatch(/^mi-nahual-7-aqabal\.png$/);
});

test("app instalable: manifest e íconos responden", async ({ request }) => {
  const m = await request.get("/manifest.webmanifest");
  expect(m.ok()).toBe(true);
  const json = await m.json();
  expect(json.display).toBe("standalone");
  for (const icon of json.icons) expect((await request.get(icon.src)).ok()).toBe(true);
  expect((await request.get("/offline.html")).ok()).toBe(true);
});

const routes = ["/nahuales", "/nahual/imox", "/kin", "/kin/1-imox", "/resultado/6-kat"];
for (const route of routes) {
  test(`ruta carga sin crash: ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push("pageerror: " + e.message));
    await page.goto(route, { waitUntil: "networkidle" });
    const rootSize = await page.evaluate(() => document.getElementById("root")?.innerHTML?.length || 0);
    expect(rootSize).toBeGreaterThan(400);
    expect(realErrors(errors)).toEqual([]);
  });
}
