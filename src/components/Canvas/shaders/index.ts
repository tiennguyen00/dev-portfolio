export const simVertex = `
varying vec2 vUv;
uniform float time;
void main() {
    vUv = uv;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = 1.;
    gl_Position = projectionMatrix * mvPosition;
}

`;

export const simFragment = `
varying vec2 vUv;
uniform float uProgress;
uniform int uRenderMode;
uniform vec3 uSource;
uniform sampler2D uCurrentPosition;
uniform sampler2D uDirections;
uniform sampler2D uTargetPositions;
uniform sampler2D uPrevTargetPositions;
uniform float uMorphProgress;
uniform float uNormalizedProgress;
uniform vec3 uMouse;
uniform float uTime;
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
    float offset = rand(vUv);
    vec3 position = texture2D( uCurrentPosition, vUv ).xyz;
    vec4 direction = texture2D( uDirections, vUv );

    if(uRenderMode==0){
        float life;
        if (uMorphProgress > 0.0) {
            // Keep particles alive during morphing
            life = 1.0;
        } else {
            // Normal life calculation when not morphing
            life = 1. - clamp( (uTime - direction.a)/15., 0.,1.);
        }
        
        float speedlife = clamp(life,0.1,0.65);
        
        // Base particle movement
        vec3 newPosition = position.xyz + speedlife*direction.xyz * 0.01 + vec3(0.,-1,0.)*0.15 + vec3(0.,0.,-1.)*0.01;
        
        // If morphing is in progress
        if (uNormalizedProgress > 0.0) {
            vec3 targetPos;
            
            if (uNormalizedProgress <= 0.5) {
                // First transition (Particles to Totoro)
                targetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Use normalized progress mapped to 0-1 for this transition
                float transitionProgress = uNormalizedProgress * 2.0; // Scale 0-0.5 to 0-1
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Smooth interpolation
                newPosition = mix(newPosition, targetPos, ease);
            } 
            else {
                // Second transition (Totoro to Horse)
                vec3 prevTargetPos = texture2D(uPrevTargetPositions, vUv).xyz;
                vec3 currentTargetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Map 0.5-1.0 range to 0-1 for this transition
                float transitionProgress = (uNormalizedProgress - 0.5) * 2.0;
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Directly blend between the two target positions
                // This prevents scattering effect during reverse transitions
                newPosition = mix(prevTargetPos, currentTargetPos, ease);
            }
        }

        gl_FragColor = vec4(newPosition, life);
    }

    // DIRECTIONS
    if(uRenderMode==1){
        float rnd1 = rand(vUv) - 0.5;
        float rnd2 = rand(vUv + vec2(0.1,0.1)) - 0.5;
        float rnd3 = rand(vUv + vec2(0.3,0.3)) - 0.5;
        gl_FragColor = vec4( uSource + vec3(rnd1,rnd2,rnd3)*0., uTime);
    }

    // POSITIONS
    if(uRenderMode==2){
        float rnd1 = rand(vUv) - 0.5;
        float rnd2 = rand(vUv + vec2(0.1,0.1)) - 0.5;
        float rnd3 = rand(vUv + vec2(0.3,0.3)) - 0.5;
        gl_FragColor = vec4( uSource + vec3(rnd1,rnd2,rnd3)*0.854, 1.);
    }
}
`;

export const vertexShader = `
varying vec2 vUv;
varying float vLife;
uniform float time;

uniform sampler2D uTexture;
float rand(vec2 co){
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {

    vUv = uv;
    vec3 newpos = position;
    vec4 simPosition = texture2D( uTexture, vUv );
    newpos.xyz = simPosition.xyz;
    vLife = simPosition.w;
    // newpos.x += 1.;
    // newpos.z += sin( time + position.x*10. ) * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );

    gl_PointSize = mix(20.0, 40.0, rand(vUv)) * (2.0 / -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;

}

`;
export const fragmentShader = `
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
    
    vec4 color = texture2D( uTexture, vUv );
    
    // Base glow color (blue/purple)
    vec3 baseGlowColor = mix(vec3(0.08, 0.53, 0.96), vec3(0.6, 0.4, 1.3), uProgress) * 4.5;
    
    // Totoro color (gray with hint of green)
    vec3 totoroColor = vec3(0.54, 0.60, 0.36) * 2.5;
    
    // Horse color (golden/amber)
    vec3 horseColor = vec3(1.0, 0.30, 0.23) * 3.;
    
    vec3 finalColor;
    
    if (uModelIndex == -1) {
        // Base particles
        finalColor = baseGlowColor;
    } else if (uModelIndex == 0) {
        // Totoro
        finalColor = mix(baseGlowColor, totoroColor, smoothstep(0.0, 1.0, uMorphProgress));
    } else {
        // Horse - with smooth transition from Totoro
        finalColor = mix(totoroColor, horseColor, smoothstep(0.0, 1.0, uMorphProgress));
    }
    
    // Adjust alpha based on morphing state
    float alpha = uMorphProgress > 0.0 ? 0.8 : (0.64 * vLife);
    
    gl_FragColor = vec4(finalColor, alpha);
}
`;

const wireframeVertexShader = `
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
`;

const wireframeFragmentShader = `
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
`;

export { wireframeVertexShader, wireframeFragmentShader };
