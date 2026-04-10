import { MessageModel } from "@/models/messageModel";

describe("MessageModel", () => {
  describe("create", () => {
    it("debe crear un mensaje con los campos proporcionados", () => {
      const msg = MessageModel.create("Juan", "juan@test.com", "Hola mundo");

      expect(msg.name).toBe("Juan");
      expect(msg.email).toBe("juan@test.com");
      expect(msg.message).toBe("Hola mundo");
      expect(msg.createdAt).toBeInstanceOf(Date);
    });

    it("debe asignar la fecha actual como createdAt", () => {
      const before = new Date();
      const msg = MessageModel.create("Ana", "ana@test.com", "Test");
      const after = new Date();

      expect(msg.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(msg.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("constructor", () => {
    it("debe instanciar con propiedades públicas", () => {
      const model = new MessageModel("Luis", "luis@test.com", "Mensaje");

      expect(model.name).toBe("Luis");
      expect(model.email).toBe("luis@test.com");
      expect(model.message).toBe("Mensaje");
    });
  });
});
