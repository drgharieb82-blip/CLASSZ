# CLASSZ Master Plan

CLASSZ is a long-term EdTech SaaS platform built as a modular monolith first, with feature boundaries that can evolve into microservices when scale, team ownership, or deployment needs justify it.

## Delivery Model

- Product architecture: browser-based multi-teacher education ecosystem.
- Engineering approach: clean modular monolith, feature-first boundaries, API-first contracts, and Docker from day one.
- Release strategy: ship stable foundations early, then expand academic, content, assessment, finance, analytics, and SaaS capabilities in controlled phases.

## Status Legend

| Status | Meaning |
| --- | --- |
| Planned | Designed but not started. |
| In Progress | Actively being implemented. |
| Foundation | Structural placeholder or baseline exists. |
| Ready | Usable for production workflow. |
| Deferred | Intentionally postponed. |

## Stage 1: Foundation Launch

Stage 1 establishes the core product required to operate CLASSZ as a reliable education platform for admins, teachers, assistants, students, and parents.

### Phase 0: Foundation

Objective: establish architecture, infrastructure, roles, authentication foundations, design language, and module boundaries.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Foundation | Auth, users, courses, lessons, lesson blocks, videos, quizzes, assignments, parents, assistants, payments, wallets, reports, notifications, and admin module boundaries. |
| Tables | Foundation | User table and role enum baseline. |
| APIs | Foundation | Health endpoint and auth configuration boundary. |
| Screens | Foundation | Responsive role-based shell and dashboard placeholder surfaces. |

### Phase 1: Academic Core

Objective: support teachers, students, assistants, classrooms, enrollments, academic groups, and permissions.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Users, teachers, assistants, students, parents, classrooms, enrollments. |
| Tables | Planned | Profiles, teacher-student links, assistant assignments, classroom membership. |
| APIs | Planned | User management, role switching, enrollment operations, classroom access. |
| Screens | Planned | Admin people management, teacher roster, assistant workspace, student profile, parent-student linking. |

### Phase 2: Content System

Objective: provide course, lesson, lesson block, video, attachment, and rich content authoring foundations.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Courses, lessons, lesson blocks, videos, media library. |
| Tables | Planned | Courses, course sections, lessons, blocks, video assets, attachments. |
| APIs | Planned | Course CRUD, lesson builder, content publishing, media references. |
| Screens | Planned | Course studio, lesson editor, content library, student lesson viewer. |

### Phase 3: Assessment

Objective: implement quiz, assignment, grading, submission, attempt, and feedback workflows.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Quizzes, assignments, questions, attempts, submissions, grading. |
| Tables | Planned | Question banks, quiz attempts, assignment submissions, rubrics, grade records. |
| APIs | Planned | Quiz authoring, attempt lifecycle, submission upload, grading actions. |
| Screens | Planned | Quiz builder, live attempt view, assignment board, grade review, feedback timeline. |

### Phase 4: Teacher Ecosystem

Objective: enable teachers to manage learning operations at scale.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Teacher dashboard, assistant delegation, cohort management, content workflow. |
| Tables | Planned | Teacher workspaces, assistant permissions, cohort metadata, announcements. |
| APIs | Planned | Teacher analytics, assistant scopes, cohort actions, operational summaries. |
| Screens | Planned | Teaching command center, assistant task board, cohort performance, content calendar. |

### Phase 5: Parent System

Objective: give parents clear visibility into progress, billing, attendance, and communication.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Parents, linked students, reports, notifications. |
| Tables | Planned | Parent-student relationships, progress snapshots, notification preferences. |
| APIs | Planned | Parent dashboard data, child progress, billing visibility, alerts. |
| Screens | Planned | Family dashboard, child performance detail, payment summary, notification center. |

### Phase 6: Finance

Objective: support platform payments, wallets, teacher earnings, refunds, and financial reporting.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Payments, wallets, invoices, subscriptions, payouts. |
| Tables | Planned | Payment transactions, wallet balances, invoices, payout records, refund records. |
| APIs | Planned | Checkout, wallet ledger, invoice generation, payout reconciliation. |
| Screens | Planned | Admin finance center, teacher earnings, student billing, parent invoices. |

### Phase 7: Admin & Analytics

Objective: provide platform governance, operational monitoring, analytics, and audit visibility.

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Admin, reports, analytics, audit logs, notifications. |
| Tables | Planned | Audit events, system metrics, report snapshots, notification logs. |
| APIs | Planned | Admin controls, analytics summaries, exports, audit search. |
| Screens | Planned | Admin command center, analytics dashboard, user moderation, platform settings. |

## Stage 2: Continuous Evolution

Stage 2 expands CLASSZ beyond the launch foundation into a full education operating system with real-time learning, marketplace capabilities, mobile apps, AI, and enterprise SaaS controls.

### Phase 8: Live Classes

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Live sessions, attendance, recordings, schedules. |
| Tables | Planned | Live rooms, attendance records, session recordings, schedules. |
| APIs | Planned | Session creation, join links, attendance capture, recording access. |
| Screens | Planned | Live class lobby, teacher live console, student live class page. |

### Phase 9: Communication

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Messaging, announcements, notifications, discussion spaces. |
| Tables | Planned | Conversations, messages, announcements, notification deliveries. |
| APIs | Planned | Messaging, broadcast announcements, notification preferences. |
| Screens | Planned | Inbox, class feed, announcement composer, notification center. |

### Phase 10: Marketplace

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Course marketplace, teacher storefronts, discovery, reviews. |
| Tables | Planned | Listings, storefronts, reviews, categories, promotions. |
| APIs | Planned | Discovery, listing management, reviews, recommendations. |
| Screens | Planned | Marketplace home, teacher store, course detail, review management. |

### Phase 11: Certificates & Gamification

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Certificates, badges, achievements, streaks, leaderboards. |
| Tables | Planned | Certificate templates, issued certificates, badges, achievement events. |
| APIs | Planned | Certificate issuance, badge awarding, progress milestones. |
| Screens | Planned | Certificate gallery, achievement center, leaderboard, progress streaks. |

### Phase 12: Mobile Apps

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Mobile API gateway, push notifications, offline learning. |
| Tables | Planned | Device tokens, mobile sessions, sync checkpoints. |
| APIs | Planned | Mobile-optimized endpoints, push registration, offline sync. |
| Screens | Planned | Native student app, parent app, teacher companion views. |

### Phase 13: AI System

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | AI tutor, content assistant, grading assistant, analytics assistant. |
| Tables | Planned | AI prompts, generated content, assistant sessions, review logs. |
| APIs | Planned | Tutor responses, content generation, rubric suggestions, moderation. |
| Screens | Planned | AI tutor panel, teacher creation assistant, admin AI governance. |

### Phase 14: Advanced Analytics

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Learning analytics, retention analytics, revenue analytics, prediction models. |
| Tables | Planned | Event streams, aggregate metrics, cohorts, predictions. |
| APIs | Planned | Analytics cubes, exports, custom reports, predictive signals. |
| Screens | Planned | Analytics studio, cohort explorer, revenue intelligence, risk insights. |

### Phase 15: Multi-Tenant SaaS

| Area | Status | Notes |
| --- | --- | --- |
| Modules | Planned | Tenant management, custom domains, branding, tenant billing, enterprise roles. |
| Tables | Planned | Tenants, tenant users, domain mappings, branding settings, plans. |
| APIs | Planned | Tenant provisioning, tenant-scoped access, branding configuration. |
| Screens | Planned | SaaS admin console, tenant settings, brand studio, enterprise dashboard. |
