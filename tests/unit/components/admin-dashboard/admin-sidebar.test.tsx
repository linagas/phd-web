/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("next/navigation", () => ({
  usePathname: () => "/administracion",
}));

import AdminSidebar from "@/app/administracion/(console)/components/admin-sidebar";

describe("AdminSidebar", () => {
  it("keeps the PHD logo linked to home", () => {
    render(<AdminSidebar adminEmail="admin@phdchile.cl" />);

    const phdLink = screen.getByRole("link", { name: /phd/i });
    expect(phdLink).toHaveAttribute("href", "/");
  });

  it("keeps the Quality Pulse logo linked to the module home", () => {
    render(<AdminSidebar adminEmail="admin@phdchile.cl" />);

    const qpLink = screen.getByRole("link", { name: /quality.*pulse/i });
    expect(qpLink).toHaveAttribute("href", "/quality-pulse");
  });
});
