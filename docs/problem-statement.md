# SenseGuard — iQOO Hackathon 2026 Problem Statement & Build Plan

## Working Title
**SenseGuard — Multimodal On-Device Medication Safety & Adherence**

## One-Line Pitch
> **SenseGuard turns the iQOO phone itself into a medication safety sensor: it sees the medicine, understands the user's physical context, verifies the dose, listens to the clinician, and tells the patient what to do — on-device.**

---

# 1. Why SenseGuard is Designed This Way for iQOO

The iQOO Hackathon 2026 is explicitly **phone-first**. The official site states that teams build on iQOO hardware, that local/open-source models with the phone in the loop earn brownie points, and that **25% of the rubric is device-data based through HackTracker**: 15% for creative phone use and 10% for Office Kit usage.

The jury-scored categories are:

| Category | Weight | What SenseGuard should demonstrate |
|---|---:|---|
| End product quality | 30% | A complete, reliable medication-safety loop |
| Novelty & impact | 20% | Medication + multimodal sensing + community safety |
| HackTracker: creative phone use | 15% | Camera, voice, on-device AI, real sensor fusion |
| Technical depth | 15% | Sensor fusion, local inference, robust architecture |
| HackTracker: Office Kit | 10% | Real phone ↔ laptop workflow |
| Demo & presentation | 10% | A fast, visual, physical-world demo on the iQOO phone |

**Design consequence:** SenseGuard must not be an ordinary healthcare app that happens to run on an iQOO phone. The **phone is the sensing and inference platform** and the healthcare workflow is the application built around it.

Official references:
- https://iqoo.reskilll.com/
- https://iqoo.reskilll.com/problems
- https://iqoo.reskilll.com/guide

---

# 2. Problem Statement

Medication errors rarely happen because a patient has no information. They happen because the information is fragmented across the **physical medicine pack, prescription, clinician conversation, time, place, and patient behavior**.

A patient may have to answer several questions:

1. **What medicine am I holding?**
2. **What dose is it?**
3. **Has it expired?**
4. **Does this pack look consistent with the expected medicine?**
5. **Is this the medicine I am supposed to take now?**
6. **Did the clinician say anything different from what I am about to take?**
7. **Was the dose actually taken?**
8. **Can the caregiver know that a scheduled dose was missed?**

Existing medication apps often depend on manual entry, static reminders, or cloud-heavy workflows. They do not naturally understand the **physical medicine in the user's hand** or the surrounding context in which the interaction is happening.

SenseGuard addresses this by making the phone a **multimodal physical-world interface**.

---

# 3. Core Insight

## The box does not need to be understood.

The entire medicine box can be messy, mixed, and unorganized.

SenseGuard only needs to understand:

> **the medicine in the user's hand right now.**

This removes the hardest computer-vision problem — multi-item cluttered-box recognition — and replaces it with a controlled, single-object interaction.

### Core interaction

**Pick up any strip/bottle → show it to the phone → phone stabilizes the capture → identifies it → checks it → decides whether it is due → speaks/shows the action → logs the event.**

No sorting.

No pill organizer grid.

No need to inventory the entire box.

---

# 4. Product Vision

## SenseGuard = SENSE → CONTEXTUALIZE → VERIFY → ACT

### SENSE
The iQOO phone observes the physical world using camera, microphone, GNSS, IMU, magnetometer, barometer and GNSS signal-quality information.

### CONTEXTUALIZE
Sensor fusion estimates the interaction state: where the user is, whether the device is moving, whether the phone is stably aimed at the medicine, what orientation it is in, and whether location data appears trustworthy.

### VERIFY
OCR, packaging vision, identifiers, medication schedule and on-device AI are combined into a decision.

### ACT
The phone provides visual, spoken and haptic feedback and records the medication event.

---

# 5. Sensor-First Design

The supplied sensor list is treated as a first-class requirement for the concept:

- GNSS
- IMU
- Magnetometer
- Barometer
- Camera
- C/N₀ (GNSS carrier-to-noise density / signal-quality information)

The iQOO hackathon site also explicitly emphasizes camera, voice, on-device AI, real hardware use and Office Kit. SenseGuard therefore combines the supplied sensor set with microphone, speaker, display, haptics and on-device AI as available platform capabilities.

> **Important implementation rule:** exact sensors/APIs on the actual loaner iQOO model must be validated at device handover. C/N₀ is a GNSS signal-quality metric rather than a standalone physical sensor, so the implementation should use whatever GNSS measurements the loaner device exposes.

---

# 6. Sensor → Job → Demo Moment

| Component | Role in SenseGuard | Why it matters | What judges see |
|---|---|---|---|
| **Rear camera** | OCR + package vision | Identifies medicine in hand | Scan strip → medicine name/dose/expiry |
| **IMU** | Motion, pickup, orientation, stability | Prevents blurry/poor capture and triggers interaction states | Phone says “Hold steady” until motion settles |
| **Magnetometer** | Heading/orientation support | Complements IMU for spatial guidance | AR/context marker stays orientation-aware |
| **GNSS** | Approximate location/context | Distinguishes home/pharmacy/clinic workflows and enables anonymized hotspot intelligence | “Pharmacy verification mode” |
| **C/N₀ / GNSS quality** | Location-confidence signal | Prevents blindly trusting unreliable GNSS | “Location confidence: low” when signal is inconsistent |
| **Barometer** | Relative elevation/environment context | Adds indoor/floor-change context | Location/context engine shows floor/elevation change |
| **Front camera** | Speaker/face context for accessibility | Links captions to the person speaking | Clinician caption anchored to speaker |
| **Microphone** | Speech capture | Understands clinician/patient communication | Live instruction transcription |
| **On-device AI / NPU** | Sensor fusion + reasoning | Converts raw observations into one decision | “Metformin 500 mg — due now” |
| **Display** | Visual guidance / contextual overlay | Makes the decision instantly understandable | Green/red state + highlighted medicine |
| **Speaker** | Spoken instructions | Helps low-literacy and hands-busy users | “This dose is due now.” |
| **Haptics** | Immediate physical feedback | Reinforces warnings without relying on vision/audio | Distinct alert when medicine is wrong/not due |
| **Office Kit** | Phone ↔ laptop bridge | Directly aligns with a scored hackathon capability | Phone data/workflow visible on laptop |

---

# 7. The Main User Experience

## Step 1 — Pick up

The phone is on a table. The user picks it up.

**IMU detects movement** and changes the app from passive state to inspection-ready state.

Example:

> **Show me your medicine.**

This removes the need to open multiple menus.

---

## Step 2 — Aim at one medicine

The user points the rear camera at any strip/bottle.

The app uses the camera feed to locate the package.

At the same time, IMU data estimates whether the phone is still moving.

If the image is unstable:

> **Hold steady**

Once the phone is stable enough, the application chooses a high-quality frame for OCR/vision.

---

## Step 3 — Identify

The camera extracts:

- medicine name
- strength/dosage
- manufacturer where readable
- batch/lot where readable
- expiry date
- barcode/QR content where present

Example output:

> **Metformin 500 mg**  
> **Expiry: Dec 2026**

The OCR result is normalized into a structured local record.

---

# 8. Verification Engine

SenseGuard should not claim that a camera can mathematically prove a medicine is genuine.

Instead, it performs a **screening and consistency check** using multiple signals.

## Evidence sources

### A. OCR identity

Does the visible medicine name, strength and manufacturer match the expected record?

### B. Packaging signature

Does the visible packaging resemble the known reference pattern?

Potential features include:

- logo/brand placement
- typography regions
- colour blocks
- geometric layout
- print pattern / hologram region
- visible tamper cues

### C. Barcode/QR/NFC where supported

Use machine-readable identifiers as an additional identity signal when the device and package support them.

### D. Expiry

Expired medicine should produce a separate safety state.

### E. Prescription context

Even if the package is recognized, the system must ask:

> **Is this the medicine expected for this user and this dose window?**

---

# 9. Evidence Fusion

Instead of a single binary “real/fake” classifier, SenseGuard should produce a structured confidence result.

Example:

```text
OCR identity              PASS
Packaging match           PASS
Identifier match          PASS
Expiry                    PASS
Prescription match       PASS
Location confidence       HIGH
--------------------------------
Overall action            TAKE NOW
```

For an abnormal case:

```text
OCR identity              PASS
Packaging match          WARNING
Identifier match          UNKNOWN
Expiry                    PASS
Prescription match       PASS
--------------------------------
Overall action            DO NOT RELY ON VISUAL CHECK ALONE
```

This makes the system more defensible and lets the UI explain *why* it produced a warning.

---

# 10. Medication Decision Engine

The core product value is not OCR. OCR is just the input.

After identifying a medicine, SenseGuard compares it with a local medication schedule.

## Example A — correct medicine, correct time

> **Metformin 500 mg**  
> **Scheduled: 8:00 AM**  
> **Status: DUE NOW**

Voice:

> “Metformin 500 milligrams is due now.”

The app then records the event after user confirmation/interaction.

## Example B — correct medicine, wrong time

> **Metformin 500 mg**  
> **Next dose: 8:00 PM**  
> **Status: NOT DUE YET**

Voice:

> “This medicine is scheduled for tonight.”

## Example C — medicine not in current schedule

> **WARNING**  
> **This medicine is not in today's scheduled medication list.**

## Example D — expired

> **DO NOT TAKE BASED ON THIS APP CHECK**  
> **Expiry detected: Dec 2025**

The app should direct the user to confirm with a pharmacist/clinician rather than pretending to provide independent medical authorization.

---

# 11. IMU as a First-Class Feature

The IMU should not be a line in the architecture diagram only.

## IMU Feature 1 — Smart capture

```text
Phone moving
    ↓
IMU detects motion
    ↓
Camera frames remain unstable
    ↓
Prompt: Hold steady
    ↓
IMU variance falls below threshold
    ↓
Capture best frame
```

### Benefit
The motion sensor improves the reliability of the camera pipeline.

## IMU Feature 2 — Pickup-aware interaction

```text
Phone resting
    ↓
User picks it up
    ↓
Motion pattern detected
    ↓
SenseGuard becomes inspection-ready
```

### Benefit
The phone can respond to physical interaction instead of requiring extra taps.

## IMU Feature 3 — Physical-state awareness

The system can distinguish broad states such as:

- stationary on table
- handheld and moving
- handheld and stable

This can drive when to scan, when to show prompts and when to deliver haptic feedback.

---

# 12. Magnetometer as a First-Class Feature

The magnetometer complements IMU orientation estimates.

## Primary use
Provide heading/orientation information to improve the spatial layer.

Potential output:

> camera = “where is the medicine?”  
> IMU + magnetometer = “how is the phone oriented?”

This enables orientation-aware visual guidance and more stable AR/contextual overlays.

## Demo moment

The user rotates the phone around the medicine.

The visual marker remains aligned with the detected object instead of behaving like a static sticker.

The objective is not to build elaborate AR. The objective is to demonstrate **sensor-assisted spatial understanding**.

---

# 13. GNSS as a First-Class Feature

GNSS is not used to “track the patient.”

It is used for **event context** and **anonymized population-level intelligence**.

## Mode 1 — Context-aware workflow

The app can classify broad contexts using location:

### Pharmacy context

> **Verification mode**  
> “Check medicine before purchase.”

### Home context

> **Adherence mode**  
> “Scheduled dose due.”

### Clinic/hospital context

> **Consultation mode**  
> “Capture clinician instructions.”

Exact geofencing should be conservative and privacy-preserving.

## Mode 2 — Anonymized counterfeit intelligence

Each verification can contribute an anonymized event:

```text
medicine_id / package signature
verification result
approximate location bucket
coarse timestamp
```

Repeated suspicious events can create geographic clusters.

Example dashboard insight:

> **12 suspicious packaging events detected in one area across 4 independent scans.**

This transforms SenseGuard from a single-user utility into a potential **community medicine-safety network**.

---

# 14. C/N₀ — Location Integrity Layer

C/N₀ should be treated as **GNSS signal-quality evidence**, not as an independent sensor.

## Why use it?

A location should not automatically be trusted just because a GNSS API returns coordinates.

SenseGuard can compare:

- GNSS position
- GNSS signal-quality measurements
- IMU motion
- magnetometer orientation/environment
- time consistency

## Example inconsistency

```text
GNSS says: moved 4 km
IMU says: almost no movement
C/N₀: signal quality changed sharply
```

SenseGuard can produce:

> **Location confidence: LOW**

and avoid using that location for a high-confidence context decision.

## Positioning of the feature

Say:

> **“We detect inconsistent or low-confidence location signals before using location-aware decisions.”**

Do **not** claim:

> “We provide guaranteed anti-spoofing.”

The former is a realistic engineering objective.

---

# 15. Barometer as a Context Sensor

The barometer should be used for **relative elevation/context**, not as a fake medicine sensor.

Potential uses:

- detect meaningful elevation change
- supplement indoor floor/context estimation
- help distinguish “same place, different level” states
- enrich location confidence when GPS is weak indoors

Example:

```text
GNSS → approximate horizontal position
Barometer → relative elevation change
IMU → movement pattern
        ↓
Physical context estimate
```

A judge should understand the role as:

> **“GNSS tells us approximately where; the barometer can tell us that the user changed elevation.”**

This is especially useful when the GPS coordinate hardly changes but the user moves vertically inside a building.

---

# 16. Voice + Front Camera: Clinician Communication

This is Layer 2 of the main system but should still share the same sensing architecture.

## Clinician interaction

A pharmacist/doctor explains the medication.

### Microphone
Captures speech.

### Front camera
Tracks the active speaker / face region for visual anchoring.

### On-device AI
Converts the explanation into structured medication instructions.

Example:

```text
METFORMIN
500 mg
1 tablet
AFTER BREAKFAST
```

The instruction can then be linked to the actual medicine scanned by the rear camera.

This creates a closed loop:

**Clinician instruction → structured local record → physical medicine scan → adherence check**

For hearing-impaired users, captions can be visually anchored to the active speaker.

---

# 17. On-Device AI / NPU Role

The local/open-source model should be at the **core of the reasoning**, with the iQOO phone kept in the loop as required by the hackathon's phone-first approach.

## Model choice

- **Primary: Gemma 3n E2B**, served via Google's **LiteRT-LM** runtime (the same Android on-device stack as MediaPipe LLM Inference API). Purpose-built for phone NPUs — Google reports up to 10-12x speedup over CPU/GPU on this model, ~2.6 GB footprint. Chosen because the rest of the stack (CameraX, Jetpack Compose, Android SensorManager) is already Google's own Android ecosystem, so the on-device LLM runtime is a natural fit rather than a bolt-on.
- **Fallback: Qwen3 0.6B** — smaller footprint, GQA-based memory efficiency, if the loaner device's NPU/RAM can't comfortably host Gemma 3n. Validate both against the actual loaner hardware in the section 46 checklist before committing.
- Either model is used only to **explain and phrase** the decision (§29's deterministic rules), never to decide it — a hard safety rule stays the same regardless of which model is picked.

## AI jobs

### 1. OCR normalization

Turn messy OCR into:

```json
{
  "medicine": "Metformin",
  "strength": "500 mg",
  "expiry": "2026-12",
  "manufacturer": "..."
}
```

### 2. Grounded medication reasoning

Compare the recognized medicine with the local schedule.

### 3. Context fusion

Combine structured signals such as:

- camera confidence
- OCR confidence
- packaging score
- GNSS context
- GNSS quality
- IMU state
- barometric change
- current time
- prescription state

### 4. Natural-language response

Generate concise, grounded spoken/UI guidance.

### 5. Caregiver summary

Convert raw adherence events into a simple summary.

---

# 18. Recommended AI Architecture

```text
                    iQOO PHONE
                        │
             ┌──────────┴──────────┐
             │                     │
        SEMANTIC SENSING      PHYSICAL SENSING
             │                     │
     Camera / Mic / Front    GNSS / IMU / Mag /
           Camera              Barometer / C/N₀
             │                     │
             └──────────┬──────────┘
                        ↓
              SENSOR FUSION LAYER
                        ↓
               LOCAL STRUCTURED STATE
                        ↓
              ON-DEVICE AI / NPU
                        ↓
          MEDICATION DECISION ENGINE
                        ↓
             ┌──────────┼──────────┐
             ↓          ↓          ↓
          VERIFY      GUIDE       LOG
             │          │          │
             └──────────┼──────────┘
                        ↓
               Screen + Voice + Haptics
                        ↓
                 Caregiver / Analytics
```

---

# 19. Data Model

A minimal local medication record should contain:

```text
MedicationRecord
- id
- medicine_name
- strength
- manufacturer
- prescription_frequency
- dose_quantity
- scheduled_times[]
- expiry_date
- reference_packaging_signature
```

A verification event:

```text
VerificationEvent
- medicine_id
- detected_name
- detected_strength
- detected_expiry
- packaging_score
- identifier_result
- schedule_result
- location_bucket
- location_confidence
- scan_time
- action
```

An adherence event:

```text
DoseEvent
- medicine_id
- scheduled_time
- scan_time
- status
```

Suggested statuses:

- DUE
- TAKEN
- NOT_DUE
- MISSED
- EXPIRED
- WARNING
- UNKNOWN

---

# 20. Privacy Architecture

Healthcare data is sensitive, so privacy should be built into the architecture.

## Default principles

- Process medicine images locally wherever practical.
- Prefer local/open-source inference for private reasoning.
- Do not send raw medicine images to a cloud model by default.
- Store only the minimum required medication data.
- Keep caregiver sharing opt-in.
- Use coarse location buckets for community analytics rather than precise patient traces.
- Separate personal adherence records from anonymized population-level hotspot statistics.

### Positioning line

> **“The patient's medicine data stays local by default; only explicitly shared, privacy-preserving signals leave the device.”**

---

# 21. Caregiver Layer

Keep caregiver functionality simple.

Do not build a giant family-management platform.

The caregiver should receive meaningful states such as:

> **Metformin 500 mg — 8:00 PM dose missed**

or:

> **3 consecutive scheduled doses completed**

This is enough to prove the adherence use case without consuming hackathon build time.

---

# 22. What Makes SenseGuard Novel

The innovation is not “OCR medicine packaging.”

The innovation is the **combination of physical-world sensing and medication reasoning**.

SenseGuard connects:

1. **What is in the user's hand** — camera
2. **How the phone is being used** — IMU
3. **Which way / orientation the phone is in** — magnetometer + IMU
4. **Where the event is happening** — GNSS
5. **Whether the GNSS context is trustworthy** — C/N₀ + movement consistency
6. **Whether elevation/context changed** — barometer
7. **What the clinician said** — microphone + front camera
8. **What the user should do** — on-device AI
9. **Whether the event was completed** — adherence log

The phone is therefore not simply the screen. It is the **sensor, processor, interpreter and feedback device**.

---

# 23. Primary Demo Scenario

## Scene A — Pharmacy

The phone is in the user's hand.

1. GNSS places the device in pharmacy context.
2. IMU detects pickup and movement.
3. User points camera toward a medicine.
4. IMU detects that the phone is stable.
5. Camera captures the best frame.
6. OCR identifies the medicine.
7. Packaging vision compares against a reference signature.
8. Barcode/QR is checked if present.
9. C/N₀ contributes to location confidence.
10. On-device AI fuses the results.
11. Screen shows:

> **METFORMIN 500 mg**  
> **PACKAGING: MATCH**  
> **EXPIRY: DEC 2026**  
> **STATUS: PRESCRIPTION MATCH**

12. Phone says:

> **“This matches the medicine saved in your prescription.”**

---

# 24. Primary Demo Scenario — Adherence

At home, the user scans the same medicine.

The context engine changes to home/adherence mode.

Output:

> **Metformin 500 mg**  
> **Due now**

Voice:

> “Your scheduled Metformin dose is due now.”

The user confirms/acts.

The system logs:

```text
Metformin 500 mg
Scheduled: 08:00
Recorded: 08:02
Status: TAKEN
```

---

# 25. Wrong-Medicine Demo

The user picks up another medicine from a messy box.

No sorting.

No manual entry.

Camera identifies it.

AI compares it with the schedule.

The phone responds:

> 🔴 **NOT DUE**  
> **This medicine is scheduled for tonight.**

Phone haptics reinforce the warning.

This should be one of the strongest moments of the demo because the audience immediately understands the value.

---

# 26. Suspicious-Packaging Demo

Use a controlled reference/demo dataset.

The package is intentionally different from the known signature.

Output:

> ⚠️ **PACKAGING MISMATCH**  
> **Do not rely on visual verification alone. Consult a pharmacist/authorized source.**

The system logs the anonymous event.

If the same type of anomaly appears repeatedly in a coarse geographic area, the analytics layer can show a cluster.

---

# 27. Clinician Communication Demo

A pharmacist says:

> “Take one tablet after breakfast.”

The microphone captures it.

The front camera tracks the speaker.

The app displays:

> **1 TABLET**  
> **AFTER BREAKFAST**

SenseGuard converts the instruction into a local medication rule.

The patient later scans the medicine with the rear camera.

The phone verifies that the physical medicine aligns with the recorded instruction.

This demonstrates that the same phone can connect **speech → medicine → adherence**.

---

# 28. Physical Context Engine

A major technical module should be presented as:

## **SenseFusion Context Engine**

Inputs:

```text
GNSS position
GNSS C/N₀ / signal quality
IMU motion + orientation
Magnetometer heading
Barometric pressure / relative altitude
Camera object state
Microphone interaction state
Current time
```

Outputs:

```text
Physical state:
  resting / handheld / moving / stable

Location state:
  home-like / pharmacy-like / clinic-like / unknown

Location confidence:
  high / medium / low

Elevation state:
  unchanged / changed

Interaction state:
  scanning / speaking / waiting / confirming
```

The medication decision engine consumes this structured state instead of directly reasoning over raw sensor noise.

---

# 29. Technical Depth: Sensor Fusion Logic

A simplified implementation can use deterministic rules first and introduce an on-device model where appropriate.

Example:

```text
capture_ready =
    camera_has_package
    AND imu_motion_low
    AND frame_quality_high

location_usable =
    gnss_available
    AND cn0_acceptable
    AND movement_consistent

pharmacy_mode =
    location_near_known_pharmacy_zone
    AND location_usable

adherence_mode =
    location_is_home_like
    OR location_unknown

medicine_action =
    verify_identity()
    + check_expiry()
    + check_schedule()
    + context_state()
```

The local/open-source model can then explain or summarize the structured state while hard safety rules remain deterministic.

This is preferable to letting an LLM directly decide medical actions from unconstrained text.

---

# 30. Recommended Technology Stack

## Android

- Kotlin
- Jetpack Compose
- CameraX
- SensorManager / platform sensor APIs
- Location/GNSS APIs available on the loaner device
- Speech recognition APIs / on-device speech model where practical
- Text-to-Speech
- Local SQLite/Room database

## Vision

- OCR library with offline support where practical
- OpenCV / lightweight image-processing pipeline
- Reference packaging feature extraction
- Optional small local vision model if available

## AI

- **Gemma 3n E2B** via **LiteRT-LM** (primary) — on-device, NPU-accelerated; **Qwen3 0.6B** as a lighter fallback (see §17 for the tradeoff)
- NPU/accelerated inference where the iQOO stack exposes it
- Retrieval from a local medication knowledge/reference database

## Office Kit

- Real phone-to-laptop workflow during Green Light
- Phone screen mirrored to laptop for debugging/demo/ops
- File transfer for model/assets/datasets
- Remote control/keyboard during Red Light
- Shared clipboard for code/prompts/logs where useful

> Exact SDK/model choices should be locked only after receiving the loaner device and checking the available OS/build tools/APIs.

---

# 31. Office Kit Strategy

The iQOO site states that Office Kit bridges the phone and laptop through:

- screen mirroring
- shared clipboard
- file transfer
- remote control

and that Office Kit usage contributes **10% of the HackTracker-based score**.

SenseGuard should use Office Kit as an actual engineering/product bridge.

## Green Light

Laptop can provide:

- model conversion/build tooling
- packaging reference dataset preparation
- analytics visualization
- heavier offline experiments
- log inspection

## Red Light

The laptop should not become an external dependency for the core demo.

The phone remains capable of:

- capture
- sensor reading
- OCR
- local verification
- schedule matching
- on-device reasoning
- voice output

Office Kit is then used for the permitted phone-first interaction and debugging/transfer workflow rather than replacing the phone's core role.

---

# 32. Red Light / Green Light Build Strategy

The official site describes approximately **55% of pure build time as Red Light**, where the iQOO phone is the primary build device through Office Kit, and approximately **45% as Green Light**, where both phone and laptop can be used.

Therefore the project must be architected from the start as **phone-first**.

## Rule

> If the feature cannot function without the laptop, it is not part of the committed core.

---

# 33. 30-Hour Build Scope

## MUST SHIP

### Core sensing
- Camera capture
- IMU-based stability gate
- GNSS location
- Magnetometer orientation
- Barometric reading
- GNSS quality / C/N₀ where exposed

### Core AI/product
- OCR
- Medicine normalization
- Expiry extraction
- Local medication database
- Schedule matching
- Packaging/reference comparison
- Explainable decision states
- On-device text/voice response
- Dose logging

### Demo UI
- Scan screen
- Verification screen
- Due/not-due screen
- Warning screen
- Basic caregiver event log

## SHOULD SHIP

- Barcode/QR
- Stronger packaging feature matching
- Context-aware pharmacy/home mode
- Caregiver push/notification simulation
- Small local LLM
- Orientation-aware overlay

## STRETCH

- Front-camera speaker anchoring
- Live clinician captioning
- Community counterfeit hotspot visualization
- More sophisticated sensor-integrity scoring

## CUT FROM CORE

- Whole-box object detection
- Multi-compartment pill organizer registration
- Complex ASHA escalation workflow
- Full medical chatbot
- Large cloud backend
- Complex autonomous medication recommendations

---

# 34. 30-Hour Execution Plan

## Phase 0 — Before the event

Prepare:

- Android project skeleton
- Room schema
- demo medicine dataset
- reference package images
- local inference pipeline
- sensor logger
- basic UI
- test scripts

Do not pre-build anything disallowed by event rules; this checklist is for legal preparation and architecture planning.

---

## Hours 0–3 — Hardware discovery + skeleton

1. Validate actual loaner phone model.
2. Enumerate available sensors and GNSS measurement APIs.
3. Confirm whether C/N₀-style measurements are exposed.
4. Confirm camera APIs.
5. Confirm microphone/speech APIs.
6. Pair Office Kit.
7. Run a sensor logger.
8. Build the scan screen.

Deliverable:

> Phone captures synchronized sensor snapshots.

---

## Hours 3–7 — Camera + OCR

Build:

- camera capture
- image quality gate
- OCR
- medicine parsing
- expiry parsing
- local database lookup

Deliverable:

> Show strip → receive structured medicine record.

---

## Hours 7–11 — Verification

Build:

- packaging signature comparison
- barcode/QR if available
- expiry logic
- explainable confidence output

Deliverable:

> Match / warning / expired result.

---

## Hours 11–15 — IMU + GNSS + magnetometer + barometer

Build the Context Engine.

Deliverable:

> Scan only when stable; attach trustworthy context to the event.

---

## Hours 15–19 — Schedule + local AI

Build:

- medication schedule
- due/not-due logic
- local AI summarization/reasoning
- voice output
- simple haptic states

Deliverable:

> “Metformin 500 mg — due now.”

---

## Hours 19–22 — Caregiver + analytics

Build:

- dose log
- missed dose state
- anonymized geographic cluster visualization

Deliverable:

> One patient event + one population event.

---

## Hours 22–25 — Accessibility layer

Only after the core works:

- mic capture
- front-camera speaker tracking
- captions
- clinician instruction extraction

Deliverable:

> “1 tablet after breakfast.”

---

## Hours 25–28 — Red-team testing

Test:

- poor lighting
- motion blur
- unusual angle
- partially visible strip
- wrong medicine
- expired medicine
- noisy audio
- low GNSS quality
- indoor location
- sensor dropouts

Deliverable:

> Robust demo, not a fragile happy path.

---

## Hours 28–30 — Demo polish

- preload demo dataset
- reduce UI steps
- rehearse 3–5 minute pitch
- validate HackTracker-visible phone usage
- validate Office Kit usage
- record fallback videos only if permitted/appropriate
- prepare concise architecture diagram

---

# 35. Demo Script — 3 to 5 Minutes

## 0:00–0:20 — Problem

> “A patient does not just need a reminder. They need to know what they are holding, whether it matches their medication, whether it is due now, and whether the instructions they heard are consistent with the medicine in their hand.”

## 0:20–0:45 — The iQOO phone is the sensor

Show the phone.

> “SenseGuard turns the phone itself into the safety layer.”

Briefly point to:

**Camera + IMU + GNSS + magnetometer + barometer + GNSS signal quality + voice + on-device AI.**

## 0:45–1:30 — Scan

Pick up medicine.

IMU detects movement.

Phone asks:

> “Hold steady.”

Camera scans.

Output:

> Metformin 500 mg — Dec 2026

## 1:30–2:00 — Verify

Show:

> Packaging match  
> Identifier match  
> Expiry valid

## 2:00–2:30 — Context + schedule

Show:

> Pharmacy mode / Home mode

Then:

> **DUE NOW**

Voice response.

## 2:30–3:00 — Wrong medicine

Scan another package.

Show:

> **NOT DUE**

Haptic warning.

## 3:00–3:30 — Clinician communication

Pharmacist says a short instruction.

Show front-camera + microphone captioning.

## 3:30–4:00 — Community intelligence

Show anonymized suspicious-event clustering.

## 4:00–4:30 — Why iQOO

> “The camera sees the medicine. The IMU decides when the phone is stable enough to trust the frame. GNSS and signal quality establish location confidence. Magnetometer and barometer add physical context. The microphone hears the clinician. On-device AI fuses it all. The phone is not the screen for SenseGuard — it is SenseGuard.”

---

# 36. How SenseGuard Maps to the iQOO Score

| Score item | Strategy | Evidence in demo |
|---|---|---|
| **30% End product quality** | One reliable scan→verify→guide→log loop | Full working flow |
| **20% Novelty & impact** | Medication safety + multimodal sensor fusion + community signal | Physical-world use case |
| **15% Creative phone use** | Camera + voice + NPU + IMU/GNSS/magnetometer/barometer/C/N₀ | Sensor-driven interactions |
| **15% Technical depth** | Sensor fusion, local inference, deterministic safety rules | Architecture + live behavior |
| **10% Office Kit** | Phone↔laptop data/build/ops workflow | Visible Office Kit usage |
| **10% Demo** | Fast physical interaction, no slide-heavy explanation | 3–5 minute live demo |

The objective is to make the **25% device-data component visible through actual usage**, not through verbal claims.

---

# 37. Special Award Strategy — Most iQOO Usage

The official site lists a **Most iQOO Usage** special honour.

SenseGuard should therefore intentionally make the phone indispensable.

## The phone should visibly perform:

1. motion-aware activation
2. camera-based medicine capture
3. sensor-assisted stable-frame capture
4. GNSS context
5. GNSS quality evaluation
6. orientation sensing
7. elevation/context sensing
8. microphone input
9. on-device AI reasoning
10. voice response
11. haptic warning
12. live adherence logging

The point is not to maximize the number of APIs called.

The point is to show a **coherent chain in which multiple phone capabilities combine to produce an outcome that a laptop-only app could not naturally provide.**

---

# 38. What Not to Say to Judges

Avoid:

> “We use GPS because it is available.”

Say:

> “GNSS provides event context and supports anonymized geographic anomaly intelligence.”

Avoid:

> “The camera tells us the medicine is genuine.”

Say:

> “The camera performs visual authenticity screening and cross-checks package identity; we do not claim visual inspection is absolute proof of authenticity.”

Avoid:

> “We use a barometer to detect medicine.”

Say:

> “Barometric change adds relative elevation context, especially where horizontal GNSS movement is ambiguous.”

Avoid:

> “We built an AI healthcare chatbot.”

Say:

> “We built a sensor-fusion decision layer that grounds on-device AI in structured medication and device context.”

---

# 39. Judge Questions and Answers

## Q1. Why does this need an iQOO phone?

**Answer:**

> “Because the phone is the sensing platform. We use camera vision, IMU stability, GNSS and its signal quality, orientation, elevation context, microphone input and on-device AI together. The product is not portable logic running on a screen; the device itself is doing the sensing.”

## Q2. Why not just use a medicine reminder app?

**Answer:**

> “A reminder app starts from manually entered data. SenseGuard starts from the physical medicine in the user's hand and automatically verifies identity, timing and context.”

## Q3. Can you really detect counterfeit medicine?

**Answer:**

> “We do not claim universal authenticity certification. We perform a screening check using packaging characteristics and available identifiers, and we surface suspicious mismatches for human/authorized verification.”

## Q4. Why GNSS?

**Answer:**

> “Location gives the medication event context and enables anonymized hotspot intelligence. A suspicious package scanned repeatedly in one area is a different impact signal from an isolated anomaly.”

## Q5. Why barometer?

**Answer:**

> “It adds relative elevation context. In a building, horizontal GNSS position may barely change while the user moves between levels.”

## Q6. Why magnetometer?

**Answer:**

> “It complements the IMU for orientation and spatial guidance. Camera tells us what is in front of the phone; orientation sensing tells us how the device is positioned relative to that scene.”

## Q7. What is C/N₀ doing?

**Answer:**

> “It gives us signal-quality evidence so we do not blindly trust a GNSS coordinate. We combine it with motion and consistency checks to estimate location confidence.”

## Q8. Why on-device AI? Which model?

**Answer:**

> “Medication information is sensitive, and the hackathon explicitly rewards local/open-source models with the phone in the loop. Local inference also makes the product resilient when connectivity is unavailable. We run Gemma 3n E2B through Google's LiteRT-LM runtime — it's built specifically for phone NPUs, roughly a 2.6 gigabyte footprint, and it only phrases the explanation; the safety decision itself is deterministic rules, not the model's judgment. Qwen3 0.6B is our fallback if the loaner device's memory or NPU can't comfortably carry Gemma 3n.”

## Q9. What is the hardest technical part?

**Answer:**

> “The challenge is not OCR by itself. It is sensor fusion: knowing when the camera observation is reliable, whether location can be trusted, and how all those observations should influence one medication decision.”

---

# 40. Safety Boundaries

SenseGuard is a safety and adherence assistant, not an autonomous medical prescriber.

The app should never:

- prescribe medication
- change dosage without authorized instruction
- invent contraindications
- assert pharmaceutical authenticity with certainty
- override a clinician
- encourage a patient to ignore a pharmacist/doctor

The safe product behavior is:

> **Identify → verify → contextualize → guide → escalate uncertainty.**

When uncertain, say so.

---

# 41. Future Scope

The following can be explicitly labeled as future scope rather than committed build items:

### Community Medicine Safety Network
Privacy-preserving anomaly maps across pharmacies/regions.

### Clinician-validated prescription ingestion
Structured medication rules created from an authorized prescription source.

### Better package authentication
More advanced packaging signatures and authorized verification databases.

### Accessibility expansion
Richer hearing/vision support with personalized interaction modes.

### Population adherence analytics
Aggregated, non-identifying adherence trends for care teams.

### Household mode
Multiple family members with local profiles and permissioned caregiver access.

---

# 42. Final Product Definition

## SenseGuard is not:

- a generic medicine reminder
- a chatbot
- a counterfeit scanner alone
- a pill organizer
- a cloud dashboard

## SenseGuard is:

> **A multimodal, phone-native medication safety system that uses camera, motion, orientation, location, GNSS signal quality, elevation context and voice — fused with on-device AI — to understand the medicine in the user's hand and determine what the user should do next.**

---

# 43. Final One-Line Architecture

```text
CAMERA + IMU + MAGNETOMETER + GNSS + C/N₀ + BAROMETER + VOICE
                              ↓
                   SENSOR FUSION ENGINE
                              ↓
                   ON-DEVICE AI / NPU
                              ↓
               MEDICINE + CONTEXT + SCHEDULE
                              ↓
                   VERIFY → GUIDE → LOG
                              ↓
                SCREEN + VOICE + HAPTICS
                              ↓
                     CAREGIVER / ANALYTICS
```

---

# 44. Final Pitch Statement

> **“SenseGuard turns the iQOO phone into a medication safety sensor. The camera identifies the medicine. The IMU knows when the phone is stable enough to trust the scan. The magnetometer and barometer add physical context. GNSS tells us where the event happened, while C/N₀ helps us decide whether that location signal is trustworthy. The microphone and front camera understand clinician instructions. On-device AI fuses these signals with the patient's schedule and tells them what to do — privately, even when the network is unavailable.**
>
> **The box can be messy. We don't need to understand the box. We only need to understand the medicine in the patient's hand.”**

---

# 45. Build Priority Checklist

## Tier A — Must work

- [ ] Rear camera
- [ ] OCR
- [ ] Medicine normalization
- [ ] Expiry detection
- [ ] IMU stable-frame gate
- [ ] Local medicine database
- [ ] Schedule match
- [ ] Packaging comparison
- [ ] GNSS context
- [ ] Barometer reading
- [ ] Magnetometer orientation
- [ ] C/N₀ or equivalent GNSS quality metric if exposed
- [ ] On-device AI response
- [ ] Voice output
- [ ] Dose logging

## Tier B — Strong competitive advantage

- [ ] Barcode/QR
- [ ] Pharmacy/home/clinic modes
- [ ] Haptic state feedback
- [ ] Anonymized hotspot analytics
- [ ] Caregiver notification
- [ ] Orientation-aware overlay

## Tier C — Stretch

- [ ] Front-camera speaker anchoring
- [ ] Live clinician captions
- [ ] Local multimodal model
- [ ] Advanced counterfeit signature model

---

# 46. Hardware Validation Checklist at Device Handover

Before committing to the final architecture, run a 10-minute hardware validation script on the actual loaner:

```text
[ ] Camera API works
[ ] Rear camera resolution sufficient for OCR
[ ] Front camera available
[ ] Accelerometer available
[ ] Gyroscope available
[ ] Magnetometer available
[ ] Barometer available
[ ] GNSS location available
[ ] Raw/measurement GNSS APIs available
[ ] C/N₀-style signal metric exposed
[ ] Microphone input works
[ ] Speaker/TTS works
[ ] Haptic feedback controllable
[ ] Required permissions available
[ ] On-device inference path available
[ ] Office Kit paired
```

If any sensor is unavailable, the architecture should degrade gracefully without breaking the core scan→verify→guide loop.

---

# 47. Final Product Hierarchy

## CORE
**Single-item medicine scan → identify → verify → schedule check → guide → log**

## DIFFERENTIATOR
**SensorFusion: camera + IMU + GNSS + C/N₀ + magnetometer + barometer + on-device AI**

## ACCESSIBILITY EXTENSION
**Mic + front camera → clinician communication → captions/instruction extraction**

## IMPACT EXTENSION
**Anonymous geographic anomaly intelligence**

## FUTURE SCOPE
**Broader pharmacy, clinician and community healthcare integrations**

---

# 48. The Sentence the Team Should Remember

> ## **“The phone is not running SenseGuard. The phone is SenseGuard.”**

That is the core strategy for the iQOO Hackathon 2026.
