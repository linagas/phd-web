import {
  describeActivityEvent,
  formatRelativeTime,
} from "@/utils/quality-pulse/activity-view-models";
import { RecentActivityEvent } from "@/utils/quality-pulse/recent-activity";

interface RecentActivityProps {
  events: RecentActivityEvent[];
  /** Injectable reference time for relative dates (defaults to the current time). */
  now?: Date;
}

function HistoryIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-phd-cyan"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

/**
 * "Actividad Reciente": vertical timeline fed by `summary.recentActivity`
 * (already sorted newest first and capped by the backend). Presentational
 * only; copy and badge styling come from `describeActivityEvent`.
 */
export default function RecentActivity({ events, now = new Date() }: RecentActivityProps) {
  return (
    <div className="phd-glass rounded-2xl p-6 sm:p-8 flex flex-col gap-6 max-h-[32rem] lg:max-h-none lg:absolute lg:inset-0">
      <div className="flex items-center gap-2">
        <HistoryIcon />
        <h2 className="font-heading font-semibold text-white text-lg">Actividad Reciente</h2>
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay actividad reciente.</p>
      ) : (
        <ul
          data-testid="recent-activity-scroll"
          className="relative flex flex-col gap-6 border-l border-white/10 pl-6 ml-2 min-h-0 flex-1 overflow-y-auto"
        >
          {events.map((event) => {
            const view = describeActivityEvent(event);
            return (
              <li
                key={`${event.type}-${event.clientKey}-${event.occurredAt}-${event.profile ?? ""}`}
                className="relative flex flex-col gap-1"
              >
                <span
                  aria-hidden="true"
                  className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-phd-cyan ring-4 ring-phd-dark"
                />
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 border ${view.badgeClassName}`}
                  >
                    {view.badge}
                  </span>
                  <time dateTime={event.occurredAt} className="text-xs text-slate-500">
                    {formatRelativeTime(event.occurredAt, now)}
                  </time>
                </div>
                <p className="text-sm text-slate-300">
                  {view.before}
                  <strong className="font-semibold text-white">{view.clientName}</strong>
                  {view.after}
                </p>
                {view.detail && <p className="text-xs text-slate-500">{view.detail}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
