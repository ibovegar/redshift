import * as THREE from 'three'

export class AsteroidHighlight {
  mesh: THREE.Mesh
  material: THREE.MeshBasicMaterial
  private scanning = false
  private flashTime = 0
  private flashDuration = 0.4

  constructor(scene: THREE.Scene) {
    this.material = new THREE.MeshBasicMaterial({
      color: 0x66ccff,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material)
    this.mesh.visible = false
    this.mesh.matrixAutoUpdate = false
    scene.add(this.mesh)
  }

  show(targetMesh: THREE.InstancedMesh, instanceId: number, instanceMatrix: THREE.Matrix4, scale = 1.1) {
    this.mesh.geometry = targetMesh.geometry
    targetMesh.getMatrixAt(instanceId, instanceMatrix)
    instanceMatrix.scale(new THREE.Vector3(scale, scale, scale))
    instanceMatrix.premultiply(targetMesh.matrixWorld)
    this.mesh.matrix.copy(instanceMatrix)
    this.mesh.visible = true
    this.updateFlashColor()
  }

  showWithBlink(
    targetMesh: THREE.InstancedMesh,
    instanceId: number,
    instanceMatrix: THREE.Matrix4,
    elapsed: number,
    scale = 1.1
  ) {
    this.mesh.geometry = targetMesh.geometry
    targetMesh.getMatrixAt(instanceId, instanceMatrix)
    instanceMatrix.scale(new THREE.Vector3(scale, scale, scale))
    instanceMatrix.premultiply(targetMesh.matrixWorld)
    this.mesh.matrix.copy(instanceMatrix)
    this.mesh.visible = Math.sin(elapsed * 20) > 0
    this.updateFlashColor()
  }

  flash() {
    this.flashTime = this.flashDuration
  }

  updateFlash(dt: number) {
    if (this.flashTime > 0) {
      this.flashTime = Math.max(0, this.flashTime - dt)
    }
  }

  private updateFlashColor() {
    if (this.flashTime > 0) {
      const t = this.flashTime / this.flashDuration
      const white = Math.round(t * 255)
      const blue = Math.round((1 - t) * 255)
      this.material.color.setRGB(white / 255, white / 255, (blue * 0.8 + white * 0.2) / 255)
      this.material.opacity = 0.5 + t * 0.8
    } else {
      this.material.color.setHex(0x66ccff)
      this.material.opacity = 0.5
    }
  }

  hide() {
    this.mesh.visible = false
  }

  setScanning(value: boolean) {
    this.scanning = value
  }

  get isScanning() {
    return this.scanning
  }

  dispose() {
    this.material.dispose()
  }
}
