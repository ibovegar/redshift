import * as THREE from 'three'

export class SolarWave {
  overlay: THREE.Scene
  mat: THREE.ShaderMaterial

  private geo: THREE.PlaneGeometry
  private active = false
  private waveProgress = [0, 0, 0]
  private delays = [0, 0, 0]
  private triggered = false

  get isActive() {
    return this.active
  }

  constructor(width: number, height: number) {
    this.geo = new THREE.PlaneGeometry(2, 2)
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uSunPos: { value: new THREE.Vector2() },
        uAspect: { value: width / height },
        uProgress1: { value: 0.0 },
        uProgress2: { value: 0.0 },
        uProgress3: { value: 0.0 },
        uIntensity1: { value: 0.0 },
        uIntensity2: { value: 0.0 },
        uIntensity3: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec2 uSunPos;
        uniform float uAspect;
        uniform float uProgress1;
        uniform float uProgress2;
        uniform float uProgress3;
        uniform float uIntensity1;
        uniform float uIntensity2;
        uniform float uIntensity3;
        varying vec2 vUv;
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          float a = hash(i);
          float b = hash(i + vec2(1.0, 0.0));
          float c = hash(i + vec2(0.0, 1.0));
          float d = hash(i + vec2(1.0, 1.0));
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        float waveRing(float dist, float angle, float progress, float seed) {
          float radius = progress * 2.5;
          if (radius < 0.01) return 0.0;
          float n = noise(vec2(angle * 3.0 + seed, progress * 4.0 + seed)) * 0.15;
          float n2 = noise(vec2(angle * 7.0 + seed * 2.0, progress * 2.0)) * 0.08;
          float distort = dist + n + n2;
          float ring = exp(-pow((distort - radius) * 4.0, 2.0));
          float trail = exp(-pow((distort - radius * 0.7) * 2.0, 2.0)) * 0.4;
          float outer = exp(-pow((distort - radius * 1.1) * 5.0, 2.0)) * 0.25;
          return ring + trail + outer;
        }
        void main() {
          vec2 aspect = vec2(uAspect, 1.0);
          vec2 delta = (vUv - uSunPos) * aspect;
          float dist = length(delta);
          float angle = atan(delta.y, delta.x);
          float w1 = waveRing(dist, angle, uProgress1, 0.0) * uIntensity1;
          float w2 = waveRing(dist, angle, uProgress2, 3.7) * uIntensity2;
          float w3 = waveRing(dist, angle, uProgress3, 7.2) * uIntensity3;
          float wave = w1 + w2 + w3;
          float avgProgress = (uProgress1 + uProgress2 + uProgress3) / 3.0;
          vec3 color = mix(vec3(1.0, 0.85, 0.5), vec3(1.0, 0.6, 0.3), avgProgress);
          gl_FragColor = vec4(color * wave, wave);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    })
    const quad = new THREE.Mesh(this.geo, this.mat)
    quad.frustumCulled = false
    this.overlay = new THREE.Scene()
    this.overlay.add(quad)
  }

  update(dt: number, sunUVx: number, sunUVy: number, solarActive: boolean, solarCooldown: boolean) {
    if (solarActive && !this.triggered) {
      this.triggered = true
      this.active = true
      this.waveProgress = [0, 0, 0]
      this.delays = [0, 0.4 + Math.random() * 0.6, 1.0 + Math.random() * 1.0]
    }
    if (!solarActive && !solarCooldown) {
      this.triggered = false
    }
    if (this.active) {
      this.mat.uniforms.uSunPos.value.set(sunUVx, sunUVy)
      let anyActive = false
      for (let i = 0; i < 3; i++) {
        this.delays[i] -= dt
        if (this.delays[i] <= 0) {
          const speed = 0.08 + i * 0.02 + this.waveProgress[i] * 0.4
          this.waveProgress[i] += dt * speed
        }
        const p = this.waveProgress[i]
        const fade = p < 0.3 ? p / 0.3 : Math.max(0, 1 - (p - 0.3) / 0.7)
        const key = `uProgress${i + 1}` as 'uProgress1' | 'uProgress2' | 'uProgress3'
        const iKey = `uIntensity${i + 1}` as 'uIntensity1' | 'uIntensity2' | 'uIntensity3'
        this.mat.uniforms[key].value = p
        this.mat.uniforms[iKey].value = fade * (0.6 + i * 0.15)
        if (p < 1) anyActive = true
      }
      if (!anyActive) this.active = false
    } else {
      this.mat.uniforms.uIntensity1.value = 0
      this.mat.uniforms.uIntensity2.value = 0
      this.mat.uniforms.uIntensity3.value = 0
    }
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
  }
}
