import React, { useRef, useEffect, useCallback } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Spacecraft, AttachedUpgrades, UpgradeType } from 'models';
import upgradeMap from './upgrade-map';
import { getAspectRatio } from 'utils/helpers';

interface Props {
  spacecraft: Spacecraft;
  attachedUpgrades: AttachedUpgrades;
  previewType?: string | null;
  onLoaded: () => void;
}

const FADE_SPEED = 0.03;
const PREVIEW_OPACITY = 0.4;
const PREVIEW_TINT = new THREE.Color(0.2, 0.6, 1.5);

const Canvas = (props: Props) => {
  const { spacecraft, attachedUpgrades, previewType, onLoaded } = props;
  const canvasRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null!);
  const sceneRef = useRef<THREE.Scene>(null!);
  const rendererRef = useRef<THREE.WebGLRenderer>(null!);
  const controlsRef = useRef<OrbitControls>(null!);
  const frameIdRef = useRef<number | null>(null);
  const spacecraftModelRef = useRef<any>(null);
  const fadeTargetsRef = useRef(new Map<any, number>());
  const clonedMaterialsRef = useRef(new Set<any>());
  const originalColorsRef = useRef(new Map<any, THREE.Color>());
  const propsRef = useRef({
    spacecraft,
    attachedUpgrades,
    previewType,
    onLoaded
  });

  // Keep propsRef in sync so GLTF callback reads latest props
  propsRef.current = { spacecraft, attachedUpgrades, previewType, onLoaded };

  const updateFades = useCallback(() => {
    fadeTargetsRef.current.forEach((targetOpacity, model) => {
      let done = true;
      model.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const current = child.material.opacity;
          if (Math.abs(current - targetOpacity) > 0.01) {
            child.material.opacity +=
              (targetOpacity - current) * FADE_SPEED * 3;
            done = false;
          } else {
            child.material.opacity = targetOpacity;
          }
        }
      });
      if (done) {
        if (targetOpacity === 0) model.visible = false;
        fadeTargetsRef.current.delete(model);
      }
    });
  }, []);

  const renderScene = useCallback(() => {
    rendererRef.current.render(sceneRef.current, cameraRef.current);
  }, []);

  const animate = useCallback(() => {
    controlsRef.current.update();
    updateFades();
    renderScene();
    frameIdRef.current = window.requestAnimationFrame(animate);
  }, [updateFades, renderScene]);

  const handleClick = useCallback(() => {
    controlsRef.current.autoRotate = false;
  }, []);

  // Initialize Three.js scene (runs once on mount)
  useEffect(() => {
    const canvas = canvasRef.current!;
    const aspectRatio = getAspectRatio(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 100);
    camera.position.z = 12;
    camera.position.y = 14;
    camera.position.x = 12;
    camera.lookAt(scene.position);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 6);
    scene.add(hemisphereLight);

    const spotLight = new THREE.SpotLight(0xffffff, 300);
    spotLight.position.setY(20);
    spotLight.position.setZ(0);
    spotLight.angle = Math.PI / 8;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 200;
    scene.add(spotLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 6);
    dirLight.position.setY(40);
    dirLight.position.setZ(-10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0xffffff, 150, 100);
    pointLight.position.setY(-4);
    pointLight.position.setX(-8);
    pointLight.position.setZ(-10);
    scene.add(pointLight);

    const manager = new THREE.LoadingManager();
    manager.onProgress = (_: any, loaded: number, total: number) => {
      console.log(`Loading: ${((loaded / total) * 100).toFixed(0)}%`);
    };

    const loader = new GLTFLoader(manager);
    loader.load(
      `${process.env.PUBLIC_URL}/models/${propsRef.current.spacecraft.spacecraftRegistry}.glb`,
      (gltf) => {
        scene.add(gltf.scene);
        spacecraftModelRef.current = gltf.scene;

        // Hide all upgrade parts immediately before first render
        const registry = propsRef.current.spacecraft.spacecraftRegistry;
        const attached = propsRef.current.attachedUpgrades;
        const upgradeTypes = Object.keys(upgradeMap[registry]);
        for (const type of upgradeTypes) {
          const isAttached = !!attached[type as keyof typeof attached];
          for (const modelName of upgradeMap[registry][type]) {
            const model = spacecraftModelRef.current.children.find(
              (m: any) => m.name === modelName
            );
            if (model) model.visible = isAttached;
          }
        }

        propsRef.current.onLoaded();
      },
      () => {},
      (error) => console.error(error)
    );

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    renderer.setPixelRatio(devicePixelRatio);
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    canvas.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    controls.rotateSpeed = 0.5;
    controls.enablePan = false;
    controls.zoomSpeed = 1.0;

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    frameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      canvas.removeChild(renderer.domElement);
    };
  }, [animate]);

  // Handle attachedUpgrades changes
  useEffect(() => {
    const model = spacecraftModelRef.current;
    if (!model) return;

    const cloneMaterials = (part: any) => {
      part.traverse((child: any) => {
        if (
          child.isMesh &&
          child.material &&
          !clonedMaterialsRef.current.has(child)
        ) {
          child.material = child.material.clone();
          child.material.transparent = true;
          clonedMaterialsRef.current.add(child);
        }
      });
    };

    const updateModel = (upgradeType: string, isVisible: boolean) => {
      const map = upgradeMap[spacecraft.spacecraftRegistry][upgradeType];
      for (const modelName of map) {
        const part = model.children.find((m: any) => m.name === modelName);
        if (!part) continue;
        cloneMaterials(part);
        if (isVisible) part.visible = true;
        fadeTargetsRef.current.set(part, isVisible ? 1 : 0);
      }
    };

    updateModel(UpgradeType.Engine, !!attachedUpgrades.engine);
    updateModel(UpgradeType.Weapons, !!attachedUpgrades.weapons);
    updateModel(UpgradeType.Stabilizer, !!attachedUpgrades.stabilizer);
    updateModel(UpgradeType.Plating, !!attachedUpgrades.plating);
    updateModel(UpgradeType.Deflector, !!attachedUpgrades.deflector);
  }, [attachedUpgrades, spacecraft.spacecraftRegistry]);

  // Handle previewType changes
  const prevPreviewRef = useRef<string | null | undefined>(null);
  useEffect(() => {
    const model = spacecraftModelRef.current;
    if (!model) return;

    const prevPreview = prevPreviewRef.current;
    prevPreviewRef.current = previewType;

    const setPreview = (upgradeType: string, show: boolean) => {
      const registry = spacecraft.spacecraftRegistry;
      const map = upgradeMap[registry][upgradeType];
      if (!map) return;

      for (const modelName of map) {
        const part = model.children.find((m: any) => m.name === modelName);
        if (!part) continue;

        part.traverse((child: any) => {
          if (
            child.isMesh &&
            child.material &&
            !clonedMaterialsRef.current.has(child)
          ) {
            child.material = child.material.clone();
            child.material.transparent = true;
            clonedMaterialsRef.current.add(child);
          }
        });

        if (show) {
          part.visible = true;
          part.traverse((child: any) => {
            if (child.isMesh && child.material) {
              if (!originalColorsRef.current.has(child)) {
                originalColorsRef.current.set(
                  child,
                  child.material.color.clone()
                );
              }
              child.material.color.copy(PREVIEW_TINT);
              child.material.emissive = new THREE.Color(0.15, 0.4, 1.0);
              child.material.opacity = PREVIEW_OPACITY;
            }
          });
          fadeTargetsRef.current.set(part, PREVIEW_OPACITY);
        } else {
          part.traverse((child: any) => {
            if (child.isMesh && child.material) {
              const orig = originalColorsRef.current.get(child);
              if (orig) child.material.color.copy(orig);
              if (child.material.emissive) {
                child.material.emissive.set(0, 0, 0);
              }
            }
          });
          fadeTargetsRef.current.set(part, 0);
        }
      }
    };

    if (prevPreview) {
      setPreview(prevPreview, false);
    }
    if (
      previewType &&
      !attachedUpgrades[previewType as keyof AttachedUpgrades]
    ) {
      setPreview(previewType, true);
    }
  }, [previewType, attachedUpgrades, spacecraft.spacecraftRegistry]);

  return (
    <div
      style={{ width: '100%', height: '100%' }}
      onClick={handleClick}
      ref={canvasRef}
    />
  );
};

export default Canvas;
