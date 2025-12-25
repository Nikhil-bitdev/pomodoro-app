# Pomodoro Focus App

A fully functional Pomodoro timer and productivity tracking web application built with React, TypeScript, and Tailwind CSS.

## Features

### 🍅 Pomodoro Timer
- Customizable work and break durations
- Automatic session switching
- Visual progress indicator
- Session counter with progress dots
- Focus mode with wake lock and fullscreen support
- Timer persists across page refreshes

### ✅ Task Management
- Create, edit, and delete tasks
- Track estimated vs completed pomodoros per task
- Add descriptions and tags to tasks
- Filter tasks by status (all/active/completed)
- Search tasks by title or tags
- Link tasks to Pomodoro sessions

### 📊 Analytics Dashboard
- Daily, weekly, and monthly statistics
- Activity charts with Recharts
- Streak tracking (current and longest)
- Completion rates and averages
- Total pomodoros, focus time, and tasks completed

### ⚙️ Settings
- Customize timer durations
- Adjust sessions before long break
- Toggle auto-start for breaks and pomodoros
- Sound notifications
- Dark/light theme toggle
- Daily pomodoro goal setting
- Data export/import (JSON format)
- Clear all data option

### 🔔 Notifications
- Browser notifications for session completion
- Daily goal achievement notifications
- Streak milestone notifications
- Sound alerts (optional)

### 💾 Data Persistence
- IndexedDB for client-side data storage
- Export/import functionality
- No server required

### 🌙 Dark Mode
- System-aware dark mode
- Smooth theme transitions
- Persistent theme preference

### 📱 Progressive Web App
- Installable on desktop and mobile
- Offline functionality with service worker
- App shortcuts for quick actions

## Tech Stack

- **React 18+** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Dexie.js** - IndexedDB wrapper
- **Recharts** - Data visualization
- **date-fns** - Date manipulation
- **Lucide React** - Icons
- **PWA Plugin** - Progressive Web App capabilities

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open your browser and navigate to `http://localhost:3000`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

### Preview Production Build

\`\`\`bash
npm run preview
\`\`\`

## Project Structure

\`\`\`
src/
├── components/          # React components
│   ├── timer/          # Timer-related components
│   ├── tasks/          # Task management components
│   ├── analytics/      # Analytics dashboard
│   └── settings/       # Settings panel
├── hooks/              # Custom React hooks
│   ├── usePomodoro.ts  # Timer logic
│   ├── useTasks.ts     # Task operations
│   ├── useAnalytics.ts # Analytics computations
│   └── useSettings.ts  # Settings management
├── lib/                # Core libraries
│   ├── database.ts     # Dexie database schema
│   ├── notifications.ts# Web Notifications API
│   └── focusMode.ts    # Focus mode features
├── utils/              # Utility functions
│   └── dateHelpers.ts  # Date formatting
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles
\`\`\`

## Database Schema

The app uses IndexedDB with the following tables:

- **sessions** - Pomodoro session records
- **tasks** - Task list with pomodoro tracking
- **dailyStats** - Daily statistics
- **settings** - User preferences (singleton)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

Requires support for:
- IndexedDB
- Web Notifications API
- Service Workers
- Wake Lock API (optional, for focus mode)

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
