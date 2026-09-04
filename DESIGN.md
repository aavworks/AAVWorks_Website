# Design System: AAV Works Official Web Experience

## Visual World: Modern High-Precision Railway Engineering

The visual identity embodies the speed, precision, and safety-critical excellence of modern Indian rail infrastructure. Inspired by high-speed rail corridors, automated interlocking consoles, and clean architectural lines, the system avoids generic SaaS tropes (no purple-indigo gradients, no uncalibrated bento grids, no fake numbers) and commits to an authentic industrial engineering aesthetic.

### 1. Color Palette (Authentic Railway Tri-Color Spectrum)

```css
:root {
  /* Brand Primary - Signal Crimson */
  --color-primary: #C2122F;
  --color-primary-hover: #9E0D24;
  --color-primary-light: #FEE2E2;
  --color-primary-glow: rgba(194, 18, 47, 0.25);

  /* Brand Secondary - Warning Amber / Interlocking Gold */
  --color-amber: #F59E0B;
  --color-amber-hover: #D97706;
  --color-amber-light: #FEF3C7;

  /* Brand Accent - Signal Emerald / Clear Route */
  --color-emerald: #10B981;
  --color-emerald-hover: #059669;
  --color-emerald-light: #D1FAE5;

  /* Dark Contrast Surfaces (Hero, Footers, Technical Specs) */
  --color-rail-navy: #0B132B;
  --color-rail-charcoal: #111827;
  --color-rail-slate: #1E293B;

  /* Light Canvas & Cards */
  --color-bg-canvas: #FFFFFF;
  --color-bg-subtle: #F8FAFC;
  --color-bg-card: #FFFFFF;
  --color-border-subtle: #E2E8F0;
  --color-border-strong: #CBD5E1;

  /* Text & Typography */
  --color-text-primary: #0F172A;
  --color-text-secondary: #475569;
  --color-text-muted: #64748B;
  --color-text-inverse: #F8FAFC;
}
```

### 2. Typography

- **Primary Sans-Serif**: `Plus Jakarta Sans`, system-ui, sans-serif
  - Geometric, clean, authoritative, highly legible at both large display sizes and small technical schematic annotations.
- **Display Weights**:
  - `800` / `900` for Hero headlines and high-impact statements (`letter-spacing: -0.03em`)
  - `700` for Section headers (`letter-spacing: -0.02em`)
  - `600` for Navigation, card headings, and interactive pills
  - `400` / `500` for narrative copy (`line-height: 1.65`, `letter-spacing: 0.005em`, measure 60-70ch)
- **Technical Mono / Numeral Display**: `Space Grotesk` or `Outfit` with tabular figures (`font-variant-numeric: tabular-nums`) for metric counters and station counts.

### 3. Depth, Elevation & Borders

- **Soft Diffused Elevation**:
  - `shadow-sm`: `0 2px 4px -1px rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`
  - `shadow-md`: `0 6px 16px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)`
  - `shadow-xl`: `0 20px 32px -4px rgba(15, 23, 42, 0.12), 0 8px 16px -2px rgba(15, 23, 42, 0.06)`
- **Border Treatments**:
  - Crisp 1px solid borders (`var(--color-border-subtle)`).
  - Hover states transition border color to brand accents with subtle offset shadows.

### 4. Motion & Micro-Interactions

- **Page Transitions & Reveal**: Eased entry (`cubic-bezier(0.16, 1, 0.3, 1)`) from visible default.
- **Railway Kinetic Energy**: Dynamic tri-color accent lines that animate along path or glow during scroll.
- **Button Feedback**: Distinct tactile press (`scale(0.98)`), arrow glyph slide (`transform: translateX(4px)`).
- **Tab Transitions**: Instant content cross-fade with pill slide indicator.

### 5. Craft Floor Compliance (No AI Slop)

- [x] No purple-blue generic gradients.
- [x] No emoji as system icons; 100% stroke SVG icon set.
- [x] Custom themed scrollbars and text selection.
- [x] Contrast ratio strictly ≥ 4.5:1 for body and ≥ 3:1 for large display.
- [x] Real domain terminology: IRSE, IRSTELO, RDSO, CENELEC SIL-4, RAMS, Table of Control (TOC), Electronic Interlocking (EI), Automatic Block Signalling (ABS).

