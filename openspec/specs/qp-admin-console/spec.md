# Spec: Quality Pulse Admin Console

## ADDED Requirements

### Requirement: Admin Session Guard

The system MUST guard every route under `/administracion` with a valid `qp_admin_session` session, and MUST enforce the same guard independently at each underlying admin API route (defense in depth, not layout-only).

#### Scenario: Valid session grants access

- GIVEN a request carries a valid `qp_admin_session`
- WHEN the admin navigates to any `/administracion/*` route
- THEN the route renders normally

#### Scenario: Missing or invalid session redirects to login

- GIVEN a request has no session or an invalid `qp_admin_session`
- WHEN the admin requests any `/administracion/*` route
- THEN the system redirects to the login page

#### Scenario: API route rejects unguarded requests even if layout is bypassed

- GIVEN a request to an `/api/quality-pulse/admin/*` route has no valid session
- WHEN the request is made directly (not through the layout)
- THEN the API MUST reject it with an unauthorized response

### Requirement: Admin Sidebar Navigation

The layout MUST render a sidebar, using the phd-dark visual system and Inter font, linking to Dashboard, Clientes, and Catálogo, plus disabled placeholder entries labeled "Próximamente" for Resultados, Auditoría, and Soporte.

#### Scenario: Active sub-routes are navigable

- GIVEN an authenticated admin views the sidebar
- WHEN they click Dashboard, Clientes, or Catálogo
- THEN the corresponding sub-route renders

#### Scenario: Placeholder items are non-functional

- GIVEN an authenticated admin views the sidebar
- WHEN they view Resultados, Auditoría, or Soporte
- THEN each is shown disabled and labeled "Próximamente", with no navigation triggered on click

### Requirement: Sub-route Split Preserves Existing Behavior

The system MUST split the current flat admin page into `/administracion` (Dashboard), `/administracion/clientes`, and `/administracion/catalogo`, preserving client register/reset/Excel-export behavior and catalog import behavior unchanged. On `/administracion/clientes`, the underlying `AdminPanel` UI (single-client `<select>` dropdown) MAY be restructured into a clients table (see `qp-admin-clients-table`); the requirement covers the preserved ACTIONS and their outcomes/endpoints, not a specific UI shape.

(Previously: "Clientes route preserves prior AdminPanel behavior" required the outcome to match the previous `AdminPanel` behavior exactly, understood at the time as UI-preserving — the dropdown-based single-client view was kept byte-identical by a prior deliberate decision. This change consciously relaxes that to action-preservation only: `admin-console-visual-redesign` intentionally replaces the dropdown with a searchable table, which is a new product decision, not a regression of the prior preservation choice.)

#### Scenario: Clientes route preserves prior AdminPanel actions

- GIVEN the admin is on `/administracion/clientes`
- WHEN they register, reset (per-profile or reset-all), unpublish, or export clients to Excel
- THEN each action MUST call the same endpoint and produce the same outcome as the previous `AdminPanel` behavior, regardless of whether the action is triggered from a dropdown/card or from a table row's expandable detail

#### Scenario: Catálogo route preserves prior CatalogManager behavior

- GIVEN the admin is on `/administracion/catalogo`
- WHEN they import a catalog file
- THEN the outcome matches the previous `CatalogManager` behavior exactly
