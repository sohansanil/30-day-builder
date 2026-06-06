/**
 * Day 3 — JavaScript & Interactivity
 * 30-Day Builder Journey
 * Sohan Sanil — Portfolio Interactive Engines
 */

document.addEventListener("DOMContentLoaded", () => {
  // Initialize all components
  initThemeManager();
  initIPLSimulator();
  initStartupExplorer();
  initResumeAnalyzer();
  initExpenseTracker();
  initSkillsFilter();
  initVaultFilter();
});

// ==========================================
// 1. THEME MANAGER
// ==========================================
function initThemeManager() {
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const metaColorScheme = document.querySelector('meta[name="color-scheme"]');

  if (!themeToggleBtn) return;

  themeToggleBtn.addEventListener("click", () => {
    const currentScheme = metaColorScheme.content;
    let newScheme = "dark";

    if (
      currentScheme === "dark" ||
      (currentScheme === "light dark" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      newScheme = "light";
    } else {
      newScheme = "dark";
    }

    metaColorScheme.content = newScheme;
    document.documentElement.setAttribute("data-theme", newScheme);
    localStorage.setItem("color-scheme", newScheme);

    // Dynamic rotation animation for button icon
    const icon = themeToggleBtn.querySelector(".toggle-icon:not([style*='opacity: 0'])");
    if (icon) {
      icon.style.transform = "rotate(360deg)";
      setTimeout(() => {
        icon.style.transform = "";
      }, 300);
    }
  });
}

// ==========================================
// 2. IPL MATCH SIMULATOR
// ==========================================
function initIPLSimulator() {
  const teamASelect = document.getElementById("sim-select-team-a");
  const teamBSelect = document.getElementById("sim-select-team-b");
  const runBtn = document.getElementById("btn-sim-run");
  const teamALabel = document.getElementById("sim-team-a-lbl");
  const teamBLabel = document.getElementById("sim-team-b-lbl");
  const barA = document.getElementById("sim-bar-a");
  const barB = document.getElementById("sim-bar-b");
  const metaText = document.getElementById("sim-meta-text");
  const outcomeText = document.getElementById("sim-result-outcome");

  if (!runBtn) return;

  // Base team strength ratings (influence simulation odds)
  const teamStrengths = {
    MI: 0.54,
    CSK: 0.53,
    RCB: 0.46,
    KKR: 0.51,
  };

  // Sync labels when selections change
  const syncLabels = () => {
    teamALabel.textContent = teamASelect.value;
    teamBLabel.textContent = teamBSelect.value;
    outcomeText.textContent = "";
    outcomeText.classList.remove("active");
  };

  teamASelect.addEventListener("change", syncLabels);
  teamBSelect.addEventListener("change", syncLabels);

  runBtn.addEventListener("click", () => {
    const teamA = teamASelect.value;
    const teamB = teamBSelect.value;

    if (teamA === teamB) {
      outcomeText.textContent = "Please select two different teams!";
      outcomeText.classList.add("active");
      return;
    }

    // Disable button & animate loading
    runBtn.disabled = true;
    runBtn.textContent = "Running Monte Carlo Sim...";
    outcomeText.classList.remove("active");

    let iteration = 0;
    const maxIterations = 20;
    
    // Animate probability bar switching wildy during computation
    const flickerInterval = setInterval(() => {
      const tempVal = Math.floor(Math.random() * 40) + 30; // 30% to 70%
      barA.style.inlineSize = `${tempVal}%`;
      barA.textContent = `${tempVal}%`;
      barB.style.inlineSize = `${100 - tempVal}%`;
      barB.textContent = `${100 - tempVal}%`;
      iteration++;

      if (iteration >= maxIterations) {
        clearInterval(flickerInterval);
        finalizeSimulation(teamA, teamB);
      }
    }, 60);
  });

  function finalizeSimulation(teamA, teamB) {
    const strengthA = teamStrengths[teamA] || 0.5;
    const strengthB = teamStrengths[teamB] || 0.5;
    
    // Probability calculations (odds ratio)
    const ratioA = strengthA / (strengthA + strengthB);
    // Add random variance (+/- 12%)
    const variance = (Math.random() - 0.5) * 0.24;
    let probA = Math.round((ratioA + variance) * 100);
    
    // Bound probabilities
    probA = Math.max(15, Math.min(85, probA));
    const probB = 100 - probA;

    // Apply widths and texts
    barA.style.inlineSize = `${probA}%`;
    barA.textContent = `${probA}%`;
    barB.style.inlineSize = `${probB}%`;
    barB.textContent = `${probB}%`;

    // Compute detailed outcome description
    const winner = probA > probB ? teamA : teamB;
    const loser = winner === teamA ? teamB : teamA;
    const marginType = Math.random() > 0.5 ? "runs" : "wickets";
    let margin = 0;
    let description = "";

    if (marginType === "runs") {
      margin = Math.floor(Math.random() * 60) + 5;
      description = `${winner} won by ${margin} runs (defending ${Math.floor(Math.random() * 60) + 160})`;
    } else {
      margin = Math.floor(Math.random() * 7) + 1;
      const overs = (15 + Math.random() * 4.5).toFixed(1);
      description = `${winner} won by ${margin} wickets (chasing, target reached in ${overs} ov.)`;
    }

    // Update UI elements
    metaText.textContent = "10,000 simulations completed";
    outcomeText.innerHTML = `<strong>Outcome:</strong> ${description}`;
    outcomeText.classList.add("active");

    // Reset button
    runBtn.disabled = false;
    runBtn.textContent = "Simulate Match";
  }
}

// ==========================================
// 3. STARTUP FUNDING EXPLORER
// ==========================================
function initStartupExplorer() {
  const tableBody = document.getElementById("startup-table-body");
  const searchInput = document.getElementById("startup-search");
  const stageFiltersContainer = document.getElementById("startup-stage-filters");
  const totalRaisedEl = document.getElementById("stat-total-raised");
  const avgRoundEl = document.getElementById("stat-avg-round");
  
  const toggleFormBtn = document.getElementById("btn-toggle-add-form");
  const addForm = document.getElementById("add-round-form");
  const cancelFormBtn = document.getElementById("btn-cancel-add-form");

  if (!tableBody) return;

  // Local dataset
  let dataset = [
    { name: "Acme AI", stage: "Seed", amount: 2.4 },
    { name: "AlphaTech", stage: "Series A", amount: 12.5 },
    { name: "BetaCloud", stage: "Series A", amount: 8.2 },
    { name: "GammaHealth", stage: "Series B", amount: 19.7 },
  ];

  let activeStage = "all";
  let activeSearch = "";

  // Render rows
  const renderTable = () => {
    // Keep header row
    const headRow = tableBody.querySelector(".table-row.head");
    tableBody.innerHTML = "";
    tableBody.appendChild(headRow);

    const filtered = dataset.filter((item) => {
      const matchStage = activeStage === "all" || item.stage === activeStage;
      const matchSearch = item.name.toLowerCase().includes(activeSearch.toLowerCase());
      return matchStage && matchSearch;
    });

    if (filtered.length === 0) {
      const emptyRow = document.createElement("div");
      emptyRow.className = "table-row";
      emptyRow.style.gridTemplateColumns = "1fr";
      emptyRow.style.textAlign = "center";
      emptyRow.style.color = "var(--color-text-secondary)";
      emptyRow.style.paddingBlock = "12px";
      emptyRow.textContent = "No funding rounds found";
      tableBody.appendChild(emptyRow);
    } else {
      filtered.forEach((item) => {
        const row = document.createElement("div");
        row.className = "table-row row-entry-anim";
        
        const nameSpan = document.createElement("span");
        nameSpan.textContent = item.name;
        
        const stageSpan = document.createElement("span");
        const badgeClass = item.stage === "Seed" ? "seed" : item.stage === "Series A" ? "series-a" : "series-b";
        stageSpan.className = `stage-badge ${badgeClass}`;
        stageSpan.textContent = item.stage;
        
        const amountSpan = document.createElement("span");
        amountSpan.textContent = `$${item.amount.toFixed(1)}M`;

        row.appendChild(nameSpan);
        row.appendChild(stageSpan);
        row.appendChild(amountSpan);
        tableBody.appendChild(row);
      });
    }

    updateStats(filtered);
  };

  // Animate numerical counters
  let prevTotal = 0;
  let prevAvg = 0;

  const updateStats = (data) => {
    const total = data.reduce((sum, item) => sum + item.amount, 0);
    const avg = data.length > 0 ? total / data.length : 0;

    animateCount(totalRaisedEl, prevTotal, total, "$", "M");
    animateCount(avgRoundEl, prevAvg, avg, "$", "M");

    prevTotal = total;
    prevAvg = avg;
  };

  function animateCount(element, start, end, prefix = "", suffix = "") {
    let startTime = null;
    const duration = 600; // ms

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad
      const easeProgress = progress * (2 - progress);
      const current = start + easeProgress * (end - start);
      element.textContent = `${prefix}${current.toFixed(1)}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.textContent = `${prefix}${end.toFixed(1)}${suffix}`;
      }
    }
    requestAnimationFrame(step);
  }

  // Event handlers: Stage Filters
  stageFiltersContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-pill")) {
      stageFiltersContainer.querySelectorAll(".filter-pill").forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");
      activeStage = e.target.getAttribute("data-stage");
      renderTable();
    }
  });

  // Event handlers: Search Input
  searchInput.addEventListener("input", (e) => {
    activeSearch = e.target.value;
    renderTable();
  });

  // Form toggles
  toggleFormBtn.addEventListener("click", () => {
    addForm.classList.remove("hidden");
    toggleFormBtn.classList.add("hidden");
  });

  cancelFormBtn.addEventListener("click", () => {
    addForm.classList.add("hidden");
    toggleFormBtn.classList.remove("hidden");
    addForm.reset();
  });

  // Form submit
  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("add-startup-name").value.trim();
    const stage = document.getElementById("add-startup-stage").value;
    const amount = parseFloat(document.getElementById("add-startup-amount").value);

    if (name && stage && !isNaN(amount)) {
      dataset.push({ name, stage, amount });
      
      // Reset form and UI
      addForm.reset();
      addForm.classList.add("hidden");
      toggleFormBtn.classList.remove("hidden");
      
      // Render
      renderTable();
    }
  });

  // Initial render
  renderTable();
}

// ==========================================
// 4. RESUMEAI ANALYZER
// ==========================================
function initResumeAnalyzer() {
  const roleSelect = document.getElementById("resume-job-role");
  const textInput = document.getElementById("resume-text-input");
  const analyzeBtn = document.getElementById("btn-analyze-resume");
  const gauge = document.getElementById("resume-gauge");
  const scoreVal = document.getElementById("gauge-score-val");
  const feedbackList = document.getElementById("resume-feedback-list");

  if (!analyzeBtn) return;

  // Keyword maps
  const keywords = {
    ds: ["python", "sql", "pandas", "numpy", "scikit-learn", "regression", "analytics", "visualization", "models", "stats"],
    frontend: ["react", "javascript", "css", "html", "dom", "subgrid", "flexbox", "responsive", "typescript", "framework"],
    ml: ["pytorch", "tensorflow", "neural network", "transformers", "gpu", "nlp", "llm", "embeddings", "training", "weights"],
  };

  const genericFeedback = {
    ds: {
      pass: ["Solid alignment with analytical foundations.", "Includes structured SQL terms."],
      warn: ["Consider adding more metrics/statistical significance in your projects.", "Specify ML framework names (e.g. Scikit-Learn) instead of generic terms."],
    },
    frontend: {
      pass: ["Demonstrates knowledge of modern styling layouts.", "Strong mention of DOM manipulation concepts."],
      warn: ["Make sure to explicitly mention frameworks like React.", "Accessibility (ARIA, WCAG) focus could be improved."],
    },
    ml: {
      pass: ["Good coverage of deep learning terminology.", "Reflects compute/hardware experience (GPUs)."],
      warn: ["Highlight model deployment concepts or pipeline optimization.", "Explain context of vector search embeddings used."],
    },
  };

  analyzeBtn.addEventListener("click", () => {
    const role = roleSelect.value;
    const text = textInput.value.trim().toLowerCase();

    // Disable interactions
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing Parsing Nodes...";
    feedbackList.style.opacity = "0.4";

    // Set gauge to loading animation (spinning border)
    gauge.classList.add("spinning-gauge");

    setTimeout(() => {
      // Clean loading state
      gauge.classList.remove("spinning-gauge");
      feedbackList.style.opacity = "1";
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze Fit";

      let matched = [];
      let missing = [];
      const roleKeywords = keywords[role];

      if (text.length === 0) {
        // If empty input, reset to a low/zero baseline
        updateGauge(0);
        feedbackList.innerHTML = `<li class="bullet-warning">Input is empty! Paste resume contents to check keyword matchups.</li>`;
        return;
      }

      // Check occurrences
      roleKeywords.forEach((kw) => {
        if (text.includes(kw)) {
          matched.push(kw);
        } else {
          missing.push(kw);
        }
      });

      // Calculate score (baseline 25% if they have text, plus weight of keyword matches)
      const keywordRatio = matched.length / roleKeywords.length;
      const score = Math.round(20 + keywordRatio * 80);

      updateGauge(score);

      // Render Feedback
      feedbackList.innerHTML = "";
      
      // Pass items
      if (matched.length > 0) {
        const passLi = document.createElement("li");
        passLi.className = "bullet-pass";
        passLi.innerHTML = `Found keywords: <strong>${matched.slice(0, 3).join(", ")}</strong>`;
        feedbackList.appendChild(passLi);
      }
      
      genericFeedback[role].pass.forEach((text) => {
        const li = document.createElement("li");
        li.className = "bullet-pass";
        li.textContent = text;
        feedbackList.appendChild(li);
      });

      // Warning items
      if (missing.length > 0) {
        const warnLi = document.createElement("li");
        warnLi.className = "bullet-warning";
        warnLi.innerHTML = `Missing keywords: <strong>${missing.slice(0, 2).join(", ")}</strong>`;
        feedbackList.appendChild(warnLi);
      }
      
      genericFeedback[role].warn.forEach((text) => {
        const li = document.createElement("li");
        li.className = "bullet-warning";
        li.textContent = text;
        feedbackList.appendChild(li);
      });
      
    }, 1200);
  });

  function updateGauge(score) {
    // Animate progress text
    let current = 0;
    const stepTime = 12; // ms
    const increment = Math.ceil(score / 30) || 1;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        current = score;
        clearInterval(timer);
      }
      
      scoreVal.textContent = `${current}%`;
      // Update conic-gradient background style
      gauge.style.background = `conic-gradient(var(--color-accent) 0% ${current}%, var(--ui-border) ${current}% 100%)`;
    }, stepTime);
  }
}

// ==========================================
// 5. SMART EXPENSE TRACKER
// ==========================================
function initExpenseTracker() {
  const categorySelect = document.getElementById("expense-category-select");
  const amountInput = document.getElementById("expense-add-amount");
  const weekSelect = document.getElementById("expense-add-week");
  const addBtn = document.getElementById("btn-add-expense");
  const chartContainer = document.getElementById("expense-chart-container");
  const healthText = document.getElementById("expense-health-text");

  if (!chartContainer) return;

  // Spends data model
  let spends = {
    food: [25, 20, 35, 15],
    rent: [45, 45, 45, 0],
    leisure: [15, 5, 40, 20],
  };

  // Tooltip element
  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip hidden";
  document.body.appendChild(tooltip);

  // Get total spends (all category sum)
  const getWeeklyTotals = () => {
    const w1 = spends.food[0] + spends.rent[0] + spends.leisure[0];
    const w2 = spends.food[1] + spends.rent[1] + spends.leisure[1];
    const w3 = spends.food[2] + spends.rent[2] + spends.leisure[2];
    const w4 = spends.food[3] + spends.rent[3] + spends.leisure[3];
    return [w1, w2, w3, w4];
  };

  const renderChart = () => {
    const activeCategory = categorySelect.value;
    let categoryData = [];

    if (activeCategory === "all") {
      categoryData = getWeeklyTotals();
    } else {
      categoryData = spends[activeCategory] || [0, 0, 0, 0];
    }

    // Determine max value to scale bar heights relative to container
    const maxVal = Math.max(...categoryData, 80); // baseline scale max

    const columns = chartContainer.querySelectorAll(".chart-bar-col");
    let totalSpend = 0;

    columns.forEach((col, index) => {
      const bar = col.querySelector(".chart-bar");
      const val = categoryData[index];
      totalSpend += val;

      // Calculate percentage height
      const heightPercent = Math.min(100, Math.round((val / maxVal) * 90) + 10);
      bar.style.blockSize = `${heightPercent}%`;

      // Set spent data attribute for tooltips
      col.setAttribute("data-amount", val.toFixed(1));

      // Reset state styles
      bar.classList.remove("anomaly");
      
      // Determine if a week represents an anomaly (e.g. week spend exceeds $75 in individual items or $100 total)
      const threshold = activeCategory === "all" ? 110 : 35;
      if (val > threshold && index !== 3) {
        bar.classList.add("anomaly");
      }
    });

    // Update budget health text status
    const criticalThreshold = activeCategory === "all" ? 350 : 110;
    if (totalSpend > criticalThreshold) {
      healthText.textContent = "Budget Health: Alert (Overlimit)";
      healthText.className = "chart-indicator alert";
    } else {
      healthText.textContent = "Budget Health: Strong";
      healthText.className = "chart-indicator normal";
    }
  };

  // Trigger re-render on select category change
  categorySelect.addEventListener("change", renderChart);

  // Add Spend
  addBtn.addEventListener("click", () => {
    const amount = parseFloat(amountInput.value);
    const weekIndex = parseInt(weekSelect.value) - 1;
    const activeCategory = categorySelect.value;

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    // Determine target category for spend
    const targetCat = activeCategory === "all" ? "food" : activeCategory;

    // Add amount
    spends[targetCat][weekIndex] += amount;

    // Pulse/Animate the added bar column
    const targetCol = chartContainer.querySelector(`.chart-bar-col[data-week="${weekIndex + 1}"]`);
    if (targetCol) {
      const bar = targetCol.querySelector(".chart-bar");
      bar.style.transform = "scale(1.15)";
      setTimeout(() => {
        bar.style.transform = "";
      }, 300);
    }

    // Reset amount
    amountInput.value = "";

    // Refresh UI
    renderChart();
  });

  // Tooltip event delegation on chart bar columns
  chartContainer.addEventListener("mousemove", (e) => {
    const col = e.target.closest(".chart-bar-col");
    if (col) {
      const week = col.getAttribute("data-week");
      const amount = col.getAttribute("data-amount");
      const categoryLabel = categorySelect.options[categorySelect.selectedIndex].text;

      tooltip.innerHTML = `<strong>Week ${week}</strong><br>${categoryLabel}: $${amount}`;
      tooltip.classList.remove("hidden");
      
      // Position tooltip offset from cursor
      tooltip.style.left = `${e.clientX + 10}px`;
      tooltip.style.top = `${e.clientY + 15}px`;
    } else {
      tooltip.classList.add("hidden");
    }
  });

  chartContainer.addEventListener("mouseleave", () => {
    tooltip.classList.add("hidden");
  });

  // Initial draw
  renderChart();
}

// ==========================================
// 6. SKILLS MATRIX FILTER
// ==========================================
function initSkillsFilter() {
  const searchInput = document.getElementById("skills-search");
  const categories = document.querySelectorAll(".skills-category-card");

  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.trim().toLowerCase();

    categories.forEach((card) => {
      const listItems = card.querySelectorAll(".skills-list li");
      let categoryMatch = false;

      listItems.forEach((li) => {
        const text = li.textContent.toLowerCase();
        if (query === "") {
          // Reset highlights
          li.style.color = "";
          li.style.opacity = "";
          li.style.fontWeight = "";
          categoryMatch = true;
        } else if (text.includes(query)) {
          // Highlight match
          li.style.color = "var(--color-accent)";
          li.style.opacity = "1";
          li.style.fontWeight = "600";
          categoryMatch = true;
        } else {
          // Dim unmatched
          li.style.color = "var(--color-text-secondary)";
          li.style.opacity = "0.35";
          li.style.fontWeight = "";
        }
      });

      // Highlight matching container card borders
      if (query === "") {
        card.style.borderColor = "";
        card.style.opacity = "";
        card.style.transform = "";
      } else if (categoryMatch) {
        card.style.borderColor = "var(--color-accent)";
        card.style.opacity = "1";
        card.style.transform = "translateY(-2px)";
      } else {
        card.style.borderColor = "var(--color-border)";
        card.style.opacity = "0.4";
        card.style.transform = "";
      }
    });
  });
}

// ==========================================
// 7. LEARNING VAULT FILTERS
// ==========================================
function initVaultFilter() {
  const filterContainer = document.getElementById("vault-status-filters");
  const gridContainer = document.getElementById("vault-grid-container");

  if (!filterContainer || !gridContainer) return;

  const cards = gridContainer.querySelectorAll(".vault-card");

  filterContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("filter-pill")) {
      filterContainer.querySelectorAll(".filter-pill").forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");

      const activeStatus = e.target.getAttribute("data-status");

      cards.forEach((card) => {
        const cardStatus = card.getAttribute("data-status");

        if (activeStatus === "all" || cardStatus === activeStatus) {
          card.classList.remove("hidden");
          // Smooth fade in transition
          setTimeout(() => {
            card.style.opacity = "1";
            card.style.transform = "scale(1)";
            card.style.display = "";
          }, 10);
        } else {
          card.style.opacity = "0";
          card.style.transform = "scale(0.95)";
          // Hide after transition finishes
          setTimeout(() => {
            card.style.display = "none";
            card.classList.add("hidden");
          }, 200);
        }
      });
    }
  });
}
