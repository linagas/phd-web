import { NextApiRequest, NextApiResponse } from "next";
import { z, ZodError } from "zod";
import { MessageService } from "@/services/messageService";
import { verifyRecaptcha } from "@/utils/recaptcha";

const contactSchema = z.object({
  user_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  user_email: z.string().email("El correo electrónico no es válido"),
  message: z.string().min(10, "El mensaje debe tener al menos 10 caracteres").max(2000),
  recaptchaToken: z.string().min(1, "El token de reCAPTCHA es obligatorio"),
});

export class MessageController {
  private service: MessageService;

  constructor() {
    this.service = new MessageService();
  }

  async handleContactForm(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
      res.setHeader("Allow", ["POST"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const { user_name, user_email, message, recaptchaToken } = contactSchema.parse(req.body);

      const isHuman = await verifyRecaptcha(recaptchaToken);
      if (!isHuman) {
        res.status(400).json({ error: "Verificación reCAPTCHA fallida." });
        return;
      }

      await Promise.all([
        this.service.saveMessage(user_name, user_email, message),
        this.service.sendEmail(user_name, user_email, message),
      ]);

      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: "Error al procesar la solicitud." });
    }
  }

  async getMessages(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      res.status(405).json({ error: `Método ${req.method} no permitido` });
      return;
    }

    try {
      const messages = await this.service.getMessages();
      res.status(200).json(messages);
    } catch {
      res.status(500).json({ error: "Error al obtener los mensajes." });
    }
  }
}
