# LexiFlow Design System (DESIGN.md)

<!-- impeccable:design-schema 2 -->

## Design Thesis

**"Tactile Oxford Slate & Radiant Indigo Bento Studio"**
LexiFlow combines Oxford dictionary authority with a modern desktop-first & mobile-adaptive Bento Grid architecture. On desktop web, the application centers within a 1200px responsive grid (2-column layout), preventing stretched mobile artifacts. On mobile devices, it seamlessly collapses into a fluid single-column stream.

## Responsive Layout Architecture

### Breakpoints
- **Compact (Mobile)**: `< 800px` — Single column vertical stack, bottom navigation bar.
- **Expanded (Desktop Web & Tablet)**: `>= 800px` — Max-width `1200px` centered canvas, 2-column Bento Grid (65% Main Studio / 35% Learning Sidebar), top header navigation with user menu & streak pill.

## Color Tokens & Glassmorphism

### Primary Palette
- **Royal Indigo Primary**: `Light #4F46E5` / `Dark #6366F1`
- **Oxford Blue Accent**: `Light #2563EB` / `Dark #3B82F6`
- **Cyan Ambient Glow**: `Light #0891B2` / `Dark #06B6D4`
- **Amber Memory Accent**: `Light #D97706` / `Dark #F59E0B`
- **Success Emerald**: `Light #059669` / `Dark #10B981`
- **Error Coral**: `Light #DC2626` / `Dark #EF4444`

### Backgrounds & Surfaces
- **Dark Ground**: `#0B0F19` (Deep space obsidian with radial glow highlights)
- **Dark Card Surface**: `#151C2C` (Sleek slate container with `1px` border `rgba(255, 255, 255, 0.08)`)
- **Light Ground**: `#F8FAFC` (Crisp porcelain slate)
- **Light Card Surface**: `#FFFFFF` (Pure white card with `1px` border `#E2E8F0`)

## Bento Grid Components (Dashboard)

1. **Header & Navigation**:
   - Brand logo with gradient icon tile.
   - User Profile chip with formatted display name (filtering raw numeric IDs into clean user handles).
   - Streak flame badge & theme switcher.

2. **Left Column (65% Desktop)**:
   - **Hero Search Bar**: Large search input with ambient indigo glow, camera OCR button, voice search trigger, and instant phonetic autocomplete popup.
   - **Daily Learning Target Banner**: Gradient card with live progress bar and action CTA.
   - **Quick Action Bento Cards**: 2x2 grid of feature tiles with custom accent icons & subtle hover scale.
   - **Search History Drawer**: Clean history list with dismissible swipe & clear-all options.

3. **Right Sidebar (35% Desktop)**:
   - **Word of the Day Card**: Oxford vocabulary spotlight with audio player, phonetics, Vietnamese translation, and example quote.
   - **SM-2 Memory Statistics Card**: Segmented memory retention visualizer (New vs Learning vs Mastered).
   - **Bookmark Collections Shortcut**: Saved words drawer access.
