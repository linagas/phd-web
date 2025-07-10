import { NextApiRequest, NextApiResponse } from "next";
import { MessageService } from "@/services/messageService";
import { verifyRecaptcha } from "@/utils/recaptcha";
import { z } from "zod";

export class MessageController {
  private service: MessageService;

  constructor() {
    this.service = new MessageService();
  }

  async saveMessage(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Método no permitido" });
    }

    const schema = z.object({
      name: z.string().min(1, "El nombre es obligatorio"),
      email: z.string().email("El correo electrónico no es válido"),
      message: z.string().min(1, "El mensaje es obligatorio"),
      recaptchaToken: z.string().min(1, "El token de reCAPTCHA es obligatorio"),
    });

    try {
      const { name, email, message, recaptchaToken } = schema.parse(req.body);

      // Verificar el token de reCAPTCHA
      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        return res.status(400).json({ error: "Verificación de reCAPTCHA fallida" });
      }

      await this.service.saveMessage(name, email, message);
      res.status(200).json({ message: "Mensaje guardado correctamente" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Error en saveMessage:", error);
      res.status(500).json({ error: "Error al guardar el mensaje" });
    }
  }

  async getMessages(req: NextApiRequest, res: NextApiResponse) {
    try {
      const messages = await this.service.getMessages();
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error en getMessages:", error);
      res.status(500).json({ error: "Error al obtener los mensajes" });

    }
  }
}
