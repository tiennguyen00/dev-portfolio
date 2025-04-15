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
            life = 1.;
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
                
                float transitionProgress = uNormalizedProgress * 3.0; // Scale 0-0.33 to 0-1
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Smooth interpolation
                newPosition = mix(newPosition, targetPos, ease);
            } 
            else if (uNormalizedProgress <= 2. * 0.33) {
                // Second transition (Totoro to Hat)
                vec3 prevTargetPos = texture2D(uPrevTargetPositions, vUv).xyz;
                vec3 currentTargetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Map 0.33-0.66 range to 0-1 for this transition
                float transitionProgress = (uNormalizedProgress - 0.33) * 3.0;
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Directly blend between the two target positions
                newPosition = mix(prevTargetPos, currentTargetPos, ease);
            }
            else {
                // Third transition (Hat to Horse)
                vec3 prevTargetPos = texture2D(uPrevTargetPositions, vUv).xyz;
                vec3 currentTargetPos = texture2D(uTargetPositions, vUv).xyz;
                
                // Map 0.66-1.0 range to 0-1 for this transition
                float transitionProgress = (uNormalizedProgress - 0.66) * 3.;
                float ease = smoothstep(0.0, 1.0, transitionProgress);
                
                // Directly blend between Hat and Horse
                newPosition = mix(prevTargetPos, currentTargetPos, ease);
            }
            
            // Always apply floating animation for all models
            float floatAmount = 0.12;
            float uvOffset = vUv.x * 3.14159 + vUv.y * 2.71828;
            float speedVariation = 4.0;
            float amplitudeVariation = 1.8 + 0.5 * rand(vUv + vec2(0.3, 0.2));
            
            // Vertical floating
            newPosition.y += sin(uTime * 0.65 * speedVariation + uvOffset) * floatAmount * amplitudeVariation;
            
            // Horizontal motion
            newPosition.x += cos(uTime * 0.45 * speedVariation + uvOffset * 1.4) * floatAmount * 0.45 * amplitudeVariation;
            
            // Forward/backward motion
            newPosition.z += sin(uTime * 0.35 * speedVariation + uvOffset * 1.6) * floatAmount * 0.35 * amplitudeVariation;
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