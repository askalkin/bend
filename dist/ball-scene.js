import * as THREE from "three";
import { GLTFLoader } from "./assets/vendor/GLTFLoader.js";

const canvas = document.querySelector("#ballCanvas");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (canvas && !reducedMotion.matches) {
  const contextOptions = {
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
  };
  let context = null;
  try {
    context =
      canvas.getContext("webgl2", contextOptions) ||
      canvas.getContext("webgl", contextOptions);
  } catch {
    context = null;
  }

  if (!context) {
    canvas.closest(".transform-sticky").classList.add("webgl-unavailable");
  } else {
    const renderer = new THREE.WebGLRenderer({ canvas, context });
    canvas.closest(".transform-sticky").classList.add("webgl-ready");
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.4));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x6f7f75, 3.1));
    const key = new THREE.DirectionalLight(0xffffff, 4.2);
    key.position.set(-4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x83d8ff, 3.6);
    rim.position.set(5, 1, 3);
    scene.add(rim);

    const ballGroup = new THREE.Group();
    scene.add(ballGroup);
    const fallback = new THREE.Mesh(
      new THREE.SphereGeometry(1, 96, 64),
      new THREE.MeshPhysicalMaterial({
        color: 0xc8ff22,
        roughness: 0.82,
        clearcoat: 0.08,
      }),
    );
    ballGroup.add(fallback);

    const materials = [];
    const loader = new GLTFLoader();
    loader.load(
      "./assets/3d/tennis-ball-felt-web.glb",
      (gltf) => {
        ballGroup.remove(fallback);
        fallback.geometry.dispose();
        fallback.material.dispose();
        const model = gltf.scene;
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const scale = 2 / Math.max(size.x, size.y, size.z);
        model.position.copy(center).multiplyScalar(-scale);
        model.scale.setScalar(scale);
        model.traverse((child) => {
          if (!child.isMesh) return;
          child.castShadow = false;
          child.receiveShadow = false;
          child.material = child.material.clone();
          child.material.roughness = 0.96;
          child.material.metalness = 0;
          child.material.transparent = true;
          materials.push(child.material);
        });
        ballGroup.add(model);
      },
      undefined,
      () => canvas.classList.add("model-fallback"),
    );

    let progress = 0;
    let targetProgress = 0;
    let previousTime = 0;
    const acid = new THREE.Color(0xc8ff22);
    const pill = new THREE.Color(0xf0f2e8);
    const clamp = (value, min = 0, max = 1) =>
      Math.min(max, Math.max(min, value));
    const segment = (value, start, end) =>
      clamp((value - start) / Math.max(0.001, end - start));
    const smooth = (value) => value * value * (3 - 2 * value);

    window.addEventListener("bend:transform", (event) => {
      targetProgress = event.detail.progress;
    });

    function resize() {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    function render(time) {
      const delta = Math.min(0.05, (time - previousTime) / 1000 || 0.016);
      previousTime = time;
      progress += (targetProgress - progress) * Math.min(1, delta * 7.5);

      const arrival = smooth(segment(progress, 0, 0.25));
      const materialChange = smooth(segment(progress, 0.22, 0.5));
      const drop = smooth(segment(progress, 0.5, 0.94));
      const mobile = window.innerWidth < 720;

      ballGroup.position.x = THREE.MathUtils.lerp(
        mobile ? 0.8 : 1.8,
        0,
        arrival,
      );
      ballGroup.position.y =
        THREE.MathUtils.lerp(
          mobile ? 0.35 : 0.85,
          mobile ? 0.75 : 0.25,
          arrival,
        ) -
        drop * (mobile ? 1.55 : 1.8);
      ballGroup.position.z = THREE.MathUtils.lerp(-0.4, 0.35, materialChange);
      const baseScale = mobile ? 0.92 : 1.25;
      ballGroup.scale.setScalar(
        baseScale * THREE.MathUtils.lerp(1.05, 0.15, drop),
      );
      ballGroup.rotation.y = progress * 3.8;
      ballGroup.rotation.x = -0.18 + progress * 0.42;

      materials.forEach((material) => {
        material.color.copy(acid).lerp(pill, materialChange * 0.18);
        material.roughness = THREE.MathUtils.lerp(0.96, 0.42, materialChange);
        material.clearcoat = THREE.MathUtils.lerp(0, 0.5, materialChange);
        material.opacity = 1 - smooth(segment(progress, 0.86, 1));
        if (material.normalScale)
          material.normalScale.setScalar(
            THREE.MathUtils.lerp(0.58, 0.04, materialChange),
          );
      });
      if (fallback.material) {
        fallback.material.color.copy(acid).lerp(pill, materialChange * 0.85);
        fallback.material.roughness = THREE.MathUtils.lerp(
          0.86,
          0.3,
          materialChange,
        );
      }

      renderer.render(scene, camera);
    }

    let inView = false;
    const updateLoop = () =>
      renderer.setAnimationLoop(inView && !document.hidden ? render : null);
    const sectionObserver = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        updateLoop();
      },
      { rootMargin: "100px 0px" },
    );
    sectionObserver.observe(canvas.closest("[data-transform-section]"));
    document.addEventListener("visibilitychange", updateLoop);
    renderer.render(scene, camera);
  }
}
