import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export function createPostprocessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  const composer = new EffectComposer(renderer);
  const render = new RenderPass(scene, camera);
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.22, 0.6, 0.62);
  const vignette = new ShaderPass({
    uniforms: { tDiffuse: { value: null } },
    vertexShader:
      'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:
      'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){vec4 c=texture2D(tDiffuse,vUv);float v=1.-.3*smoothstep(.25,.7,length((vUv-.5)*vec2(.9,1.)));gl_FragColor=vec4(c.rgb*v,c.a);}',
  });
  const output = new OutputPass();
  composer.addPass(render);
  composer.addPass(bloom);
  composer.addPass(vignette);
  composer.addPass(output);
  return {
    render() {
      composer.render();
    },
    resize(w: number, h: number, dpr: number) {
      composer.setPixelRatio(dpr);
      composer.setSize(w, h);
      bloom.enabled = w >= 640;
    },
    dispose() {
      composer.dispose();
      render.dispose();
      bloom.dispose();
      vignette.dispose();
      output.dispose();
    },
  };
}
