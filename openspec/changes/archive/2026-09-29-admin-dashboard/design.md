# Design: Quality Pulse Admin Dashboard + Results Publication

## Technical Approach

Publication state lives on `qualityPulseClients` (one decision per client). The public-results gate is enforced in `AssessmentService` and returns a DTO that structurally omits answers when unpublished. Dashboard metrics are pure functions (`scoring.ts`, `dashboard-metrics.ts`) served by a new session-guarded admin endpoint. The console moves into a route group so the layout guard never wraps `ingresar`/`verificar`. Specs: `qp-admin-console`, `qp-admin-dashboard`, `qp-results-publication`.

## Architecture Decisions

| # | Topic | Choice | Rejected alternative(s) | Rationale |
|---|---|---|---|---|
| D1 | **Global Quality Health Score** (open point 1) | Weighted mean of per-client `healthScore`, weight = answered profiles (0–4): `round(Σ(hsᵢ·pᵢ)/Σpᵢ)`. `Σpᵢ = 0` returns `null` ("Sin datos"). Includes published and unpublished clients. | Simple mean (a 1/4 client counts as much as a 4/4 one). Only 4/4 clients (contradicts the spec's "varying completion"). Pooled `calculateResults` over every submission (mixes question means across clients, so it is not an aggregate of per-client scores). | Partial clients count in proportion to how complete their evidence is. Clients with 0 answers get weight 0, so they drop out without a special case. `round` matches `calculateResults`. |
| D2 | **Unanswered-profile score** (open point 2) | Discriminated union `ProfileScore` (below). Answered: `calculateResults([thatSubmission], catalog).healthScore`. Unanswered: `{status:"pending", score:null}`. UI shows a "Pendiente" badge, "—" in `text-slate-500`, and `aria-label="Sin datos"`. Per-client `healthScore` is also `number \| null` (null when 0 answers). | `0` (reads as "critical", not "no data"). `undefined`/optional field (easy to render as 0 by accident). | Type-level exhaustiveness forces the UI to handle the pending case. This mirrors the existing `DimensionScore.score: number \| null`. Labels: `QUALITY_PULSE_PROFILES` already contains "Calidad/Desarrollo/Gestión/Negocio", so no code mapping exists to leak. |
| D3 | **Publish/unpublish authorization** (open point 3) | **Explicit decision:** any holder of a valid `qp_admin_session` (allowlisted magic-link email) may publish or unpublish. `publishedBy` = `session.email`. No role model. | A role or "Super Admin" check. | Roles ("Super Admin") are out of scope in the proposal. All admins are already vetted by `admin-allowlist.ts`. `publishedBy` gives accountability. Adding roles later only touches the shared session guard. |
| D4 | Gate layer | `AssessmentService.getPublicStatus(clientName)` is the only public per-client read path. It returns `submissions` only when `isPublished === true && answeredProfiles.length === 4`. `getStatusForClient` (raw) is removed. | Filter in the controller or in the UI. | Every caller of the service is gated, and no raw path remains for a controller to call by mistake. The 4/4 re-check at read time also covers a publish/reset race. |
| D5 | Migration | Fail-closed read normalization: repository maps `isPublished: doc.isPublished === true`. No write script. | `updateMany` backfill script. | Missing field means unpublished, so all pre-existing clients (including 4/4) are hidden on deploy, as accepted. There is no deploy ordering and no migration runner on serverless. Rollback is trivial. |
| D6 | Console routing | Route group `src/app/administracion/(console)/` with `layout.tsx` + pages. `ingresar/` and `verificar/` stay outside the group. | `administracion/layout.tsx` as named in the proposal. | A root layout would wrap the login page, and its guard would redirect to itself in an infinite loop. The route group keeps the URLs unchanged. |
| D7 | Guard layering | 3 layers: `middleware.ts` (existing matcher already covers `/administracion/:path*` and `/api/quality-pulse/admin/:path*`), `(console)/layout.tsx` server guard, and a per-controller `requireAdminSession`. The guard is extracted to `src/utils/quality-pulse/require-admin-session.ts` (it is duplicated today in 2 controllers). | Layout-only guard. | Layouts do not re-run on soft navigation and do not protect APIs. A matcher regression must not open the APIs. |
| D8 | Reset ordering | `resetProfile`/`resetClient` call `clientRepository.setUnpublished` **before** deleting. | Delete first. | If the delete fails, the client stays unpublished (fail-closed). A no-op on an unpublished client or an orphan key does not throw. |
| D9 | Dashboard computation | Server-side: `GET /api/quality-pulse/admin/dashboard` → `DashboardService` → pure `buildDashboardSummary`. | Compute in the browser from the existing fetches. | Testable pure core, less answer data shipped to the browser, and follows the layering. |
| D10 | DI | Constructors take optional params with defaults (`constructor(repo = new ClientRepository())`). | Mandatory injection. | Existing call sites and the `jest.mock` tests keep working, and new tests can inject fakes. |

## Data Flow — Sequences

**Public results gate**
```
Browser/curl ─GET /api/quality-pulse/assessments?organization=X─▶ AssessmentController.getStatus
  └▶ AssessmentService.getPublicStatus(X)
       ├▶ ClientRepository.findByKey(key)        (normalized isPublished)
       ├▶ AssessmentRepository.findByClientKey(key)
       └─ build DTO: answeredProfiles always; submissions = gate ? list : null
  ◀─ 200 PublicAssessmentStatus   (unpublished ⇒ no `answers` anywhere in the payload)
No-organization branch ⇒ verified jose session required (unchanged), else 403.
```

**Publish / unpublish**
```
Admin UI ─POST|DELETE /api/quality-pulse/admin/publication {clientKey}─▶ middleware (session) ─▶
AdminPublicationController: method → requireAdminSession → zod
  └▶ PublicationService.publish(key, email)
       ├▶ ClientRepository.findByKey → missing ⇒ ClientNotFoundError (404)
       ├▶ AssessmentRepository.findByClientKey → <4 profiles ⇒ NotEligibleError (409)
       └▶ ClientRepository.setPublished(key, email, now)  ⇒ 200 {isPublished:true}
     PublicationService.unpublish(key) ⇒ setUnpublished ($set false, $unset publishedBy/At) ⇒ 200
```

**Reset → auto-unpublish**
```
DELETE /admin/assessments ─▶ AssessmentService.resetProfile|resetClient
  1. ClientRepository.setUnpublished(key)   2. AssessmentRepository.delete*(…)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/models/quality-pulse/client-model.ts` | Modify | Add `isPublished`, `publishedBy?`, `publishedAt?`; `create` sets `false` |
| `src/repositories/quality-pulse/client-repository.ts` | Modify | Normalize on read; `setPublished`, `setUnpublished` |
| `src/services/quality-pulse/publication-service.ts` | Create | publish/unpublish plus eligibility errors |
| `src/services/quality-pulse/assessment-service.ts` | Modify | `getPublicStatus` replaces `getStatusForClient`; resets unpublish first |
| `src/services/quality-pulse/dashboard-service.ts` | Create | Loads clients/submissions/catalog → `buildDashboardSummary` |
| `src/controllers/quality-pulse/assessment-controller.ts` | Modify | Organization branch returns the DTO |
| `src/controllers/quality-pulse/admin-publication-controller.ts` | Create | POST publish / DELETE unpublish |
| `src/controllers/quality-pulse/admin-dashboard-controller.ts` | Create | GET summary |
| `src/pages/api/quality-pulse/admin/{publication,dashboard}.ts` | Create | Route → controller |
| `src/utils/quality-pulse/require-admin-session.ts` | Create | Shared guard; adopted by the existing admin controllers |
| `src/utils/quality-pulse/scoring.ts` | Modify | `calculateProfileScores`, `aggregateHealthScore` (pure) |
| `src/utils/quality-pulse/dashboard-metrics.ts` | Create | KPIs, pending-review list (pure) |
| `src/app/administracion/page.tsx` | Move | → `(console)/page.tsx` (Dashboard) |
| `src/app/administracion/(console)/{layout.tsx,clientes/page.tsx,catalogo/page.tsx}` | Create | Guard + sidebar; routes |
| `src/app/administracion/(console)/components/{admin-sidebar,dashboard-view,kpi-cards,pending-review-list,client-score-table}.tsx` | Create | Presentational + container |
| `src/app/quality-pulse/components/admin-panel.tsx` | Modify | Becomes the Clientes view; drops `<CatalogManager/>`; adds a published badge. Register/reset/export logic unchanged |
| `src/app/quality-pulse/components/catalog-manager.tsx` | Keep | Rendered alone by `catalogo/page.tsx` |
| `src/app/quality-pulse/resultados/components/results-view.tsx`, `quality-pulse-view.tsx` | Modify | Consume the DTO; add a "Resultados en revisión" state |

## Interfaces / Contracts

```ts
type ProfileScore =
  | { profile: QualityPulseProfile; status: "answered"; score: number }
  | { profile: QualityPulseProfile; status: "pending"; score: null };

interface PublicAssessmentStatus {
  answeredProfiles: QualityPulseProfile[];
  isPublished: boolean;                          // effective: stored flag && 4/4
  submissions: QualityPulseAssessment[] | null;  // null unless published
}

interface DashboardSummary {
  kpis: { registeredClients: number; submissions: number; expectedSubmissions: number;
          completionPct: number; pendingReview: number };
  globalHealthScore: number | null;
  clients: { clientKey: string; clientName: string; isPublished: boolean;
             answeredCount: number; healthScore: number | null; profileScores: ProfileScore[] }[];
  pendingReview: { clientKey: string; clientName: string }[]; // 4/4 && !isPublished
}
```
KPIs count only submissions whose `clientKey` is registered, so `completionPct` stays ≤ 100. Orphan submissions stay visible in Clientes, as before. With 0 clients the result is all zeros and `globalHealthScore: null`.

## Testing Strategy (Strict TDD)

| Layer | What | Approach |
|---|---|---|
| Unit (pure) | D1 formula, D2 union, KPIs, empty state, pending list | `tests/unit/utils/*`, fixtures only |
| Unit (service) | Gate matrix (unpublished/published/published&<4), publish eligibility, reset order | Injected fake repositories |
| Unit (controller) | 401 without session on `publication`/`dashboard`; 405/400/404/409 | `jest.mock` on the service plus session util |
| E2E | Unpublished → review state; publish → results; `/administracion/clientes` without cookie → login | Playwright `e2e/` |

## Threat Matrix

N/A: no shell, subprocess, VCS/PR automation, or executable-file classification boundary. HTTP auth boundaries are covered by D4 and D7.

## Migration / Rollout

No write migration (D5). The first deploy hides every client, including the 4/4 ones. Ops must be told beforehand (task required). Rollback: revert the slices. The fields are additive and ignored once reverted.

## Open Questions

None blocking.
