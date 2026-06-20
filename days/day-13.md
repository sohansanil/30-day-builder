# Day 13: SoFocus - A Chrome Extension for Active Learning

**Status:** Completed
**Project:** SoFocus
**Live Demo:** Not Deployed (Chrome Extension)
**Code:** [GitHub Repository](../projects/sofocus)

## 🎯 The Goal

The original goal was to build a generic note-taking Chrome Extension. But after realizing that note apps break focus, the goal shifted: **transform passive YouTube watching into an active learning system.**

Instead of just saving text, I wanted to build a psychological "vault" that encourages consistency, tracks learning streaks, and visualizes knowledge capture.

## 🛠 What Was Built

SoFocus is a Vanilla JS Chrome Extension (Manifest V3) that injects a Shadow DOM overlay directly into the YouTube player. 

**Core Mechanics:**
- Press `Cmd+Shift+S` to pause the video and open a distraction-free input overlay.
- Capture your "Aha!" moment with an exact timestamp.
- Press `Enter` to lock it in and resume the video immediately.

**The Product Layer:**
To shift it from a "feature" to a "product", I added:
- **A 21-Day Heatmap:** Visualizing study consistency, GitHub style.
- **Learning Streaks:** A counter for consecutive days studied.
- **Session Summaries:** A modal that appears when you finish a study session to review your top insights.
- **Markdown Exports:** One-click export of an entire video's insights into a structured Markdown digest for a Second Brain.

## 🧠 Key Learnings & Challenges

### 1. Shadow DOM Isolation
One of the biggest challenges with Chrome Extensions is that websites (especially YouTube) have complex CSS that leaks into injected UI elements. By attaching the overlay to a Shadow Root (`attachShadow({ mode: 'open' })`), I ensured the extension's UI was completely insulated from YouTube's dark mode overrides and layout shifts.

### 2. Message Passing Architecture
I learned how to pass messages between the `background.js` Service Worker (which handles the hotkey commands) and the `content.js` script (which injects the UI into the active tab).

### 3. Product Psychology
This was a huge lesson in product design. A list of notes feels like a chore. But adding a heatmap, a streak counter, and a "Top Insight" banner changes the entire emotional resonance of the app. It makes the user feel like they are *building knowledge* rather than just *taking notes*.

## 🚀 Next Steps
Tomorrow, the journey continues with Day 14 as I transition back into building data-heavy AI applications.
