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

test("flujo: recibir lectura por email (nombre, email y WhatsApp obligatorios)", async ({ page }) => {
  await page.goto("/");
  await page.fill('input[type="date"]', "1990-05-15");
  await page.click('button:has-text("Conocer mi Nahual")');
  await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 15000 });

  await page.getByRole("button", { name: /Recibir mi lectura por email/i }).click();
  await expect(page.locator('input[placeholder="Tu nombre"]')).toBeVisible();

  await page.fill('input[placeholder="Tu nombre"]', "QA Smoke");
  await page.fill('input[type="email"]', "qa.smoke@example.com");
  await page.fill('#telefono', "12345678");
  await page.click("#terms");
  await page.click('button:has-text("Enviarme mi lectura"), button:has-text("Revelar mi lectura")');

  // Confirmación (enviado o guardado, según haya proveedor de email).
  await expect(page.getByText(/Te enviamos tu lectura|quedó guardada|guardada/i).first()).toBeVisible({ timeout: 10000 });
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
