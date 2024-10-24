"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import useScrollToSection from "@/hooks/useScrollToSection";
import { load } from "recaptcha-v3";

export default function Contact() {
  const { sectionRef } = useScrollToSection("section-contact");
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });
  const [isClient, setIsClient] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  useEffect(() => {
    // Cargamos el script de reCAPTCHA solo en el cliente
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js`;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // Establecemos que estamos en el cliente
    setIsClient(true);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/saveMessage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
      }),
    });

    if (res.ok) {
      setSubmitted(true);
    } else {
      alert("Error al guardar el mensaje. Inténtalo de nuevo.");
    }
  };

  return (
    <section
      id="section-contact"
      ref={sectionRef}
      className="flex flex-col md:flex-row py-12 md:py-24 justify-start items-center md:items-start"
    >
      <article className="px-4 md:pl-16 w-full md:w-2/3 mb-8 md:mb-0">
        <h2 className="text-2xl md:text-4xl text-left font-bold text-blue-2">
          Contáctanos
        </h2>
        <p
          className="text-left text-gray-700 mt-4"
          style={{ color: "#21323F", letterSpacing: "0px", opacity: 1 }}
        >
          Estamos aqui para ayudarte a mejorar la calidad de tu software llena
          el formulario y nos pondremos en contacto contigo.
        </p>
        {submitted ? (
          <p className="text-green-500">
            ¡Tu mensaje ha sido guardado exitosamente! Pronto nos pondremos en
            contacto contigo.
          </p>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="mt-8 w-full flex flex-col items-end"
            >
              <input
                name="user_name"
                id="user_name"
                value={formData.user_name}
                onChange={handleChange}
                type="text"
                placeholder="Ingresa tu nombre"
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                required
              />

              <input
                name="user_email"
                id="user_email"
                value={formData.user_email}
                onChange={handleChange}
                type="email"
                placeholder="Ingresa tu correo"
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                required
              />
              <textarea
                placeholder="Ingresa tu mensaje"
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                required
              ></textarea>
              {isClient && (
                <div
                  className="g-recaptcha"
                  data-sitekey="6LdqNWgqAAAAAKfsZuQUgEsFj9cXzTgcRRc41oZ5"
                ></div>
              )}

              <button
                className="justify-self-end h-9 w-32 bg-blue-1 text-white py-2 px-8 rounded-[4px]"
                type="submit"
              >
                Enviar
              </button>
            </form>

            <p className="text-gray-700 mt-4">
              ¿Hay algo adicional que te gustar&iacute;a saber? Puedes enviarnos
              un correo a{" "}
              <a href="mailto:contacto@phdchile.cl">contacto@phdchile.cl</a>
            </p>
          </>
        )}
      </article>
      <article className="flex items-center w-full md:w-2/3">
        <div className="relative w-full max-w-[350px] mx-auto overflow-hidden aspect-square">
          <Image
            src={"/assets/phd-black@300x.png"}
            width={530}
            height={520}
            alt="Software Quality Services"
            className="rounded-lg"
            style={{
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "bottom",
            }}
            data-aos="fade-up"
          />
        </div>
      </article>
    </section>
  );
}
