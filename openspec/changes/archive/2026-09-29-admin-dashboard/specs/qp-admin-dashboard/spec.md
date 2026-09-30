# Spec: Quality Pulse Admin Dashboard

## ADDED Requirements

### Requirement: Dashboard KPIs

The dashboard MUST display: total registered clients, total submissions vs. expected (`clients × 4`), completion percentage, and count of clients pending review.

#### Scenario: KPIs reflect current data

- GIVEN N registered clients and M submitted profile answers
- WHEN the admin opens the Dashboard
- THEN it shows N clients, M/(N×4) submissions, the resulting completion %, and the pending-review count

#### Scenario: Empty state does not error

- GIVEN there are zero registered clients
- WHEN the admin opens the Dashboard
- THEN all KPIs render as zero without throwing an error

### Requirement: Quality Health Score Aggregation

The system MUST compute and display a global Quality Health Score and a per-client Quality Health Score, both derived from the existing `healthScore`/`calculateResults` logic, regardless of a client's publication state (admin view is unfiltered by publication).

#### Scenario: Per-client score matches existing calculation

- GIVEN a client with answered profiles
- WHEN the Dashboard renders that client's score
- THEN it MUST match the output of `calculateResults` for that client

#### Scenario: Global score aggregates across all clients

- GIVEN multiple registered clients with varying completion
- WHEN the Dashboard renders the global score
- THEN it MUST aggregate per-client scores across all registered clients, published or not

### Requirement: Per-Profile Score

The system MUST derive and display a score per profile, labeled Calidad, Desarrollo, Gestión, and Negocio — never internal codes (QA/DEV/MGT/BIZ).

#### Scenario: Answered profile shows its score

- GIVEN a client has answered the "Calidad" profile
- WHEN the Dashboard renders that client's per-profile breakdown
- THEN the "Calidad" score is shown under that label, not "QA"

#### Scenario: Unanswered profile has no score

- GIVEN a client has not answered "Negocio"
- WHEN the Dashboard renders that client's per-profile breakdown
- THEN "Negocio" MUST show a pending/no-data state, not a computed score

### Requirement: Pending-Review List

The Dashboard MUST list under "Pendientes de Revisión" only clients with all 4 profiles answered (4/4) that are NOT currently published, each with a "Revisar y publicar" action. Clients with partial completion (< 4/4) MUST appear only in KPIs, never in this list.

#### Scenario: 4/4 unpublished client appears in the list

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the admin views "Pendientes de Revisión"
- THEN that client appears with a "Revisar y publicar" action

#### Scenario: Partial client is excluded from the list

- GIVEN a client has 2/4 profiles answered
- WHEN the admin views "Pendientes de Revisión"
- THEN that client does NOT appear in the list, and is counted only in the KPIs

#### Scenario: Already-published 4/4 client is excluded from the list

- GIVEN a client has 4/4 profiles answered and `isPublished = true`
- WHEN the admin views "Pendientes de Revisión"
- THEN that client does NOT appear in the list
