export interface Message {
  name: string;
  email: string;
  message: string;
  createdAt: Date;
}

export class MessageModel {
  constructor(
    public name: string,
    public email: string,
    public message: string
  ) {}

  static create(name: string, email: string, message: string): Message {
    return {
      name,
      email,
      message,
      createdAt: new Date(),
    };
  }
}
