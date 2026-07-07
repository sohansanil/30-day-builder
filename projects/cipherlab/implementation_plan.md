# Goal Description

Build **CipherLab OS v1.0**, a retro cryptography workstation. Instead of modern glassmorphism, we are leaning into a 90s "Secret Government OS" / Windows 95 aesthetic. Users will interact with cryptographic concepts through a simulated pixel-art desktop interface, complete with draggable windows, CRT scanlines, and pixel fonts.

## User Review Required

> [!IMPORTANT]
> **Aesthetics & Styling:** We are going all-in on the retro OS vibe. Vanilla CSS (no Tailwind) to build draggable windows with classic thick borders, pixel fonts (like VT323), and a subtle CRT noise/grid background.
> **Tech Stack:** Next.js (React) in a new folder: `projects/cipherlab`.
> **Are you ready to boot up CipherLab OS?** Give me the go-ahead and I'll run the `create-next-app` command!

## Proposed Architecture: The Retro Workstation

The app will load with a fake boot screen sequence, transitioning into a desktop interface.

### 1. 🖥️ The Desktop (The Lobby)
- **Boot Sequence:** A 2-3 second terminal-style boot screen (`Loading cryptographic modules...`).
- **The UI:** A dark navy grid background with subtle CRT noise.
- **Icons:** Pixel-art style desktop icons that open programs:
  - `cipher.exe` (Cipher Studio)
  - `crack.exe` (Attack Lab)
  - `stego.exe` (SecretInk)
  - *Easter Eggs:* `virus.exe`, `NSA_ACCESS`, `README.txt`.
- **Window Management:** Clicking an icon opens a draggable React component styled like an old-school window (thick borders, title bar, close button).

### 2. 🔐 cipher.exe (Cipher Studio)
*The interactive encryption playground.*
- **Features:** Caesar Shift and Vigenère ciphers.
- **Visuals:** Split view within the retro window. Sliders and inputs will use chunky, retro styling. Text animation when shifting ciphers.

### 3. ⚔️ crack.exe (Attack Lab)
*The password simulation lab.*
- **Features:** Real entropy calculation (bits of entropy).
- **Visuals:** Retro progress bars (`[█████░░░░]`). Readouts for crack times across Laptop, GPU Cluster, and Supercomputer. Easter egg if someone types `hunter2`.

### 4. 🖼️ stego.exe (SecretInk) (If time permits)
*The steganography lab.*
- **Features:** Drag-and-drop image upload to encode/decode hidden text via Canvas LSB.

## Implementation Phases

### Phase 1: Setup & The Desktop
- Initialize `create-next-app` without Tailwind.
- Import pixel fonts (e.g., VT323 from Google Fonts).
- Build the Boot Screen component.
- Build the Desktop component and a custom React hook for draggable windows.

### Phase 2: Building the "Executables"
- **cipher.exe:** Implement the Caesar/Vigenère logic and retro slider UI.
- **crack.exe:** Implement the entropy math and simulated attack visuals.

### Phase 3: Polish & Easter Eggs
- Add the CRT overlay effect (CSS radial gradient and repeating linear gradient).
- Add the easter egg popups (`virus.exe`, `NSA`).

## Phase 4: OS UX Polish (Bonus)

### 1. Window Z-Index (Bring to Front)
- **Approach**: Make `openWindows` order matter. The window at the end of the array gets the highest z-index. Clicking any part of a `RetroWindow` will remove it from its current position in `openWindows` and push it to the end.
- **Visuals**: The currently active (front-most) window gets a bright blue `#0000aa` title bar. Inactive windows get a greyed-out blue `#808080` title bar.

### 2. Taskbar & Minimize
- **Approach**: Add a `minimizedWindows` state array. 
- **Minimize Button**: The `-` button on the title bar will add the window ID to `minimizedWindows` (hiding it from the desktop).
- **Taskbar Items**: The bottom taskbar will render a pressed/unpressed retro button for every active window in `openWindows`. Clicking the taskbar button will remove it from `minimizedWindows` and bring it to the front.

### 3. Start Menu
- **Approach**: Add a `startMenuOpen` boolean state.
- **Menu UI**: Clicking the "Launch" button opens a classic 98-style grey popup menu above the taskbar. 
- **Shortcuts**: Includes clickable list items for the main apps (`cipher.exe`, `crack.exe`, `stego.exe`), the easter egg, and a "Restart System" option that re-triggers the boot sequence.

## User Review Required
> [!IMPORTANT]
> Let's confirm this plan for the UX additions before we start executing to ensure nothing breaks. Does this approach look good?
