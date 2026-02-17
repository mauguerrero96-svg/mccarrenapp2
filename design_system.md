# Premium Tennis Design System

This document outlines the **Premium Tennis** design system implemented for the Mccarren Tournament Management App. The goal was to move away from generic "bootstrap-like" or "neon-cyber" styles to a refined, professional, and athletic aesthetic.

## 1. Color Palette

We utilize a sophisticated **Emerald Green** and **Slate Blue** palette, inspired by classic tennis courts (grass and hard court) mixed with modern SaaS cleanliness.

### Primary Colors (Emerald)
Used for primary actions, success states, and key brand moments.
- **Emerald 500 (#10b981)**: Primary Brand Color
- **Emerald 700 (#047857)**: Hover states, dark accents
- **Emerald 50 (#ecfdf5)**: Backgrounds, subtle highlights

### Secondary Colors (Slate)
Used for text, backgrounds, and structural elements to reduce eye strain compared to pure black/gray.
- **Slate 900 (#0f172a)**: Headings, primary text
- **Slate 500 (#64748b)**: Secondary text, icons
- **Slate 50 (#f8fafc)**: Page backgrounds

### Accent (Sky & Amber)
- **Sky Blue**: Used for "In Progress" states effectively.
- **Amber**: Used for "Dev Mode" warnings and attention-grabbing alerts.

## 2. Typography

A clean, sans-serif stack (Inter/System UI) is used with careful attention to **tracking** (letter-spacing) and **font-weight**.

- **Headings**: `font-bold`, `tracking-tight`, `text-slate-900`.
- **Body**: `text-slate-600`, relaxed line-height.
- **Micro-copy** (labels): `text-xs`, `font-semibold`, `uppercase`, `tracking-wider`, `text-slate-500`.

## 3. Component Styling

### Cards
Cards have moved from simple borders to a "soft elevation" style:
- White background (`bg-white`)
- Subtle border (`border-slate-200`)
- Soft shadow (`shadow-sm`)
- **Interactive**: Hover lift effect (`hover:-translate-y-1`, `hover:shadow-md`) and border color shift (`hover:border-emerald-200`) on interactive cards.

### Buttons (`.btn-primary`)
- **Background**: Emerald 700
- **Text**: White
- **Shape**: Rounded-lg (modern, slightly softer than square)
- **State**: Focus rings matching the brand color (`ring-emerald-500`).

### Badges/Status Indicators
- Pill-shaped (`rounded-full`)
- Subtle background with dark text (e.g., `bg-emerald-100 text-emerald-800`)
- 1px inset ring for definition (`ring-1 ring-emerald-200`)

## 4. Layout Patterns

- **Sticky Headers**: Utilizing `backdrop-blur` for a modern feel while keeping context.
- **Clean Spacing**: Generous padding (`p-6`, `gap-6`) to let content breathe.
- **Dashboard Grid**: Responsive grids for statistics and quick actions.

## 5. Implementation

These styles are applied globally via `globals.css` using Tailwind `@layer components` for reusability, and locally in page components for specific layout needs.

---
*Implemented by Antigravity*
