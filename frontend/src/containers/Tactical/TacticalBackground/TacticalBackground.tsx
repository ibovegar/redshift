import { ConnectorLines } from 'components/ConnectorLines/ConnectorLines'
import { type CollectedResource, DrillOverlay } from 'components/DrillOverlay/DrillOverlay'
import { FullscreenLayer } from 'components/FullscreenLayer/FullscreenLayer'
import { HudPanel } from 'components/HudPanel/HudPanel'
import { RadiationWarning } from 'components/RadiationWarning/RadiationWarning'
import { ScanResult } from 'components/ScanResult/ScanResult'
import { ShipMenu } from 'components/ShipMenu/ShipMenu'
import { ShipStats } from 'components/ShipStats/ShipStats'
import { ShipTooltip } from 'components/ShipTooltip/ShipTooltip'
import { MATERIAL_STORAGE_COST } from 'data/materials'
import { usePatchUser, useSpacecraft, useUpdateCargo, useUser } from 'hooks'
import type { Asteroid } from 'models/asteroid'
import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { AsteroidBelts, BELT_SPEED } from './scene/asteroid-belts'
import { AsteroidHighlight } from './scene/asteroid-highlight'
import { CameraZoom } from './scene/camera-zoom'
import { GodRays } from './scene/god-rays'
import { LensFlare } from './scene/lens-flare'
import { Planet } from './scene/planet'
import { ScannedIndicators } from './scene/scanned-indicators'
import {
  hideScanPanel,
  updateButtonStates,
  updateMenu,
  updateScanPanel,
  updateShipStats,
  updateTooltip
} from './scene/scene-ui'
import { Ship } from './scene/ship'
import { SolarEvent, type SolarEventPhase } from './scene/solar-event'
import { SolarWave } from './scene/solar-wave'
import { Stars } from './scene/stars'
import { SUN_POS, Sun } from './scene/sun'
import { TravelLine } from './scene/travel-line'

interface ScanResultState {
  visible: boolean
  asteroid: Asteroid | null
  revealed: boolean
  progress: number
  showMining: boolean
  isRemote: boolean
}

export const TacticalBackground = () => {
  const { data: spacecraft } = useSpacecraft('3')
  const { data: user } = useUser()
  const patchUser = usePatchUser()
  const updateCargo = useUpdateCargo()
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuLineRef = useRef<SVGLineElement>(null)
  const scanLineRef = useRef<SVGLineElement>(null)
  const travelLineRef = useRef<HTMLCanvasElement>(null)
  const standaloneScanRef = useRef<HTMLDivElement>(null)
  const shipStatsRef = useRef<HTMLDivElement>(null)
  const [detailsMode, setDetailsMode] = useState(false)
  const [solarPhase, setSolarPhase] = useState<SolarEventPhase>('idle')
  const [solarCountdown, setSolarCountdown] = useState(0)
  const [_shipCondition, setShipCondition] = useState(100)
  const shipConditionRef = useRef(100)
  const [scanResult, setScanResult] = useState<ScanResultState>({
    visible: false,
    asteroid: null,
    revealed: false,
    progress: 0,
    showMining: false,
    isRemote: false
  })
  const scanResultStateRef = useRef(scanResult)
  scanResultStateRef.current = scanResult

  const [isMining, setIsMining] = useState(false)
  const [miningAsteroid, setMiningAsteroid] = useState<Asteroid | null>(null)
  const [_shipFuel, setShipFuel] = useState(64)
  const [_shipShield, setShipShield] = useState(55)
  const shipFuelRef = useRef(64)
  const shipShieldRef = useRef(55)
  const miningZoomRef = useRef(false)
  const miningMeshRef = useRef<THREE.InstancedMesh | null>(null)
  const miningInstanceIdRef = useRef(-1)
  const miningScreenCenterRef = useRef<{ x: number; y: number } | null>(null)
  const dockedMeshRef = useRef<THREE.InstancedMesh | null>(null)
  const dockedInstanceIdRef = useRef(-1)

  const startMiningDirectRef = useRef<
    ((asteroid: Asteroid, mesh: THREE.InstancedMesh, instanceId: number) => void) | undefined
  >(undefined)
  startMiningDirectRef.current = (asteroid: Asteroid, mesh: THREE.InstancedMesh, instanceId: number) => {
    asteroid.scanned = true
    setMiningAsteroid(asteroid)
    miningZoomRef.current = true
    miningMeshRef.current = mesh
    miningInstanceIdRef.current = instanceId
    setScanResult((prev) => ({ ...prev, visible: false }))
  }

  const handleMiningStartClick = useCallback(() => {
    const state = scanResultStateRef.current
    if (!state.asteroid) return
    const mesh = dockedMeshRef.current
    const instanceId = dockedInstanceIdRef.current
    setMiningAsteroid(state.asteroid)
    miningZoomRef.current = true
    if (mesh && instanceId >= 0) {
      miningMeshRef.current = mesh
      miningInstanceIdRef.current = instanceId
    }
    setScanResult((prev) => ({ ...prev, visible: false }))
  }, [])

  const handleMiningComplete = useCallback(
    (collected: CollectedResource[]) => {
      // Merge collected resources into existing cargo
      const existingCargo = [...spacecraft.cargo]
      for (const item of collected) {
        if (item.amount <= 0) continue
        const currentUsed = existingCargo.reduce((sum, c) => sum + c.amount * MATERIAL_STORAGE_COST[c.material], 0)
        const remaining = spacecraft.cargoCapacity - currentUsed
        if (remaining <= 0) break
        const actualAmount = Math.min(
          Math.round(item.amount * 10),
          Math.floor(remaining / MATERIAL_STORAGE_COST[item.material])
        )
        if (actualAmount <= 0) continue
        const existing = existingCargo.find((c) => c.material === item.material)
        if (existing) {
          existing.amount += actualAmount
        } else {
          existingCargo.push({ material: item.material, amount: actualAmount })
        }
      }
      updateCargo.mutate({ spacecraftId: spacecraft.id, cargo: existingCargo })

      setMiningAsteroid((prev) => {
        if (prev) prev.depleted = true
        return null
      })
      setIsMining(false)
      miningZoomRef.current = false
      miningMeshRef.current = null
      miningInstanceIdRef.current = -1
      miningScreenCenterRef.current = null
    },
    [spacecraft, updateCargo]
  )

  const abortScanRef = useRef(false)
  const handleAbortScan = useCallback(() => {
    abortScanRef.current = true
  }, [])

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

    // Planet, atmosphere, clouds
    const planetObj = new Planet(renderer)
    planetObj.addToScene(scene)

    // Stars — milky way flat background
    const starsObj = new Stars(camera)
    starsObj.addToScene(scene)

    // Sun
    const sunPos = SUN_POS
    const sun = new Sun()
    sun.addToScene(scene)

    // Asteroid belts
    const belts = new AsteroidBelts()
    belts.addToScene(scene)

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
    const travelLine = new TravelLine()
    travelLine.addToScene(scene)

    // --- Asteroid hover highlight ---
    const highlight = new AsteroidHighlight(scene)
    const scannedIndicators = new ScannedIndicators(scene)

    // --- God Rays setup ---
    const godRays = new GodRays(sunPos, planetObj.planet.position, camera, width, height)
    let rtWidth = Math.floor(width / 2)
    let rtHeight = Math.floor(height / 2)

    // --- Lens Flare setup ---
    const lensFlare = new LensFlare(width, height)

    // --- Solar wave overlay ---
    const solarWave = new SolarWave(width, height)

    const sunScreenHelper = new THREE.Vector3()

    // Hover raycasting
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()
    let panX = 0
    let panY = 0
    let panTargetX = 0
    let panTargetY = 0
    const PAN_AMOUNT = 0.3
    let isDragging = false
    let isDraggingPlanet = false
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
    let maxZoom = 1
    const ZOOM_SPEED = 0.01
    const defaultCamZ = 5

    // Asteroid zoom state (for remote scanned asteroid inspection)
    const asteroidZoom = new CameraZoom(0.015, 0.3)
    // Scan zoom state (nudge toward docked asteroid during scan)
    const scanZoom = new CameraZoom(0.015, 0.3)
    // Mining zoom state (aggressive zoom toward mined asteroid)
    const miningZoom = new CameraZoom(0.03, 0.92, 2, 4)

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
    let dockedAsteroid: Asteroid | null = null
    let dockedInstanceHidden = false
    const savedDockedMatrix = new THREE.Matrix4()
    let scanning = false
    let scanProgress = 0
    let scanDuration = 0
    let scanStartTime = 0
    let scanResultVisible = false
    let lastProgressUpdate = 0
    let hoveredScannedAsteroid: Asteroid | null = null
    let hoveredMesh: THREE.InstancedMesh | null = null
    let hoveredInstanceId = -1
    let miningStarted = false

    // Solar event system
    const solarEvent = new SolarEvent()
    let lastSolarPhase: SolarEventPhase = 'idle'
    let lastSolarCountdown = 0
    solarEvent.onConditionChange = (delta) => {
      shipConditionRef.current = Math.max(0, shipConditionRef.current + delta)
      setShipCondition(shipConditionRef.current)
    }

    function renderScanResult(asteroid: Asteroid, revealed: boolean, showMining = false, isRemote = false) {
      setScanResult({ visible: true, asteroid, revealed, progress: 0, showMining, isRemote })
      scanResultVisible = true
    }

    function hideScanResult() {
      setScanResult((prev) => ({ ...prev, visible: false, isRemote: false }))
      scanResultVisible = false
    }

    function showMenu() {
      if (!menuRef.current) return
      menuRef.current.style.opacity = '1'
      menuRef.current.style.pointerEvents = 'auto'
    }

    function hideMenu() {
      if (!menuRef.current) return
      menuRef.current.style.opacity = '0'
      menuRef.current.style.pointerEvents = 'none'
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (miningZoomRef.current) return
      isDragging = true
      prevDragX = e.clientX
      prevDragY = e.clientY
      // Check if mousedown is on the planet
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      raycaster.setFromCamera(mouse, camera)
      isDraggingPlanet = raycaster.intersectObject(planetObj.planet).length > 0
      if (isDraggingPlanet) {
        planetVelX = 0
        planetVelY = 0
      }
    }
    const handleMouseUp = () => {
      isDragging = false
      isDraggingPlanet = false
    }
    const handleClick = (e: MouseEvent) => {
      if (miningZoomRef.current) return
      // Check if click is on menu
      if (menuRef.current?.contains(e.target as Node)) return
      // Check if click is on scan result panel
      if (standaloneScanRef.current?.contains(e.target as Node)) return

      // Click scanned asteroid to show/hide result
      if (!travelMode && !scanning) {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
        raycaster.setFromCamera(mouse, camera)
        const allMeshes = belts.meshes
        let clickedScanned: Asteroid | null = null
        let clickedMesh: THREE.InstancedMesh | null = null
        let clickedInstanceId = -1
        for (const mesh of allMeshes) {
          const hits = raycaster.intersectObject(mesh)
          if (hits.length > 0) {
            const iid = hits[0].instanceId ?? -1
            const asteroid = belts.findAsteroid(mesh, iid)
            if (asteroid?.scanned && !asteroid.depleted && asteroid !== dockedAsteroid) {
              clickedScanned = asteroid
              clickedMesh = mesh
              clickedInstanceId = iid
            }
            break
          }
        }
        if (clickedScanned) {
          if (clickedScanned === hoveredScannedAsteroid) {
            hoveredScannedAsteroid = null
            hoveredMesh = null
            hoveredInstanceId = -1
            asteroidZoom.zoomOut()
            hideScanResult()
          } else {
            hoveredScannedAsteroid = clickedScanned
            hoveredMesh = clickedMesh
            hoveredInstanceId = clickedInstanceId
            // Compute 3D position of the asteroid for zoom target
            if (clickedMesh && clickedInstanceId >= 0) {
              clickedMesh.getMatrixAt(clickedInstanceId, instanceMatrix)
              instanceMatrix.premultiply(clickedMesh.matrixWorld)
              asteroidZoom.zoomTo(new THREE.Vector3().setFromMatrixPosition(instanceMatrix))
            }
            renderScanResult(clickedScanned, true, false, true)
          }
          return
        } else if (scanResultVisible) {
          hoveredScannedAsteroid = null
          hoveredMesh = null
          hoveredInstanceId = -1
          asteroidZoom.zoomOut()
          hideScanResult()
          return
        }
      }

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
          dockedMeshRef.current = highlightedMesh
          dockedInstanceIdRef.current = highlightedAsteroidIdx
          dockedAsteroid = belts.findAsteroid(highlightedMesh, highlightedAsteroidIdx)
          travelMode = false
          ship.deselect()
          highlightedAsteroidIdx = -1
          highlightedMesh = null
        }
        return
      }

      if (ship.raycast(raycaster)) {
        if (ship.isZoomed) {
          maxZoom = 1
          ship.zoomOut()
          setDetailsMode(false)
          hideMenu()
        } else if (!ship.isSelected) {
          ship.select()
          showMenu()
        } else {
          showMenu()
        }
        return
      }
      if (scanning) return
      if (ship.isZoomed) {
        maxZoom = 1
        ship.zoomOut()
        setDetailsMode(false)
        hideMenu()
      } else {
        ship.deselect()
        hideMenu()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (scanning) return
        if (travelMode) {
          travelMode = false
          travelLine.line.visible = false
          if (travelLineRef.current) travelLineRef.current.style.display = 'none'
          highlightedAsteroidIdx = -1
          highlightedMesh = null
        } else if (ship.isZoomed) {
          maxZoom = 1
          ship.zoomOut()
          setDetailsMode(false)
          hideMenu()
        } else if (ship.isSelected) {
          ship.deselect()
          hideMenu()
        }
      }
    }
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1
      lastMouseScreen = { x: e.clientX, y: e.clientY }
      if (!ship.isZoomed && !miningZoomRef.current) {
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
        for (const mesh of belts.meshes) {
          const hits = raycaster.intersectObject(mesh)
          if (hits.length > 0) {
            highlightedAsteroidIdx = hits[0].instanceId ?? -1
            highlightedMesh = mesh
            cursor = 'pointer'
            break
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
        if (cursor === 'default' && !scanning) {
          const allMeshes = belts.meshes
          for (const mesh of allMeshes) {
            const hits = raycaster.intersectObject(mesh)
            if (hits.length > 0) {
              const iid = hits[0].instanceId ?? -1
              const asteroid = belts.findAsteroid(mesh, iid)
              if (asteroid?.scanned && asteroid !== dockedAsteroid) {
                cursor = 'pointer'
              }
              break
            }
          }
        }
      }

      if (container) container.style.cursor = cursor
      if (isDraggingPlanet && !ship.isZoomed && !travelMode) {
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
        t = Math.min(maxZoom, 1 - (1 - zoomProgress) ** 9)
      } else {
        zoomProgress = Math.max(0, zoomProgress - ZOOM_SPEED * 2.5 * Math.max(0.3, zoomProgress))
        const p = 1 - zoomProgress
        t = 1 - (6 * p ** 5 - 15 * p ** 4 + 10 * p ** 3)
      }

      // Hide docked asteroid when zoomed in to avoid it clipping in front of ship
      if (dockedMesh && dockedInstanceId >= 0) {
        if (ship.isZoomed && !dockedInstanceHidden) {
          dockedMesh.getMatrixAt(dockedInstanceId, savedDockedMatrix)
          const zeroMatrix = new THREE.Matrix4().makeScale(0, 0, 0)
          dockedMesh.setMatrixAt(dockedInstanceId, zeroMatrix)
          dockedMesh.instanceMatrix.needsUpdate = true
          dockedInstanceHidden = true
        } else if (!ship.isZoomed && dockedInstanceHidden) {
          dockedMesh.setMatrixAt(dockedInstanceId, savedDockedMatrix)
          dockedMesh.instanceMatrix.needsUpdate = true
          dockedInstanceHidden = false
        }
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

      // Asteroid zoom: nudge camera toward the inspected asteroid
      asteroidZoom.apply(camera)
      scanZoom.apply(camera)
      miningZoom.apply(camera)

      // Reduce apparent pan on asteroids and sun by partially following the camera
      belts.applyParallax(panX, panY)
      sun.mesh.position.x = sunPos.x + panX
      sun.mesh.position.y = sunPos.y + panY
      godRays.sunDisc.position.x = sunPos.x + panX
      godRays.sunDisc.position.y = sunPos.y + panY
      starsObj.applyParallax(panX, panY)

      planetRotY += 0.00005
      if (!isDragging) {
        planetVelX *= 1 - DAMPING_FACTOR
        planetVelY *= 1 - DAMPING_FACTOR
        planetRotX += planetVelX
        planetRotY += planetVelY
      }
      planetObj.planet.rotation.x = 0.3 + planetRotX
      planetObj.planet.rotation.y = planetRotY
      planetObj.clouds.rotation.x = 0.3 + planetRotX
      planetObj.clouds.rotation.y = planetRotY * 1.15 + elapsed * 0.003
      sun.mat.uniforms.uTime.value = elapsed
      godRays.mat.uniforms.uTime.value = elapsed

      const shipDocked = !shipTravelTarget && !dockedMesh && !travelMode
      belts.update(shipDocked && !miningZoomRef.current ? BELT_SPEED : 0)

      // Scan flash update
      highlight.updateFlash(dt)

      // Fuel and hull consumption during travel
      if (shipTravelTarget && shipTravelStart) {
        const fuelDrain = 0.8 * dt
        shipFuelRef.current = Math.max(0, shipFuelRef.current - fuelDrain)
        setShipFuel(Math.round(shipFuelRef.current))

        if (shipFuelRef.current <= 0) {
          // No fuel — damage shield first, then hull
          const hullDrain = 0.3 * dt
          if (shipShieldRef.current > 0) {
            shipShieldRef.current = Math.max(0, shipShieldRef.current - hullDrain)
            setShipShield(Math.round(shipShieldRef.current))
          } else {
            shipConditionRef.current = Math.max(0, shipConditionRef.current - hullDrain)
            setShipCondition(shipConditionRef.current)
          }
        }
      }

      // Mining zoom — keep camera focused on asteroid
      const mMesh = miningMeshRef.current
      const mId = miningInstanceIdRef.current
      if (miningZoomRef.current && mMesh && mId >= 0) {
        mMesh.getMatrixAt(mId, instanceMatrix)
        instanceMatrix.premultiply(mMesh.matrixWorld)
        const worldPos = new THREE.Vector3().setFromMatrixPosition(instanceMatrix)
        if (miningZoom.target) {
          miningZoom.updateTarget(worldPos)
        } else {
          miningZoom.zoomTo(worldPos)
        }

        // Center camera XY on asteroid so it appears in the middle of the screen
        const zoomT = Math.min(1, miningZoom.progress / 1) // 0..1
        const eased = 1 - (1 - zoomT) ** 2
        camera.position.x += (worldPos.x - camera.position.x) * eased
        camera.position.y += (worldPos.y - camera.position.y) * eased

        // Project to screen
        const projected = worldPos.clone().project(camera)
        const sx = (projected.x * 0.5 + 0.5) * window.innerWidth
        const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight
        miningScreenCenterRef.current = { x: sx, y: sy }

        // Show drill overlay once zoom is mostly complete
        if (miningZoom.progress > 0.8 && !miningStarted) {
          miningStarted = true
          setIsMining(true)
        }
      } else if (miningZoomRef.current && dockedMesh && dockedInstanceId >= 0) {
        dockedMesh.getMatrixAt(dockedInstanceId, instanceMatrix)
        instanceMatrix.premultiply(dockedMesh.matrixWorld)
        scanZoom.zoomTo(new THREE.Vector3().setFromMatrixPosition(instanceMatrix))
      } else if (!scanning && scanZoom.target) {
        // Only zoom out if not scanning and not mining
        if (!miningZoomRef.current) scanZoom.zoomOut()
      }
      if (!miningZoomRef.current && miningZoom.target) {
        miningZoom.zoomOut()
        miningStarted = false
      }

      // Asteroid hover highlight
      if (miningZoomRef.current) {
        highlight.hide()
        // Hide all asteroid chunks except the one containing the mining target
        const mMesh = miningMeshRef.current
        for (const mesh of belts.meshes) {
          mesh.visible = mesh === mMesh
        }
        if (ship.model) ship.model.visible = false
        ship.ringGroup.visible = false
        ship.hitGroup.visible = false
      } else {
        for (const mesh of belts.meshes) {
          mesh.visible = true
        }
        if (ship.model) ship.model.visible = true
        if (travelMode && highlightedAsteroidIdx >= 0 && highlightedMesh) {
          highlight.show(highlightedMesh, highlightedAsteroidIdx, instanceMatrix)
        } else if (dockedMesh && dockedInstanceId >= 0) {
          if (scanning) {
            highlight.showWithBlink(dockedMesh, dockedInstanceId, instanceMatrix, elapsed)
          } else {
            highlight.show(dockedMesh, dockedInstanceId, instanceMatrix)
          }
        } else {
          highlight.hide()
        }
      }

      // Scanned asteroid indicators
      if (!miningZoomRef.current) {
        scannedIndicators.update(belts.allScanned, belts.meshes, instanceMatrix)
      } else {
        scannedIndicators.hide()
      }

      // Ship update
      const shipPanScale = dockedMesh ? 0 : 0.85
      ship.update(elapsed, panX, panY, t, camera, shipPanScale)

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
          ship.select()
          if (travelLineRef.current) travelLineRef.current.style.display = 'none'
          if (dockedMesh) showMenu()
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
      const screenPos = ship.getScreenPosition(camera)
      if (!miningZoomRef.current) {
        updateTooltip(tooltipRef.current, ship, screenPos, travelMode)

        // Position menu when visible
        updateMenu(menuRef.current, menuLineRef.current, ship, screenPos, mouse.x, mouse.y, t, maxZoom, dockedMesh)

        // Position ship stats panel on opposite side of menu when in details mode
        updateShipStats(shipStatsRef.current, menuRef.current, ship, screenPos, mouse.x, mouse.y, t, maxZoom)
      } else {
        // Force-hide menu and tooltip during mining
        if (menuRef.current) {
          menuRef.current.style.opacity = '0'
          menuRef.current.style.pointerEvents = 'none'
        }
        if (tooltipRef.current) tooltipRef.current.style.opacity = '0'
        if (menuLineRef.current) menuLineRef.current.setAttribute('opacity', '0')
      }

      // Update button disabled states
      updateButtonStates(dockedMesh, scanning, !!dockedAsteroid?.scanned)

      // Scan progress
      if (scanning) {
        // Check for abort
        if (abortScanRef.current) {
          abortScanRef.current = false
          scanning = false
          scanProgress = 0
          scanZoom.zoomOut()
          ship.ringGroup.visible = ship.isSelected
          setScanResult((prev) => ({ ...prev, visible: false }))
        } else {
          const now = performance.now()
          scanProgress = Math.min(1, (now - scanStartTime) / scanDuration)

          // Throttled state update for line-by-line reveal (~10fps)
          if (now - lastProgressUpdate > 100) {
            lastProgressUpdate = now
            setScanResult((prev) => ({ ...prev, progress: scanProgress }))
          }

          if (scanProgress >= 1) {
            scanning = false
            scanZoom.zoomOut()
            ship.ringGroup.visible = ship.isSelected
            if (dockedAsteroid) {
              dockedAsteroid.scanned = true
              renderScanResult(dockedAsteroid, true, true)
            }
          }
        }
      }

      // Position standalone scan result for remote scanned asteroids
      if (standaloneScanRef.current && scanResultVisible && hoveredMesh && hoveredInstanceId >= 0) {
        hoveredMesh.getMatrixAt(hoveredInstanceId, instanceMatrix)
        instanceMatrix.premultiply(hoveredMesh.matrixWorld)
        const asteroidPos = new THREE.Vector3().setFromMatrixPosition(instanceMatrix)
        asteroidPos.project(camera)
        const ax = (asteroidPos.x * 0.5 + 0.5) * window.innerWidth
        const ay = (-asteroidPos.y * 0.5 + 0.5) * window.innerHeight
        updateScanPanel(standaloneScanRef.current, scanLineRef.current, ax, ay, mouse.x, mouse.y, asteroidZoom.progress)
      } else {
        hideScanPanel(standaloneScanRef.current, scanLineRef.current)
      }

      // Draw animated travel line
      if ((travelMode || shipTravelTarget) && travelLineRef.current) {
        const shipScreen = ship.getScreenPosition(camera)
        if (shipScreen) {
          let endX = travelCursorScreen.x
          let endY = travelCursorScreen.y
          if (shipTravelTarget) {
            const targetScreen = shipTravelTarget.clone().project(camera)
            endX = (targetScreen.x * 0.5 + 0.5) * window.innerWidth
            endY = (-targetScreen.y * 0.5 + 0.5) * window.innerHeight
          }
          travelLine.draw(travelLineRef.current, shipScreen, { x: endX, y: endY }, elapsed)
        }
      }

      // Sun screen position for god rays & lens flare (offset by pan so sun stays static)
      sunScreenHelper.set(sunPos.x + panX, sunPos.y + panY, sunPos.z).project(camera)
      const sunUV_x = sunScreenHelper.x * 0.5 + 0.5
      const sunUV_y = sunScreenHelper.y * 0.5 + 0.5
      godRays.mat.uniforms.uSunPos.value.set(sunUV_x, sunUV_y)
      lensFlare.mat.uniforms.uSunPos.value.set(sunUV_x, sunUV_y)

      // Solar event update
      solarEvent.update(elapsed, dt, ship.config.position)
      sun.mat.uniforms.uFlare.value = solarEvent.currentFlareIntensity
      const flare = solarEvent.currentFlareIntensity
      const isActive = solarEvent.phase === 'active'
      godRays.mat.uniforms.uExposure.value = 0.6 + flare * (isActive ? 1.2 : 0.3)
      lensFlare.mat.uniforms.uIntensity.value = 0.4 + flare * (isActive ? 0.8 : 0.2)
      belts.light.intensity = 4 + flare * 4
      planetObj.planetMat.uniforms.uFlare.value = flare * 0.35
      // Sharp flashing strobe on asteroids during active/cooldown
      if (isActive || solarEvent.phase === 'cooldown') {
        const strobe1 = Math.max(0, Math.sin(elapsed * 12)) ** 40 * 30
        const strobe2 = Math.max(0, Math.sin(elapsed * 8 + 1.5)) ** 50 * 20
        const strobe3 = Math.max(0, Math.sin(elapsed * 18 + 3.0)) ** 60 * 15
        const strobeFade =
          solarEvent.phase === 'cooldown'
            ? Math.max(0, 1 - (elapsed - solarEvent.phaseStartTime) / solarEvent.cooldownDuration) ** 2
            : 1
        belts.light.intensity += (strobe1 + strobe2 + strobe3) * strobeFade
      }
      if (solarEvent.phase !== lastSolarPhase) {
        lastSolarPhase = solarEvent.phase
        setSolarPhase(solarEvent.phase)
      }
      if (solarEvent.phase === 'warning' && solarEvent.countdown !== lastSolarCountdown) {
        lastSolarCountdown = solarEvent.countdown
        setSolarCountdown(solarEvent.countdown)
      }

      // Solar wave update
      solarWave.update(dt, sunUV_x, sunUV_y, isActive, solarEvent.phase === 'cooldown')

      // Render occlusion pass (sun bright, planet black)
      renderer.setRenderTarget(godRays.occlusionRT)
      renderer.render(godRays.occlusionScene, camera)

      // Render main scene
      renderer.setRenderTarget(null)
      renderer.render(scene, camera)

      // Composite god rays + lens flare + solar wave (additive)
      renderer.autoClear = false
      renderer.render(godRays.overlay, godRays.overlayCamera)
      renderer.render(lensFlare.overlay, godRays.overlayCamera)
      if (solarWave.isActive) renderer.render(solarWave.overlay, godRays.overlayCamera)
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
      godRays.occlusionRT.setSize(rtWidth, rtHeight)
      lensFlare.mat.uniforms.uAspect.value = w / h
      solarWave.mat.uniforms.uAspect.value = w / h
    }
    window.addEventListener('resize', handleResize)

    // Travel button handler
    const handleTravelClick = () => {
      travelMode = true
      travelCursorScreen = { x: lastMouseScreen.x, y: lastMouseScreen.y }
      dockedMesh = null
      dockedInstanceId = -1
      dockedMeshRef.current = null
      dockedInstanceIdRef.current = -1
      dockedAsteroid = null
      ship.ringGroup.visible = false
      ship.zoomOut()
      setDetailsMode(false)
      hideMenu()
      hideScanResult()
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
      dockedMeshRef.current = null
      dockedInstanceIdRef.current = -1
      dockedAsteroid = null
      shipTravelTarget = new THREE.Vector3(1.2, 0.25, -3.5)
      shipTravelStart = new THREE.Vector3(...ship.config.position)
      shipTravelProgress = 0
      ship.deselect()
      ship.zoomOut()
      setDetailsMode(false)
      hideMenu()
      hideScanResult()
      if (travelLineRef.current) {
        travelLineRef.current.style.display = 'block'
      }
    }
    const dockBtn = document.getElementById('dock-btn')
    if (dockBtn) dockBtn.addEventListener('click', handleDockClick)

    // Scan button handler
    const handleScanClick = () => {
      if (!dockedMesh || dockedInstanceId < 0 || scanning || !dockedAsteroid) return
      if (dockedAsteroid.scanned) return
      // Block scanning during active solar radiation event
      if (solarEvent.phase === 'active' || solarEvent.phase === 'cooldown') return
      const asteroidScale = dockedAsteroid.scale
      scanDuration = 2000 + asteroidScale * 3000 + Math.random() * 3000
      if (scanDuration > 10000) scanDuration = 10000
      scanStartTime = performance.now()
      scanProgress = 0
      scanning = true
      ship.ringGroup.visible = false
      // Flash the asteroid highlight
      highlight.flash()
      // Zoom toward docked asteroid
      if (dockedMesh && dockedInstanceId >= 0) {
        dockedMesh.getMatrixAt(dockedInstanceId, instanceMatrix)
        instanceMatrix.premultiply(dockedMesh.matrixWorld)
        scanZoom.zoomTo(new THREE.Vector3().setFromMatrixPosition(instanceMatrix))
      }
      renderScanResult(dockedAsteroid, false, true)
    }
    const scanBtn = document.getElementById('scan-btn')
    if (scanBtn) scanBtn.addEventListener('click', handleScanClick)

    // Mining button handler — shows scan results for scanned asteroid
    const handleMiningClick = () => {
      if (!dockedAsteroid?.scanned) return
      hideMenu()
      highlight.hide()
      if (dockedMesh && dockedInstanceId >= 0) {
        startMiningDirectRef.current?.(dockedAsteroid, dockedMesh, dockedInstanceId)
      } else {
        ship.ringGroup.visible = false
        renderScanResult(dockedAsteroid, true, true)
      }
    }
    const miningBtn = document.getElementById('mining-btn')
    if (miningBtn) miningBtn.addEventListener('click', handleMiningClick)

    // Details button handler — zoom in on ship
    const handleDetailsClick = () => {
      maxZoom = 1
      ship.toggleZoom()
      setDetailsMode(ship.isZoomed)
      hideMenu()
    }
    const detailsBtn = document.getElementById('details-btn')
    if (detailsBtn) detailsBtn.addEventListener('click', handleDetailsClick)

    // Exit details button handler — zoom out
    const handleExitDetailsClick = () => {
      if (!ship.isZoomed) return
      maxZoom = 1
      ship.zoomOut()
      setDetailsMode(false)
    }
    const exitDetailsBtn = document.getElementById('exit-details-btn')
    if (exitDetailsBtn) exitDetailsBtn.addEventListener('click', handleExitDetailsClick)

    return () => {
      if (travelBtn) travelBtn.removeEventListener('click', handleTravelClick)
      if (dockBtn) dockBtn.removeEventListener('click', handleDockClick)
      if (scanBtn) scanBtn.removeEventListener('click', handleScanClick)
      if (miningBtn) miningBtn.removeEventListener('click', handleMiningClick)
      if (detailsBtn) detailsBtn.removeEventListener('click', handleDetailsClick)
      if (exitDetailsBtn) exitDetailsBtn.removeEventListener('click', handleExitDetailsClick)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keydown', handleKeyDown)
      cancelAnimationFrame(frameId)
      container.removeChild(renderer.domElement)
      renderer.dispose()
      planetObj.dispose()
      belts.dispose()
      starsObj.dispose()
      sun.dispose()
      godRays.dispose()
      lensFlare.dispose()
      solarWave.dispose()
      travelLine.dispose()
      highlight.dispose()
      scannedIndicators.dispose()
      ship.dispose()
    }
  }, [])

  return (
    <>
      <RadiationWarning phase={solarPhase} countdown={solarCountdown} />
      <FullscreenLayer ref={containerRef} sx={{ zIndex: 0, pointerEvents: 'auto' }} />
      {isMining && miningAsteroid && (
        <DrillOverlay
          asteroid={miningAsteroid}
          tutorialSeen={user.drillTutorialSeen}
          screenCenterRef={miningScreenCenterRef}
          onTutorialDismiss={() => patchUser.mutate({ drillTutorialSeen: true })}
          onComplete={handleMiningComplete}
        />
      )}
      <ShipTooltip ref={tooltipRef} name="TELLUS RX 5" />
      <HudPanel ref={standaloneScanRef}>
        {scanResult.visible && scanResult.isRemote && (
          <ScanResult
            visible
            asteroid={scanResult.asteroid}
            revealed={scanResult.revealed}
            progress={scanResult.progress}
          />
        )}
      </HudPanel>
      <ConnectorLines menuLineRef={menuLineRef} scanLineRef={scanLineRef} />
      <HudPanel ref={menuRef}>
        <ShipMenu />
        {scanResult.visible && !scanResult.isRemote && scanResult.asteroid && (
          <ScanResult
            visible={scanResult.visible}
            asteroid={scanResult.asteroid}
            revealed={scanResult.revealed}
            progress={scanResult.progress}
            onMiningStart={handleMiningStartClick}
            onAbort={handleAbortScan}
          />
        )}
      </HudPanel>
      <HudPanel ref={shipStatsRef}>
        <ShipStats visible={detailsMode} spacecraft={spacecraft} />
      </HudPanel>
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
