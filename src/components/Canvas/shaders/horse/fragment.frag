uniform float uProgress;

void main() {
  float fadeAlpha = 1.;
  if(uProgress < 0.78) {
    fadeAlpha = 0.0;
  }
  
  gl_FragColor = vec4(vec3(1.0, 0.30, 0.23) * 3., fadeAlpha);
}

