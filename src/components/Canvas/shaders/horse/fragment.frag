uniform float uProgress;

void main() {
  float fadeAlpha = uProgress < 5. * 0.125 + 0.05 ? 0.0 : 1.0;
  
  // Create mix color from current to blue based on uProgress
  vec3 currentColor = vec3(1.0, 0.30, 0.23) * 10.;
  vec3 targetColor = vec3(0.0, 0.3, 1.0)*12.; // Blue color
  
  // Remap uProgress from 0.78-1.0 range to 0.0-1.0 range
  float remappedProgress = (uProgress - 5. * 0.125) / (6. * 0.125 - 5. * 0.125);
  
  // Ensure it stays within 0-1 bounds
  remappedProgress = clamp(remappedProgress, 0.0, 6. * 0.125);
  
  // Use remapped progress for color mixing
  vec3 finalColor = mix(currentColor, targetColor, remappedProgress);
  
  gl_FragColor = vec4(finalColor , fadeAlpha);
}

