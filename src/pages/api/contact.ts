// pages/api/contact.ts
import type { NextApiRequest, NextApiResponse } from "next";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(process.env.SENDGRID_API_KEY || "");

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("req.method", req.method);
  if (req.method === "POST") {
    const { name, email, message } = req.body;

    try {
      // Configurar el correo
      await sendgrid.send({
        to: "tucorreo@example.com", // Reemplaza con tu correo
        from: "noreply@tudominio.com", // Reemplaza con el correo verificado en SendGrid
        subject: `Nuevo mensaje de contacto de ${name}`,
        html: `
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message}</p>
        `,
      });

      // Respuesta en caso de éxito
      res.status(200).json({ message: "Correo enviado" });
    } catch (error) {
      // Respuesta en caso de error
      res.status(500).json({ error: "Error al enviar el correo" });
    }
  } else {
    res.status(405).json({ message: "Método no permitido" });
  }
}
