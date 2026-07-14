# CLASSZ Student Journey UX Audit

**Date:** 2026-06-21
**Branch:** lovable-ui-import
**Scope:** Full student flow from Landing to Wall of Honor
**Method:** Source inspection of all routes, components, stores, and mock data

---

## Journey Map

```
Landing → Courses Catalog → Course Details → Register/Login → Checkout/Wallet
→ My Courses → Continue Learning → Session → Quiz/Practice → Wrong Questions
→ Progress → Certificates → Wall of Honor
```

---

## 1. Landing Page

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/` → `src/routes/index.tsx` |
| **Severity** | — |

**What works:**
- Hero section with animated stats card and CTA buttons
- 4 feature pillars (Structured courses, AI assistant, Gamified learning, Analytics)
- Featured courses section (4 cards) linking to `/courses`
- "How it works" 4-step guide
- AI Assistant + Parent monitoring preview cards
- Pay-per-course model section (replaces old pricing)
- Testimonials carousel
- Hall of Honor featured students
- Final CTA card linking to `/register`

**Issues:**
- None critical. Section is polished and well-structured.

**Recommendation:**
- Add a "Browse Courses" CTA inside the hero area alongside Register/Login for visitors who already know they want to explore.

**Files:** `src/routes/index.tsx`, `src/components/premium/HeroSlider.tsx`

---

## 2. Courses Catalog

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/courses` → `src/routes/courses.index.tsx` |
| **Severity** | — |

**What works:**
- Full course grid with 8 courses
- Subject filter (9 categories)
- Real-time search by title
- CourseCard links correctly to `/courses/$courseId`
- Price display and "View course →" text

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 2.1 | Only 8 mock courses; header claims "200+ courses" | Low |
| 2.2 | No pagination or "Load more" pattern | Low |
| 2.3 | Filter button (SlidersHorizontal icon) has no functionality | Medium |
| 2.4 | No sort options (by price, rating, popularity) | Medium |

**Recommendation:**
- Wire up the filter icon to show level/price/rating filter panel
- Add sort dropdown (Most Popular, Newest, Price Low→High)

**Files:** `src/routes/courses.index.tsx`, `src/components/common/CourseCard.tsx`

---

## 3. Course Details (Public)

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/courses/$courseId` → `src/routes/courses.$courseId.tsx` |
| **Severity** | — |

**What works:**
- Full hero with gradient, badges (subject, level, tag)
- Course stats (teacher, rating, students, lessons, hours)
- Enrollment card with price and payment options
- "What you'll learn" outcomes grid
- Course content chapters list with lock/preview indicators
- Instructor bio card
- Student reviews
- Sidebar "This course includes" info
- Mobile sticky CTA bar
- "Enroll Now" → checks auth → redirects to login with `returnUrl` if unauthenticated
- "Continue Learning" shown if already enrolled

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 3.1 | "Preview" chapters are not actually playable — no video/content preview | Low |
| 3.2 | No "Share course" or "Add to wishlist" functionality | Low |
| 3.3 | Reviews are hardcoded in mock — no indication of total count | Low |

**Recommendation:**
- Add a "Free Preview" modal or link for chapters marked as preview
- Add share button (copy link)

**Files:** `src/routes/courses.$courseId.tsx`, `src/lib/courseDetailsMock.ts`

---

## 4. Register / Login

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Routes** | `/register` → `src/routes/register.tsx`, `/login` → `src/routes/login.tsx` |
| **Severity** | — |

**What works:**
- **Register:** 5-step wizard (Student → Account → Parent → Identity → Review)
  - Field validation per step, password strength meter, avatar picker
  - API integration with error handling
  - Success screen redirects to `/courses` with "Browse Courses" and "Go to Dashboard" buttons
- **Login:** Email/password form with error display
  - `returnUrl` search param support for post-auth redirect
  - Role-based redirect (student → /student, teacher → /teacher, etc.)
  - Dev-only quick access panel

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 4.1 | No "Forgot password" link on login page | Medium |
| 4.2 | No social login options (Google, Apple) | Low |
| 4.3 | Register success auto-redirects after 3.2s — user may not notice the buttons | Low |
| 4.4 | No email verification step after registration | Medium |

**Recommendation:**
- Add "Forgot password?" link (can be placeholder for now)
- Increase auto-redirect delay or make it only trigger if user doesn't interact

**Files:** `src/routes/register.tsx`, `src/routes/login.tsx`

---

## 5. Checkout / Wallet

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Routes** | `/student/courses/$courseId/enroll` → `src/routes/student.courses.$courseId.enroll.tsx`, `/student/wallet` → `src/routes/student.wallet.tsx` |
| **Severity** | — |

**What works:**
- **Enrollment page:**
  - Course summary card with price
  - 4 payment methods (Wallet, Card, Fawry, Vodafone Cash)
  - Wallet balance check with "Insufficient balance" warning + upsell to recharge
  - Revenue breakdown (course price, platform fee 15%, teacher share 85%)
  - Processing animation (1.5s mock delay)
  - Success state with "My Courses" and "Start Learning" buttons
- **Wallet page:**
  - Balance display on gradient card
  - Recharge form (preset $10/$25/$50/$100 + custom amount)
  - 3 payment methods for recharge
  - Transaction history with credit/debit styling
  - Persistent state via Zustand + localStorage

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 5.1 | No auth guard on `/student/courses/$courseId/enroll` — unauthenticated users can access directly | High |
| 5.2 | No auth guard on `/student/wallet` — same issue | High |
| 5.3 | Card/Fawry/Vodafone payment methods are fully mocked — no form fields for card number, etc. | Medium |
| 5.4 | Wallet page is not linked from sidebar navigation | Medium |
| 5.5 | After enrollment, the course does NOT appear in "My Courses" (enrollment store is separate from mock enrolledCourses) | High |
| 5.6 | No purchase confirmation email or receipt display | Low |

**Recommendation:**
- Add `beforeLoad` auth guard to both enrollment and wallet routes
- Bridge enrollment store with My Courses page (show enrolled courses from store)
- Add Wallet link to student sidebar navigation in `src/lib/roles.ts`
- Add basic card number input field for "Card" payment method

**Files:** `src/routes/student.courses.$courseId.enroll.tsx`, `src/routes/student.wallet.tsx`, `src/lib/stores/enrollment-store.ts`, `src/lib/stores/wallet-store.ts`, `src/lib/roles.ts`

---

## 6. My Courses

| Attribute | Value |
|-----------|-------|
| **Status** | Partial |
| **Route** | `/student/courses` → `src/routes/student.courses.index.tsx` |
| **Severity** | Medium |

**What works:**
- Renders 4 EnrolledCourseCard components from hardcoded mock data
- Cards show: progress bar, lessons/quizzes stats, last watched, next lesson, weak/strong concepts
- Action buttons: "Continue Learning" → session, "Details" → overview, "Practice" → /assistant
- Status badges: Active, Completed, Locked

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 6.1 | Courses come from hardcoded `enrolledCourses` mock — NOT from enrollment store | High |
| 6.2 | EnrolledCourseCard uses `<a href>` instead of `<Link to>` — causes full page reload | Medium |
| 6.3 | No search or filter functionality | Medium |
| 6.4 | No empty state for new users with zero enrollments | Medium |
| 6.5 | Locked course shows "Coming Soon" but no unlock/purchase path | Low |
| 6.6 | No connection between course catalog IDs (c1-c8) and enrolled course IDs (ec1-ec4) | High |

**Recommendation:**
- Merge enrollment store into My Courses view — show dynamically enrolled courses alongside mock data
- Replace `<a href>` with `<Link to>` in EnrolledCourseCard for SPA navigation
- Add empty state: "No courses yet. Browse our catalog to get started."
- Add "Buy Now" action to locked courses linking to enrollment

**Files:** `src/routes/student.courses.index.tsx`, `src/components/student/EnrolledCourseCard.tsx`, `src/lib/mock.ts`

---

## 7. Continue Learning → Session

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/student/courses/$courseId/session` → `src/routes/student.courses.$courseId.session.tsx` |
| **Severity** | — |

**What works:**
- Full lesson player layout with collapsible sidebar
- Session tree showing sessions → items (lessons, quizzes, homework, attachments) with status icons
- Content player area (video placeholder, quiz cards, homework cards, attachment cards)
- Lesson header with title, progress, navigation arrows
- LessonTabs component (objectives, key concepts, duration, notes)
- Note-taking system (add/edit/delete/pin notes with smart type detection)
- Previous/Next lesson navigation
- Locked item indicators

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 7.1 | Only course "ec1" has session data in `sessionMock.ts` — others show "Session Not Available Yet" | Medium |
| 7.2 | No actual video playback — just a gradient placeholder | Low |
| 7.3 | Quiz items in sidebar don't link to the full question bank practice | Medium |
| 7.4 | No lesson completion tracking persisted — refreshing resets progress | Medium |
| 7.5 | No "Mark as complete" button for lessons | Medium |

**Recommendation:**
- Add session data for at least 2-3 courses
- Add a "Mark Complete" button that persists completion state
- Link quiz items to the question bank practice flow

**Files:** `src/routes/student.courses.$courseId.session.tsx`, `src/lib/sessionMock.ts`, `src/components/lesson/`

---

## 8. Quiz / Practice (Question Bank)

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/questions` → `src/routes/questions.index.tsx` |
| **Severity** | — |

**What works:**
- State machine with 5 views: Home → Subject → Chapter → Practice → Result
- Subject grid with emoji icons, question counts, progress stats
- Chapter view with lessons, concepts, and exam access
- Practice quiz interface:
  - Question display with 4 options
  - Navigation dots for question jumping
  - Timer display
  - Bookmark toggle
  - Answer selection with correct/incorrect feedback
- Result screen with score, time taken, breakdown
- Retry options: "Wrong Only", "Bookmarked Only", "All"
- Wrong questions automatically tracked

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 8.1 | Route is `/questions` (public-looking) but contains student-specific functionality | Low |
| 8.2 | No connection to enrolled courses — shows all subjects regardless of enrollment | Low |
| 8.3 | Practice results not persisted — lost on page refresh | Medium |
| 8.4 | No difficulty indicator during practice (only shown in chapter view) | Low |

**Recommendation:**
- Consider moving to `/student/questions` for clarity
- Persist practice history to track improvement over time

**Files:** `src/routes/questions.index.tsx`, `src/lib/questionBankMock.ts`

---

## 9. Wrong Questions

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/student/wrong-questions` → `src/routes/student.wrong-questions.tsx` |
| **Severity** | — |

**What works:**
- Subject-level overview showing wrong question counts per subject
- Drill into subject → see individual wrong questions
- Each question shows: text, correct answer, student's wrong answer, retry count, correction status
- Bookmarking system
- Notes per question
- Print view for offline study
- Practice mode to retry wrong questions
- Filter: All / Bookmarked

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 9.1 | Wrong questions are from separate mock data — not connected to Question Bank practice results | Medium |
| 9.2 | No "mastered" state — questions stay wrong forever unless manually cleared | Low |
| 9.3 | No spaced repetition or review scheduling | Low |

**Recommendation:**
- Bridge question bank practice results → wrong questions store
- Add "Mastered" status after N correct retries

**Files:** `src/routes/student.wrong-questions.tsx`, `src/lib/wrongQuestionsMock.ts`

---

## 10. Progress

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/student/progress` → `src/routes/student.progress.tsx` |
| **Severity** | — |

**What works:**
- Hero stats: overall progress %, streak days, average score, total time
- Completion metrics: lessons, sessions, quizzes, homework (bar charts)
- Weekly study time chart
- Per-subject breakdown with individual course progress
- Weak/Strong concepts with score indicators
- Recent activity feed with timestamps
- Personalized recommendations with reasoning

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 10.1 | All data is from `progressMock.ts` — no connection to actual session/quiz activity | Medium |
| 10.2 | Weekly chart is static — doesn't reflect real usage | Low |
| 10.3 | No date range selector (this week / this month / all time) | Low |

**Recommendation:**
- When real data flows, aggregate from session completions and quiz scores
- Add time period toggle

**Files:** `src/routes/student.progress.tsx`, `src/lib/progressMock.ts`

---

## 11. Certificates

| Attribute | Value |
|-----------|-------|
| **Status** | Complete |
| **Route** | `/student/certificates` → `src/routes/student.certificates.tsx` |
| **Severity** | — |

**What works:**
- Certificate carousel with left/right navigation
- Legendary template system (3 ranks: Gold, Diamond, Platinum with metallic gradients)
- Custom fallback template for non-top-3 certificates
- Certificate details: course name, score, date, rank, teacher
- Actions: Download, Share, Print
- Share modal with QR code integration (via `qrcode` library)
- Hall of Honor toggle (publish/unpublish to public wall)
- Challenge status and performance breakdown

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 11.1 | Certificates are from hardcoded mock — not earned through course completion | Medium |
| 11.2 | Individual certificate route (`/student/certificates/$certificateId`) exists but navigation to it is unclear | Low |
| 11.3 | Download button is mock — no actual PDF generation | Low |

**Recommendation:**
- Link certificate generation to course completion (when progress = 100% and final exam passed)
- Add PDF export capability (jsPDF or similar)

**Files:** `src/routes/student.certificates.tsx`, `src/lib/certificatesMock.ts`

---

## 12. Wall of Honor / Leaderboard

| Attribute | Value |
|-----------|-------|
| **Status** | Partial |
| **Route** | `/student/leaderboard` → `src/routes/student.leaderboard.tsx` |
| **Severity** | Medium |

**What works:**
- Renders `WallOfHonorCard` component from mock prestige data
- Shows student rankings with XP, streaks, and badges

**Issues:**

| # | Issue | Severity |
|---|-------|----------|
| 12.1 | Extremely minimal — just a single component render, no page structure | Medium |
| 12.2 | No filtering (by subject, by time period, by grade) | Medium |
| 12.3 | No personal rank highlighting or "Your position" callout | Medium |
| 12.4 | No connection to landing page Hall of Honor section | Low |
| 12.5 | No explanation of how XP/ranking works | Low |

**Recommendation:**
- Add subject/grade tabs for filtered leaderboards
- Highlight current user's position
- Add "How rankings work" explainer
- Add weekly/monthly/all-time toggle

**Files:** `src/routes/student.leaderboard.tsx`, `src/components/student/WallOfHonorCard.tsx`

---

## Cross-Cutting Issues

| # | Issue | Severity | Affected Areas |
|---|-------|----------|----------------|
| CC.1 | No route-level auth guards (`beforeLoad`) on any `/student/*` routes | High | All student pages |
| CC.2 | EnrolledCourseCard uses `<a href>` not `<Link>` — full page reloads break SPA | Medium | My Courses, session navigation |
| CC.3 | Enrollment store (`enrollment-store.ts`) is disconnected from My Courses page | High | Checkout → My Courses flow |
| CC.4 | Course IDs mismatch: catalog uses c1-c8, enrolled uses ec1-ec4, no mapping | High | End-to-end enrollment |
| CC.5 | No loading states on route transitions | Low | All routes |
| CC.6 | No 404 handling for invalid student/* routes | Low | DashboardLayout routes |
| CC.7 | Wallet page not in sidebar navigation | Medium | Student nav |
| CC.8 | Dark theme hardcoded in student dashboard cards (bg-[#080C1A]) | Low | Theme consistency |

---

## Priority Classification

### Must Fix Before MVP

| # | Issue | Impact |
|---|-------|--------|
| CC.3 | Enrollment store disconnected from My Courses | Enrolled courses don't appear after purchase |
| CC.4 | Course ID mismatch between catalog and enrolled | Cannot complete purchase → learning flow |
| CC.1 | No auth guards on student routes | Unauthenticated users can access all pages |
| 5.1 | No auth guard on enrollment page | Payment page accessible without login |
| 5.5 | Purchased course doesn't show in My Courses | Core flow broken |
| 6.1 | My Courses reads only from hardcoded mock | New enrollments invisible |
| CC.2 | `<a href>` in EnrolledCourseCard | Full page reloads on every navigation |

### Should Fix for Delight

| # | Issue | Impact |
|---|-------|--------|
| 4.1 | No "Forgot password" link | Users locked out with no recovery path |
| 5.4 | Wallet not in sidebar | Users can't easily find wallet to recharge |
| 6.4 | No empty state for zero enrollments | Confusing for new users |
| 7.1 | Only 1 course has session data | Most "Continue Learning" clicks show error |
| 7.5 | No "Mark as complete" for lessons | Students can't track progress |
| 12.1 | Leaderboard page is minimal | Gamification feels incomplete |
| 2.3 | Filter button non-functional | UI promises more than it delivers |
| 9.1 | Wrong questions not connected to practice | Two separate systems for same concept |

### Future Enhancements

| # | Enhancement | Rationale |
|---|-------------|-----------|
| F.1 | Spaced repetition for wrong questions | Proven learning technique |
| F.2 | Video player integration | Currently placeholder only |
| F.3 | Real payment gateway (Fawry/Paymob) | Mock → production |
| F.4 | PDF certificate generation | Download button needs real output |
| F.5 | Social login (Google/Apple) | Reduce registration friction |
| F.6 | Course wishlist / save for later | Browsing enhancement |
| F.7 | Parent notification integration | When student completes/fails |
| F.8 | Push notifications | Re-engagement for streak maintenance |
| F.9 | Offline mode / download lessons | Common EdTech requirement |
| F.10 | Teacher-student messaging | In-platform communication |
| F.11 | Course rating/review by students | After completion, allow review submission |
| F.12 | Chapter/session-level purchase | Wallet model supports it, UI doesn't yet |

---

## Architecture Notes

| Layer | Technology | Status |
|-------|-----------|--------|
| Router | TanStack Router (file-based) | Solid |
| State | Zustand + localStorage persist | Working |
| Styling | Tailwind CSS + shadcn/ui | Consistent |
| Animation | Framer Motion | Polished |
| Auth | Token-based with rehydration | Functional |
| API | Minimal (login/register only) | Mock for rest |
| Data | All mock files in `src/lib/` | Needs real backend |

---

## Summary

The CLASSZ student journey is **~88% complete** at the UI/UX level. The learning experience (session player, question bank, wrong questions, progress, certificates) is production-quality. The critical gap is the **enrollment-to-learning bridge**: purchasing a course does not make it appear in "My Courses" due to disconnected state stores and mismatched IDs. Fixing the 7 MVP items above would make the full journey demonstrable end-to-end.
