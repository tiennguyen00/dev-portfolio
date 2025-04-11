import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { useRef } from "react";
import * as THREE from "three";
import Effect from "./Effects";

const CanvasPage = ({ scrollRef }: { scrollRef: React.RefObject<number> }) => {
  const cubePos = useRef<THREE.Vector3>(new THREE.Vector3());
  const pointsRef = useRef<THREE.Points>(null!);

  return (
    <Canvas
      id="canvas-12323"
      style={{ width: "100%", height: "100dvh", position: "fixed" }}
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
      <Experience
        cubePos={cubePos}
        pointsRef={pointsRef}
        scrollRef={scrollRef}
      />
      <Effect pointsRef={pointsRef} />
    </Canvas>
  );
};

export default CanvasPage;
