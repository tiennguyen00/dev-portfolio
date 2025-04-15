uniform float uProgress;

void main() {
  float miletones = 5. * 0.125;
  float fadeAlpha = uProgress < miletones ? 0.0 : 1.0;
  
  // Create mix color from current to blue based on uProgress
  vec3 currentColor = vec3(1.0, 0.30, 0.23) * 10.;
  vec3 targetColor = vec3(0.0, 0.3, 1.0)* 8.; // Blue color
  
 float remappedProgress = clamp(
    (uProgress - miletones) / (6. * 0.125 - miletones),
    0.0,
    1.0
  );
  
  
  // Use remapped progress for color mixing
  vec3 finalColor = mix(currentColor, targetColor, remappedProgress);
  
  gl_FragColor = vec4(finalColor , fadeAlpha);
}

