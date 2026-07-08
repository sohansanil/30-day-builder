"use client";
import { useState, useEffect, useRef } from "react";

// --- Simple 8-Bit Web Audio Synth ---
const playSound = (type: 'click' | 'startup' | 'error' | 'window') => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'click') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.05);
    } else if (type === 'error') {
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } else if (type === 'window') {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'startup') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
      oscillator.frequency.setValueAtTime(554.37, audioCtx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.0);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1.0);
    }
  } catch(e) {}
};

export default function Desktop() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<'bios' | 'boot' | 'desktop'>('bios');
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [openWindows, setOpenWindows] = useState<string[]>(["sohan", "readme"]);
  const [minimizedWindows, setMinimizedWindows] = useState<string[]>([]);
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);
  const [nsaClicks, setNsaClicks] = useState(0);

  // Marquee Selection State
  const [selectionStart, setSelectionStart] = useState<{x: number, y: number} | null>(null);
  const [selectionCurrent, setSelectionCurrent] = useState<{x: number, y: number} | null>(null);

  const focusWindow = (id: string) => {
    setOpenWindows(prev => [...prev.filter(w => w !== id), id]);
    setMinimizedWindows(prev => prev.filter(w => w !== id));
  };

  const openWindow = (id: string) => {
    playSound('window');
    if (!openWindows.includes(id)) {
      setOpenWindows(prev => [...prev, id]);
    } else {
      focusWindow(id);
    }
  };

  const closeWindow = (id: string) => {
    playSound('click');
    setOpenWindows(prev => prev.filter((winId) => winId !== id));
    setMinimizedWindows(prev => prev.filter(w => w !== id));
  };

  const minimizeWindow = (id: string) => {
    playSound('click');
    if (!minimizedWindows.includes(id)) {
      setMinimizedWindows(prev => [...prev, id]);
    }
  };

  useEffect(() => {
    setMounted(true);
    setTimeout(() => {
      setStage('boot');
    }, 2500);
  }, []);

  useEffect(() => {
    if (stage !== 'boot') return;
    const sequence = [
      "CipherLab OS v1.7",
      "Memory Check: 640K OK",
      "Loading cryptographic modules...",
      "AES [██████████] OK",
      "RSA [███████] OK",
      "Steganography [████████] OK",
      "Password Analysis [██████] OK",
      "Initializing GUI...",
      "Ready."
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i < sequence.length) {
        setBootLog((prev) => prev.includes(sequence[i]) ? prev : [...prev, sequence[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setStage('desktop');
          playSound('startup');
        }, 400);
      }
    }, 120);
    return () => clearInterval(interval);
  }, [stage]);

  // Desktop Mouse Handlers for Marquee Selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === "desktop-background") {
      setSelectedIcon(null);
      setSelectionStart({ x: e.clientX, y: e.clientY });
      setSelectionCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectionStart) {
      setSelectionCurrent({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setSelectionStart(null);
    setSelectionCurrent(null);
  };

  if (!mounted) return <div className="h-screen w-screen bg-black" />;

  if (stage === 'bios') {
    return (
      <div className="h-screen w-screen bg-black p-12 font-terminal text-[#c0c0c0] flex flex-col gap-4 z-40 relative" style={{ fontSize: '24px' }}>
        <p className="font-bold mb-8 text-white" style={{ fontSize: '32px' }}>CipherLab OS v1.7</p>
        <p>Initializing Security Modules...</p>
        <p>✓ AES Engine</p>
        <p>✓ RSA Engine</p>
        <p>✓ Password Analyzer</p>
        <p>✓ Steganography Module</p>
        <p className="mt-8">Boot Complete.</p>
        <div className="animate-pulse mt-2 text-white">_</div>
      </div>
    );
  }

  if (stage === 'boot') {
    return (
      <div className="h-screen w-screen bg-black p-12 font-terminal text-[#00ff00] flex flex-col gap-4 tracking-widest z-40 relative" style={{ fontSize: '24px' }}>
        {bootLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
        <div className="animate-pulse mt-4">_</div>
        <div className="crt-overlay" />
      </div>
    );
  }

  // Calculate Marquee Box
  let marqueeStyle = {};
  if (selectionStart && selectionCurrent) {
    const left = Math.min(selectionStart.x, selectionCurrent.x);
    const top = Math.min(selectionStart.y, selectionCurrent.y);
    const width = Math.abs(selectionStart.x - selectionCurrent.x);
    const height = Math.abs(selectionStart.y - selectionCurrent.y);
    marqueeStyle = {
      position: 'absolute',
      left, top, width, height,
      backgroundColor: 'rgba(0, 0, 170, 0.4)',
      border: '1px dotted white',
      zIndex: 50,
      pointerEvents: 'none'
    };
  }

  return (
    <div 
      id="desktop-background"
      style={{ height: '100vh', width: '100vw', position: 'relative', overflow: 'hidden' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <AmbienceLog />

      {/* Marquee Selection Box */}
      {selectionStart && <div style={marqueeStyle as any} />}

      <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 40px)', zIndex: 10 }}>
        <DesktopIcon id="cipher" name="cipher.exe" iconPath="/icons/cipher.png" top="8%" left="5%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => openWindow("cipher")} />
        <DesktopIcon id="crack" name="crack.exe" iconPath="/icons/crack.png" top="28%" left="15%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => openWindow("crack")} />
        <DesktopIcon id="stego" name="stego.exe" iconPath="/icons/stego.png" top="55%" left="8%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => openWindow("stego")} />
        
        <DesktopIcon id="sohan" name="creator.png" iconPath="/hero-8bit.png" top="45%" left="45%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => openWindow("sohan")} />
        
        <DesktopIcon id="readme" name="README.txt" iconPath="/icons/readme.png" top="12%" left="85%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => openWindow("readme")} />
        <DesktopIcon id="nsa" name="NSA_ACCESS" iconPath="/icons/nsa.png" top="75%" left="80%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => {
          setNsaClicks(prev => prev + 1);
          playSound(nsaClicks >= 4 ? 'window' : 'error');
          openWindow("nsa");
        }} />

        <DesktopIcon id="passwords" name="passwords.txt" iconPath="/icons/readme.png" top="35%" left="75%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => {playSound('error'); openWindow("passwords")}} />
        <DesktopIcon id="bitcoin" name="wallet.dat" iconPath="/icons/readme.png" top="55%" left="88%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => {playSound('error'); openWindow("bitcoin")}} />
        <DesktopIcon id="virus" name="dont_open.zip" iconPath="/icons/virus.png" top="70%" left="25%" selectedIcon={selectedIcon} setSelectedIcon={setSelectedIcon} onDoubleClick={() => {playSound('error'); openWindow("virus")}} />
      </div>
      
      {openWindows.includes("cipher") && (
        <RetroWindow title="CipherLab [Active]" onClose={() => closeWindow("cipher")} defaultPosition={{x: 350, y: 150}} isActive={openWindows[openWindows.length - 1] === "cipher"} onFocus={() => focusWindow("cipher")} onMinimize={() => minimizeWindow("cipher")} isHidden={minimizedWindows.includes("cipher")}>
          <CipherApp />
        </RetroWindow>
      )}

      {openWindows.includes("crack") && (
        <RetroWindow title="crack.exe" onClose={() => closeWindow("crack")} defaultPosition={{x: 300, y: 100}} isActive={openWindows[openWindows.length - 1] === "crack"} onFocus={() => focusWindow("crack")} onMinimize={() => minimizeWindow("crack")} isHidden={minimizedWindows.includes("crack")}>
          <CrackApp />
        </RetroWindow>
      )}

      {openWindows.includes("stego") && (
        <RetroWindow title="stego.exe" onClose={() => closeWindow("stego")} defaultPosition={{x: 400, y: 150}} isActive={openWindows[openWindows.length - 1] === "stego"} onFocus={() => focusWindow("stego")} onMinimize={() => minimizeWindow("stego")} isHidden={minimizedWindows.includes("stego")}>
          <StegoApp />
        </RetroWindow>
      )}

      {openWindows.includes("sohan") && (
        <RetroWindow title="creator.png - Image Viewer" onClose={() => closeWindow("sohan")} defaultPosition={{x: 100, y: 100}} isActive={openWindows[openWindows.length - 1] === "sohan"} onFocus={() => focusWindow("sohan")} onMinimize={() => minimizeWindow("sohan")} isHidden={minimizedWindows.includes("sohan")}>
          <div style={{ backgroundColor: '#808080', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset -2px -2px #ffffff, inset 2px 2px #0a0a0a' }}>
            <img src="/hero-8bit.png" alt="Sohan Sanil" style={{ maxWidth: '400px', width: '100%', imageRendering: 'pixelated', border: '2px solid #000', boxShadow: '2px 2px 0px #fff' }} />
          </div>
        </RetroWindow>
      )}

      {openWindows.includes("readme") && (
        <RetroWindow title="README.txt - Notepad" onClose={() => closeWindow("readme")} defaultPosition={{x: 550, y: 150}} isActive={openWindows[openWindows.length - 1] === "readme"} onFocus={() => focusWindow("readme")} onMinimize={() => minimizeWindow("readme")} isHidden={minimizedWindows.includes("readme")}>
          <div style={{ backgroundColor: '#ffffff', padding: '16px', height: '100%', minHeight: '300px', fontFamily: 'var(--font-vt323), monospace', fontSize: '20px', color: '#000000', lineHeight: '1.2' }}>
            Welcome to CipherLab OS.<br/><br/>
            This workstation contains three core tools:<br/><br/>
            <strong>1. cipher.exe (Encryption Sandbox)</strong><br/>
            Encrypt and decrypt messages using 5 classic algorithms (Caesar, Vigenère, Rail Fence, Playfair, Hill).<br/><br/>
            <strong>2. crack.exe (Attack Lab)</strong><br/>
            Test password strength against simulated brute-force attacks and calculate real-world entropy.<br/><br/>
            <strong>3. stego.exe (Steganography)</strong><br/>
            Mathematically hide secret messages inside the pixels of images, and extract them later.<br/><br/>
            Double-click the icons to begin.<br/><br/>
            -- Sohan Sanil
          </div>
        </RetroWindow>
      )}

      {openWindows.includes("virus") && (
        <RetroWindow title="System Warning" onClose={() => closeWindow("virus")} defaultPosition={{x: 400, y: 300}} isActive={openWindows[openWindows.length - 1] === "virus"} onFocus={() => focusWindow("virus")} onMinimize={() => minimizeWindow("virus")} isHidden={minimizedWindows.includes("virus")}>
          <div style={{ backgroundColor: '#c0c0c0', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', color: 'black' }}>
            <img src="/icons/virus.png" alt="warning" style={{width: '64px', height: '64px', imageRendering: 'pixelated'}} />
            <p style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '24px', fontFamily: 'var(--font-pixelify), monospace' }}>Installing virus...</p>
            <p style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '24px', letterSpacing: '4px' }}>██████████</p>
            <p style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '18px' }}>...Just kidding.<br/>Always verify executables.</p>
            <button style={{ marginTop: '16px', fontFamily: 'var(--font-pixelify), monospace', padding: '4px 16px', fontSize: '16px' }} onClick={() => closeWindow("virus")}>OK</button>
          </div>
        </RetroWindow>
      )}

      {openWindows.includes("nsa") && (
        <RetroWindow title="ERROR" onClose={() => closeWindow("nsa")} defaultPosition={{x: 350, y: 250}} isActive={openWindows[openWindows.length - 1] === "nsa"} onFocus={() => focusWindow("nsa")} onMinimize={() => minimizeWindow("nsa")} isHidden={minimizedWindows.includes("nsa")}>
          <div style={{ backgroundColor: '#c0c0c0', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', color: 'black' }}>
            {nsaClicks >= 5 ? (
              <p style={{ fontWeight: 'bold', color: '#15803d', fontSize: '32px', fontFamily: 'var(--font-pixelify), monospace' }}>Nice try.</p>
            ) : (
              <>
                <p style={{ fontWeight: 'bold', color: '#dc2626', fontSize: '32px', fontFamily: 'var(--font-pixelify), monospace' }}>ACCESS DENIED</p>
                <p style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '24px' }}>LEVEL 5 CLEARANCE REQUIRED</p>
                <p style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '18px' }}>This incident has been logged.</p>
              </>
            )}
            <button style={{ marginTop: '16px', fontFamily: 'var(--font-pixelify), monospace', padding: '4px 16px', fontSize: '16px' }} onClick={() => closeWindow("nsa")}>Dismiss</button>
          </div>
        </RetroWindow>
      )}

      {openWindows.includes("passwords") && (
        <RetroWindow title="passwords.txt - Notepad" onClose={() => closeWindow("passwords")} defaultPosition={{x: 500, y: 150}} isActive={openWindows[openWindows.length - 1] === "passwords"} onFocus={() => focusWindow("passwords")} onMinimize={() => minimizeWindow("passwords")} isHidden={minimizedWindows.includes("passwords")}>
          <div style={{ backgroundColor: '#ffffff', padding: '16px', height: '100%', minHeight: '300px', fontFamily: 'var(--font-vt323), monospace', fontSize: '22px', color: '#000000' }}>
            netflix: hunter2<br/>
            bank: password123<br/>
            admin: admin<br/><br/>
            (Please don't do this in real life)
          </div>
        </RetroWindow>
      )}

      {openWindows.includes("bitcoin") && (
        <RetroWindow title="Wallet Error" onClose={() => closeWindow("bitcoin")} defaultPosition={{x: 600, y: 400}} isActive={openWindows[openWindows.length - 1] === "bitcoin"} onFocus={() => focusWindow("bitcoin")} onMinimize={() => minimizeWindow("bitcoin")} isHidden={minimizedWindows.includes("bitcoin")}>
          <div style={{ backgroundColor: '#c0c0c0', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', textAlign: 'center', color: 'black' }}>
            <p style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '24px' }}>Wallet.dat is corrupted.</p>
            <p style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '24px' }}>Balance: 0.00000000 BTC</p>
            <button style={{ marginTop: '16px', fontFamily: 'var(--font-pixelify), monospace', padding: '4px 16px', fontSize: '16px' }} onClick={() => closeWindow("bitcoin")}>Close</button>
          </div>
        </RetroWindow>
      )}

      {startMenuOpen && (
        <div style={{ position: 'absolute', bottom: '38px', left: '0px', width: '250px', backgroundColor: '#c0c0c0', boxShadow: 'inset 1px 1px 0 #dfdfdf, inset -1px -1px 0 #0a0a0a, inset 2px 2px 0 #ffffff, inset -2px -2px 0 #808080', zIndex: 9999, display: 'flex', border: '1px solid black' }}>
          <div style={{ width: '30px', backgroundColor: '#808080', color: '#c0c0c0', fontFamily: 'var(--font-pixelify)', fontSize: '20px', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', padding: '8px 4px', fontWeight: 'bold' }}>
            CipherLab OS
          </div>
          <div style={{ flex: 1, padding: '2px', display: 'flex', flexDirection: 'column' }}>
            <button onClick={() => { openWindow("cipher"); setStartMenuOpen(false); }} style={{ padding: '8px', textAlign: 'left', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-pixelify)', fontSize: '18px' }} className="hover:bg-[#0000aa] hover:text-white group">
              <img src="/icons/cipher.png" alt="cipher" style={{ width: 24, height: 24, imageRendering: 'pixelated' }} /> cipher.exe
            </button>
            <button onClick={() => { openWindow("crack"); setStartMenuOpen(false); }} style={{ padding: '8px', textAlign: 'left', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-pixelify)', fontSize: '18px' }} className="hover:bg-[#0000aa] hover:text-white group">
              <img src="/icons/crack.png" alt="crack" style={{ width: 24, height: 24, imageRendering: 'pixelated' }} /> crack.exe
            </button>
            <button onClick={() => { openWindow("stego"); setStartMenuOpen(false); }} style={{ padding: '8px', textAlign: 'left', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-pixelify)', fontSize: '18px' }} className="hover:bg-[#0000aa] hover:text-white group">
              <img src="/icons/stego.png" alt="stego" style={{ width: 24, height: 24, imageRendering: 'pixelated' }} /> stego.exe
            </button>
            <div style={{ borderBottom: '1px solid #808080', margin: '4px 8px' }}></div>
            <button onClick={() => { openWindow("sohan"); setStartMenuOpen(false); }} style={{ padding: '8px', textAlign: 'left', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-pixelify)', fontSize: '18px' }} className="hover:bg-[#0000aa] hover:text-white group">
              <img src="/hero-8bit.png" alt="creator" style={{ width: 24, height: 24, imageRendering: 'pixelated' }} /> creator.png
            </button>
            <div style={{ borderBottom: '1px solid #808080', margin: '4px 8px' }}></div>
            <button onClick={() => { setBootLog([]); setStage("bios"); setStartMenuOpen(false); playSound("error"); }} style={{ padding: '8px', textAlign: 'left', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-pixelify)', fontSize: '18px' }} className="hover:bg-[#0000aa] hover:text-white group">
              <div style={{ width: 24, height: 24, backgroundColor: '#808080', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>!</div>
              Restart System
            </button>
          </div>
        </div>
      )}

      <Taskbar 
        openWindows={openWindows} 
        activeWindow={openWindows.length > 0 ? openWindows[openWindows.length - 1] : null}
        minimizedWindows={minimizedWindows}
        onWindowClick={(id) => {
          if (minimizedWindows.includes(id)) {
            focusWindow(id);
          } else if (openWindows[openWindows.length - 1] === id) {
            minimizeWindow(id);
          } else {
            focusWindow(id);
          }
        }} 
        onStartClick={() => setStartMenuOpen(!startMenuOpen)}
        startMenuOpen={startMenuOpen}
      />
      <div className="crt-overlay" />
    </div>
  );
}

function AmbienceLog() {
  const [log, setLog] = useState("");
  useEffect(() => {
    const logs = ["Listening on port 443...", "Hash database synchronized.", "Connection secured.", "Decrypting payload...", "Awaiting instructions..."];
    const updateLog = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLog(`[${timeStr}] ${logs[Math.floor(Math.random() * logs.length)]}`);
    };
    updateLog();
    const interval = setInterval(updateLog, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ position: 'absolute', bottom: '50px', right: '20px', color: 'rgba(255, 255, 255, 0.4)', fontFamily: 'var(--font-vt323), monospace', fontSize: '18px', zIndex: 1, pointerEvents: 'none' }}>
      {log}
    </div>
  );
}

function DesktopIcon({ id, name, iconPath, top, left, selectedIcon, setSelectedIcon, onDoubleClick }: { id: string; name: string; iconPath: string; top: string; left: string; selectedIcon: string | null; setSelectedIcon: (id: string) => void; onDoubleClick: () => void; }) {
  const [hover, setHover] = useState(false);
  const [jiggling, setJiggling] = useState(false);
  const isSelected = selectedIcon === id;
  
  return (
    <div 
      className="desktop-icon"
      onClick={(e) => { e.stopPropagation(); if (!isSelected) playSound('click'); setSelectedIcon(id); }}
      onDoubleClick={(e) => { e.stopPropagation(); setJiggling(true); setTimeout(() => setJiggling(false), 150); onDoubleClick(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'absolute', top, left, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '120px', textAlign: 'center', padding: '8px', transform: hover ? 'scale(1.05) translateY(-2px)' : 'scale(1)', transition: 'transform 0.1s ease' }}
    >
      <img src={iconPath} alt={name} className={jiggling ? 'animate-jiggle' : ''} style={{ width: '72px', height: '72px', objectFit: 'contain', imageRendering: 'pixelated', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.8))' }} />
      <span style={{ color: 'white', fontSize: '16px', fontFamily: 'var(--font-pixelify), monospace', letterSpacing: '1px', fontWeight: 'bold', padding: '2px 8px', backgroundColor: isSelected ? '#0000aa' : 'transparent', border: isSelected ? '1px dotted white' : '1px solid transparent', textShadow: '1px 1px 0 #000' }}>
        {name}
      </span>
    </div>
  );
}

// Custom Drag Hook replacing react-draggable to avoid React 19 crashes.
// Note: We use pure 98.css DOM structures for the window so it renders flawlessly.
function RetroWindow({ title, children, onClose, defaultPosition = {x: 0, y: 0}, isActive = true, onFocus, onMinimize, isHidden = false }: { title: string; children: React.ReactNode; onClose: () => void; defaultPosition?: {x: number, y: number}; isActive?: boolean; onFocus?: () => void; onMinimize?: () => void; isHidden?: boolean; }) {
  const [pos, setPos] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({x: 0, y: 0});

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setDragOffset({ x: e.clientX - pos.x, y: e.clientY - pos.y });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    setIsDragging(false);
  };

  return (
    <div 
      className="window" 
      style={{ position: 'absolute', left: pos.x, top: pos.y, zIndex: isActive ? 150 : 100, width: '480px', boxShadow: '5px 5px 0px rgba(0,0,0,0.8)', display: isHidden ? 'none' : 'block' }}
      onPointerDownCapture={onFocus}
    >
      <div 
        className="title-bar" 
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
        style={{ cursor: 'move', touchAction: 'none', backgroundColor: isActive === false ? '#808080' : '' }}
      >
        <div className="title-bar-text" style={{ fontFamily: 'var(--font-pixelify), monospace', letterSpacing: '1px', fontSize: '18px' }}>
          {title}
        </div>
        <div className="title-bar-controls">
          <button aria-label="Minimize" onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close" onClick={(e) => { e.stopPropagation(); onClose(); }}></button>
        </div>
      </div>
      <div className="window-body" style={{ margin: '0' }}>
        {children}
      </div>
    </div>
  );
}

function Taskbar({ 
  openWindows, 
  activeWindow,
  minimizedWindows,
  onWindowClick, 
  onStartClick,
  startMenuOpen
}: { 
  openWindows: string[], 
  activeWindow: string | null,
  minimizedWindows: string[],
  onWindowClick: (id: string) => void,
  onStartClick: () => void,
  startMenuOpen: boolean
}) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getWindowName = (win: string) => {
    const names: Record<string, string> = {
      'readme': 'README.txt',
      'sohan': 'creator.png',
      'virus': 'System Warning',
      'bitcoin': 'Wallet Error',
      'nsa': 'ERROR',
      'passwords': 'passwords.txt'
    };
    return names[win] || `${win}.exe`;
  };

  const startButtonStyle = startMenuOpen
    ? { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', padding: '2px 8px', height: '100%', boxShadow: 'inset 2px 2px 0 #0a0a0a, inset -2px -2px 0 #fff', backgroundColor: '#c0c0c0', border: 'none', fontSize: '16px' }
    : { display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', padding: '2px 8px', height: '100%', boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #0a0a0a, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080', backgroundColor: '#c0c0c0', border: 'none', fontSize: '16px' };

  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '38px', backgroundColor: '#c0c0c0', borderTop: '2px solid #fff', display: 'flex', alignItems: 'center', padding: '2px 4px', boxShadow: '0 -1px 2px rgba(0,0,0,0.5)', zIndex: 9000, fontFamily: 'var(--font-pixelify), sans-serif', color: 'black' }}>
      <button onClick={() => { playSound('click'); onStartClick(); }} style={startButtonStyle as any}>
        <div style={{ width: 18, height: 18, backgroundColor: 'transparent', border: '1px solid black', display: 'flex', flexWrap: 'wrap' }}>
           <div style={{width: '50%', height: '50%', backgroundColor: 'red'}} /><div style={{width: '50%', height: '50%', backgroundColor: 'green'}} /><div style={{width: '50%', height: '50%', backgroundColor: 'blue'}} /><div style={{width: '50%', height: '50%', backgroundColor: 'yellow'}} />
        </div>
        Launch
      </button>
      <div style={{ width: '2px', height: '80%', backgroundColor: '#808080', margin: '0 8px', borderRight: '1px solid #fff' }} />
      <div style={{ display: 'flex', gap: '4px', flex: 1, overflowX: 'hidden' }}>
        {openWindows.map(win => {
          const isActive = win === activeWindow && !minimizedWindows.includes(win);
          const buttonStyle = isActive 
            ? { padding: '2px 8px', height: '100%', minWidth: '100px', maxWidth: '160px', textAlign: 'left' as const, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#c0c0c0', boxShadow: 'inset 2px 2px 0 #0a0a0a, inset -2px -2px 0 #fff', border: 'none', fontWeight: 'bold', fontSize: '14px' }
            : { padding: '2px 8px', height: '100%', minWidth: '100px', maxWidth: '160px', textAlign: 'left' as const, whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: '#c0c0c0', boxShadow: 'inset 1px 1px 0 #fff, inset -1px -1px 0 #0a0a0a, inset 2px 2px 0 #dfdfdf, inset -2px -2px 0 #808080', border: 'none', fontWeight: 'bold', fontSize: '14px' };
          return (
            <button key={win} onClick={() => onWindowClick(win)} style={buttonStyle}>
              {getWindowName(win)}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '2px 10px', height: '100%', boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff', marginLeft: 'auto', fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-vt323), monospace' }}>
        <span>AES-256</span><span>CRYPTOGRAPHER</span><span>{time}</span>
      </div>
    </div>
  );
}

// --- Cipher Application ---
function CipherApp() {
  const [mode, setMode] = useState<'caesar' | 'vigenere' | 'railfence' | 'playfair' | 'hill'>('caesar');
  const [input, setInput] = useState('HELLO WORLD');
  const [key, setKey] = useState('3');
  const [output, setOutput] = useState('');
  const [logs, setLogs] = useState<string[]>([
    "C:\\CipherLab\\bin> encryption.exe",
    "Module loaded successfully."
  ]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] ${msg}`]);
  };

  const processCipher = (encrypt: boolean) => {
    if (!input) return;
    playSound('click');
    addLog(`Initializing ${encrypt ? 'Encryption' : 'Decryption'}...`);
    addLog(`Algorithm: ${mode.toUpperCase()}`);

    let result = '';
    
    if (mode === 'caesar') {
      const shift = parseInt(key) || 0;
      const actualShift = encrypt ? shift : -shift;
      
      for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (char.match(/[a-z]/i)) {
          const code = input.charCodeAt(i);
          if (code >= 65 && code <= 90) {
            char = String.fromCharCode(((code - 65 + actualShift) % 26 + 26) % 26 + 65);
          } else if (code >= 97 && code <= 122) {
            char = String.fromCharCode(((code - 97 + actualShift) % 26 + 26) % 26 + 97);
          }
        }
        result += char;
      }
    } else if (mode === 'vigenere') {
      const vKey = key.replace(/[^A-Za-z]/g, '').toUpperCase();
      if (!vKey) {
        addLog("ERROR: Vigenère key must contain letters.");
        return;
      }
      
      let j = 0;
      for (let i = 0; i < input.length; i++) {
        let char = input[i];
        if (char.match(/[a-z]/i)) {
          const code = input.charCodeAt(i);
          const shift = vKey.charCodeAt(j % vKey.length) - 65;
          const actualShift = encrypt ? shift : -shift;
          
          if (code >= 65 && code <= 90) {
            char = String.fromCharCode(((code - 65 + actualShift) % 26 + 26) % 26 + 65);
          } else if (code >= 97 && code <= 122) {
            char = String.fromCharCode(((code - 97 + actualShift) % 26 + 26) % 26 + 97);
          }
          j++;
        }
        result += char;
      }
    } else if (mode === 'railfence') {
      const rails = parseInt(key);
      if (isNaN(rails) || rails < 2) {
        addLog("ERROR: Rail Fence key must be a number >= 2.");
        return;
      }
      const cleanText = input.replace(/\s+/g, '');
      if (encrypt) {
        const fence = Array.from({length: rails}, () => [] as string[]);
        let r = 0, dir = 1;
        for (const char of cleanText) {
          fence[r].push(char);
          r += dir;
          if (r === 0 || r === rails - 1) dir *= -1;
        }
        result = fence.flat().join('');
      } else {
        const fence = Array.from({length: rails}, () => new Array(cleanText.length).fill(null));
        let r = 0, dir = 1;
        for (let i = 0; i < cleanText.length; i++) {
          fence[r][i] = '*';
          r += dir;
          if (r === 0 || r === rails - 1) dir *= -1;
        }
        let index = 0;
        for (let row = 0; row < rails; row++) {
          for (let col = 0; col < cleanText.length; col++) {
            if (fence[row][col] === '*' && index < cleanText.length) {
              fence[row][col] = cleanText[index++];
            }
          }
        }
        r = 0; dir = 1;
        for (let i = 0; i < cleanText.length; i++) {
          result += fence[r][i];
          r += dir;
          if (r === 0 || r === rails - 1) dir *= -1;
        }
      }
    } else if (mode === 'playfair') {
      let text = input.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
      const pKey = key.toUpperCase().replace(/[^A-Z]/g, '').replace(/J/g, 'I');
      if (!pKey) { addLog("ERROR: Playfair needs a valid key."); return; }
      
      const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
      let matrixStr = '';
      for (const char of pKey + alphabet) {
        if (!matrixStr.includes(char)) matrixStr += char;
      }
      
      const matrix: string[] = [];
      for (let i=0; i<5; i++) matrix.push(matrixStr.slice(i*5, i*5+5));
      
      const findPos = (char: string) => {
        const idx = matrixStr.indexOf(char);
        return [Math.floor(idx/5), idx%5];
      };

      if (encrypt) {
        const pairs = [];
        for (let i=0; i<text.length; i+=2) {
          if (i === text.length - 1) pairs.push(text[i] + 'X');
          else if (text[i] === text[i+1]) { pairs.push(text[i] + 'X'); i--; }
          else pairs.push(text[i] + text[i+1]);
        }
        text = pairs.join('');
      }

      for (let i=0; i<text.length; i+=2) {
        const [r1, c1] = findPos(text[i]);
        const [r2, c2] = findPos(text[i+1]);
        if (r1 === undefined || r2 === undefined) continue;
        const shift = encrypt ? 1 : 4; 
        
        if (r1 === r2) {
          result += matrix[r1][(c1 + shift) % 5] + matrix[r2][(c2 + shift) % 5];
        } else if (c1 === c2) {
          result += matrix[(r1 + shift) % 5][c1] + matrix[(r2 + shift) % 5][c2];
        } else {
          result += matrix[r1][c2] + matrix[r2][c1];
        }
      }
    } else if (mode === 'hill') {
      let text = input.toUpperCase().replace(/[^A-Z]/g, '');
      const hKey = key.toUpperCase().replace(/[^A-Z]/g, '');
      if (hKey.length !== 4) { addLog("ERROR: Hill key must be exactly 4 letters (e.g. DDCF)."); return; }
      
      const kVals = [...hKey].map(c => c.charCodeAt(0) - 65);
      const [a, b, c, d] = kVals;
      let det = (a * d - b * c) % 26;
      det = (det + 26) % 26;
      
      if (det === 0 || det % 2 === 0 || det % 13 === 0) {
        addLog("ERROR: Key is not invertible mod 26. Try 'DDCF'."); return;
      }

      const modInverse = (a: number, m: number) => {
        a = ((a % m) + m) % m;
        for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
        return 1;
      };

      let matrix = [a, b, c, d];
      if (!encrypt) {
        const invDet = modInverse(det, 26);
        matrix = [(d * invDet) % 26, (-b * invDet) % 26, (-c * invDet) % 26, (a * invDet) % 26].map(n => (n + 26) % 26);
      }

      if (text.length % 2 !== 0) text += 'X';
      for (let i = 0; i < text.length; i += 2) {
        const v1 = text.charCodeAt(i) - 65;
        const v2 = text.charCodeAt(i+1) - 65;
        const r1 = (matrix[0] * v1 + matrix[1] * v2) % 26;
        const r2 = (matrix[2] * v1 + matrix[3] * v2) % 26;
        result += String.fromCharCode(r1 + 65) + String.fromCharCode(r2 + 65);
      }
    }

    if (result) {
      setTimeout(() => {
        setOutput(result);
        addLog(`Success. Output generated.`);
        playSound('window');
      }, 400);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px', backgroundColor: '#c0c0c0', color: 'black' }}>
      
      {/* GUI Top Half */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ fontFamily: 'var(--font-pixelify)', fontSize: '18px', fontWeight: 'bold' }}>Algorithm:</label>
          <select 
            value={mode} 
            onChange={(e) => { setMode(e.target.value as any); playSound('click'); }}
            style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px', padding: '0 8px', height: '32px', minWidth: '200px', backgroundColor: 'white', color: 'black', border: '2px solid #808080' }}
          >
            <option value="caesar">Caesar Shift</option>
            <option value="vigenere">Vigenère Cipher</option>
            <option value="railfence">Rail Fence</option>
            <option value="playfair">Playfair Cipher</option>
            <option value="hill">Hill Cipher (2x2)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-pixelify)', fontSize: '16px', fontWeight: 'bold' }}>Plaintext / Ciphertext</label>
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ fontFamily: 'var(--font-vt323)', fontSize: '20px', padding: '8px', height: '80px', resize: 'none', backgroundColor: 'white', color: 'black', border: '2px solid #808080', boxShadow: 'inset 2px 2px 0 #000' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: 'var(--font-pixelify)', fontSize: '16px', fontWeight: 'bold' }}>Secret Key:</label>
          <input 
            type={mode === 'caesar' || mode === 'railfence' ? 'number' : 'text'}
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={mode === 'hill' ? 'e.g. DDCF' : ''}
            style={{ fontFamily: 'var(--font-vt323)', fontSize: '20px', padding: '4px 8px', width: '120px', backgroundColor: 'white', color: 'black', border: '2px solid #808080', boxShadow: 'inset 2px 2px 0 #000' }}
          />
          
          <button 
            onClick={() => processCipher(true)}
            style={{ marginLeft: 'auto', padding: '4px 12px', fontFamily: 'var(--font-pixelify)', fontWeight: 'bold', fontSize: '16px', border: '2px solid black', backgroundColor: '#dfdfdf', boxShadow: 'inset 1px 1px 0 #fff' }}
          >
            Encrypt
          </button>
          <button 
            onClick={() => processCipher(false)}
            style={{ padding: '4px 12px', fontFamily: 'var(--font-pixelify)', fontWeight: 'bold', fontSize: '16px', border: '2px solid black', backgroundColor: '#dfdfdf', boxShadow: 'inset 1px 1px 0 #fff' }}
          >
            Decrypt
          </button>
        </div>
        
        <div style={{ fontFamily: 'var(--font-vt323)', fontSize: '16px', color: '#444', marginTop: '-8px' }}>
          {mode === 'caesar' && "💡 Enter a number (e.g. 3) to shift the alphabet."}
          {mode === 'vigenere' && "💡 Enter a secret keyword (e.g. LEMON)."}
          {mode === 'railfence' && "💡 Enter the number of rails (e.g. 3)."}
          {mode === 'playfair' && "💡 Enter a secret keyword (letters only)."}
          {mode === 'hill' && "💡 Enter exactly 4 letters to form a 2x2 matrix (e.g. DDCF)."}
        </div>
      </div>

      {/* Terminal Bottom Half */}
      <div style={{ flex: 1, backgroundColor: '#000', padding: '12px', color: '#0f0', fontFamily: 'var(--font-vt323), monospace', fontSize: '18px', overflowY: 'auto', borderTop: '4px solid #808080' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
        
        {output && (
          <div style={{ marginTop: '12px' }}>
            <span style={{ color: '#fff' }}>{'>>>'} RESULT: </span>
            <span style={{ color: '#fff', backgroundColor: '#0000aa', padding: '0 4px', wordBreak: 'break-all' }}>{output}</span>
          </div>
        )}
        
      </div>
    </div>
  );
}

// --- Password Attack Lab ---
function CrackApp() {
  const [password, setPassword] = useState('');
  const [attacking, setAttacking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<any>(null);

  const calculateEntropy = (pw: string) => {
    let pool = 0;
    if (/[a-z]/.test(pw)) pool += 26;
    if (/[A-Z]/.test(pw)) pool += 26;
    if (/[0-9]/.test(pw)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) pool += 32;
    if (pool === 0) return 0;
    return pw.length * Math.log2(pool);
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return "Instantaneous";
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
    return "Centuries (Uncrackable)";
  };

  const runAttack = () => {
    if (!password) return;
    playSound('click');
    setAttacking(true);
    setProgress(0);
    setResults(null);

    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      if (p >= 100) {
        clearInterval(interval);
        setAttacking(false);
        playSound('error'); // dramatic sound for cracking
        
        const entropy = calculateEntropy(password);
        const guesses = Math.pow(2, entropy);
        
        setResults({
          entropy: Math.round(entropy),
          laptop: formatTime(guesses / 1e9),
          gpu: formatTime(guesses / 1e11),
          super: formatTime(guesses / 1e14),
          isHunter2: password === 'hunter2'
        });
      }
    }, 50);
  };

  const bar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));

  return (
    <div style={{ backgroundColor: '#c0c0c0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'black', height: '100%', minHeight: '400px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #808080', paddingBottom: '12px' }}>
        <img src="/icons/crack.png" alt="crack" style={{ width: 48, height: 48, imageRendering: 'pixelated', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }} />
        <h2 style={{ fontFamily: 'var(--font-pixelify), monospace', fontSize: '28px', fontWeight: 'bold' }}>Brute-Force Simulator</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontFamily: 'var(--font-pixelify), monospace', fontSize: '18px', fontWeight: 'bold' }}>Target Password:</label>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input 
            type="text" 
            placeholder="Enter password to test..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={attacking}
            style={{ flex: 1, fontFamily: 'var(--font-vt323), monospace', fontSize: '24px', padding: '4px 8px', border: '2px solid #808080', boxShadow: 'inset 2px 2px 0 #000', backgroundColor: 'white', color: 'black' }} 
          />
          <button 
            onClick={runAttack}
            disabled={attacking || !password}
            style={{ fontFamily: 'var(--font-pixelify), monospace', fontSize: '18px', padding: '4px 16px', border: '2px solid black', backgroundColor: attacking ? '#808080' : '#dfdfdf', boxShadow: 'inset 1px 1px 0 #fff' }}
          >
            {attacking ? 'ATTACKING...' : 'COMMENCE ATTACK'}
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#000', color: '#0f0', padding: '12px', flex: 1, fontFamily: 'var(--font-vt323), monospace', fontSize: '20px', borderTop: '4px solid #808080', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {attacking ? (
          <>
            <div>[SYSTEM] Initiating brute-force attack on hash...</div>
            <div>[STATUS] Injecting payload...</div>
            <div style={{ color: '#fff' }}>{`[${bar}] ${progress}%`}</div>
          </>
        ) : results ? (
          <>
            {results.isHunter2 ? (
              <div style={{ color: 'red', animation: 'pulse 1s infinite' }}>*** ALERT: HIGH VALUE TARGET (hunter2) DETECTED ***<br/>ALL ENCRYPTION BYPASSED.</div>
            ) : (
              <div>[SYSTEM] Attack simulation complete.</div>
            )}
            <div style={{ marginTop: '8px' }}>--- SECURITY REPORT ---</div>
            <div>Entropy: {results.entropy} bits</div>
            <div style={{ marginTop: '8px', color: '#fff' }}>Estimated Time to Crack:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>💻 Standard Laptop:</span> <span>{results.laptop}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>🎮 GPU Cluster:</span> <span>{results.gpu}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'red' }}>
              <span>🏢 NSA Supercomputer:</span> <span>{results.super}</span>
            </div>
            <div style={{ marginTop: '12px' }}>C:\CipherLab{'>'} <span className="animate-pulse">_</span></div>
          </>
        ) : (
          <>
            <div>[SYSTEM] Attack Lab Ready.</div>
            <div>Awaiting target payload...</div>
            <div style={{ marginTop: '8px' }}>C:\CipherLab{'>'} <span className="animate-pulse">_</span></div>
          </>
        )}
      </div>
    </div>
  );
}

// --- Steganography Lab ---
function StegoApp() {
  const [mode, setMode] = useState<'hide' | 'extract'>('hide');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [output, setOutput] = useState('');
  const [logs, setLogs] = useState<string[]>(["C:\\CipherLab\\bin> stego.exe", "Steganography module loaded."]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}] ${msg}`]);
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setImageSrc(ev.target.result as string);
        addLog(`Loaded image: ${file.name}`);
        playSound('click');
      }
    };
    reader.readAsDataURL(file);
  };

  const processImage = () => {
    if (!imageSrc || !canvasRef.current) return;
    playSound('click');
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      if (mode === 'hide') {
        if (!message) {
          addLog("ERROR: No message to hide.");
          playSound('error');
          return;
        }
        addLog("Injecting payload into LSBs...");
        
        // Convert message to binary, append null terminator
        let binMsg = '';
        for (let i = 0; i < message.length; i++) {
          binMsg += message.charCodeAt(i).toString(2).padStart(8, '0');
        }
        binMsg += '00000000'; // Null terminator
        
        if (binMsg.length > (data.length / 4) * 3) {
          addLog("ERROR: Image too small for payload.");
          playSound('error');
          return;
        }

        let bitIndex = 0;
        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) { // R, G, B channels
            if (bitIndex < binMsg.length) {
              const bit = parseInt(binMsg[bitIndex], 10);
              data[i + j] = (data[i + j] & 254) | bit;
              bitIndex++;
            }
          }
          if (bitIndex >= binMsg.length) break;
        }

        ctx.putImageData(imgData, 0, 0);
        const newDataUrl = canvas.toDataURL('image/png');
        
        // Download the modified image
        const a = document.createElement('a');
        a.href = newDataUrl;
        a.download = 'classified_image.png';
        a.click();
        
        addLog("Success. Payload hidden. Image downloaded.");
        playSound('window');

      } else {
        addLog("Extracting LSBs from image...");
        
        let binMsg = '';
        let extracted = '';
        
        for (let i = 0; i < data.length; i += 4) {
          for (let j = 0; j < 3; j++) {
            binMsg += (data[i + j] & 1).toString();
            if (binMsg.length === 8) {
              const charCode = parseInt(binMsg, 2);
              if (charCode === 0) { // Null terminator hit
                setOutput(extracted);
                addLog("Extraction complete.");
                playSound('window');
                return;
              }
              extracted += String.fromCharCode(charCode);
              binMsg = '';
            }
          }
        }
        
        addLog("ERROR: No valid payload found.");
        playSound('error');
      }
    };
    img.src = imageSrc;
  };

  return (
    <div style={{ backgroundColor: '#c0c0c0', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', color: 'black', height: '100%', minHeight: '500px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #808080', paddingBottom: '12px' }}>
        <img src="/icons/stego.png" alt="stego" style={{ width: 48, height: 48, imageRendering: 'pixelated', filter: 'drop-shadow(2px 2px 0px rgba(0,0,0,0.5))' }} />
        <h2 style={{ fontFamily: 'var(--font-pixelify), monospace', fontSize: '28px', fontWeight: 'bold' }}>Steganography Module</h2>
      </div>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <label style={{ fontFamily: 'var(--font-pixelify)', fontSize: '18px', fontWeight: 'bold' }}>Mode:</label>
        <select 
          value={mode} 
          onChange={(e) => { setMode(e.target.value as any); playSound('click'); setOutput(''); }}
          style={{ fontFamily: 'var(--font-vt323)', fontSize: '18px', padding: '0 8px', height: '32px', minWidth: '200px', backgroundColor: 'white', color: 'black', border: '2px solid #808080' }}
        >
          <option value="hide">Hide Message (Encrypt)</option>
          <option value="extract">Extract Message (Decrypt)</option>
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontFamily: 'var(--font-pixelify), monospace', fontSize: '18px', fontWeight: 'bold' }}>Cover Image:</label>
        <input 
          type="file" 
          accept="image/png, image/jpeg" 
          onChange={handleImage}
          style={{ fontFamily: 'var(--font-vt323), monospace', fontSize: '18px' }}
        />
      </div>

      {mode === 'hide' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontFamily: 'var(--font-pixelify)', fontSize: '16px', fontWeight: 'bold' }}>Secret Payload:</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ fontFamily: 'var(--font-vt323)', fontSize: '20px', padding: '8px', height: '60px', resize: 'none', backgroundColor: 'white', color: 'black', border: '2px solid #808080', boxShadow: 'inset 2px 2px 0 #000' }}
          />
        </div>
      )}

      <button 
        onClick={processImage}
        disabled={!imageSrc || (mode === 'hide' && !message)}
        style={{ fontFamily: 'var(--font-pixelify), monospace', fontSize: '20px', padding: '8px 16px', border: '2px solid black', backgroundColor: (!imageSrc || (mode === 'hide' && !message)) ? '#808080' : '#dfdfdf', boxShadow: 'inset 1px 1px 0 #fff' }}
      >
        {mode === 'hide' ? 'INJECT PAYLOAD' : 'EXTRACT PAYLOAD'}
      </button>

      <div style={{ backgroundColor: '#000', color: '#0f0', padding: '12px', flex: 1, fontFamily: 'var(--font-vt323), monospace', fontSize: '18px', borderTop: '4px solid #808080', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {logs.map((log, i) => <div key={i}>{log}</div>)}
        {mode === 'extract' && output && (
          <div style={{ marginTop: '12px' }}>
            <span style={{ color: '#fff' }}>{'>>>'} EXTRACTED PAYLOAD: </span><br/>
            <span style={{ color: '#fff', backgroundColor: '#0000aa', padding: '4px', display: 'inline-block', marginTop: '4px' }}>{output}</span>
          </div>
        )}
        <div style={{ marginTop: '8px' }}>C:\CipherLab{'>'} <span className="animate-pulse">_</span></div>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
