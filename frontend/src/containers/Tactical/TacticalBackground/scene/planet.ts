import * as THREE from 'three'

export class Planet {
  planet: THREE.Mesh
  planetMat: THREE.ShaderMaterial
  atmosphere: THREE.Mesh
  clouds: THREE.Mesh
  cloudMat: THREE.ShaderMaterial
  planetTexture: THREE.Texture
  cloudTexture: THREE.Texture
  sunDirection: THREE.Vector3

  private atmosMat: THREE.ShaderMaterial

  constructor(renderer: THREE.WebGLRenderer) {
    this.sunDirection = new THREE.Vector3(2.0, 1.2, -0.8).normalize()
    const textureLoader = new THREE.TextureLoader()

    this.planetTexture = textureLoader.load('/images/planets/8k_mars.jpg')
    this.planetTexture.colorSpace = THREE.SRGBColorSpace
    this.planetTexture.minFilter = THREE.LinearMipmapLinearFilter
    this.planetTexture.magFilter = THREE.LinearFilter
    this.planetTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()
    this.planetTexture.generateMipmaps = true

    const planetGeo = new THREE.SphereGeometry(18.5, 128, 128)
    this.planetMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: this.sunDirection },
        uTexture: { value: this.planetTexture },
        uTime: { value: 0.0 },
        uHover: { value: 0.0 },
        uFlare: { value: 0.0 }
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
        uniform float uFlare;
        varying vec3 vNormal;
        varying vec2 vUv;

        void main() {
          vec3 color = texture2D(uTexture, vUv).rgb;
          color = color * vec3(0.4, 0.5, 1.5);
          float light = dot(vNormal, uSunDir);
          light = smoothstep(-0.15, 0.45, light) * 2.5;
          float flareBoost = 1.0 + uFlare * 0.6 * smoothstep(-0.3, 0.2, dot(vNormal, uSunDir));
          vec3 lit = color * light * flareBoost;
          vec3 blue = vec3(0.15, 0.25, 0.6);
          lit = mix(lit, lit + blue, uHover);
          gl_FragColor = vec4(lit, 1.0);
        }
      `
    })
    this.planet = new THREE.Mesh(planetGeo, this.planetMat)
    this.planet.position.set(-13.5, -4.5, -55)
    this.planet.rotation.x = 0.3
    this.planet.scale.x = 0.94

    // Atmosphere halo
    const atmosGeo = new THREE.SphereGeometry(19.2, 64, 64)
    this.atmosMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: this.sunDirection },
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
    this.atmosphere = new THREE.Mesh(atmosGeo, this.atmosMat)
    this.atmosphere.position.copy(this.planet.position)
    this.atmosphere.scale.x = 0.94

    // Cloud layer
    this.cloudTexture = textureLoader.load('/images/planets/8k_earth_clouds.jpg')
    this.cloudTexture.colorSpace = THREE.SRGBColorSpace
    this.cloudTexture.minFilter = THREE.LinearMipmapLinearFilter
    this.cloudTexture.magFilter = THREE.LinearFilter
    this.cloudTexture.anisotropy = renderer.capabilities.getMaxAnisotropy()

    const cloudGeo = new THREE.SphereGeometry(18.7, 128, 128)
    this.cloudMat = new THREE.ShaderMaterial({
      uniforms: {
        uSunDir: { value: this.sunDirection },
        uTexture: { value: this.cloudTexture }
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
    this.clouds = new THREE.Mesh(cloudGeo, this.cloudMat)
    this.clouds.position.copy(this.planet.position)
    this.clouds.rotation.x = 0.3
    this.clouds.scale.x = 0.94
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.planet)
    scene.add(this.atmosphere)
    scene.add(this.clouds)
  }

  dispose() {
    this.planet.geometry.dispose()
    this.planetMat.dispose()
    this.planetTexture.dispose()
    this.atmosphere.geometry.dispose()
    this.atmosMat.dispose()
    this.clouds.geometry.dispose()
    this.cloudMat.dispose()
    this.cloudTexture.dispose()
  }
}
