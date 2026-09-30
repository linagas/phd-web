import { QualityPulseClientModel } from "@/models/quality-pulse/client-model";

describe("QualityPulseClientModel.create", () => {
  it("crea un cliente con isPublished en false y sin datos de publicación", () => {
    const client = QualityPulseClientModel.create("acme", "Acme", "admin@phd.cl");

    expect(client.isPublished).toBe(false);
    expect(client.publishedBy).toBeUndefined();
    expect(client.publishedAt).toBeUndefined();
  });

  it("conserva clientKey, clientName y registeredBy tal como se reciben", () => {
    const client = QualityPulseClientModel.create("otra-empresa", "Otra Empresa", "ops@phd.cl");

    expect(client.clientKey).toBe("otra-empresa");
    expect(client.clientName).toBe("Otra Empresa");
    expect(client.registeredBy).toBe("ops@phd.cl");
  });
});
