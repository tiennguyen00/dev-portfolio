varying vec2 vUv;
uniform sampler2D uTexture;
varying float vLife;
uniform float uProgress;
uniform float uMorphProgress;
uniform float uNormalizedProgress;
uniform int uModelIndex;

void main() {
    // Only discard particles with low life when NOT morphing
    if(vLife < 0.88 && uMorphProgress <= 0.0) discard;
    
   if(uProgress > 5. * 0.125 + 0.05) {
        discard;
    }
    
    vec4 color = texture2D( uTexture, vUv );
    
    // Remap uProgress to 0-1 range
    // when uProgress = 0 => return 0
    // when uProgress = 2 * 0.125 => return 1
    float remapUProgress = clamp(uProgress / (2.0 * 0.125), 0.0, 1.0);
    
    // Base glow color (blue/purple)
    vec3 baseGlowColor = mix(vec3(0.08, 0.53, 0.96), vec3(0.6, 0.4, 1.3), remapUProgress) * 4.5;
    
    // Totoro color (gray with hint of green)
    vec3 totoroColor = vec3(0.54, 0.60, 0.36) * 2.5;
    
    // Hat color (deep purple)
    vec3 hatColor = vec3(0.35, 0.16, 0.45) * 6.2;
    
    // Horse color (golden/amber)
    vec3 horseColor = vec3(1.0, 0.30, 0.23) * 4.;
    
    vec3 finalColor;
    
    if (uModelIndex == -1) {
        // Base particles
        finalColor = baseGlowColor;
    } else if (uModelIndex == 0) {
        // Totoro
        finalColor = mix(baseGlowColor, totoroColor, smoothstep(0.0, 1.0, uMorphProgress));
    } else if (uModelIndex == 1) {
        // Hat - with smooth transition from Totoro
        finalColor = mix(totoroColor, hatColor, smoothstep(0.0, 1.0, uMorphProgress));
    } else {
        // Horse - with smooth transition from Hat
        finalColor = mix(hatColor, horseColor, smoothstep(0.0, 1.0, uMorphProgress));
    }
    
    // Adjust alpha based on morphing state and our progress-based fade
    float finalAlpha = uMorphProgress > 0.0 ? 0.8 : (0.64 * vLife);
    
    gl_FragColor = vec4(finalColor, finalAlpha);
}