// The hub at the centre of the world: the live band (stacked-trace spectrum),
// a curved wall of real AetherSDR screenshots behind it, the ground grid that
// ties the stations together, and the light paths from hub to each station.

import * as THREE from 'three';
import { createSpectrum, SIZE } from './spectrum.js';
import { shotTexture, SHOTS, labelSprite } from './textures.js';

export function createHub(engine) {
  const root = new THREE.Group();
  engine.scene.add(root);

  // Ground: a faint polar grid fading out with distance.
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(900, 96),
    new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uColor: { value: new THREE.Color('#1d4a6e') }, uTime: { value: 0 } },
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: /* glsl */`
        uniform vec3 uColor; uniform float uTime; varying vec2 vP;
        void main(){
          float r = length(vP), a = atan(vP.y, vP.x);
          float rings = 1.0 - smoothstep(0.0, 1.2, abs(fract(r / 30.0) - 0.5) * 30.0);
          float spokes = 1.0 - smoothstep(0.0, 1.0, abs(fract(a / 6.2831853 * 48.0) - 0.5) * r * 6.2831853 / 48.0);
          float pulse = smoothstep(18.0, 0.0, abs(r - mod(uTime * 60.0, 900.0)));
          float fade = smoothstep(900.0, 120.0, r);
          float v = max(rings * 0.5, spokes * 0.25) * fade + pulse * 0.25 * fade;
          gl_FragColor = vec4(uColor * v * 1.6, v);
        }`,
    }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.6;
  root.add(ground);

  // The live band.
  const spectrum = createSpectrum();
  root.add(spectrum.group);
  let bandLabel = labelSprite(spectrum.label, { height: 6, color: '#8ef7e6', sub: 'live band · modeled signals', mono: true });
  bandLabel.position.set(0, 6, SIZE.depth / 2 + 14);
  root.add(bandLabel);

  // A curved wall of the real app behind the band.
  const wall = new THREE.Group();
  const order = ['multislice', 'stack3d', 'audio'];
  order.forEach((key, i) => {
    const shot = SHOTS[key];
    const w = key === 'stack3d' ? 150 : 104, h = w * shot.h / shot.w;
    const a = (i - 1) * 0.62;
    const panel = new THREE.Group();
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: shotTexture(key), toneMapped: false, transparent: true, opacity: 0.92 }));
    panel.add(face);
    const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w + 2, h + 2)), new THREE.LineBasicMaterial({ color: '#5de3ff', transparent: true, opacity: 0.6, toneMapped: false }));
    panel.add(edge);
    panel.position.set(Math.sin(a) * 210, 34 + h / 2, -Math.cos(a) * 210 + 30);
    panel.rotation.y = -a;
    wall.add(panel);
  });
  root.add(wall);

  // The wall steps back while a scenario's workbench is in front of it.
  let wallWant = 1, wallNow = 1;
  const wallMats = [];
  wall.traverse((n) => { if (n.material) { n.material.transparent = true; wallMats.push([n.material, n.material.opacity]); } });
  engine.onUpdate((t, dt) => {
    wallNow += (wallWant - wallNow) * (1 - Math.exp(-3 * dt));
    for (const [m, o] of wallMats) m.opacity = o * wallNow;
    spectrum.setPixelScale(engine.pxScale);
    spectrum.update(t, dt);
    ground.material.uniforms.uTime.value = t;
  });

  return {
    root, spectrum,
    setBand(profile) {
      if (!spectrum.setProfile(profile)) return;
      root.remove(bandLabel);
      bandLabel.material.map.dispose();
      bandLabel = labelSprite(spectrum.label, { height: 6, color: '#8ef7e6', sub: 'live band · modeled signals', mono: true });
      bandLabel.position.set(0, 6, SIZE.depth / 2 + 14);
      bandLabel.visible = wallWant === 1;
      root.add(bandLabel);
    },
    dimWall(on) { wallWant = on ? 0.12 : 1; bandLabel.visible = !on; },
    overview() { return { pos: new THREE.Vector3(0, 230, 560), tgt: new THREE.Vector3(0, 30, 0) }; },
    close() { return { pos: new THREE.Vector3(0, 70, 230), tgt: new THREE.Vector3(0, 20, -40) }; },
  };
}
