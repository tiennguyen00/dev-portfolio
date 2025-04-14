/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import "./shaders/HorseMaterial";

interface HorseProps {
  pointHorseAnimRef: React.RefObject<THREE.Points>;
  scene: THREE.Scene;
  horseAction?: THREE.AnimationAction | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  scrollRef?: React.RefObject<number>;
  horseRunStart?: number;
  horseMixer?: THREE.AnimationMixer;
  horseClips?: THREE.AnimationClip[];
}

const Horse = ({
  pointHorseAnimRef,
  scene,
  position,
  rotation,
  scale,
  horseMixer,
  horseClips,
}: HorseProps) => {
  const positionArray = useMemo(() => {
    if (scene.children.length > 0) {
      const sourceMesh = scene.children[0];
      const originalArray = sourceMesh.geometry.attributes.position.array;
      const arrayCopy = new Float32Array(originalArray.length);
      arrayCopy.set(originalArray);
      return arrayCopy;
    }
    return null;
  }, [scene]);

  useEffect(() => {
    const setupHorseAnimation = () => {
      const sourceMesh = scene.children[0];
      const newGeometry = new THREE.BufferGeometry();

      newGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positionArray, 3)
      );

      if (
        sourceMesh.geometry.morphAttributes &&
        sourceMesh.geometry.morphAttributes.position
      ) {
        // Copy morph attributes directly
        newGeometry.morphAttributes.position =
          sourceMesh.geometry.morphAttributes.position;

        if (sourceMesh.geometry.morphTargetsRelative) {
          newGeometry.morphTargetsRelative = true;
        }
      }

      pointHorseAnimRef.current.geometry = newGeometry;

      const numMorphTargets =
        sourceMesh.geometry.morphAttributes?.position?.length || 0;
      pointHorseAnimRef.current.morphTargetInfluences = new Array(
        numMorphTargets
      ).fill(0);

      if (sourceMesh.morphTargetDictionary) {
        pointHorseAnimRef.current.morphTargetDictionary = {
          ...sourceMesh.morphTargetDictionary,
        };
      }
    };

    setupHorseAnimation();
  }, [positionArray, pointHorseAnimRef]);

  useFrame((_state, delta) => {
    if (horseMixer) {
      horseMixer.update(delta);
    }

    // Copy morph target influences from the source mesh to our points
    if (pointHorseAnimRef.current && scene.children.length > 0) {
      const sourceMesh = scene.children[0];

      if (
        sourceMesh.morphTargetInfluences &&
        pointHorseAnimRef.current.morphTargetInfluences
      ) {
        for (let i = 0; i < sourceMesh.morphTargetInfluences.length; i++) {
          if (i < pointHorseAnimRef.current.morphTargetInfluences.length) {
            pointHorseAnimRef.current.morphTargetInfluences[i] =
              sourceMesh.morphTargetInfluences[i];
          }
        }
      }
    }
  });

  useEffect(() => {
    if (horseMixer && horseClips) {
      const sourceMesh = scene.children[0];
      if (sourceMesh && sourceMesh.isObject3D) {
        const action = horseMixer.clipAction(horseClips[0], sourceMesh);
        action.reset();
        action.play();
      }
    }
  }, [horseMixer, horseClips, scene]);

  return (
    <>
      <points
        ref={pointHorseAnimRef}
        rotation={rotation}
        scale={scale}
        position={position}
        rotation={rotation}
      >
        <horseMaterial transparent depthWrite={false} />
      </points>
    </>
  );
};

export default Horse;
