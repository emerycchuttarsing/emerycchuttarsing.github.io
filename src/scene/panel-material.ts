import * as THREE from 'three';

// Soft-focus only the image surface: frames, landscape and HTML stay crisp.
// Mipmap footprints follow screen derivatives; both posters and videos retain
// their full-resolution level for focus, without repeated ghosted line samples.
export function createPanelMaterial() {
  const blur = { value: 0 };
  const pixelRatio = { value: 1 };
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(1.65, 1.65, 1.65),
    transparent: true,
    toneMapped: false,
  });
  material.onBeforeCompile = (shader) => {
    shader.uniforms['panelBlur'] = blur;
    shader.uniforms['panelPixelRatio'] = pixelRatio;
    shader.fragmentShader =
      'uniform float panelBlur; uniform float panelPixelRatio;\n' +
      shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      THREE.ShaderChunk.map_fragment.replace(
        'vec4 sampledDiffuseColor = texture2D( map, vMapUv );',
        `float radius = panelBlur * panelPixelRatio;
         vec2 gx = dFdx(vMapUv) * (1.0 + radius * .8);
         vec2 gy = dFdy(vMapUv) * (1.0 + radius * .8);
         vec2 dx = dFdx(vMapUv) * radius * .75;
         vec2 dy = dFdy(vMapUv) * radius * .75;
         vec4 sampledDiffuseColor = textureGrad(map, vMapUv, gx, gy);
         if (panelBlur > .01) {
           sampledDiffuseColor = sampledDiffuseColor * .25
             + (textureGrad(map, vMapUv + dx, gx, gy) + textureGrad(map, vMapUv - dx, gx, gy)
              + textureGrad(map, vMapUv + dy, gx, gy) + textureGrad(map, vMapUv - dy, gx, gy)) * .125
             + (textureGrad(map, vMapUv + dx + dy, gx, gy) + textureGrad(map, vMapUv + dx - dy, gx, gy)
              + textureGrad(map, vMapUv - dx + dy, gx, gy) + textureGrad(map, vMapUv - dx - dy, gx, gy)) * .0625;
         }`,
      ),
    );
  };
  material.customProgramCacheKey = () => 'portfolio-panel-soft-focus-v3';
  return { material, blur, pixelRatio };
}
