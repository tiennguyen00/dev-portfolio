import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { BLOOM_LAYER } from "./Effects";

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
  scrollRef,
  horseRunStart = 0.81,
  horseMixer,
  horseClips,
}: HorseProps) => {
  const isVisibleRef = useRef(false);
  const hasStartedAnimation = useRef(false);

  useEffect(() => {
    if (pointHorseAnimRef.current && scene.children.length > 0) {
      const childMesh = scene.children[0] as THREE.Mesh;
      if (childMesh.geometry && childMesh.geometry.attributes.position) {
        const newGeometry = new THREE.BufferGeometry();

        newGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(
            childMesh.geometry.attributes.position.array,
            3
          )
        );

        if (
          childMesh.geometry.morphAttributes &&
          childMesh.geometry.morphAttributes.position
        ) {
          newGeometry.morphAttributes.position =
            childMesh.geometry.morphAttributes.position;
        }

        if ("morphTargetsRelative" in childMesh.geometry) {
          newGeometry.morphTargetsRelative =
            childMesh.geometry.morphTargetsRelative;
        }

        pointHorseAnimRef.current.geometry = newGeometry;

        // Use type assertions for morph targets
        if ("morphTargetInfluences" in childMesh) {
          pointHorseAnimRef.current.morphTargetInfluences =
            childMesh.morphTargetInfluences;
          ``;
        }

        if ("morphTargetDictionary" in childMesh) {
          pointHorseAnimRef.current.morphTargetDictionary =
            childMesh.morphTargetDictionary;
        }

        // Set the layers for bloom effect
        pointHorseAnimRef.current.layers.enable(BLOOM_LAYER);
      }
    }
  }, [scene]);

  useFrame(() => {
    // Update visibility based on scroll position
    if (pointHorseAnimRef.current && scrollRef) {
      const shouldShow = scrollRef.current > horseRunStart;
      if (isVisibleRef.current !== shouldShow) {
        isVisibleRef.current = shouldShow;
        pointHorseAnimRef.current.visible = shouldShow;

        // Handle animation if horseAction is available
        if (shouldShow && !hasStartedAnimation.current) {
          setTimeout(() => {
            if (horseMixer && horseClips && horseClips.length > 0) {
              horseMixer.clipAction(horseClips[0]).reset();
              horseMixer.clipAction(horseClips[0]).play();
              hasStartedAnimation.current = true;
            }
          }, 300);
        } else if (!shouldShow) {
          if (horseMixer && horseClips && horseClips.length > 0) {
            horseMixer.clipAction(horseClips[0]).stop();
            hasStartedAnimation.current = false;
          }
        }
      }
    }
  });

  return (
    <points
      ref={pointHorseAnimRef}
      scale={scale}
      position={position}
      rotation={rotation}
      visible={false} // Start hidden, will be updated in useFrame
    >
      <pointsMaterial
        size={0.0546}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
      {/* <shaderMaterial
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          
          void main() {
            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = 2.0 * (3.5 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          uniform float uTime;
          varying vec2 vUv;
          
          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            float alpha = 1.0 - smoothstep(0.4, 0.5, dist);
            vec3 color = vec3(0.8, 0.3, 0.2);
            gl_FragColor = vec4(color, alpha);
          }
        `}
      /> */}
    </points>
  );
};

export default Horse;
