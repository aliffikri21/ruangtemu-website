---
name: playwright
description: End-to-end testing with Playwright for RUANGTEMU mobile virtual photobooth flows and admin panels. Use for "run tests", "test mobile flow", "test e2e", or writing new test specs.
---

# Playwright E2E Testing Skill

Guide for running and writing Playwright tests in `ruangtemu-test`.

## Project Commands

- **Run all E2E tests**:
  ```bash
  npm run test:e2e
  ```
- **Run mobile Android tests only**:
  ```bash
  npm run test:e2e:mobile
  ```
- **Run a specific test file**:
  ```bash
  npx playwright test tests/mobile-event.spec.ts
  ```
- **Open UI Mode**:
  ```bash
  npx playwright test --ui
  ```

## Mobile-First Testing Principles (Per AGENTS.md)

1. **Target Viewports**:
   - Android: Pixel 7 (412x915)
   - iPhone: iPhone 14 (390x844)
2. **Camera Permissions**:
   - `permissions: ['camera', 'microphone']` is preconfigured in `playwright.config.ts`.
3. **Core Mobile Flow**:
   - Open Event (`/event/[slug]`) -> Guest Name Input -> Frame Selection -> Camera Preview -> Capture -> Final Composite -> Result / Gallery.
4. **Data Isolation**:
   - Submissions for Event A must only appear in Event A's gallery, never Event B.
