import * as THREE from 'three'

export class AsteroidHighlight {
  mesh: THREE.Mesh
  material: THREE.MeshBasicMaterial
  private scanning = false

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
