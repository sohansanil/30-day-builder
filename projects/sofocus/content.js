let overlayContainer = null;
let shadowRoot = null;
let isVisible = false;
let videoElement = null;
let wasPlaying = false;
let sessionInsights = 0;

// Format seconds into MM:SS or HH:MM:SS
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Get video ID from URL
function getVideoId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('v');
}

// Create and inject the overlay
function createOverlay() {
  if (overlayContainer) return;

  overlayContainer = document.createElement('div');
  // We attach a shadow root so our CSS doesn't leak out and YouTube's CSS doesn't leak in
  shadowRoot = overlayContainer.attachShadow({ mode: 'open' });

  // Fetch the injected CSS file URL to link inside the shadow DOM
  const cssUrl = chrome.runtime.getURL('content.css');

  shadowRoot.innerHTML = `
    <link rel="stylesheet" href="${cssUrl}">
    <div id="sofocus-session-badge" class="sofocus-session-badge">
      <span id="badge-text"></span>
      <button id="end-session-btn" class="end-session-btn">Finish</button>
    </div>
    <div id="sofocus-overlay">
      <div class="sofocus-container" id="main-ui">
        <div class="sofocus-header">
          <h2 class="sofocus-title">
            <span>💡</span> Capture Insight
          </h2>
          <div class="sofocus-timestamp" id="timestamp-display">0:00</div>
        </div>
        <div class="sofocus-input-wrapper">
          <input type="text" class="sofocus-input" id="insight-input" placeholder="What did you just learn?" autocomplete="off" />
        </div>
        <div class="sofocus-footer">
          <span class="sofocus-hint">Press <span class="sofocus-key">Enter</span> to save</span>
          <span class="sofocus-hint">Press <span class="sofocus-key">Esc</span> to cancel</span>
        </div>
      </div>
      <div class="sofocus-success-state" id="success-ui">
        💡 Knowledge Locked In
      </div>
    </div>
    <div id="sofocus-session-summary" class="sofocus-session-summary">
      <div class="summary-container">
        <h2>Today's Learning</h2>
        <div class="summary-stats">
          <div class="summary-stat">📚 <span id="summary-video-title"></span></div>
          <div class="summary-stat">💡 <span id="summary-insight-count">0</span> insights</div>
        </div>
        <div class="summary-top-insight">
          <div class="top-insight-label">Top Insight:</div>
          <div class="top-insight-text" id="summary-top-insight-text"></div>
        </div>
        <button id="close-summary-btn" class="close-summary-btn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlayContainer);

  // Setup Event Listeners
  const input = shadowRoot.getElementById('insight-input');
  const overlay = shadowRoot.getElementById('sofocus-overlay');
  const endSessionBtn = shadowRoot.getElementById('end-session-btn');
  const sessionSummary = shadowRoot.getElementById('sofocus-session-summary');
  const closeSummaryBtn = shadowRoot.getElementById('close-summary-btn');
  const badge = shadowRoot.getElementById('sofocus-session-badge');

  endSessionBtn.addEventListener('click', async (e) => {
    e.stopPropagation();
    badge.classList.remove('visible');
    
    const videoId = getVideoId();
    const data = await chrome.storage.local.get('sofocus_data');
    const library = data.sofocus_data || {};
    const video = library[videoId];
    
    let topText = '';
    const titleElement = document.querySelector('h1.ytd-watch-metadata') || document.querySelector('title');
    const videoTitle = titleElement ? titleElement.textContent.trim().replace(' - YouTube', '') : 'Unknown Video';
    
    if (video && video.insights && video.insights.length > 0) {
      topText = video.insights[video.insights.length - 1].text;
    }
    
    shadowRoot.getElementById('summary-video-title').textContent = videoTitle;
    shadowRoot.getElementById('summary-insight-count').textContent = sessionInsights;
    shadowRoot.getElementById('summary-top-insight-text').textContent = `"${topText}"`;
    
    sessionSummary.classList.add('visible');
  });

  closeSummaryBtn.addEventListener('click', () => {
    sessionSummary.classList.remove('visible');
    sessionInsights = 0; // Reset for next session
  });

  input.addEventListener('keydown', async (e) => {
    e.stopPropagation(); // Stop YouTube from seeing the keypress

    if (e.key === 'Enter' && input.value.trim() !== '') {
      e.preventDefault();
      await saveInsight(input.value.trim());
    } else if (e.key === 'Escape') {
      e.preventDefault();
      closeOverlay();
    }
  });

  // Also stop propagation for keyup and keypress
  input.addEventListener('keyup', (e) => e.stopPropagation());
  input.addEventListener('keypress', (e) => e.stopPropagation());

  // Close on click outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeOverlay();
    }
  });
}

function openOverlay() {
  console.log("SoFocus: openOverlay called");
  if (!overlayContainer) {
    console.log("SoFocus: Creating overlay container");
    createOverlay();
  }
  
  videoElement = document.querySelector('video');
  if (!videoElement) {
    console.warn("SoFocus: No <video> element found on page!");
    return;
  }
  console.log("SoFocus: Video element found", videoElement);

  // Pause video and remember state
  wasPlaying = !videoElement.paused;
  if (wasPlaying) {
    videoElement.pause();
  }

  const currentTime = Math.floor(videoElement.currentTime);
  shadowRoot.getElementById('timestamp-display').textContent = formatTime(currentTime);
  
  const overlay = shadowRoot.getElementById('sofocus-overlay');
  const input = shadowRoot.getElementById('insight-input');
  const mainUi = shadowRoot.getElementById('main-ui');
  const successUi = shadowRoot.getElementById('success-ui');

  // Reset UI
  input.value = '';
  mainUi.style.display = 'flex';
  successUi.classList.remove('active');
  
  overlay.classList.add('visible');
  isVisible = true;

  // Focus input slightly after transition
  setTimeout(() => input.focus(), 50);
}

function closeOverlay() {
  if (!isVisible) return;
  
  const overlay = shadowRoot.getElementById('sofocus-overlay');
  overlay.classList.remove('visible');
  isVisible = false;

  // Resume video if it was playing
  if (videoElement && wasPlaying) {
    videoElement.play();
  }
}

async function saveInsight(text) {
  const videoId = getVideoId();
  if (!videoId || !videoElement) return;

  const titleElement = document.querySelector('h1.ytd-watch-metadata') || document.querySelector('title');
  const videoTitle = titleElement ? titleElement.textContent.trim().replace(' - YouTube', '') : 'Unknown Video';
  const timestamp = Math.floor(videoElement.currentTime);
  const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const newInsight = {
    id: Date.now().toString(),
    text,
    timestamp,
    createdAt: Date.now()
  };

  try {
    // Read existing data
    const data = await chrome.storage.local.get('sofocus_data');
    const library = data.sofocus_data || {};

    // Initialize video entry if it doesn't exist
    if (!library[videoId]) {
      library[videoId] = {
        title: videoTitle,
        thumbnail: thumbnail,
        insights: []
      };
    }

    // Add new insight and sort by timestamp
    library[videoId].insights.push(newInsight);
    library[videoId].insights.sort((a, b) => a.timestamp - b.timestamp);

    // Save back to storage
    await chrome.storage.local.set({ sofocus_data: library });

    // Show success animation
    const mainUi = shadowRoot.getElementById('main-ui');
    const successUi = shadowRoot.getElementById('success-ui');
    
    mainUi.style.display = 'none';
    successUi.classList.add('active');

    // Update Session Badge
    sessionInsights++;
    const badge = shadowRoot.getElementById('sofocus-session-badge');
    const badgeText = shadowRoot.getElementById('badge-text');
    if (badge && badgeText) {
      badgeText.textContent = `💡 ${sessionInsights} Insight${sessionInsights === 1 ? '' : 's'} Captured`;
      badge.classList.add('visible');
    }

    // Close after delay
    setTimeout(() => {
      closeOverlay();
    }, 1000);

  } catch (err) {
    console.error("Failed to save insight:", err);
  }
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("SoFocus: Received message", message);
  if (message.action === 'TOGGLE_CAPTURE_OVERLAY') {
    if (isVisible) {
      closeOverlay();
    } else {
      openOverlay();
    }
  }
});
