import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";

const Horse = () => {
  const refPoints = useRef<THREE.Points>(null);
  const { scene: scene1, animations } = useGLTF("/models/horses.glb");
  const { actions, clips, mixer } = useAnimations(animations, scene1);

  useEffect(() => {
    if (refPoints.current && scene1.children.length > 0) {
      const childMesh = scene1.children[0];
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
        console.log("refPoints", refPoints.current);
      }
    }

    // Start the animation
    if (clips.length > 0) {
      mixer.clipAction(clips[0]).play();
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
        scale={[0.1, 0.1, 0.1]}
        position={[0, -10.5, 2.3]}
        rotation-y={Math.PI / 2}
      >
        <pointsMaterial
          size={0.25}
          color="#D18B47"
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
