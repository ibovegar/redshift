import React, { Component } from 'react';
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

export default class Canvas extends Component<Props, any> {
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  manager: THREE.LoadingManager;
  controls: OrbitControls;
  mesh: any = null;
  canvas: any = null;
  frameId: any = null;
  enableHelpers = false;
  spacecraftModel: any;

  componentDidMount() {
    this.init();
    this.addControls();

    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { attachedUpgrades, previewType } = this.props;
    this.updateModel(UpgradeType.Engine, !!attachedUpgrades.engine);
    this.updateModel(UpgradeType.Weapons, !!attachedUpgrades.weapons);
    this.updateModel(UpgradeType.Stabilizer, !!attachedUpgrades.stabilizer);
    this.updateModel(UpgradeType.Plating, !!attachedUpgrades.plating);
    this.updateModel(UpgradeType.Deflector, !!attachedUpgrades.deflector);

    if (previewType !== prevProps.previewType) {
      // Clear previous preview
      if (prevProps.previewType) {
        this.setPreview(prevProps.previewType, false);
      }
      // Show new preview (only if not already attached)
      if (
        previewType &&
        !attachedUpgrades[previewType as keyof AttachedUpgrades]
      ) {
        this.setPreview(previewType, true);
      }
    }
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
    this.canvas.removeChild(this.renderer.domElement);
  }

  fadeTargets: Map<any, number> = new Map();
  fadeSpeed = 0.03;
  clonedMaterials: Set<any> = new Set();
  previewOpacity = 0.4;
  previewTint = new THREE.Color(0.2, 0.6, 1.5);
  originalColors: Map<any, THREE.Color> = new Map();

  setPreview = (upgradeType: string, show: boolean) => {
    if (!this.spacecraftModel) return;

    const registry = this.props.spacecraft.spacecraftRegistry;
    const map = upgradeMap[registry][upgradeType];
    if (!map) return;

    for (const modelName of map) {
      const model = this.spacecraftModel.children.find(
        (m: any) => m.name === modelName
      );
      if (!model) continue;

      // Clone materials if not done yet
      model.traverse((child: any) => {
        if (
          child.isMesh &&
          child.material &&
          !this.clonedMaterials.has(child)
        ) {
          child.material = child.material.clone();
          child.material.transparent = true;
          this.clonedMaterials.add(child);
        }
      });

      if (show) {
        model.visible = true;
        model.traverse((child: any) => {
          if (child.isMesh && child.material) {
            // Store original color and apply blue tint
            if (!this.originalColors.has(child)) {
              this.originalColors.set(child, child.material.color.clone());
            }
            child.material.color.copy(this.previewTint);
            child.material.emissive = new THREE.Color(0.15, 0.4, 1.0);
            child.material.opacity = this.previewOpacity;
          }
        });
        this.fadeTargets.set(model, this.previewOpacity);
      } else {
        // Restore original colors
        model.traverse((child: any) => {
          if (child.isMesh && child.material) {
            const orig = this.originalColors.get(child);
            if (orig) {
              child.material.color.copy(orig);
            }
            if (child.material.emissive) {
              child.material.emissive.set(0, 0, 0);
            }
          }
        });
        this.fadeTargets.set(model, 0);
      }
    }
  };

  updateModel = (upgradeType: string, isVisible: boolean) => {
    if (!this.spacecraftModel) return;

    const map =
      upgradeMap[this.props.spacecraft.spacecraftRegistry][upgradeType];

    for (const modelName of map) {
      const model = this.spacecraftModel.children.find(
        (m: any) => m.name === modelName
      );
      if (!model) continue;

      // Clone materials so fading doesn't affect shared materials
      model.traverse((child: any) => {
        if (
          child.isMesh &&
          child.material &&
          !this.clonedMaterials.has(child)
        ) {
          child.material = child.material.clone();
          child.material.transparent = true;
          this.clonedMaterials.add(child);
        }
      });

      if (isVisible) model.visible = true;

      this.fadeTargets.set(model, isVisible ? 1 : 0);
    }
  };

  updateFades = () => {
    this.fadeTargets.forEach((targetOpacity, model) => {
      let done = true;
      model.traverse((child: any) => {
        if (child.isMesh && child.material) {
          const current = child.material.opacity;
          if (Math.abs(current - targetOpacity) > 0.01) {
            child.material.opacity +=
              (targetOpacity - current) * this.fadeSpeed * 3;
            done = false;
          } else {
            child.material.opacity = targetOpacity;
          }
        }
      });
      if (done) {
        if (targetOpacity === 0) model.visible = false;
        this.fadeTargets.delete(model);
      }
    });
  };

  addControls = () => {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.5;
    this.controls.rotateSpeed = 0.5;
    this.controls.enablePan = false;
    this.controls.zoomSpeed = 1.0;
  };

  handleClick = () => {
    this.controls.autoRotate = false;
  };

  init = () => {
    const aspectRatio = getAspectRatio(this.canvas);
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(40, aspectRatio, 0.1, 100);
    this.camera.position.z = 12;
    this.camera.position.y = 14;
    this.camera.position.x = 12;
    this.camera.lookAt(this.scene.position);

    // Add hemisphere light
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 6);
    this.scene.add(hemisphereLight);

    // Add spotlight
    const spotLight = new THREE.SpotLight(0xffffff, 300);
    spotLight.position.setY(20);
    spotLight.position.setZ(0);
    spotLight.angle = Math.PI / 8;
    spotLight.penumbra = 0.05;
    spotLight.decay = 2;
    spotLight.distance = 200;
    this.scene.add(spotLight);

    // Add ambient light
    // const ambLight = new THREE.AmbientLight(0xffffff);
    // this.scene.add(ambLight);

    // Add directional light
    const dirLight = new THREE.DirectionalLight(0xffffff, 6);
    dirLight.position.setY(40);
    dirLight.position.setZ(-10);
    this.scene.add(dirLight);

    // Add point light
    const pointLight = new THREE.PointLight(0xffffff, 150, 100);
    pointLight.position.setY(-4);
    pointLight.position.setX(-8);
    pointLight.position.setZ(-10);
    this.scene.add(pointLight);

    if (this.enableHelpers) {
      const spotHelper = new THREE.SpotLightHelper(spotLight);
      const dirHelper = new THREE.DirectionalLightHelper(dirLight, 5);
      const sphereSize = 1;
      const pointHelper = new THREE.PointLightHelper(pointLight, sphereSize);
      this.scene.add(spotHelper);
      this.scene.add(dirHelper);
      this.scene.add(pointHelper);
      this.scene.add(new THREE.AxesHelper(200));
    }

    const manager = new THREE.LoadingManager();

    manager.onLoad = () => {
      this.setState({ isLoading: false });
    };

    manager.onProgress = (_, loaded, total) => {
      const progress = (loaded / total) * 100;
      this.setState({ progress });
    };

    const loader = new GLTFLoader(manager);
    loader.load(
      `${process.env.PUBLIC_URL}/models/${this.props.spacecraft.spacecraftRegistry}.glb`,
      (gltf) => {
        this.scene.add(gltf.scene);
        this.spacecraftModel = gltf.scene;

        // Hide all upgrade parts immediately before first render
        const registry = this.props.spacecraft.spacecraftRegistry;
        const { attachedUpgrades } = this.props;
        const upgradeTypes = Object.keys(upgradeMap[registry]);
        for (const type of upgradeTypes) {
          const isAttached =
            !!attachedUpgrades[type as keyof typeof attachedUpgrades];
          for (const modelName of upgradeMap[registry][type]) {
            const model = this.spacecraftModel.children.find(
              (m: any) => m.name === modelName
            );
            if (model) model.visible = isAttached;
          }
        }

        this.props.onLoaded();
      },
      () => console.log(''),
      (error) => console.error(error)
    );

    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });

    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.canvas.appendChild(this.renderer.domElement);
  };

  animate = () => {
    this.controls.update();
    this.updateFades();
    this.renderScene();
    this.frameId = window.requestAnimationFrame(this.animate);
  };

  renderScene = () => {
    this.renderer.render(this.scene, this.camera);
  };

  render() {
    return (
      <div
        style={{ width: '100%', height: '100%' }}
        onClick={this.handleClick}
        ref={(canvas) => {
          this.canvas = canvas;
        }}
      />
    );
  }
}
