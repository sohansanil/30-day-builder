# IsSheMadAtMe.com 🕵️‍♀️🔍

> **The Relationship Forensics Lab.**  
> *Upload a screenshot. Receive a forensic analysis. Learn whether you need to panic, apologize, or simply put the phone down.*

IsSheMadAtMe.com is a satirical AI web application that analyzes text message screenshots. Instead of acting like an empathetic relationship therapist, the AI acts like a ruthless government investigator conducting a high-clearance audit of your dating life.

## Features
* **Multimodal Image Analysis:** Upload chat screenshots (iOS, WhatsApp, Instagram) to be processed by the Gemini Vision API.
* **Absurd Forensic Reports:** Generates deadpan, highly structured intelligence reports complete with case numbers, severity matrices, and actionable directives.
* **Automated Share Cards:** Renders the resulting investigation into a downloadable, screenshot-ready image via `html-to-image` for social sharing.
* **Resilient AI Pipeline:** Features an automated multi-model fallback chain to ensure high availability even when primary LLM endpoints experience capacity limits.

## Example Findings
When evidence is submitted, the lab generates findings such as:
* **EMOJI EXTINCTION EVENT:** "Three emojis were observed on Monday. Zero were observed on Thursday. This represents a 100% decline in emoji activity."
* **REPLY-TO-EFFORT IMBALANCE:** "A 212-word message received the response 'yeah'. The counterparty appears to be operating under severe character limits."
* **PUNCTUATION ESCALATION:** "The message concludes with a period. The sudden appearance of grammar requires monitoring."

## Tech Stack
* **Frontend:** Vanilla JS, HTML, CSS (Custom CSS variable design system), Vite
* **Backend:** Vercel Serverless Functions (`/api/analyze`)
* **AI:** Google Gemini API (3.5-flash, 2.5-flash)

## Disclaimer
*For entertainment purposes only. This office is not responsible for relationship outcomes, blown situationships, or the consequences of double-texting.*
