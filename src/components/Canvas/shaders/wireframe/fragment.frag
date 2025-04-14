uniform float uTime;
varying vec3 vPosition;
uniform float uProgress;

void main() {
  float progress = clamp(uProgress, 0.0, 1.0);
  vec3 baseColor = mix(vec3(0.0, 1.5, 1.8), vec3(0.33, 0.17, 0.62), progress);     
  vec3 secondColor = mix(vec3(0.0, 0.2, 0.8), vec3(0.34, 0.19, 0.63), progress); 
  
  // Create a traveling wave effect based on time
  float speed = 5.;
  float waveWidth = 15.0;
  float distanceFromCenter = length(vPosition.xz);
  
  // Create a moving gradient with repeating waves
  float travelingWave = mod(distanceFromCenter - uTime * speed, 20.0);
  float gradient = smoothstep(0.0, waveWidth, travelingWave) * (1.0 - smoothstep(waveWidth, waveWidth * 2.0, travelingWave));
  
  // Mix between the two colors based on the traveling gradient
  vec3 finalColor = mix(baseColor, secondColor, gradient);
  
  // Add brightness based on the wave position
  float brightness = 1.0 + gradient * 1.5;
  finalColor *= brightness;
  
  // Varying transparency based on gradient
  float alpha = 0.564;
  alpha *= mix(0.6, 1.0, gradient);
  
  gl_FragColor = vec4(finalColor, alpha);
}