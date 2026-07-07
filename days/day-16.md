# Day 16

Project: **FoldDeck Pro**

Goal:
To explore hardware-software bridges by transforming a standard MacBook into a physical DJ controller. I wanted to see if I could use the laptop's physical lid angle sensor to manipulate real-time audio on the web.

What I Built:
I built **FoldDeck Pro**, an interactive web-based DJ platform.
- **Backend:** A Python WebSocket server utilizing the `pybooklid` library to read the MacBook lid sensor data in real time.
- **Frontend:** A sleek web interface built with vanilla JS and CSS that visualizes waveforms on an HTML canvas.
- **Audio Engine:** Used the Web Audio API to dynamically apply lowpass filters, pitch shifting, and playback rate changes based on the lid's precise angle. Closing the lid muffles the music, and snapping it quickly triggers a "scratching" effect.

Challenges:
- Handling the ultra-low latency requirements of reading hardware sensors and streaming it to a browser without crashing the WebSocket.
- Mapping arbitrary lid angles (0 to 120 degrees) into a seamless audio experience using the Web Audio API's `BiquadFilterNode` and `playbackRate`.
- Since it relies on local MacBook hardware, the project can't be deployed to a standard cloud provider like Vercel for the public to use interactively.

Key Learnings:
- **Hardware Integrations:** Bridging local hardware (Python/Sensors) to web applications via WebSockets.
- **Web Audio API:** How to programmatically manipulate audio frequencies and playback rates in real time.
- **Latency & Streaming:** How to optimize high-frequency data streams for smooth UI animations.

Tech Stack:
- Python (`pybooklid`, `websockets`)
- JavaScript (Web Audio API, Canvas API)
- HTML & CSS (CSS variables for dynamic theme switching)

Links:
- [GitHub Repository](../projects/FoldDeck)
- *Live Demo: Not available (requires local hardware execution)*
