import axios from "axios";

/**
 * Verifica el token de reCAPTCHA con el servicio de Google.
 * @param token - El token de reCAPTCHA proporcionado por el cliente.
 * @returns {Promise<boolean>} - Retorna true si la verificación es exitosa, de lo contrario false.
 */
export async function verifyRecaptcha(token: string): Promise<boolean> {
  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      throw new Error("La clave secreta de reCAPTCHA no está configurada.");
    }

    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    return response.data.success;
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return false;
  }
}
