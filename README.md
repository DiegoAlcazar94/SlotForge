# SlotForge

A browser-based 5-reel slot machine built with **PixiJS** and vanilla JavaScript —
designed to replicate the core mechanics and visual standards of real-world iGaming terminals.

![SlotForge Preview](./preview.png)
![SlotForge Preview](./preview2.png)

---

## Overview

SlotForge was built as a technical portfolio piece to demonstrate knowledge of
iGaming development fundamentals: reel mechanics, weighted RNG, payline evaluation,
win animations, and synthetic audio feedback — all running inside a single HTML5 canvas.

---

## Features

- 5 reels × 3 rows with smooth scroll animation
- Weighted RNG symbol pool simulating real paytable distribution
- 9 active paylines with dynamic win detection
- Payline highlight overlay with pulsing win animations
- Synthetic sound effects via Web Audio API (no external audio files)
- Balance and bet system with +/- controls
- Responsive scaling for any screen size or touch terminal

---

## Tech Stack

![PixiJS](https://img.shields.io/badge/PixiJS-7.3-red?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-Canvas-orange?style=for-the-badge&logo=html5)
![Web Audio](https://img.shields.io/badge/Web_Audio-API-blueviolet?style=for-the-badge)

---

## Project Structure
```
SlotForge/
├── index.html          # Entry point
├── src/
│   ├── main.js         # App init, UI, game loop
│   ├── Reel.js         # Reel rendering and spin animation
│   ├── SymbolMap.js    # Symbol definitions and weighted RNG
│   ├── WinChecker.js   # Payline evaluation and paytable
│   ├── WinAnimator.js  # Win highlight and pulse animations
│   └── ScaleManager.js # Responsive scaling for touch screens
└── assets/
    └── symbols/        # (reserved for sprite upgrades)
```

---

## How to Run

No build tools or dependencies required.

1. Clone the repository
2. Serve locally with any static server:
```bash
# Option A — Python
python -m http.server 8000

# Option B — VS Code
Install the "Live Server" extension and click "Go Live"
```

3. Open `http://localhost:8000` in your browser

---

## Game Mechanics

**Symbols and weights** — each symbol has a probability weight that controls
how often it appears. Lower weight = rarer = higher payout.

| Symbol | Weight | x3  | x4  | x5   |
|--------|--------|-----|-----|------|
| 7      | 1      | 50  | 150 | 500  |
| BAR    | 3      | 20  | 60  | 200  |
| Bell   | 5      | 10  | 30  | 100  |
| Cherry | 8      | 5   | 15  | 50   |
| Lemon  | 10     | 3   | 8   | 25   |
| Grape  | 10     | 3   | 8   | 25   |

**Paylines** — 9 predefined paths across the 5×3 grid,
including horizontal, diagonal, and V-shaped patterns.

---

## Roadmap

- [ ] Replace text symbols with custom sprite artwork
- [ ] Add bonus round trigger (scatter symbols)
- [ ] Implement autoplay mode
- [ ] Add coin counter animation on win
- [ ] Mobile portrait layout optimization

---

## Author

**Diego Alcázar** — Junior Developer · Valencia, Spain  
[GitHub](https://github.com/DiegoAlcazar94) · [LinkedIn](https://www.linkedin.com/in/diego-alc%C3%A1zar/)

