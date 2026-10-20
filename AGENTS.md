# Good Beats agent guide

Good Beats is a browser sound visualizer built with Vite, TypeScript, WebGL, and Web Audio. Keep changes focused on the existing lightweight app and preserve its visual style.

## Working rules

- Read `.agents/README.md` and the relevant reference before changing audio, rendering, or container behavior. Use `.agents/skills/visualizer-workflow/SKILL.md` for visualizer changes.
- Keep the render loop allocation-free and avoid per-frame DOM work. Prefer the existing single WebGL pass for visual effects; preserve the canvas pixel budget and frame-rate controls.
- Treat frequency mapping, shader uniforms, and audio smoothing as one data path. When changing one, update and check the other end of the path.
- Preserve browser fullscreen on the visualizer itself and keep system-audio capture compatible with the browser's screen/tab picker. The capture API may provide video with audio; do not render or store captured video.
- Verify changes before finishing. Use `make build` for the Docker production build and inspect the live app for shader/runtime and visual changes. For input-reactive changes, check with audio playing when practical; an idle preview does not verify audio response.
- Report verification accurately. If the current shell cannot access the WSL project path or required tools, use the Docker workflow or state the limitation; do not claim a build passed.

## Project entry points

- `src/main.ts`: app, WebGL shaders, audio analysis, settings, and capture flow.
- `src/style.css`, `index.html`: layout and controls.
- `Makefile`, `Dockerfile`, `docker-compose.yml`, `nginx.conf`: development and production workflows.
- `.agents/references/architecture.md`: data flow, performance constraints, and verification commands.
