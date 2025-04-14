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
  totoroScene?: any;
}

const Horse = ({
  pointHorseAnimRef,
  scene,
  position,
  rotation,
  scale,
  horseMixer,
  horseClips,
  totoroScene,
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

    const eslapTime = _state.clock.elapsedTime;

    // Copy morph target influences from the source mesh to our points
    if (pointHorseAnimRef.current && scene.children.length > 0) {
      pointHorseAnimRef.current.material.uniforms.uTime.value = Math.abs(
        Math.sin(eslapTime * 0.5)
      );
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

  useEffect(() => {
    if (!totoroScene) return;
    totoroScene.scale.set(40, 40, 40);
    totoroScene.rotation.y = -Math.PI / 4;
    totoroScene.position.y += 5;

    // Update world matrix to include transformations
    totoroScene.updateMatrixWorld(true);

    const aE2Geometry = new Float32Array(
      pointHorseAnimRef.current.geometry.attributes.position.array.length
    );

    const tempVector = new THREE.Vector3();
    const sourcePositions =
      totoroScene.children[0].geometry.attributes.position;

    // Apply world matrix to each vertex
    for (let i = 0; i < sourcePositions.count; i++) {
      tempVector.fromBufferAttribute(sourcePositions, i);
      tempVector.applyMatrix4(totoroScene.children[0].matrixWorld);

      const baseIndex = i * 3;
      aE2Geometry[baseIndex] = tempVector.x;
      aE2Geometry[baseIndex + 1] = tempVector.y;
      aE2Geometry[baseIndex + 2] = tempVector.z;
    }

    console.log("aE2Geometry", aE2Geometry.length);

    pointHorseAnimRef.current.geometry.setAttribute(
      "aE2Geometry",
      new THREE.BufferAttribute(aE2Geometry, `3`)
    );
  }, [totoroScene, pointHorseAnimRef]);

  return (
    <>
      <points
        ref={pointHorseAnimRef}
        rotation={rotation}
        position={position}
        rotation={rotation}
      >
        <horseMaterial transparent depthWrite={false} />
      </points>
    </>
  );
};

export default Horse;
