// The feature atlas: every AetherSDR component as a glowing node on an orbit,
// one orbit per category, around the AetherSDR mark floating over the hub.

import * as THREE from 'three';
import { labelSprite, glowTexture, LOGO } from './textures.js';

export const ATLAS_CENTER = new THREE.Vector3(0, 230, 0);

export function createAtlas(engine, features, categories, onSelect) {
  const root = new THREE.Group();
  root.position.copy(ATLAS_CENTER);
  engine.scene.add(root);

  const logoTex = new THREE.TextureLoader().load(LOGO);
  logoTex.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Sprite(new THREE.SpriteMaterial({ map: logoTex, transparent: true, depthWrite: false }));
  logo.scale.set(26, 26, 1);
  root.add(logo);
  const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: '#3aa7ff', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending }));
  core.scale.set(70, 70, 1);
  root.add(core);

  const rings = [];
  const nodes = [];
  categories.forEach((cat, k) => {
    const members = features.filter((f) => f.category === cat.id);
    if (!members.length) return;
    const r = 46 + k * 20;
    const ring = new THREE.Group();
    ring.rotation.x = (k % 2 ? 1 : -1) * (0.18 + k * 0.05);
    ring.rotation.z = (k % 3 - 1) * 0.12;
    root.add(ring);
    const orbit = new THREE.Mesh(new THREE.TorusGeometry(r, 0.18, 6, 160), new THREE.MeshBasicMaterial({ color: cat.color, transparent: true, opacity: 0.5, toneMapped: false }));
    orbit.rotation.x = Math.PI / 2;
    ring.add(orbit);
    const spin = new THREE.Group();
    ring.add(spin);
    members.forEach((f, i) => {
      const a = (i / members.length) * Math.PI * 2 + k * 0.6;
      const node = new THREE.Group();
      node.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      const color = new THREE.Color(cat.color);
      const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(f.aether ? 2.6 : 1.9, 1), new THREE.MeshBasicMaterial({ color: color.clone().multiplyScalar(0.5), toneMapped: false }));
      node.add(orb);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending }));
      halo.scale.set(9, 9, 1);
      node.add(halo);
      const label = labelSprite(f.name, { height: f.aether ? 4.2 : 3.2, color: f.aether ? '#eaf2fb' : '#c4d4e8', sub: f.status === 'roadmap' ? 'roadmap' : null, subColor: '#f0a35e', bg: 'rgba(6,11,19,0.6)', border: f.aether ? cat.color : 'rgba(120,190,230,0.25)' });
      label.position.y = f.aether ? 6.5 : 5.5;
      node.add(label);
      const hit = new THREE.Mesh(new THREE.SphereGeometry(6, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      node.add(hit);
      spin.add(node);
      const st = { feature: f, node, orb, halo, label, hover: false, active: false, dim: false };
      engine.addPickable(hit, { kind: 'feature', id: f.id, title: f.name, onClick: () => onSelect(f.id), onHover: (on) => { st.hover = on; } });
      nodes.push(st);
    });
    rings.push({ spin, speed: 0.025 + (k % 3) * 0.01, dir: k % 2 ? 1 : -1 });
  });

  let frozen = false, focusIds = null;
  engine.onUpdate((t, dt) => {
    // Labels are unreadable from the far overview: skip drawing them there.
    const near = engine.camera.position.distanceTo(ATLAS_CENTER) < 460;
    for (const n of nodes) n.label.visible = near;
    if (!frozen) rings.forEach((r) => { r.spin.rotation.y += r.speed * r.dir * dt; });
    core.material.opacity = 0.22 + 0.06 * Math.sin(t * 1.5);
    nodes.forEach((n) => {
      const lit = n.active ? 1.35 : n.hover ? 1.2 : 1;
      const want = (focusIds && !focusIds.has(n.feature.id) ? 0.35 : 1) * lit;
      const s = n.node.scale.x + (want - n.node.scale.x) * (1 - Math.exp(-6 * dt));
      n.node.scale.setScalar(s);
      n.label.material.opacity = focusIds && !focusIds.has(n.feature.id) ? 0.35 : 1;
      n.halo.material.opacity = (n.active ? 0.5 : n.hover ? 0.35 : 0.16) * (0.85 + 0.05 * Math.sin(t * 1.5 + n.node.position.x));
    });
  });

  const world = new THREE.Vector3();
  return {
    root, nodes,
    setActive(id) { nodes.forEach((n) => { n.active = n.feature.id === id; }); frozen = !!id; },
    // Dim everything except a set of feature ids (null = none dimmed).
    focus(ids) { focusIds = ids ? new Set(ids) : null; },
    overview() { return { pos: new THREE.Vector3(0, ATLAS_CENTER.y + 70, 300), tgt: ATLAS_CENTER.clone().add(new THREE.Vector3(0, -6, 0)) }; },
    view(id) {
      const n = nodes.find((x) => x.feature.id === id);
      if (!n) return this.overview();
      n.node.getWorldPosition(world);
      const out = world.clone().sub(ATLAS_CENTER).setY(0).normalize();
      if (!isFinite(out.x)) out.set(0, 0, 1);
      // Stand outside the node, a little above, and look slightly past it toward the core.
      return { pos: world.clone().addScaledVector(out, 125).add(new THREE.Vector3(0, 26, 0)), tgt: world.clone().addScaledVector(out, -20) };
    },
  };
}
