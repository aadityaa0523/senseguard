# SenseGuard

**Multimodal on-device medication safety & adherence — built for the iQOO Hackathon 2026.**

> "The phone isn't running SenseGuard — the phone is SenseGuard."

Team **Cognivista**.

---

## What this is, honestly

This repo is the **pre-hardware prototype stage**: built before receiving the loaner iQOO device, to prove out the sense → identify → verify → guide → log loop end-to-end using real phone/browser sensor APIs, ahead of the native Android build.

It is not a mockup. Every screen is a real, running web app — open it on a phone and the camera, motion sensor, GPS, barcode scanner, voice output, and haptics are genuinely live. It is also not the finished product: the OCR/vision "identify" step is simulated (you confirm the medicine from a short list) because a real OCR model can't run in this hosting sandbox, and a couple of sensors (barometer, raw GNSS signal quality) have no browser API at all — both gaps are labeled in the app itself rather than hidden, and both close in the native build once hardware is available. See [`docs/problem-statement.md`](docs/problem-statement.md) §46 for the hardware validation checklist that runs at device handover.

## Live demo

Open on a phone browser (Chrome/Android gets the fullest API support; Safari/iOS works, with an extra motion-permission tap):

- **[Prototype (public, no login)](https://claude.ai/code/artifact/933d857f-17f3-41f5-9525-c3662e80d6c2)** — the judge-facing build.
- **[Team rehearsal build (org-only)](https://claude.ai/code/artifact/81c6d8e0-47e9-4c3b-be3e-b1b3db622e80)** — identical, plus a real shared "community safety signal" counter across everyone's practice scans.

Source for both lives in [`prototype/`](prototype/).

## Demo video

[`demo/senseguard_demo.mp4`](demo/senseguard_demo.mp4) — a real continuous screen recording (not stitched screenshots) of the actual app, narrated, walking through both the "take now" and "wrong/suspicious packaging" scenarios. See [`demo-production/`](demo-production/) for how it was produced (Chrome DevTools screencast capture + synced narration), if useful for future recordings.

## What's real vs. simulated

| Capability | Status |
|---|---|
| Rear camera capture | **Real** |
| IMU-based "hold steady" stability gate | **Real** |
| Device orientation / heading (magnetometer) | **Real** |
| GPS-accuracy-based location confidence | **Real** |
| Barcode / QR detection (`BarcodeDetector`) | **Real** |
| Voice output (TTS) + haptics | **Real** |
| Verification & decision engine | **Real** (deterministic rules, per §29) |
| Dose logging, caregiver missed-dose alerts | **Real** (local, per-device) |
| Medicine identification (OCR/vision) | **Simulated** — manual confirm from a short list; production uses on-device OCR/vision |
| Barometer | **Not exposed by any browser** — reads via native `SensorManager` (`TYPE_PRESSURE`) in the Android build |
| Raw GNSS signal quality (C/N₀) | **Approximated** via the browser's GPS accuracy figure — the same "don't blindly trust the coordinate" idea, done with a real signal browsers do expose |
| Community hotspot analytics | **Real local count** (rehearsal build only); production aggregates anonymously across devices |
| Clinician voice capture → structured instruction | **Not built** — planned next |

## Repo layout

```
prototype/           the actual app (open on a phone)
  senseguard-app.html          judge-facing build
  senseguard-team-build.html   + real shared counter (needs Claude artifact hosting)
docs/
  problem-statement.md         full problem statement & 30-hour build plan
  iQOO-10-Slide-Presentation.pptx
demo/
  senseguard_demo.mp4          narrated screen recording
  screenshots/                 key screens, real captures
demo-production/      scripts used to produce the demo video (no API keys included)
```

## Running locally

Camera, geolocation, and barcode APIs all require a secure context — opening the HTML file directly (`file://`) will not grant them. Serve it instead:

```bash
npx serve prototype
# then open the printed http://localhost:... URL on a phone on the same network
```

## iQOO Hackathon alignment

| Score category | How SenseGuard addresses it |
|---|---|
| End product quality (30%) | One complete, reliable scan → verify → guide → log loop |
| Novelty & impact (20%) | Medication safety + multimodal sensor fusion + community safety signal |
| Creative phone use (15%) | Camera, IMU, magnetometer, GNSS, barcode, voice, haptics — combined, not decorative |
| Technical depth (15%) | Deterministic sensor-fusion decision engine, explainable evidence table, honest capability detection |
| Office Kit usage (10%) | Planned for the native build phase (phone-first architecture, laptop for tooling only) |
| Demo & presentation (10%) | Fast, physical, phone-first — this video and live prototype |

## Safety boundaries

SenseGuard is a safety and adherence **assistant**, not an autonomous prescriber. It never invents contraindications, asserts pharmaceutical authenticity with certainty, or overrides a clinician. When uncertain, it says so. Full detail in [`docs/problem-statement.md`](docs/problem-statement.md) §40.

## What's next

Native Android build (Kotlin, Jetpack Compose, CameraX, Room, on-device OCR/vision) once the loaner iQOO device is available — see the 30-hour execution plan in the problem statement.
