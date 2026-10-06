# Local setup

## Prerequisites

- Node.js 22 LTS or newer and npm.
- A browser with camera access and WebAssembly support; use a recent Chrome or Chromium browser for initial testing.
- A webcam for live coaching.

Run commands from the repository root. No environment variables, external database, or authentication credentials are required for the current local MVP.

## Install and run

```sh
npm ci
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), open the coach, choose an exercise, and allow camera access when prompted. Follow the exercise's positioning instructions and keep the required body landmarks visible.

Camera access requires a secure browser context: localhost works for local development; use HTTPS when accessing a deployment or testing from another device. An ordinary HTTP LAN address may load the page without enabling the camera.

To use a different development port:

```sh
npm run dev -- --port 3001
```

## Local inference assets

The repository includes the model at `public/models/pose_landmarker_lite.task` and the MediaPipe runtime files in `public/wasm/`. Keep these files available when running or deploying the app. Their browser URLs are `/models/pose_landmarker_lite.task` and `/wasm/…`.

The engine attempts GPU initialization and falls back to CPU if that fails. Model provenance is documented in [public/models/README.md](public/models/README.md).

## Verify changes

```sh
npm run lint
npm run typecheck
npm test -- --run
npm run build
```

For browser tests, install Playwright's Chromium browser once:

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright starts its own development server at `http://127.0.0.1:3000`. Stop any server using port 3000 before running the suite. The configured browser uses a fake camera stream; verify real camera behavior separately with a webcam.

## Run a production build locally

```sh
npm run build
npm start
```

Open [http://localhost:3000](http://localhost:3000). Build the app before using `npm start`.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| Camera permission denied | Allow camera access in the browser's site settings and retry. |
| Camera unavailable | Check that a webcam is connected and another application is not occupying it. |
| Camera works on localhost but not another device | Serve the app over HTTPS on the other device. |
| Pose engine fails to load | Check the browser Network panel for missing model or WASM files and ensure `public/` assets are deployed. |
| Tracking is unreliable | Improve lighting, keep the required body landmarks in view, and follow the selected exercise's camera angle guidance. |
| Port 3000 is occupied | Stop the existing server or use the alternate development port command above. |
| Workout history is missing | History belongs to the browser and origin where it was saved. Changing browser, hostname, or port changes the storage origin; clearing site data removes it. |
| Login or registration reports an unavailable service | This is expected: the account provider is not connected yet. |

Export workout history before clearing browser site data if you want to keep a copy.
