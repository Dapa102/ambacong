// Post-processing: bloom untuk sumber cahaya, lalu pass "horror" (film grain,
// chromatic aberration tipis, color grading dingin) di ruang warna layar.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

const BLOOM_STRENGTH = 0.55;
const BLOOM_RADIUS = 0.5;
const BLOOM_THRESHOLD = 0.9;

const HorrorShader = {
  uniforms: {
    tDiffuse: { value: null },
    time: { value: 0 },
    grain: { value: 0.045 },
    aberration: { value: 0.012 },
    saturation: { value: 0.85 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float grain;
    uniform float aberration;
    uniform float saturation;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      vec2 dir = vUv - 0.5;
      vec2 offset = dir * dot(dir, dir) * aberration;
      vec3 color = vec3(
        texture2D(tDiffuse, vUv + offset).r,
        texture2D(tDiffuse, vUv).g,
        texture2D(tDiffuse, vUv - offset).b
      );
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = mix(vec3(luma), color, saturation);
      // Bayangan sedikit kebiruan-hijau, sorotan tetap hangat.
      color += vec3(-0.012, 0.004, 0.022) * (1.0 - luma);
      color += (rand(vUv * 1000.0 + fract(time * 7.3)) - 0.5) * grain;
      gl_FragColor = vec4(color, 1.0);
    }
  `,
};

/**
 * Membuat pipeline post-processing.
 * @param {THREE.WebGLRenderer} renderer
 * @param {THREE.Scene} scene
 * @param {THREE.Camera} camera
 * @param {{bloom: boolean, msaa: boolean}} quality - Matikan untuk GPU lemah/software renderer
 * @returns {{render: (time: number) => void, setSize: (w: number, h: number) => void}}
 */
export const createPostProcessing = (renderer, scene, camera, quality) => {
  const size = renderer.getSize(new THREE.Vector2());
  const pixelRatio = renderer.getPixelRatio();
  const target = new THREE.WebGLRenderTarget(size.x * pixelRatio, size.y * pixelRatio, {
    type: THREE.HalfFloatType,
    samples: quality.msaa ? 4 : 0,
  });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  if (quality.bloom) {
    composer.addPass(
      new UnrealBloomPass(size.clone(), BLOOM_STRENGTH, BLOOM_RADIUS, BLOOM_THRESHOLD)
    );
  }
  composer.addPass(new OutputPass());
  const horror = new ShaderPass(HorrorShader);
  composer.addPass(horror);

  return {
    render(time) {
      horror.uniforms.time.value = time;
      composer.render();
    },
    setSize(width, height) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(width, height);
    },
  };
};
