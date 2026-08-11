import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { moveToward } from './chase.js';
import { aimForward } from './flashlight.js';
import { readMovement } from './movement.js';
import { advanceProgress } from './progress.js';

const init = () => {
  const container = document.getElementById('app');
  const uiLayer = document.getElementById('ui-layer');
  const startButton = document.getElementById('start-button');
  const screenTitle = document.getElementById('screen-title');
  const screenHelp = document.getElementById('screen-help');
  const objective = document.getElementById('objective');
  const prompt = document.getElementById('interaction-prompt');
  const flashlightStatus = document.getElementById('flashlight-status');

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111114);
  scene.fog = new THREE.Fog(0x111114, 8, 24);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 30);
  camera.position.set(0, 1.7, 5);

  const flashlight = new THREE.SpotLight(0xfff4dd, 60, 14, Math.PI / 12, 0.4, 1.5);
  const flashlightDirection = new THREE.Vector3();
  camera.add(flashlight);
  scene.add(camera, flashlight.target);

  const renderer = new THREE.WebGLRenderer({ antialias: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xb0b8c8, 0x202028, 0.15));

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshLambertMaterial({ color: 0x303036 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor, new THREE.GridHelper(20, 20, 0x555560, 0x3a3a42));

  const wallGeometry = new THREE.BoxGeometry(1, 1, 1);
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x707078 });
  for (const [x, z, width, depth] of [
    [-5.5, -10, 9, 0.2],
    [5.5, -10, 9, 0.2],
    [0, 10, 20, 0.2],
    [-10, 0, 0.2, 20],
    [10, 0, 0.2, 20],
  ]) {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(x, 1.5, z);
    wall.scale.set(width, 3, depth);
    scene.add(wall);
  }

  const key = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.4, 0.4),
    new THREE.MeshLambertMaterial({ color: 0xd6a800, emissive: 0x664400 })
  );
  key.position.set(3, 0.25, 0);
  key.userData.action = 'key';

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2.5, 0.2),
    new THREE.MeshLambertMaterial({ color: 0x6b1010 })
  );
  door.position.set(0, 1.25, -9.85);
  door.userData.action = 'door';

  const enemy = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.45, 1.1, 4, 8),
    new THREE.MeshLambertMaterial({ color: 0xc8c7b7 })
  );
  enemy.position.set(-6, 1, -4);
  enemy.visible = false;
  scene.add(key, door, enemy);

  const controls = new PointerLockControls(camera, renderer.domElement);
  const keys = new Set();
  const direction = new THREE.Vector2();
  const screenCenter = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  const interactables = [key, door];
  const clock = new THREE.Clock();
  let progress = 'start';
  let target = null;
  let gameOver = false;
  raycaster.far = 2;

  const interact = () => {
    if (!target) return;

    const nextProgress = advanceProgress(progress, target.userData.action);
    if (nextProgress === progress) {
      objective.textContent = 'Pintu terkunci. Cari kunci.';
      return;
    }

    progress = nextProgress;
    target.removeFromParent();
    interactables.splice(interactables.indexOf(target), 1);
    target = null;
    prompt.textContent = '';
    objective.textContent = progress === 'key' ? 'Buka pintu keluar.' : 'Demo selesai.';
    enemy.visible = progress === 'key';
  };

  const endGame = () => {
    gameOver = true;
    screenTitle.textContent = 'Game Over';
    screenHelp.textContent = 'Pocong menangkapmu.';
    startButton.textContent = 'Ulangi';
    controls.unlock();
  };

  startButton.addEventListener('click', () => {
    if (gameOver) window.location.reload();
    else controls.lock();
  });
  controls.addEventListener('lock', () => uiLayer.classList.add('playing'));
  controls.addEventListener('unlock', () => {
    keys.clear();
    target = null;
    prompt.textContent = '';
    uiLayer.classList.remove('playing');
    startButton.focus();
  });
  window.addEventListener('keydown', ({ code, repeat }) => {
    keys.add(code);
    if (code === 'KeyE' && !repeat && controls.isLocked) interact();
    if (code === 'KeyF' && !repeat && controls.isLocked) {
      flashlight.visible = !flashlight.visible;
      flashlightStatus.textContent = `Senter: ${flashlight.visible ? 'Nyala' : 'Mati'}`;
    }
  });
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
      camera.position.z = THREE.MathUtils.clamp(
        camera.position.z,
        progress === 'done' ? -12 : -9.5,
        9.5
      );
      camera.position.y = 1.7;

      raycaster.setFromCamera(screenCenter, camera);
      target = raycaster.intersectObjects(interactables)[0]?.object ?? null;
      prompt.textContent = target
        ? `E — ${target.userData.action === 'key' ? 'Ambil kunci' : 'Buka pintu'}`
        : '';

      if (progress === 'key') {
        const distance = moveToward(enemy.position, camera.position, 2 * delta);
        enemy.lookAt(camera.position.x, enemy.position.y, camera.position.z);
        if (!gameOver && distance < 0.7) endGame();
      }
    }

    aimForward(camera, flashlight.target, 14, flashlightDirection);

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
