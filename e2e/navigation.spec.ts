import { test, expect } from "@playwright/test";

test.describe("Navegación principal", () => {
  test("debe cargar la página principal con el hero", async ({ page }) => {
    await page.goto("/");

    // Verifica que el título del hero esté presente
    await expect(
      page.getByRole("heading", { name: /calidad de software/i }).first()
    ).toBeVisible();
  });

  test("debe mostrar el header con logo y navegación", async ({ page }) => {
    await page.goto("/");

    // Logo
    await expect(page.getByAltText(/PHD/i).first()).toBeVisible();

    // Links de navegación (desktop)
    await expect(page.getByRole("link", { name: /SERVICIOS/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /NOSOTROS/i })).toBeVisible();
  });

  test("debe navegar a la página de servicios", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /SERVICIOS/i }).click();

    await expect(page).toHaveURL(/\/companies/);
  });

  test("debe navegar a la página nosotros", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /NOSOTROS/i }).click();

    await expect(page).toHaveURL(/\/about/);
  });

  test("debe mostrar 404 en rutas inexistentes", async ({ page }) => {
    await page.goto("/ruta-inexistente");

    // La página no-found debe renderizarse
    await expect(page.locator("body")).toContainText(/404|no encontr/i);
  });
});
