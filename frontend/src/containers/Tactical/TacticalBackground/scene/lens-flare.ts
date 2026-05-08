import * as THREE from 'three'

export class LensFlare {
  overlay: THREE.Scene
  mat: THREE.ShaderMaterial

  private geo: THREE.PlaneGeometry

  constructor(width: number, height: number) {
    this.geo = new THREE.PlaneGeometry(2, 2)
    this.mat = new THREE.ShaderMaterial({
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
    const quad = new THREE.Mesh(this.geo, this.mat)
    quad.frustumCulled = false
    this.overlay = new THREE.Scene()
    this.overlay.add(quad)
  }

  dispose() {
    this.geo.dispose()
    this.mat.dispose()
  }
}
