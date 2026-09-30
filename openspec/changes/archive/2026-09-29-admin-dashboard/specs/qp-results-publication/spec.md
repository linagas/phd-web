# Spec: Quality Pulse Results Publication

## ADDED Requirements

### Requirement: Publication State Model

Each client MUST persist publication state: `isPublished` (boolean), `publishedBy`, and `publishedAt`. New clients MUST default to `isPublished = false`.

#### Scenario: New client defaults to unpublished

- GIVEN a client is newly registered
- WHEN the record is created
- THEN `isPublished` is `false` and `publishedBy`/`publishedAt` are unset

#### Scenario: Publish sets audit fields

- GIVEN an admin publishes an eligible client
- WHEN the publish action succeeds
- THEN `isPublished = true`, `publishedBy` is set to the acting admin, and `publishedAt` is set to the current time

### Requirement: No Grandfathering on Migration

Deploying this change MUST NOT auto-publish any client. Every existing client — including those already at 4/4 with results previously visible to the public — MUST start with `isPublished = false` after migration.

#### Scenario: Pre-existing complete client is hidden until re-published

- GIVEN a client had 4/4 profiles answered and visible results before this change shipped
- WHEN the migration runs
- THEN `isPublished = false` for that client, and its public results are hidden until an admin explicitly re-publishes it

### Requirement: Publish Eligibility Gate

The system MUST only allow publishing a client whose 4 profiles are all answered (4/4). A publish attempt on a client with fewer than 4 answered profiles MUST be rejected.

#### Scenario: Publish succeeds for a 4/4 client

- GIVEN a client has 4/4 profiles answered
- WHEN an admin triggers publish
- THEN `isPublished` becomes `true`

#### Scenario: Publish rejected for a partial client

- GIVEN a client has fewer than 4 profiles answered
- WHEN an admin triggers publish
- THEN the request is rejected and `isPublished` remains `false`

### Requirement: Unpublish

An admin MUST be able to unpublish a currently published client at any time, setting `isPublished = false`.

#### Scenario: Unpublish hides a live client

- GIVEN a client has `isPublished = true`
- WHEN an admin triggers unpublish
- THEN `isPublished` becomes `false` and public access to that client's results stops

### Requirement: Auto-Unpublish on Profile Reset

Resetting any single profile of a client MUST automatically set `isPublished = false` for that client, regardless of which profile was reset or how many profiles remain answered.

#### Scenario: Reset on a published client auto-unpublishes

- GIVEN a published client (`isPublished = true`, 4/4 answered)
- WHEN an admin resets any one profile
- THEN `isPublished` becomes `false` automatically

#### Scenario: Reset on an already-unpublished client is a no-op for state

- GIVEN an unpublished client
- WHEN an admin resets a profile
- THEN `isPublished` remains `false` with no error

### Requirement: No Automated Notification

Publishing or unpublishing a client MUST NOT trigger any automated email or in-app notification. Communication to the client happens manually, outside the application.

#### Scenario: Publish sends no notification

- GIVEN an admin publishes a client
- WHEN the publish action completes
- THEN no email is sent and no notification record is created

### Requirement: Public Results Gate

The public endpoint that serves assessment results (e.g. `GET /api/quality-pulse/assessments`) MUST NOT return answers or computed results for a client whose `isPublished` is `false`, while still exposing per-profile "answered" status publicly, since the questionnaire flow depends on it. This gate MUST be enforced server-side (controller/service layer), independent of any UI state.

#### Scenario: Unpublished client exposes status but not answers

- GIVEN a client has 4/4 profiles answered and `isPublished = false`
- WHEN the public endpoint is queried for that client
- THEN it returns per-profile answered flags but no answers or results payload

#### Scenario: Published client exposes full results

- GIVEN a client has `isPublished = true`
- WHEN the public endpoint is queried for that client
- THEN it returns full answers/results

#### Scenario: Results page shows review state for unpublished client

- GIVEN a client is unpublished
- WHEN a visitor opens `/quality-pulse/resultados` for that client
- THEN the page shows a "results under review" state instead of results

#### Scenario: Gate holds even when bypassing the UI

- GIVEN a client is unpublished
- WHEN the public endpoint is called directly (e.g., via curl, not through the UI)
- THEN the response still MUST NOT include answers or results for that client
