# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro static site generation, deployed to GitHub Pages (https://danny0411.github.io/pokesurvivor-guide/) through GitHub Actions. Game data comes from `tools/extract.cjs`, which runs the live game bundle from pokesurvivor.com in a VM sandbox. Sprites come from PMDCollab SpriteCollab via `tools/sprites.cjs`.

## Users

Taiwanese players of PokéSurvivor (the user's friends and other Chinese-speaking players). They usually look things up mid-run on a phone: how strong a Pokémon is, what a move does at each level, what a chest drops. Some sessions are long desk reads that study mechanics and numbers.

## Product Purpose

The site is「PokéSurvivor 完全圖鑑」, a complete Traditional Chinese encyclopedia of the browser game PokéSurvivor. It covers every Pokémon, move, type interaction, enemy, boss, rift, event, map prop, weather, terrain, held item, permanent upgrade, gacha rule, mission, achievement and changelog entry. Success means a player can find any in-game fact quickly and trust that it matches the live game.

## Positioning

Every fact is extracted from, or verified against, the live game source code and can be regenerated when the game updates. The site shows each Pokémon's real in-game sprite animations: 8 directions, 7 actions, normal and shiny.

## Operating Context

- People look things up mid-run on a phone.
- Players share links to individual Pokémon or moves in chats.
- The game updates often. The changelog dated 2026-10-12 changed reroll rules, so the data must stay re-extractable.

## Capabilities and Constraints

- **Content rule:** present game content only. No build or team recommendations, tier lists or strategy opinions.
- **Language and names:** Traditional Chinese, using official Taiwan Pokémon names. The game's own strings are Spanish/English, so the Chinese names are translations.
- **Counts:** 966 Pokémon (including #1000 Gholdengo, which has no sprite), 64 moves, each with 5 levels and most with a Lv5 evolution.

## Brand Commitments

- **Name:** PokéSurvivor 完全圖鑑.
- **Footer disclosure:** an unofficial fan site notice, a link to the game (https://pokesurvivor.com/), and SpriteCollab author credits (CC BY-NC).

## Evidence on Hand

- Extracted game data in `src/data/game/*.json`.
- Mechanics research in `src/content/mechanics/*.md`, with game-code line citations.
- Chinese translations in `src/i18n/zh/*.json`.
- Sprites in `public/sprites/`, with the manifest in `src/data/sprites.json`.
- No testimonials, traffic numbers or official endorsement exist; never fabricate them.

## Product Principles

1. The game code is the source of truth. Mark anything unverifiable instead of guessing.
2. A complete record beats a curated one. Show everything the game has, without opinion.
3. Any fact should be one search or one tap away, including on a phone mid-run.
4. Numbers come with their mechanics: show the formula, not just the result.

## Accessibility & Inclusion

Pages must be usable on small phone screens. Animations must respect `prefers-reduced-motion`.
