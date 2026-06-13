# CLASSZ Team Architecture

## Team Vision

CLASSZ is owned and maintained as a long-term education platform with a clear technical authority model, protected AI systems, and focused collaboration across frontend, content, backend, and intelligence layers.

The team structure is designed to keep development fast while protecting the architectural integrity of the platform. Each contributor has a clear area of responsibility, clear branch boundaries, and a review path that keeps production, AI Core, and student memory systems under controlled ownership.

## Team Roles

### Dr. Ahmed Gharib

**Role:** Founder, Owner, Architect, AI Engineer, Full Project Maintainer

Dr. Ahmed Gharib has full ownership of the CLASSZ platform and final responsibility for architecture, implementation direction, protected systems, review decisions, and production readiness.

Responsibilities:

- Full ownership of the entire CLASSZ platform
- Core architecture
- Backend systems
- Frontend work when required
- AI systems
- Concept Engine
- Student Memory
- Explainable AI
- Integrations
- Content systems
- Infrastructure
- Final review and merge decisions

Access:

- Full access to all branches
- Full access to frontend, backend, AI, content, and infrastructure areas
- Bypass permissions for protected AI Core branches when required
- Authority to approve, merge, reject, or request changes on all pull requests

### Eyad Gharib

**Role:** Frontend Engineer

Eyad Gharib is responsible for the student-facing frontend experience and interactive product layers.

Responsibilities:

- Student Dashboard
- UI Components
- UX
- Gamification
- Charts
- Animations
- Responsive Design

Working branch:

- `eyad`

Restrictions:

- Cannot push directly to `main`
- Cannot push directly to `develop`
- Cannot modify protected AI Core branches
- Cannot modify Student Memory, Explainable AI, Concept Engine, or protected integration logic without review and approval
- Must submit frontend changes through pull requests

### Adham Gharib

**Role:** Content Contributor and First Student

Adham Gharib represents the first-student perspective and supports the platform by testing learning flows, reviewing content clarity, and giving direct feedback on the student experience.

Responsibilities:

- Act as the first real student user for CLASSZ
- Review lessons, questions, exams, notes, and learning flows from a student point of view
- Provide feedback on difficulty, clarity, motivation, and usability
- Help validate student dashboard behavior, progress tracking, memory timeline outputs, and gamification feedback
- Support content quality checks where appropriate

Restrictions:

- Does not push directly to protected branches
- Does not modify AI Core, backend, security, integration, or infrastructure code
- Feedback and content notes should be reviewed before becoming part of production content

## Git Workflow

All project work should follow a controlled Git workflow:

- Work is done on feature, role, or phase branches
- Direct commits to protected branches are restricted
- Pull requests are required for collaborative changes
- Reviews must focus on correctness, architecture, product impact, and safety
- AI Core changes require stricter review than normal frontend or content changes

Developers should keep commits focused and readable. Each commit should describe a single logical change whenever possible.

## Branch Strategy

Primary branches:

- `main`: Production-ready code and approved documentation
- `develop`: Integration branch for approved upcoming work
- `eyad`: Frontend working branch for Eyad Gharib
- Phase branches: Temporary branches for major roadmap phases
- AI Core branches: Protected branches for memory, concept, explainability, and intelligent learning systems

Recommended feature branch examples:

- `feature/student-dashboard`
- `feature/gamification-ui`
- `feature/memory-timeline`
- `fix/responsive-dashboard-layout`
- `docs/team-architecture`

## Protected Branches

The following branches are considered protected:

- `main`
- `develop`
- Any AI Core branch
- Any release branch
- Any production hotfix branch

Protected branch rules:

- No direct pushes except by authorized maintainer access
- Pull request required before merge
- Final approval required from Dr. Ahmed Gharib
- AI Core changes require architectural review
- Production changes require review for stability and rollback risk

## AI Core Protection Rules

AI Core areas are treated as protected systems because they affect learning decisions, personalization, student memory, concept analysis, and explainable AI behavior.

Protected AI Core areas include:

- Concept Engine
- Student Memory
- Memory Timeline
- Explainable AI
- Adaptive quiz logic
- Weakness analysis
- Personalized revision logic
- AI Teacher behavior
- AI integrations

Rules:

- Only Dr. Ahmed Gharib may approve AI Core changes
- Frontend changes must not alter AI Core behavior without review
- Content changes must not redefine concept logic without approval
- AI behavior changes must be explainable, reviewable, and reversible
- Student data, memory records, and learning signals must be handled carefully
- Any AI decision that affects a student should remain auditable and understandable

## Pull Request Workflow

Every pull request should include:

- Clear title
- Summary of changes
- Affected areas
- Screenshots or notes for UI changes when relevant
- Testing or verification notes
- Any known risks or follow-up work

Review expectations:

- Frontend changes are reviewed for UX, responsiveness, consistency, and product fit
- Backend changes are reviewed for correctness, data safety, and maintainability
- AI Core changes are reviewed for learning impact, explainability, and architecture
- Content changes are reviewed for clarity, educational value, and student comprehension

Merge authority:

- Dr. Ahmed Gharib has final merge authority
- Eyad Gharib may submit frontend pull requests from `eyad` or feature branches
- Adham Gharib may provide feedback and validation notes but does not merge code

## Current Progress

CLASSZ currently has its core platform architecture defined and is moving through the smart learning foundation.

Current focus areas:

- Student learning experience
- Concept-based progress tracking
- Student Memory foundations
- Frontend dashboard and gamification work
- AI-assisted learning structure
- Protected architecture for future explainable intelligence

The project is currently working from the `feature/student-memory` branch context.

## Next Phase: Phase 6.3 Memory Timeline

Phase 6.3 focuses on the Memory Timeline: a student-facing and system-facing view of learning history, progress signals, concept mastery changes, and meaningful educational events.

Phase goals:

- Track important student learning events over time
- Connect timeline events to concepts, lessons, quizzes, and revision actions
- Support explainable AI recommendations using visible memory history
- Help students understand how their learning profile is changing
- Help teachers review student progress with context instead of isolated scores

Protection level:

- Phase 6.3 is part of the AI Core protection area
- Changes require review by Dr. Ahmed Gharib
- Frontend timeline views may be developed separately, but memory logic and AI interpretation remain protected

Expected collaboration:

- Dr. Ahmed Gharib owns architecture, memory logic, AI interpretation, and final review
- Eyad Gharib may support frontend timeline UI, charts, animations, and responsive presentation
- Adham Gharib may validate the timeline as the first-student user and provide feedback on clarity, motivation, and usefulness
