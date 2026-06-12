# CLASSZ Components Library

This file defines the reusable UI components that should power CLASSZ. Components should support dark mode first, light mode, responsive behavior, accessibility, and role-aware dashboards.

## Buttons

Use buttons for clear commands and workflow actions.

Variants:

- Primary: purple gradient, used for the main action on a screen.
- Secondary: glass or neutral surface, used for supporting actions.
- Ghost: transparent, used in navigation, toolbars, and low-emphasis actions.
- Danger: red, used for destructive actions with confirmation.
- Icon button: compact actions in tables, toolbars, and cards.

States:

- Default, hover, active, focus, loading, disabled.
- Loading buttons must preserve width and show a spinner.
- Destructive buttons should never be the default focused action in a modal.

## Inputs

Use for text, email, password, search, numeric, and URL values.

Requirements:

- Label, helper text, error text, and optional leading/trailing icon.
- Dark surface with subtle border and clear focus ring.
- Validation states for error, warning, and success.
- Password fields require show/hide control.
- Search inputs should support clear action when populated.

## Selects

Use for role, status, course, cohort, and filter selection.

Requirements:

- Single-select and multi-select variants.
- Searchable option lists for long datasets.
- Keyboard navigation.
- Empty, loading, and disabled states.
- Clear visual selected state.

## Checkboxes

Use for binary settings and multi-row selection.

Requirements:

- Checked, unchecked, indeterminate, disabled, and focus states.
- Label text should be clickable.
- Table header checkbox should support indeterminate state.

## Cards

Cards contain grouped information or repeatable items.

Variants:

- Surface card: standard dashboard panel.
- Glass card: premium overlay or highlighted content.
- Interactive card: clickable item with hover and focus states.
- Alert card: warning, success, info, or danger context.

Guidelines:

- Default corner radius: 20px.
- Avoid nesting cards inside cards.
- Use consistent padding from the 8px spacing scale.

## CourseCard

CourseCard represents a course in dashboards, catalogs, and teacher workspaces.

Content:

- Course title.
- Teacher name or owner.
- Cover image or gradient fallback.
- Progress or enrollment count.
- Status badge.
- Primary action.

States:

- Draft, published, archived.
- In progress, completed, locked.
- Loading skeleton.

## StatCard

StatCard presents a metric with context.

Content:

- Label.
- Primary value.
- Trend indicator.
- Optional icon.
- Optional comparison period.

Usage:

- Revenue, active students, completion rate, overdue assignments, attendance, course health.
- Use blue for neutral data, green for positive trend, orange for warning, red for negative trend.

## ChartCard

ChartCard wraps analytics visualization.

Content:

- Title.
- Time range control.
- Chart.
- Legend.
- Empty or loading state.

Guidelines:

- Use blue as the primary chart color.
- Use green, orange, and red only for semantic comparison.
- Always include a text summary for accessibility.

## Tables

Tables handle dense administrative and academic data.

Requirements:

- Sortable headers.
- Filter controls.
- Search.
- Row selection.
- Pagination.
- Empty state.
- Loading skeleton rows.
- Row action menu.

Common tables:

- Users.
- Courses.
- Enrollments.
- Payments.
- Assignments.
- Reports.
- Notifications.

## Sidebar

Sidebar provides primary navigation and workspace context.

Content:

- CLASSZ logo.
- Workspace name.
- Role-aware navigation groups.
- Collapsible module links.
- Quick create action.
- Bottom account or settings area.

Behavior:

- Desktop: visible by default.
- Tablet: collapsible rail.
- Mobile: drawer menu triggered from topbar.

## Topbar

Topbar provides global context and utility actions.

Content:

- Page title.
- Breadcrumbs.
- Search.
- Quick actions.
- Notifications.
- Theme toggle.
- Profile menu.

Behavior:

- Sticky on desktop and tablet.
- On mobile, search may move into a full-screen overlay.

## Tabs

Tabs organize related views within a module.

Variants:

- Underline tabs for page sections.
- Segmented tabs for filters and compact mode switching.
- Vertical tabs for settings pages.

Requirements:

- Keyboard accessible.
- Active state visible in dark and light mode.
- Preserve route or URL state for major tabs.

## Badges

Badges communicate compact status.

Types:

- Role badges: admin, teacher, assistant, student, parent.
- Status badges: draft, published, active, pending, archived.
- Semantic badges: success, warning, danger, info.

Guidelines:

- Use color and text together.
- Keep labels short.
- Do not use badges as buttons unless they are filter chips.

## Toasts

Toasts provide temporary feedback.

Types:

- Success.
- Error.
- Warning.
- Info.

Behavior:

- Auto-dismiss for success and info.
- Persist errors until dismissed or after a longer timeout.
- Include action buttons only when useful, such as retry or view details.

## Modals

Modals focus the user on a decision or form.

Types:

- Confirmation modal.
- Form modal.
- Detail modal.
- Danger confirmation.

Requirements:

- Escape key closes non-destructive modals.
- Focus trap.
- Clear title and action hierarchy.
- Mobile full-screen variant for complex forms.

## Empty States

Empty states explain absence and guide next action.

Content:

- Clear title.
- Short contextual message.
- Primary action when the user can resolve the state.
- Optional secondary link to documentation or settings.

Examples:

- No courses yet.
- No assignments due.
- No linked students.
- No payment records.

## Pagination

Pagination supports long lists and tables.

Variants:

- Page numbers for admin tables.
- Load more for activity feeds.
- Infinite scroll only for non-critical discovery surfaces.

Requirements:

- Page size selector for admin tables.
- Keyboard accessible controls.
- Preserve filters and search in URL state.
