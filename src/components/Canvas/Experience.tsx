/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFBO, useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, createPortal, useThree } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";
import "./shaders/RenderMaterial";
import "./shaders/SimMaterial";
import { wireframeVertexShader, wireframeFragmentShader } from "./shaders";
import { createPositionTexture, resamplePositions } from "./utils/textureUtils";
import Test from "./Test";
const size = 64,
  number = size * size;

interface ExperienceProps {
  cubePos: React.MutableRefObject<THREE.Vector3>;
  pointsRef: React.RefObject<THREE.Points>;
  scrollRef: React.RefObject<number>;
}

const Experience = ({ cubePos, pointsRef, scrollRef }: ExperienceProps) => {
  const { mouse, viewport } = useThree();
  const init = useRef(false);
  const v = useRef(new THREE.Vector3(0, 0, 0));
  const v1 = useRef(new THREE.Vector3(0, 0, 0));
  const currentParticles = useRef(0);
  const emitters = useRef<THREE.Mesh[]>([]);
  const morphTargetTexture = useRef<THREE.Texture[]>([]);
  const horsePositionAttrRef = useRef<THREE.BufferAttribute | null>(null);

  const MORPH_RANGES = {
    TOTORO: { START: 0.21, END: 0.35 },
    HAT: { START: 0.4, END: 0.5 },
    HORSE: { START: 0.55, END: 0.65 },
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

  const { scene: scene1, animations } = useGLTF("/models/test.glb");
  const [
    { scene: totoroScene },
    { scene: horseScene, animations: horseAnimations },
    { scene: hatScene },
  ] = useGLTF([
    "/models/totoro_1.glb",
    "/models/horses.glb",
    "/models/witch_hat.glb",
  ]);
  const { clips, mixer } = useAnimations(animations, scene1);
  const { clips: horseClips, mixer: horseMixer } = useAnimations(
    horseAnimations,
    horseScene
  );
  const wireframeMaterials: THREE.ShaderMaterial[] = [];

  const totoroPositions = useMemo(() => {
    const positions: number[] = [];

    const transformMatrix = new THREE.Matrix4();

    const rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 4);
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      -viewport.width / 4 + 8,
      -10,
      15
    );

    // Combine rotation and translation
    transformMatrix.multiply(translationMatrix).multiply(rotationMatrix);

    totoroScene.traverse((child) => {
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
          vertex.multiplyScalar(5);

          vertex.applyMatrix4(transformMatrix);
          positions.push(vertex.x, vertex.y, vertex.z);
        }
      }
    });

    return positions;
  }, [totoroScene, viewport]);

  const horsePositions = useMemo(() => {
    const positions: number[] = [];

    const transformMatrix = new THREE.Matrix4();

    const rotationMatrix = new THREE.Matrix4().makeRotationY(Math.PI / 3);
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      -viewport.width / 4 + 5,
      -10,
      15
    );

    // Combine rotation and translation
    transformMatrix.multiply(translationMatrix).multiply(rotationMatrix);

    horseScene.traverse((child) => {
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

          vertex.multiplyScalar(0.1);

          vertex.applyMatrix4(transformMatrix);
          positions.push(vertex.x, vertex.y, vertex.z);
        }
      }
    });

    return positions;
  }, [horseScene, viewport]);

  const hatPositions = useMemo(() => {
    const positions: number[] = [];

    const transformMatrix = new THREE.Matrix4();

    const rotationMatrix = new THREE.Matrix4().makeRotationX(Math.PI / 8);
    const translationMatrix = new THREE.Matrix4().makeTranslation(
      -viewport.width / 4 + 10,
      -2.5,
      15
    );

    // Combine rotation and translation
    transformMatrix.multiply(translationMatrix).multiply(rotationMatrix);

    hatScene.traverse((child) => {
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
          vertex.multiplyScalar(6.5);

          vertex.applyMatrix4(transformMatrix);
          positions.push(vertex.x, vertex.y, vertex.z);
        }
      }
    });

    return positions;
  }, [hatScene, viewport]);

  useEffect(() => {
    if (totoroPositions.length > 0) {
      const resampledPositions = resamplePositions(totoroPositions, size);

      morphTargetTexture.current[0] = createPositionTexture(
        size,
        resampledPositions
      );
    }

    if (horsePositions.length > 0) {
      const resampledPositions = resamplePositions(horsePositions, size);

      morphTargetTexture.current[1] = createPositionTexture(
        size,
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
    scene1.traverse((m) => {
      if (m.isSkinnedMesh) {
        if (m.name.startsWith("Plane")) {
          const material = new THREE.ShaderMaterial({
            vertexShader: wireframeVertexShader,
            fragmentShader: wireframeFragmentShader,
            wireframe: true,
            transparent: true,
            toneMapped: false,
            uniforms: {
              position2: new THREE.Uniform(m.position),
              uTime: new THREE.Uniform(0),
              uProgress: new THREE.Uniform(0),
            },
          });

          wireframeMaterials.push(material);

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

    // scene1.rotation.x = -Math.PI / 10;
    mixer.clipAction(clips[0]).play();

    // Find and play the running animation specifically
    if (horseClips.length > 0 && horseMixer) {
      console.log(
        "Available horse animations:",
        horseClips.map((clip) => clip.name)
      );

      // Directly use "Animation.001" since we know it's the right one
      const runClip = horseClips.find((clip) => clip.name === "Animation");

      // Make sure we found the clip
      if (runClip) {
        // Set up the animation with dramatically enhanced parameters
        const horseAction = horseMixer.clipAction(runClip);
        horseAction.setEffectiveTimeScale(1.0); // Normal animation speed to match shader
        horseAction.setEffectiveWeight(1.0); // Normal influence

        // Reset and play the animation to ensure it's active
        horseAction.reset();
        horseAction.play();

        console.log("Selected horse animation:", runClip.name);
      } else {
        console.error("Critical error: Animation.001 not found");
      }
    }

    mixer.timeScale = 0.875;

    // Store a reference to the horse's position attribute
    horseScene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry && mesh.geometry.attributes.position) {
          horsePositionAttrRef.current =
            mesh.geometry.attributes.position.clone();
        }
      }
    });

    // Create custom uniforms for the shader to sample the current animation frame
    if (simMaterial.current) {
      // No need to add horse animation uniforms
    }
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

  // Create the path tragetry
  const path = new THREE.CatmullRomCurve3([
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
    const currentPathVector = path.getPointAt(mappedProgress);

    if (scene1) {
      scene1.position.copy(cubePos.current).multiplyScalar(1.5);
    }

    // Create a unified parameter space for morphing (0-1 for entire sequence)
    // 0.0-0.33: Particles to Totoro
    // 0.33-0.66: Totoro to Hat
    // 0.66-1.0: Hat to Horse
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
    } else if (scrollRef.current < MORPH_RANGES.HORSE.START) {
      // Between Hat and Horse (maintain full Hat form)
      normalizedProgress = 0.66;
      morphProgress = 1.0;
      targetModelIndex = 1;
    } else if (scrollRef.current <= MORPH_RANGES.HORSE.END) {
      // In Horse range (0.66-1.0 in normalized space)
      normalizedProgress =
        0.66 +
        ((scrollRef.current - MORPH_RANGES.HORSE.START) /
          (MORPH_RANGES.HORSE.END - MORPH_RANGES.HORSE.START)) *
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
      // When morphing to Horse (0.66-1.0 range)
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
    material.current.uniforms.uProgress.value = mappedProgress;
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

    // Update the animations
    if (mixer) {
      mixer.update(delta);
    }

    // Always update the horse mixer to keep its animation going
    if (horseMixer) {
      horseMixer.update(delta);
    }

    // Update all wireframe materials with current time
    wireframeMaterials.forEach((material) => {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uProgress.value = mappedProgress;
    });

    // If we're morphing, adjust the original model's opacity/visibility
    if (normalizedProgress > 0 + 0.1) {
      scene1.visible = false;
    } else {
      scene1.visible = true;
    }

    // Rotate the model based on mouse position
    if (scene1) {
      const targetRotationY = mouse.x * 0.654;
      const targetRotationX = -mouse.y * 0.654;

      // Apply smooth lerping to rotation
      scene1.rotation.y += (targetRotationY - scene1.rotation.y) * 0.1;
      scene1.rotation.x += (targetRotationX - scene1.rotation.x) * 0.1;

      // Scale based on distance from origin
      const distanceFromCenter = Math.sqrt(
        mouse.x * mouse.x + mouse.y * mouse.y
      );
      // Calculate target scale (1 at origin, smaller as distance increases)
      const targetScale = 1 - distanceFromCenter * 0.25; // Adjust the 0.25 to control scale reduction rate

      // Apply smooth scaling with lerp
      scene1.scale.x += (targetScale - scene1.scale.x) * 0.1;
      scene1.scale.y += (targetScale - scene1.scale.y) * 0.1;
      scene1.scale.z += (targetScale - scene1.scale.z) * 0.1;

      scene1.position.copy(currentPathVector);
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

  // Create a reference for the animated horse points
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Clean up animation frame on unmount
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <>
      <primitive object={scene1} />
      <group>
        {/* Original horse model */}
        <primitive
          object={horseScene}
          scale={0.1}
          rotation-y={Math.PI / 2}
          position={[2, -10, 15]}
          visible={normalizedProgress < 0.8} // Hide once particle version is fully formed
        />

        {/* Points version of the horse for better integration with particles */}
        <points scale={0.1} rotation-y={Math.PI / 2} position={[2, -10, 15]}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={horsePositions.length / 3}
              array={new Float32Array(horsePositions)}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.3}
            color="#ff6b38"
            transparent={true}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            sizeAttenuation={true}
            visible={normalizedProgress > 0.66} // Only show during horse phase
          />
        </points>
      </group>
      {/* Only show Test component when we're not showing our own particle models */}
      <group visible={false}>
        <Test />
      </group>
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
