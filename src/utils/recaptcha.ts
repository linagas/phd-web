interface RecaptchaVerifyResponse {
  success: boolean;
  score: number;
  action: string;
  challenge_ts: string;
  hostname: string;
  "error-codes"?: string[];
}

/**
 * Verifica el token de reCAPTCHA v3 con la API de Google.
 * Requiere score > 0.5 para considerar válida la solicitud.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    console.error("RECAPTCHA_SECRET_KEY no está configurada.");
    return false;
  }

  try {
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: secretKey, response: token }).toString(),
      }
    );

    const data: RecaptchaVerifyResponse = await response.json();
    return data.success && data.score > 0.5;
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return false;
  }
}
