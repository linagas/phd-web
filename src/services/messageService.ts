import { MessageModel } from "@/models/messageModel";
import { MessageRepository } from "@/repositories/messageRepository";

export class MessageService {
  private repository: MessageRepository;

  constructor() {
    this.repository = new MessageRepository();
  }

  async saveMessage(name: string, email: string, message: string) {
    console.time("MessageModel.create");
    const newMessage = MessageModel.create(name, email, message);
    await this.repository.save(newMessage);
    console.timeEnd("MessageModel.create");
  }

  async getMessages() {
    return await this.repository.getAll();
  }
}
