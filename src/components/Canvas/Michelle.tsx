import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// Define a type for our particle references
type ParticleRef = {
  points: THREE.Points;
  originalMesh: THREE.SkinnedMesh;
  count: number;
};

const Michelle = () => {
  const { scene } = useThree();
  const { scene: michelleScene, animations: michelleAnimations } = useGLTF(
    "/models/michelle.glb"
  );

  const { clips, mixer } = useAnimations(michelleAnimations, michelleScene);
  let mixer2;

  // Type the ref properly to avoid errors
  const particlesRef = useRef<ParticleRef[]>([]);

  // Create reusable objects outside the loop to avoid garbage collection
  const tempVec = new THREE.Vector3();
  const tempVec2 = new THREE.Vector3();
  const tempColor = new THREE.Color();
  const tempMatrix = new THREE.Matrix4();

  useEffect(() => {
    mixer.clipAction(clips[0]).play();
    const loader = new GLTFLoader();
    loader.load("models/gltf/Michelle.glb", function (gltf) {});
    michelleScene.traverse((child) => {
      // TypeScript type guard for SkinnedMesh
      if (child.type === "SkinnedMesh") {
        const skinnedMesh = child as THREE.SkinnedMesh;
        const positions = skinnedMesh.geometry.getAttribute("position");
        const count = positions.count;

        // Create geometry for particles
        const particleGeometry = new THREE.BufferGeometry();

        // Initialize position and color buffers - use let instead of const since we may need to reassign
        let particlePositions = new Float32Array(count * 3);
        let particleColors = new Float32Array(count * 3);

        // Set initial positions from mesh
        let validVertexCount = 0;
        for (let i = 0; i < count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const z = positions.getZ(i);

          // Validate position values - skip NaN or infinite values
          if (isFinite(x) && isFinite(y) && isFinite(z)) {
            particlePositions[validVertexCount * 3] = x;
            particlePositions[validVertexCount * 3 + 1] = y;
            particlePositions[validVertexCount * 3 + 2] = z;

            // Set initial colors (blend between blue and orange)
            particleColors[validVertexCount * 3] = 0.0; // R
            particleColors[validVertexCount * 3 + 1] = 0.4; // G
            particleColors[validVertexCount * 3 + 2] = 1.0; // B

            validVertexCount++;
          }
        }

        // If we filtered out some vertices, create a smaller buffer
        if (validVertexCount < count) {
          const validPositions = new Float32Array(validVertexCount * 3);
          const validColors = new Float32Array(validVertexCount * 3);

          validPositions.set(
            particlePositions.subarray(0, validVertexCount * 3)
          );
          validColors.set(particleColors.subarray(0, validVertexCount * 3));

          particlePositions = validPositions;
          particleColors = validColors;
        }

        // Add attributes to geometry
        particleGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(particlePositions, 3)
        );
        particleGeometry.setAttribute(
          "color",
          new THREE.BufferAttribute(particleColors, 3)
        );

        // Ensure boundingSphere is computed correctly
        particleGeometry.computeBoundingSphere();

        // Create material
        const materialPoints = new THREE.PointsMaterial({
          size: 2,
          sizeAttenuation: false,
          vertexColors: true,
          transparent: true,
          opacity: 0.8,
        });

        // Create points instead of sprite
        const pointCloud = new THREE.Points(particleGeometry, materialPoints);

        // Add to scene
        pointCloud.scale.set(10, 10, 10);
        pointCloud.rotation.x = -Math.PI / 2;
        pointCloud.position.x = 5;
        scene.add(pointCloud);

        // Store references for animation update
        particlesRef.current.push({
          points: pointCloud,
          originalMesh: skinnedMesh,
          count: validVertexCount,
        });
      }
    });
  }, []);

  useFrame((_, delta) => {
    // Update animation mixer
    mixer.update(delta);

    // Update particle positions based on animated mesh vertices
    particlesRef.current.forEach(({ points, originalMesh, count }) => {
      if (!originalMesh.skeleton) return;

      const particlePositions = points.geometry.getAttribute("position");
      const particleColors = points.geometry.getAttribute("color");
      const originalPositions = originalMesh.geometry.getAttribute("position");

      // Update each particle position based on the corresponding vertex
      for (let i = 0; i < count; i++) {
        try {
          // Get original position
          tempVec.fromBufferAttribute(originalPositions, i);

          // Store previous position for velocity calculation
          tempVec2.set(
            particlePositions.getX(i),
            particlePositions.getY(i),
            particlePositions.getZ(i)
          );

          // Apply current skinning and world matrix
          if (originalMesh.skeleton) {
            const boneMatrices = originalMesh.skeleton.boneMatrices;

            // Reset transformation
            tempMatrix.identity();

            // Apply skinning
            if (originalMesh.isSkinnedMesh) {
              // Get the bone indices and weights
              const skinIndex = originalMesh.geometry.getAttribute("skinIndex");
              const skinWeight =
                originalMesh.geometry.getAttribute("skinWeight");

              // Get the four indices and weights
              const i0 = skinIndex.getX(i);

              const w0 = skinWeight.getX(i);

              // Apply weighted bone matrices (simplified skinning)
              if (w0 > 0) {
                const boneMatrix = new THREE.Matrix4().fromArray(
                  boneMatrices,
                  i0 * 16
                );
                tempVec.applyMatrix4(boneMatrix);
              }

              // Apply world matrix
              tempVec.applyMatrix4(originalMesh.matrixWorld);
            } else {
              // If not skinned, just apply world matrix
              tempVec.applyMatrix4(originalMesh.matrixWorld);
            }

            // Check for NaN values before updating
            if (
              isFinite(tempVec.x) &&
              isFinite(tempVec.y) &&
              isFinite(tempVec.z)
            ) {
              // Calculate velocity (change in position)
              const velX = tempVec.x - tempVec2.x;
              const velY = tempVec.y - tempVec2.y;
              const velZ = tempVec.z - tempVec2.z;

              // Apply position update
              particlePositions.setXYZ(i, tempVec.x, tempVec.y, tempVec.z);

              // Update color based on velocity
              const speed = Math.sqrt(velX * velX + velY * velY + velZ * velZ);
              const blendFactor = Math.min(speed * 30, 1); // Increased scaling for more visible effect

              // Blend between blue and orange based on speed
              tempColor.setRGB(
                blendFactor * 1.0, // R: Blend to orange
                0.4 + blendFactor * 0.2, // G: Blend to orange
                1.0 - blendFactor * 0.8 // B: Blend from blue
              );

              particleColors.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
            }
          }
        } catch (e) {
          // Skip problematic vertices
          console.debug("Error updating vertex", i, e);
        }
      }

      // Mark attributes as needing update
      particlePositions.needsUpdate = true;
      particleColors.needsUpdate = true;
    });
  });

  return <>{/* <primitive object={michelleScene} scale={10} /> */}</>;
};

export default Michelle;
