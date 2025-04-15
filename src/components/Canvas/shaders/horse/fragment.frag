uniform float uProgress;

void main() {
  float fadeAlpha = uProgress < 0.78 ? 0.0 : 1.0;
  
  // Use a single consistent multiplier for all points
  float multiplier = 4.0;
  
  // Create mix color from current to blue based on uProgress
  vec3 currentColor = vec3(1.0, 0.30, 0.23) * 10.;
  vec3 targetColor = vec3(0.0, 0.3, 1.0)*15.; // Blue color
  
  // Remap uProgress from 0.78-1.0 range to 0.0-1.0 range
  float remappedProgress = (uProgress - 0.78) / (0.9 - 0.78);
  
  // Ensure it stays within 0-1 bounds
  remappedProgress = clamp(remappedProgress, 0.0, 0.9);
  
  // Use remapped progress for color mixing
  vec3 finalColor = mix(currentColor, targetColor, remappedProgress);
  
  gl_FragColor = vec4(finalColor , fadeAlpha);
}

