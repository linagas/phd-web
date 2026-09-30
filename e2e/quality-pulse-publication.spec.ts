import { test, expect } from "@playwright/test";
import { SignJWT } from "jose";

/**
 * Cubre `qp-results-publication` (spec) — Requirement: Public Results Gate.
 * El gate real vive en `AssessmentService.getPublicStatus` (D4): sirve
 * `answeredProfiles` siempre, pero `submissions` solo si `isPublished && 4/4`.
 * Este spec verifica el comportamiento observable end-to-end: cliente
 * respondido pero no publicado ⇒ "Resultados en revisión"; tras publish ⇒
 * resultados completos; y que el gate se sostiene incluso llamando la API
 * directo (bypass de UI).
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

// Espejo de `src/utils/quality-pulse/client-key.ts` para nombres ASCII de
// prueba (sin diacríticos), evita importar código de servidor en el spec.
function toClientKey(clientName: string): string {
  return clientName.trim().toLocaleLowerCase("es-CL").replace(/\s+/g, " ");
}

function uniqueClientName(label: string): string {
  return `E2E Pub ${label} ${Date.now()}`;
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

async function answerAllProfiles(
  page: import("@playwright/test").Page,
  clientName: string
): Promise<void> {
  for (const profile of PROFILES) {
    const res = await page.request.post("/api/quality-pulse/assessments", {
      data: { profile, organization: clientName, answers: { "e2e-question": 0 } },
    });
    expect(res.ok()).toBeTruthy();
  }
}

test.describe("Gate de publicación de resultados (qp-results-publication)", () => {
  test("cliente 4/4 sin publicar muestra 'Resultados en revisión'; tras publicar, muestra los resultados", async ({
    page,
    context,
  }) => {
    const token = await signValidSessionToken(ADMIN_EMAIL);
    await context.addCookies([
      { name: SESSION_COOKIE_NAME, value: token, domain: "localhost", path: "/" },
    ]);

    const clientName = uniqueClientName("Review");
    await registerClient(page, clientName);
    await answerAllProfiles(page, clientName);

    await page.goto(`/quality-pulse/resultados?cliente=${encodeURIComponent(clientName)}`);
    await expect(page.getByText(/Resultados en revisión/i)).toBeVisible();
    await expect(page.getByText(/Quality Health Score/i)).toHaveCount(0);

    const publishRes = await page.request.post("/api/quality-pulse/admin/publication", {
      data: { clientKey: toClientKey(clientName) },
    });
    expect(publishRes.ok()).toBeTruthy();

    await page.goto(`/quality-pulse/resultados?cliente=${encodeURIComponent(clientName)}`);
    await expect(page.getByText(/Quality Health Score/i)).toBeVisible();
    await expect(page.getByText(/Resultados en revisión/i)).toHaveCount(0);
  });

  test("bypass directo de la API en un cliente no publicado no devuelve respuestas", async ({
    page,
    context,
  }) => {
    const token = await signValidSessionToken(ADMIN_EMAIL);
    await context.addCookies([
      { name: SESSION_COOKIE_NAME, value: token, domain: "localhost", path: "/" },
    ]);

    const clientName = uniqueClientName("Bypass");
    await registerClient(page, clientName);
    await answerAllProfiles(page, clientName);

    // Llamada directa al endpoint público, sin pasar por la UI de resultados.
    const res = await page.request.get(
      `/api/quality-pulse/assessments?organization=${encodeURIComponent(clientName)}`
    );
    expect(res.ok()).toBeTruthy();
    const body = await res.json();

    expect(body.submissions).toBeNull();
    expect(body.isPublished).toBe(false);
    expect(JSON.stringify(body)).not.toContain("answers");
    // El estado "respondido" por perfil sigue siendo público (lo necesita el
    // flujo del cuestionario) — solo las respuestas/resultados están ocultas.
    expect(body.answeredProfiles).toEqual(expect.arrayContaining(PROFILES as unknown as string[]));
  });
});
