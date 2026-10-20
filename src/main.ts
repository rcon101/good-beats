import './style.css'

const canvas = document.querySelector<HTMLCanvasElement>('#visualizer')!
const glContext = canvas.getContext('webgl', {
  alpha: false,
  antialias: false,
  powerPreference: 'high-performance',
})

if (!glContext) throw new Error('This visualizer needs WebGL support.')
const gl: WebGLRenderingContext = glContext

const vertexShader = `
attribute vec2 position;
varying vec2 uv;
void main() {
  uv = position * .5 + .5;
  gl_Position = vec4(position, 0., 1.);
}`

const fragmentShader = `
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
uniform float level;
uniform float bass;
uniform float treble;
uniform float beat;
uniform float motion;
uniform float intensity;
uniform float pointerInfluence;
uniform int mood;
uniform int active;
uniform int detail;
uniform vec4 spectrum0;
uniform vec4 spectrum1;
uniform vec4 spectrum2;
uniform vec4 spectrum3;
uniform vec4 spectrum4;
uniform vec4 spectrum5;
uniform vec4 spectrum6;
uniform vec4 spectrum7;

float bandAt(float i) {
  if (i < 1.) return spectrum0.x;
  if (i < 2.) return spectrum0.y;
  if (i < 3.) return spectrum0.z;
  if (i < 4.) return spectrum0.w;
  if (i < 5.) return spectrum1.x;
  if (i < 6.) return spectrum1.y;
  if (i < 7.) return spectrum1.z;
  if (i < 8.) return spectrum1.w;
  if (i < 9.) return spectrum2.x;
  if (i < 10.) return spectrum2.y;
  if (i < 11.) return spectrum2.z;
  if (i < 12.) return spectrum2.w;
  if (i < 13.) return spectrum3.x;
  if (i < 14.) return spectrum3.y;
  if (i < 15.) return spectrum3.z;
  if (i < 16.) return spectrum3.w;
  if (i < 17.) return spectrum4.x;
  if (i < 18.) return spectrum4.y;
  if (i < 19.) return spectrum4.z;
  if (i < 20.) return spectrum4.w;
  if (i < 21.) return spectrum5.x;
  if (i < 22.) return spectrum5.y;
  if (i < 23.) return spectrum5.z;
  if (i < 24.) return spectrum5.w;
  if (i < 25.) return spectrum6.x;
  if (i < 26.) return spectrum6.y;
  if (i < 27.) return spectrum6.z;
  if (i < 28.) return spectrum6.w;
  if (i < 29.) return spectrum7.x;
  if (i < 30.) return spectrum7.y;
  if (i < 31.) return spectrum7.z;
  return spectrum7.w;
}

float spectrumAt(float x) {
  float i = clamp(x, 0., 31.);
  float a = floor(i);
  return mix(bandAt(a), bandAt(min(a + 1., 31.)), fract(i));
}

vec3 palette(float t) {
  t = fract(t);
  if (mood == 1) {
    if (t < .5) return mix(vec3(.025,.12,.42), vec3(.04,.72,.84), t * 2.);
    return mix(vec3(.04,.72,.84), vec3(.72,.96,1.), (t - .5) * 2.);
  }
  if (mood == 2) {
    if (t < .5) return mix(vec3(.28,.025,.16), vec3(.96,.18,.16), t * 2.);
    return mix(vec3(.96,.18,.16), vec3(1.,.78,.28), (t - .5) * 2.);
  }
  if (t < .5) return mix(vec3(.015,.23,.2), vec3(.07,.82,.58), t * 2.);
  return mix(vec3(.07,.82,.58), vec3(.88,1.,.34), (t - .5) * 2.);
}

void main() {
  vec2 p = (gl_FragCoord.xy - .5 * resolution) / resolution.y;
  float t = time * motion;
  float energy = active == 1 ? clamp(level * 2.2, 0., 1.) : .12 + .025 * sin(t * .55);
  float low = active == 1 ? clamp(bass * 2.2, 0., 1.) : .08;
  float high = active == 1 ? clamp(treble * 2.5, 0., 1.) : .06;
  float r = length(p);
  float a = atan(p.y, p.x);
  float angle01 = fract((a + 3.14159265) / 6.2831853);
  float sector = fract(angle01 * 64.);
  float bandIndex = floor(angle01 * 64.) / 2.;
  float highBand = smoothstep(15., 31., bandIndex);
  float spectral = clamp(spectrumAt(bandIndex) * (1. + highBand * .72), 0., 1.);

  // Deep, soft nebula layers keep the luminous object suspended in space.
  vec2 q = p;
  q.x += .065 * sin(p.y * 3. + t * .17) + .025 * sin(p.y * 7. - t * .11);
  q.y += .055 * sin(p.x * 2.6 - t * .13) + .022 * cos(p.x * 6. + t * .1);
  float cloudA = exp(-abs(q.y - (.16 * sin(q.x * 1.8 + t * .12) + .12)) * 3.8) * exp(-abs(q.x) * .7);
  float cloudB = exp(-abs(q.x - (.18 * sin(q.y * 2. + t * .1) - .18)) * 4.5) * exp(-abs(q.y) * .65);
  float turbulence = sin(q.x * 4. + sin(q.y * 3. + t * .1) + t * .12);

  // The core is shaded as a glass sphere with a lit rim and moving plasma beneath it.
  float radius = .285 + low * .018 + high * .004 + spectral * (.006 + highBand * .006) + beat * .016 + .002 * sin(t * .32);
  float inside = 1. - smoothstep(radius - .008, radius + .008, r);
  vec2 surfacePoint = p / radius;
  float surfaceR2 = dot(surfacePoint, surfacePoint);
  vec3 normal = vec3(surfacePoint, sqrt(max(0., 1. - surfaceR2)));
  vec3 lightDir = normalize(vec3(-.52,.58,.84));
  float diffuse = max(dot(normal, lightDir), 0.);
  float terminator = smoothstep(-.28,.62,dot(normal, lightDir));
  float fresnel = pow(1. - normal.z, 2.5);
  float plasma = sin(surfacePoint.x * 4.8 + t * .24 + sin(surfacePoint.y * 4. + t * .16) * 1.3)
    * cos(surfacePoint.y * 5.2 - t * .21 + surfacePoint.x * 1.8);
  float liquid = .5 + .5 * sin(surfacePoint.x * 3. + surfacePoint.y * 4. + plasma * 1.7 - t * .2);
  float veins = 0.;
  for (int i = 0; i < 4; i++) {
    if (i < detail) {
      float fi = float(i);
      float vein = sin(surfacePoint.x * (7. + fi * 3.) + surfacePoint.y * (5. + fi * 2.) + plasma * 1.2 + t * (.12 + fi * .025));
      veins += exp(-abs(vein) * 22.) * (.18 / (1. + fi * .38));
    }
  }
  float specular = pow(max(dot(reflect(-lightDir, normal), vec3(0.,0.,1.)), 0.), 28.);
  vec3 sphereColor = palette(.22 + liquid * .58 + plasma * .035) * (.035 + terminator * (.28 + liquid * .27))
    + palette(.7 + liquid * .18) * veins * (1. + high * .7)
    + vec3(.58,.9,1.) * specular * 1.25
    + palette(.58 + t * .006) * fresnel * (.62 + energy * .55);

  float cursorGlow = exp(-length(q - pointer) * 4.5) * pointerInfluence;
  float rim = exp(-abs(r - radius) * 74.);
  float outerGlow = exp(-max(r - radius, 0.) * 17.) * exp(-abs(r - radius) * 2.3);
  float barEdgeFlow = sin(a * 13. + t * .28 + plasma * 1.8)
    + .42 * cos(a * 23. - t * .24 + liquid * 4.);
  float barStart = radius + .018 + barEdgeFlow * .0025;
  float barLength = .014 + spectral * (.15 + highBand * .09) + barEdgeFlow * (.006 + highBand * .003);
  float angularRipple = .035 * sin(a * 9. + t * .22 + plasma * 1.4);
  float barShape = 1. - smoothstep(.37,.405,abs(sector - .5) + angularRipple);
  float bars = barShape
    * smoothstep(barStart - .001,barStart + .0015,r)
    * (1. - smoothstep(barStart + barLength - .0015,barStart + barLength + .001,r));
  float barSideEdge = exp(-abs(abs(sector - .5) + angularRipple - .39) * 110.);
  float barTipEdge = exp(-abs(r - barStart - barLength) * 92.);
  float barHalo = barShape * spectral
    * exp(-abs(r - barStart - barLength * .55) * 42.);
  float barGrain = .5 + .5 * sin(a * 24. + sin(r * 34. + t * .18) * .8 + plasma * 1.8);
  float barFilament = exp(-abs(sin(r * 76. + sin(a * 8. + t * .15) * 1.25 + plasma * 1.8)) * 18.);
  float barTexture = .2 + .26 * barGrain + 1.12 * barFilament;
  float barFace = .58 + .42 * (1. - smoothstep(.025,.35,abs(sector - .5) + angularRipple));

  vec3 col = vec3(.004,.008,.02);
  col += palette(.2 + turbulence * .08 + t * .008) * cloudA * (.055 + energy * .075);
  col += palette(.62 + turbulence * .07 - t * .006) * cloudB * (.045 + high * .07);
  col += sphereColor * inside;
  col += palette(.58 + plasma * .04) * rim * (1.05 + energy * .65 + beat * 1.2);
  col += vec3(.72,.96,1.) * exp(-abs(r - radius) * 185.) * (.22 + energy * .28);
  col += palette(.48 + t * .008) * outerGlow * (.2 + energy * .12);
  vec3 barColor = palette(.16 + bandIndex / 31. * .72 + spectral * .16 + (barTexture - .8) * .08 + t * .003);
  col += barColor * barHalo * .012;
  col += barColor * bars * (1.05 + spectral * 1.5) * barTexture * barFace;
  col += vec3(.32,.88,1.) * bars * barFilament * (1.2 + spectral * 1.4);
  col += vec3(.42,.92,1.) * bars * (barSideEdge * .42 + barTipEdge * (.32 + highBand * high * .42));
  col += palette(.4 + t * .012) * cursorGlow * .13;
  col += vec3(.012,.019,.04) * exp(-r * 1.3);

  // Filmic rolloff keeps the highlights bright, saturated, and soft-edged.
  col *= intensity;
  col = 1. - exp(-col * 2.4);
  col = pow(max(col, vec3(0.)), vec3(.78));
  col *= 1. - .4 * smoothstep(.55, 1.25, r);
  gl_FragColor = vec4(col, 1.);
}`

function compileShader(type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed')
  }
  return shader
}

const program = gl.createProgram()!
gl.attachShader(program, compileShader(gl.VERTEX_SHADER, vertexShader))
gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentShader))
gl.linkProgram(program)
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program) || 'Shader link failed')
}
gl.useProgram(program)

const vertices = gl.createBuffer()!
gl.bindBuffer(gl.ARRAY_BUFFER, vertices)
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
  gl.STATIC_DRAW,
)
const position = gl.getAttribLocation(program, 'position')
gl.enableVertexAttribArray(position)
gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

const uniforms = Object.fromEntries(
  ['resolution', 'pointer', 'time', 'level', 'bass', 'treble', 'beat', 'motion', 'intensity', 'pointerInfluence', 'mood', 'active', 'detail', ...Array.from({ length: 8 }, (_, i) => `spectrum${i}`)]
    .map((name) => [name, gl.getUniformLocation(program, name)]),
) as Record<string, WebGLUniformLocation | null>

const audio = {
  context: null as AudioContext | null,
  analyser: null as AnalyserNode | null,
  data: null as Uint8Array | null,
  stream: null as MediaStream | null,
}

let selectedSource = 'system'
let mood = 0
let active = false
let lastRenderAt = 0
let resolutionScale = 1
let maxFps = 120
let uncapped = false
let motionScale = 1
let visualIntensity = 1
let detailLevel = 3
let pointerX = 0
let pointerY = 0
let pointerInfluence = 0
let pointerTargetX = 0
let pointerTargetY = 0
let pointerTargetInfluence = 0
const spectrumBands = new Float32Array(32)
let previousBass = 0
let beatEnvelope = 0

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!
const connectionLabel = $<HTMLElement>('#connection-label')
const startLabel = $<HTMLElement>('#start-label')
const startButton = $<HTMLButtonElement>('#start')
const resolutionInput = $<HTMLInputElement>('#resolution')
const fpsLimitInput = $<HTMLInputElement>('#fps-limit')
const detailInput = $<HTMLInputElement>('#detail')
const motionInput = $<HTMLInputElement>('#motion')
const intensityInput = $<HTMLInputElement>('#intensity')
const resolutionValue = $<HTMLOutputElement>('#resolution-value')
const fpsLimitValue = $<HTMLOutputElement>('#fps-limit-value')
const detailValue = $<HTMLOutputElement>('#detail-value')
const motionValue = $<HTMLOutputElement>('#motion-value')
const intensityValue = $<HTMLOutputElement>('#intensity-value')
const performanceToggle = $<HTMLButtonElement>('#performance-toggle')
const performanceDock = $<HTMLElement>('#performance-dock')
const uncappedToggle = $<HTMLButtonElement>('#uncapped-toggle')
const stage = document.querySelector<HTMLElement>('.stage')!
const maxViewport = gl.getParameter(gl.MAX_VIEWPORT_DIMS) as Int32Array

type Settings = { resolution: number; fps: number; uncapped: boolean; detail: number; motion: number; intensity: number }
const defaults: Settings = { resolution: 100, fps: 120, uncapped: false, detail: 3, motion: 100, intensity: 100 }

function loadSettings(): Settings {
  try {
    const stored = JSON.parse(localStorage.getItem('good-beats-settings') || '{}') as Partial<Settings>
    return {
      resolution: Math.min(300, Math.max(40, Number(stored.resolution) || defaults.resolution)),
      fps: Math.min(240, Math.max(24, Number(stored.fps) || defaults.fps)),
      uncapped: stored.uncapped === true,
      detail: Math.min(4, Math.max(1, Number(stored.detail) || defaults.detail)),
      motion: stored.motion === undefined ? defaults.motion : Math.min(200, Math.max(0, Number(stored.motion) || 0)),
      intensity: Math.min(180, Math.max(50, Number(stored.intensity) || defaults.intensity)),
    }
  } catch {
    return { ...defaults }
  }
}

function saveSettings() {
  try {
    localStorage.setItem('good-beats-settings', JSON.stringify({
      resolution: Number(resolutionInput.value),
      fps: Number(fpsLimitInput.value),
      uncapped,
      detail: Number(detailInput.value),
      motion: Number(motionInput.value),
      intensity: Number(intensityInput.value),
    } satisfies Settings))
  } catch {
    // Preferences still take effect for this page when storage is unavailable.
  }
}

function applySettings(settings: Settings) {
  resolutionInput.value = String(settings.resolution)
  fpsLimitInput.value = String(settings.fps)
  detailInput.value = String(settings.detail)
  motionInput.value = String(settings.motion)
  intensityInput.value = String(settings.intensity)

  resolutionScale = settings.resolution / 100
  maxFps = settings.fps
  uncapped = settings.uncapped
  detailLevel = settings.detail
  motionScale = settings.motion / 100
  visualIntensity = settings.intensity / 100

  resolutionValue.value = `${settings.resolution}%`
  fpsLimitValue.value = uncapped ? '∞ FPS' : `${settings.fps} FPS`
  detailValue.value = `${settings.detail} / 4`
  motionValue.value = `${settings.motion}%`
  intensityValue.value = `${settings.intensity}%`
  fpsLimitInput.disabled = uncapped
  uncappedToggle.setAttribute('aria-pressed', String(uncapped))
  uncappedToggle.classList.toggle('active', uncapped)
  resizeCanvas()
}

function currentSettings(): Settings {
  return {
    resolution: Number(resolutionInput.value),
    fps: Number(fpsLimitInput.value),
    uncapped,
    detail: Number(detailInput.value),
    motion: Number(motionInput.value),
    intensity: Number(intensityInput.value),
  }
}

const initialSettings = loadSettings()
resolutionInput.value = String(initialSettings.resolution)
fpsLimitInput.value = String(initialSettings.fps)
detailInput.value = String(initialSettings.detail)
motionInput.value = String(initialSettings.motion)
intensityInput.value = String(initialSettings.intensity)
uncapped = initialSettings.uncapped

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect()
  const requestedScale = (devicePixelRatio || 1) * resolutionScale
  const pixelBudgetScale = Math.sqrt(32_000_000 / Math.max(1, rect.width * rect.height))
  const renderScale = Math.min(requestedScale, maxViewport[0] / rect.width, maxViewport[1] / rect.height, pixelBudgetScale)
  const width = Math.max(1, Math.floor(rect.width * renderScale))
  const height = Math.max(1, Math.floor(rect.height * renderScale))

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width
    canvas.height = height
    gl.viewport(0, 0, width, height)
  }
}

new ResizeObserver(resizeCanvas).observe(canvas)
window.addEventListener('resize', resizeCanvas)
resizeCanvas()
applySettings(initialSettings)

function draw(now: number) {
  requestAnimationFrame(draw)
  const frameInterval = uncapped ? 0 : 1000 / maxFps
  if (lastRenderAt && now - lastRenderAt + .2 < frameInterval) return
  const deltaMs = lastRenderAt ? now - lastRenderAt : 1000 / 60
  lastRenderAt = now
  const pointerEase = 1 - Math.exp(-deltaMs * .006)
  pointerX += (pointerTargetX - pointerX) * pointerEase
  pointerY += (pointerTargetY - pointerY) * pointerEase
  pointerInfluence += (pointerTargetInfluence - pointerInfluence) * pointerEase

  const data = audio.data
  if (data && audio.analyser) audio.analyser.getByteFrequencyData(data)

  let level = 0
  let bass = 0
  let treble = 0
  if (data) {
    const sampleRate = audio.context?.sampleRate || 48000
    const binHz = sampleRate / (audio.analyser!.fftSize)
    const minHz = 32
    const maxHz = Math.min(16000, sampleRate * .48)
    const logRange = Math.log(maxHz / minHz)
    for (let band = 0; band < spectrumBands.length; band++) {
      const startHz = minHz * Math.exp(logRange * band / spectrumBands.length)
      const endHz = minHz * Math.exp(logRange * (band + 1) / spectrumBands.length)
      const startBin = Math.max(1, Math.floor(startHz / binHz))
      const endBin = Math.max(startBin + 1, Math.ceil(endHz / binHz))
      let sum = 0
      for (let bin = startBin; bin < Math.min(endBin, data.length); bin++) sum += data[bin] / 255
      const average = sum / Math.max(1, Math.min(endBin, data.length) - startBin)
      // A small noise gate keeps the visual quiet between notes; the soft
      // curve gives delicate upper harmonics enough range to register.
      const target = Math.pow(Math.max(0, average - .018), .74)
      const attack = band >= 10 ? .82 : .68
      const release = band >= 10 ? .3 : .22
      const smoothing = target > spectrumBands[band] ? attack : release
      spectrumBands[band] += (target - spectrumBands[band]) * smoothing
    }
    for (let band = 0; band < spectrumBands.length; band++) {
      const value = spectrumBands[band]
      level += value / spectrumBands.length
      if (band < 8) bass += value / 8
      if (band >= 24) treble += value / 8
    }
    const onset = Math.max(0, bass - previousBass) * 4.5
    beatEnvelope = Math.max(beatEnvelope * .82, onset)
    previousBass = bass
  } else {
    spectrumBands.fill(0)
    previousBass = 0
    beatEnvelope *= .82
  }

  gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
  gl.uniform2f(uniforms.pointer, pointerX, pointerY)
  gl.uniform1f(uniforms.time, now * .001)
  gl.uniform1f(uniforms.level, level)
  gl.uniform1f(uniforms.bass, bass)
  gl.uniform1f(uniforms.treble, treble)
  gl.uniform1f(uniforms.beat, beatEnvelope)
  gl.uniform1f(uniforms.motion, motionScale)
  gl.uniform1f(uniforms.intensity, visualIntensity)
  gl.uniform1f(uniforms.pointerInfluence, pointerInfluence)
  gl.uniform1i(uniforms.mood, mood)
  gl.uniform1i(uniforms.active, active ? 1 : 0)
  gl.uniform1i(uniforms.detail, detailLevel)
  for (let group = 0; group < 8; group++) {
    gl.uniform4fv(uniforms[`spectrum${group}`], spectrumBands.subarray(group * 4, group * 4 + 4))
  }
  gl.drawArrays(gl.TRIANGLES, 0, 6)
}

requestAnimationFrame(draw)

async function stopListening() {
  active = false
  audio.stream?.getTracks().forEach((track) => track.stop())
  audio.stream = null
  audio.analyser = null
  audio.data = null

  if (audio.context) {
    await audio.context.close()
    audio.context = null
  }

  startLabel.textContent = 'Start listening'
  connectionLabel.textContent = 'READY WHEN YOU ARE'
  startButton.classList.remove('listening')
}

async function requestAudioStream() {
  if (selectedSource === 'mic') {
    return navigator.mediaDevices.getUserMedia({ audio: true })
  }

  const displayOptions = {
    // Screen capture APIs require video. Ask for the lowest practical frame
    // rate because Good Beats keeps the track alive for audio only.
    video: { frameRate: { ideal: 1 } },
    audio: true,
    systemAudio: 'include',
  } as DisplayMediaStreamOptions & { systemAudio: 'include' | 'exclude' }
  const displayStream = await navigator.mediaDevices.getDisplayMedia(displayOptions)
  const audioTracks = displayStream.getAudioTracks()

  if (!audioTracks.length) {
    displayStream.getTracks().forEach((track) => track.stop())
    throw new Error('The browser shared video but no audio. In the picker, choose your screen and enable Share system audio, or choose a Chrome tab and enable Share tab audio. Some browsers do not support system audio capture.')
  }

  // Keep the complete display stream alive for the whole session. Some browser
  // capture implementations tie the audio track lifetime to the video track;
  // stopping video immediately can silently stop system audio too. We never
  // render or store the video frames.
  return displayStream
}

async function beginListening() {
  if (active) {
    await stopListening()
    return
  }

  try {
    const stream = await requestAudioStream()
    audio.stream = stream

    const context = new AudioContext()
    audio.context = context
    await context.resume()

    const source = context.createMediaStreamSource(stream)
    const analyser = context.createAnalyser()
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = .68
    analyser.minDecibels = -90
    analyser.maxDecibels = -20
    source.connect(analyser)
    audio.analyser = analyser
    audio.data = new Uint8Array(analyser.frequencyBinCount)

    active = true
    startLabel.textContent = 'Stop listening'
    connectionLabel.textContent = selectedSource === 'mic' ? 'MICROPHONE CONNECTED' : 'SYSTEM AUDIO CONNECTED'
    startButton.classList.add('listening')

    stream.getTracks().forEach((track) => {
      track.addEventListener('ended', () => {
        if (active) void stopListening()
      })
    })
  } catch {
    await stopListening()
    connectionLabel.textContent = 'INPUT UNAVAILABLE'
  }
}

startButton.addEventListener('click', () => void beginListening())

document.querySelectorAll<HTMLButtonElement>('.source-button').forEach((button) => {
  button.addEventListener('click', () => {
    if (active) return
    selectedSource = button.dataset.source || 'system'
    document.querySelectorAll('.source-button').forEach((option) => {
      option.classList.toggle('active', option === button)
    })
  })
})

document.querySelectorAll<HTMLButtonElement>('.mood-button').forEach((button, index) => {
  button.addEventListener('click', () => {
    mood = index
    document.querySelectorAll('.mood-button').forEach((option) => {
      option.classList.toggle('active', option === button)
    })
  })
})

function updateSettings() {
  applySettings(currentSettings())
  saveSettings()
}

for (const input of [resolutionInput, fpsLimitInput, detailInput, motionInput, intensityInput]) {
  input.addEventListener('input', updateSettings)
}

uncappedToggle.addEventListener('click', () => {
  uncapped = !uncapped
  updateSettings()
})

$('#reset-settings').addEventListener('click', () => {
  uncapped = defaults.uncapped
  applySettings({ ...defaults })
  saveSettings()
})

function setSettingsOpen(open: boolean) {
  performanceDock.hidden = !open
  performanceToggle.setAttribute('aria-expanded', String(open))
  performanceToggle.setAttribute('aria-label', `${open ? 'Close' : 'Open'} visualizer settings`)
  if (open) resolutionInput.focus({ preventScroll: true })
}

performanceToggle.addEventListener('click', () => setSettingsOpen(performanceDock.hidden))
$('#close-settings').addEventListener('click', () => {
  setSettingsOpen(false)
  performanceToggle.focus()
})

stage.addEventListener('pointermove', (event) => {
  const rect = stage.getBoundingClientRect()
  pointerTargetX = ((event.clientX - rect.left) / rect.width - .5) * (rect.width / rect.height)
  pointerTargetY = .5 - (event.clientY - rect.top) / rect.height
  pointerTargetInfluence = 1
})
stage.addEventListener('pointerleave', () => { pointerTargetInfluence = 0 })

const fullscreenButton = $<HTMLButtonElement>('#fullscreen')

fullscreenButton.addEventListener('click', () => {
  if (document.fullscreenElement === stage) {
    void document.exitFullscreen().catch(() => {
      connectionLabel.textContent = 'USE ESC TO EXIT FULLSCREEN'
    })
  } else {
    void stage.requestFullscreen().catch(() => {
      connectionLabel.textContent = 'FULLSCREEN UNAVAILABLE'
    })
  }
})

document.addEventListener('fullscreenchange', () => {
  const isFullscreen = document.fullscreenElement === stage
  fullscreenButton.setAttribute('aria-label', `${isFullscreen ? 'Exit' : 'Enter'} visualizer fullscreen`)
  fullscreenButton.title = `${isFullscreen ? 'Exit' : 'Enter'} visualizer fullscreen`
})

window.addEventListener('pagehide', () => {
  audio.stream?.getTracks().forEach((track) => track.stop())
})
