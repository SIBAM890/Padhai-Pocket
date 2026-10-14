# PadhAI Pocket — Web-App UI (web-app-ui)

The dedicated Web-First interface for **PadhAI Pocket**, an offline-first, multimodal diagnostic learning companion for rural and tribal learners in Odisha (BSE Odisha Class 9 Physics/Science).

---

## Architecture Overview

`web-app-ui` provides a responsive, desktop-optimized Chrome experience while running the complete student mobile UI:

1. **Responsive Dual Experience**:
   - **Mobile Viewport (< 1024px)**: Complete, distraction-free student learning application.
   - **Desktop Viewport (≥ 1024px) — Judge Mode**: Split-screen display:
     - **Left Column**: Mobile device preview running the 100% intact student UI.
     - **Right Column**: Live Diagnostic Telemetry Panel detailing PRNG seed (`1806635391`), active engine state, triangulation matrix `[P, A, T]`, candidate hypotheses, live BKT concept/term mastery %, sync queue counts, backend health, and a real-time event stream.

2. **Web-Safe Persistence (`padhai_pocket_events_v1`)**:
   - SQLite schema semantics mapped to browser `localStorage`.
   - Survives page refresh and tab closure.
   - Implements PRD §7.4 exponential backoff (`2s → 4s → 8s → 16s → 30s`).
   - Reactive `subscribeDatabase()` notifies UI components on mutations in real time.

3. **Zero Default Mock Data**:
   - Trace Timeline and Raw Event Log screens read directly from local persistent storage.
   - Live updates as questions and probes are answered.
   - Demo mode is strictly opt-in via an explicit UI toggle.

4. **Teacher PIN Gate**:
   - Teacher Dashboard is protected by a PIN gate.
   - Access code: **`1234`**.

5. **Odia-Localized Error Boundary**:
   - Catches unhandled runtime exceptions gracefully.
   - Odia text: `କିଛି ତ୍ରୁଟି ଘଟିଛି` (Something went wrong), `ଚିନ୍ତା କରନ୍ତୁ ନାହିଁ, ଆପଣଙ୍କ ଶିକ୍ଷା ସୁରକ୍ଷିତ ଅଛି ।` (Don't worry, your learning progress is safe).

---

## Directory Structure

```text
web-app-ui/
├── App.tsx                     # Root application with GlobalErrorBoundary & Navigation
├── app.json                    # Expo configuration
├── metro.config.js             # Metro config with /healthz & /v1/* reverse-proxy to FastAPI
├── package.json                # Web app dependencies & scripts
├── tsconfig.json               # TypeScript configuration
└── src/
    ├── assets/                 # Brand assets and graphics
    ├── components/             # Reusable UI components
    │   ├── AppHeader.tsx       # Header with greeting, network badge, avatar
    │   ├── AppIcons.tsx        # Vector icons (MaleHumanIcon, FemaleHumanIcon, etc.)
    │   ├── AudioProbe.tsx      # Audio probe card (A modality)
    │   ├── BottomNavigation.tsx# Tab bar (Home, Lessons, Practice, Profile)
    │   ├── CompletionCard.tsx  # Lesson completion celebration card
    │   ├── ConfirmationCard.tsx# W1 Confirmation card
    │   ├── ContinueLearningCard.tsx
    │   ├── FriendlyState.tsx   # Offline/empty states
    │   ├── GlobalErrorBoundary.tsx # Odia error fallback
    │   ├── GoalCard.tsx        # Daily goal progress
    │   ├── JudgeTelemetryPanel.tsx # Live diagnostic telemetry for desktop
    │   ├── LearnerProfileCard.tsx
    │   ├── LessonBrowserCard.tsx
    │   ├── LessonContentCard.tsx
    │   ├── LessonIntroCard.tsx
    │   ├── MCQOption.tsx       # Interactive option pills
    │   ├── MicButton.tsx       # Voice input interaction
    │   ├── NetworkBadge.tsx    # Online/Weak/Offline badge
    │   ├── PictureProbe.tsx    # Visual probe card (P modality)
    │   ├── RemediationCard.tsx # Kui/Odia bilingual remediation card
    │   ├── SoundCheck.tsx      # Audio hardware diagnostic
    │   ├── StreakGrid.tsx      # GitHub-style weekly streak matrix
    │   ├── StudentSetupModal.tsx # Name, gender cards, language, subject
    │   ├── SubjectCard.tsx
    │   ├── TeacherDashboardModal.tsx # PIN-gated teacher cohort monitor
    │   ├── TextProbe.tsx       # Text probe card (T modality)
    │   └── TraceTimeline.tsx   # Diagnostic decision timeline
    ├── content/                # Content pack loader (chunks, probes, glossary)
    ├── db/                     # Web-safe local event persistence (localStorage)
    ├── engine/                 # Deterministic state machine (nextAction, BKT, PRNG seed)
    ├── mock/                   # Mock profile and fallback data
    ├── network/                # Network mode detection and listener
    ├── screens/                # Top-level screen views
    │   ├── LearnScreen.tsx     # Main learning flow & desktop split screen
    │   ├── RawLogScreen.tsx    # Raw JSON event log with clipboard copy
    │   ├── SplashScreen.tsx    # Animated splash view
    │   └── TraceScreen.tsx     # Decision timeline trace screen
    ├── sync/                   # FastAPI backend sync client
    ├── theme/                  # Design tokens, typography, colors, shadows
    ├── types/                  # OpenAPI and event type definitions
    └── utils/                  # Web-safe device UUID and crypto utilities
```

---

## How to Run

### 1. Start the Backend Server (Terminal 1)
```bash
cd backend
PYTHONPATH=. python3 -m uvicorn main:app --host 127.0.0.1 --port 8000
```

### 2. Start the Web App UI (Terminal 2)
```bash
cd web-app-ui
npm install
npm run web
```
The application will open in Google Chrome at `http://localhost:8081`.
- View on a screen with width $\ge 1024\text{px}$ to experience the **Desktop Judge Mode** with real-time telemetry alongside the student mobile flow.
- Resize below $1024\text{px}$ to experience the student mobile view directly.
