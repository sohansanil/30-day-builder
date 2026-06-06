# Day 3 — JavaScript & Interactivity

**Date**: June 7, 2026  
**Focus**: DOM Manipulation, event listeners, state-driven rendering, numerical count-up animations, statistical simulation logic, text analysis pipelines, and hover-triggered tooltips in Vanilla JS.  
**Type**: 🧠 Learning + 🔨 Building

---

## 🎯 Learning Objective

Learn how to write clean, modular, and performant clientside JavaScript to handle user inputs, manage local component states, perform mathematical operations (weighted simulations, keyword frequencies), and orchestrate rich visual transitions (gauges, chart bars, tooltips) without relying on heavy frameworks.

---

## 🧠 What I Learned

### State-Driven Rendering vs. Ad-hoc Mutators
- **Direct Mutators**: Modifying specific HTML elements directly in response to user clicks is error-prone and hard to scale.
- **State-Driven Model**: Storing the data in a local array or dictionary (the *source of truth*), and calling a standard `render()` function whenever the data changes. This guarantees that elements like filters, searches, and new entries stay perfectly in sync.

### Performance & Layout Thrashing
- Interleaving DOM reads (e.g., cursor coordinates `clientX`) and DOM writes (e.g., setting tooltip positioning `left`/`top`) forces the browser to recalculate the layout repeatedly within a single frame.
- **Fix**: Cache references, perform reads first, and batch updates. For positioning floating elements, ensure styles are offloaded using absolute layout coordinates and read cursor positions directly from mouse events.

### Smooth Numerical Interpolations with `requestAnimationFrame`
- Instead of using `setInterval` (which fires out-of-sync with the screen refresh rate, causing visual stutter), using `requestAnimationFrame` ensures animations run at the browser's native frame rate (60Hz/120Hz).
- Implementing time-based easing (e.g. `easeOutQuad`) creates premium, decelerating count-up animations for funding rounds and average round values.

### Animating Conic-Gradients dynamically
- CSS custom variables allow us to transition solid properties easily, but dynamic conic-gradient angles must be driven by JavaScript.
- By incrementing the target percentage inside an interval and updating the background gradient style:
  `element.style.background = 'conic-gradient(var(--color-accent) 0% ' + score + '%, var(--ui-border) ' + score + '% 100%)'`
  we achieve a smooth, circular loading animation.

---

## ✅ What I Did

- [x] Refactored the theme switcher, porting it from the footer into a modular external `script.js` file with transition-rotation effects on click.
- [x] Link-integrated `script.js` into the HTML using `defer` to guarantee safe post-parsing execution and prevent blocking the Critical Rendering Path.
- [x] Developed the **IPL Match Simulator**:
  - Implemented base team ratings and ratio-based win probabilities.
  - Added a visual flicker animation using a fast interval to represent simulation runs.
  - Generated dynamic, detailed cricket match victory summaries (e.g., runs defended, overs chased).
- [x] Created the **Startup Funding Explorer**:
  - Bound search bars and pill filters to reactively update the funding rounds table.
  - Built a count-up animation for totals and averages using `requestAnimationFrame`.
  - Added a dynamic submission form allowing users to append custom startup funding rounds to the database.
- [x] Implemented the **ResumeAI Analyzer**:
  - Configured custom keyword sets for Data Science, Frontend, and ML.
  - Added text parsing check checks to dynamically compute fit scores.
  - Designed conic-gradient gauge animations and custom bullet highlights for matching and missing terms.
- [x] Programmed the **Smart Expense Tracker**:
  - Linked category selectors to animate bar heights using smooth CSS timing functions.
  - Built transaction inputs that scale bar metrics and highlight spending anomalies.
  - Configured cursor-following hover tooltips detailing precise dollar expenditures.
- [x] Added real-time filters for **Skills Matrix** keywords and **Learning Vault** statuses.

---

## 💡 Key Takeaways

1. **Vanilla JS is incredibly powerful**: You don't need React, Vue, or Angular to build dynamic, responsive dashboards. Plain ES6+ JS, combined with modern CSS, easily creates rich interactive components.
2. **Animation Easing makes a huge difference**: A linear counter feels cheap. An eased (e.g. `easeOutQuad`) counter feels organic and premium.
3. **Event Delegation is clean**: Binding mousemove events to the parent chart container instead of individual bar columns reduces memory footprint and makes dynamic rendering simpler.

---

## 🔗 Resources

- [MDN: requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Web.dev: Avoid Layout Thrashing](https://web.dev/avoid-large-complex-layouts-and-layout-thrashing/)
- [MDN: Conic Gradient](https://developer.mozilla.org/en-US/docs/Web/CSS/gradient/conic-gradient)

---

## 📣 LinkedIn Post Draft

> **Day 3 of my 30-Day Builder Journey** 🚀
> 
> Today was all about JavaScript, DOM interactivity, and state management! I took my static portfolio from Day 2 and converted it into an interactive data product dashboard using pure Vanilla JS. 
> 
> Here is what I built and learned today:
> 
> 🏏 **IPL Match Simulator**: Developed a Monte Carlo simulation engine. When triggered, it runs 10,000 matches with weighted player ratings, flickers the probability bars, and prints dynamic cricket outcome logs.
> 
> 💼 **Startup Funding Explorer**: Configured reactive state arrays. You can search company names, filter by round (Seed, Series A, Series B), and even insert new rounds. Total raised and average round numbers count up dynamically using `requestAnimationFrame` for a smooth visual flow.
> 
> 📄 **ResumeAI Analyzer**: Engineered a quick keyword parsing script. Select a target role (Data Scientist, ML, or Frontend), paste text, and the system runs a text analyzer, spins a conic-gradient gauge to show job fit score, and outputs customized feedback bullets.
> 
> 💰 **Smart Expense Tracker**: Added category toggling that scales chart bars with CSS height transitions. Hovering over bars displays precise cursor-following tooltips, and exceeding spending limits triggers visual anomaly alerts.
> 
> ⚡ **Filters & Search**: Implemented instant searches for the Skills Matrix and Vault categorizations.
> 
> 💡 *Main Takeaway*: State is key. By storing data in a single local array/object (source of truth) and writing standard render functions, syncing the UI with user actions becomes deterministic and simple.
> 
> Check out the codebase: [GitHub Link]
> 
> #BuildInPublic #JavaScript #DOMInteractivity #DataScience #ResponsiveDesign #Animations #CSSGradients #30DayBuilderJourney
