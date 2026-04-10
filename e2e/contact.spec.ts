import { test, expect } from "@playwright/test";

test.describe("Formulario de contacto", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // Scroll al formulario de contacto (si existe en el home)
  });

  test("debe mostrar la sección de contacto en el home", async ({ page }) => {
    const contactSection = page.locator("#section-contact").first();

    await expect(contactSection).toBeAttached();
  });

  test("el botón CONTACTO del header debe hacer scroll a la sección", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /CONTACTO/i }).click();

    // Esperar un momento para el scroll suave
    await page.waitForTimeout(500);

    const contactSection = page.locator("#section-contact").first();
    await expect(contactSection).toBeInViewport();
  });
});
