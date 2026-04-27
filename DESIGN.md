# DESIGN.md — zach-ai-blog Design Spec

## Overview
Redesign of zach-ai-blog with minimalist, warm, friendly aesthetic. Emphasis on readability, Chinese (Traditional) support, and approachable personality.

---

## Design Language

### Color Palette

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| Background | `#FAFAF8` | `#1A1A1A` | Page background |
| Surface | `#FFFFFF` | `#242424` | Cards, nav, footer |
| Border | `#E8E4DF` | `#333333` | Dividers, card borders |
| Text Primary | `#292524` (stone-800) | `#F5F0EB` | Headings, body |
| Text Secondary | `#78716C` (stone-500) | `#A8A29E` | Muted text, dates |
| Accent | `#5B8A8A` (muted teal) | `#7AAEAE` | Links, highlights, progress bar |
| Accent Hover | `#4A7575` | `#8ABFBF` | Hover states |

### Typography

- **Headings**: Playfair Display (Google Fonts) — serif, elegant, warm
- **Body**: Noto Sans HK (Google Fonts) — excellent Chinese (Traditional) support
- **Fallbacks**: `Georgia, serif` for headings; `system-ui, sans-serif` for body
- **Scale**:
  - H1: 2.5rem / bold
  - H2: 1.875rem / semibold
  - H3: 1.5rem / semibold
  - Body: 1rem / normal
  - Small: 0.875rem

### Spacing & Layout
- Max content width: `48rem` (768px)
- Section padding: `1.5rem` horizontal (mobile), `2rem` (desktop)
- Card padding: `1.5rem`
- Border radius: `0.5rem` (cards), `0.375rem` (buttons/inputs)
- Shadows: Soft, warm-tinted — `0 2px 12px rgba(41, 37, 36, 0.06)`

### Motion
- Hover transitions: `150ms ease` for color/shadow changes
- Page load: CSS `@keyframes fadeIn` with `opacity 0→1, translateY 8px→0`
- Scroll animations: `IntersectionObserver` for fade-in-on-scroll on post cards

---

## Pages & Components

### 1. Global Layout (`Layout.astro`)

**Nav bar:**
- Sticky top, white/surface background, subtle bottom border
- Logo text: "Zach's Blog" in Playfair Display
- Dark mode toggle button (sun/moon icon)
- Links: Home, About, Newsletter

**Hero section** (homepage only, in `index.astro`):
- Illustrated cartoon banner (inline SVG)
- Tagline: "用 AI 探索數學，用數學理解世界"
- Subtitle: "HKDSE 數學 | AI 教育科技 | 學習方法"

**Footer:**
- Centered copyright text
- Surface background with top border

### 2. Homepage (`index.astro`)

**Hero banner:**
- Cartoon mascot SVG + tagline
- Warm background panel with soft shadow

**Post cards:**
- Each card has: featured image (picsum placeholder), title, date, description, "閱讀全文 →"
- Cards: white surface, border, soft shadow, rounded corners
- Hover: slight shadow increase + border color change
- Fade-in animation on scroll (staggered via IntersectionObserver)

### 3. Post Page (`posts/[slug].astro`)

**Reading progress bar:**
- Fixed at top of viewport
- Teal accent color, 3px height
- Width driven by scroll position JS

**Article layout:**
- White card with border, generous padding
- Playfair Display for title, Noto Sans HK for body
- Prose styling for markdown content

**Social sharing buttons:**
- Below article content, before footer nav
- Three buttons: Twitter/X share, WhatsApp share, Copy link
- Subtle, not overwhelming

**Back link:** "← 返回首頁"

### 4. About Page (`about.astro`)
- Consistent card styling
- Profile section with simple avatar placeholder
- Links styled with teal accent

### 5. Newsletter Page (`newsletter.astro`)
- Centered, max-width card
- Clean form styling with focus states

---

## Mascot Design — "Zach Mini"

A simple, friendly cartoon character:

```
Style: Lo-fi / soft illustration (not childish)
Colors: Warm palette — teal accent (#5B8A8A) + warm stone tones
Elements:
  - Round face, simple features (two dots for eyes, small smile)
  - Wearing glasses (math teacher vibe)
  - Holding a tablet or pencil
  - Subtle AI spark/star near head
  - Position: often with math symbols floating nearby
```

Implementation: Inline SVG, simple geometry (circles, rounded rects), designed to be placed in hero banner and footer.

---

## Technical Approach

### Dark Mode
- Tailwind 4.x: `darkMode: 'class'` strategy
- JS: detect system preference, add/remove `dark` class on `<html>`
- Toggle button persists preference to `localStorage`
- All colors use Tailwind `dark:` variant

### Google Fonts
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Noto+Sans+HK:wght@400;500;600&display=swap');
```

### Animations
- CSS `@keyframes fadeInUp` for scroll reveal
- CSS transitions for hover states (no JS animation library)
- Reading progress bar: vanilla JS `scroll` event listener

### Post Card Images
- `https://picsum.photos/seed/{postId}/800/400` for deterministic placeholder images
- Each post gets a consistent image based on its ID

---

## Implementation Phases

### Phase 1 — Speed Fixes
- [x] Background color (#FAFAF8)
- [x] Google Fonts (Playfair Display + Noto Sans HK)
- [x] Dark mode toggle with system preference
- [x] Hero section with mascot SVG
- [x] Post cards with featured images

### Phase 2 — Premium Upgrades
- [x] Reading progress bar
- [x] Social sharing buttons
- [x] Scroll animations (fade-in on cards)
- [x] Mascot SVG

---

## Git Commit
Final state committed as: `Redesign: minimal warm aesthetic with dark mode, typography upgrade, mascot, and premium features`