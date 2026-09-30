# Delta for qp-admin-console

## MODIFIED Requirements

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
