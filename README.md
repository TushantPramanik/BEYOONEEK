# 🎬 BEYOONEEK OTT PLATFORM

An ultra-modern, futuristic cinematic OTT streaming web application built with **FastAPI**, **SQLite & SQLAlchemy**, **HTML5/CSS3 Glassmorphism**, and modern asynchronous JavaScript.

Designed to faithfully honor and expand the base architecture of the original terminal backend modules (`A_main.py` through `F_continue_watching.py`) into an industry-grade, eye-friendly, and lucrative streaming platform matching world-renowned platforms like Netflix, Disney+ Hotstar, and Apple TV+.

---

## 🚀 Quick Start (Localhost Access)

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root.

### Option 2: Command Line
```bash
python run.py
```
Or directly with Uvicorn:
```bash
uvicorn app:app --host 127.0.0.1 --port 8000 --reload
```

Once running, open your web browser and visit:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)** or **[http://localhost:8000](http://localhost:8000)**

---

## 🔑 Demo VIP Account
For immediate access without manual registration, a pre-seeded VIP account is available:
- **Username:** `beyooneek_vip`
- **Password:** `vip123`
- **Active Plan:** `Platinum Plan ($20)` (4K Ultra HD, Spatial Dolby Atmos, Ad-Free)

*You can also register any new user directly in the UI with instant password confirmation checks, exactly matching `A_main.py`!*

---

## 🏛️ Architecture Mapping (CLI Backend to Web Platform)

| Original CLI Backend File | Original Logic & Concept | Web / API Expansion in BEYOONEEK |
| :--- | :--- | :--- |
| **`A_main.py`** | Terminal Registration, Password confirmation loop, Login, Navigation menu | `POST /api/auth/register`, `POST /api/auth/login`, modern glass auth modal, password matching validation, and persistent user session |
| **`B_account_type.py`** | Free ($0), Silver ($10), Gold ($15), Platinum ($20) plans & simulated purchase portal | `GET /api/plans`, `POST /api/subscription/upgrade`, interactive 4-tier cards comparison, cyber credit card simulation, UPI scanner, and plan perks enforcement |
| **`C_dashboard.py`** | Welcome banner with user & plan tier, history tracking state, menu options | Dynamic glass navbar with user chip, active subscription tier badge, user profile drawer, and quick category pills |
| **`D_trending.py`** | Bollywood & Hollywood Top 10 movies, movie switcher, playback trigger | `GET /api/movies/trending`, Netflix-style massive 3D metallic numbers (1-10) for Bollywood and Hollywood, interactive play triggers |
| **`E_explore.py`** | Bollywood & Hollywood catalog exploration, category switcher, streaming triggers | `GET /api/movies/explore`, curated horizontal carousels with hover scale, tags, duration, and match % badges |
| **`F_continue_watching.py`**| View last watched movie, instant stream resume, history state | `GET /api/history`, `POST /api/history/update`, `DELETE /api/history/{id}`, visual progress percentage bars, and instant 1-click stream resume |

---

## ✨ Features & Highlights

### 1. 🌌 Futuristic Dark Glassmorphic UI
- **Cyber Obsidian Palette:** Deep void tones (`#07090e`), pulsating neon cyan (`#00f0ff`) and crimson (`#ff0055`) ambient mesh glow gradients.
- **Micro-Interactions:** Web Audio API sound cues for high-tech clicks, card hover zoom transitions, dynamic audio wave equalizer.

### 2. 🎥 High-Impact Hero Spotlight
- Dynamic billboard marquee showcasing marquee blockbusters (*Chhaava*, *Mission: Impossible - The Final Reckoning*, *Superman*, *Dhurandhar*).
- Auto-rotating slides, live rating, match percentage, and audio visualizer toggle.

### 3. 🔟 Netflix-Style Top 10 Ranked Carousels
- Massive stylized numbers 1 through 10 for Trending Bollywood and Hollywood.
- Smooth horizontal scrolling with floating glass arrow controls.

### 4. 📺 Fully-Featured In-Browser Cinema Player
- Custom glass overlay timeline scrubber with time hover preview tooltip.
- Play/Pause, 10-second skip forward & backward, volume slider & mute.
- **Streaming Resolution Selector:** Standard (480p), HD (720p), Full HD (1080p), 4K Ultra HD tied to your subscription plan.
- **Audio & Subtitle Menu:** Multiple language audio tracks and subtitle options.
- **Playback Speed Controller:** 0.5x, 0.75x, 1.0x, 1.25x, 1.5x, 2.0x.
- **Simulated Ad for Free Plan:** Free Plan users see an interactive 5-second skippable ad banner reminding them to upgrade to Silver/Gold/Platinum (matching `B_account_type.py` Free Plan specifications).
- **Auto Database Sync:** Watch progress syncs every 5 seconds to update "Continue Watching" in real time.

### 5. 💳 Interactive Simulated Checkout Portal
- 4 subscription plans from `B_account_type.py`.
- Interactive cyber credit card preview updating live with cardholder name and card number.
- UPI QR code and PayPal tab options.
- Immediate plan activation, celebration feedback, and persistent database record.

### 6. 🔍 Real-Time Live Search
- Search across titles, actors, directors, and genres with instant filtering and result counters.

### 7. 🔖 Personal Watchlist (My List)
- Add/remove any movie with persistent storage in SQLite.
