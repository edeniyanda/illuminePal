# IlluminePal

IlluminePal is an eye-care assistant application built with Tauri, React, and TypeScript. It helps users reduce digital eye strain by encouraging regular breaks based on the 20-20-20 rule and offering guided eye exercises.

## Features

- **20-20-20 Break Timer**: Customizable timer for work sessions with a full-screen break reminder overlay.
- **Guided Eye Exercises**: Visual exercises to help stretch and rest eye muscles (figure-8 tracing, blinking pacer, focus depth shift, perimeter sweeps).
- **Custom Schedules & Settings**: Adjustable focus and break durations, strict break enforcement options, and optional sound notifications.
- **Usage Analytics**: Overview of daily breaks completed and a weekly break history chart.
- **Settings Persistence**: Saves application preferences locally using Tauri's Rust backend.
- **Dark & Light Mode**: Toggleable interface themes.

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Desktop Runtime**: Tauri (Rust)
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Rust](https://www.rust-lang.org/) *(Required only for building the native Tauri desktop app)*

### Installation

```bash
# Clone the repository
git clone https://github.com/edeniyanda/IlluminePal.git

# Navigate into the project directory
cd IlluminePal

# Install dependencies
npm install
```

### Running the App

#### Web Preview (Browser)
```bash
npm run dev
```

#### Desktop Mode (Tauri)
```bash
npm run tauri dev
```

### Production Build

```bash
npm run build
```

## Project Structure

```
.
├── src/
│   ├── components/      # UI components (Sidebar, TopBar, BreakOverlay)
│   ├── context/         # React context providers (TimerContext, ThemeContext)
│   ├── pages/           # Application views (Dashboard, Reminders, Exercises, Analytics, Settings)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Helper utilities (Web Audio API synthesizer)
├── src-tauri/
│   ├── src/             # Rust source files (main.rs, settings.rs)
│   └── tauri.conf.json  # Tauri app configuration
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
└── vite.config.ts       # Vite configuration
```

## License

MIT
