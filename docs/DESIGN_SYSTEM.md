# CLASSZ Design System

CLASSZ uses a premium modern SaaS visual language inspired by Linear, Stripe, ClickUp, and Coursera. The interface should feel polished, dense enough for serious education operations, and calm enough for repeated daily use.

## Design Principles

- Dark mode first, with full light mode support.
- Premium dashboard feel with glassmorphism, clean hierarchy, and soft depth.
- Education-first clarity: dashboards should help users understand progress, action, risk, and next steps quickly.
- Purple is the identity color, not the only color. Use blue for charts, green for success, orange for warnings, and red for errors.
- Responsive web-first design across desktop, tablet, and mobile.

## Theme Strategy

### Dark Theme

| Token | Value | Usage |
| --- | --- | --- |
| Background | `#0F172A` | Main application background. |
| Surface Cards | `#111827` | Cards, panels, sidebar surfaces. |
| Glass Surface | `rgba(255,255,255,0.06)` | Glass panels, overlays, elevated navigation. |
| Text Primary | `#F8FAFC` | Main text and key values. |
| Text Secondary | `#CBD5E1` | Supporting descriptions and metadata. |
| Text Muted | `#94A3B8` | Labels, helper text, disabled text. |

### Primary Gradient

Use the primary gradient for brand moments, primary CTAs, selected navigation states, and high-emphasis accents.

| Stop | Value |
| --- | --- |
| Purple 1 | `#7C3AED` |
| Purple 2 | `#9333EA` |
| Purple 3 | `#A855F7` |

Recommended CSS direction: `linear-gradient(135deg, #7C3AED 0%, #9333EA 48%, #A855F7 100%)`.

### Accent Palette

| Token | Value | Usage |
| --- | --- | --- |
| Blue | `#3B82F6` | Charts, links, info states, academic progress. |
| Success | `#10B981` | Completed lessons, paid invoices, active status. |
| Warning | `#F59E0B` | At-risk students, pending reviews, due soon. |
| Danger | `#EF4444` | Errors, failed payments, destructive actions. |

## Light Theme

Light mode should preserve the same layout and spacing while switching surfaces to clean white and soft slate tones. Purple identity remains active, but large surfaces should avoid heavy saturation.

| Token | Suggested Value | Usage |
| --- | --- | --- |
| Background | `#F8FAFC` | Main application background. |
| Surface | `#FFFFFF` | Cards, panels, modals. |
| Border | `rgba(15,23,42,0.10)` | Subtle dividers and card boundaries. |
| Text Primary | `#0F172A` | Main text. |
| Text Secondary | `#475569` | Supporting text. |
| Text Muted | `#64748B` | Labels and metadata. |

## Typography

| Font | Usage |
| --- | --- |
| Inter | Interface text, tables, forms, navigation, dashboards. |
| Poppins | Brand headings, dashboard titles, empty states, high-emphasis section headings. |

Guidelines:

- Use Inter for most UI because it scans cleanly in dense dashboards.
- Use Poppins sparingly for page titles, role workspace labels, and premium hero moments.
- Avoid overly large dashboard typography. Reserve large text for page titles and key metrics.
- Maintain clear contrast in both dark and light themes.

## Spacing

CLASSZ uses an 8px spacing scale.

| Token | Value | Usage |
| --- | --- | --- |
| `space-1` | 8px | Tight gaps, icon spacing. |
| `space-2` | 16px | Form fields, card inner rows. |
| `space-3` | 24px | Card padding, section gaps. |
| `space-4` | 32px | Page section spacing. |
| `space-5` | 40px | Large dashboard bands. |
| `space-6` | 48px | Major layout separation. |

## Shape

- Default rounded corners: `20px`.
- Compact controls: `12px` to `16px` where needed.
- Tables and dense lists may use `12px` containers to preserve readability.
- Avoid fully pill-shaped controls unless the component is a badge, status chip, or segmented control.

## Shadows and Glass

Use soft shadows that are visible but not heavy.

| Layer | Suggested Shadow |
| --- | --- |
| Card | `0 16px 40px rgba(0,0,0,0.20)` |
| Floating panel | `0 24px 70px rgba(0,0,0,0.30)` |
| Modal | `0 32px 90px rgba(0,0,0,0.42)` |

Glassmorphism guidelines:

- Use `rgba(255,255,255,0.06)` for dark glass surfaces.
- Add a subtle border: `1px solid rgba(255,255,255,0.10)`.
- Use backdrop blur only for topbars, sidebars, popovers, and modals.
- Do not stack many glass panels inside one another.

## Layout Rhythm

- Desktop dashboards use a fixed or semi-fixed sidebar, sticky topbar, and responsive content grid.
- Tablet layouts collapse secondary panels and keep primary actions visible.
- Mobile layouts use bottom navigation or drawer navigation, with dashboard cards stacked in priority order.
- Key actions should remain reachable within the first viewport.

## Color Usage Rules

- Purple: brand identity, primary CTA, selected navigation, premium highlights.
- Blue: charts, progress indicators, informational states.
- Green: success, completion, active health, positive trend.
- Orange: warnings, deadlines, pending review, attention needed.
- Red: errors, failed state, destructive action, severe risk.
- Neutral slate: majority of backgrounds, text, borders, and data surfaces.

## Accessibility

- All text must meet WCAG AA contrast.
- Interactive states must include hover, focus, active, disabled, and loading states.
- Focus rings should be visible on dark and light themes.
- Use text labels with icons for primary actions; icon-only buttons require accessible labels.
- Avoid communicating status using color alone.
