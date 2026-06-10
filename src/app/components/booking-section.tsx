"use client";
import React, { useState, useCallback } from "react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";

const DAYS = [
  { label: "Lun", day: "01" },
  { label: "Mar", day: "02" },
  { label: "Mié", day: "03" },
  { label: "Jue", day: "04" },
  { label: "Vie", day: "05" },
];

const TIME_SLOTS = ["09:00 AM", "11:30 AM"];

const PAIN_OPTIONS = [
  "Retrabajo y pérdida de tiempo",
  "Bugs en producción recurrentes",
  "Baja cobertura de pruebas",
  "Adopción de IA sin métricas",
  "Falta de cultura de calidad",
];


export default function BookingSection() {
  const { executeRecaptcha } = useGoogleReCaptcha();

  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState("02");
  const [selectedTime, setSelectedTime] = useState("11:30 AM");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        const res = await fetch("/api/saveMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, recaptchaToken }),
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
                  Reciba al instante el link seguro de MS Teams en su correo.
                </span>
              </li>
            </ul>
          </div>

          {/* Columna derecha — formulario */}
          <div className="lg:col-span-7">
            <div className="phd-glass p-8 flex flex-col gap-6">
              {/* Header del formulario */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400">
                    ⊞ MS Bookings & Forms Integrated
                  </span>
                </div>
                <span className="text-xs text-green-400 border border-green-400/20 bg-green-400/10 px-3 py-1 rounded-full">
                  Secure Cloud Connection
                </span>
              </div>

              {submitted ? (
                <div className="flex flex-col items-center gap-4 py-8 text-center">
                  <span className="text-4xl">✅</span>
                  <p className="text-white font-semibold text-lg">
                    ¡Sesión agendada!
                  </p>
                  <p className="text-slate-400 text-sm">
                    Recibirás el link de MS Teams en tu correo en los próximos minutos.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    {/* Inputs de contacto */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="book_name" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Nombre Completo
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
                          Email Corporativo
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
                          className="bg-phd-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-phd-cyan/50 transition-colors disabled:opacity-50"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="book_pain" className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Dolor Crítico Principal
                        </label>
                        <select
                          id="book_pain"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                          disabled={isLoading}
                          className="bg-phd-dark border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-phd-cyan/50 transition-colors disabled:opacity-50"
                        >
                          <option value="" disabled>Selecciona tu dolor principal</option>
                          {PAIN_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Selector de fecha y hora */}
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Seleccionar Fecha Exploratoria
                        </p>
                        <div className="grid grid-cols-5 gap-1">
                          {DAYS.map(({ label, day }) => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setSelectedDay(day)}
                              className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs transition-all ${
                                day === selectedDay
                                  ? "bg-phd-pink text-white font-bold"
                                  : "bg-white/5 text-slate-400 hover:bg-white/10"
                              }`}
                            >
                              <span className="text-[10px]">{label}</span>
                              <span className="font-bold">{day}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Horarios Disponibles (Santiago CL)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTime(slot)}
                              className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                                slot === selectedTime
                                  ? "bg-phd-pink/20 border border-phd-pink text-phd-pink"
                                  : "bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10"
                              }`}
                            >
                              {slot === "11:30 AM" ? `${slot} (Sugerida)` : slot}
                            </button>
                          ))}
                        </div>
                      </div>
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
                    {isLoading ? "Enviando..." : "📅 Agendar Sesión y Solicitar Diagnóstico en 72h"}
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
