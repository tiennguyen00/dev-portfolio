void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  if (dist > 0.5) {
    discard;
  }
  
  float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
  vec3 color = vec3(1.0);
  
  gl_FragColor = vec4(vec3(1.0, 0.30, 0.23) * 3., 1.0) ;
}

