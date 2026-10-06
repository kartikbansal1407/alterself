# AlterEgo

AlterEgo is a browser-based fitness coaching MVP built with Next.js, React, and TypeScript. It uses MediaPipe pose tracking to provide exercise feedback and saves workout summaries locally with Dexie and IndexedDB.

## Quick start

Use Node.js 22 LTS or newer and npm:

```sh
npm ci
npm run dev
```

Open [localhost:3000](http://localhost:3000). See [SETUP.md](SETUP.md) for camera requirements, testing, and troubleshooting.

## Current features

- Camera-based coaching for squats, push-ups, deadlifts, planks, Warrior II, and Tree Pose.
- Repetition counting or hold timing, depending on the exercise.
- Local workout history, JSON export, and deletion.
- Dashboard, progress, settings, and authentication screens.
- Pose model and WebAssembly assets served from the application's own origin.

Coaching features are Beta. Authentication screens are placeholders: no account provider is connected, and form submissions do not send or store credentials. Workout history stays in the current browser; cloud synchronization is not connected.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server using webpack |
| `npm run build` | Create a production build using webpack |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |
| `npm test -- --run` | Run unit and component tests once |
| `npm run test:e2e` | Run Playwright browser tests |

## Project layout

- `src/app/`: App Router pages, layouts, and global styles.
- `src/components/`: Shared UI and camera coaching components.
- `src/pose/`: Pose engine, reliability checks, and types.
- `src/analyzers/`: Exercise definitions and analysis logic.
- `src/workouts/`: Session logic and local persistence.
- `tests/e2e/`: Browser journey tests.
- `public/models/` and `public/wasm/`: Local inference assets.
- `docs/`: Architecture, exercise, data, privacy, and testing specifications.

## Further reading

- [Setup guide](SETUP.md)
- [Project architecture](PROJECT_ARCHITECTURE.md)
- [Privacy and threat model](docs/privacy-and-threat-model.md)
- [Testing strategy](docs/testing-strategy.md)
- [Pose model provenance](public/models/README.md)

Some specification documents describe planned capabilities. The current feature descriptions above reflect the implementation.
