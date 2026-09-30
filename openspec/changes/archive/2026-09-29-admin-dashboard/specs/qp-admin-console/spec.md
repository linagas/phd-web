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

The system MUST split the current flat admin page into `/administracion` (Dashboard), `/administracion/clientes`, and `/administracion/catalogo`, preserving client register/reset/Excel-export behavior and catalog import behavior unchanged.

#### Scenario: Clientes route preserves prior AdminPanel behavior

- GIVEN the admin is on `/administracion/clientes`
- WHEN they register, reset, or export clients to Excel
- THEN the outcome matches the previous `AdminPanel` behavior exactly

#### Scenario: Catálogo route preserves prior CatalogManager behavior

- GIVEN the admin is on `/administracion/catalogo`
- WHEN they import a catalog file
- THEN the outcome matches the previous `CatalogManager` behavior exactly
