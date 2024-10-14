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
      // Verificar el token de reCAPTCHA
      const isHuman = await verifyRecaptcha(recaptchaToken);

      try {
        await this.service.saveMessage(name, email, message);
        res.status(200).json({ message: "Mensaje guardado correctamente" });
      } catch (error) {
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
    const response = await fetch(
      `https://www.google.com/recaptcha/api/siteverify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `secret=${secretKey}&response=${token}`,
      }
    );

    const data = await response.json();

    const { success, score } = data;
    console.log("Verificación reCAPTCHA:", data);

    // Considera exitoso si la verificación es exitosa y el score es mayor a 0.5
    return success && score > 0.5;
  } catch (error) {
    console.error("Error al verificar reCAPTCHA:", error);
    return false;
  }
}
