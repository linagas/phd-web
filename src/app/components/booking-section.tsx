"use client";
import React, { useState, useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

export default function BookingSection() {
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (data: typeof formData) => {
    const errors: Record<string, string> = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[+]?[\d\s\-().]{7,20}$/;

    if (!emailRegex.test(data.user_email)) {
      errors.user_email = "Ingresa un correo electrónico válido.";
    }
    if (data.user_phone && !phoneRegex.test(data.user_phone)) {
      errors.user_phone = "Ingresa un número de teléfono válido.";
    }
    if (data.message.length > 300) {
      errors.message = "El mensaje no puede superar los 300 caracteres.";
    }
    return errors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrorMsg("");

      const errors = validate(formData);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }

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
          setErrorMsg(body.error ?? "Error al enviar. Inténtalo de nuevo.");
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
    <section id="bookings" className="bg-phd-dark py-24 px-4 sm:px-8 lg:px-16">
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Columna izquierda — descripción */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <span className="w-fit text-xs font-bold tracking-[0.2em] uppercase border border-phd-cyan/30 text-phd-cyan px-4 py-1.5 rounded-full">
              Fricción Cero con Microsoft Bookings
            </span>
            <h2 className="font-heading font-bold text-3xl md:text-4xl text-white leading-tight">
              Inicie hoy con su{" "}
              <span className="bg-gradient-to-r from-phd-cyan to-phd-pink bg-clip-text text-transparent">
                Quality Pulse
              </span>
            </h2>
            <p className="text-slate-400 leading-relaxed">
              Reserve directamente en el calendario de nuestros socios consultores
              líderes en solo 15 minutos de forma nativa.
            </p>
            <ul className="flex flex-col gap-4 mt-2">
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-phd-cyan mt-0.5 shrink-0">🔒</span>
                <span>
                  <strong className="text-white">Privacidad total de datos:</strong>{" "}
                  Almacenamiento 100% nativo bajo tu ecosistema seguro de Microsoft Azure.
                </span>
              </li>
              <li className="flex items-start gap-3 text-sm text-slate-300">
                <span className="text-phd-cyan mt-0.5 shrink-0">✉️</span>
                <span>
                  <strong className="text-white">Notificación Automatizada:</strong>{" "}
                 Recibiras pronto nuestra respuesta!
                </span>
              </li>
            </ul>
          </div>

          {/* Columna derecha — formulario */}
          <div className="lg:col-span-7">
            <div className="phd-glass p-8 flex flex-col gap-6">
              {/* Header del formulario */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <span className="text-xs font-mono text-slate-400">
                  ⊞ MS Bookings & Forms Integrated
                </span>
                <span className="text-xs text-green-400 border border-green-400/20 bg-green-400/10 px-3 py-1 rounded-full">
                  Secure Cloud Connection
                </span>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <p className="text-white font-semibold text-lg">
                    ¡Sesión agendada!
                  </p>
                  <p className="text-slate-400 text-sm">
                    Recibirás nuestra respuesta próximamente.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ user_name: "", user_email: "", user_phone: "", message: "" });
                    }}
                    className="mt-2 px-6 py-2 border border-white/20 text-white text-sm rounded-full hover:bg-white/10 transition-colors"
                  >
                    Volver
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  <div className="flex flex-col gap-2">
                    <label htmlFor="book_name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Nombre
                    </label>
                    <input
                      id="book_name"
                      name="user_name"
                      type="text"
                      placeholder="Ej: Francisco Javier"
                      value={formData.user_name}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="bg-phd-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-phd-cyan/50 transition-colors disabled:opacity-50"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="book_email" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </label>
                    <input
                      id="book_email"
                      name="user_email"
                      type="email"
                      placeholder="Ej: francisco@empresa.com"
                      value={formData.user_email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className={`bg-phd-dark border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-phd-cyan/50 transition-colors disabled:opacity-50 ${fieldErrors.user_email ? "border-red-400/60" : "border-white/10"}`}
                    />
                    {fieldErrors.user_email && (
                      <p role="alert" className="text-red-400 text-xs">{fieldErrors.user_email}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="book_phone" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Teléfono
                    </label>
                    <input
                      id="book_phone"
                      name="user_phone"
                      type="tel"
                      placeholder="Ej: +56 9 1234 5678"
                      value={formData.user_phone}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`bg-phd-dark border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-phd-cyan/50 transition-colors disabled:opacity-50 ${fieldErrors.user_phone ? "border-red-400/60" : "border-white/10"}`}
                    />
                    {fieldErrors.user_phone && (
                      <p role="alert" className="text-red-400 text-xs">{fieldErrors.user_phone}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="book_message" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Mensaje
                    </label>
                    <textarea
                      id="book_message"
                      name="message"
                      placeholder="¿En qué podemos ayudarte?"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      rows={4}
                      maxLength={300}
                      className={`bg-phd-dark border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-phd-cyan/50 transition-colors disabled:opacity-50 resize-none ${fieldErrors.message ? "border-red-400/60" : "border-white/10"}`}
                    />
                    <div className="flex justify-between items-center">
                      {fieldErrors.message
                        ? <p role="alert" className="text-red-400 text-xs">{fieldErrors.message}</p>
                        : <span />
                      }
                      <span className={`text-xs ${formData.message.length >= 300 ? "text-red-400" : "text-slate-500"}`}>
                        {formData.message.length}/300
                      </span>
                    </div>
                  </div>

                  {errorMsg && (
                    <p role="alert" className="text-red-400 text-sm">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-phd-cyan via-phd-pink to-phd-purple text-white font-bold py-4 rounded-full transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? "Enviando..." : "Conversemos"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
