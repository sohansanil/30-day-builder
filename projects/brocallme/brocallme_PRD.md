# PRD: NoFriends — The AI Friend Who Actually Calls You

**Author:** Sohan Aravind Sanil
**Type:** 30-Day Builder Challenge MVP
**Status:** Draft v1

> *"I don't have friends. So I built one."*

---

## Naming Options

"NoFriends" is funny but might read as a bit self-deprecating on LinkedIn without context. A few alternatives that keep the joke but land slightly differently:

| Name | Vibe |
|---|---|
| **NoFriends** | Blunt, meme-first, great hook line |
| **RingOfShame** | Leans into the "getting caught" humor |
| **FakeFriend** | Simple, says exactly what it is |
| **CallMeOut** | Pun on "call out" + literal calling — my personal favorite |
| **WakeUpBro** | Casual, Gen-Z coded, gym-bro energy |
| **Accountabilibuddy** | Silly, memorable, self-explanatory |

Recommendation: keep **NoFriends** as the working title (it's the strongest hook for the "wait, you built what?" reaction) but consider **CallMeOut** as the actual product name if you want something less bleak-sounding on a resume/portfolio line.

---

## 1. Product Vision

NoFriends is a joke that works because it's true: alarms don't guilt-trip you, but friends do. NoFriends simulates the experience of getting a real, unavoidable phone call from a personality of your choosing — Future You, your Indian Mom, a disappointed mentor — at the exact moment you were supposed to start behaving like an adult. It's not a calendar app. It's social pressure, weaponized, on a schedule you set for yourself.

---

## 2. Target Users

- **College students** who set 5 alarms and still oversleep before exams (this is you, and it is universally relatable to every MIT Manipal / any-college student).
- **Gym-goers** who need someone to ask "did you actually go?"
- **Procrastinators with executive-function friction** — people who know what they need to do but need an external trigger, not another silent notification.
- **LinkedIn scrollers** who will watch a 20-second demo video, laugh, and share it — this is really the "user" that matters most for a 30-day builder challenge project. The demo audience *is* a target user in the sense that virality is a feature, not a side effect.

---

## 3. Core User Problem

Alarms and reminder apps fail for one structural reason: **they carry no social cost.** Snoozing an alarm has zero consequence. Ignoring a Slack reminder has zero consequence. But not picking up when "Indian Mom" is calling, or picking up and having "Disappointed Mentor" ask why you didn't finish the assignment — that has a felt cost, even though you know, rationally, it's just an app. NoFriends manufactures that felt cost on demand.

---

## 4. MVP Features

Scoped for one developer, a few days, zero telecom budget:

1. **Reminder creation** — time, personality, custom message/context.
2. **Personality picker** — 5–7 preset personas with distinct voice lines and tone.
3. **Scheduled trigger** — local notification/timer that fires at the set time.
4. **Fake incoming call screen** — fullscreen, ringtone, vibration, Accept/Decline — visually indistinguishable from a real call.
5. **Active call screen** — plays back the message (TTS or pre-recorded), simple "call" UI with duration timer for realism.
6. **Basic history log** — did you accept or decline, and when (this is your best comedic goldmine for demo footage — "declined 14 times").

That's it. No accounts, no push infra, no real telephony.

---

## 5. User Flow

1. **Onboarding** → quick, funny 2-screen intro explaining the concept ("You have no friends. We fixed that.").
2. **Create Reminder** → user sets time + selects personality + types custom message/context.
3. **Confirmation** → "Future You will call you at 5:00 AM. Good luck."
4. **[Time passes]**
5. **Incoming Call Screen** → phone vibrates, ringtone plays, fullscreen "FUTURE YOU is calling..." UI appears exactly like a real call.
6. **User taps Accept or Decline.**
7. **If Accepted** → Active Call screen plays the audio message, real-time-feeling call UI (timer ticking up, mute/speaker icons that don't need to do anything functional).
8. **If Declined** → optional: a follow-up notification/text like "Wow. Okay. Noted." for comedic effect.
9. **History Screen** → log of past reminders and whether the user actually answered.

---

## 6. Technical Architecture

Kept intentionally minimal — no enterprise infra, no telecom stack:

- **Frontend:** React Native or a PWA (your call) — needs to control screen wake, fullscreen overlays, and audio playback reliably. If you want the fastest path, a PWA with the Notifications API + a custom fullscreen "incoming call" route can get you 90% of the effect without app-store friction.
- **Backend:** Lightweight — a small FastAPI or Node service just to store reminders and personas if you want cross-device persistence. For a true MVP, this can even be **fully client-side** (local storage/IndexedDB) with zero backend, since there's no real calling to coordinate.
- **Scheduling:** Local device notifications (`setTimeout`/service worker alarms for web, or local notification APIs for a native shell) fire at the reminder time — no server-side cron needed for MVP.
- **Fake incoming call UI:** A custom fullscreen component that mimics native call UI (large caller name, Accept/Decline buttons, ringtone loop) — this is 100% frontend, no telephony APIs involved.
- **Audio system:** Pre-recorded voice lines per personality (fastest, funniest, most reliable) OR a TTS API (e.g., ElevenLabs, or even a Claude/Gemini + browser TTS combo) if you want dynamic message generation from the custom text the user typed in.

The entire "call" is theater — a notification, a fullscreen overlay, and an audio file. No Twilio, no SIP, no phone-network involvement anywhere in the MVP.

---

## 7. Screens Required

1. Onboarding / concept intro
2. Create Reminder (time + personality + message)
3. Personality Selection
4. Confirmation screen
5. Incoming Call screen (the hero screen — this is what goes on LinkedIn)
6. Active Call screen
7. History / Past Calls log

---

## 8. Demo Strategy

The entire value of this project, for a 30-day builder challenge, is the **10–20 second LinkedIn clip**, so design backward from that:

- Film it like a real moment: you asleep/at your desk, phone actually rings and vibrates (use a real device, not simulator), fullscreen "Indian Mom is calling..." appears exactly like a native call.
- Cut to you answering, and let the voice line play in full — the punchline **is** the audio, so don't cut away from it.
- Overlay minimal on-screen text — something like *"So I built an AI friend who calls me and yells at me"* as a hook caption, then let the video speak for itself.
- Show the History screen briefly at the end with a funny stat (e.g., "Declined: 9. Accepted: 2.") — this is a great comedic closing beat and also subtly shows the product has more than one screen.
- Keep total demo under 30 seconds. The "wait, you built what?" reaction depends entirely on pacing, not feature completeness.

---

## 9. Future Features (Post-MVP / "V2 with real calls")

If you ever extend this beyond the challenge:

- **Real phone calls via Twilio** (or Exotel if you want India-friendly pricing) — actually ring the user's real phone number, not just an in-app screen.
- **Dynamic AI-generated scripts** — feed the day's calendar/todo context into an LLM so the "call" references your actual tasks, not just a static message.
- **Voice cloning** — let users record a friend's or parent's voice (with consent) so the call is genuinely theirs.
- **Group accountability** — a call that also texts your friend group if you decline, so the social pressure becomes real, not simulated.
- **Smart escalation** — if you don't answer the first call, a second, angrier call follows 5 minutes later.

---

## 10. Build Scope

| Version | Scope | Est. Time |
|---|---|---|
| **Easiest MVP** | Single personality, hardcoded reminder time, fake incoming call screen, one pre-recorded audio line, no persistence. Just enough for one great demo clip. | ~1 day |
| **3-Day Version** | Full create-reminder flow, 3–4 personalities, local notifications actually firing at user-set times, working Accept/Decline, one audio line per personality. | 3 days |
| **7-Day Version** | All 7 screens, 5–7 personalities with distinct voice lines, history log with stats, polish on the incoming-call UI (real ringtone, haptics, animations), optional TTS for custom messages. | 7 days |

For a builder-challenge project, the **3-day version** is the sweet spot: complete enough to feel like a real product, small enough to actually ship on schedule.
