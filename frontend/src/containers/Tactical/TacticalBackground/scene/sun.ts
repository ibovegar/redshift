import * as THREE from 'three'

export const SUN_POS = new THREE.Vector3(11.5, 5, -20)

export class Sun {
  mesh: THREE.Mesh
  mat: THREE.ShaderMaterial

  private geo: THREE.PlaneGeometry

  constructor() {
    this.geo = new THREE.PlaneGeometry(14, 14)
    this.mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0xffeedd) },
        uTime: { value: 0.0 },
        uFlare: { value: 0.0 }
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
        uniform float uFlare;
        varying vec2 vUv;
        void main() {
          vec2 center = vUv - 0.5;
          float d = length(center) * (14.0 / 6.5) * 2.0;
          float angle = atan(center.y, center.x);

          float pulse1 = sin(uTime * 0.7) * 0.15;
          float pulse2 = sin(uTime * 1.3 + 2.0) * 0.1;
          float pulse3 = sin(uTime * 0.4 + 5.0) * 0.2;
          float breath = 1.0 + pulse1 + pulse2 + pulse3;

          float core = exp(-d * 90.0) * 2.0 * breath;

          float spikes = 0.0;
          for (int j = 0; j < 8; j++) {
            float sa = float(j) * 6.28318 / 8.0;
            float shimmer = 1.0 + sin(uTime * 0.5 + float(j) * 1.8) * 0.3;
            float spike = pow(max(cos(angle - sa), 0.0), 80.0);
            spike *= exp(-d * 12.0) * shimmer;
            spikes += spike;
          }

          float longRays = 0.0;
          float rayAngles[3];
          rayAngles[0] = 0.3;  rayAngles[1] = 1.7;
          rayAngles[2] = 4.3;
          float rayLengths[3];
          rayLengths[0] = 2.5; rayLengths[1] = 8.0;
          rayLengths[2] = 10.0;
          float rayWidths[3];
          rayWidths[0] = 250.0; rayWidths[1] = 350.0;
          rayWidths[2] = 300.0;
          for (int j = 0; j < 3; j++) {
            float ra = rayAngles[j];
            float rayPulse = 1.0 + sin(uTime * (0.3 + float(j) * 0.15) + float(j) * 1.5) * 0.4;
            float ray = pow(max(cos(angle - ra), 0.0), rayWidths[j]);
            ray *= exp(-d * rayLengths[j]) * 0.8 * rayPulse;
            longRays += ray;
          }

          float glow = exp(-d * 14.0) * 0.9 * breath;
          glow += exp(-d * 6.0) * 0.5 * breath;
          glow += exp(-d * 2.5) * 0.2;
          glow += exp(-d * 1.0) * 0.1;

          float flareGlow = uFlare * exp(-d * 1.5) * 0.6;
          float flareCore = uFlare * exp(-d * 8.0) * 1.2;

          float intensity = core + spikes * 0.45 + longRays + glow + flareGlow + flareCore;

          // Fade to zero at plane edges to prevent visible box clipping
          float edgeDist = max(abs(center.x), abs(center.y));
          float edgeFade = 1.0 - smoothstep(0.4, 0.5, edgeDist);
          intensity *= edgeFade;

          vec3 color = uColor * intensity;
          color += vec3(0.2, 0.2, 0.4) * core * 0.2;

          gl_FragColor = vec4(color, intensity);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    this.mesh = new THREE.Mesh(this.geo, this.mat)
    this.mesh.position.copy(SUN_POS)
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mesh)
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
  }
}
