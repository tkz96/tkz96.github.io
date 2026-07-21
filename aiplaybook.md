# The AI Development Playbook: An Enterprise SDLC Guide

## Version 4: Complete Enterprise Operational Standard with Azure DevOps Integration & Documentation Standards

This playbook serves as both a practical field guide for software engineers and an operational standard for enterprise development organizations. It provides a complete framework for integrating autonomous AI agents across every stage of the Software Development Life Cycle (SDLC) while enforcing strict quality, security, governance standards, precise work item structuring in Azure DevOps (`dev.azure.com`), and rigorous documentation practices.

---

## Table of Contents

1. [Core Concepts](01-core-concepts.html)
2. [The AI-Augmented SDLC](02-ai-augmented-sdlc.html)
3. [Phase 1: Preparing the Codebase to Be AI-Friendly](03-preparing-codebase.html)
4. [Phase 2: Designing the Developer Experience](04-developer-experience.html)
5. [Phase 3: Reviewing Everything for Flaws (Quality & Security Assurance)](05-quality-security-assurance.html)
6. [End-to-End Enterprise Workflows, Gates & Governance](06-enterprise-workflows-gates.html)
7. [How to Write Tickets for Azure DevOps](07-azure-devops-tickets.html)
8. [Documentation as a First-Class Citizen & Planning Standards](08-documentation-planning.html)

---

## 1. Core Concepts

Before deploying AI agents effectively, teams need a shared vocabulary. The following core concepts define how agents interact with systems and humans:

### Tokens and Token Management

A token is a chunk of text (roughly 3/4 of a word) that an AI model reads and writes. The **context window** is the model's active working memory—like a whiteboard with limited space. Once filled, older context must be cleared or summarized. **Token management** is the discipline of keeping only essential files, rules, and context in the whiteboard to avoid the "needle in a haystack" problem, where critical instructions get lost in prompt bloat.

Underneath sits the **KV cache** (Key-Value cache). When prompt structures remain static at the beginning (such as system rules and tool definitions), models reuse precomputed values, making agent runs faster and dramatically cheaper via prompt caching.

### Rules

Rules are persistent repository-level instructions stored in files like `AGENTS.md`, `CLAUDE.md`, or a `.cursor/rules` directory. They set standard conventions, build instructions, and prohibited actions once, so every agent automatically adheres to team norms without repeated prompting.

### Skills

Skills are modular, task-specific playbooks loaded only when needed (e.g., performing a security audit or refactoring a function). They act as expert checklists, keeping the main context window lightweight while ensuring repeatable execution quality.

### Loops

An agentic loop is the continuous cycle of *act, observe, and adjust*. Unlike single-shot responses, an agent executes a command (e.g., writes code or runs a build), reads errors, adjusts its solution, and re-runs tests until the task criteria are met.

### Prompt, Context, and Harness Engineering

* **Prompt Engineering:** Crafting clear, direct instructions for specific individual tasks.


* **Context Engineering:** Dynamically delivering the exact required background information (using techniques like RAG—Retrieval-Augmented Generation) to the agent before it acts.


* **Harness Engineering:** The environment wrapped around the model, granting tool capabilities (running bash commands, editing files, making API calls). The standard protocol for connecting tools and data sources seamlessly across models is **MCP (Model Context Protocol)**.



### Agentic Workflows & Gates

Agents carry out real-world actions with side effects (editing repositories, creating pull requests, triggering deployments). To maintain safety and quality, workflows rely on **gates**—mandatory checkpoints where human engineers or automated review agents must inspect and approve progress before the workflow proceeds.

---

## 2. The AI-Augmented SDLC

AI solutions can be integrated across the entire software development lifecycle, providing end-to-end augmentation from initial planning to long-term system maintenance:

| SDLC Phase | AI Capabilities & Focus |
| --- | --- |
| **1. Planning** | Summarizes stakeholder interviews, translates unstructured notes into roadmaps, and assists with timeline and resource estimation.

 |
| **2. Analysis** | Converts emails, support tickets, and chat logs into structured PRDs; validates technical stack feasibility and flags early bottlenecks.

 |
| **3. Design** | Recommends system architectures, designs database schemas, generates design-system-compliant UI prototypes, and creates OpenAPI contracts.

 |
| **4. Coding** | IDE-native agent pair programming, real-time complexity monitoring, technical debt prevention, and inline documentation generation.

 |
| **5. Testing** | Generates comprehensive unit and integration test suites, tests complex edge cases, and executes visual regression checks.

 |
| **6. Deployment** | Optimizes CI/CD pipelines, predicts release bottlenecks, and continuously monitors real-time telemetry logs to prevent downtime.

 |
| **7. Maintenance** | Auto-triages and categorizes incoming bug reports, identifies incident root causes, and generates proposed patches.

 |

---

## 3. Phase 1: Preparing the Codebase to Be AI-Friendly

An AI agent is only as effective as the repository it operates within. Essential preparation steps include:

* **Root Rules File:** Maintain an `AGENTS.md` file detailing build commands, style rules, and hard boundaries.


* **Consistent Naming & Architecture:** Ensure domain terms are standardized across API, application, and database layers.


* **Modular Architecture:** Break large monolithic files (3,000+ lines) into small, single-responsibility modules that fit easily into context windows.


* **Comprehensive Test Suite & Static Analysis:** High test coverage and strict type checking provide instant feedback loops for agents to verify their own edits.


* **Explicit Error Reporting:** Ensure errors yield detailed contextual traces rather than failing silently.



---

## 4. Phase 2: Designing the Developer Experience

Day-to-day interactions with agents require specific execution patterns depending on the task domain:

* **Environment Configuration:** Agents operating in developer environments must run within sandboxed containers, isolated from production credentials or sensitive keys.


* **Frontend Workflows:** Provide agents with strict design tokens (color scales, typography, spacing variables). Mandate accessibility standards and automated visual regression testing.


* **Backend Workflows:** Always supply documented API contracts (OpenAPI specifications) before implementation. Enforce additive, reversible database migrations.


* **Feature Development, Bugs & Refactoring:** Use planning skills to achieve complete alignment before coding. Reproduce bugs with failing tests first. Execute small, incremental refactors backed by test suites.



---

## 5. Phase 3: Reviewing Everything for Flaws (Quality & Security Assurance)

Automated verification is the cornerstone of enterprise safety. No agent-generated output should reach production without passing multi-layered verification:

### Automated Edge-Case Generation

Beyond standard unit tests, QA agents must actively generate adversarial test vectors to uncover latent bugs before deployment. This includes:

* **Boundary & Payload Stressing:** Injecting empty strings, massive payloads, overflow numbers, and unexpected character encodings (e.g., UTF-8 multibyte, null-byte injection).


* **Concurrency & State Collisions:** Stressing database transactions with concurrent requests to flag potential race conditions or lock contention.


* **Failure Mode Simulation:** Mocking downstream API outages, timeout latency, and network dropouts to verify application fault tolerance.



### Two-Tiered Review Architecture

To balance speed and thoroughness, code review must occur across two distinct tiers:

* **Tier 1: Automated Mechanical Review (Agent-Driven):** Specialized review agents (such as BugBot) automatically inspect every diff for mechanical defects: off-by-one errors, unhandled null pointers, missing try/catch blocks, unclosed resource handles, and syntax inconsistencies.


* **Tier 2: Architectural & Business Review (Human-Driven):** Human engineers review PRs focusing exclusively on strategic questions: *Does this solve the core business problem? Is the architectural direction sound? Will this be maintainable long-term?*


### Security & Vulnerability Auditing

Security checks are non-negotiable and integrated directly into the automated pipeline:

* **Static Application Security Testing (SAST):** Automated tools scan every commit for common security antipatterns (SQL injection, XSS, insecure deserialization).


* **Dependency & Secret Scanning:** Scans third-party dependencies for known CVEs and blocks any commit containing accidental secrets, private keys, or API tokens.


* **Least-Privilege Verification:** Audit tools verify that agents operating within CI/CD loops hold zero read/write access to production environments or secrets.



### Continuous Workflow Critiques

Engineering teams must establish a monthly workflow retrospective. If agents consistently ship repetitive bugs, teams must refine repository rules (`AGENTS.md`), update automated test suites, or improve skill definitions rather than fixing bugs piecemeal.

---

## 6. End-to-End Enterprise Workflows, Gates & Governance

To safely scale agent operations across an enterprise, workflows must combine automated execution with strict approval gates and granular permission boundaries.

### The Four-Gate Enterprise Protocol

Agents are granted high operational autonomy within sandboxed environments, but work cannot move between lifecycle stages without explicit approval at four key gates:

| Gate Level | Stage | Required Approval & Verification |
| --- | --- | --- |
| **Gate 1** | Planning & Scope Approval | Human lead reviews the agent's proposed implementation plan, story point estimate, and architectural impact before coding starts.

 |
| **Gate 2** | Automated Verification | Automated test suite, static linters, SAST scanners, and review agents (e.g., BugBot) must pass with zero critical errors.

 |
| **Gate 3** | Human PR Review | Human engineer reviews code diff for business logic compliance, security integrity, and maintainability before merging into `main`.

 |
| **Gate 4** | Deployment & Health Check | Automated canary deployment checks and real-time log monitoring verify post-release system stability before full rollout.

 |

### Agent Access & Permissions Matrix

Security compliance requires strict isolation of agent credentials and capabilities depending on the operational environment:

| System Asset | Local Dev Sandbox | CI/CD Agent Pipeline | Production Environment |
| --- | --- | --- | --- |
| **Local Codebase** | Read / Write | Read Only | Denied |
| **Test Suite Execution** | Full Execution | Full Execution | Denied |
| **Development Database** | Read / Write (Mock Data) | Isolated Ephemeral DB | Denied |
| **Production Database** | Denied | Denied | Denied (Read-Only via Telemetry Logs) |
| **Production Deployment Keys** | Denied | Scoped Deployment Token | Denied |

---

## 7. How to Write Tickets for Azure DevOps (dev.azure.com)

In an AI-augmented engineering organization, Azure DevOps (`dev.azure.com`) serves as the primary operational hub across the entire SDLC. Work items in Azure DevOps are not merely human tracking tickets—they function as direct inputs for autonomous AI agents via API integrations and Model Context Protocol (MCP) servers. When an AI agent picks up a work item, ambiguous scope or missing fields force the model to make unverified assumptions, leading to hallucinated requirements, bloated execution loops, and rejected pull requests.

To ensure deterministic and reliable agent execution, every work item created in `dev.azure.com` must follow strict structural standards tailored to its specific Work Item Type: **Epic**, **Feature**, **Issue**, **Task**, or **Bug**.

### Azure DevOps Baseline Configuration Standards

Prior to moving any work item into an active sprint or agent processing queue, the following mandatory metadata fields must be populated:

* **Area Path:** Identifies the exact owning team or system boundary (e.g., `PlatformTeam\Authentication`).


* **Iteration Path:** Defines the target sprint timeline (e.g., `Sprint 42`).


* **Parent / Child Linkage:** Maintains explicit structural hierarchy (`Epic` → `Feature` → `Issue` → `Task`).


* **Tags:** Standardized labels to enable automated agent filtering (e.g., `agent-eligible`, `backend`, `security`, `database`).



### 1. Epic

An **Epic** represents a multi-sprint strategic initiative or business outcome spanning multiple teams. Epics break down into individual Features. Epics are never assigned directly to AI agents for immediate code execution; instead, agents analyze Epics during early planning (SDLC Phase 1) to assist human architects in decomposing scope into discrete Features and Issues.

* **Title Structure:** `[EPIC] [Domain] High-Level Strategic Outcome`

* **Risk Field:** `1 - High` | `2 - Medium` | `3 - Low`

* **Priority Field:** `1` (Highest) to `4` (Lowest)


* **Description:** High-level business impact, regulatory drivers, and executive summary.


* **Success Criteria (Definition of Done):** Quantitative business metrics and architectural milestones.



```text
Title: [EPIC] [Auth] Implement Multi-Factor Authentication (MFA) Across Enterprise Portals
Area Path: Identity\Auth
Iteration Path: Release 2026.Q3
Risk: 1 - High | Priority: 1
Tags: security, compliance, epic

Description:
To comply with updated SOC2 requirements and reduce account takeover risks, our core web platform must enforce mandatory Multi-Factor Authentication (MFA) for all administrative and end-user accounts by end of Q3.

Business Value:
- Achieves SOC2 compliance certification.
- Reduces credential stuffing vulnerability by 99%.

Success Criteria (Definition of Done):
- SMS OTP and Authenticator App (TOTP) supported as secondary verification factors.
- 100% of admin users mandated to enroll upon next login.
- Zero downtime deployment across all web and mobile client applications.
- Audit logging enabled for all MFA state changes and failed verification attempts.

```

### 2. Feature

A **Feature** delivers a functional system capability under a parent Epic, usually spanning 1 to 3 sprints. AI agents evaluate Features during system design (SDLC Phase 3) to draft database schemas, OpenAPI contracts, and child Issue backlogs.

* **Title Structure:** `[FEATURE] [Component] Action Verb + Functional Capability`

* **Parent Link:** Link to target Epic.


* **Story Points / Effort:** Aggregate estimate (sum of child Issues).


* **Risk & Priority:** Assigned on 1–3 and 1–4 scales respectively.


* **Description:** Functional architecture outline, target personas, and scope boundaries (In Scope vs Out of Scope).


* **Acceptance Criteria:** High-level functional capabilities required for completion.



```text
Title: [FEATURE] [Auth] Authenticator App (TOTP) Verification & Setup Flow
Parent Link: Epic 10402: Implement Multi-Factor Authentication (MFA)
Area Path: Identity\Auth
Iteration Path: Sprint 42
Story Points: 13 | Risk: 2 - Medium | Priority: 1
Tags: auth, backend, frontend

Description:
Provide users with the ability to pair a time-based one-time password (TOTP) authenticator application (e.g., Google Authenticator, 1Password) with their account, store encrypted secrets, and verify TOTP tokens during login.

Scope Boundaries:
- In Scope: QR code generation, secret key display, TOTP code validation, 10 single-use recovery backup codes.
- Out of Scope: Hardware key support (YubiKey/WebAuthn - handled in separate Feature).

Acceptance Criteria:
- Users can navigate to /settings/mfa and initiate QR code pairing.
- Secret keys are stored in database encrypted at rest using AES-256.
- Login endpoint accepts and validates 6-digit TOTP codes with a 30-second clock skew tolerance window.
- User is issued 10 single-use recovery codes upon successful pairing.

```

### 3. Issue (Product Backlog Item)

An **Issue** represents the primary unit of executable work assigned to developers and autonomous AI agents. An Issue MUST represent a single, testable deliverable capable of being completed within a single sprint or agent loop.

Every Issue assigned to an AI agent **must** utilize Behavior-Driven Development (BDD) *Given / When / Then* syntax inside its Acceptance Criteria to completely remove scope ambiguity.

* **Title Structure:** `[ISSUE] [Service/Module] Action Verb + Specific Deliverable`

* **Parent Link:** Link to parent Feature.


* **Story Points:** Fibonacci scale (`1`, `2`, `3`, `5`, `8`).


* **Risk & Priority:** Assigned baseline risk and priority ratings.


* **Description:** User story statement (*As a... I want... So that...*) along with technical routes and payload specs.


* **Acceptance Criteria (BDD Syntax):** Explicit scenario blocks detailing pre-conditions, trigger actions, and expected outputs.



```text
Title: [ISSUE] [API] Implement Redis Sliding-Window Rate Limiting on TOTP Verification Endpoint
Parent Link: Feature 10515: Authenticator App (TOTP) Verification & Setup Flow
Area Path: Identity\Auth
Iteration Path: Sprint 42
Story Points: 3 | Risk: 2 - Medium | Priority: 1
Tags: agent-eligible, backend, redis, security

Description:
As a Platform Security Engineer,
I want to enforce rate limiting on the /api/v1/auth/mfa/verify endpoint,
So that malicious actors cannot brute-force 6-digit TOTP tokens.

Technical Context:
- Target Endpoint: POST /api/v1/auth/mfa/verify
- Tech Stack: Node.js / Express, ioredis client.
- Rate Limit Rule: Max 5 failed attempts per user ID per 15-minute sliding window.

Acceptance Criteria (BDD Format):

Scenario 1: Successful verification under limit
Given an authenticated user submitting a valid 6-digit TOTP code
When the user has submitted fewer than 5 failed attempts in the last 15 minutes
Then return HTTP 200 OK with payload { "status": "verified" }
And reset the failed attempt counter in Redis for this user.

Scenario 2: Exceeding failed attempt threshold
Given a user who has accumulated 5 failed TOTP verification attempts within 15 minutes
When the user submits a 6th verification request (valid or invalid)
Then return HTTP 429 Too Many Requests
And return header Retry-After: <seconds_remaining>
And publish an audit event to events.auth.rate_limited.

Scenario 3: Rate limit expiry
Given a user who was rate limited at timestamp T
When 15 minutes have elapsed since the first failed attempt in the window (T + 900s)
Then allow subsequent verification attempts without returning 429.

```

### 4. Task

A **Task** represents a granular technical step required to complete an Issue or Bug. Tasks break down implementation details into localized code changes, database migrations, or unit test files. AI agents in local sandboxed environments execute Tasks within individual iterative cycles.

* **Title Structure:** `[TASK] [Subsystem] Actionable Development Step`

* **Parent Link:** Link to target Issue or Bug.


* **Original Estimate / Remaining Work:** Estimated execution hours (e.g., `2.0`, `4.0`).


* **Activity:** `Development` | `Testing` | `Design` | `Documentation` | `Deployment`.


* **Description:** Step-by-step developer guidelines, targeted file paths, and class definitions.



```text
Title: [TASK] [DB] Create Redis Key Schema and Helper Class for Sliding Window Counters
Parent Link: Issue 10820: Implement Redis Sliding-Window Rate Limiting on TOTP Endpoint
Area Path: Identity\Auth
Iteration Path: Sprint 42
Original Estimate: 3.0 Hours | Activity: Development
Tags: redis, backend

Description:
Write a modular helper class in src/services/rateLimiter.ts that interacts with Redis using atomic pipeline commands (MULTI/EXEC).

Implementation Steps:
1. Define key structure: rate_limit:mfa_verify:{userId} as a Redis Sorted Set (ZSET).
2. Implement isRateLimited(userId: string): Promise<RateLimitResult> method.
3. Use current UNIX timestamp in milliseconds as both the score and member value.
4. Execute atomic pipeline:
   - ZREMRANGEBYSCORE key 0 (now - 900000) (remove entries older than 15 mins)
   - ZCARD key (count remaining attempts)
   - EXPIRE key 900 (refresh key TTL)
5. Add unit tests in tests/services/rateLimiter.test.ts mocking Redis responses.

```

### 5. Bug

A **Bug** documents an application defect, security vulnerability, or functional regression. To allow an AI agent to fix a bug autonomously, the ticket **must include explicit reproduction steps**, environment configuration, and expected versus actual output. AI agents must execute a failing automated test reproducing the defect prior to submitting a fix pull request.

* **Title Structure:** `[BUG] [Module/API] Clear Failure Summary`

* **Severity:** `1 - Critical` | `2 - High` | `3 - Medium` | `4 - Low`.


* **Priority:** `1` to `4`.


* **System Info:** Operating system, browser version, environment (Staging/Prod), commit SHA / container image.


* **Repro Steps & Behavior:** Numbered steps to trigger failure, actual error output, and expected correct behavior.


* **Acceptance Criteria:** Mandatory failing test requirement and zero-regression validation.



```text
Title: [BUG] [API] TOTP Verification Throws HTTP 500 When User ID Contains Uppercase Characters
Area Path: Identity\Auth
Iteration Path: Sprint 42
Severity: 2 - High | Priority: 1 | Risk: 1 - High
Tags: bug, agent-eligible, production-issue

System Info:
- Environment: Staging & Production
- Service: auth-service:v2.14.1
- Database: PostgreSQL 15 / Redis 7.0

Steps to Reproduce:
1. Log in with an account whose user_id contains uppercase letters (e.g., User_992A).
2. Navigate to MFA prompt and enter valid TOTP token 123456.
3. Submit form to POST /api/v1/auth/mfa/verify.

Actual Behavior:
API responds with HTTP 500 Internal Server Error.
Stack trace log: Unhandled Exception: KeyNotFoundException in Redis lookup for rate_limit:mfa_verify:User_992A due to casing mismatch in DB query join.

Expected Behavior:
API should normalize user_id to lowercase before executing database queries and Redis lookups, returning HTTP 200 OK upon valid TOTP submission.

Acceptance Criteria:
- Write a failing integration test in tests/integration/mfa_casing.test.ts passing uppercase user IDs.
- Normalize user_id string inputs to lowercase at API route handling layer (src/routes/mfa.ts).
- Verify bug fix with zero regression on standard lowercase user IDs.
- All existing test suites pass successfully in CI/CD pipeline.

```

### Azure DevOps Ticket Quality Matrix

| Work Item Type | Primary Role in AI SDLC | Key Azure DevOps Fields | Required Detail Standard |
| --- | --- | --- | --- |
| **Epic** | Strategic direction & roadmap grouping

 | Risk, Priority, Success Criteria

 | High-level business impact & compliance goals

 |
| **Feature** | Architectural component scoping

 | Story Points, Parent Link, Scope Boundaries

 | Technical boundaries & system deliverables

 |
| **Issue** | **Direct Agent Execution Unit**<br> | Story Points, BDD Criteria, Tags

 | **Given/When/Then** explicit test scenarios

 |
| **Task** | Sub-unit execution step

 | Activity, Original Estimate, Parent Link

 | Precise code paths, file names, & technical steps

 |
| **Bug** | Regression & defect remediation

 | Severity, System Info, Repro Steps

 | Exact repro steps, stack trace, & expected vs actual

 |

---

## 8. Documentation as a First-Class Citizen & Planning Standards

In a traditional software organization, documentation is often treated as an afterthought—written right before a release or skipped entirely due to time constraints. In an AI-augmented enterprise, **outdated or missing documentation is an outage waiting to happen**. AI agents do not have "tribal knowledge" or institutional memory; they rely strictly on the context provided in repository files, API schemas, design docs, and ticket descriptions. If documentation is ambiguous, incomplete, or wrong, agents will produce hallucinated architectures, violate domain boundaries, and break production.

Documentation must be treated as a **first-class citizen**, held to the exact same quality and review standards as production code.

### 1. System-Level Documentation (Outside of Code)

System-level documentation establishes the architectural boundaries, business rules, and design trade-offs before a single line of code is written.

#### A. Ubiquitous Domain Glossary (`GLOSSARY.md`)

To prevent semantic ambiguity across frontend, backend, database, and prompt layers, every repository must maintain a root-level `GLOSSARY.md` file. Terms must have a single, canonical definition across all systems.

```markdown
# Domain Glossary

### Active User
A user account with status = 'ACTIVE' that has authenticated within the last 30 rolling days. 
* Anti-Pattern: Do not confuse with "Registered User" (created account but may never have logged in) or "Subscribed User" (has an active billing plan).

### Organization Tenant
A top-level entity (tenant_id) representing an enterprise client. All database queries for multi-tenant data MUST include WHERE tenant_id = :tenant_id.

### TOTP (Time-Based One-Time Password)
A 6-digit cryptographic code generated by an authenticator application (RFC 6238) valid for a 30-second window.

```

#### B. AI-Ready Product Requirement Documents (PRDs)

PRDs translate raw product ideation and stakeholder interviews into structured, machine-readable specifications. PRDs live in the repository under `/docs/prds/` or are linked directly in Azure DevOps Epics/Features.

* **Problem Statement & Business Goal:** Clear, quantitative outcome statement.


* **User Personas & Flows:** Step-by-step user interaction journey.


* **Functional Requirements:** BDD-style functional requirement statements.


* **Non-Functional Requirements:** Performance SLAs, security boundaries, and rate limits.


* **Data & Schema Impact:** New database entities or field migration requirements.



#### C. Architecture Decision Records (ADRs)

ADRs capture **why** architectural decisions were made, what alternatives were evaluated, and what trade-offs were accepted. Without ADRs, AI agents (and human engineers) will routinely propose refactoring code back into an anti-pattern that was intentionally discarded six months prior.

ADRs live in `/docs/adr/000X-short-title.md`.

```markdown
# ADR 0003: Use Redis Sliding-Window for TOTP Rate Limiting

* Status: Accepted
* Date: 2026-07-21
* Deciders: Principal Architect, Lead Security Engineer

## Context
To prevent brute-force attacks on our 6-digit TOTP authentication endpoint (/api/v1/auth/mfa/verify), we must enforce strict rate limiting (max 5 failed attempts per user per 15-minute window).

## Considered Options
1. PostgreSQL Database Lookup: Querying failed_attempts table on every login request.
2. In-Memory Local App Cache (Node.js Memory): Tracking attempts in process memory.
3. Redis Sorted Set (ZSET) Sliding-Window: Distributed rate-limiting counter in Redis.

## Decision
We chose Option 3 (Redis Sorted Set) because:
* PostgreSQL queries under high authentication load introduce unacceptable DB lock latency.
* In-memory local app cache fails in horizontally scaled multi-pod Kubernetes deployments because requests are round-robined across pods.

## Consequences
* Positive: Atomic, distributed rate-limiting across all app instances with sub-millisecond response latency.
* Negative: Introduces a dependency on the Redis cluster. If Redis goes down, authentication falls back to fail-closed state.

```

#### D. Schema-First API Contracts

Never let an agent infer API shapes from implementation code. Define OpenAPI (Swagger) or Protocol Buffer contracts **before** writing frontend or backend code.

* **Location:** `/docs/api/openapi.yaml`

* **Rule:** Frontend and backend code generators must bind to this file. Changes to endpoints must happen in `openapi.yaml` first.



### 2. Code-Level Documentation Standards

Code-level documentation explains the **intent, logic boundaries, and assumptions** of individual modules.

#### A. Self-Documenting Code vs. Explanatory Comments

* **Code describes WHAT and HOW:** Clean variable naming, modular functions, and strong type annotations reduce redundant noise.


* **Comments describe WHY:** Comments should explain non-obvious business rules, workaround hacks, or performance trade-offs.



```typescript
// BAD COMMENT: Explaining what the code clearly already says
// Increment count by 1
count = count + 1;

// BAD COMMENT: Fetch user from database
const user = await db.users.findById(id);

// GOOD COMMENT: Explaining the "WHY", business rules, or non-obvious constraints
// We enforce a 30-second clock skew tolerance window to account for drift 
// between client authenticator devices and our NTP servers (RFC 6238 section 5.2).
const isTotpValid = totp.verify({
  token: userProvidedCode,
  secret: userMfaSecret,
  window: 1 // +/- 30 seconds
});

```

#### B. Standardized Module & Function Docstrings

All exported functions, types, and classes must include structured docstrings (TSDoc, JSDoc, Python Docstrings).

```typescript
/**
 * Verifies a time-based one-time password (TOTP) against a user's encrypted secret.
 *
 * @param userId - Unique UUID of the user attempting verification.
 * @param token - 6-digit numeric string provided by the user.
 * @returns Promise resolving to `true` if valid, or `false` if expired/incorrect.
 * 
 * @throws {@link RateLimitExceededException} If user has exceeded 5 failed attempts in 15 mins.
 * @throws {@link UserNotFoundException} If user ID does not exist in active database.
 * 
 * @example
 * ```ts
 * const isValid = await verifyTotpToken("usr_992a", "123456");
 * ```
 */
export async function verifyTotpToken(userId: string, token: string): Promise<boolean> {
  // Implementation
}

```

#### C. Commit Messages & PR Descriptions

Commits and Pull Requests are historical documentation. Every commit and PR must follow conventional formats linked directly to Azure DevOps work items.

```text
feat(auth): add Redis sliding-window rate limiting for TOTP verification [AB#10820]

- Implement Redis Sorted Set counter in rateLimiter.ts
- Add unit tests verifying 5-attempt limit and 15-min expiry window
- Update openapi.yaml to include HTTP 429 response schema

Closes AB#10820

```

### 3. Mandatory Execution Rules for Engineers & AI Agents

To ensure documentation remains accurate over time, human developers and AI agents must follow these explicit rules while working on a ticket:

* **Rule 1: The Atomic PR Rule (Code + Docs in One PR):** If a PR modifies function signatures, API schemas, or environment variables, the corresponding documentation (`openapi.yaml`, `README.md`, or docstrings) **must** be updated inside the *exact same PR*. CI gates will reject PRs if API schemas or export signatures are altered without doc updates.


* **Rule 2: Continuous In-Flight Work Logging:** Before writing code, engineers or agents must post an implementation plan as a comment on the Azure DevOps ticket. If an unexpected technical blocker changes the approach mid-task, add a comment explaining the pivot before proceeding.


* **Rule 3: The ADR Trigger:** If an engineer or agent makes an architectural choice that introduces a new dependency, alters a data model, or impacts system security, an ADR **must** be drafted under `/docs/adr/` as part of that ticket.



### 4. Documentation Do's and Don'ts Matrix

| Area | DO ✅ | DON'T ❌ |
| --- | --- | --- |
| **System Terms** | Maintain a single `GLOSSARY.md` file for domain entity definitions.

 | Allow "User", "Account", and "Member" to be used interchangeably without definition.

 |
| **Code Comments** | Comment on **why** a complex workaround or security window exists.

 | Comment on obvious code operations (e.g., `// increment i by 1`).

 |
| **API Design** | Write OpenAPI/Swagger specs **before** writing backend/frontend code.

 | Build API routes first and try to auto-generate docs from messy code later.

 |
| **Pull Requests** | Update code, docstrings, and design docs together in a single atomic PR.

 | Merge code changes with a promise to "update the docs next week".

 |
| **Architecture** | Record trade-offs and discarded options in `ADR` files.

 | Rely on private chats or meetings to decide architectural direction.

 |
| **Ticket Writing** | Use BDD *Given / When / Then* syntax in Azure DevOps acceptance criteria.

 | Write vague bullet points like "Fix authentication page bugs".

 |

---

## 9. Recommended Skills Library

Skills are reusable playbooks loaded into an agent's working context when a specific task requires domain expertise:

* `/grill-me`: Conducts exhaustive alignment interviews to clarify specs, edge cases, and business intent before writing code.


* `/grill-with-docs`: Interrogates planning decisions while building lasting codebase glossary terms and architectural decision records.


* `ponytail` (`/ponytail-review`, `/ponytail-audit`, `/ponytail-debt`): Drives solutions toward minimal complexity, audits technical debt, and enforces simple architectural patterns.


* `BugBot`: Specialized, automated pull-request auditing agent for catching low-level code bugs and security regressions in diffs.



---

## 10. The Dream: Hybrid Frontier/Local Execution Architecture

The optimal enterprise AI architecture splits tasks between cloud-based frontier models and fast local models to achieve frontier-level reasoning at local execution cost:

| Model Layer | Examples | Core Responsibilities |
| --- | --- | --- |
| **Frontier Models** | Claude Opus 4.8, GPT-5.6 class

 | High-level system design, complex planning, gating reviews, and architectural judgment.

 |
| **Local / Edge Models** | Gemma 4, Qwen 3.6, DeepSeek V4 class

 | Repetitive code generation, linter loops, unit test writing, and localized refactoring in sandboxed setups.

 |

This hybrid structure ensures expensive frontier models are reserved for critical judgment calls, while fast local models handle repetitive implementation tasks across large engineering organizations.