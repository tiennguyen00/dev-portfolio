import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

interface HorseProps {
  scene: THREE.Scene;
  mixer: THREE.AnimationMixer;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

const Horse = ({ scene, mixer, position, rotation, scale }: HorseProps) => {
  const refPoints = useRef<THREE.Points>(null);
  console.log(scale, position, rotation);

  useEffect(() => {
    if (refPoints.current && scene.children.length > 0) {
      const childMesh = scene.children[0];
      if (childMesh.geometry && childMesh.geometry.attributes.position) {
        const newGeometry = new THREE.BufferGeometry();

        newGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(
            childMesh.geometry.attributes.position.array,
            3
          )
        );

        newGeometry.morphAttributes.position =
          childMesh.geometry.morphAttributes.position;
        newGeometry.morphTargetsRelative =
          childMesh.geometry.morphTargetsRelative;

        refPoints.current.geometry = newGeometry;

        // Set the morph target properties correctly
        refPoints.current.morphTargetInfluences =
          childMesh.morphTargetInfluences;
        refPoints.current.morphTargetDictionary =
          childMesh.morphTargetDictionary;
      }
    }
  }, []);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  });

  return (
    <>
      <points
        ref={refPoints}
        scale={scale}
        position={position}
        rotation={rotation}
      >
        <pointsMaterial
          size={0.1}
          color="#FFE6B1"
          morphTargets={true}
          transparent={true}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation={true}
        />
      </points>
    </>
  );
};

export default Horse;
