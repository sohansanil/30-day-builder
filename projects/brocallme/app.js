const DEFAULT_CHARACTERS = [
    { id: 'mummy', name: 'Mummy', role: 'Indian Mom', emoji: '👩', imageUrl: 'assets/mummy.png', trust: 50, disappointment: 80, accepted: 0, ignored: 0, voiceMatch: 'female', pitch: 1.5, rate: 1.2 },
    { id: 'aryan', name: 'Aryan', role: 'Gym Bro', emoji: '💪', imageUrl: 'assets/aryan.png', trust: 90, disappointment: 10, accepted: 0, ignored: 0, voiceMatch: 'male', pitch: 0.8, rate: 1.1 },
    { id: 'utkarsh', name: 'Utkarsh', role: 'Classmate', emoji: '🎓', imageUrl: 'assets/utkarsh.png', trust: 70, disappointment: 20, accepted: 0, ignored: 0, voiceMatch: 'male', pitch: 1.2, rate: 1.3 },
    { id: 'future_you', name: 'Future You', role: 'Future Self', emoji: '👴', imageUrl: 'assets/future_you.png', trust: 40, disappointment: 100, accepted: 0, ignored: 0, voiceMatch: 'male', pitch: 0.6, rate: 0.8 },
    { id: 'team_lead', name: 'Team Lead', role: 'Manager', emoji: '🕴️', imageUrl: 'assets/team_lead.png', trust: 60, disappointment: 60, accepted: 0, ignored: 0, voiceMatch: 'female', pitch: 1.0, rate: 1.0 },
    { id: 'sharma_sir', name: 'Sharma Sir', role: 'Professor', emoji: '👨‍🏫', imageUrl: 'assets/sharma_sir.png', trust: 30, disappointment: 90, accepted: 0, ignored: 0, voiceMatch: 'male', pitch: 0.9, rate: 0.9 }
];

const state = {
    characters: [],
    globalStats: { accepted: 0, ignored: 0 }
};

function loadState() {
    const saved = localStorage.getItem('brocallme_state_v3');
    if (saved) {
        const parsed = JSON.parse(saved);
        state.characters = parsed.characters;
        state.globalStats = parsed.globalStats || { accepted: 0, ignored: 0 };
    } else {
        state.characters = JSON.parse(JSON.stringify(DEFAULT_CHARACTERS));
        saveState();
    }
}

function saveState() {
    localStorage.setItem('brocallme_state_v3', JSON.stringify(state));
}

function getCharacter(id) {
    return state.characters.find(c => c.id === id);
}

function getCharacterMood(c) {
    if (c.disappointment > 80) return { text: 'Furious 😡', color: 'var(--red)', ringClass: 'ring-red' };
    if (c.disappointment > 50) return { text: 'Disappointed 😔', color: 'var(--orange)', ringClass: 'ring-orange' };
    if (c.disappointment > 20) return { text: 'Concerned 😐', color: 'var(--yellow)', ringClass: 'ring-yellow' };
    return { text: 'Supportive 😊', color: 'var(--green)', ringClass: 'ring-green' };
}

// --- Audio / TTS Engine ---
let activeUtterance = null;
let ringingAudio = null;

function playRingtone() {
    stopRingtone();
    if(navigator.vibrate) navigator.vibrate([1000, 1000, 1000, 1000, 1000, 1000, 1000, 1000]);
    
    ringingAudio = new Audio('audio/ringtone.ogg');
    ringingAudio.loop = true;
    ringingAudio.play().catch(e => console.log("Audio play blocked.", e));
}

function stopRingtone() {
    if (navigator.vibrate) navigator.vibrate(0);
    if (ringingAudio) {
        ringingAudio.pause();
        ringingAudio.currentTime = 0;
        ringingAudio = null;
    }
}

function getVoice(genderHint) {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;
    let voice = voices.find(v => v.lang.includes('en-IN') && (genderHint === 'female' ? v.name.includes('Female') : v.name.includes('Male')));
    if(!voice) voice = voices.find(v => v.lang.includes('en-IN'));
    if(!voice) voice = voices.find(v => v.lang.includes('en-US') || v.lang.includes('en-GB'));
    return voice || voices[0];
}

function generateDialogue(character, task, escalationLevel, isEmergency) {
    if (isEmergency) {
        if (character.id === 'mummy') return "Phone kyu chala raha hai?! Ankhein kharab karni hai kya?";
        if (character.id === 'aryan') return "Brother! Put the phone down and do " + (task || "pushups") + "!";
        return "What are you doing? Stop and do " + (task || "your work") + " immediately.";
    }

    if (escalationLevel === 0) {
        switch(character.id) {
            case 'mummy': return `Subah ke 11 baj gaye hain. Abhi tak ${task || 'so raha'} hai?`;
            case 'aryan': return `Brother. I have reached the gym. Where are you?`;
            case 'utkarsh': return `Bhai. Professor is asking for your attendance.`;
            case 'future_you': return `We are calling from the future. Start studying.`;
            case 'team_lead': return `Just circling back on ${task || 'the task'}. It's been hours.`;
            case 'sharma_sir': return `Are you aware of the deadline? Unacceptable.`;
            default: return `Hey, checking in on ${task || 'your task'}.`;
        }
    } else if (escalationLevel === 1) {
        switch(character.id) {
            case 'mummy': return "Phone kyun kaata? Sone ke liye paida kiya tha?";
            case 'aryan': return "Did you just decline my call? Gains wait for NO ONE.";
            case 'utkarsh': return "BHAI. Professor is looking at your empty seat.";
            case 'future_you': return "Ignoring me is ignoring yourself.";
            case 'team_lead': return "Declining calls? Let's discuss this in our 1-on-1.";
            case 'sharma_sir': return "This level of disrespect is unacceptable.";
            default: return "Why did you decline my call?";
        }
    } else {
        return "I'm extremely disappointed.";
    }
}

function speakDialogue(text, character) {
    if (activeUtterance) window.speechSynthesis.cancel();
    
    activeUtterance = new SpeechSynthesisUtterance(text);
    activeUtterance.voice = getVoice(character.voiceMatch);
    activeUtterance.pitch = character.pitch;
    activeUtterance.rate = character.rate;
    window.speechSynthesis.speak(activeUtterance);
    
    const bars = document.querySelectorAll('.waveform .bar');
    activeUtterance.onstart = () => bars.forEach(b => b.style.animationPlayState = 'running');
    activeUtterance.onend = () => bars.forEach(b => b.style.animationPlayState = 'paused');
}

// --- Routing & UI ---
const appEl = document.getElementById('app');
let currentPersonId = null;

function renderTemplate(templateId) {
    const template = document.getElementById(templateId);
    appEl.innerHTML = '';
    appEl.appendChild(template.content.cloneNode(true));
}

function navigate(route, params = {}) {
    if (route === 'dashboard') {
        renderTemplate('dashboard-view');
        initDashboard();
    } else if (route === 'person_detail') {
        currentPersonId = params.id;
        renderTemplate('person-detail-view');
        initPersonDetail();
    } else if (route === 'incoming_call') {
        renderTemplate('incoming-call-view');
        initIncomingCall(params.character, params.task, params.escalationLevel, params.isEmergency);
    } else if (route === 'active_call') {
        renderTemplate('active-call-view');
        initActiveCall(params.character, params.task, params.escalationLevel, params.isEmergency);
    } else if (route === 'annual_report') {
        renderTemplate('annual-report-view');
        initAnnualReport();
    } else if (route === 'add_person') {
        renderTemplate('add-person-view');
        initAddPerson();
    }
}

// --- Dashboard Logic ---
function initDashboard() {
    const feedEl = document.getElementById('feed-container');
    
    // Sort by disappointment to show highest first
    const sortedChars = [...state.characters].sort((a,b) => b.disappointment - a.disappointment);
    
    sortedChars.forEach(c => {
        const mood = getCharacterMood(c);
        const card = document.createElement('div');
        card.className = 'feed-card';
        card.onclick = () => navigate('person_detail', { id: c.id });
        
        let avatarHTML = c.imageUrl 
            ? `<img src="${c.imageUrl}" class="portrait-md ${mood.ringClass}">` 
            : `<div class="portrait-md avatar-fallback ${mood.ringClass}" style="font-size: 30px;">${c.emoji}</div>`;

        card.innerHTML = `
            <div class="feed-header">
                <div style="display: flex; gap: 12px; align-items: center;">
                    ${avatarHTML}
                    <div>
                        <h3 style="font-size: 18px;">${c.name}</h3>
                        <span class="mood-tag" style="color: ${mood.color}; border: 1px solid ${mood.color}; padding: 4px 8px; font-size: 11px; margin-top: 4px;">${mood.text}</span>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 24px; font-weight: 800; color: ${mood.color}">${c.disappointment}%</div>
                    <div style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">Disappointment</div>
                </div>
            </div>
            <div style="font-style: italic; color: var(--text-secondary); padding: 12px; background: rgba(0,0,0,0.3); border-radius: 12px; border: 1px solid rgba(255,255,255,0.02);">
                "${generateDialogue(c, '', 0, false)}"
            </div>
        `;
        feedEl.appendChild(card);
    });

    document.getElementById('dash-panic-btn').onclick = () => {
        navigate('incoming_call', { character: sortedChars[0], task: 'Wake up!', escalationLevel: 0, isEmergency: true });
    };
}

// --- Person Detail Logic ---
function initPersonDetail() {
    const char = getCharacter(currentPersonId);
    if(!char) return navigate('dashboard');

    const mood = getCharacterMood(char);
    
    if (char.imageUrl) {
        document.getElementById('detail-img').src = char.imageUrl;
        document.getElementById('detail-img').className = `portrait-lg ${mood.ringClass}`;
    } else {
        document.getElementById('detail-img').style.display = 'none';
        const fallback = document.getElementById('detail-fallback');
        fallback.style.display = 'flex';
        fallback.textContent = char.emoji;
        fallback.className = `avatar-fallback portrait-lg ${mood.ringClass}`;
    }

    document.getElementById('detail-name').textContent = char.name;
    document.getElementById('detail-role').textContent = char.role;
    
    const tag = document.getElementById('detail-mood-tag');
    tag.textContent = mood.text;
    tag.className = `mood-tag`;
    tag.style.color = mood.color;
    tag.style.border = `1px solid ${mood.color}`;
    
    document.getElementById('detail-trust-pct').textContent = char.trust + '%';
    document.getElementById('detail-trust-bar').style.width = char.trust + '%';
    
    document.getElementById('detail-disapp-pct').textContent = char.disappointment + '%';
    document.getElementById('detail-disapp-bar').style.width = char.disappointment + '%';
    
    document.getElementById('detail-acc').textContent = char.accepted;
    document.getElementById('detail-ign').textContent = char.ignored;

    let selectedDelay = 60;
    const presetBtns = document.querySelectorAll('.time-pills .pill');
    presetBtns.forEach(btn => {
        btn.onclick = (e) => {
            presetBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedDelay = e.target.dataset.time === 'custom' ? 120 : parseInt(e.target.dataset.time);
        };
    });

    document.getElementById('schedule-btn').onclick = () => {
        const task = document.getElementById('call-task').value;
        showToast(`Scheduled! ${char.name} will call you in ${selectedDelay} seconds.`);
        window.speechSynthesis.getVoices(); 

        setTimeout(() => {
            navigate('incoming_call', { character: char, task: task, escalationLevel: 0, isEmergency: false });
        }, selectedDelay * 1000);
        navigate('dashboard');
    };

    document.getElementById('detail-panic-btn').onclick = () => {
        const task = document.getElementById('call-task').value || 'scrolling';
        navigate('incoming_call', { character: char, task: task, escalationLevel: 0, isEmergency: true });
    };
}

// --- Call Screens Logic ---
let activeTimerInterval = null;

function setupAvatar(char, imgId, fallbackId, bgId, mood, applyBlur = false) {
    if (char.imageUrl) {
        document.getElementById(imgId).src = char.imageUrl;
        document.getElementById(imgId).classList.add(mood.ringClass);
        if (applyBlur && document.getElementById(bgId)) document.getElementById(bgId).style.backgroundImage = `url(${char.imageUrl})`;
    } else {
        document.getElementById(imgId).style.display = 'none';
        const fb = document.getElementById(fallbackId);
        fb.style.display = 'flex';
        fb.textContent = char.emoji;
        fb.classList.add(mood.ringClass);
    }
}

function initIncomingCall(character, task, escalationLevel, isEmergency) {
    const mood = getCharacterMood(character);
    document.getElementById('incoming-name').textContent = character.name.toUpperCase();
    
    setupAvatar(character, 'incoming-img', 'incoming-fallback', 'incoming-bg', mood, true);

    const subTitle = isEmergency ? '🚨 EMERGENCY CALL 🚨' : (escalationLevel > 0 ? 'Calling again...' : 'INCOMING CALL');
    document.getElementById('incoming-subtitle').textContent = subTitle;
    
    const tag = document.getElementById('incoming-mood-tag');
    tag.textContent = `Current Mood: ${mood.text.toUpperCase()}`;
    tag.className = 'mood-tag';
    tag.style.color = mood.color;
    tag.style.border = `1px solid ${mood.color}`;

    if (escalationLevel > 0 && !isEmergency) {
        const alertBox = document.getElementById('escalation-alert');
        alertBox.classList.remove('hidden');
        document.getElementById('esc-level').textContent = escalationLevel + 1;
        document.getElementById('esc-text').textContent = generateDialogue(character, task, escalationLevel, false);
        alertBox.style.borderColor = mood.color;
    }

    playRingtone();

    const missTimer = setTimeout(() => {
        stopRingtone();
        handleDecline(character, task, escalationLevel, isEmergency);
    }, 15000);

    document.getElementById('accept-btn').onclick = () => {
        clearTimeout(missTimer);
        stopRingtone();
        
        character.accepted++;
        character.trust = Math.min(100, character.trust + 10);
        character.disappointment = Math.max(0, character.disappointment - 15);
        state.globalStats.accepted++;
        saveState();

        navigate('active_call', { character, task, escalationLevel, isEmergency });
    };

    document.getElementById('decline-btn').onclick = () => {
        clearTimeout(missTimer);
        stopRingtone();
        handleDecline(character, task, escalationLevel, isEmergency);
    };
}

function handleDecline(character, task, escalationLevel, isEmergency) {
    character.ignored++;
    character.trust = Math.max(0, character.trust - 15);
    character.disappointment = Math.min(100, character.disappointment + 25);
    state.globalStats.ignored++;
    saveState();

    navigate('dashboard');
    
    if (escalationLevel < 2 && !isEmergency) {
        setTimeout(() => {
            navigate('incoming_call', { character, task, escalationLevel: escalationLevel + 1, isEmergency: false });
        }, 20000);
    }
}

function initActiveCall(character, task, escalationLevel, isEmergency) {
    const mood = getCharacterMood(character);
    document.getElementById('active-name').textContent = character.name.toUpperCase();
    
    setupAvatar(character, 'active-img', 'active-fallback', 'active-bg', mood, true);

    const tag = document.getElementById('active-mood-tag');
    tag.textContent = mood.text;
    tag.className = 'mood-tag';
    tag.style.color = mood.color;
    tag.style.border = `1px solid ${mood.color}`;
    
    let seconds = 0;
    const timerEl = document.getElementById('active-timer');
    activeTimerInterval = setInterval(() => {
        seconds++;
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
    }, 1000);

    const text = generateDialogue(character, task, escalationLevel, isEmergency);
    document.getElementById('active-dialogue').textContent = `"${text}"`;
    
    document.querySelectorAll('.waveform .bar').forEach(b => b.style.animationPlayState = 'paused');
    setTimeout(() => { speakDialogue(text, character); }, 1000);

    document.getElementById('end-call-btn').onclick = () => {
        clearInterval(activeTimerInterval);
        window.speechSynthesis.cancel();
        navigate('dashboard');
    };

    document.getElementById('speaker-btn').onclick = (e) => e.currentTarget.classList.toggle('active-toggle');
    document.getElementById('mute-btn').onclick = (e) => e.currentTarget.classList.toggle('active-toggle');
}

// --- Annual Report ---
function initAnnualReport() {
    document.getElementById('report-year').textContent = new Date().getFullYear();
    
    const total = state.globalStats.accepted + state.globalStats.ignored;
    document.getElementById('report-acc').textContent = state.globalStats.accepted;
    document.getElementById('report-ign').textContent = state.globalStats.ignored;
    
    let trajectory = "Stable";
    let tColor = "var(--text-secondary)";
    const pctIgnored = total > 0 ? (state.globalStats.ignored / total) : 0;
    
    if (pctIgnored > 0.6) { trajectory = "Concerning 💀"; tColor = "var(--red)"; }
    else if (pctIgnored > 0.3) { trajectory = "Slipping 📉"; tColor = "var(--orange)"; }
    else if (total > 0) { trajectory = "Locked In 📈"; tColor = "var(--green)"; }
    
    const trajEl = document.getElementById('report-trajectory');
    trajEl.textContent = trajectory;
    trajEl.style.color = tColor;

    const listEl = document.getElementById('health-list');
    const sorted = [...state.characters].sort((a, b) => b.disappointment - a.disappointment);
    
    sorted.forEach(c => {
        const mood = getCharacterMood(c);
        const div = document.createElement('div');
        div.className = 'health-row';
        
        let avatarHTML = c.imageUrl ? `<img src="${c.imageUrl}" class="portrait-sm">` : `<div class="portrait-sm avatar-fallback" style="font-size:20px;">${c.emoji}</div>`;
        
        div.innerHTML = `
            ${avatarHTML}
            <div class="name">${c.name}</div>
            <div class="status" style="color: ${mood.color}">${c.disappointment}%</div>
        `;
        listEl.appendChild(div);
    });
}

function initAddPerson() {
    let selectedVoice = 'male';
    const voiceBtns = document.querySelectorAll('.time-pills .pill');
    voiceBtns.forEach(btn => {
        btn.onclick = (e) => {
            voiceBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            selectedVoice = e.target.dataset.voice;
        };
    });

    document.getElementById('save-person-btn').onclick = () => {
        const name = document.getElementById('add-name').value.trim();
        const role = document.getElementById('add-role').value.trim();
        const emoji = document.getElementById('add-emoji').value.trim() || '👤';

        if (!name) return showToast('Please enter a name');

        const newChar = {
            id: name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
            name, role: role || 'Friend', emoji, imageUrl: null,
            trust: 50, disappointment: 0, accepted: 0, ignored: 0,
            voiceMatch: selectedVoice, pitch: selectedVoice === 'female' ? 1.2 : 0.9, rate: 1.0
        };

        state.characters.push(newChar);
        saveState();
        showToast(name + ' added!');
        navigate('dashboard');
    };
}

// --- Sidebar & Settings ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar || !overlay) return;
    
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        overlay.classList.add('hidden');
    } else {
        sidebar.classList.add('open');
        overlay.classList.remove('hidden');
    }
}

function resetStats() {
    if (confirm("Are you sure you want to erase all your mistakes? This cannot be undone.")) {
        localStorage.removeItem('brocallme_state_v3');
        loadState(); // This re-initializes with DEFAULT_CHARACTERS
        showToast("Your slate has been wiped clean.");
        navigate('dashboard');
    }
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

window.speechSynthesis.onvoiceschanged = () => {};
loadState();
navigate('dashboard');
window.app = { navigate, showToast, toggleSidebar, resetStats };
