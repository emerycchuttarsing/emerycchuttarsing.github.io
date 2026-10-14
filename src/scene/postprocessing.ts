import * as THREE from 'three';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { LuminosityHighPassShader } from 'three/addons/shaders/LuminosityHighPassShader.js';

export function createPostprocessing(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
) {
  const gl = renderer.getContext();
  const supported =
    gl instanceof WebGL2RenderingContext
      ? (gl.getInternalformatParameter(
          gl.RENDERBUFFER,
          gl.RGBA16F,
          gl.SAMPLES,
        ) as Int32Array)
      : new Int32Array();
  // Resolve the full-resolution scene once. Only geometry needs MSAA; the
  // soft lighting buffers never need multisampling, depth or Retina detail.
  const sceneTarget = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    samples: Math.max(0, ...Array.from(supported).filter((n) => n <= 4)),
    resolveDepthBuffer: false,
    storeMultisampledColorBuffer: false,
  });
  const glow = [0, 1].map(
    () =>
      new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
        depthBuffer: false,
      }),
  );
  const bright = new THREE.ShaderMaterial({
    ...LuminosityHighPassShader,
    uniforms: THREE.UniformsUtils.clone(LuminosityHighPassShader.uniforms),
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });
  bright.uniforms['tDiffuse']!.value = sceneTarget.texture;
  bright.uniforms['luminosityThreshold']!.value = 0.62;
  bright.uniforms['smoothWidth']!.value = 0.01;
  // Pair adjacent Gaussian taps using linear texture filtering. Keep a full
  // kernel instead of widely spaced taps, which would duplicate bright lines.
  const weights = Array.from({ length: 13 }, (_, i) =>
    Math.exp(-0.5 * (i / 4) ** 2),
  );
  const total =
    weights[0]! + 2 * weights.slice(1).reduce((sum, weight) => sum + weight, 0);
  const pairedWeights: number[] = [],
    offsets: number[] = [];
  for (let i = 1; i < weights.length; i += 2) {
    const pair = weights[i]! + weights[i + 1]!;
    pairedWeights.push(pair / total);
    offsets.push((i * weights[i]! + (i + 1) * weights[i + 1]!) / pair);
  }
  const blur = new THREE.ShaderMaterial({
    uniforms: {
      source: { value: glow[0]!.texture },
      step: { value: new THREE.Vector2() },
      centerWeight: { value: weights[0]! / total },
      weights: { value: pairedWeights },
      offsets: { value: offsets },
    },
    vertexShader: LuminosityHighPassShader.vertexShader,
    fragmentShader: `
      uniform sampler2D source;
      uniform vec2 step;
      uniform float centerWeight;
      uniform float weights[6];
      uniform float offsets[6];
      varying vec2 vUv;
      void main() {
        vec3 light = texture2D(source, vUv).rgb * centerWeight;
        for (int i = 0; i < 6; i++) {
          vec2 offset = step * offsets[i];
          light += (texture2D(source, vUv + offset).rgb
                  + texture2D(source, vUv - offset).rgb) * weights[i];
        }
        gl_FragColor = vec4(light, 1.);
      }`,
    depthTest: false,
    depthWrite: false,
    blending: THREE.NoBlending,
  });
  const quad = new FullScreenQuad(bright);
  const output = new OutputPass();
  output.renderToScreen = true;
  output.material.depthTest = false;
  output.material.depthWrite = false;
  output.uniforms['glow'] = { value: glow[0]!.texture };
  output.uniforms['glowStrength'] = { value: 0 };
  // Composite light, vignette, tone mapping and output conversion in one pass.
  output.material.fragmentShader =
    'precision highp float; uniform sampler2D glow; uniform float glowStrength;\n' +
    output.material.fragmentShader.replace(
      'gl_FragColor = texture2D( tDiffuse, vUv );',
      `gl_FragColor = texture2D(tDiffuse, vUv);
       gl_FragColor.rgb += texture2D(glow, vUv).rgb * glowStrength;
       float vignette = 1. - .3 * smoothstep(.25, .7, length((vUv - .5) * vec2(.9, 1.)));
       gl_FragColor.rgb *= vignette;`,
    );
  let bloomEnabled = false;
  let glowWidth = 1,
    glowHeight = 1;
  return {
    render() {
      renderer.setRenderTarget(sceneTarget);
      renderer.render(scene, camera);
      if (bloomEnabled) {
        quad.material = bright;
        renderer.setRenderTarget(glow[0]!);
        quad.render(renderer);
        quad.material = blur;
        blur.uniforms['source']!.value = glow[0]!.texture;
        blur.uniforms['step']!.value.set(1 / glowWidth, 0);
        renderer.setRenderTarget(glow[1]!);
        quad.render(renderer);
        blur.uniforms['source']!.value = glow[1]!.texture;
        blur.uniforms['step']!.value.set(0, 1 / glowHeight);
        renderer.setRenderTarget(glow[0]!);
        quad.render(renderer);
      }
      output.render(renderer, sceneTarget, sceneTarget, 0, false);
    },
    resize(w: number, h: number, dpr: number) {
      sceneTarget.setSize(Math.floor(w * dpr), Math.floor(h * dpr));
      glowWidth = Math.max(1, Math.round((w * dpr) / 4));
      glowHeight = Math.max(1, Math.round((h * dpr) / 4));
      glow.forEach((target) => target.setSize(glowWidth, glowHeight));
      bloomEnabled = w >= 640;
      output.uniforms['glowStrength']!.value = bloomEnabled ? 0.7 : 0;
    },
    dispose() {
      sceneTarget.dispose();
      glow.forEach((target) => target.dispose());
      bright.dispose();
      blur.dispose();
      quad.dispose();
      output.dispose();
    },
  };
}
