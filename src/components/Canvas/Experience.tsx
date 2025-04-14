/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFBO } from "@react-three/drei";
import { useFrame, createPortal, useThree } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";
import "./shaders/RenderMaterial";
import "./shaders/SimMaterial";
import wireframeVertexShader from "./shaders/wireframe/vertex.vert";
import wireframeFragmentShader from "./shaders/wireframe/fragment.frag";
import { createPositionTexture, resamplePositions } from "./utils/textureUtils";
import Horse from "./Horse";
import useModels from "./useModels";
import useDataPosition from "./useDataPosition";
const size = 64,
  number = size * size;

interface ExperienceProps {
  pointsRef: React.RefObject<THREE.Points>;
  scrollRef: React.RefObject<number>;
  pointHorseAnimRef: React.RefObject<THREE.Points>;
}

const Experience = ({
  pointsRef,
  scrollRef,
  pointHorseAnimRef,
}: ExperienceProps) => {
  const { mouse, viewport } = useThree();
  const init = useRef(false);
  const v = useRef(new THREE.Vector3(0, 0, 0));
  const v1 = useRef(new THREE.Vector3(0, 0, 0));
  const currentParticles = useRef(0);
  const emitters = useRef<THREE.Mesh[]>([]);
  const morphTargetTexture = useRef<THREE.Texture[]>([]);

  const MORPH_RANGES = {
    TOTORO: { START: 0.21, END: 0.4 },
    HAT: { START: 0.41, END: 0.6 },
    E2: { START: 0.61, END: 0.8 },
    HORSE: { START: 0.81, END: 1 },
  };

  const sceneFBO = useRef<THREE.Scene>(new THREE.Scene());
  const viewArea = size / 2 + 0.01;
  const cameraFBO = useRef<THREE.OrthographicCamera>(
    new THREE.OrthographicCamera(
      -viewArea,
      viewArea,
      viewArea,
      -viewArea,
      -2,
      2
    )
  );
  cameraFBO.current.position.z = 1;
  cameraFBO.current.lookAt(new THREE.Vector3(0, 0, 0));

  const geometry = useRef<THREE.BufferGeometry>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const simMaterial = useRef<THREE.ShaderMaterial>(null!);
  const simGeometry = useRef<THREE.BufferGeometry>(null!);
  const wireframeMaterials = useRef<THREE.ShaderMaterial[]>([]);

  const {
    horseScene,
    e2Scene,
    birdScene,
    clips,
    mixer,
    horseClips,
    horseMixer,
  } = useModels();

  const {
    totoroPositions,
    hatPositions,
    e2Positions,
    horseInfoTransfroms,
    e2InfoTransfroms,
  } = useDataPosition();

  useEffect(() => {
    if (totoroPositions.length > 0) {
      const resampledPositions = resamplePositions(totoroPositions, size);
      morphTargetTexture.current[0] = createPositionTexture(
        size,
        resampledPositions
      );
    }

    if (e2Positions.length > 0) {
      const resampledPositions = resamplePositions(e2Positions, size);
      morphTargetTexture.current[1] = createPositionTexture(
        size / 2,
        resampledPositions
      );
    }

    if (hatPositions.length > 0) {
      const resampledPositions = resamplePositions(hatPositions, size);
      morphTargetTexture.current[2] = createPositionTexture(
        size,
        resampledPositions
      );
    }

    let index = 0;
    birdScene.traverse((m) => {
      if (m.isSkinnedMesh) {
        if (m.name.startsWith("Plane")) {
          const material = new THREE.ShaderMaterial({
            vertexShader: wireframeVertexShader,
            fragmentShader: wireframeFragmentShader,
            wireframe: true,
            transparent: true,
            toneMapped: false,
            uniforms: {
              uTime: new THREE.Uniform(0),
              uProgress: new THREE.Uniform(0),
            },
          });

          wireframeMaterials.current.push(material);
          m.material = material;
        }
      }
      if (m.isMesh && m.geometry.attributes.position.array.length < 120) {
        if (
          ((index % 2 === 0 || index % 3 === 0) && index > 5) ||
          m.position.length() < 5
        ) {
          index++;
          m.visible = false;
          return;
        }
        emitters.current.push({
          mesh: m,
          prev: m.position.clone(),
          dir: new THREE.Vector3(0, 0, 0),
        });
        m.visible = false;

        index++;
      }
    });

    mixer.clipAction(clips[0]).play();
  }, []);

  let renderTarget = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const directions = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  const initPos = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  let renderTarget1 = useFBO(size, size, {
    minFilter: THREE.NearestFilter,
    magFilter: THREE.NearestFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType,
  });

  // Create the birdPath tragetry
  const birdPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, 0, 30),
    new THREE.Vector3(0, viewport.height / 2 - 10, 10),
  ]);
  //===============================================

  // Calculate morphing progress and determine which model to use
  let morphProgress = 0;
  let targetModelIndex = -1; // -1: no morph, 0: Totoro, 1: Horse
  let normalizedProgress = 0; // 0-1 unified parameter space across all transitions. 0 = no morph

  useFrame((state, delta) => {
    const elapsedTime = state.clock.elapsedTime;
    // value from 0 -> 1 ======================================
    const mappedProgress = Math.min(
      1,
      scrollRef.current / MORPH_RANGES.TOTORO.START
    );
    const currentPathVector = birdPath.getPointAt(mappedProgress);

    if (birdScene) {
      birdScene.position.copy(new THREE.Vector3()).multiplyScalar(1.5);
    }

    // Create a unified parameter space for morphing (0-1 for entire sequence)
    if (scrollRef.current < MORPH_RANGES.TOTORO.START) {
      // Before any morphing
      normalizedProgress = 0;
      morphProgress = 0;
      targetModelIndex = -1;
    } else if (scrollRef.current <= MORPH_RANGES.TOTORO.END) {
      // In Totoro range (0-0.33 in normalized space)
      normalizedProgress =
        ((scrollRef.current - MORPH_RANGES.TOTORO.START) /
          (MORPH_RANGES.TOTORO.END - MORPH_RANGES.TOTORO.START)) *
        0.33;
      morphProgress = normalizedProgress * 3; // Scale to 0-1 range for this model
      targetModelIndex = 0;
    } else if (scrollRef.current < MORPH_RANGES.HAT.START) {
      // Between Totoro and Hat (maintain full Totoro form)
      normalizedProgress = 0.33;
      morphProgress = 1.0;
      targetModelIndex = 0;
    } else if (scrollRef.current <= MORPH_RANGES.HAT.END) {
      // In Hat range (0.33-0.66 in normalized space)
      normalizedProgress =
        0.33 +
        ((scrollRef.current - MORPH_RANGES.HAT.START) /
          (MORPH_RANGES.HAT.END - MORPH_RANGES.HAT.START)) *
          0.33;
      morphProgress = (normalizedProgress - 0.33) * 3; // Scale to 0-1 range for this model
      targetModelIndex = 1;
    } else if (scrollRef.current < MORPH_RANGES.E2.START) {
      // Between Hat and Horse (maintain full Hat form)
      normalizedProgress = 0.66;
      morphProgress = 1.0;
      targetModelIndex = 1;
    } else if (scrollRef.current <= MORPH_RANGES.E2.END) {
      // In Horse range (0.66-1.0 in normalized space)
      normalizedProgress =
        0.66 +
        ((scrollRef.current - MORPH_RANGES.E2.START) /
          (MORPH_RANGES.E2.END - MORPH_RANGES.E2.START)) *
          0.34;
      morphProgress = (normalizedProgress - 0.66) * (1 / 0.34); // Scale to 0-1 range for this model
      targetModelIndex = 2;
    } else {
      // After all morphing (maintain full Horse form)
      normalizedProgress = 1.0;
      morphProgress = 1.0;
      targetModelIndex = 2;
    }

    if (!simMaterial.current || !simGeometry.current) return;
    if (!init.current) {
      init.current = true;

      // DIRECTIONS
      simMaterial.current.uniforms.uRenderMode.value = 1;
      simMaterial.current.uniforms.uTime.value = -100;
      simMaterial.current.uniforms.uSource.value = new THREE.Vector3(0, -1, 0);
      state.gl.setRenderTarget(directions);
      state.gl.render(sceneFBO.current, cameraFBO.current);
      simMaterial.current.uniforms.uDirections.value = directions.texture;

      // POSITIONS
      simMaterial.current.uniforms.uRenderMode.value = 2;
      simMaterial.current.uniforms.uSource.value = new THREE.Vector3(0, 0, 0);
      state.gl.setRenderTarget(initPos);
      state.gl.render(sceneFBO.current, cameraFBO.current);
      simMaterial.current.uniforms.uCurrentPosition.value = initPos.texture;

      // Set the target positions texture (initial setup)
      if (morphTargetTexture.current[0]) {
        simMaterial.current.uniforms.uTargetPositions.value =
          morphTargetTexture.current[0];
      }
    }

    // Update morph progress in shader
    simMaterial.current.uniforms.uMorphProgress.value = morphProgress;

    // Add normalized progress uniform if it exists
    if (simMaterial.current.uniforms.uNormalizedProgress) {
      simMaterial.current.uniforms.uNormalizedProgress.value =
        normalizedProgress;
    }

    // Set the model index for floating animation
    if (simMaterial.current.uniforms.uModelIndex) {
      simMaterial.current.uniforms.uModelIndex.value = targetModelIndex;
    }

    // Set the appropriate target textures for transitions
    if (normalizedProgress > 0) {
      // When morphing to Totoro (0-0.33 range)
      if (normalizedProgress <= 0.33) {
        if (morphTargetTexture.current[0]) {
          simMaterial.current.uniforms.uTargetPositions.value =
            morphTargetTexture.current[0];
        }
      }
      // When morphing to Hat (0.33-0.66 range)
      else if (normalizedProgress <= 0.66) {
        if (morphTargetTexture.current[2]) {
          simMaterial.current.uniforms.uTargetPositions.value =
            morphTargetTexture.current[2];

          // Also provide previous model texture (Totoro) for blending
          if (
            simMaterial.current.uniforms.uPrevTargetPositions &&
            morphTargetTexture.current[0]
          ) {
            simMaterial.current.uniforms.uPrevTargetPositions.value =
              morphTargetTexture.current[0];
          }
        }
      }
      // When morphing to E2 (0.66-1.0 range)
      else {
        if (morphTargetTexture.current[1]) {
          simMaterial.current.uniforms.uTargetPositions.value =
            morphTargetTexture.current[1];

          // Also provide previous model texture (Hat) for blending
          if (
            simMaterial.current.uniforms.uPrevTargetPositions &&
            morphTargetTexture.current[2]
          ) {
            simMaterial.current.uniforms.uPrevTargetPositions.value =
              morphTargetTexture.current[2];
          }
        }
      }
    }

    // SIMULATION
    simMaterial.current.uniforms.uDirections.value = directions.texture;
    simMaterial.current.uniforms.uRenderMode.value = 0;

    simGeometry.current.setDrawRange(0, number);
    state.gl.setRenderTarget(renderTarget);
    state.gl.render(sceneFBO.current, cameraFBO.current);

    // BEGIN EMITTER
    const emit = 1;
    // state.gl.autoClear = false;

    // Only emit particles if we're not morphing
    if (normalizedProgress <= 0 + 0.1) {
      emitters.current.forEach((emitter) => {
        emitter.mesh.getWorldPosition(v.current);
        v1.current = v.current.clone();
        const flip = Math.random() > 0.5;

        emitter.dir = v.current.clone().sub(emitter.prev).multiplyScalar(100);
        simGeometry.current.setDrawRange(currentParticles.current, emit);

        // DIRECTIONS
        simMaterial.current.uniforms.uRenderMode.value = 1;
        simMaterial.current.uniforms.uDirections.value = null;
        simMaterial.current.uniforms.uCurrentPosition.value = null;
        if (flip) emitter.dir.x *= -1;
        simMaterial.current.uniforms.uSource.value = emitter.dir;
        state.gl.setRenderTarget(directions);
        state.gl.render(sceneFBO.current, cameraFBO.current);

        // POSITIONS
        simMaterial.current.uniforms.uRenderMode.value = 2;
        if (flip) v1.current.x *= -1;
        simMaterial.current.uniforms.uSource.value = v1.current;
        simMaterial.current.uniforms.uSource.value =
          simMaterial.current.uniforms.uSource.value.add(currentPathVector);
        state.gl.setRenderTarget(renderTarget);
        state.gl.render(sceneFBO.current, cameraFBO.current);

        currentParticles.current += emit;
        if (currentParticles.current > number) {
          currentParticles.current = 0;
        }

        emitter.prev = v.current.clone();
      });
    }

    // END OF EMIITER

    // RENDER SCENE
    state.gl.setRenderTarget(null);

    // swap render targets
    const tmp = renderTarget;
    renderTarget = renderTarget1;
    renderTarget1 = tmp;

    material.current.uniforms.uTexture.value = renderTarget.texture;
    material.current.uniforms.uProgress.value = scrollRef.current;
    material.current.uniforms.uMorphProgress.value = morphProgress;

    // Pass normalized progress to shader for smooth transitions
    if (material.current.uniforms.uNormalizedProgress) {
      material.current.uniforms.uNormalizedProgress.value = normalizedProgress;
    }

    // Pass current model index for color blending in shader
    if (material.current.uniforms.uModelIndex) {
      material.current.uniforms.uModelIndex.value = targetModelIndex;
    }

    simMaterial.current.uniforms.uCurrentPosition.value = renderTarget1.texture;
    simMaterial.current.uniforms.uTime.value = elapsedTime;

    // Update the birdAnimations
    if (mixer) {
      mixer.update(delta);
    }

    // Always update the horse mixer to keep its animation going
    if (horseMixer) {
      horseMixer.update(delta);
    }

    // Update all wireframe materials with current time
    wireframeMaterials.current.forEach((material) => {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uProgress.value = mappedProgress;
    });

    // If we're morphing, adjust the original model's opacity/visibility
    if (normalizedProgress > 0 + 0.1) {
      birdScene.visible = false;
    } else {
      birdScene.visible = true;
    }

    // Rotate the model based on mouse position
    if (birdScene) {
      const targetRotationY = mouse.x * 0.654;
      const targetRotationX = -mouse.y * 0.654;

      // Apply smooth lerping to rotation
      birdScene.rotation.y += (targetRotationY - birdScene.rotation.y) * 0.1;
      birdScene.rotation.x += (targetRotationX - birdScene.rotation.x) * 0.1;

      // Scale based on distance from origin
      const distanceFromCenter = Math.sqrt(
        mouse.x * mouse.x + mouse.y * mouse.y
      );
      // Calculate target scale (1 at origin, smaller as distance increases)
      const targetScale = 1 - distanceFromCenter * 0.25; // Adjust the 0.25 to control scale reduction rate

      // Apply smooth scaling with lerp
      birdScene.scale.x += (targetScale - birdScene.scale.x) * 0.1;
      birdScene.scale.y += (targetScale - birdScene.scale.y) * 0.1;
      birdScene.scale.z += (targetScale - birdScene.scale.z) * 0.1;

      birdScene.position.copy(currentPathVector);
    }
  });

  // ================================
  // New code here
  const { positions, uvs } = useMemo(() => {
    const positions = new Float32Array(number * 3);
    const uvs = new Float32Array(number * 2);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;

        positions[3 * index] = j / size - 0.5;
        positions[3 * index + 1] = i / size - 0.5;
        positions[3 * index + 2] = 0;

        uvs[2 * index] = j / (size - 1);
        uvs[2 * index + 1] = i / (size - 1);
      }
    }
    return { positions, uvs };
  }, []);
  const { positionSim, uvsSim } = useMemo(() => {
    const pos = new Float32Array(number * 3);
    const uv = new Float32Array(number * 2);
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const index = i * size + j;

        pos[3 * index] = size * lerp(-0.5, 0.5, j / (size - 1));
        pos[3 * index + 1] = size * lerp(-0.5, 0.5, i / (size - 1));
        pos[3 * index + 2] = 0;

        uv[2 * index] = j / (size - 1);
        uv[2 * index + 1] = i / (size - 1);
      }
    }
    return { positionSim: pos, uvsSim: uv };
  }, []);

  return (
    <>
      <primitive object={birdScene} />
      <Horse
        pointHorseAnimRef={pointHorseAnimRef}
        scene={horseScene}
        horseMixer={horseMixer}
        horseClips={horseClips}
        horseInfoTransfroms={horseInfoTransfroms}
        e2InfoTransfroms={e2InfoTransfroms}
        scrollRef={scrollRef}
        horseRunStart={MORPH_RANGES.HORSE.START}
        e2Scene={e2Scene}
      />

      {createPortal(
        <points>
          <bufferGeometry ref={simGeometry}>
            <bufferAttribute
              attach="attributes-position"
              count={positionSim.length / 3}
              array={positionSim}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-uv"
              count={uvsSim.length / 2}
              array={uvsSim}
              itemSize={2}
            />
          </bufferGeometry>
          <simMaterial ref={simMaterial} />
        </points>,
        sceneFBO.current
      )}
      <points ref={pointsRef}>
        <bufferGeometry ref={geometry}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-uv"
            count={uvs.length / 2}
            array={uvs}
            itemSize={2}
          />
        </bufferGeometry>
        <renderMaterial
          ref={material}
          depthWrite={false}
          depthTest={false}
          transparent
          toneMapped={false}
        />
      </points>
    </>
  );
};

export default Experience;
