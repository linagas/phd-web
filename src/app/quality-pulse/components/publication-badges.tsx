import { PublicationState } from "@/utils/quality-pulse/admin-view-models";

/** Accent per publication state: cyan = Publicado, purple = Pendiente de revisión, slate = En progreso. */
const STATE_BADGE_CLASSES: Record<PublicationState, string> = {
  Publicado: "border-phd-cyan/30 bg-phd-cyan/10 text-phd-cyan",
  "Pendiente de revisión": "border-phd-purple/30 bg-phd-purple/10 text-phd-purple",
  "En progreso": "border-white/10 bg-white/5 text-slate-400",
};

function badgeClassName(extra = ""): string {
  return `text-[10px] font-bold uppercase tracking-wider rounded-full px-3 py-1 border whitespace-nowrap ${extra}`;
}

export function StateBadge({ state }: { state: PublicationState }) {
  return <span className={badgeClassName(STATE_BADGE_CLASSES[state])}>{state}</span>;
}

export function RegistrationBadge({ isRegistered }: { isRegistered: boolean }) {
  if (isRegistered) return null;
  return (
    <span className={badgeClassName("border-dashed border-white/20 bg-transparent text-slate-500")}>
      No registrado
    </span>
  );
}
