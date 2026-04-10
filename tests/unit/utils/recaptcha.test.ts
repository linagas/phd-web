import { verifyRecaptcha } from "@/utils/recaptcha";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("verifyRecaptcha", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, RECAPTCHA_SECRET_KEY: "test-secret-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  it("debe retornar true cuando la verificación es exitosa", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { success: true, score: 0.9 },
    });

    const result = await verifyRecaptcha("valid-token");

    expect(result).toBe(true);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: "test-secret-key",
          response: "valid-token",
        },
      }
    );
  });

  it("debe retornar false cuando la verificación falla", async () => {
    mockedAxios.post.mockResolvedValue({
      data: { success: false },
    });

    const result = await verifyRecaptcha("invalid-token");

    expect(result).toBe(false);
  });

  it("debe retornar false cuando axios lanza error", async () => {
    mockedAxios.post.mockRejectedValue(new Error("Network error"));

    const result = await verifyRecaptcha("some-token");

    expect(result).toBe(false);
  });

  it("debe retornar false si falta RECAPTCHA_SECRET_KEY", async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;

    // Sin secretKey la función lanza error interno y retorna false
    const result = await verifyRecaptcha("token");

    expect(result).toBe(false);
  });
});
