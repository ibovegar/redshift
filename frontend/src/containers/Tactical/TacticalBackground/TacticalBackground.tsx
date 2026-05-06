import { Button } from '@mui/material'
import { BarButton } from 'components/BarButton/BarButton'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { Ship } from './Ship'

const ASTEROID_COUNT_FAR = 600
const ASTEROID_COUNT_NEAR = 150
const FAR_SPEED = 0.00025
const NEAR_SPEED = 0.00045
const SPREAD_X = 4.8
const SPREAD_Y = 2.4
const SPREAD_Z = 1.8

const CHUNK_COUNT = 16

function createAsteroidGeometry(radius: number, seed: number): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(radius, 3)
  const pos = geo.attributes.position
  const rng = (s: number) => {
    s = Math.sin(s * 127.1 + 311.7) * 43758.5453
    return s - Math.floor(s)
  }

  // Per-axis scale gives fundamentally different shapes: flat, elongated, or round
  const scaleX = 0.15 + rng(seed * 1.1 + 0.1) * 2.5
  const scaleY = 0.15 + rng(seed * 2.3 + 0.2) * 2.5
  const scaleZ = 0.15 + rng(seed * 3.7 + 0.3) * 2.5

  // Random dent/bulge directions for organic shapes
  const dents = 4 + Math.floor(rng(seed * 5.1) * 5) // 4-8 dents per asteroid
  const dentDirs: [number, number, number, number][] = []
  for (let d = 0; d < dents; d++) {
    const dx = rng(seed * 11.3 + d * 7.1) * 2 - 1
    const dy = rng(seed * 13.7 + d * 9.3) * 2 - 1
    const dz = rng(seed * 17.1 + d * 11.7) * 2 - 1
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1
    const strength = (rng(seed * 19.3 + d * 3.1) - 0.5) * 0.9
    dentDirs.push([dx / len, dy / len, dz / len, strength])
  }

  // Fine displacement for subtle surface roughness
  const displaceStrength = 0.1 + rng(seed * 4.9 + 0.4) * 0.25

  for (let i = 0; i < pos.count; i++) {
    const nx = pos.getX(i) / radius
    const ny = pos.getY(i) / radius
    const nz = pos.getZ(i) / radius

    // Smooth dents/bulges based on dot product with random directions
    let dentFactor = 1.0
    for (const [dx, dy, dz, str] of dentDirs) {
      const dot = nx * dx + ny * dy + nz * dz
      const influence = Math.max(0, dot) ** 2
      dentFactor += str * influence
    }

    const noise = 1.0 + (rng(nx * 7.3 + ny * 13.1 + nz * 5.7 + seed) - 0.5) * displaceStrength
    const factor = noise * dentFactor
    pos.setXYZ(i, pos.getX(i) * factor * scaleX, pos.getY(i) * factor * scaleY, pos.getZ(i) * factor * scaleZ)
  }
  geo.computeVertexNormals()
  return geo
}

interface AsteroidBeltData {
  positions: Float32Array
  rotations: Float32Array
  rotationSpeeds: Float32Array
  scales: Float32Array
}

function createAsteroidData(count: number, spreadX: number, spreadY: number, spreadZ: number): AsteroidBeltData {
  const positions = new Float32Array(count * 3)
  const rotations = new Float32Array(count * 3)
  const rotationSpeeds = new Float32Array(count * 3)
  const scales = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3] = (Math.random() - 0.5) * spreadX * 2
    positions[i3 + 1] = (Math.random() - 0.5) * spreadY
    positions[i3 + 2] = (Math.random() - 0.5) * spreadZ

    rotations[i3] = Math.random() * Math.PI * 2
    rotations[i3 + 1] = Math.random() * Math.PI * 2
    rotations[i3 + 2] = Math.random() * Math.PI * 2

    rotationSpeeds[i3] = (Math.random() - 0.5) * 0.001
    rotationSpeeds[i3 + 1] = (Math.random() - 0.5) * 0.001
    rotationSpeeds[i3 + 2] = (Math.random() - 0.5) * 0.001

    scales[i] = 0.01 + Math.random() ** 3 * 4.0
  }

  return { positions, rotations, rotationSpeeds, scales }
}

function updateAsteroids(
  data: AsteroidBeltData,
  meshes: THREE.InstancedMesh[],
  assignments: number[],
  counters: number[],
  speed: number,
  spreadX: number,
  dummy: THREE.Object3D,
  arcSign: number = 1
) {
  const count = data.scales.length
  for (let c = 0; c < counters.length; c++) counters[c] = 0
  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    data.positions[i3] -= speed

    if (data.positions[i3] < -spreadX) {
      data.positions[i3] = spreadX + Math.random() * 10
    }

    // Arc: quadratic curve — rises from bottom-right, peaks in the middle, descends top-left
    const t = (data.positions[i3] + spreadX) / (spreadX * 2)
    const arc = arcSign * (-2.7 * (t - 0.5) * (t - 0.5) + 0.66) + (t - 0.5) * 0.9
    const yBase = data.positions[i3 + 1]

    data.rotations[i3] += data.rotationSpeeds[i3]
    data.rotations[i3 + 1] += data.rotationSpeeds[i3 + 1]
    data.rotations[i3 + 2] += data.rotationSpeeds[i3 + 2]

    dummy.position.set(data.positions[i3], yBase + arc, data.positions[i3 + 2])
    dummy.rotation.set(data.rotations[i3], data.rotations[i3 + 1], data.rotations[i3 + 2])
    const s = data.scales[i]
    dummy.scale.set(s, s, s)
    dummy.updateMatrix()
    const chunkIdx = assignments[i]
    meshes[chunkIdx].setMatrixAt(counters[chunkIdx], dummy.matrix)
    counters[chunkIdx]++
  }
  for (let c = 0; c < meshes.length; c++) {
    meshes[c].instanceMatrix.needsUpdate = true
  }
}

export const TacticalBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuLineRef = useRef<SVGLineElement>(null)
  const travelLineRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = window.innerWidth
    const height = window.innerHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    renderer.setSize(width, height)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping
    renderer.setClearColor(0x000000, 1)
    container.appendChild(renderer.domElement)

    // No ambient light — dark side must be pitch black
    scene.environment = null

    // Planet — textured with moon map
    const sunDirection = new THREE.Vector3(2.0, 1.2, -0.8).normalize()
    const textureLoader = new THREE.TextureLoader()
    const planetTexture = textureLoader.load('/images/planets/8k_mars.jpg')
    planetTexture.colorSpace = THREE.SRGBColorSpace
    planetTexture.minFilter = THREE.LinearMipmapLinearFilter
    planetTexture.magFilter = THREE.LinearFilter
    planetTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    planetTexture.generateMipmaps = true
    const planetGeo = new THREE.SphereGeometry(18.5, 128, 128)
    const planetMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: sunDirection },
        uTexture: { value: planetTexture },
        uTime: { value: 0.0 },
        uHover: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform sampler2D uTexture;
        uniform float uHover;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          vec3 color = texture2D(uTexture, vUv).rgb;
          color = color * vec3(0.4, 0.5, 1.5);
          float light = dot(vNormal, uSunDir);
          light = smoothstep(-0.15, 0.45, light) * 2.5;
          vec3 lit = color * light;
          vec3 blue = vec3(0.15, 0.25, 0.6);
          lit = mix(lit, lit + blue, uHover);
          gl_FragColor = vec4(lit, 1.0);
        }
      `
    })
    const planet = new THREE.Mesh(planetGeo, planetMat)
    planet.position.set(-13.5, -4.5, -55)
    planet.rotation.x = 0.3
    planet.scale.x = 0.94
    scene.add(planet)

    // Atmosphere halo — fading glow around the planet edge
    const atmosGeo = new THREE.SphereGeometry(19.2, 64, 64)
    const atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: sunDirection },
        uColor: { value: new THREE.Color(0x8899bb) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
          vViewDir = normalize(-mvPos.xyz);
          gl_Position = projectionMatrix * mvPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform vec3 uColor;
        varying vec3 vNormal;
        varying vec3 vViewDir;
        void main() {
          vec3 n = -vNormal;
          float facing = max(dot(n, vViewDir), 0.0);
          float intensity = pow(1.0 - facing, 0.3);
          float fadeOut = smoothstep(0.0, 0.3, facing);
          float glow = intensity * fadeOut;
          float light = dot(-n, uSunDir);
          float litMask = smoothstep(-0.2, 0.5, light);
          float alpha = glow * litMask * 1.0;
          gl_FragColor = vec4(uColor * glow * litMask * 1.5, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending
    })
    const atmosphere = new THREE.Mesh(atmosGeo, atmosMat)
    atmosphere.position.copy(planet.position)
    atmosphere.scale.x = 0.94
    scene.add(atmosphere)

    // Cloud layer — slightly larger sphere with cloud texture as alpha
    const cloudTexture = textureLoader.load('/images/planets/8k_earth_clouds.jpg')
    cloudTexture.colorSpace = THREE.SRGBColorSpace
    cloudTexture.minFilter = THREE.LinearMipmapLinearFilter
    cloudTexture.magFilter = THREE.LinearFilter
    cloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    const cloudGeo = new THREE.SphereGeometry(18.7, 128, 128)
    const cloudMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: sunDirection },
        uTexture: { value: cloudTexture }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uSunDir;
        uniform sampler2D uTexture;
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          float cloud = texture2D(uTexture, vUv).r;
          cloud = smoothstep(0.15, 0.65, cloud);
          float light = dot(vNormal, uSunDir);
          light = smoothstep(0.08, 0.38, light) * 1.35;
          vec3 color = vec3(0.95, 0.9, 0.85) * cloud * light;
          gl_FragColor = vec4(color, cloud * light);
        }
      `,
      transparent: true,
      depthWrite: false
    })
    const clouds = new THREE.Mesh(cloudGeo, cloudMat)
    clouds.position.copy(planet.position)
    clouds.rotation.x = 0.3
    clouds.scale.x = 0.94
    scene.add(clouds)

    // Stars — milky way flat background
    const starTexture = textureLoader.load('/images/planets/8k_stars_milky_way.jpg')
    starTexture.colorSpace = THREE.SRGBColorSpace
    starTexture.minFilter = THREE.LinearMipmapLinearFilter
    starTexture.magFilter = THREE.LinearFilter
    const starZ = -76
    const starDist = Math.abs(starZ - camera.position.z)
    const starH = 2 * starDist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
    const starW = starH * camera.aspect
    const starGeo = new THREE.PlaneGeometry(starW * 1.7, starH * 1.7)
    const starMat = new THREE.MeshBasicMaterial({
      map: starTexture
    })
    const stars = new THREE.Mesh(starGeo, starMat)
    stars.position.set(-1, 2, starZ)
    scene.add(stars)

    // Sun — enhanced multi-layered glow with animated corona
    const sunPos = new THREE.Vector3(11.5, 5, -20)
    const sunGlowGeo = new THREE.PlaneGeometry(6.5, 6.5)
    const sunGlowMat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xffeedd) },
        uTime: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uTime;
        varying vec2 vUv;
        void main() {
          vec2 center = vUv - 0.5;
          float d = length(center) * 2.0;
          float angle = atan(center.y, center.x);

          float core = exp(-d * 90.0) * 2.0;
          core *= 1.0;

          float spikes = 0.0;
          for (int j = 0; j < 16; j++) {
            float sa = float(j) * 6.28318 / 16.0;
            float spike = pow(max(cos(angle - sa), 0.0), 100.0);
            spike *= exp(-d * 12.0);
            spikes += spike;
          }

          float longRays = 0.0;
          float rayAngles[5];
          rayAngles[0] = 0.3;  rayAngles[1] = 1.7;
          rayAngles[2] = 3.1;  rayAngles[3] = 4.3;
          rayAngles[4] = 5.4;
          float rayLengths[5];
          rayLengths[0] = 2.5; rayLengths[1] = 8.0;
          rayLengths[2] = 4.0; rayLengths[3] = 10.0;
          rayLengths[4] = 3.0;
          float rayWidths[5];
          rayWidths[0] = 250.0; rayWidths[1] = 350.0;
          rayWidths[2] = 200.0; rayWidths[3] = 300.0;
          rayWidths[4] = 280.0;
          for (int j = 0; j < 5; j++) {
            float ra = rayAngles[j];
            float ray = pow(max(cos(angle - ra), 0.0), rayWidths[j]);
            ray *= exp(-d * rayLengths[j]) * 0.8;
            longRays += ray;
          }

          float glow = exp(-d * 14.0) * 0.9;
          glow += exp(-d * 6.0) * 0.5;
          glow += exp(-d * 2.5) * 0.2;
          glow += exp(-d * 1.0) * 0.1;

          float intensity = core + spikes * 0.35 + longRays + glow;
          vec3 color = uColor * intensity;
          color += vec3(0.2, 0.2, 0.4) * core * 0.2;

          gl_FragColor = vec4(color, intensity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    const sunGlow = new THREE.Mesh(sunGlowGeo, sunGlowMat)
    sunGlow.position.copy(sunPos)
    scene.add(sunGlow)

    // Lighting for asteroids
    const asteroidLight = new THREE.DirectionalLight(0xffffff, 7)
    asteroidLight.position.set(12, 4, -10)
    scene.add(asteroidLight)

    const asteroidFill = new THREE.DirectionalLight(0x667799, 1.5)
    asteroidFill.position.set(-10, -2, 5)
    scene.add(asteroidFill)

    const asteroidAmbient = new THREE.AmbientLight(0x445566, 0.8)
    scene.add(asteroidAmbient)

    // Asteroid chunk textures
    const asteroidTextures: THREE.Texture[] = []
    for (let i = 0; i < CHUNK_COUNT; i++) {
      const tex = textureLoader.load(`/images/asteroids/chunk_${String(i).padStart(2, '0')}.jpg`)
      tex.colorSpace = THREE.SRGBColorSpace
      asteroidTextures.push(tex)
    }

    // Asteroid materials — one per chunk
    const farAsteroidMats = asteroidTextures.map(
      (tex) =>
        new THREE.MeshStandardMaterial({
          map: tex,
          color: 0xaaccff,
          roughness: 0.7,
          metalness: 0.05
        })
    )
    const nearAsteroidMats = asteroidTextures.map(
      (tex) =>
        new THREE.MeshStandardMaterial({
          map: tex,
          color: 0xaaccff,
          roughness: 0.65,
          metalness: 0.05
        })
    )

    // Assign each asteroid a random chunk
    const farAssignments = Array.from({ length: ASTEROID_COUNT_FAR }, () => Math.floor(Math.random() * CHUNK_COUNT))
    const nearAssignments = Array.from({ length: ASTEROID_COUNT_NEAR }, () => Math.floor(Math.random() * CHUNK_COUNT))

    // Count per chunk
    const farCounts = new Array(CHUNK_COUNT).fill(0)
    const nearCounts = new Array(CHUNK_COUNT).fill(0)
    for (const a of farAssignments) farCounts[a]++
    for (const a of nearAssignments) nearCounts[a]++

    // Far asteroid belt — one InstancedMesh per chunk, each with a unique rocky shape
    const farGeos = Array.from({ length: CHUNK_COUNT }, (_, i) => createAsteroidGeometry(0.015, i * 3.7))
    const farGroup = new THREE.Group()
    const farMeshes = farAsteroidMats.map((mat, i) => {
      const mesh = new THREE.InstancedMesh(farGeos[i], mat, farCounts[i])
      farGroup.add(mesh)
      return mesh
    })
    const farData = createAsteroidData(ASTEROID_COUNT_FAR, SPREAD_X, SPREAD_Y * 0.5, SPREAD_Z)
    for (let i = 0; i < ASTEROID_COUNT_FAR; i++) {
      farData.positions[i * 3 + 1] -= 0.2
    }
    scene.add(farGroup)

    // Near asteroid belt — one InstancedMesh per chunk, each with a unique rocky shape
    const nearGeos = Array.from({ length: CHUNK_COUNT }, (_, i) => createAsteroidGeometry(0.024, i * 5.3 + 100))
    const nearGroup = new THREE.Group()
    const nearMeshes = nearAsteroidMats.map((mat, i) => {
      const mesh = new THREE.InstancedMesh(nearGeos[i], mat, nearCounts[i])
      nearGroup.add(mesh)
      return mesh
    })
    const nearData = createAsteroidData(ASTEROID_COUNT_NEAR, SPREAD_X, SPREAD_Y * 0.45, 0.9)
    for (let i = 0; i < ASTEROID_COUNT_NEAR; i++) {
      nearData.positions[i * 3 + 1] -= 0.5
      nearData.positions[i * 3 + 2] += 0.6
      nearData.scales[i] *= 1.4
    }
    scene.add(nearGroup)

    const dummy = new THREE.Object3D()
    const farCounters = new Array(CHUNK_COUNT).fill(0)
    const nearCounters = new Array(CHUNK_COUNT).fill(0)

    // Set initial instance matrices
    updateAsteroids(farData, farMeshes, farAssignments, farCounters, 0, SPREAD_X, dummy, -1)
    updateAsteroids(nearData, nearMeshes, nearAssignments, nearCounters, 0, SPREAD_X, dummy, -1)

    // --- Ships ---
    const gltfLoader = new GLTFLoader()
    const ship = new Ship({
      modelPath: '/models/tellrx5.glb',
      name: 'TELLUS RX 5',
      position: [1.2, 0.25, -3.5],
      rotation: [0.2, -0.6, 0.12],
      scale: 0.012,
      camOffset: 0.4,
      ringTilt: [0.7, -0.4, 0.2]
    })
    ship.addToScene(scene)
    ship.load(gltfLoader)

    // --- Travel mode line (ship to cursor) ---
    const travelLineMat = new THREE.LineDashedMaterial({
      color: 0x66ccff,
      dashSize: 0.04,
      gapSize: 0.03,
      transparent: true,
      opacity: 0.85
    })
    const travelLineGeo = new THREE.BufferGeometry()
    travelLineGeo.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3))
    const travelLine = new THREE.Line(travelLineGeo, travelLineMat)
    travelLine.visible = false
    scene.add(travelLine)

    // --- Asteroid hover highlight ---
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const highlightMesh = new THREE.Mesh(new THREE.BufferGeometry(), highlightMat)
    highlightMesh.visible = false
    highlightMesh.matrixAutoUpdate = false
    scene.add(highlightMesh)

    // --- God Rays setup ---
    const occlusionScene = new THREE.Scene()
    occlusionScene.background = new THREE.Color(0x000000)

    const sunDiscGeo = new THREE.CircleGeometry(0.16, 32)
    const sunDiscMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const sunDisc = new THREE.Mesh(sunDiscGeo, sunDiscMat)
    sunDisc.position.copy(sunPos)
    sunDisc.lookAt(camera.position)
    occlusionScene.add(sunDisc)

    const planetOccGeo = new THREE.SphereGeometry(6.2, 32, 32)
    const planetOccMat = new THREE.MeshBasicMaterial({ color: 0x000000 })
    const planetOcc = new THREE.Mesh(planetOccGeo, planetOccMat)
    planetOcc.position.copy(planet.position)
    occlusionScene.add(planetOcc)

    let rtWidth = Math.floor(width / 2)
    let rtHeight = Math.floor(height / 2)
    const occlusionRT = new THREE.WebGLRenderTarget(rtWidth, rtHeight)

    const overlayCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
    const godRayGeo = new THREE.PlaneGeometry(2, 2)
    const godRayMat = new THREE.ShaderMaterial({
      uniforms: {
        tOcclusion: { value: occlusionRT.texture },
        uSunPos: { value: new THREE.Vector2() },
        uDensity: { value: 0.55 },
        uWeight: { value: 0.12 },
        uDecay: { value: 0.94 },
        uExposure: { value: 0.6 },
        uColor: { value: new THREE.Color(0xffeedd) }
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
          color *= uExposure * uColor;
          float a = max(max(color.r, color.g), color.b);
          gl_FragColor = vec4(color, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    })
    const godRayQuad = new THREE.Mesh(godRayGeo, godRayMat)
    godRayQuad.frustumCulled = false
    const godRayOverlay = new THREE.Scene()
    godRayOverlay.add(godRayQuad)

    // --- Lens Flare setup ---
    const lensFlareGeo = new THREE.PlaneGeometry(2, 2)
    const lensFlareMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunPos: { value: new THREE.Vector2() },
        uAspect: { value: width / height },
        uIntensity: { value: 0.4 }
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
        uniform float uIntensity;
        varying vec2 vUv;
        void main() {
          vec2 sunToCenter = vec2(0.5) - uSunPos;
          vec3 flare = vec3(0.0);
          vec2 aspect = vec2(uAspect, 1.0);
          for (int i = 0; i < 8; i++) {
            float t = float(i) / 7.0 * 1.6 + 0.2;
            vec2 ghostPos = uSunPos + sunToCenter * t;
            float size = 0.025 + float(i) * 0.006;
            float dist = length((vUv - ghostPos) * aspect);
            vec3 gc = vec3(0.5, 0.45, 0.7);
            if (i == 1) gc = vec3(0.7, 0.45, 0.3);
            if (i == 2) gc = vec3(0.3, 0.55, 0.45);
            if (i == 3) gc = vec3(0.45, 0.35, 0.65);
            if (i == 5) gc = vec3(0.35, 0.6, 0.5);
            if (i == 6) gc = vec3(0.6, 0.45, 0.35);
            if (i == 7) gc = vec3(0.45, 0.5, 0.7);
            float outer = smoothstep(size, size * 0.2, dist);
            float inner = smoothstep(size * 0.7, size * 0.5, dist);
            flare += (outer - inner * 0.65) * gc * 0.07;
          }
          float sy = exp(-pow(abs(vUv.y - uSunPos.y) * 50.0, 2.0));
          float sx = exp(-abs(vUv.x - uSunPos.x) * 1.2);
          flare += sy * sx * vec3(0.45, 0.4, 0.55) * 0.18;
          vec2 sv = (vUv - uSunPos) * aspect;
          float sd = length(sv);
          float sa = atan(sv.y, sv.x);
          float burst = pow(max(cos(sa * 4.0), 0.0), 3.0) * exp(-sd * 10.0) * 0.12;
          burst += pow(max(cos(sa * 4.0 + 0.785), 0.0), 3.0) * exp(-sd * 10.0) * 0.08;
          flare += burst * vec3(0.7, 0.65, 0.85);
          float a = max(max(flare.r, flare.g), flare.b);
          gl_FragColor = vec4(flare * uIntensity, a);
        }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending
    })
    const lensFlareQuad = new THREE.Mesh(lensFlareGeo, lensFlareMat)
    lensFlareQuad.frustumCulled = false
    const lensFlareOverlay = new THREE.Scene()
    lensFlareOverlay.add(lensFlareQuad)

    const sunScreenHelper = new THREE.Vector3()

    // Hover raycasting
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    // let hoverTarget = 0
    // let hoverCurrent = 0
    // let asteroidHoverTarget = 0
    // let asteroidHoverCurrent = 0
    // const blueEmissive = new THREE.Color(0x1540aa)
    // const blackEmissive = new THREE.Color(0x000000)
    let panX = 0
    let panY = 0
    let panTargetX = 0
    let panTargetY = 0
    const PAN_AMOUNT = 0.3
    let isDragging = false
    let prevDragX = 0
    let prevDragY = 0
    let planetVelX = 0
    let planetVelY = 0
    let planetRotX = 0
    let planetRotY = 0
    const ROTATE_SPEED = 0.0015
    const DAMPING_FACTOR = 0.04

    // Ship zoom state
    let zoomProgress = 0
    let t = 0
    const ZOOM_SPEED = 0.01
    const defaultCamZ = 5

    // Travel mode state
    let travelMode = false
    const travelCursorWorld = new THREE.Vector3()
    let travelCursorScreen = { x: 0, y: 0 }
    let lastMouseScreen = { x: 0, y: 0 }
    let highlightedAsteroidIdx = -1
    let highlightedMesh: THREE.InstancedMesh | null = null
    const instanceMatrix = new THREE.Matrix4()
    let shipTravelTarget: THREE.Vector3 | null = null
    let shipTravelStart: THREE.Vector3 | null = null
    let shipTravelProgress = 0
    let dockedMesh: THREE.InstancedMesh | null = null
    let dockedInstanceId = -1
    let dockOffset = new THREE.Vector3()

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true
      prevDragX = e.clientX
      prevDragY = e.clientY
      planetVelX = 0
      planetVelY = 0
    }
    const handleMouseUp = () => {
      isDragging = false
    }
    const handleClick = (e: MouseEvent) => {
      // Check if click is on menu
      if (menuRef.current?.contains(e.target as Node)) return

      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)

      // Travel mode: click on asteroid to move ship there
      if (travelMode) {
        if (highlightedAsteroidIdx >= 0 && highlightedMesh) {
          highlightedMesh.getMatrixAt(highlightedAsteroidIdx, instanceMatrix)
          instanceMatrix.premultiply(highlightedMesh.matrixWorld)
          const pos = new THREE.Vector3()
          pos.setFromMatrixPosition(instanceMatrix)
          // Offset so ship stops beside the asteroid
          const dir = new THREE.Vector3().subVectors(pos, new THREE.Vector3(...ship.config.position)).normalize()
          dockOffset = dir.multiplyScalar(-0.22)
          shipTravelTarget = pos.clone().add(dockOffset)
          shipTravelStart = new THREE.Vector3(...ship.config.position)
          shipTravelProgress = 0
          dockedMesh = highlightedMesh
          dockedInstanceId = highlightedAsteroidIdx
          travelMode = false
          ship.ringGroup.visible = false
          highlightedAsteroidIdx = -1
          highlightedMesh = null
        }
        return
      }

      if (ship.raycast(raycaster)) {
        ship.toggleZoom()
        if (!ship.isZoomed && menuRef.current) {
          menuRef.current.style.opacity = '0'
          menuRef.current.style.pointerEvents = 'none'
        }
        return
      }
      if (ship.isZoomed) {
        ship.zoomOut()
        if (menuRef.current) {
          menuRef.current.style.opacity = '0'
          menuRef.current.style.pointerEvents = 'none'
        }
      } else if (dockedMesh && menuRef.current) {
        menuRef.current.style.opacity = '0'
        menuRef.current.style.pointerEvents = 'none'
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (travelMode) {
          travelMode = false
          travelLine.visible = false
          if (travelLineRef.current) travelLineRef.current.style.display = 'none'
          highlightedAsteroidIdx = -1
          highlightedMesh = null
        } else if (ship.isZoomed) {
          ship.zoomOut()
          if (menuRef.current) {
            menuRef.current.style.opacity = '0'
            menuRef.current.style.pointerEvents = 'none'
          }
        } else if (dockedMesh && menuRef.current) {
          menuRef.current.style.opacity = '0'
          menuRef.current.style.pointerEvents = 'none'
        }
      }
    }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      lastMouseScreen = { x: e.clientX, y: e.clientY }
      if (!ship.isZoomed) {
        panTargetX = mouse.x * PAN_AMOUNT
        panTargetY = mouse.y * PAN_AMOUNT
      }
      raycaster.setFromCamera(mouse, camera)
      let cursor = 'default'

      if (travelMode) {
        cursor = 'crosshair'
        // Update cursor world position for travel line
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 3.5)
        raycaster.ray.intersectPlane(plane, travelCursorWorld)

        // Check asteroid hover
        highlightedAsteroidIdx = -1
        highlightedMesh = null
        for (const mesh of nearMeshes) {
          const hits = raycaster.intersectObject(mesh)
          if (hits.length > 0) {
            highlightedAsteroidIdx = hits[0].instanceId ?? -1
            highlightedMesh = mesh
            cursor = 'pointer'
            break
          }
        }
        if (highlightedAsteroidIdx < 0) {
          for (const mesh of farMeshes) {
            const hits = raycaster.intersectObject(mesh)
            if (hits.length > 0) {
              highlightedAsteroidIdx = hits[0].instanceId ?? -1
              highlightedMesh = mesh
              cursor = 'pointer'
              break
            }
          }
        }

        // Store cursor screen position for travel line (drawn in animation loop)
        travelCursorScreen = { x: e.clientX, y: e.clientY }
      } else {
        if (ship.raycast(raycaster)) {
          cursor = 'pointer'
          ship.hoverTarget = 1
        } else {
          ship.hoverTarget = 0
        }
        if (cursor === 'default') {
          const hits = raycaster.intersectObject(planet)
          if (hits.length > 0) cursor = 'pointer'
        }
      }

      if (container) container.style.cursor = cursor
      if (isDragging && !ship.isZoomed && !travelMode) {
        const dx = (e.clientX - prevDragX) * ROTATE_SPEED
        const dy = (e.clientY - prevDragY) * ROTATE_SPEED
        planetVelY = dx
        planetVelX = dy
        planetRotY += dx
        planetRotX += dy
        prevDragX = e.clientX
        prevDragY = e.clientY
      }
    }
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('click', handleClick)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    let frameId: number
    let elapsed = 0
    const clock = new THREE.Clock()
    const animate = () => {
      const dt = clock.getDelta()
      elapsed += dt
      // Zoom in: fast ease-out. Zoom out: ease start and end
      if (ship.isZoomed) {
        zoomProgress = Math.min(1, zoomProgress + ZOOM_SPEED)
        t = 1 - (1 - zoomProgress) ** 9
      } else {
        zoomProgress = Math.max(0, zoomProgress - ZOOM_SPEED * 2.5 * Math.max(0.3, zoomProgress))
        const p = 1 - zoomProgress
        t = 1 - (6 * p ** 5 - 15 * p ** 4 + 10 * p ** 3)
      }

      panX += (panTargetX - panX) * 0.03
      panY += (panTargetY - panY) * 0.03
      const baseX = panX
      const baseY = panY
      const baseZ = defaultCamZ
      const camTarget = ship.getCamTarget()
      camera.position.x = baseX + (camTarget.x - baseX) * t
      camera.position.y = baseY + (camTarget.y - baseY) * t
      camera.position.z = baseZ + (camTarget.z - baseZ) * t

      // Reduce apparent pan on asteroids and sun by partially following the camera
      farGroup.position.x = panX * 0.6
      farGroup.position.y = panY * 0.6
      nearGroup.position.x = panX * 0.5
      nearGroup.position.y = panY * 0.5
      sunGlow.position.x = sunPos.x + panX
      sunGlow.position.y = sunPos.y + panY
      sunDisc.position.x = sunPos.x + panX
      sunDisc.position.y = sunPos.y + panY
      stars.position.x = -1 + panX
      stars.position.y = 2 + panY

      // hoverCurrent += (hoverTarget - hoverCurrent) * 0.08
      // planetMat.uniforms.uHover.value = hoverCurrent
      // asteroidHoverCurrent += (asteroidHoverTarget - asteroidHoverCurrent) * 0.08
      // farAsteroidMats.forEach((m) => m.emissive.lerpColors(blackEmissive, blueEmissive, asteroidHoverCurrent))
      // nearAsteroidMats.forEach((m) => m.emissive.lerpColors(blackEmissive, blueEmissive, asteroidHoverCurrent))
      planetRotY += 0.00005
      if (!isDragging) {
        planetVelX *= 1 - DAMPING_FACTOR
        planetVelY *= 1 - DAMPING_FACTOR
        planetRotX += planetVelX
        planetRotY += planetVelY
      }
      planet.rotation.x = 0.3 + planetRotX
      planet.rotation.y = planetRotY
      clouds.rotation.x = 0.3 + planetRotX
      clouds.rotation.y = planetRotY * 1.15 + elapsed * 0.003
      sunGlowMat.uniforms.uTime.value = elapsed

      updateAsteroids(
        farData,
        farMeshes,
        farAssignments,
        farCounters,
        !shipTravelTarget && !dockedMesh ? FAR_SPEED : 0,
        SPREAD_X,
        dummy,
        -1
      )
      updateAsteroids(
        nearData,
        nearMeshes,
        nearAssignments,
        nearCounters,
        !shipTravelTarget && !dockedMesh ? NEAR_SPEED : 0,
        SPREAD_X,
        dummy,
        -1
      )

      // Asteroid hover highlight
      if (travelMode && highlightedAsteroidIdx >= 0 && highlightedMesh) {
        highlightMesh.geometry = highlightedMesh.geometry
        highlightedMesh.getMatrixAt(highlightedAsteroidIdx, instanceMatrix)
        instanceMatrix.scale(new THREE.Vector3(1.1, 1.1, 1.1))
        instanceMatrix.premultiply(highlightedMesh.matrixWorld)
        highlightMesh.matrix.copy(instanceMatrix)
        highlightMesh.visible = true
      } else if (dockedMesh && dockedInstanceId >= 0) {
        highlightMesh.geometry = dockedMesh.geometry
        dockedMesh.getMatrixAt(dockedInstanceId, instanceMatrix)
        instanceMatrix.scale(new THREE.Vector3(1.1, 1.1, 1.1))
        instanceMatrix.premultiply(dockedMesh.matrixWorld)
        highlightMesh.matrix.copy(instanceMatrix)
        highlightMesh.visible = true
      } else {
        highlightMesh.visible = false
      }

      // Ship update
      const shipPanScale = dockedMesh ? 0 : 0.85
      ship.update(elapsed, panX, panY, t, shipPanScale)

      // Face cursor in travel mode (before picking a target)
      if (travelMode && !shipTravelTarget && ship.model) {
        const dx = travelCursorWorld.x - ship.model.position.x
        const targetYaw = Math.atan2(dx, 3)
        ship.model.rotation.y += (targetYaw - ship.model.rotation.y) * 0.08
      } else if (!travelMode && !shipTravelTarget && ship.model) {
        // Smoothly return to default rotation
        ship.model.rotation.y += (ship.config.rotation[1] - ship.model.rotation.y) * 0.05
      }

      // Ship travel animation
      if (shipTravelTarget && shipTravelStart && ship.model) {
        // Update travel target to follow moving asteroid
        if (dockedMesh && dockedInstanceId >= 0) {
          dockedMesh.getMatrixAt(dockedInstanceId, instanceMatrix)
          instanceMatrix.premultiply(dockedMesh.matrixWorld)
          const asteroidPos = new THREE.Vector3().setFromMatrixPosition(instanceMatrix)
          shipTravelTarget.copy(asteroidPos).add(dockOffset)
        }
        shipTravelProgress = Math.min(1, shipTravelProgress + 0.001)
        const easeT = 1 - (1 - shipTravelProgress) ** 3
        ship.config.position[0] = shipTravelStart.x + (shipTravelTarget.x - shipTravelStart.x) * easeT
        ship.config.position[1] = shipTravelStart.y + (shipTravelTarget.y - shipTravelStart.y) * easeT
        ship.config.position[2] = shipTravelStart.z + (shipTravelTarget.z - shipTravelStart.z) * easeT

        // Face travel direction
        const dirX = shipTravelTarget.x - shipTravelStart.x
        const dirZ = shipTravelTarget.z - shipTravelStart.z
        const targetYaw = Math.atan2(dirX, dirZ)
        const turnT = Math.min(1, shipTravelProgress * 5)
        ship.model.rotation.x = ship.config.rotation[0]
        ship.model.rotation.y = ship.config.rotation[1] + (targetYaw - ship.config.rotation[1]) * turnT

        if (shipTravelProgress >= 1) {
          ship.config.position = [shipTravelTarget.x, shipTravelTarget.y, shipTravelTarget.z]
          ship.model.rotation.set(...ship.config.rotation)
          shipTravelTarget = null
          shipTravelStart = null
          ship.ringGroup.visible = true
          if (travelLineRef.current) travelLineRef.current.style.display = 'none'
          if (dockedMesh && menuRef.current) {
            menuRef.current.style.opacity = '1'
            menuRef.current.style.pointerEvents = 'auto'
          }
        }
      } else if (dockedMesh && dockedInstanceId >= 0) {
        // After arrival, keep following the asteroid
        dockedMesh.getMatrixAt(dockedInstanceId, instanceMatrix)
        instanceMatrix.premultiply(dockedMesh.matrixWorld)
        const pos = new THREE.Vector3()
        pos.setFromMatrixPosition(instanceMatrix)
        pos.add(dockOffset)
        ship.config.position = [pos.x, pos.y, pos.z]
      }

      // Position tooltip above ship
      if (tooltipRef.current) {
        const showTooltip = ship.hoverCurrent > 0.1 && !ship.isZoomed && !travelMode
        tooltipRef.current.style.opacity = showTooltip ? '1' : '0'
        if (showTooltip) {
          const screenPos = ship.getScreenPosition(camera)
          if (screenPos) {
            tooltipRef.current.style.left = `${screenPos.x}px`
            tooltipRef.current.style.top = `${screenPos.y - 100}px`
          }
        }
      }

      // Position menu when zoomed or docked
      if (menuRef.current && (ship.isZoomed || dockedMesh)) {
        const screenPos = ship.getScreenPosition(camera)
        if (screenPos) {
          const offset = ship.isZoomed ? 420 : 140
          const menuX = screenPos.x + offset
          const menuY = screenPos.y - 100
          menuRef.current.style.left = `${menuX}px`
          menuRef.current.style.top = `${menuY}px`
          const rx = mouse.y * 10
          const ry = -12 + mouse.x * 8
          menuRef.current.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) skewY(2deg) translateY(-50%)`
          if (ship.isZoomed) {
            const menuOpacity = Math.min(1, Math.max(0, (t - 0.6) / 0.4))
            menuRef.current.style.opacity = String(menuOpacity)
            menuRef.current.style.pointerEvents = menuOpacity > 0.5 ? 'auto' : 'none'
          }
          if (menuLineRef.current) {
            menuLineRef.current.setAttribute('x1', String(screenPos.x))
            menuLineRef.current.setAttribute('y1', String(screenPos.y))
            menuLineRef.current.setAttribute('x2', String(menuX))
            menuLineRef.current.setAttribute('y2', String(menuY))
            menuLineRef.current.setAttribute('opacity', menuRef.current.style.opacity)
          }
        }
      } else if (menuLineRef.current) {
        menuLineRef.current.setAttribute('opacity', '0')
      }

      // Update button disabled states
      const dockBtnEl = document.getElementById('dock-btn') as HTMLButtonElement | null
      const scanBtnEl = document.getElementById('scan-btn') as HTMLButtonElement | null
      if (dockBtnEl) {
        const shouldDisable = !dockedMesh
        dockBtnEl.disabled = shouldDisable
        dockBtnEl.classList.toggle('Mui-disabled', shouldDisable)
        const wrapper = dockBtnEl.closest('[data-bar-button]') as HTMLElement | null
        if (wrapper) wrapper.style.pointerEvents = shouldDisable ? 'none' : ''
      }
      if (scanBtnEl) {
        const shouldDisable = !dockedMesh
        scanBtnEl.disabled = shouldDisable
        scanBtnEl.classList.toggle('Mui-disabled', shouldDisable)
        const wrapper = scanBtnEl.closest('[data-bar-button]') as HTMLElement | null
        if (wrapper) wrapper.style.pointerEvents = shouldDisable ? 'none' : ''
      }

      // Draw animated travel line
      if ((travelMode || shipTravelTarget) && travelLineRef.current) {
        const canvas = travelLineRef.current
        const ctx = canvas.getContext('2d')
        if (ctx) {
          const dpr = window.devicePixelRatio || 1
          canvas.width = window.innerWidth * dpr
          canvas.height = window.innerHeight * dpr
          ctx.scale(dpr, dpr)
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
          const shipScreen = ship.getScreenPosition(camera)
          if (shipScreen) {
            // Determine line endpoint: target asteroid during travel, cursor during travel mode
            let endX = travelCursorScreen.x
            let endY = travelCursorScreen.y
            if (shipTravelTarget) {
              const targetScreen = shipTravelTarget.clone().project(camera)
              endX = (targetScreen.x * 0.5 + 0.5) * window.innerWidth
              endY = (-targetScreen.y * 0.5 + 0.5) * window.innerHeight
            }
            const dashAnim = -(elapsed * 50) % 11
            const segments = 24
            const dx = endX - shipScreen.x
            const dy = endY - shipScreen.y
            const totalLen = Math.sqrt(dx * dx + dy * dy)
            const dashPattern = [4, 7]

            ctx.lineCap = 'round'
            ctx.setLineDash(dashPattern)

            for (let i = 0; i < segments; i++) {
              const t0 = i / segments
              const t1 = (i + 1) / segments
              const x0 = shipScreen.x + dx * t0
              const y0 = shipScreen.y + dy * t0
              const x1 = shipScreen.x + dx * t1
              const y1 = shipScreen.y + dy * t1
              const segOffset = dashAnim - t0 * totalLen
              const scale = 0.03 + t0 * t0 * 0.97

              // Glow
              ctx.lineDashOffset = segOffset
              ctx.strokeStyle = 'rgba(68, 136, 255, 0.35)'
              ctx.lineWidth = 18 * scale
              ctx.beginPath()
              ctx.moveTo(x0, y0)
              ctx.lineTo(x1, y1)
              ctx.stroke()

              // Core
              ctx.strokeStyle = '#66ccff'
              ctx.lineWidth = 5 * scale
              ctx.beginPath()
              ctx.moveTo(x0, y0)
              ctx.lineTo(x1, y1)
              ctx.stroke()
            }
          }
        }
      }

      // Sun screen position for god rays & lens flare (offset by pan so sun stays static)
      sunScreenHelper.set(sunPos.x + panX, sunPos.y + panY, sunPos.z).project(camera)
      const sunUV_x = sunScreenHelper.x * 0.5 + 0.5
      const sunUV_y = sunScreenHelper.y * 0.5 + 0.5
      godRayMat.uniforms.uSunPos.value.set(sunUV_x, sunUV_y)
      lensFlareMat.uniforms.uSunPos.value.set(sunUV_x, sunUV_y)

      // Render occlusion pass (sun bright, planet black)
      renderer.setRenderTarget(occlusionRT)
      renderer.render(occlusionScene, camera)

      // Render main scene
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)

      // Composite god rays + lens flare (additive)
      renderer.autoClear = false
      renderer.render(godRayOverlay, overlayCamera)
      renderer.render(lensFlareOverlay, overlayCamera)
      renderer.autoClear = true

      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    // Resize handler
    const handleResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
      rtWidth = Math.floor(w / 2)
      rtHeight = Math.floor(h / 2)
      occlusionRT.setSize(rtWidth, rtHeight)
      lensFlareMat.uniforms.uAspect.value = w / h
    }
    window.addEventListener('resize', handleResize)

    // Travel button handler
    const handleTravelClick = () => {
      travelMode = true
      travelCursorScreen = { x: lastMouseScreen.x, y: lastMouseScreen.y }
      dockedMesh = null
      dockedInstanceId = -1
      ship.zoomOut()
      if (menuRef.current) {
        menuRef.current.style.opacity = '0'
        menuRef.current.style.pointerEvents = 'none'
      }
      if (travelLineRef.current) {
        travelLineRef.current.style.display = 'block'
      }
    }
    const travelBtn = document.getElementById('travel-btn')
    if (travelBtn) travelBtn.addEventListener('click', handleTravelClick)

    // Dock button handler
    const handleDockClick = () => {
      dockedMesh = null
      dockedInstanceId = -1
      shipTravelTarget = new THREE.Vector3(1.2, 0.25, -3.5)
      shipTravelStart = new THREE.Vector3(...ship.config.position)
      shipTravelProgress = 0
      ship.ringGroup.visible = false
      ship.zoomOut()
      if (menuRef.current) {
        menuRef.current.style.opacity = '0'
        menuRef.current.style.pointerEvents = 'none'
      }
      if (travelLineRef.current) {
        travelLineRef.current.style.display = 'block'
      }
    }
    const dockBtn = document.getElementById('dock-btn')
    if (dockBtn) dockBtn.addEventListener('click', handleDockClick)

    return () => {
      if (travelBtn) travelBtn.removeEventListener('click', handleTravelClick)
      if (dockBtn) dockBtn.removeEventListener('click', handleDockClick)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(frameId)
      container.removeChild(renderer.domElement)
      renderer.dispose()
      planetGeo.dispose()
      planetMat.dispose()
      planetTexture.dispose()
      atmosGeo.dispose()
      atmosMat.dispose()
      cloudGeo.dispose()
      cloudMat.dispose()
      cloudTexture.dispose()
      farGeos.forEach((g) => {
        g.dispose()
      })
      nearGeos.forEach((g) => {
        g.dispose()
      })
      farAsteroidMats.forEach((m) => {
        m.dispose()
      })
      nearAsteroidMats.forEach((m) => {
        m.dispose()
      })
      asteroidTextures.forEach((t) => {
        t.dispose()
      })
      starGeo.dispose()
      starMat.dispose()
      starTexture.dispose()
      sunGlowGeo.dispose()
      sunGlowMat.dispose()
      sunDiscGeo.dispose()
      sunDiscMat.dispose()
      planetOccGeo.dispose()
      planetOccMat.dispose()
      occlusionRT.dispose()
      godRayGeo.dispose()
      godRayMat.dispose()
      lensFlareGeo.dispose()
      lensFlareMat.dispose()
      travelLineGeo.dispose()
      travelLineMat.dispose()
      highlightMat.dispose()
      ship.dispose()
    }
  }, [])

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'auto'
        }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          opacity: 0,
          pointerEvents: 'none',
          transform: 'translateX(-50%) perspective(300px) rotateX(20deg) rotateY(-14deg) skewY(4deg)',
          transition: 'opacity 0.15s',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            background: '#2040e0',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '2px',
            fontSize: '12px',
            fontFamily: 'monospace',
            letterSpacing: '1px',
            whiteSpace: 'nowrap'
          }}
        >
          TELLUS RX 5
        </div>
        <div
          style={{
            width: '2px',
            height: '60px',
            background: 'linear-gradient(to bottom, #2040e0, rgba(32, 64, 224, 0))'
          }}
        />
      </div>
      <svg
        role="img"
        aria-label="Menu connector line"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 9
        }}
      >
        <line ref={menuLineRef} stroke="#ffffff" strokeWidth="1" opacity="0" strokeDasharray="6 4" />
      </svg>
      <div
        ref={menuRef}
        style={{
          position: 'fixed',
          opacity: 0,
          pointerEvents: 'none',
          transition: 'opacity 0.2s',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          border: '1px dashed #ffffff',
          padding: '20px',
          transform: 'perspective(600px) rotateY(-12deg) skewY(2deg)',
          transformOrigin: 'left center'
        }}
      >
        {['Travel', 'Dock', 'Scan'].map((label) => (
          <BarButton key={label}>
            <Button
              id={
                label === 'Travel'
                  ? 'travel-btn'
                  : label === 'Dock'
                    ? 'dock-btn'
                    : label === 'Scan'
                      ? 'scan-btn'
                      : undefined
              }
              sx={{
                px: 4,
                backgroundColor: '#fff',
                color: '#000',
                position: 'relative',
                zIndex: 2,
                boxShadow: 'none',
                border: 'none',
                clipPath: 'none',
                lineHeight: 1,
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: '#fff',
                  boxShadow: 'none'
                },
                '&.Mui-disabled': {
                  backgroundColor: '#555',
                  color: '#999',
                  opacity: 0.5
                }
              }}
              color="primary"
              variant="contained"
              size="small"
              disableRipple
            >
              {label}
            </Button>
          </BarButton>
        ))}
      </div>
      <canvas
        ref={travelLineRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5,
          display: 'none'
        }}
      />
    </>
  )
}
