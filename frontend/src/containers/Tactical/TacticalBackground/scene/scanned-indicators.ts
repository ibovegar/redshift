import type { Asteroid } from 'models/asteroid'
import * as THREE from 'three'

const MAX_INDICATORS = 32

export class ScannedIndicators {
  private pool: THREE.Mesh[] = []
  private material: THREE.MeshBasicMaterial
  private activeCount = 0

  constructor(private scene: THREE.Scene) {
    this.material = new THREE.MeshBasicMaterial({
      color: 0x44ff88,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    for (let i = 0; i < MAX_INDICATORS; i++) {
      const mesh = new THREE.Mesh(new THREE.BufferGeometry(), this.material)
      mesh.visible = false
      mesh.matrixAutoUpdate = false
      scene.add(mesh)
      this.pool.push(mesh)
    }
  }

  update(
    scannedAsteroids: Asteroid[],
    farMeshes: THREE.InstancedMesh[],
    nearMeshes: THREE.InstancedMesh[],
    instanceMatrix: THREE.Matrix4
  ) {
    this.activeCount = 0

    for (const asteroid of scannedAsteroids) {
      if (this.activeCount >= MAX_INDICATORS) break

      const meshes = asteroid.belt === 'near' ? nearMeshes : farMeshes
      const targetMesh = meshes[asteroid.chunkIndex]
      if (!targetMesh) continue

      const indicator = this.pool[this.activeCount]
      indicator.geometry = targetMesh.geometry
      targetMesh.getMatrixAt(asteroid.instanceId, instanceMatrix)
      instanceMatrix.scale(new THREE.Vector3(1.15, 1.15, 1.15))
      instanceMatrix.premultiply(targetMesh.matrixWorld)
      indicator.matrix.copy(instanceMatrix)
      indicator.visible = true
      this.activeCount++
    }

    // Hide unused indicators
    for (let i = this.activeCount; i < MAX_INDICATORS; i++) {
      this.pool[i].visible = false
    }
  }

  dispose() {
    this.material.dispose()
    for (const mesh of this.pool) {
      this.scene.remove(mesh)
    }
  }
}
