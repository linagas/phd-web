import { test, expect } from "@playwright/test";
import { SignJWT } from "jose";

/**
 * Cubre `qp-admin-clients-table` (spec) — smoke del rediseño visual de
 * `/administracion/clientes`: expandir una fila de la tabla, confirmar que
 * el reset por perfil funciona, y publicar un cliente 4/4 registrado.
 * Sigue el mismo patrón de auth/setup que `admin-guard.spec.ts` y
 * `quality-pulse-publication.spec.ts` (cookie de sesión firmada + setup vía
 * `page.request`, interacción real vía UI para lo que se está verificando).
 *
 * Migración intencional (Fase 4, spec relajado `qp-admin-clients-table` /
 * `qp-admin-publish-review`): "Publicar" en la fila ya NO dispara un POST
 * directo — es un link hacia `/administracion/clientes/{clientKey}/revisar`
 * (`PublishReviewView`, Fase 3), que muestra el detalle de resultados y
 * requiere "Confirmar publicación" antes de publicar. La aserción vieja de
 * POST directo desde la tabla se retira acá a propósito.
 */

const SESSION_COOKIE_NAME = "qp_admin_session";
const AUTH_SECRET = process.env.QUALITY_PULSE_AUTH_SECRET ?? "e2e-test-secret-not-for-prod";
const ADMIN_EMAIL = "admin-e2e@phd.cl";
const PROFILES = ["Calidad", "Desarrollo", "Gestión", "Negocio"] as const;

async function signValidSessionToken(email: string): Promise<string> {
  const secretKey = new TextEncoder().encode(AUTH_SECRET);
  return new SignJWT({ email, purpose: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey);
}

function uniqueClientName(label: string): string {
  return `E2E Clientes ${label} ${Date.now()}`;
}

async function registerClient(
  page: import("@playwright/test").Page,
  clientName: string
): Promise<void> {
  const res = await page.request.post("/api/quality-pulse/admin/clients", {
    data: { clientName },
  });
  expect(res.ok()).toBeTruthy();
}

async function answerProfile(
  page: import("@playwright/test").Page,
  clientName: string,
  profile: (typeof PROFILES)[number]
): Promise<void> {
  const res = await page.request.post("/api/quality-pulse/assessments", {
    data: { profile, organization: clientName, answers: { "e2e-question": 0 } },
  });
  expect(res.ok()).toBeTruthy();
}

async function answerAllProfiles(
  page: import("@playwright/test").Page,
  clientName: string
): Promise<void> {
  for (const profile of PROFILES) {
    await answerProfile(page, clientName, profile);
  }
}

async function loginAsAdmin(context: import("@playwright/test").BrowserContext): Promise<void> {
  const token = await signValidSessionToken(ADMIN_EMAIL);
  await context.addCookies([
    { name: SESSION_COOKIE_NAME, value: token, domain: "localhost", path: "/" },
  ]);
}

test.describe("Smoke de /administracion/clientes (qp-admin-clients-table)", () => {
  test("expande una fila, reinicia un perfil individual y publica un cliente 4/4 registrado", async ({
    page,
    context,
  }) => {
    await loginAsAdmin(context);

    // Cliente A: solo un perfil respondido — usado para probar el reset por perfil.
    const clientA = uniqueClientName("ResetPerfil");
    await registerClient(page, clientA);
    await answerProfile(page, clientA, "Calidad");

    // Cliente B: 4/4 respondido y registrado — usado para probar "Publicar".
    const clientB = uniqueClientName("Publicar");
    await registerClient(page, clientB);
    await answerAllProfiles(page, clientB);

    await page.goto("/administracion/clientes");
    await expect(page.getByRole("heading", { name: "Clientes" })).toBeVisible();

    // --- Expandir la fila del Cliente A y confirmar reset por perfil ---
    const rowA = page.getByRole("row", { name: new RegExp(clientA) });
    await rowA.click();

    const answeredBadge = page.getByText("Respondido").first();
    await expect(answeredBadge).toBeVisible();

    await page.getByRole("button", { name: "Reiniciar perfil" }).click();
    await page.getByRole("button", { name: "Confirmar" }).click();

    await expect(page.getByText("Respondido")).toHaveCount(0);
    await expect(page.getByText("Pendiente").first()).toBeVisible();

    // --- Publicar el Cliente B (4/4, registrado): link -> revisión -> confirmar ---
    const rowB = page.getByRole("row", { name: new RegExp(clientB) });
    const publishLink = rowB.getByRole("link", { name: "Publicar" });
    await expect(publishLink).toBeVisible();
    await publishLink.click();

    await expect(page).toHaveURL(/\/administracion\/clientes\/.+\/revisar$/);
    await expect(page.getByText(/Quality Health Score/i)).toBeVisible();

    const confirmButton = page.getByRole("button", { name: "Confirmar publicación" });
    await expect(confirmButton).toBeVisible();
    await confirmButton.click();

    await expect(page.getByText("Publicado")).toBeVisible();
  });
});
