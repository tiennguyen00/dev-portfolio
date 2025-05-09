import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Experience from "./Experience";
import { useRef } from "react";
import * as THREE from "three";
import Horse from "./Horse";
import Effect from "./Effects";

const CanvasPage = () => {
  const cubePos = useRef<THREE.Vector3>(new THREE.Vector3());
  const pointsRef = useRef<THREE.Points>(null!);

  return (
    <Canvas
      id="canvas-12323"
      style={{ width: "100%", height: "100dvh" }}
      camera={{ position: [0, 0, 40], fov: 70, near: 0.01, far: 50 }}
      gl={{
        alpha: true,
        antialias: false,
        stencil: false,
        depth: false,
        powerPreference: "high-performance",
      }}
    >
      <color attach="background" args={["#222"]} />
      {/* <StatsGl className="top-0 left-0 fixed" trackGPU /> */}
      <OrbitControls />
      <Experience cubePos={cubePos} pointsRef={pointsRef} />
      <Horse />
      <Effect pointsRef={pointsRef} />
    </Canvas>
  );
};

export default CanvasPage;
