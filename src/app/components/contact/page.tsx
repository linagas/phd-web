"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import useScrollToSection from "@/hooks/useScrollToSection";

export default function Contact() {
  const { sectionRef } = useScrollToSection("section-contact");
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    user_phone: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMsg("");

      if (!executeRecaptcha) {
        setErrorMsg("reCAPTCHA no está listo. Inténtalo de nuevo.");
        return;
      }

      setIsLoading(true);
      try {
        const recaptchaToken = await executeRecaptcha("contact_form");
        const messageWithPhone = formData.user_phone
          ? `Tel: ${formData.user_phone} — ${formData.message}`
          : formData.message;

        const res = await fetch("/api/saveMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_name: formData.user_name,
            user_email: formData.user_email,
            message: messageWithPhone,
            recaptchaToken,
          }),
        });

        if (res.ok) {
          setSubmitted(true);
        } else {
          const body = await res.json().catch(() => ({}));
          setErrorMsg(
            body.error ?? "Error al enviar el mensaje. Inténtalo de nuevo."
          );
        }
      } catch {
        setErrorMsg("Error de red. Inténtalo de nuevo.");
      } finally {
        setIsLoading(false);
      }
    },
    [executeRecaptcha, formData]
  );

  return (
    <section
      id="section-contact"
      ref={sectionRef}
      className="scroll-mt-20 flex flex-col md:flex-row py-12 md:py-24 justify-start items-center md:items-start"
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
          <div className="mt-6 flex flex-col items-start gap-4">
            <p className="text-green-500">
              ¡Tu mensaje ha sido guardado exitosamente! Pronto nos pondremos en
              contacto contigo.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setFormData({ user_name: "", user_email: "", user_phone: "", message: "" });
              }}
              className="h-9 w-32 bg-blue-1 text-white py-2 px-8 rounded-[4px]"
            >
              Volver
            </button>
          </div>
        ) : (
          <>
            <form
              onSubmit={handleSubmit}
              className="mt-8 w-full flex flex-col items-end"
            >
              <label htmlFor="user_name" className="sr-only">
                Nombre
              </label>
              <input
                name="user_name"
                id="user_name"
                value={formData.user_name}
                onChange={handleChange}
                type="text"
                placeholder="Ingresa tu nombre"
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                required
                disabled={isLoading}
              />

              <label htmlFor="user_email" className="sr-only">
                Correo electrónico
              </label>
              <input
                name="user_email"
                id="user_email"
                value={formData.user_email}
                onChange={handleChange}
                type="email"
                placeholder="Ingresa tu correo"
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                required
                disabled={isLoading}
              />

              <label htmlFor="user_phone" className="sr-only">
                Teléfono
              </label>
              <input
                name="user_phone"
                id="user_phone"
                value={formData.user_phone}
                onChange={handleChange}
                type="tel"
                placeholder="Ingresa tu teléfono"
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                disabled={isLoading}
              />

              <label htmlFor="message" className="sr-only">
                Mensaje
              </label>
              <textarea
                placeholder="Ingresa tu mensaje"
                name="message"
                id="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full mb-4 p-4 rounded-[12px] border border-black-2 border-4"
                required
                disabled={isLoading}
              ></textarea>

              {errorMsg && (
                <p role="alert" className="text-red-500 w-full mb-2">
                  {errorMsg}
                </p>
              )}

              <button
                className="justify-self-end h-9 w-32 bg-blue-1 text-white py-2 px-8 rounded-[4px] disabled:opacity-50 disabled:cursor-not-allowed"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Conversemos"}
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
