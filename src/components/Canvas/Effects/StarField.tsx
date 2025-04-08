import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const StarField = ({ count = 500 }) => {
  const mesh = useRef<THREE.InstancedMesh>(null);

  const dummy = new THREE.Object3D();
  const positions = useMemo(() => {
    const positions = [];
    const scales = [];

    // Create random stars in a sphere
    for (let i = 0; i < count; i++) {
      const position = new THREE.Vector3();
      const radius = 20 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      position.x = radius * Math.sin(phi) * Math.cos(theta);
      position.y = radius * Math.sin(phi) * Math.sin(theta);
      position.z = radius * Math.cos(phi);

      positions.push([position.x, position.y, position.z]);

      const scale = 0.1 + Math.random() * 0.5;
      scales.push(scale);
    }

    return { positions, scales };
  }, [count]);

  // Set up the instanced mesh
  useEffect(() => {
    if (!mesh.current) return;

    positions.positions.forEach((position, i) => {
      dummy.position.set(position[0], position[1], position[2]);
      dummy.scale.set(
        positions.scales[i],
        positions.scales[i],
        positions.scales[i]
      );
      dummy.updateMatrix();
      mesh.current?.setMatrixAt(i, dummy.matrix);
    });

    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
    }
  }, [positions]);

  // Animate stars
  useFrame(({ clock }) => {
    if (!mesh.current) return;

    const time = clock.getElapsedTime();

    // Slowly rotate the entire star field
    mesh.current.rotation.y = time * 0.05;

    // Animate a few random stars each frame for twinkling effect
    for (let i = 0; i < 50; i++) {
      const idx = Math.floor(Math.random() * count);
      const scale = positions.scales[idx] * (0.8 + 0.4 * Math.sin(time + idx));

      dummy.position.set(
        positions.positions[idx][0],
        positions.positions[idx][1],
        positions.positions[idx][2]
      );
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(idx, dummy.matrix);
    }

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial
          emissive="#ffffff"
          emissiveIntensity={2}
          toneMapped={false}
          roughness={0.2}
          metalness={0.8}
        />
      </instancedMesh>
    </>
  );
};

export default StarField;
