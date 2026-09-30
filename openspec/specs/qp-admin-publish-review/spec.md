# Spec: Quality Pulse Admin Publish Review

## Purpose

A guarded admin page at `/administracion/clientes/{clientKey}/revisar` where an admin sees the same result detail a client sees on `/quality-pulse/resultados` before explicitly confirming publication. This is the ONLY entry point from which `POST /api/quality-pulse/admin/publication` is invoked; the Dashboard and Clientes table only navigate here.

## Requirements

### Requirement: Review Page Requires Admin Session

The review page MUST enforce the same admin session guard used by the rest of `/administracion/*`. Unauthenticated access MUST be rejected before any client data is fetched or rendered.

#### Scenario: Unauthenticated access is rejected

- GIVEN there is no valid admin session
- WHEN a user requests `/administracion/clientes/{clientKey}/revisar`
- THEN access is rejected the same way as any other `/administracion/*` route, and no client results are rendered

### Requirement: Review Page Blocks Ineligible Clients

The review page MUST be reachable only for clients that are currently eligible: 4/4 profiles answered AND `isPublished = false`. For any other state — client already published, fewer than 4/4 profiles answered, or an unknown/unregistered `clientKey` — the page MUST show a blocking error message instead of the results detail, and MUST NOT show the "Confirmar publicación" action.

#### Scenario: Eligible client shows the review detail

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN an admin with a valid session opens the review page for that client
- THEN the results detail and "Confirmar publicación" action are shown

#### Scenario: Already-published client is blocked

- GIVEN a client has `isPublished = true`
- WHEN an admin opens the review page for that client directly via URL
- THEN a blocking error message is shown, with no results detail and no "Confirmar publicación" action

#### Scenario: Partial (<4/4) client is blocked

- GIVEN a client has fewer than 4 of 4 profiles answered
- WHEN an admin opens the review page for that client directly via URL
- THEN a blocking error message is shown, with no results detail and no "Confirmar publicación" action

#### Scenario: Unknown clientKey is blocked

- GIVEN no client matches the requested `clientKey`
- WHEN an admin opens the review page for that `clientKey`
- THEN a blocking error message is shown, with no results detail and no "Confirmar publicación" action

### Requirement: Review Page Reuses the Client Results Detail

For an eligible client, the review page MUST render the same result detail the client sees on `/quality-pulse/resultados` for that client: health score, per-perspective radar, per-dimension grid, benchmark table, gaps/findings, and impact ranking. This detail MUST be produced by the same `calculateResults` function and the same presentational components extracted from `results-view.tsx` — not a re-implementation. Data MUST be sourced by fetching `GET /api/quality-pulse/assessments` (all clients, admin-gated) and the catalog, filtering the submissions client-side by `clientKey`; no new backend endpoint is introduced for this.

#### Scenario: Review detail matches the client-facing results

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN an admin opens the review page for that client
- THEN the rendered health score, radar, dimensions grid, benchmark, gaps, and impact ranking match what `calculateResults` produces for that client's submissions, identical to `/quality-pulse/resultados`

### Requirement: Confirmar Publicación Is the Sole Publish Trigger

The review page MUST expose a "Confirmar publicación" action that calls `POST /api/quality-pulse/admin/publication` for that `clientKey`. This MUST be the only place in the admin UI that calls this endpoint; the Dashboard's "Revisar y publicar" and the Clientes table's "Publicar" MUST only navigate to this page. The page MUST NOT perform a proactive eligibility re-check before enabling the button; if the server rejects the request (e.g. the client is no longer 4/4 eligible), the page MUST display that server error to the admin.

#### Scenario: Confirming publication calls the endpoint

- GIVEN an admin is viewing the review page for an eligible client
- WHEN the admin clicks "Confirmar publicación"
- THEN `POST /api/quality-pulse/admin/publication` is called for that `clientKey`

#### Scenario: Server rejection surfaces as an error

- GIVEN the client became ineligible after the page loaded (e.g. no longer 4/4)
- WHEN the admin clicks "Confirmar publicación" and the server rejects the request
- THEN the page displays the server's rejection as an error, without a prior proactive re-check having blocked the click

#### Scenario: Successful confirmation shows a Publicado state

- GIVEN an admin is viewing the review page for an eligible client
- WHEN the admin clicks "Confirmar publicación" and the server accepts the request
- THEN the page stays in place and shows a "Publicado" confirmation state, with no automatic redirect

### Requirement: Volver Has a Fixed Destination

The review page's "Volver" action MUST always navigate to `/administracion/clientes`, regardless of whether the admin arrived from the Dashboard or from the Clientes table.

#### Scenario: Volver returns to Clientes from any origin

- GIVEN an admin is on the review page, having arrived from either the Dashboard or the Clientes table
- WHEN the admin clicks "Volver"
- THEN the admin is navigated to `/administracion/clientes`
