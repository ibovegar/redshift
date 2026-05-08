import * as THREE from 'three'

export class GodRays {
  occlusionScene: THREE.Scene
  occlusionRT: THREE.WebGLRenderTarget
  overlayCamera: THREE.OrthographicCamera
  overlay: THREE.Scene
  mat: THREE.ShaderMaterial
  sunDisc: THREE.Mesh

  private geo: THREE.PlaneGeometry
  private sunDiscGeo: THREE.CircleGeometry
  private sunDiscMat: THREE.MeshBasicMaterial
  private planetOccGeo: THREE.SphereGeometry
  private planetOccMat: THREE.MeshBasicMaterial

  constructor(
    sunPos: THREE.Vector3,
    planetPosition: THREE.Vector3,
    camera: THREE.Camera,
    width: number,
    height: number
  ) {
    this.occlusionScene = new THREE.Scene()
    this.occlusionScene.background = new THREE.Color(0x000000)

    this.sunDiscGeo = new THREE.CircleGeometry(0.16, 32)
    this.sunDiscMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    this.sunDisc = new THREE.Mesh(this.sunDiscGeo, this.sunDiscMat)
    this.sunDisc.position.copy(sunPos)
    this.sunDisc.lookAt(camera.position)
    this.occlusionScene.add(this.sunDisc)

    this.planetOccGeo = new THREE.SphereGeometry(6.2, 32, 32)
    this.planetOccMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const planetOcc = new THREE.Mesh(this.planetOccGeo, this.planetOccMat)
    planetOcc.position.copy(planetPosition)
    this.occlusionScene.add(planetOcc)

    const rtWidth = Math.floor(width / 2)
    const rtHeight = Math.floor(height / 2)
    this.occlusionRT = new THREE.WebGLRenderTarget(rtWidth, rtHeight)

    this.overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    this.geo = new THREE.PlaneGeometry(2, 2)
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        tOcclusion: { value: this.occlusionRT.texture },
        uSunPos: { value: new THREE.Vector2() },
        uDensity: { value: 0.55 },
        uWeight: { value: 0.12 },
        uDecay: { value: 0.94 },
        uExposure: { value: 0.6 },
        uColor: { value: new THREE.Color(0xffeedd) },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tOcclusion;
        uniform vec2 uSunPos;
        uniform float uDensity;
        uniform float uWeight;
        uniform float uDecay;
        uniform float uExposure;
        uniform vec3 uColor;
        uniform float uTime;
        varying vec2 vUv;
        const int NUM_SAMPLES = 50;
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        void main() {
          vec2 delta = (vUv - uSunPos) * uDensity / float(NUM_SAMPLES);
          vec2 coord = vUv;
          float illuminationDecay = 1.0;
          vec3 color = vec3(0.0);
          for (int i = 0; i < NUM_SAMPLES; i++) {
            float jitter = hash(coord * 100.0 + float(i)) * 0.4 + 0.8;
            coord -= delta * jitter;
            vec3 s = texture2D(tOcclusion, coord).rgb;
            s *= illuminationDecay * uWeight;
            color += s;
            illuminationDecay *= uDecay;
          }
          float godBreath = 1.0 + sin(uTime * 0.6 + 1.0) * 0.2 + sin(uTime * 1.1) * 0.15;
          color *= uExposure * uColor * godBreath;
          float a = max(max(color.r, color.g), color.b);
          gl_FragColor = vec4(color, a);
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

  dispose() {
    this.sunDiscGeo.dispose()
    this.sunDiscMat.dispose()
    this.planetOccGeo.dispose()
    this.planetOccMat.dispose()
    this.occlusionRT.dispose()
    this.geo.dispose()
    this.mat.dispose()
  }
}
