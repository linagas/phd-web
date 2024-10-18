import { NextApiRequest, NextApiResponse } from "next";
import { MessageService } from "@/services/messageService";

export class MessageController {
  private service: MessageService;

  constructor() {
    this.service = new MessageService();
  }

  async saveMessage(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === "POST") {
      const { name, email, message, recaptchaToken } = req.body;

      try {
        // Realizar la verificación de reCAPTCHA y el guardado del mensaje en paralelo
        const [isHuman] = await Promise.all([
          verifyRecaptcha(recaptchaToken),
          this.service.saveMessage(name, email, message),
        ]);

        if (!isHuman) {
          return res
            .status(400)
            .json({ error: "Verificación reCAPTCHA fallida" });
        }

        res.status(200).json({ message: "Mensaje guardado correctamente" });
      } catch (error) {
        console.error("Error al guardar el mensaje:", error);
        res.status(500).json({ error: "Error al guardar el mensaje" });
      }
    } else {
      res.status(405).json({ message: "Método no permitido" });
    }
  }

  async getMessages(req: NextApiRequest, res: NextApiResponse) {
    try {
      const messages = await this.service.getMessages();
      res.status(200).json(messages);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener los mensajes" });
    }
  }
}

async function verifyRecaptcha(token: string): Promise<boolean> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Tiempo de espera de 5 segundos

    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId); // Limpiar el timeout si la respuesta es rápida
    const data = await response.json();

    const { success, score } = data;
    console.log("Verificación reCAPTCHA:", data);

    return success && score > 0.5;
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      console.error("Timeout en la verificación de reCAPTCHA");
    } else {
      console.error("Error al verificar reCAPTCHA:", error);
    }
    return false;
  }
}
