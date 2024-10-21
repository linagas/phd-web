import { MessageController } from "@/controllers/messageController";
import emailjs from "@emailjs/browser";
import { access } from "fs";

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const serviceId = process.env.EMAILJS_SERVICE_ID as string;
  const templateId = process.env.EMAILJS_TEMPLATE_ID as string;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY as string;

  const data = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: process.env.EMAILJS_PRIVATE_KEY,
    template_params: {
      from_name: req.body.user_name,
      to_name: "PHD team",
      replay_to: req.body.user_email,
      message: req.body.message,
    },
  };

  if (req.method === "POST") {
    try {
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      console.log("EmailJS response:", response);

      return res.status(200).json({ success: true, response });
    } catch (error) {
      console.error("Error en la API:", error);
      return res
        .status(500)
        .json({ success: false, error: "Internal Server Error" });
    }
  } else {
    // Si no es POST, enviar un error 405
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
