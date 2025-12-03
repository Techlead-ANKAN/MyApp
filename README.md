# MyApp - Personal Productivity Hub

A comprehensive personal productivity web application combining calendar/task management, gym tracking, and learning milestones with a centralized discipline dashboard.

## Features

### 1. Productivity Calendar
- Full-screen monthly calendar interface
- Task scheduling for any date (past, present, future)
- Habit tracking (fitness checkbox, study hours)
- Visual feedback on calendar tiles
- Streak tracking and consistency monitoring

### 2. Gym Tracking System
- Custom weekly workout structure builder
- Exercise library with custom exercises
- Calendar-based tracking (Gym Day / Rest Day)
- Progress visualization and streak counting
- Set/rep/weight logging

### 3. Learning Milestone Tracker
- Hierarchical milestone system
- Unlimited sub-milestones (DSA → Arrays, Trees, etc.)
- Status tracking (completed/in-progress/pending)
- Progress dashboard with visual representation
- Customizable skill categories

### 4. Home Dashboard
- Central discipline hub
- Streak counters for all challenge areas
- Daily progress indicators
- Motivational milestone celebrations

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS (Glassmorphic Design System)
- **Routing**: React Router v6
- **State Management**: Zustand + React Query
- **Database**: Supabase (PostgreSQL)
- **Forms**: React Hook Form + Zod
- **Calendar**: react-big-calendar + date-fns
- **Charts**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                 # Application initialization
├── pages/               # Route pages
├── features/            # Feature modules (calendar, gym, learning, auth)
├── shared/              # Shared components and utilities
├── widgets/             # Layout components
└── lib/                 # External integrations (Supabase)
```

## Design System

The app uses a glassmorphic dark theme with:
- Deep dark backgrounds (#202124, #3c4043)
- Frosted glass effects (bg-white/5, backdrop-blur-xl)
- Accent colors: Blue (primary), Purple (secondary), Green (success), Red (danger)
- Smooth animations and transitions (200ms duration)
- Fully responsive across all devices

## License

Private use only.
