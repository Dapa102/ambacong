import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { readMovement } from './movement.js';

const init = () => {
  const container = document.getElementById('app');
  const uiLayer = document.getElementById('ui-layer');
  const startButton = document.getElementById('start-button');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111114);
  scene.fog = new THREE.Fog(0x111114, 8, 24);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30);
  camera.position.set(0, 1.7, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xb0b8c8, 0x202028, 2));

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshLambertMaterial({ color: 0x303036 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor, new THREE.GridHelper(20, 20, 0x555560, 0x3a3a42));

  const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x707078 });
  for (const [x, z, width, depth] of [
    [0, -10, 20, 0.2],
    [0, 10, 20, 0.2],
    [-10, 0, 0.2, 20],
    [10, 0, 0.2, 20],
  ]) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, 1.5, z);
    wall.scale.set(width, 3, depth);
    scene.add(wall);
  }

  const controls = new PointerLockControls(camera, renderer.domElement);
  const keys = new Set();
  const direction = new THREE.Vector2();
  const clock = new THREE.Clock();

  startButton.addEventListener('click', () => controls.lock());
  controls.addEventListener('lock', () => uiLayer.classList.add('playing'));
  controls.addEventListener('unlock', () => {
    keys.clear();
    uiLayer.classList.remove('playing');
    startButton.focus();
  });
  window.addEventListener('keydown', ({ code }) => keys.add(code));
  window.addEventListener('keyup', ({ code }) => keys.delete(code));

  const animate = () => {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);
    if (controls.isLocked) {
      readMovement(keys, direction);
      controls.moveRight(direction.x * 4 * delta);
      controls.moveForward(direction.y * 4 * delta);

      // ponytail: room clamp only; replace with raycast/AABB when obstacles need collision.
      camera.position.x = THREE.MathUtils.clamp(camera.position.x, -9.5, 9.5);
      camera.position.z = THREE.MathUtils.clamp(camera.position.z, -9.5, 9.5);
      camera.position.y = 1.7;
    }

    renderer.render(scene, camera);
  };

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};

document.addEventListener('DOMContentLoaded', init);
