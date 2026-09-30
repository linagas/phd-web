"use client";
import { useState } from "react";
import {
  QUALITY_PULSE_PROFILES,
  QualityPulseProfile,
} from "@/models/quality-pulse/catalog-question-model";
import { QualityPulseAssessment } from "@/models/quality-pulse/assessment-model";
import { formatLastUpdate } from "@/utils/quality-pulse/admin-view-models";
import { ProfileScore } from "@/utils/quality-pulse/scoring";

interface ClientProfileCardsProps {
  profileScores: ProfileScore[];
  clientSubmissions: QualityPulseAssessment[];
  disabled: boolean;
  onResetProfile: (profile: QualityPulseProfile) => void;
}

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-phd-cyan";

/** One card per profile: answered status, real score/date, and inline-confirmed reset. */
export default function ClientProfileCards({
  profileScores,
  clientSubmissions,
  disabled,
  onResetProfile,
}: ClientProfileCardsProps) {
  const [confirming, setConfirming] = useState<QualityPulseProfile | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {QUALITY_PULSE_PROFILES.map((profile) => {
        const score = profileScores.find((item) => item.profile === profile);
        const answered = score?.status === "answered";
        const submission = clientSubmissions.find((item) => item.profile === profile);
        return (
          <div
            key={profile}
            className="phd-glass rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200">{profile}</h3>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-1 border ${
                  answered
                    ? "border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan"
                    : "border-white/10 bg-white/5 text-slate-500"
                }`}
              >
                {answered ? "Respondido" : "Pendiente"}
              </span>
            </div>
            {answered && score.status === "answered" && (
              <dl className="flex flex-col gap-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <dt>Score del perfil</dt>
                  <dd className="text-white font-semibold">{score.score}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Preguntas respondidas</dt>
                  <dd className="text-slate-200">{submission?.questionCount ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Respondido el</dt>
                  <dd className="text-slate-200">{formatLastUpdate(submission?.submittedAt)}</dd>
                </div>
              </dl>
            )}
            {answered &&
              (confirming === profile ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirming(null);
                      onResetProfile(profile);
                    }}
                    disabled={disabled}
                    className={`flex-1 text-xs font-semibold bg-phd-pink hover:bg-phd-pink/90 text-white rounded-full py-1.5 disabled:opacity-50 ${FOCUS_RING}`}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className={`flex-1 text-xs font-semibold bg-white/5 border border-white/10 text-slate-300 rounded-full py-1.5 ${FOCUS_RING}`}
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirming(profile)}
                  className={`print:hidden text-xs text-slate-400 hover:text-phd-pink transition-colors text-left w-fit ${FOCUS_RING}`}
                >
                  Reiniciar perfil
                </button>
              ))}
          </div>
        );
      })}
    </div>
  );
}
