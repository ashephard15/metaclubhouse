import * as THREE from 'three';

/**
 * Shows an equirectangular panorama in a way that stays steady in VR while the player moves:
 *  - Sky: a large sphere that always follows the player's head, so walls and horizon never warp.
 *  - Floor: the painted floor is projected (as seen from the arrival point) onto a fixed disc on the
 *    real ground, so objects stand on it and it doesn't slide under them. The disc fades out at its
 *    edge into the sky sphere.
 * Directions are looked up per pixel in the shader, so there is no texture seam.
 */
const vert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;
const frag = /* glsl */ `
  uniform sampler2D map;
  uniform vec3 eye;
  uniform float yaw;
  uniform vec2 centre;
  uniform float fadeStart;
  uniform float fadeEnd;
  varying vec3 vWorld;
  const float PI = 3.141592653589793;
  void main() {
    vec3 d = normalize(vWorld - eye);
    float u = atan(d.x, -d.z) / (2.0 * PI) + 0.5 - yaw;
    float v = 0.5 + asin(clamp(d.y, -1.0, 1.0)) / PI;
    vec4 c = texture2D(map, vec2(fract(u), v));
    float r = distance(vWorld.xz, centre);
    float a = fadeEnd > 0.0 ? 1.0 - smoothstep(fadeStart, fadeEnd, r) : 1.0;
    gl_FragColor = vec4(c.rgb, a);
    #include <colorspace_fragment>
  }
`;

export class PanoramaBackdrop {
  group = new THREE.Group();
  private sky: THREE.Mesh;
  private floor: THREE.Mesh;
  private skyMat: THREE.ShaderMaterial;
  private floorMat: THREE.ShaderMaterial;

  constructor(private eyeHeight: number, private origin: THREE.Vector3) {
    const uniforms = () => ({
      map: { value: null as THREE.Texture | null },
      eye: { value: new THREE.Vector3() },
      yaw: { value: 0 },
      centre: { value: new THREE.Vector2(origin.x, origin.z) },
      fadeStart: { value: 0 },
      fadeEnd: { value: 0 },
    });
    this.skyMat = new THREE.ShaderMaterial({ uniforms: uniforms(), vertexShader: vert, fragmentShader: frag, side: THREE.BackSide, depthWrite: false });
    this.floorMat = new THREE.ShaderMaterial({ uniforms: uniforms(), vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false });
    this.floorMat.uniforms.fadeStart.value = 2.2;
    this.floorMat.uniforms.fadeEnd.value = 4.2;
    this.floorMat.uniforms.eye.value.set(origin.x, eyeHeight, origin.z);

    this.sky = new THREE.Mesh(new THREE.SphereGeometry(80, 48, 24), this.skyMat);
    this.sky.renderOrder = -2;
    this.sky.frustumCulled = false;
    this.floor = new THREE.Mesh(new THREE.CircleGeometry(9, 96), this.floorMat);
    this.floor.rotation.x = -Math.PI / 2;
    this.floor.position.set(origin.x, 0.002, origin.z);
    this.floor.renderOrder = -1;
    this.group.add(this.sky, this.floor);
    this.group.visible = false;
  }

  show(tex: THREE.Texture, yawDeg: number) {
    tex.minFilter = THREE.LinearFilter; // no mipmaps: avoids a seam line where the image wraps
    tex.generateMipmaps = false;
    for (const m of [this.skyMat, this.floorMat]) {
      m.uniforms.map.value = tex;
      m.uniforms.yaw.value = yawDeg / 360;
    }
    this.group.visible = true;
  }

  hide() { this.group.visible = false; }

  /** Call every frame with the viewer's head position. */
  update(head: THREE.Vector3) {
    this.sky.position.copy(head);
    this.skyMat.uniforms.eye.value.copy(head);
  }
}
