import { useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import useModels from "./useModels";

interface TransformConfig {
  rotation: THREE.Euler | [number, number, number];
  translation: [number, number, number];
  scale: number;
}

const useDataPosition = () => {
  const { viewport } = useThree();
  const { totoroScene, hatScene, e2Scene } = useModels();

  const calculatePositions = (
    scene: THREE.Group,
    config: TransformConfig
  ): number[] => {
    const positions: number[] = [];
    const transformMatrix = new THREE.Matrix4();

    // Create rotation matrix based on provided rotation
    const rotationMatrix = new THREE.Matrix4();
    if (Array.isArray(config.rotation)) {
      rotationMatrix.makeRotationFromEuler(
        new THREE.Euler(
          config.rotation[0],
          config.rotation[1],
          config.rotation[2]
        )
      );
    } else {
      rotationMatrix.makeRotationFromEuler(config.rotation);
    }

    // Create translation matrix
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      config.translation[0],
      config.translation[1],
      config.translation[2]
    );

    // Combine rotation and translation
    transformMatrix.multiply(translationMatrix).multiply(rotationMatrix);

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geometry = mesh.geometry;
        const positionAttribute = geometry.attributes.position;

        // Process each vertex
        for (let i = 0; i < positionAttribute.count; i++) {
          // Get vertex position in local space
          const vertex = new THREE.Vector3();
          vertex.fromBufferAttribute(positionAttribute, i);

          // Apply mesh's local transformation
          vertex.applyMatrix4(mesh.matrixWorld);

          // Scale the model
          vertex.multiplyScalar(config.scale);

          // Apply custom transformation
          vertex.applyMatrix4(transformMatrix);

          positions.push(vertex.x, vertex.y, vertex.z);
        }
      }
    });

    return positions;
  };

  const totoroPositions = useMemo(() => {
    return calculatePositions(totoroScene, {
      rotation: [0, Math.PI / 4, 0],
      translation: [-viewport.width / 4 + 8, -10, 15],
      scale: 5,
    });
  }, [totoroScene, viewport]);

  const hatPositions = useMemo(() => {
    return calculatePositions(hatScene, {
      rotation: [Math.PI / 8, 0, 0],
      translation: [-viewport.width / 4 + 10, -2.5, 15],
      scale: 6.5,
    });
  }, [hatScene, viewport]);

  const horseInfoTransfroms = {
    translation: [-viewport.width / 4 + 5, -10, 15],
    rotation: [0, Math.PI / 3, 0],
    scale: [0.1, 0.1, 0.1],
  };
  const e2InfoTransfroms = {
    rotation: [0, -Math.PI / 4, 0],
    translation: [0, 0, 0],
    scale: 40,
  };

  const e2Positions = useMemo(() => {
    return calculatePositions(e2Scene, {
      rotation: [
        horseInfoTransfroms.rotation[0] + e2InfoTransfroms.rotation[0],
        horseInfoTransfroms.rotation[1] + e2InfoTransfroms.rotation[1],
        horseInfoTransfroms.rotation[2] + e2InfoTransfroms.rotation[2],
      ],
      translation: [
        horseInfoTransfroms.translation[0] + e2InfoTransfroms.translation[0],
        0,
        horseInfoTransfroms.translation[2] + e2InfoTransfroms.translation[2],
      ],
      scale: e2InfoTransfroms.scale,
    });
  }, [e2Scene, viewport]);

  return {
    totoroPositions,
    hatPositions,
    e2Positions,
    horseInfoTransfroms,
    e2InfoTransfroms,
  };
};

export default useDataPosition;
