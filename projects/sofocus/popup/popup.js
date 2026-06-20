// popup.js

document.addEventListener('DOMContentLoaded', async () => {
  await checkShortcuts();
  await loadLibrary();
  setupEventListeners();
});

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

async function checkShortcuts() {
  const commands = await chrome.commands.getAll();
  const captureCommand = commands.find(c => c.name === 'capture-insight');
  
  if (captureCommand && !captureCommand.shortcut) {
    document.getElementById('shortcut-banner').style.display = 'block';
  }
}

async function loadLibrary() {
  const data = await chrome.storage.local.get('sofocus_data');
  const library = data.sofocus_data || {};
  
  const videoIds = Object.keys(library);
  const listContainer = document.getElementById('video-list');
  const emptyState = document.getElementById('empty-state');
  const dashboardContainer = document.getElementById('dashboard-container');
  
  if (videoIds.length === 0) {
    emptyState.style.display = 'flex';
    if (dashboardContainer) dashboardContainer.style.display = 'none';
    listContainer.innerHTML = '';
    return;
  }
  
  emptyState.style.display = 'none';
  if (dashboardContainer) dashboardContainer.style.display = 'flex';

  calculateStats(library);
  
  let html = '';
  
  // Sort videos by the most recently captured insight
  videoIds.sort((a, b) => {
    const aLast = library[a].insights.length > 0 ? library[a].insights[library[a].insights.length - 1].createdAt : 0;
    const bLast = library[b].insights.length > 0 ? library[b].insights[library[b].insights.length - 1].createdAt : 0;
    return bLast - aLast;
  });

  for (const videoId of videoIds) {
    const video = library[videoId];
    if (!video.insights || video.insights.length === 0) continue;
    
    // Fallback thumbnail if missing
    const thumb = video.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    
    html += `
      <div class="video-group">
        <a href="https://youtube.com/watch?v=${videoId}" target="_blank" class="video-header">
          <img src="${thumb}" alt="Thumbnail" class="video-thumbnail" loading="lazy">
          <div class="video-meta">
            <h3 class="video-title" title="${video.title.replace(/"/g, '&quot;')}">${video.title}</h3>
            <span class="insight-count">${video.insights.length} Insight${video.insights.length !== 1 ? 's' : ''}</span>
          </div>
        </a>
        <ul class="insight-list">
    `;
    
    for (const insight of video.insights) {
      const timeStr = formatTime(insight.timestamp);
      const url = `https://youtu.be/${videoId}?t=${insight.timestamp}`;
      const isFav = insight.isFavorite ? 'active' : '';
      const favIcon = insight.isFavorite ? '⭐' : '☆';
      html += `
          <li class="insight-item" data-video-id="${videoId}" data-insight-id="${insight.id}">
            <div class="insight-content">
              <a href="${url}" target="_blank" class="insight-timestamp">${timeStr}</a>
              <div class="insight-text">${insight.text}</div>
            </div>
            <div class="insight-actions">
              <button class="action-btn favorite-btn ${isFav}" title="Toggle Favorite">${favIcon}</button>
              <button class="action-btn delete-btn" title="Delete Insight">🗑</button>
            </div>
          </li>
      `;
    }
    
    html += `
        </ul>
      </div>
    `;
  }
  
  listContainer.innerHTML = html;
  
  // Find Today's Key Insight
  let keyInsight = null;
  let keyInsightVideoTitle = '';
  for (const videoId of videoIds) {
    for (const insight of library[videoId].insights) {
      if (insight.isFavorite) {
        if (!keyInsight || insight.createdAt > keyInsight.createdAt) {
          keyInsight = insight;
          keyInsightVideoTitle = library[videoId].title;
        }
      }
    }
  }

  const keyInsightContainer = document.getElementById('key-insight-container');
  const keyInsightContent = document.getElementById('key-insight-content');
  if (keyInsight) {
    keyInsightContainer.style.display = 'block';
    keyInsightContent.innerHTML = `"${keyInsight.text}" <br><span style="font-size: 12px; color: #aaa; margin-top: 4px; display: block;">— from ${keyInsightVideoTitle}</span>`;
  } else {
    keyInsightContainer.style.display = 'none';
  }

  // Attach event listeners for delete and favorite
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const item = e.target.closest('.insight-item');
      const vId = item.dataset.videoId;
      const iId = item.dataset.insightId;
      await deleteInsight(vId, iId);
    });
  });

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const item = e.target.closest('.insight-item');
      const vId = item.dataset.videoId;
      const iId = item.dataset.insightId;
      await toggleFavorite(vId, iId);
    });
  });
}

async function deleteInsight(videoId, insightId) {
  const data = await chrome.storage.local.get('sofocus_data');
  const library = data.sofocus_data || {};
  if (library[videoId] && library[videoId].insights) {
    library[videoId].insights = library[videoId].insights.filter(i => i.id !== insightId);
    if (library[videoId].insights.length === 0) {
      delete library[videoId];
    }
    await chrome.storage.local.set({ sofocus_data: library });
    await loadLibrary();
  }
}

async function toggleFavorite(videoId, insightId) {
  const data = await chrome.storage.local.get('sofocus_data');
  const library = data.sofocus_data || {};
  if (library[videoId] && library[videoId].insights) {
    const insight = library[videoId].insights.find(i => i.id === insightId);
    if (insight) {
      insight.isFavorite = !insight.isFavorite;
      await chrome.storage.local.set({ sofocus_data: library });
      await loadLibrary();
    }
  }
}

function setupEventListeners() {
  document.getElementById('settings-link').addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  document.getElementById('export-btn').addEventListener('click', async () => {
    await exportToMarkdown();
  });
}

async function exportToMarkdown() {
  const data = await chrome.storage.local.get('sofocus_data');
  const library = data.sofocus_data || {};
  const videoIds = Object.keys(library);
  
  if (videoIds.length === 0) return;

  let totalInsights = 0;
  for (const id of videoIds) {
    if (library[id].insights) totalInsights += library[id].insights.length;
  }

  const dateStr = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  let markdown = `# SoFocus Learning Digest\n\n`;
  markdown += `Date: ${dateStr}\n`;
  markdown += `Total Insights: ${totalInsights}\n`;
  markdown += `Videos Learned From: ${videoIds.length}\n\n---\n\n`;
  
  // Sort videos by title
  videoIds.sort((a, b) => library[a].title.localeCompare(library[b].title));

  for (const videoId of videoIds) {
    const video = library[videoId];
    if (!video.insights || video.insights.length === 0) continue;
    
    markdown += `## [${video.title}](https://youtube.com/watch?v=${videoId})\n`;
    markdown += `Insights Captured: ${video.insights.length}\n\n`;
    
    for (const insight of video.insights) {
      const timeStr = formatTime(insight.timestamp);
      markdown += `• At [${timeStr}](https://youtu.be/${videoId}?t=${insight.timestamp}):\n  ${insight.text}\n`;
    }
    markdown += '\n---\n\n';
  }
  
  try {
    await navigator.clipboard.writeText(markdown.trim());
    showToast('Copied to Clipboard!');
  } catch (err) {
    console.error('Failed to copy', err);
    showToast('Failed to copy');
  }
}

function calculateStats(library) {
  const videoIds = Object.keys(library);
  let totalInsights = 0;
  const dates = [];
  const videoListForTopics = [];

  for (const videoId of videoIds) {
    const video = library[videoId];
    if (!video.insights) continue;
    
    totalInsights += video.insights.length;
    
    // Collect dates and latest timestamps for recent topics
    let latestTs = 0;
    for (const insight of video.insights) {
      if (insight.createdAt) {
        if (insight.createdAt > latestTs) latestTs = insight.createdAt;
        const d = new Date(insight.createdAt);
        const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
        dates.push(dateStr);
      }
    }
    
    // Store video metadata for recent topics
    videoListForTopics.push({
      title: video.title,
      latestTs: latestTs
    });
  }

  document.getElementById('total-videos').textContent = videoIds.length;
  document.getElementById('total-insights').textContent = totalInsights;

  // Calculate Streak
  if (dates.length > 0) {
    // Sort unique dates descending
    const uniqueDates = [...new Set(dates)].sort((a, b) => b.localeCompare(a));
    
    let currentStreak = 1;
    let longestStreak = 1;
    let tempStreak = 1;

    // Current Streak (starting from the most recent date)
    const msPerDay = 24 * 60 * 60 * 1000;
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const d1 = new Date(uniqueDates[i]);
      const d2 = new Date(uniqueDates[i+1]);
      const diffDays = Math.round((d1 - d2) / msPerDay);
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Longest Streak
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const d1 = new Date(uniqueDates[i]);
      const d2 = new Date(uniqueDates[i+1]);
      const diffDays = Math.round((d1 - d2) / msPerDay);
      if (diffDays === 1) {
        tempStreak++;
        if (tempStreak > longestStreak) longestStreak = tempStreak;
      } else {
        tempStreak = 1;
      }
    }

    if (currentStreak > longestStreak) longestStreak = currentStreak;

    document.getElementById('current-streak').textContent = currentStreak;
    document.getElementById('longest-streak').textContent = 'Best: ' + longestStreak;
  }

  // Render Heatmap (Last 21 Days)
  const heatmapContainer = document.getElementById('learning-heatmap');
  if (heatmapContainer) {
    heatmapContainer.innerHTML = '';
    
    // Create a map of date string to insight count
    const dateCounts = {};
    for (const d of dates) {
      dateCounts[d] = (dateCounts[d] || 0) + 1;
    }

    const today = new Date();
    today.setHours(0,0,0,0);
    
    // 21 days
    for (let i = 20; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      
      const count = dateCounts[dateStr] || 0;
      const cell = document.createElement('div');
      cell.className = 'heatmap-day';
      if (count > 0 && count <= 2) cell.classList.add('active-1');
      else if (count > 2 && count <= 5) cell.classList.add('active-2');
      else if (count > 5) cell.classList.add('active-3');
      
      cell.title = `${count} insights on ${dateStr}`;
      heatmapContainer.appendChild(cell);
    }
  }

  // Render Recent Topics (using actual video titles)
  const topicContainer = document.getElementById('recent-topics');
  if (topicContainer) {
    topicContainer.innerHTML = '';
    
    // Sort videos by latest captured insight and take top 3
    const recentVideos = videoListForTopics
      .sort((a, b) => b.latestTs - a.latestTs)
      .slice(0, 3);
      
    if (recentVideos.length === 0) {
      const span = document.createElement('span');
      span.className = 'topic-tag';
      span.textContent = '📺 Start Learning';
      topicContainer.appendChild(span);
    } else {
      for (const v of recentVideos) {
        const span = document.createElement('span');
        span.className = 'topic-tag';
        // Truncate title
        let shortTitle = v.title;
        if (shortTitle.length > 28) {
          shortTitle = shortTitle.substring(0, 25) + '...';
        }
        span.textContent = '📺 ' + shortTitle;
        span.title = v.title;
        topicContainer.appendChild(span);
      }
    }
  }
}

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}
