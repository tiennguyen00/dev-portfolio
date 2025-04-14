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