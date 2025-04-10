import { useGLTF, shaderMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { extend, useFrame } from "@react-three/fiber";

// Custom point material using shaders
const PointCloudMaterial = shaderMaterial(
  {
    time: 0,
    pointSize: 0.05,
    pointColor: new THREE.Color(0xffffff),
  },
  // Vertex Shader
  `
  uniform float time;
  uniform float pointSize;
  attribute vec3 color;
  varying vec3 vColor;
  
  void main() {
    vColor = color;
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    
    // Add subtle animation based on time
    modelPosition.y += sin(modelPosition.x * 10.0 + time * 2.0) * 0.02;
    
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectedPosition;
    gl_PointSize = pointSize * (300.0 / -viewPosition.z);
  }
  `,
  // Fragment Shader
  `
  varying vec3 vColor;
  
  void main() {
    // Create a circle point shape with smooth edges
    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
    float strength = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
    
    if (strength < 0.05) discard;
    
    gl_FragColor = vec4(vColor, strength);
  }
  `
);

// Extend so we can use it in JSX
extend({ PointCloudMaterial });

// Define the type for our material
type PointCloudMaterialImpl = {
  time: number;
  pointSize: number;
  pointColor: THREE.Color;
} & JSX.IntrinsicElements["shaderMaterial"];

// Add the types to @react-three/fiber
declare module "@react-three/fiber" {
  interface ThreeElements {
    pointCloudMaterial: Object3DNode<
      PointCloudMaterialImpl,
      typeof PointCloudMaterial
    >;
  }
}

const Totoro = () => {
  const { scene } = useGLTF("/models/totoro_1.glb");
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Extract geometry data from the model
  const { positions, colors } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    // Traverse the scene and extract geometry data
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geometry = mesh.geometry;
        const positionAttribute = geometry.attributes.position;

        // Get material color
        let color = new THREE.Color(0xffffff);
        if (mesh.material) {
          if ((mesh.material as THREE.MeshStandardMaterial).color) {
            color = (mesh.material as THREE.MeshStandardMaterial).color;
          }
        }

        // Process each vertex
        for (let i = 0; i < positionAttribute.count; i++) {
          // Get vertex position in world space
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positionAttribute, i);
          vertex.applyMatrix4(mesh.matrixWorld);

          // Add position to positions array
          positions.push(vertex.x, vertex.y, vertex.z);

          // Add color to colors array
          colors.push(color.r, color.g, color.b);
        }
      }
    });

    return { positions, colors };
  }, [scene]);

  // Animate the shader
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
    }
  });

  return (
    <group scale={[5, 5, 5]} position={[-20, 0, 10]}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(positions), 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[new Float32Array(colors), 3]}
          />
        </bufferGeometry>
        <pointCloudMaterial
          ref={materialRef}
          pointSize={0.05}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
};

export default Totoro;
