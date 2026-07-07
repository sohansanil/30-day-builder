let audioCtx;
let source;
let biquadFilter;
let analyser;
let isPlaying = false;
let currentAngle = 120;

// UI Elements
const angleDisplay = document.getElementById('angle-display');
const modeBadge = document.getElementById('mode-badge');
const crossfaderCap = document.getElementById('crossfader-cap');
const filterFaderA = document.getElementById('filter-fader-a');
const dialA = document.getElementById('dial-a');
const dialB = document.getElementById('dial-b');
const uploadBtn = document.getElementById('audio-upload');
const statusText = document.getElementById('status');
const ledStrip = document.getElementById('led-strip');

// Canvas
const canvasA = document.getElementById('waveform-canvas-a');
const ctxA = canvasA.getContext('2d');
const canvasB = document.getElementById('waveform-canvas-b');
const ctxB = canvasB.getContext('2d');

// Colors matching CSS
const COLORS = {
    club: '#00ffcc',
    muffle: '#ffcc00',
    underwater: '#0088ff',
    chaos: '#ff0033'
};

// Setup LEDs
function setupLEDs() {
    ledStrip.innerHTML = '';
    for(let i=0; i<30; i++) {
        let led = document.createElement('div');
        led.className = 'led';
        ledStrip.appendChild(led);
    }
}
setupLEDs();

function updateTheme(color, mode) {
    document.documentElement.style.setProperty('--current-accent', color);
    modeBadge.innerText = mode;
    
    if (mode === "ABSOLUTE CHAOS" || mode === "SCRATCHING!") {
        document.body.classList.add('chaos-mode');
    } else {
        document.body.classList.remove('chaos-mode');
    }
    
    if (mode === "SCRATCHING!") {
        modeBadge.classList.add('pulse');
    } else {
        modeBadge.classList.remove('pulse');
    }
}

function updateLEDs(powerPercent) {
    // power is 0 to 100
    const activeCount = Math.floor((powerPercent / 100) * 30);
    const leds = document.querySelectorAll('.led');
    leds.forEach((led, index) => {
        // Since we flex-direction column-reverse, index 0 is bottom
        if (index < activeCount) {
            if (index > 24) {
                led.className = 'led active-red';
            } else if (index > 15) {
                led.className = 'led active-yellow';
            } else {
                led.className = 'led active-green';
            }
        } else {
            led.className = 'led';
        }
    });
}

function drawWaveform() {
    requestAnimationFrame(drawWaveform);
    if (!isPlaying || !analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    ctxA.fillStyle = '#111';
    ctxA.fillRect(0, 0, canvasA.width, canvasA.height);
    ctxB.fillStyle = '#111';
    ctxB.fillRect(0, 0, canvasB.width, canvasB.height);

    ctxA.lineWidth = 2;
    ctxA.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--current-accent').trim();
    ctxA.beginPath();

    const sliceWidth = canvasA.width * 1.0 / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvasA.height / 2;

        if (i === 0) {
            ctxA.moveTo(x, y);
        } else {
            ctxA.lineTo(x, y);
        }
        x += sliceWidth;
    }
    ctxA.lineTo(canvasA.width, canvasA.height / 2);
    ctxA.stroke();

    // Mirror to Deck B for aesthetics
    ctxB.drawImage(canvasA, 0, 0);
}

function setupAudio(file) {
    if (audioCtx) { audioCtx.close(); }
    
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    statusText.innerText = "LOADING AUDIO...";
    
    const reader = new FileReader();
    reader.onload = function(e) {
        audioCtx.decodeAudioData(e.target.result, function(buffer) {
            source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;
            
            biquadFilter = audioCtx.createBiquadFilter();
            biquadFilter.type = "lowpass";
            biquadFilter.frequency.value = 20000;
            biquadFilter.Q.value = 1;
            
            analyser = audioCtx.createAnalyser();
            analyser.fftSize = 2048;
            
            source.connect(biquadFilter);
            biquadFilter.connect(analyser);
            analyser.connect(audioCtx.destination);
            
            source.start(0);
            isPlaying = true;
            statusText.innerText = "PLAYING: " + file.name;
            
            // Start spinning
            dialA.classList.add('spinning');
            dialB.classList.add('spinning');
            
            applyEffects(currentAngle);
            drawWaveform();
        });
    };
    reader.readAsArrayBuffer(file);
}

uploadBtn.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) setupAudio(file);
});

let lastAngle = null;
let lastTime = null;

function applyEffects(angle) {
    let now = Date.now();
    let isScratching = false;
    let da = 0;
    
    if (lastAngle !== null && lastTime !== null) {
        let dt = Math.max(1, now - lastTime);
        da = angle - lastAngle;
        let velocity = Math.abs(da) / dt;
        // Lowered sensitivity threshold from 0.15 to 0.05 (easier to trigger)
        if (velocity > 0.05) {
            isScratching = true;
        }
    }
    
    lastAngle = angle;
    lastTime = now;

    const clampedAngle = Math.max(70, Math.min(110, angle));
    
    let freq = 20000;
    let rate = 1.0;
    
    // UI mapping
    let powerPercent = Math.max(0, Math.min(100, ((110 - clampedAngle) / 40) * 100));
    
    // Crossfader and Filter slider move with angle
    crossfaderCap.style.left = powerPercent + "%";
    filterFaderA.style.bottom = powerPercent + "%";
    updateLEDs(100 - powerPercent); // 100% volume when open (0% power drop)

    // Brightness mapping: Deck A is bright when open, Deck B is bright when closed
    let deckAOpacity = 0.3 + (0.7 * (100 - powerPercent) / 100);
    let deckBOpacity = 0.3 + (0.7 * powerPercent / 100);
    document.getElementById('deck-a').style.opacity = deckAOpacity;
    document.getElementById('deck-b').style.opacity = deckBOpacity;

    if (isScratching) {
        if (da > 0) {
            rate = 2.5; freq = 15000;
        } else {
            rate = 0.3; freq = 2000;
        }
        updateTheme("#ffeb3b", "SCRATCHING!");
    } else if (clampedAngle > 100) {
        let p = (clampedAngle - 100) / 10;
        freq = 20000; rate = 1.0;
        updateTheme(COLORS.club, "FESTIVAL MAIN STAGE");
    } else if (clampedAngle > 90) {
        let p = (clampedAngle - 90) / 10;
        freq = 800 + p * 19200; rate = 0.85 + p * 0.15;
        updateTheme(COLORS.muffle, "UNDERWATER CLUB");
    } else if (clampedAngle > 80) {
        let p = (clampedAngle - 80) / 10;
        freq = 300 + p * 500; rate = 0.70 + p * 0.15;
        updateTheme(COLORS.underwater, "DEEP ABYSS");
    } else {
        let p = (clampedAngle - 70) / 10;
        freq = 50 + p * 250; rate = 0.40 + p * 0.30;
        updateTheme(COLORS.chaos, "DEMONIC REALM");
    }
    
    if (biquadFilter && source) {
        let transitionTime = isScratching ? 0.02 : 0.05;
        biquadFilter.frequency.setTargetAtTime(freq, audioCtx.currentTime, transitionTime);
        source.playbackRate.setTargetAtTime(rate, audioCtx.currentTime, transitionTime);
    }
}

function connectWebSocket() {
    const ws = new WebSocket('ws://127.0.0.1:8765');
    
    ws.onopen = function() {
        modeBadge.innerText = "WAITING FOR TRACK...";
    };
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        const angle = data.angle;
        currentAngle = angle;
        
        angleDisplay.innerText = '🟢 SENSOR LIVE: ' + angle.toFixed(1) + '°';
        
        // Remove direct rotation mapping since CSS animation spins the records continuously now
        
        applyEffects(angle);
    };
    
    ws.onclose = function() {
        modeBadge.innerText = "SENSOR DISCONNECTED";
        setTimeout(connectWebSocket, 2000);
    };
}

connectWebSocket();
