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
            // Keep particles alive during morphing, but fade them out in HORSE_RUN range
            life = uProgress >= 0.81 ? 0.0 : 1.0;
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
            
            if (uNormalizedProgress <= 0.33) {
                // First transition (Particles to Totoro)
                targetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Use normalized progress mapped to 0-1 for this transition
                float transitionProgress = uNormalizedProgress * 3.0; // Scale 0-0.33 to 0-1
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Smooth interpolation
                newPosition = mix(newPosition, targetPos, ease);

                // Add floating animation ONLY for Totoro after it's fully formed
                if (abs(uNormalizedProgress) >= 0.25) {
                    // Create gentle floating effect using sine waves with different frequencies
                    float floatAmount = 0.1;
                    
                    // Offset based on UV to create varied movement across the model
                    float uvOffset = vUv.x * 3.14159 + vUv.y * 2.71828;
                    
                    float speedVariation = 5.;
                    
                    // Each particle gets a slightly different amplitude
                    float amplitudeVariation = 2.0 + 0.4 * rand(vUv + vec2(0.2, 0.3)); // 0.8-1.2 range
                    
                    // Gentle vertical floating - main movement
                    newPosition.y += sin(uTime * 0.7 * speedVariation + uvOffset) * floatAmount * amplitudeVariation;
                    
                    // Subtle side-to-side motion
                    newPosition.x += cos(uTime * 0.4 * speedVariation + uvOffset * 1.3) * floatAmount * 0.4 * amplitudeVariation;
                    
                    // Subtle forward/backward motion
                    newPosition.z += sin(uTime * 0.3 * speedVariation + uvOffset * 1.7) * floatAmount * 0.3 * amplitudeVariation;
                }
            } 
            else if (uNormalizedProgress <= 0.66) {
                // Second transition (Totoro to Hat)
                vec3 prevTargetPos = texture2D(uPrevTargetPositions, vUv).xyz;
                vec3 currentTargetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Map 0.33-0.66 range to 0-1 for this transition
                float transitionProgress = (uNormalizedProgress - 0.33) * 3.0;
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Directly blend between the two target positions
                newPosition = mix(prevTargetPos, currentTargetPos, ease);
                
                // Add floating animation for Hat after it's formed
                if (transitionProgress >= 0.75) {
                    // Create a spinning/rotating float effect for the hat
                    float floatAmount = 0.15;
                    
                    // Offset based on UV to create varied movement across the model
                    float uvOffset = vUv.x * 2.71828 + vUv.y * 3.14159;
                    
                    float speedVariation = 3.5;
                    
                    // Each particle gets a slightly different amplitude
                    float amplitudeVariation = 1.5 + 0.5 * rand(vUv + vec2(0.4, 0.1)); 
                    
                    // Gentle bobbing up and down - magical hat effect
                    newPosition.y += sin(uTime * 0.6 * speedVariation + uvOffset) * floatAmount * amplitudeVariation;
                    
                    // Slight spiraling horizontal motion - like a witch's hat floating
                    newPosition.x += sin(uTime * 0.5 * speedVariation + uvOffset * 1.5) * floatAmount * 0.5 * amplitudeVariation;
                    newPosition.z += cos(uTime * 0.5 * speedVariation + uvOffset * 1.5) * floatAmount * 0.5 * amplitudeVariation;
                }
            }
            else {
                // Third transition (Hat to Horse)
                vec3 prevTargetPos = texture2D(uPrevTargetPositions, vUv).xyz;
                vec3 currentTargetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Map 0.66-1.0 range to 0-1 for this transition
                float transitionProgress = (uNormalizedProgress - 0.66) * (1.0/0.34);
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Directly blend between Hat and Horse
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