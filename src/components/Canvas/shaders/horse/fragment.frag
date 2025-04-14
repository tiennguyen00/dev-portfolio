uniform float uProgress;

void main() {
  // Fade in based on uProgress
  float fadeAlpha = 1.0;
  if(uProgress >= 0.79 && uProgress <= 0.81) {
    // Linear fade from 0 to 1 as uProgress goes from 0.79 to 0.81
    fadeAlpha = (uProgress - 0.79);
  } else if(uProgress < 0.79) {
    fadeAlpha = 0.0;
  }
  
  gl_FragColor = vec4(vec3(1.0, 0.30, 0.23) * 10., fadeAlpha);
}

