/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import "./shaders/HorseMaterial";
import useDataPosition from "./useDataPosition";

interface HorseProps {
  pointHorseAnimRef: React.RefObject<THREE.Points>;
  scene: THREE.Scene;
  scrollRef?: React.MutableRefObject<number>;
  horseRunStart?: number;
  horseMixer?: THREE.AnimationMixer;
  horseClips?: THREE.AnimationClip[];
  e2Scene?: THREE.Group;
  horseInfoTransfroms: ReturnType<
    typeof useDataPosition
  >["horseInfoTransfroms"];
  e2InfoTransfroms: ReturnType<typeof useDataPosition>["e2InfoTransfroms"];
  horsePath: THREE.CatmullRomCurve3;
  horseRunStart: number;
}

const Horse = ({
  pointHorseAnimRef,
  scene,
  horseMixer,
  horseClips,
  e2Scene,
  e2InfoTransfroms,
  horseInfoTransfroms,
  scrollRef,
  horsePath,
  horseRunStart,
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

    if (scrollRef?.current > horseRunStart) {
      // console.log("scrollRef?.current: ", scrollRef?.current);
    }

    // Copy morph target influences from the source mesh to our points
    if (pointHorseAnimRef.current && scene.children.length > 0) {
      // Use scrollRef.current to get the latest scroll value
      if (scrollRef && scrollRef.current !== undefined) {
        pointHorseAnimRef.current.material.uniforms.uProgress.value =
          scrollRef.current;

        const horsePathVector = horsePath.getPointAt(
          scrollRef.current <= horseRunStart
            ? 0.0
            : (scrollRef.current - horseRunStart) / (1 - horseRunStart)
        );
        pointHorseAnimRef.current.position.copy(horsePathVector);
      }

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
      horseMixer.timeScale = 0.5;
      const sourceMesh = scene.children[0];
      if (sourceMesh && sourceMesh.isObject3D) {
        const action = horseMixer.clipAction(horseClips[0], sourceMesh);
        action.reset();
        action.play();
      }
    }
  }, [horseMixer, horseClips, scene]);

  useEffect(() => {
    if (!e2Scene) return;
    e2Scene.scale.set(
      e2InfoTransfroms.scale,
      e2InfoTransfroms.scale,
      e2InfoTransfroms.scale
    );
    e2Scene.rotation.y = e2InfoTransfroms.rotation[1];
    e2Scene.position.y += e2InfoTransfroms.translation[1];

    // Update world matrix to include transformations
    e2Scene.updateMatrixWorld(true);

    const aE2Geometry = new Float32Array(
      pointHorseAnimRef.current.geometry.attributes.position.array.length
    );

    const tempVector = new THREE.Vector3();
    const sourcePositions = e2Scene.children[0].geometry.attributes.position;

    // Apply world matrix to each vertex
    for (let i = 0; i < sourcePositions.count; i++) {
      tempVector.fromBufferAttribute(sourcePositions, i);
      tempVector.applyMatrix4(e2Scene.children[0].matrixWorld);

      const baseIndex = i * 3;
      aE2Geometry[baseIndex] = tempVector.x;
      aE2Geometry[baseIndex + 1] = tempVector.y;
      aE2Geometry[baseIndex + 2] = tempVector.z;
    }

    pointHorseAnimRef.current.geometry.setAttribute(
      "aE2Geometry",
      new THREE.BufferAttribute(aE2Geometry, `3`)
    );
  }, [e2Scene, pointHorseAnimRef]);

  return (
    <>
      <points
        ref={pointHorseAnimRef}
        rotation={horseInfoTransfroms.rotation}
        position={horseInfoTransfroms.translation}
      >
        <horseMaterial transparent depthWrite={false} />
      </points>
    </>
  );
};

export default Horse;
