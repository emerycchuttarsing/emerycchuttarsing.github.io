import * as THREE from 'three';
import { groundHeight } from './height';

export function createGround(count: number) {
  const geometry = new THREE.PlaneGeometry(44, 36, 220, 180);
  geometry.rotateX(-Math.PI / 2);
  const vertices = geometry.getAttribute('position');
  for (let i = 0; i < vertices.count; i++)
    vertices.setY(i, groundHeight(vertices.getX(i), vertices.getZ(i)));
  geometry.computeVertexNormals();
  const uniforms = {
    opacity: { value: 0 },
    lights: { value: Array.from({ length: count }, () => new THREE.Vector3()) },
    colors: { value: Array.from({ length: count }, () => new THREE.Color()) },
    strengths: { value: Array.from({ length: count }, () => 1) },
  };
  const material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms,
    vertexShader: `
      varying vec3 world; varying vec3 surfaceNormal;
      void main(){
        world=(modelMatrix*vec4(position,1.)).xyz;
        surfaceNormal=normalize(mat3(modelMatrix)*normal);
        gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);
      }`,
    fragmentShader: `
      uniform float opacity;
      uniform vec3 lights[${count}]; uniform vec3 colors[${count}]; uniform float strengths[${count}];
      varying vec3 world; varying vec3 surfaceNormal;
      float noise(vec2 v) { return fract(sin(dot(v,vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec3 n=normalize(surfaceNormal);
        vec3 shade=vec3(.014,.016,.016) * (.7 + .3*n.y);
        for(int i=0;i<${count};i++){
          vec3 direction=lights[i]-world;
          float distanceXZ=length(direction.xz);
          float spread=exp(-distanceXZ*.28)/(1.+distanceXZ*distanceXZ*.04);
          float diffuse=.25+.75*max(0.,dot(n,normalize(direction)));
          shade+=colors[i]*spread*diffuse*strengths[i]*1.1;
        }
        float ripple=.96+.04*sin(world.z*47.+sin(world.x*.42)*5.+sin(world.z*1.3)*2.);
        float grain=.84+.16*noise(world.xz*380.);
        float edge=1.-smoothstep(9.,21.,length(world.xz*vec2(1.,.85)));
        shade*=ripple*grain;
        gl_FragColor=vec4(shade,opacity*edge);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = -1;
  return {
    mesh,
    uniforms,
    dispose() {
      geometry.dispose();
      material.dispose();
    },
  };
}
