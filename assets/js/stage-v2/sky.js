// Camera-following sky: the site's navy gradient, a faint horizon glow, a
// sprinkle of stars, and streaks that stretch out while the camera travels
// between stations.

export function createSky(THREE) {
  const uniforms = {
    uTop: { value: new THREE.Color('#05090f') },
    uHorizon: { value: new THREE.Color('#0e1a2a') },
    uGlow: { value: new THREE.Color('#3aa7ff') },
    uWarp: { value: 0 },
    uTime: { value: 0 },
  };
  const mesh = new THREE.Mesh(
    new THREE.SphereGeometry(900, 48, 24),
    new THREE.ShaderMaterial({
      uniforms, side: THREE.BackSide, depthWrite: false, depthTest: false,
      vertexShader: /* glsl */`
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */`
        uniform vec3 uTop, uHorizon, uGlow; uniform float uWarp, uTime;
        varying vec3 vDir;
        float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        void main() {
          vec3 d = normalize(vDir);
          float h = d.y, az = atan(d.z, d.x);
          vec3 c = mix(uHorizon, uTop, smoothstep(-0.05, 0.6, h));
          c = mix(c, uTop * 0.7, smoothstep(0.0, -0.5, h));
          c += uGlow * exp(-abs(h + 0.02) * 16.0) * 0.10;

          // Stars: a soft dot in a sparse few cells, upper sky only.
          vec2 sp = vec2(az * 260.0, h * 260.0), cell = floor(sp);
          float star = step(0.994, hash(cell)) * smoothstep(0.02, 0.3, h)
                     * smoothstep(0.22, 0.0, length(fract(sp) - 0.5));
          c += vec3(0.75, 0.9, 1.0) * star * (0.35 + 0.35 * sin(uTime * 2.0 + hash(cell + 3.0) * 40.0));

          // Travel streaks: hairlines near the horizon, warp-scaled.
          float lx = az * 900.0, lane = floor(lx);
          float line = smoothstep(0.5, 0.15, abs(fract(lx) - 0.5));
          float streak = step(0.985, hash(vec2(lane, 2.0))) * line * smoothstep(0.35, 0.0, abs(h)) * (0.4 + 0.6 * hash(vec2(lane, 9.0)));
          c += uGlow * streak * uWarp * 0.8 + vec3(0.01, 0.03, 0.05) * uWarp;
          gl_FragColor = vec4(c, 1.0);
        }`,
    }),
  );
  mesh.renderOrder = -1;
  mesh.frustumCulled = false;
  return {
    mesh,
    update(t, dt, camPos, warp) {
      mesh.position.copy(camPos);
      uniforms.uTime.value = t;
      uniforms.uWarp.value += (warp - uniforms.uWarp.value) * (1 - Math.exp(-6 * dt));
    },
  };
}
