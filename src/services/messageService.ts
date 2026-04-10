import { MessageModel } from "@/models/messageModel";
import { MessageRepository } from "@/repositories/messageRepository";

interface EmailJSPayload {
  service_id: string;
  template_id: string;
  user_id: string;
  accessToken: string | undefined;
  template_params: {
    from_name: string;
    to_name: string;
    from_email: string;
    message: string;
  };
}

export class MessageService {
  private repository: MessageRepository;

  constructor() {
    this.repository = new MessageRepository();
  }

  async saveMessage(name: string, email: string, message: string): Promise<void> {
    const newMessage = MessageModel.create(name, email, message);
    await this.repository.save(newMessage);
  }

  async sendEmail(name: string, email: string, message: string): Promise<void> {
    const serviceId = process.env.EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      throw new Error("Variables de entorno EmailJS no configuradas.");
    }

    const payload: EmailJSPayload = {
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        from_name: name,
        to_name: "PHD team",
        from_email: email,
        message,
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`EmailJS error: ${response.status}`);
    }
  }

  async getMessages() {
    return this.repository.getAll();
  }
}
