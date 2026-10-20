# Good Beats

A browser-based, GPU-rendered sound visualizer. WebGL renders a single full-screen shader pass; Web Audio provides frequency data. No framework runtime or per-frame DOM work is used.

The visualizer centers on a glass-like animated orb with flowing aurora detail and a ring of audio-reactive spectrum bars. Pointer movement subtly affects the scene. Choose Aurora, Tide, or Ember for the color mood. Open the gear in the visualizer to tune render resolution, frame rate, flow detail, motion, and visual intensity. Settings persist in the browser. Render resolution can scale up to 300% per axis (subject to GPU limits); 100% uses the device pixel ratio. Higher settings can substantially increase GPU work. Frame rate defaults to a 120 FPS ceiling and can be raised to 240 FPS, or set to uncapped.

## Development

Requirements for the container workflow: Docker Desktop (or Docker Engine) with the Compose plugin, running. No host Node.js, npm, or GNU Make is needed to start development.

```sh
docker compose up --build
```

Open [http://localhost:5173](http://localhost:5173); the Node 22 container installs the locked npm dependencies and serves the mounted source with hot reload. Stop it with `Ctrl+C`, then run `docker compose down` to remove the development container and network while keeping its dependency cache. If you pull changes to `package-lock.json` and dependencies appear stale, recreate that cache with `docker compose down -v` before starting again.

GNU Make is optional. With it installed, `make dev` runs the same foreground Compose workflow; `make docker-up` starts it in the background, `make docker-logs` follows output, `make docker-bash` opens a shell in the app container, and `make docker-down` stops project containers. `make docker-down` also stops the production container started with `make preview`. Run `make help` to see all available shortcuts.

Host-native targets are also available: `make install`, `make host-dev`, `make host-build`, and `make host-preview`. They require Node.js 20.19+ or 22.12+; `make check-node` reports whether the installed version is supported. `make build` builds the production Docker image, and `make preview` runs it on port 8080.

## Audio inputs

Choose **System audio** and press **Start listening**. Browser display capture requires a video track, while audio availability depends on the browser and the picker choice. Choose a screen and enable system audio, or choose a browser tab and enable tab audio for that tab only. Good Beats keeps the display stream alive for capture compatibility, requests an ideal video frame rate of 1 FPS, and never renders or stores video frames. Microphone capture is available as an alternative. Audio is analyzed locally and is not recorded or uploaded.

Audio capture requires a secure context. `localhost` is treated as secure by modern browsers; deployed sites should use HTTPS.

## Production image

Build the static deployment image with `make build`. Run it locally with `make preview` (port 8080 by default; override with `make PORT=8081 preview`). `make docker-down` removes the named preview container. The equivalent direct Docker commands are:

```sh
docker build --target production -t good-beats:latest .
docker run --rm -p 8080:8080 good-beats:latest
```

The final image serves the compiled app using nginx on port 8080. Replace the runtime stage or nginx configuration to integrate a later production environment.
