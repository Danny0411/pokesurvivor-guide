---
name: PokéSurvivor 完全圖鑑
description: A searchable 完全攻略本 for PokéSurvivor. Coated paper, ink black, one process color per chapter, ruled spec tables.
colors:
  paper: "#fafaf7"
  paper-2: "#f0f0eb"
  ink: "#151515"
  ink-2: "#4a4a48"
  ink-3: "#74746f"
  rule: "#15151524"
  rule-strong: "#151515"
  chapter-pokemon: "#e60012"
  chapter-moves: "#0077b6"
  chapter-types: "#6a3cb2"
  chapter-run: "#00803a"
  chapter-enemies: "#d6006f"
  chapter-world: "#b85600"
  chapter-collect: "#1d50a2"
  chapter-log: "#3a3a3a"
  chapter-ink: "#ffffff"
  selection: "#fff000"
  selection-ink: "#151515"
  ramp-0: "#e9eef6"
  ramp-1: "#d3def0"
  ramp-2: "#b6c8e6"
  ramp-3: "#94aedb"
  ramp-4: "#7092ce"
  ramp-5: "#4f76bf"
  ramp-6: "#355ead"
  ramp-7: "#24498f"
  ramp-8: "#183670"
  ramp-9: "#0e2350"
  paper-dark: "#121211"
  paper-2-dark: "#1c1c1a"
  ink-dark: "#f1f1ec"
  ink-2-dark: "#bdbdb6"
  ink-3-dark: "#8f8f88"
  rule-dark: "#f1f1ec26"
  rule-strong-dark: "#f1f1ec"
  chapter-pokemon-dark: "#d81e26"
  chapter-moves-dark: "#0a72b8"
  chapter-types-dark: "#7448c8"
  chapter-run-dark: "#0b7a3b"
  chapter-enemies-dark: "#c4146b"
  chapter-world-dark: "#ad5300"
  chapter-collect-dark: "#2f5fbf"
  chapter-log-dark: "#5a5a56"
  ramp-0-dark: "#18202e"
  ramp-1-dark: "#1c2a42"
  ramp-2-dark: "#213456"
  ramp-3-dark: "#26406c"
  ramp-4-dark: "#2e4f86"
  ramp-5-dark: "#3a62a3"
  ramp-6-dark: "#4c78bd"
  ramp-7-dark: "#6890d0"
  ramp-8-dark: "#8eaee0"
  ramp-9-dark: "#bcd0f0"
typography:
  display:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "clamp(56px, 8.6vw, 112px)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: ".06em"
  display-numeral:
    fontFamily: "'Barlow C', 'Noto Sans TC', sans-serif"
    fontSize: "clamp(56px, 9vw, 112px)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-.01em"
    fontFeature: "tnum"
  headline:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "clamp(32px, 4.8vw, 56px)"
    fontWeight: 900
    lineHeight: 1.1
    letterSpacing: ".05em"
  title-band:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: ".01em"
  title:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 900
    lineHeight: 1.25
  body:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.7
  table:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.45
  table-numeral:
    fontFamily: "'Barlow C', 'Noto Sans TC', sans-serif"
    fontSize: "16px"
    fontWeight: 600
    letterSpacing: ".01em"
    fontFeature: "tnum"
  label:
    fontFamily: "'Noto Sans TC', system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 700
    letterSpacing: ".05em"
rounded:
  hairline: "2px"
  tag: "3px"
  control: "4px"
  tab: "6px 0 0 6px"
  dot: "50%"
spacing:
  cell: "8px"
  gutter-mobile: "14px"
  gutter: "24px"
  block: "40px"
  section: "56px"
  edge-tab: "44px"
  container: "1240px"
components:
  spec-header:
    backgroundColor: "{colors.chapter-pokemon}"
    textColor: "{colors.chapter-ink}"
    typography: "{typography.label}"
    padding: "7px 10px"
  spec-cell:
    typography: "{typography.table}"
    padding: "7px 10px"
  band:
    backgroundColor: "{colors.chapter-pokemon}"
    textColor: "{colors.chapter-ink}"
    typography: "{typography.title-band}"
    padding: "9px 14px 8px"
  edge-tab:
    backgroundColor: "{colors.chapter-pokemon}"
    textColor: "{colors.chapter-ink}"
    rounded: "{rounded.tab}"
    width: "44px"
    height: "76px"
  button-outline:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 14px"
  button-outline-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  toggle-selected:
    backgroundColor: "{colors.selection}"
    textColor: "{colors.selection-ink}"
    rounded: "{rounded.control}"
    height: "36px"
  search-field:
    backgroundColor: "{colors.paper-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "40px"
  type-tag:
    textColor: "{colors.chapter-ink}"
    rounded: "{rounded.tag}"
    height: "22px"
    padding: "0 8px"
---

# Design System: PokéSurvivor 完全圖鑑

## Overview

**Creative North Star: "The Complete Guidebook (完全攻略本)"**

The site behaves like a printed Japanese complete guidebook that you can search. The ground is bright coated paper and the text is true ink black. Each chapter owns one process color, and that color appears only on the chapter's edge tab, its solid table-header bands and section bands, its halftone heads and its tinted alternate rows. Content is dense. Ruled spec tables carry most pages, and the numbers sit next to the formula that produces them.

Hierarchy comes from heavy Taiwanese gothic heads and condensed tabular numerals, not from cards or shadows. Surfaces are flat. Depth is printed: halftone dot screens, 2px ink rules, 3px chapter-color table tops. The game's real pixel sprites are the only imagery, and they always render pixelated at integer scale.

The system turns down two category defaults: the dark neon gamer dashboard and the white card-grid Pokédex clone. Dark mode exists, but it is the same printed book on dark stock, not a neon theme.

**Key Characteristics:**
- Paper and ink ground, with one process color per chapter used structurally
- One reserved highlighter yellow that means "current/selected" and nothing else
- One shared 10-step blue ramp for every numeric magnitude
- Heavy gothic heads (900) with condensed tabular numerals (Barlow Condensed)
- Ruled spec tables with solid color header bands and tinted even rows
- Thumb-index edge tabs as primary chapter navigation
- Flat surfaces; halftone screens and rules carry depth

## Colors

A print palette: off-white coated paper, near-black ink, eight process colors keyed to chapters, one fluorescent selection yellow, and one cool numeric ramp. All of them are custom properties on `:root`, and a `prefers-color-scheme: dark` block redefines them. Components never branch on the color scheme.

### Primary (chapter process colors)
The active chapter is set by `data-ch` on `<html>` (or on any element), which assigns `--ch`. Components read only `--ch`, `--ch-tint` (9% `--ch` mixed into paper, in oklab) and `--ch-ink` (white).
- **Process Red** (圖鑑 pokemon): the Pokédex and Pokémon spreads. It is also the home page's title underline and the "966" count, because the dex is the book's lead chapter.
- **Process Cyan** (招式 moves).
- **Violet** (屬性 types).
- **Process Green** (冒險 run).
- **Process Magenta** (敵人 enemies).
- **Orange** (地圖 world).
- **Deep Blue** (收集 collect).
- **Graphite** (更新 log).

Dark mode brightens each chapter color one step (the `-dark` tokens), so header bands keep their weight on dark paper.

### Secondary
- **Highlighter Yellow** (`selection`, with `selection-ink` text): the reserved selection color. It is used for `::selection`, the current edge tab's marker nub, the checked direction on the sprite dial, pressed toggles (shiny, auto-rotate), active chips, the search result under keyboard focus or hover (mixed 55% into paper), the skip link and the small "new" mini tag. Text on it is always ink `#151515`, in both schemes.

### Tertiary (numeric ramp)
- **Ledger Blue Ramp** (`ramp-0` … `ramp-9`): ten fixed steps, light to dark. Every magnitude on the site (stat bars, percentile bars, heat cells) picks a step with `.s0`–`.s9` and fills a `.ramp` bar at width `--p`. The default fill is `ramp-5`. In dark mode the ramp is inverted in lightness, so step 9 is still the strongest-reading value against the ground.

### Neutral
- **Coated Paper** (`paper`): page ground, the header at 92% with blur, and the fill for outlined buttons.
- **Shade Paper** (`paper-2`): search field rest state, ramp troughs, code, pre and blockquote fills, the frieze gradient.
- **Ink** (`ink`): body text, 2px structural rules (header, footer, h3 underline, stage frame, outlined controls).
- **Ink 2** (`ink-2`): summaries, lead paragraphs, footer text.
- **Ink 3** (`ink-3`): captions, small labels, placeholders, metadata.
- **Hairline** (`rule`, 14% ink): table row dividers, TOC spine, kbd borders, off rarity pips.

### Fixed game languages
The 18 type colors (`U.TYPE_COLOR`) and rarity colors (`GACHA.RARITY_COLOR`) come from the extracted game data, not from tokens. They appear only on type tags and rarity pips. Type tags switch to dark text `#1a1a1a` when the type color's relative luminance is above 0.36.

### Named Rules
**The One Chapter, One Color Rule.** A page wears only its own chapter color, through `--ch`. It goes on the edge tab, table header bands, the 3px table top rule, section bands, halftone heads, the h3 square, list markers, link underlines and the focus ring. A chapter color never decorates content.

**The Highlighter Rule.** `selection` yellow means "this is the current/selected one." It is never used for emphasis, warning or decoration.

**The One Ramp Rule.** Every numeric magnitude on every chapter uses the same 10-step ramp. Chapter colors and type colors never encode quantity.

**The Fixed Language Rule.** Type and rarity colors are game vocabulary. They appear only as type tags and rarity pips and never tint backgrounds, borders or headings.

## Typography

**Display / Body Font:** Noto Sans TC, a variable 100–900 font, self-hosted and subset to the site's glyphs by `tools/subset-fonts.sh` (falls back to system-ui, sans-serif)
**Numeral Font:** Barlow Condensed as family `Barlow C`, self-hosted subset in SemiBold 600, Bold 700 and ExtraBold 800 (falls back to Noto Sans TC)

**Character:** A heavy, square Taiwanese gothic sets every head at 900, the way a printed guidebook does. Data runs in a condensed, tabular Latin numeral so that columns line up and dense numbers stay narrow. Both fonts use `font-display: swap`. No third-party font CDN is used.

### Hierarchy
- **Display** (900, clamp(56px, 8.6vw, 112px), 1, +.06em): the home title only. A 10px Process Red bar sits under it.
- **Display Numeral** (Barlow 800, clamp(56px–116px), 0.8–0.85, −.01em): the hero numbers, meaning the home "966" and the dex number "No.0006", in the chapter color.
- **Headline** (900, clamp(32px, 4.8vw, 56px), 1.1, +.05em): chapter opener h1 and the Pokémon name.
- **Title Band** (900, 22px for bands and 24px for prose h2, white on chapter color): section heads.
- **Title** (900, 18px): prose h3, ruled 2px ink underneath and led by a 10px chapter-color square.
- **Body** (400, 15px / 1.7; prose 15.5px): paragraphs capped at 70ch, lists at 72ch.
- **Table** (400, 14px / 1.45): spec table cells. Numeric cells switch to Barlow 600 16px, right-aligned.
- **Label** (700, 12.5px, +.05em): table header cells and field labels. No uppercase anywhere, since the script is CJK.

### Named Rules
**The Numerals Are Barlow Rule.** Any number a reader compares (stats, damage, cooldowns, counts, dex numbers, dates, versions) carries `.num`, which means Barlow Condensed with tabular figures. Chinese text never uses Barlow.

**The Heavy Head Rule.** Headings h1–h4 are weight 900 with `text-wrap: balance`. Hierarchy changes size, never weight.

## Layout

The container is 1240px wide and centered, with a 24px gutter, and on desktop it reserves a 44px column on the right for the edge tabs. On viewports at or below 860px the tab column collapses to 0 and the gutter drops to 14px. The bottom gets 96px of padding so content clears the bottom tab bar. The sticky header is 60px tall (56px on mobile), and `scroll-padding-top` is 72px.

Chapter openers (the halftone head) bleed to both page edges. Their contents re-center on the 1240px column. Mechanics chapters use a 220px sticky in-page TOC beside the body (40px gap), and the TOC is hidden below 960px. The home page and Pokémon pages are two-column spreads (5fr / 7fr and 5fr / 6fr) that stack below 960px.

The rhythm follows an 8px cell. Recurring gaps are 8, 14, 24, 40 and 56px (56px separates major blocks), and table cells pad 7px × 10px. Sprites render at integer scale (default 2×) inside that grid. Wide tables scroll horizontally inside their wrapper, with background-attachment scroll shadows at the edges. Below 860px, table cells stop wrapping, except columns marked as wrapping.

## Elevation & Depth

Surfaces are flat. Depth is printed rather than lifted. Halftone dot screens (6px pitch, 1.1px dots of the chapter color) shade chapter openers. A white-dot screen masks in across the right 38% of each section band. Ink rules (2px structural, 4px under openers, 3px chapter color on table tops) separate planes. Shadows are soft and ambient, and they appear only on floating or interactive layers.

### Shadow Vocabulary
- **Popover** (`box-shadow: 0 18px 40px -12px #0005`): the search results dropdown.
- **Search Lift** (`box-shadow: 0 10px 24px -14px #0006`, hover `0 14px 28px -14px #0007` with translateY(-1px)): the home page's big search field.
- **Current Tab** (`box-shadow: -4px 0 14px -4px #0006`): the active edge tab, pulled fully out.
- **Scroll Hint** (radial `#0003` edge gradients): a horizontally scrollable table.

### Named Rules
**The Printed Depth Rule.** Hierarchy and grouping come from halftone, rules and color bands. A shadow marks only something that floats (popover), invites action (big search) or is pulled out (current tab).

## Shapes

Corners are nearly square, like a printed page. Controls and outlined buttons use 4px, tags and search results 3px, ramps and hairline nubs 1–2px. Edge tabs round only their outer side (6px 0 0 6px), like a die-cut index tab. Circles are reserved for rarity pips, the sprite direction dial and "acquisition" dots. Table cells, bands and the sprite stage frame have no rounding. Borders are ink: 2px for outlined controls and frames, 1.5px for chips and the dial ring.

## Components

### Spec Table
The site's workhorse: dense, ruled and banded.
- **Top:** a 3px chapter-color rule on the scroll wrapper.
- **Header:** a solid chapter-color band with white Label text, no wrap, left-aligned. Numeric columns are right-aligned.
- **Rows:** 1px hairline dividers. Even rows are tinted with `--ch-tint`. The row header (`tbody th`) is bold and does not wrap.
- **Numbers:** Barlow 600 16px, right-aligned. Magnitudes add a 10px `.ramp` bar.
- **Sorting:** sortable dex tables rerank rows in place with FLIP (520ms, `--ease`). The animation is skipped under reduced motion.
- Markdown tables in prose follow the same conventions automatically.

### Section Band
A section head printed white on a solid chapter-color strip, with a fading white halftone over its right 38%. Counts may sit inline at the baseline. Prose h2 is the same object.

### Chapter Opener
A full-bleed halftone screen in the chapter color, washed out to paper from the left (a 100° gradient), so the 900 headline and 16px ink-2 summary sit on clean paper. It is closed by a 4px chapter-color rule. Sub-page links sit below it as 2px-outlined 4px-radius buttons, and the current one is filled ink.

### Buttons and Toggles
- **Shape:** 4px radius, 2px ink border, paper fill, 700 weight at 13.5–14px.
- **Hover:** fills with ink and the text turns paper (`.2s var(--ease)`).
- **Pressed / checked:** highlighter yellow fill with ink text and border (shiny toggle, auto-rotate, dial direction). Segmented groups (sprite actions) instead fill ink for the checked segment.
- **Disabled:** 40% opacity, not-allowed cursor.

### Chips and Tags
- **Type tag:** filled with the game's type color, white 700 12px text with a 1px shadow (dark text on light types), 22px tall, 3px radius. It links to the type entry.
- **Chip:** 24px tall, 1.5px ink outline, 3px radius. The "on" state uses highlighter yellow.
- **Rarity:** five 8px pips in the game's rarity color with an inset bottom shade. Unearned pips use the hairline color.

### Inputs / Fields
- **Search:** 40px tall, filled with shade paper, 4px radius, a leading 18px search icon and a trailing `/` kbd hint. On focus it changes to a paper fill with a 1.5px ink border, and the kbd hint hides.
- **Results:** a 2px ink-bordered popover with the Popover shadow. Each row shows a kind label, a bold name and an ellipsized line. The active row uses the highlighter mixed 55% into paper.
- **Focus (global):** a 3px outline in the chapter color with a 2px offset.

### Navigation
- **Edge tabs (desktop):** a fixed column 44px wide down the right edge, holding eight 76px chapter-color tabs with white vertical-rl 900 14px text (+.3em). Tabs rest 10px tucked in, slide to 2px on hover and sit flush when current (.35s `--ease`). The current tab adds the Current Tab shadow and a 7×24px highlighter nub on its inner edge.
- **Bottom tabs (≤860px):** the column becomes a 48px bar across the bottom (with safe-area inset) and a 2px ink top rule. Each tab is paper with a 5px chapter-color top edge and horizontal 12.5px text. The current tab fills with its chapter color and white text.
- **Header:** sticky, 92% paper with blur, 2px ink bottom rule, holding the brand lockup, the search field and the outlined "去玩遊戲" link. On mobile only the mark and search remain.
- **In-page TOC:** 13.5px links on a 2px hairline spine. The current section gets a chapter-color spine segment and a tint gradient. It is driven by an IntersectionObserver.

### Pokémon Figure (signature)
A 4:3 stage with a 2px ink frame and a paper vignette. The real sprite plays in it at integer scale. SVG leader lines (1.2px ink, chapter-color end dots) draw from the figure to callouts (an ink-2 label and a 30px Barlow value). Controls are a segmented 7-action bar, a 96px 8-direction dial and shiny / auto-rotate toggles.

### Icons
Inline SVG only, from one 24-unit set with 1.8 stroke, round caps and joins, in `currentColor` (`Icon.astro`).

### Motion
The ease is `cubic-bezier(.16, 1, .3, 1)` throughout, with .2s for color states and .25–.35s for tabs and lifts. Entrances are short: TOC rows rise 10px in a 60ms stagger, leader lines draw and callouts pop. The home frieze of real sprites marches at a constant linear 90s loop. Under `prefers-reduced-motion: reduce`, a global rule collapses all animation and transition durations to near zero with a single iteration. Sprite playback stops (`sprite.ts`), FLIP sorting is skipped (`dex-table.ts`), and chest, pity and timeline animations check the same query.

## Do's and Don'ts

### Do:
- **Do** set `data-ch` on the page and style through `--ch`, `--ch-tint` and `--ch-ink`. Never hard-code a chapter hex inside a component.
- **Do** reserve `selection` yellow (with `#151515` text) for current/selected state only.
- **Do** encode every numeric magnitude with the 10-step ramp (`.ramp` + `.s0`–`.s9`).
- **Do** set every compared number in Barlow Condensed tabular (`.num`), right-aligned in tables.
- **Do** build data as ruled spec tables: a 3px chapter top rule, a solid chapter header band, 1px hairlines and tinted even rows.
- **Do** render sprites with `image-rendering: pixelated` at integer scale.
- **Do** define new colors as custom properties with a matching dark-mode value in the `prefers-color-scheme: dark` block.
- **Do** keep every animation under the global reduced-motion rule, and stop scripted motion when `prefers-reduced-motion: reduce` matches.
- **Do** present game facts only, with the formula or mechanic beside the number.

### Don't:
- **Don't** add recommendations, tier lists, "best" picks or strategy opinions to any surface. The site records the game; it does not advise.
- **Don't** use type or rarity colors outside type tags and rarity pips.
- **Don't** let a chapter color encode quantity or appear on another chapter's page as decoration.
- **Don't** lift content into shadowed cards. Group with rules, bands and halftone.
- **Don't** use glyph or emoji icons, or an icon font. Use the inline SVG set.
- **Don't** load fonts from a CDN or add a third face. Noto Sans TC and Barlow Condensed are the whole system.
- **Don't** smooth, interpolate or fractionally scale sprite art.
