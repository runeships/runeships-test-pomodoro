This submission is Option D: a Pomodoro timer web app with session history persistence and stats visualization.

The deployed app is live at [your-vercel-url].vercel.app. The source code is at github.com/[username]/runeships-test-pomodoro.

Tech stack: vanilla HTML/CSS/JavaScript with no framework. Persistence via localStorage. Single-file architecture for the working code (index.html, style.css, script.js).

Features implemented:
- 25-minute work sessions followed by 5-minute breaks, with automatic transitions
- Pause and reset controls during any active session
- Session history persisted across browser sessions via localStorage
- Daily and weekly stats: total focus time, sessions completed, current daily streak
- Bar chart visualization of focus minutes per day over the past 14 days, rendered as CSS-only bars (no chart library)
- Toggleable sound notification at session end (Web Audio API, no external assets)
- Keyboard shortcuts: spacebar to start/pause, R to reset

Decisions and tradeoffs (also in README):

I chose vanilla JS over React because the entire app fits in roughly 280 lines and React would have added ~50KB of framework overhead and a build step for negative benefit at this scope. The Pomodoro timer is fundamentally a single page with one piece of state (current session); reactivity per-component is unnecessary.

I chose localStorage over IndexedDB despite IndexedDB being more "correct" for time-series data. localStorage holds ~5MB per origin, which is enough for years of session records at ~50 bytes per session. The DX difference (synchronous KV vs. async with versioned schema migrations) didn't justify IndexedDB for this scope.

I chose CSS-rendered bars over Chart.js for the 14-day visualization. Adding a charting library would have meant ~80KB of JS for what amounts to drawing 14 rectangles. The chart is fully responsive and renders identically across browsers.

One tradeoff I considered and rejected: a backend with user accounts. Building authentication and a database would have moved this from "4 hour project" to "12 hour project" without adding meaningfully to what's being demonstrated (the timer logic, persistence, and UX). For a personal productivity tool, the lack of cross-device sync is a minor cost relative to the integration complexity.

What I'd build next with another 4 hours:
1. Export session history as CSV (one column per day, weekly grouping)
2. Customizable session lengths (some users prefer 50/10 instead of 25/5)
3. A subtle "you're on a 3-day streak" notification on first session of the day
4. PWA installation manifest so the app works offline on mobile

Time taken: approximately 3.5 hours including the writeup.
