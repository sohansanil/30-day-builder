# Day 2 — HTML, CSS & How the Web Works

**Date**: June 6, 2026  
**Focus**: Semantic markup, modern CSS layouts (Grid, Flexbox, Subgrid, Container Queries), HSL color spaces, and light/dark theme toggles.  
**Type**: 🧠 Learning + 🔨 Building

---

## 🎯 Learning Objective

Understand the structural foundation of the web (HTML5), styling principles (CSS3), how browsers render layouts, and how to position yourself visually as a developer-builder rather than a generic curriculum follower.

## 🧠 What I Learned

### How Browsers Render Pages (HTTP & Critical Rendering Path)
1. **Request/Response**: When you enter a URL, your browser sends an HTTP GET request. The server returns raw HTML.
2. **Parsing HTML & CSS**: The browser parses HTML to build the **DOM** (Document Object Model) and CSS to build the **CSSOM** (CSS Object Model).
3. **Render Tree**: The DOM and CSSOM combine into a render tree.
4. **Layout**: The browser calculates the exact geometry, sizing, and position of every box on the screen.
5. **Paint**: The browser draws pixels onto the screen (color, shadows, borders, text).

### Modern CSS Layout Decision Tree
- **Flexbox**: 1-dimensional layouts (rows or columns) where items dictate their own sizing. Perfect for alignment (navbars, item lists, badges).
- **Grid**: 2-dimensional layouts where the structural skeleton is defined first, and items are slotted into lines.
- **Subgrid**: Grandchildren can inherit the track definition of grandparent grids. Solves the classic "ragged edge" card problem where titles and action buttons don't align because of differing text content.
- **Container Queries**: Standard media queries only check the viewport. Container queries let a component change its styling based on the width of its direct parent container.

### Modern Theming & Color Schemes
- **`color-scheme`**: Built-in CSS property indicating to the browser whether light, dark, or both themes are supported. This themes browser-native UI elements (scrollbars, input elements) automatically and reduces the initial white-flash on loading.
- **`light-dark(lightColor, darkColor)`**: A modern CSS function that automatically picks the correct token depending on the active theme, eliminating duplicate media queries.
- **Flash of Unstyled Content (FOUC)**: To prevent a flash of white for dark-themed users before the DOM parses, an inline script in the `<head>` must check `localStorage` immediately.

---

## ✅ What I Did

- [x] Designed and built a premium portfolio landing page inside `projects/portfolio/`.
- [x] Used HTML5 semantic elements (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`).
- [x] Created a full design token system in `style.css` using modern CSS variables.
- [x] Integrated CSS Grid with `repeat(auto-fit, minmax(320px, 1fr))` for responsiveness.
- [x] Leveraged CSS Subgrid (`grid-template-rows: subgrid`) on portfolio cards to keep header/title/graphic/footer perfectly aligned across adjacent rows.
- [x] Leveraged `@container` queries on the card element to change the card layout from a vertical block to a horizontal row if the container stretches past 600px.
- [x] Designed pure-CSS mock visual widgets for the featured projects (win probability bar for the IPL Simulator, VC database table for the Startup Explorer, Circular Progress Gauge for ResumeAI, and forecast timeline bar chart for the Smart Expense Tracker).
- [x] Built a light/dark theme switch that defaults to the user's system preferences but overrides it on manual click, persisting the selection in `localStorage`.
- [x] Implemented accessible focus-ring styling using `:focus-visible` and custom offsets.

---

## 💡 Key Takeaways

1. **Intrinsics over Hardcoding**: Letting the browser handle width and scaling (e.g. `minmax()`, `clamp()`, auto-fit) creates much more resilient layouts than using absolute pixel dimensions.
2. **Subgrid simplifies card lists**: Aligning titles and footers across cards used to require tedious JS height-matching or ugly flex hacks. CSS Subgrid natively makes cards share row heights.
3. **Data Science positioning**: In placement preparation, standard "hello-world" portfolios make you blend in. A portfolio highlighting simulated probabilities, VC tables, and forecasting graphs instantly signals an analytical product developer.

---

## 🔗 Resources

- [A Complete Guide to CSS Grid (CSS-Tricks)](https://css-tricks.com/snippets/css/complete-guide-grid/)
- [MDN: CSS Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Containment/Container_queries)
- [Baseline: CSS Subgrid Support](https://web.dev/blog/subgrid/)

---

## 📣 LinkedIn Post Draft

> **Day 2 of my 30-Day Builder Journey** 🚀
> 
> Today was all about learning how browsers render layouts and building my portfolio homepage using modern HTML5 and Vanilla CSS.
> 
> As a Data Science & Engineering student, I wanted to avoid building a generic portfolio. Instead of showing plain screenshots or boring bullet points, I designed interactive, pure-CSS data dashboards directly inside my project cards. 
> 
> What I learned/implemented today:
> - **CSS Subgrid**: Kept titles, descriptions, and action items perfectly aligned across different cards without a single line of JavaScript.
> - **Container Queries**: Styled components to react to the size of their parent element, making the cards responsive regardless of where they are placed.
> - **Light/Dark Toggle**: Implemented a theme system that reads system preferences by default using the native CSS `light-dark()` function, with a manual override saved in `localStorage`.
> - **Semantic HTML**: Kept accessibility (WCAG focus states, clean heading structures) front and center.
> 
> Day 2 is done. Tomorrow is Day 3, where I'll write JavaScript to make these simulated visualizations dynamic and load my project data dynamically!
> 
> Check out the repository: [GitHub Link]
> 
> #BuildInPublic #HTML5 #CSS3 #DataScience #WebDevelopment #ResponsiveDesign #30DayBuilderJourney
