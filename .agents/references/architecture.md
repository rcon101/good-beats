# Good Beats architecture and verification

## Runtime

- Vite and TypeScript serve the app on port `5173` during development.
- `src/main.ts` owns the WebGL canvas, GLSL shader strings, Web Audio analysis, fullscreen behavior, and persisted performance settings.
- The renderer is one full-screen WebGL draw per rendered frame. The fragment shader makes the orb, spectrum bars, and background; the CSS/HTML provide the controls and title.
- The audio analyser uses a 2048-sample FFT. JavaScript maps 32 smoothed logarithmic bands (from 32 Hz up to the lower of 16 kHz or 48% of the sample rate) into shader uniforms. The shader maps those bands across 64 angular bar segments around the orb. Keep the JS band count, uniform packing, GLSL lookup, and angular mapping in sync.
- Canvas resolution is limited by the browser/GPU viewport and a 32-million-pixel budget. Resolution and FPS controls are intentionally allowed to trade resource use for visual quality.
- Audio is processed locally. System audio uses browser display capture and a user-selected browser picker source. The app requests an ideal 1 FPS video track and keeps the display stream alive for audio compatibility, but does not render or store video frames. Microphone input uses `getUserMedia`.

## Performance and visual changes

- Keep allocations, queries, and DOM updates out of `draw()`; it executes continuously.
- Avoid adding extra full-screen passes, expensive loops, or high-frequency procedural noise without a clear visual gain.
- Preserve readable, crisp bar edges and their spectrum-driven length/color. Avoid relying on blur or glow alone to communicate amplitude.
- Check fullscreen and the normal layout. Hot reload can exit fullscreen, so re-enter it before judging the full-screen result.
- For sound-reactivity work, inspect actual audio input when possible. The idle animation only validates shader rendering, not frequency response.

## Reliable development loop

Run commands from the project directory in a Linux/WSL shell or through Docker. Invoking Windows Node tools with a `\\wsl.localhost\...` working directory can fail because Windows programs do not support UNC current directories.

```sh
make docker-up       # build and start the dev container in the background
make docker-logs     # inspect Vite/container output
make docker-bash     # shell in the running app container
make docker-down     # stop dev and named production containers
make build           # build the production Docker image
make preview         # run the production image on port 8080
```

For a host-native build, use `make host-build` after `make install` with the supported Node version. After changes, wait for Vite reload, check for shader/runtime errors, and inspect the affected UI in the browser. Use an audio source for audio-response changes. Production build success does not replace browser validation of WebGL shaders or capture flows.
