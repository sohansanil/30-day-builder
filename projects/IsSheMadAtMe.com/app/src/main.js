/* ============================================================
   IsSheMadAtMe.com — Main Application
   The Relationship Forensics Lab
   ============================================================ */

import './style.css';

// ─── State ─────────────────────────────────────────────────────
const state = {
  view: 'landing',       // 'landing' | 'loading' | 'report'
  selectedFile: null,     // File object
  imageBase64: null,      // Base64 string
  mediaType: null,        // MIME type
  reportData: null,       // Parsed report JSON
  caseNumber: null,       // 6-digit case ID
};

// ─── Constants ─────────────────────────────────────────────────
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MIN_LOADING_MS = 4500;
const MAX_LOADING_MS = 8000;

const WARNING_TICKER_TEXTS = [
  "WARNING: A reply of 'okay' may indicate active disengagement.",
  "WARNING: The absence of emojis is not currently recognized by international law.",
  "WARNING: This office is unable to distinguish flirting from basic human kindness.",
  "WARNING: Use of a period at the end of a sentence may constitute hostility.",
  "WARNING: 'Haha' without punctuation is a known tactical evasion maneuver."
];

const CONTEXT_PLACEHOLDERS = [
  '"She used to send 4 hearts. Now I receive 1."',
  '"Usually replies in 5 minutes. It has been 4 hours."',
  '"The punctuation feels aggressively correct today."',
  '"She typed for 3 minutes and then sent: ok"',
  '"Sent a 3 paragraph text. Received: yeah"',
];

const UPLOAD_ZONE_TEXTS = [
  "DROP EVIDENCE HERE",
  "SUBMIT EXHIBIT A",
  "UPLOAD THE RECEIPTS",
  "DRAG YOUR MISTAKE HERE",
  "ATTACH SUPPORTING DOCUMENTATION"
];

const LOADING_STEPS_A = [
  "Evidence received",
  "Checking reply patterns...",
  "Analyzing punctuation...",
  "Consulting Department of Bad Decisions...",
];

const LOADING_STEPS_B = [
  "Investigative dossier opened",
  "Measuring reply-time degradation...",
  "Verifying \"haha\" authenticity...",
  "Checking for signs of tactical avoidance...",
];

const LOADING_FINALS = [
  "The verdict has been authorized. We wish we had better news.",
  "Evidence review complete. This office recommends emotional preparedness.",
  "Investigation concluded. The findings may be upsetting.",
];

const VERDICT_NAMES = {
  1: 'INSUFFICIENT EVIDENCE TO PANIC',
  2: 'SOME CAUSE FOR REFLECTION',
  3: 'ELEVATED SITUATIONAL AWARENESS REQUIRED',
  4: 'COOKED',
  5: 'CASE CLOSED',
};

const BANNER_TEXT = {
  1: 'ALL CLEAR — NO IMMEDIATE CONCERN',
  2: 'MINOR INDICATORS DETECTED',
  3: 'ELEVATED RISK DETECTED',
  4: 'CRITICAL SITUATION ASSESSED',
  5: 'CASE CLOSED — IMMEDIATE ATTENTION REQUIRED',
};

// In-character error messages
const ERROR_MESSAGES = {
  invalidType: "The submitted file does not appear to be an image. This office handles image evidence only. Accepted formats: JPG, PNG, HEIC, WebP. Please resubmit.",
  tooLarge: "The submitted evidence exceeds our file size limit. This is almost certainly unrelated to the scale of the problem in your relationship. Please compress the image and resubmit.",
  noFile: "No evidence was submitted. This office requires something to analyze. Please upload a screenshot of the conversation in question.",
  apiFailure: "The analysis encountered an unexpected technical complication. This is a lab issue, not a you issue. Please resubmit your case.",
  noConversation: "This office reviewed the submitted image. No conversation was detected. If this was a test of the system, the system passed. If this was a genuine submission, please upload an image that contains text messages.",
  rateLimit: "This office is currently handling a high volume of situationships and has reached capacity for your session. Please try again in a few minutes. You are not the only one going through something.",
};


// ─── DOM References ────────────────────────────────────────────
const dom = {
  body: document.body,

  // Landing
  viewLanding: document.getElementById('view-landing'),
  navCta: document.getElementById('nav-cta'),
  uploadZone: document.getElementById('upload-zone'),
  uploadZoneLabel: document.getElementById('upload-zone-label'),
  fileInput: document.getElementById('file-input'),
  uploadIdle: document.getElementById('upload-idle'),
  uploadHover: document.getElementById('upload-hover'),
  uploadSelected: document.getElementById('upload-selected'),
  uploadError: document.getElementById('upload-error'),
  uploadFilename: document.getElementById('upload-filename'),
  uploadErrorMsg: document.getElementById('upload-error-msg'),
  contextInput: document.getElementById('context-input'),
  submitBtn: document.getElementById('submit-btn'),
  warningTicker: document.getElementById('warning-ticker'),
  footerCaseLink: document.getElementById('footer-case-link'),

  // Loading
  viewLoading: document.getElementById('view-loading'),
  loadingBody: document.getElementById('loading-body'),
  loadingFooter: document.getElementById('loading-footer'),
  loadingFinal: document.getElementById('loading-final'),

  // Report
  viewReport: document.getElementById('view-report'),
  reportContainer: document.getElementById('report-container'),
  reportCaseNumber: document.getElementById('report-case-number'),
  reportDate: document.getElementById('report-date'),
  reportBanner: document.getElementById('report-banner'),
  reportEvidenceGrid: document.getElementById('report-evidence-grid'),
  reportFindingsList: document.getElementById('report-findings-list'),
  matrixGrid: document.getElementById('matrix-grid'),
  verdictBadge: document.getElementById('verdict-badge'),
  verdictName: document.getElementById('verdict-name'),
  verdictStatement: document.getElementById('verdict-statement'),
  reportDirectivesList: document.getElementById('report-directives-list'),
  reportFooterCase: document.getElementById('report-footer-case'),
  reportFooterDate: document.getElementById('report-footer-date'),
  shareBtnPrimary: document.getElementById('share-btn-primary'),
  shareBtnSecondary: document.getElementById('share-btn-secondary'),
  runAnotherBtn: document.getElementById('run-another-btn'),

  // Share card
  shareCard: document.getElementById('share-card'),
};


// ─── View Management ───────────────────────────────────────────
function setView(view) {
  console.log(`[DEBUG] Switching view to: ${view}`);
  state.view = view;
  dom.body.setAttribute('data-view', view);

  // Explicitly handle hidden attributes
  dom.viewLanding.hidden = (view !== 'landing');
  dom.viewLoading.hidden = (view !== 'loading');
  dom.viewReport.hidden = (view !== 'report');

  // Scroll to top on view change
  window.scrollTo(0, 0);

  // Remove verdict class from previous report
  if (view !== 'report') {
    dom.reportContainer.className = 'report';
  }
}


// ─── Upload Zone ───────────────────────────────────────────────
function initUploadZone() {
  const zone = dom.uploadZone;

  // Click to browse
  zone.addEventListener('click', () => dom.fileInput.click());
  zone.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      dom.fileInput.click();
    }
  });

  // File selected via input
  dom.fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  // Drag events
  zone.addEventListener('dragenter', (e) => { e.preventDefault(); showUploadState('hover'); });
  zone.addEventListener('dragover', (e) => { e.preventDefault(); showUploadState('hover'); });
  zone.addEventListener('dragleave', (e) => {
    // Only trigger if leaving the zone entirely
    if (!zone.contains(e.relatedTarget)) {
      showUploadState('idle');
    }
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    showUploadState('idle');
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });
}

function handleFile(file) {
  // Validate type
  if (!ACCEPTED_TYPES.includes(file.type)) {
    showUploadState('error', ERROR_MESSAGES.invalidType);
    return;
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    showUploadState('error', ERROR_MESSAGES.tooLarge);
    return;
  }

  state.selectedFile = file;
  state.mediaType = file.type;

  // Show selected state
  dom.uploadFilename.textContent = file.name;
  showUploadState('selected');
  dom.submitBtn.disabled = false;
}

function showUploadState(stateKey, errorMsg) {
  const zone = dom.uploadZone;

  // Reset all states
  dom.uploadIdle.hidden = true;
  dom.uploadHover.hidden = true;
  dom.uploadSelected.hidden = true;
  dom.uploadError.hidden = true;
  zone.classList.remove('upload-zone--dragover', 'upload-zone--selected', 'upload-zone--error');

  switch (stateKey) {
    case 'idle':
      dom.uploadIdle.hidden = false;
      break;
    case 'hover':
      dom.uploadHover.hidden = false;
      zone.classList.add('upload-zone--dragover');
      break;
    case 'selected':
      dom.uploadSelected.hidden = false;
      zone.classList.add('upload-zone--selected');
      break;
    case 'error':
      dom.uploadError.hidden = false;
      dom.uploadErrorMsg.textContent = errorMsg || '';
      zone.classList.add('upload-zone--error');
      dom.submitBtn.disabled = true;
      state.selectedFile = null;
      break;
  }
}

function resetUpload() {
  state.selectedFile = null;
  state.imageBase64 = null;
  state.mediaType = null;
  state.reportData = null;
  dom.fileInput.value = '';
  dom.contextInput.value = '';
  dom.submitBtn.disabled = true;
  showUploadState('idle');
}


// ─── Image Processing ──────────────────────────────────────────
async function processImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIMENSION = 1500;
        let width = img.width;
        let height = img.height;
        
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = event.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}


// ─── Loading Screen ────────────────────────────────────────────
function buildLoadingScreen() {
  dom.loadingBody.innerHTML = '';
  dom.loadingFooter.hidden = true;

  const steps = Math.random() > 0.5 ? LOADING_STEPS_A : LOADING_STEPS_B;
  
  // Add step lines
  steps.forEach((stepText) => {
    const row = document.createElement('div');
    row.className = 'loading-line';
    row.innerHTML = `
      <span class="loading-log-time"></span>
      <span class="loading-log-msg">${stepText}</span>
    `;
    dom.loadingBody.appendChild(row);
  });

  // Add the "Oh No" moment
  const alertRow = document.createElement('div');
  alertRow.className = 'loading-line loading-line--alert';
  alertRow.innerHTML = `
    <span class="loading-log-time"></span>
    <span class="loading-log-alert">⚠ ANOMALY DETECTED: Concerning behavioral pattern identified.</span>
  `;
  dom.loadingBody.appendChild(alertRow);

  // Add finalizing
  const finalRow = document.createElement('div');
  finalRow.className = 'loading-line';
  finalRow.innerHTML = `
    <span class="loading-log-time"></span>
    <span class="loading-log-msg">Finalizing verdict...</span>
  `;
  dom.loadingBody.appendChild(finalRow);

  // Set the final footer line
  const finalText = LOADING_FINALS[Math.floor(Math.random() * LOADING_FINALS.length)];
  dom.loadingFinal.textContent = `"${finalText}"`;
  dom.loadingFinal.classList.remove('loading-final--visible');
}

function getTimestamp() {
  const now = new Date();
  return String(now.getHours()).padStart(2, '0') + ':' +
         String(now.getMinutes()).padStart(2, '0') + ':' +
         String(now.getSeconds()).padStart(2, '0');
}

async function animateLoadingScreen() {
  const lines = dom.loadingBody.querySelectorAll('.loading-line');

  for (let i = 0; i < lines.length; i++) {
    const isAlert = lines[i].classList.contains('loading-line--alert');
    
    // Pause duration
    if (isAlert) {
      await delay(1500); // Suspense pause before the alert
    } else if (i > 0) {
      await delay(700 + Math.random() * 400); // 700-1100ms
    }

    // Stamp the time right before showing
    const timeSpan = lines[i].querySelector('.loading-log-time');
    if (timeSpan) {
      timeSpan.textContent = getTimestamp() + ' -';
    }

    lines[i].classList.add('loading-line--visible');

    // Pause slightly longer after the alert
    if (isAlert) {
      await delay(800);
    }
  }

  // Wait before showing footer
  await delay(1200);

  // Show final line
  dom.loadingFooter.hidden = false;
  dom.loadingFinal.classList.add('loading-final--visible');
}


// ─── Submit Evidence ───────────────────────────────────────────
async function submitEvidence() {
  if (!state.selectedFile) {
    showUploadState('error', ERROR_MESSAGES.noFile);
    return;
  }

  // Process image to base64
  try {
    state.imageBase64 = await processImage(state.selectedFile);
  } catch {
    showUploadState('error', ERROR_MESSAGES.apiFailure);
    return;
  }

  // Transition to loading screen
  buildLoadingScreen();
  setView('loading');

  // Start both: API call + loading animation
  const loadingStart = Date.now();
  console.log("[DEBUG] submitEvidence: Calling animateLoadingScreen and callAnalysisAPI");
  const animationPromise = animateLoadingScreen();
  const apiPromise = callAnalysisAPI();

  console.log("[DEBUG] submitEvidence: Waiting for Promise.all");
  // Wait for both minimum time AND API response
  const [apiResult] = await Promise.all([
    apiPromise,
    animationPromise,
    delay(MIN_LOADING_MS - (Date.now() - loadingStart)),
  ]);

  console.log("[DEBUG] submitEvidence: Promise.all resolved with apiResult:", apiResult);

  // Handle result
  if (apiResult.success) {
    state.reportData = apiResult;
    state.caseNumber = apiResult.caseNumber;

    // Small pause after loading for dramatic effect
    await delay(800);
    console.log("[DEBUG] submitEvidence: Calling renderReport");
    renderReport(apiResult);
    console.log("[DEBUG] submitEvidence: renderReport completed. Calling setView('report')");
    setView('report');
    console.log("[DEBUG] submitEvidence: setView('report') completed.");
  } else {
    // Go back to landing with error
    setView('landing');
    showUploadState('error', apiResult.errorMessage || ERROR_MESSAGES.apiFailure);
  }
}


// ─── API Call ──────────────────────────────────────────────────
async function callAnalysisAPI() {
  const contextNote = dom.contextInput.value.trim();
  console.log(`[DEBUG] Context string being sent to API: "${contextNote}"`);

  try {
    console.log("[DEBUG] callAnalysisAPI: Fetching /api/analyze");
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: state.imageBase64,
        mimeType: state.mediaType,
        context: contextNote || null,
      }),
    });
    console.log(`[DEBUG] callAnalysisAPI: Fetch returned status ${response.status}`);

    if (response.status === 429) {
      return { success: false, errorMessage: ERROR_MESSAGES.rateLimit };
    }

    if (!response.ok) {
      // In our updated backend, the errorMessage might be in the JSON even if response is not ok
      try {
        const errData = await response.json();
        if (errData.errorMessage) {
          return { success: false, errorMessage: errData.errorMessage };
        }
      } catch(e) {}
      return { success: false, errorMessage: ERROR_MESSAGES.apiFailure };
    }

    console.log("[DEBUG] callAnalysisAPI: Parsing JSON response");
    const data = await response.json();
    console.log("[DEBUG] callAnalysisAPI: JSON parsed successfully:", data);

    if (!data.success) {
      return { success: false, errorMessage: data.errorMessage || ERROR_MESSAGES.apiFailure };
    }

    // Validate required fields
    const validation = validateReport(data);
    if (!validation.valid) {
      console.error('Report validation failed:', validation.error);
      return { success: false, errorMessage: ERROR_MESSAGES.apiFailure };
    }

    return data;
  } catch (err) {
    console.error('API call failed:', err);
    return { success: false, errorMessage: ERROR_MESSAGES.apiFailure };
  }
}

function validateReport(data) {
  const required = [
    'verdictLevel', 'verdictName', 'verdictStatement',
    'evidenceSummary', 'findings', 'probabilityMatrix',
    'operativeDirectives', 'quotableFinding'
  ];

  for (const field of required) {
    if (!(field in data)) return { valid: false, error: `Missing: ${field}` };
  }

  if (data.verdictLevel < 1 || data.verdictLevel > 5) {
    return { valid: false, error: 'verdictLevel must be 1-5' };
  }

  if (!data.findings || data.findings.length < 3 || data.findings.length > 5) {
    return { valid: false, error: 'Must have 3-5 findings' };
  }

  const matrix = data.probabilityMatrix;
  for (const key of ['isAnnoyed', 'isLosingInterest', 'areYouOverthinking', 'isActuallyFine']) {
    if (typeof matrix[key] !== 'number' || matrix[key] < 0 || matrix[key] > 100) {
      return { valid: false, error: `${key} must be 0-100` };
    }
  }

  if (!data.operativeDirectives || data.operativeDirectives.length !== 3) {
    return { valid: false, error: 'Must have exactly 3 directives' };
  }

  return { valid: true };
}


// ─── Report Rendering ──────────────────────────────────────────
function renderReport(data) {
  console.log("[DEBUG] renderReport() called with data:", data);

  // Verify all DOM nodes used in renderReport
  const requiredNodes = {
    reportContainer: dom.reportContainer,
    reportCaseNumber: dom.reportCaseNumber,
    reportDate: dom.reportDate,
    reportBanner: dom.reportBanner,
    reportEvidenceGrid: dom.reportEvidenceGrid,
    reportFindingsList: dom.reportFindingsList,
    matrixGrid: dom.matrixGrid,
    verdictBadge: dom.verdictBadge,
    verdictName: dom.verdictName,
    verdictStatement: dom.verdictStatement,
    reportDirectivesList: dom.reportDirectivesList,
    reportFooterCase: dom.reportFooterCase,
    reportFooterDate: dom.reportFooterDate
  };

  for (const [key, node] of Object.entries(requiredNodes)) {
    if (!node) {
      console.error(`[DEBUG] CRITICAL: DOM node missing for '${key}'`);
    }
  }

  const verdictLevel = data.verdictLevel;
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Apply verdict class to report container
  dom.reportContainer.className = `report verdict--${verdictLevel}`;

  // Header
  dom.reportCaseNumber.textContent = `Case #${data.caseNumber}`;
  dom.reportDate.textContent = `Filed: ${dateStr}`;
  dom.reportBanner.textContent = BANNER_TEXT[verdictLevel] || 'ANALYSIS COMPLETE';

  // Evidence Summary
  const es = data.evidenceSummary;
  dom.reportEvidenceGrid.innerHTML = `
    <div class="evidence-row">
      <span class="evidence-label">File type:</span>
      <span class="evidence-value">Image (text conversation screenshot)</span>
    </div>
    <div class="evidence-row">
      <span class="evidence-label">Estimated messages:</span>
      <span class="evidence-value">${es.estimatedMessageCount || 'N/A'}</span>
    </div>
    <div class="evidence-row">
      <span class="evidence-label">Estimated timespan:</span>
      <span class="evidence-value">${es.estimatedTimespan || 'N/A'}</span>
    </div>
    <div class="evidence-row">
      <span class="evidence-label">Context provided:</span>
      <span class="evidence-value">${es.contextProvided ? 'Yes' : 'No'}</span>
    </div>
    ${es.contextNote ? `
    <div class="evidence-row">
      <span class="evidence-label">Context note:</span>
      <span class="evidence-value">"${escapeHtml(es.contextNote)}"</span>
    </div>` : ''}
  `;

  // Key Findings
  dom.reportFindingsList.innerHTML = data.findings.map((f) => `
    <div class="finding finding--${f.severity}" data-animate="finding">
      <div class="finding__header">
        <span class="finding__title">FINDING ${f.number}: ${escapeHtml(f.title)}</span>
        <span class="finding__severity finding__severity--${f.severity}">${f.severity}</span>
      </div>
      <p class="finding__body">${escapeHtml(f.body)}</p>
    </div>
  `).join('');

  // Probability Matrix
  const matrixItems = [
    { key: 'isAnnoyed', label: 'IS SHE ANNOYED?', value: data.probabilityMatrix.isAnnoyed },
    { key: 'isLosingInterest', label: 'IS SHE LOSING INTEREST?', value: data.probabilityMatrix.isLosingInterest },
    { key: 'areYouOverthinking', label: 'ARE YOU OVERTHINKING?', value: data.probabilityMatrix.areYouOverthinking },
    { key: 'isActuallyFine', label: 'IS SHE ACTUALLY FINE?', value: data.probabilityMatrix.isActuallyFine },
  ];

  dom.matrixGrid.innerHTML = matrixItems.map((item) => {
    const color = getBarColor(item.value);
    return `
      <div class="matrix-row">
        <span class="matrix-label">${item.label}</span>
        <div class="matrix-bar-track">
          <div class="matrix-bar-fill" data-target="${item.value}" style="background-color: ${color};"></div>
        </div>
        <span class="matrix-pct" data-target="${item.value}">0%</span>
      </div>
    `;
  }).join('');

  // Verdict
  dom.verdictBadge.innerHTML = `
    <div class="verdict-badge__level">LEVEL ${verdictLevel}</div>
    <div class="verdict-badge__name">${escapeHtml(data.verdictName)}</div>
  `;
  dom.verdictBadge.classList.remove('verdict-badge--stamped');
  dom.verdictName.textContent = data.verdictName;
  dom.verdictStatement.textContent = data.verdictStatement;

  // Directives
  dom.reportDirectivesList.innerHTML = data.operativeDirectives.map((d, i) => `
    <div class="directive">
      <div class="directive__number">OPERATIVE DIRECTIVE ${String(i + 1).padStart(2, '0')}</div>
      <p class="directive__body">${escapeHtml(d)}</p>
    </div>
  `).join('');

  // Footer
  dom.reportFooterCase.textContent = `Case #${data.caseNumber}`;
  dom.reportFooterDate.textContent = dateStr;

  console.log(`[DEBUG] renderReport completed. reportContainer innerHTML length: ${dom.reportContainer.innerHTML.length}`);

  // Trigger animations after render
  requestAnimationFrame(() => {
    setTimeout(() => animateReport(), 100);
  });
}

async function animateReport() {
  const sections = dom.reportContainer.querySelectorAll('.report__section');

  // Header animates immediately (no animation class needed, it's always visible)

  // Stagger section reveals
  for (let i = 0; i < sections.length; i++) {
    await delay(200);
    sections[i].classList.add('report__section--visible');

    // Special handling for findings
    if (sections[i].id === 'report-findings') {
      const findings = sections[i].querySelectorAll('.finding');
      for (let j = 0; j < findings.length; j++) {
        await delay(150);
        findings[j].classList.add('finding--visible');
      }
    }

    // Special handling for matrix — animate bars
    if (sections[i].id === 'report-matrix') {
      await delay(200);
      const fills = sections[i].querySelectorAll('.matrix-bar-fill');
      const pcts = sections[i].querySelectorAll('.matrix-pct');
      fills.forEach((fill, idx) => {
        const target = parseInt(fill.dataset.target);
        requestAnimationFrame(() => {
          fill.style.width = target + '%';
        });
        pcts[idx].textContent = target + '%';
      });
    }

    // Special handling for verdict — stamp animation
    if (sections[i].id === 'report-verdict') {
      await delay(400);
      dom.verdictBadge.classList.add('verdict-badge--stamped');
    }
  }
}

function getBarColor(value) {
  // Interpolate from green (low) to red (high)
  if (value <= 25) return 'var(--verdict-1-clear)';
  if (value <= 50) return 'var(--verdict-2-reflect)';
  if (value <= 75) return 'var(--verdict-3-elevated)';
  return 'var(--verdict-4-cooked)';
}


// ─── Share Card ────────────────────────────────────────────────
function buildShareCard(data) {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const verdictLevel = data.verdictLevel;

  // Find top 2 probability scores
  const matrix = [
    { label: 'IS SHE ANNOYED?', value: data.probabilityMatrix.isAnnoyed },
    { label: 'IS SHE LOSING INTEREST?', value: data.probabilityMatrix.isLosingInterest },
    { label: 'ARE YOU OVERTHINKING?', value: data.probabilityMatrix.areYouOverthinking },
    { label: 'IS SHE ACTUALLY FINE?', value: data.probabilityMatrix.isActuallyFine },
  ].sort((a, b) => b.value - a.value).slice(0, 2);

  const verdictColor = getVerdictCSSColor(verdictLevel);

  dom.shareCard.innerHTML = `
    <div class="share-card__header">
      <div class="share-card__lab">THE RELATIONSHIP FORENSICS LAB</div>
      <div class="share-card__case-meta">
        <span>Case #${data.caseNumber}</span>
        <span>${dateStr}</span>
      </div>
    </div>

    <div class="share-card__verdict-area">
      <div class="share-card__badge" style="border-color: ${verdictColor}; transform: rotate(-1.5deg);">
        <div class="share-card__badge-level" style="color: ${verdictColor};">LEVEL ${verdictLevel}</div>
        <div class="share-card__badge-name" style="color: ${verdictColor};">${escapeHtml(data.verdictName)}</div>
      </div>
      <div class="share-card__verdict-name" style="color: ${verdictColor};">${escapeHtml(data.verdictName)}</div>
    </div>

    <div class="share-card__quote-area">
      <p class="share-card__quote">"${escapeHtml(data.quotableFinding)}"</p>
    </div>

    <div class="share-card__mini-matrix">
      ${matrix.map(m => `
        <div class="share-card__matrix-row">
          <span class="share-card__matrix-pct" style="color: ${getBarColor(m.value)};">${m.value}%</span>
          <div class="share-card__matrix-bar">
            <div class="share-card__matrix-fill" style="width: ${m.value}%; background-color: ${getBarColor(m.value)};"></div>
          </div>
          <span class="share-card__matrix-label">${m.label}</span>
        </div>
      `).join('')}
    </div>

    <div class="share-card__footer">
      <span class="share-card__tagline">Submit your evidence.</span>
      <span class="share-card__url">IsSheMadAtMe.com</span>
    </div>
  `;
}

function getVerdictCSSColor(level) {
  const colors = {
    1: '#2A5C3F',
    2: '#5B6E2A',
    3: '#C07600',
    4: '#CC2200',
    5: '#1A1A1A',
  };
  return colors[level] || '#1A1A1A';
}

async function generateShareImage() {
  console.log("[DEBUG] generateShareImage() was called!");
  if (!state.reportData) return null;

  buildShareCard(state.reportData);

  // Dynamic import of html-to-image (loaded only when needed)
  try {
    const { toPng } = await import('html-to-image');
    const dataUrl = await toPng(dom.shareCard, {
      width: 1080,
      height: 1350,
      pixelRatio: 2,
      backgroundColor: '#FDFAF4',
    });
    return dataUrl;
  } catch (err) {
    console.error('Share card generation failed:', err);
    return null;
  }
}

async function shareReport() {
  const imageUrl = await generateShareImage();
  if (!imageUrl) return;

  const shareTexts = [
    `I submitted my texts to forensic analysis. They returned a verdict of ${state.reportData.verdictName}. I'm processing this.`,
    `The Relationship Forensics Lab just told me: "${state.reportData.quotableFinding}" IsSheMadAtMe.com`,
    `IsSheMadAtMe.com is going to tell you things. You might not be ready.`,
    `My case file is attached. Yours is waiting at IsSheMadAtMe.com.`,
  ];
  const shareText = shareTexts[Math.floor(Math.random() * shareTexts.length)];

  // Try native share first (mobile)
  if (navigator.share && navigator.canShare) {
    try {
      const blob = await (await fetch(imageUrl)).blob();
      const file = new File([blob], `isshemadatme-case-${state.caseNumber}.png`, { type: 'image/png' });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: shareText,
          files: [file],
        });
        return;
      }
    } catch (err) {
      // User cancelled or share failed — fall through to download
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
      }
    }
  }

  // Fallback: download image
  downloadImage(imageUrl);
}

function downloadImage(dataUrl) {
  const link = document.createElement('a');
  link.download = `isshemadatme-case-${state.caseNumber || '000000'}.png`;
  link.href = dataUrl;
  link.click();
}


// ─── Utilities ─────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, Math.max(0, ms)));
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function setRandomPlaceholder() {
  const placeholder = CONTEXT_PLACEHOLDERS[Math.floor(Math.random() * CONTEXT_PLACEHOLDERS.length)];
  dom.contextInput.setAttribute('placeholder', placeholder);
}

function startPlaceholderRotation() {
  let idx = Math.floor(Math.random() * CONTEXT_PLACEHOLDERS.length);
  setInterval(() => {
    idx = (idx + 1) % CONTEXT_PLACEHOLDERS.length;
    dom.contextInput.setAttribute('placeholder', CONTEXT_PLACEHOLDERS[idx]);
  }, 4000);
}

function startWarningRotation() {
  if (!dom.warningTicker) return;
  let idx = 0;
  dom.warningTicker.textContent = WARNING_TICKER_TEXTS[idx];
  
  setInterval(() => {
    // Fade out
    dom.warningTicker.style.opacity = '0';
    
    setTimeout(() => {
      idx = (idx + 1) % WARNING_TICKER_TEXTS.length;
      dom.warningTicker.textContent = WARNING_TICKER_TEXTS[idx];
      // Fade in
      dom.warningTicker.style.opacity = '1';
    }, 300); // Wait for fade out transition (0.3s) before changing text and fading in
  }, 5000); // Rotate every 5 seconds
}

function startUploadZoneRotation() {
  if (!dom.uploadZoneLabel) return;
  let idx = 0;
  dom.uploadZoneLabel.textContent = UPLOAD_ZONE_TEXTS[idx];

  setInterval(() => {
    // Fade out
    dom.uploadZoneLabel.style.transition = 'opacity 0.3s ease';
    dom.uploadZoneLabel.style.opacity = '0';
    
    setTimeout(() => {
      idx = (idx + 1) % UPLOAD_ZONE_TEXTS.length;
      dom.uploadZoneLabel.textContent = UPLOAD_ZONE_TEXTS[idx];
      // Fade in
      dom.uploadZoneLabel.style.opacity = '1';
    }, 300);
  }, 7000); // Rotate every 7 seconds
}


// ─── Event Listeners ───────────────────────────────────────────
function initEventListeners() {
  // Nav CTA scrolls to upload
  dom.navCta.addEventListener('click', () => {
    if (state.view !== 'landing') {
      resetUpload();
      setView('landing');
    }
    dom.uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Footer case link
  dom.footerCaseLink.addEventListener('click', (e) => {
    e.preventDefault();
    dom.uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  // Submit evidence
  dom.submitBtn.addEventListener('click', submitEvidence);

  // Share buttons
  dom.shareBtnPrimary.addEventListener('click', shareReport);
  dom.shareBtnSecondary.addEventListener('click', shareReport);

  // Run another case
  dom.runAnotherBtn.addEventListener('click', () => {
    resetUpload();
    setView('landing');
    // Small delay then scroll to upload
    setTimeout(() => {
      dom.uploadZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  });
}


// ─── Initialize ────────────────────────────────────────────────
function init() {
  setView('landing');
  setRandomPlaceholder();
  startPlaceholderRotation();
  startWarningRotation();
  startUploadZoneRotation();
  initUploadZone();
  initEventListeners();
}

// Boot
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
