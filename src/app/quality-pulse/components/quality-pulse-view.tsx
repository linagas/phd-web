"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CatalogQuestion,
  QUALITY_PULSE_PROFILES,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { getVisibleQuestions } from "@/utils/quality-pulse/visibility";
import ProfileCard from "./profile-card";
import QuestionCard from "./question-card";
import ProgressBar from "./progress-bar";
import ClientNotFound from "./client-not-found";
import ResultsStatusPanel from "./results-status-panel";

type View = "intro" | "assessment";

const CLIENT_QUERY_PARAM = "cliente";

function sortByOrder(questions: CatalogQuestion[]): CatalogQuestion[] {
  return [...questions].sort((a, b) => a.order - b.order);
}

export default function QualityPulseView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [view, setView] = useState<View>("intro");
  const [clientName, setClientName] = useState<string>("");
  const [nameInput, setNameInput] = useState<string>("");

  const [catalog, setCatalog] = useState<CatalogQuestion[]>([]);
  const [submissions, setSubmissions] = useState<QualityPulseAssessment[]>([]);
  const [loadingClientData, setLoadingClientData] = useState(false);
  const [clientError, setClientError] = useState("");
  const [clientNotFound, setClientNotFound] = useState(false);

  const [selectedProfile, setSelectedProfile] = useState<QualityPulseProfile | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const paramClient = searchParams?.get(CLIENT_QUERY_PARAM);
    if (paramClient && paramClient.trim() !== "") {
      setClientName(paramClient);
    }
  }, [searchParams]);

  const loadClientData = useCallback(async (organization: string) => {
    setLoadingClientData(true);
    setClientError("");
    setClientNotFound(false);
    try {
      const existsRes = await fetch(
        `/api/quality-pulse/clients?organization=${encodeURIComponent(organization)}`
      );
      if (!existsRes.ok) {
        throw new Error("No se pudo validar el cliente.");
      }
      const { exists } = await existsRes.json();
      if (!exists) {
        setClientNotFound(true);
        return;
      }

      const [assessmentsRes, catalogRes] = await Promise.all([
        fetch(`/api/quality-pulse/assessments?organization=${encodeURIComponent(organization)}`),
        fetch("/api/quality-pulse/catalog"),
      ]);

      if (!assessmentsRes.ok || !catalogRes.ok) {
        throw new Error("No se pudo cargar la información del cliente.");
      }

      const assessmentsData: QualityPulseAssessment[] = await assessmentsRes.json();
      const catalogData: CatalogQuestion[] = await catalogRes.json();

      setSubmissions(assessmentsData);
      setCatalog(catalogData);
    } catch {
      setClientError("No se pudo cargar la información del cliente. Inténtalo de nuevo.");
    } finally {
      setLoadingClientData(false);
    }
  }, []);

  useEffect(() => {
    if (clientName) {
      loadClientData(clientName);
    }
  }, [clientName, loadClientData]);

  const handleActivateClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) return;

    router.replace(`/quality-pulse?${CLIENT_QUERY_PARAM}=${encodeURIComponent(trimmed)}`);
    setClientName(trimmed);
  };

  const sortedCatalog = useMemo(() => sortByOrder(catalog), [catalog]);

  const answeredProfiles = useMemo(
    () => new Set(submissions.map((submission) => submission.profile)),
    [submissions]
  );

  const handleSelectProfile = (profile: QualityPulseProfile) => {
    setSelectedProfile(profile);
    setAnswers({});
    setCurrentIndex(0);
    setSubmitError("");
    setView("assessment");
  };

  const visibleQuestions = useMemo(() => {
    if (!selectedProfile) return [];
    return getVisibleQuestions(sortedCatalog, selectedProfile, answers);
  }, [sortedCatalog, selectedProfile, answers]);

  const clampedIndex = Math.min(currentIndex, Math.max(visibleQuestions.length - 1, 0));
  const currentQuestion = visibleQuestions[clampedIndex];
  const isLastQuestion = clampedIndex === visibleQuestions.length - 1;

  const handleSelectOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
  };

  const handlePrevious = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const handleFinishAssessment = useCallback(async () => {
    if (!selectedProfile) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/quality-pulse/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: selectedProfile,
          organization: clientName,
          answers,
        }),
      });

      if (res.status === 201) {
        await loadClientData(clientName);
        setSelectedProfile(null);
        setAnswers({});
        setCurrentIndex(0);
        setView("intro");
        return;
      }

      const body = await res.json().catch(() => ({}));
      if (res.status === 409) {
        setSubmitError(body.error ?? "Este perfil ya fue respondido para este cliente.");
        return;
      }
      setSubmitError(body.error ?? "No se pudo guardar el assessment. Inténtalo de nuevo.");
    } catch {
      setSubmitError("Error de red. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }, [selectedProfile, clientName, answers, loadClientData]);

  const handleNext = () => {
    if (isLastQuestion) {
      handleFinishAssessment();
      return;
    }
    setCurrentIndex((index) => index + 1);
  };

  const hasAnsweredCurrent =
    currentQuestion !== undefined && answers[currentQuestion.id] !== undefined;

  if (view === "assessment" && selectedProfile) {
    return (
      <section className="min-h-screen bg-phd-dark phd-gradient-blur px-4 sm:px-8 lg:px-16 py-24">
        <div className="max-w-screen-md mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-phd-pink">
              Perfil {selectedProfile}
            </p>
            <ProgressBar current={clampedIndex + 1} total={visibleQuestions.length} />
          </div>

          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              questionNumber={clampedIndex + 1}
              selectedOptionIndex={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />
          ) : (
            <p className="text-slate-400 text-sm">
              No hay preguntas disponibles para este perfil.
            </p>
          )}

          {submitError && (
            <p role="alert" className="text-sm text-phd-pink">
              {submitError}
            </p>
          )}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={clampedIndex === 0 || submitting}
              className="text-sm text-slate-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!hasAnsweredCurrent || submitting}
              className="bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-phd-pink/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {submitting ? "Guardando..." : isLastQuestion ? "Finalizar" : "Siguiente"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (clientNotFound) {
    return (
      <ClientNotFound
        clientName={clientName}
        onRetry={() => {
          setClientName("");
          setNameInput("");
          setClientNotFound(false);
          router.replace("/quality-pulse");
        }}
      />
    );
  }

  return (
    <section className="min-h-screen bg-phd-dark phd-gradient-blur px-4 sm:px-8 lg:px-16 py-16">
      <div className="max-w-screen-2xl mx-auto flex flex-col gap-12">
        <div className="max-w-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 w-fit border border-phd-cyan/30 bg-phd-cyan/10 rounded-full px-4 py-1.5">
            <span className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-phd-cyan">
              Diagnóstico multiperfil v4.2
            </span>
          </div>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl md:text-6xl text-white tracking-tight">
            Una visión de calidad,{" "}
            <span className="bg-gradient-to-r from-phd-pink via-phd-purple to-phd-cyan bg-clip-text text-transparent">
              cuatro perspectivas.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Selecciona tu perfil y responde únicamente las preguntas que te corresponden.
            Cada participación se guarda en un repositorio encriptado de alta
            disponibilidad.
          </p>
        </div>

        {!clientName ? (
          <form
            onSubmit={handleActivateClient}
            className="flex flex-col gap-2 max-w-2xl w-full"
          >
            <label
              htmlFor="client-name"
              className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-slate-500"
            >
              Nombre del cliente <span className="text-phd-pink italic">/ Obligatorio</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  id="client-name"
                  name="client-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ej: Empresa ABC Tech"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-phd-cyan/50"
                  required
                />
                <svg
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21h18M5 21V7l8-4v18M13 21V11h6v10M8 9h1m-1 4h1m-1 4h1"
                  />
                </svg>
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-phd-pink hover:bg-phd-pink/90 text-white font-semibold px-7 py-3 rounded-full transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-phd-pink/25 whitespace-nowrap"
              >
                Continuar
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="text-slate-300">
                Diagnóstico para{" "}
                <span className="text-white font-semibold">{clientName}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setClientName("");
                  setNameInput("");
                  router.replace("/quality-pulse");
                }}
                className="text-sm text-slate-400 hover:text-phd-cyan transition-colors"
              >
                Cambiar de empresa
              </button>
            </div>

            {loadingClientData && (
              <p className="text-slate-400 text-sm">Cargando información del cliente…</p>
            )}
            {clientError && (
              <p role="alert" className="text-sm text-phd-pink">
                {clientError}
              </p>
            )}

            {!loadingClientData && !clientError && (
              <ResultsStatusPanel
                answeredCount={answeredProfiles.size}
                totalProfiles={QUALITY_PULSE_PROFILES.length}
                clientName={clientName}
              />
            )}

            {!loadingClientData && !clientError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {QUALITY_PULSE_PROFILES.map((profile) => (
                  <ProfileCard
                    key={profile}
                    profile={profile}
                    questionCount={
                      sortedCatalog.filter(
                        (question) =>
                          question.status === "Activa" &&
                          question.profiles.includes(profile) &&
                          question.type === "Base"
                      ).length
                    }
                    answered={answeredProfiles.has(profile)}
                    disabled={false}
                    onSelect={handleSelectProfile}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
