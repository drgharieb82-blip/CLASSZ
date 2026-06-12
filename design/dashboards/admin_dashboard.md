# Admin Dashboard

The admin dashboard should feel like a premium SaaS command center. It gives platform leaders immediate visibility into health, activity, revenue, academic operations, and risk.

## Primary Goals

- Monitor the whole platform at a glance.
- Find operational issues quickly.
- Review growth, revenue, and academic engagement.
- Navigate to high-priority admin workflows.

## Layout

- Top summary band with platform health, active users, active courses, revenue, and unresolved alerts.
- Main grid with analytics cards, activity stream, and operational queues.
- Right rail for urgent items such as approvals, failed payments, and support flags.
- Use dark glass cards with subtle borders and controlled purple identity accents.

## Core Widgets

- Platform Health: API status, database status, job status, storage status.
- User Growth: admins, teachers, assistants, students, parents.
- Course Activity: published courses, draft courses, enrollment movement.
- Revenue Snapshot: gross revenue, refunds, pending payouts, failed payments.
- Risk Queue: overdue payments, flagged accounts, inactive teachers, unresolved reports.
- Recent Activity: user invites, course publishing, payments, admin actions.
- Analytics Preview: engagement trends, completion rate, quiz activity.

## Premium SaaS Details

- Use StatCards for top metrics with trend deltas.
- Use ChartCards for growth, revenue, and engagement.
- Use Tables for pending approvals and user management previews.
- Use semantic accent colors: blue for analytics, green for healthy metrics, orange for warning queues, red for severe issues.

## Empty and Loading States

- Loading should use skeleton cards matching final layout dimensions.
- Empty states should explain whether the absence is expected, filtered, or requires setup.
- Admin empty states should always offer a next operational action.

## Responsive Behavior

- Desktop: 12-column grid with a right operational rail.
- Tablet: two-column grid, urgent queue moves below top metrics.
- Mobile: stacked metrics, urgent alerts first, charts simplified.
