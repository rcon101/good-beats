---
name: good-beats-visualizer-workflow
description: Make and verify focused visual or audio-reactive changes to Good Beats' WebGL sound visualizer.
---

# Good Beats visualizer workflow

Use this for changes to the visualizer, its frequency response, fullscreen behavior, or rendering-performance controls.

1. Read the visualizer/audio sections in `.agents/references/architecture.md`; inspect the relevant code in `src/main.ts` and `src/style.css` before editing.
2. Trace the feature end to end. For frequency changes, follow analyser bins → logarithmic bands and smoothing → uniforms → GLSL sampling → visible geometry/color. Keep mappings and array/uniform counts consistent.
3. Make the smallest coherent change. Preserve the single-pass renderer, local audio processing, existing settings, high-resolution safeguards, and restrained Good Beats styling. Avoid work in the frame loop that allocates or touches the DOM.
4. Validate incrementally: let Vite hot-reload, inspect browser/runtime errors, and view the changed result. Re-enter visualizer fullscreen after reload. Test with real audio when response is the goal; do not judge only from idle animation.
5. Run `make build` when the environment permits. If it fails because of shell, Docker, or environment access, report the exact limitation and any successful browser validation separately.
6. Summarize what changed and what you verified. Do not claim audio or performance behavior was measured unless it was.
