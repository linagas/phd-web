import { test, expect } from "@playwright/test";
import { SignJWT } from "jose";

/**
 * Cubre `qp-admin-console` — Requirement: Admin Session Guard.
 * El guard real vive en 3 capas (D7): `middleware.ts`, el guard de servidor en
 * `(console)/layout.tsx`, y `requireAdminSession` por endpoint. Este spec
 * verifica el comportamiento observable end-to-end de esas capas combinadas.
 */

const SESSION_COOKIE_NAME = "qp_admin_session";
const AUTH_SECRET = process.env.QUALITY_PULSE_AUTH_SECRET ?? "e2e-test-secret-not-for-prod";

async function signValidSessionToken(email: string): Promise<string> {
  const secretKey = new TextEncoder().encode(AUTH_SECRET);
  return new SignJWT({ email, purpose: "session" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(secretKey);
}

test.describe("Guard de /administracion (defensa en profundidad)", () => {
  test("redirige a /administracion/ingresar sin sesión (Dashboard)", async ({ page }) => {
    await page.goto("/administracion");
    await expect(page).toHaveURL(/\/administracion\/ingresar/);
  });

  test("redirige a /administracion/ingresar sin sesión (Clientes)", async ({ page }) => {
    await page.goto("/administracion/clientes");
    await expect(page).toHaveURL(/\/administracion\/ingresar/);
  });

  test("redirige a /administracion/ingresar sin sesión (Catálogo)", async ({ page }) => {
    await page.goto("/administracion/catalogo");
    await expect(page).toHaveURL(/\/administracion\/ingresar/);
  });

  test("redirige a /administracion/ingresar sin sesión (Revisar publicación)", async ({ page }) => {
    await page.goto("/administracion/clientes/cliente-cualquiera/revisar");
    await expect(page).toHaveURL(/\/administracion\/ingresar/);
  });

  test("la página de login no redirige y muestra el formulario de acceso", async ({ page }) => {
    await page.goto("/administracion/ingresar");
    await expect(page).toHaveURL(/\/administracion\/ingresar/);
    await expect(
      page.getByRole("heading", { name: /Acceso de administrador/i })
    ).toBeVisible();
  });

  test("con sesión válida, el Dashboard renderiza el sidebar con Dashboard/Clientes/Catálogo", async ({
    page,
    context,
  }) => {
    const token = await signValidSessionToken("admin-e2e@phd.cl");
    await context.addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: token,
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/administracion");

    await expect(page).toHaveURL(/\/administracion$/);
    await expect(page.getByRole("link", { name: /^Dashboard$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Clientes$/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /^Catálogo$/i })).toBeVisible();
  });

  test("con sesión válida, Resultados/Auditoría/Soporte son placeholders no navegables", async ({
    page,
    context,
  }) => {
    const token = await signValidSessionToken("admin-e2e@phd.cl");
    await context.addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: token,
        domain: "localhost",
        path: "/",
      },
    ]);

    await page.goto("/administracion");

    await expect(page.getByText(/Próximamente/i).first()).toBeVisible();
    // No deben existir como links navegables (a diferencia de Dashboard/Clientes/Catálogo).
    await expect(page.getByRole("link", { name: /^Resultados$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Auditoría$/i })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /^Soporte$/i })).toHaveCount(0);
  });
});
