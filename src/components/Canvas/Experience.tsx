/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFBO, useGLTF, useAnimations } from "@react-three/drei";
import { useFrame, createPortal, useThree } from "@react-three/fiber";
import { lerp } from "three/src/math/MathUtils.js";
import "./shaders/RenderMaterial";
import "./shaders/SimMaterial";
import "./shaders/WireframeMaterial";
import { wireframeVertexShader, wireframeFragmentShader } from "./shaders";

const size = 64,
  number = size * size;

interface ExperienceProps {
  cubePos: React.MutableRefObject<THREE.Vector3>;
  pointsRef: React.RefObject<THREE.Points>;
}

const Experience = ({ cubePos, pointsRef }: ExperienceProps) => {
  const { mouse } = useThree();
  const init = useRef(false);
  const v = useRef(new THREE.Vector3(0, 0, 0));
  const v1 = useRef(new THREE.Vector3(0, 0, 0));
  const currentParticles = useRef(0);
  const emitters = useRef<THREE.Mesh[]>([]);

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
  const { clips, mixer } = useAnimations(animations, scene1);

  const wireframeMaterials: THREE.ShaderMaterial[] = [];

  useEffect(() => {
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
              position2: { value: m.position },
              uTime: { value: 0 },
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

    scene1.rotation.x = -Math.PI / 10;
    mixer.clipAction(clips[0]).play();
    mixer.timeScale = 0.875;
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

  useFrame((state, delta) => {
    const elapsedTime = state.clock.elapsedTime;

    if (scene1) {
      scene1.position.copy(cubePos.current).multiplyScalar(1.5);
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
    }

    // SIMULATION
    simMaterial.current.uniforms.uDirections.value = directions.texture;
    simMaterial.current.uniforms.uRenderMode.value = 0;

    simGeometry.current.setDrawRange(0, number);
    state.gl.setRenderTarget(renderTarget);
    state.gl.render(sceneFBO.current, cameraFBO.current);

    // BEGIN EMITTER
    const emit = 1;
    state.gl.autoClear = false;

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
      state.gl.setRenderTarget(renderTarget);
      state.gl.render(sceneFBO.current, cameraFBO.current);

      currentParticles.current += emit;
      if (currentParticles.current > number) {
        currentParticles.current = 0;
      }

      emitter.prev = v.current.clone();
    });

    // END OF EMIITER

    // RENDER SCENE
    state.gl.setRenderTarget(null);

    // swap render targets
    const tmp = renderTarget;
    renderTarget = renderTarget1;
    renderTarget1 = tmp;

    material.current.uniforms.uTexture.value = renderTarget.texture;
    simMaterial.current.uniforms.uCurrentPosition.value = renderTarget1.texture;
    simMaterial.current.uniforms.uTime.value = elapsedTime;

    if (mixer) {
      mixer.update(delta);
    }

    // Update all wireframe materials with current time
    wireframeMaterials.forEach((material) => {
      material.uniforms.uTime.value = state.clock.elapsedTime;
    });

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
      <primitive object={scene1} />
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

Experience.displayName = "Experience";

export default Experience;
