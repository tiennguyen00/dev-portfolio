#include <skinning_pars_vertex>

uniform float uTime;
varying vec3 vPosition;

void main() {
  #include <skinbase_vertex>
  #include <begin_vertex>
  #include <skinning_vertex>
  
  vec4 worldPosition = modelMatrix * vec4(transformed, 1.0);
  vPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}