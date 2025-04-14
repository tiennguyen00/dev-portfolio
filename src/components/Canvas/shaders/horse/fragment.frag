uniform float uProgress;

void main() {
  float fadeAlpha = uProgress < 0.78 ? 0.0 : 1.0;
  
  // Use y-axis only for creating vertical lines of bright points
  float yGrid = fract(gl_FragCoord.y / 64.0) * 64.0;
  
  // Check only y position for the special points
  float multiplier = (yGrid > 62.0) ? 80.0 : 4.0;
  
  gl_FragColor = vec4(vec3(1.0, 0.30, 0.23) * multiplier, fadeAlpha);
}

