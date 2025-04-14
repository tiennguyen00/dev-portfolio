attribute vec3 aE2Geometry;
uniform float uSize;
uniform float uTime;
uniform float uPixelRatio;
varying vec3 vPos;
varying vec2 vUv;
uniform float uRange;
uniform float uTotalModels;

uniform float size;
uniform float scale;
uniform float uScroll;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_POINTS_UV

varying vec2 vUv;
uniform mat3 uvTransform;

#endif

void main() {

  #ifdef USE_POINTS_UV

  vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

  #endif

  #include <color_vertex>
  #include <morphcolor_vertex>
  #include <begin_vertex>
  #include <morphtarget_vertex>
  #include <project_vertex>

  #ifdef USE_SIZEATTENUATION

  bool isPerspective = isPerspectiveMatrix( projectionMatrix );

  if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

  #endif

  vec4 prevTargetPos = projectionMatrix * modelViewMatrix * vec4( aE2Geometry, 1.0 );
  vec4 transformedPos = projectionMatrix * modelViewMatrix  * vec4( transformed.xyz * 0.1, 1.0 );;

  gl_PointSize = 0. * (2.0 / -mvPosition.z);
  // gl_Position = transformedPos;
  gl_Position = mix(transformedPos, prevTargetPos, uTime);

  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>
  #include <worldpos_vertex>
  #include <fog_vertex>

  vPos = mvPosition.xyz;
  //vPos = transformed;
}
