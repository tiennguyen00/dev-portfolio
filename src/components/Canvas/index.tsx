import { Canvas } from "@react-three/fiber";
import Experience from "./Experience";
import { Suspense, useRef } from "react";
import * as THREE from "three";
import Effect from "./Effects";
import { Progress } from "./Progress";

const CanvasPage = ({
  scrollRef,
  setLoadingAssets,
}: {
  scrollRef: React.RefObject<number>;
  setLoadingAssets: (v: boolean) => void;
}) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const pointHorseAnimRef = useRef<THREE.Points>(null!);

  return (
    <>
      <Progress setLoadingAssets={setLoadingAssets} />
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
        className="hidden md:block"
      >
        <color attach="background" args={["#222"]} />
        {/* <StatsGl className="top-0 left-0 fixed" trackGPU /> */}
        <Suspense fallback={null}>
          <Experience
            pointsRef={pointsRef}
            scrollRef={scrollRef}
            pointHorseAnimRef={pointHorseAnimRef}
          />
          <Effect pointsRef={pointsRef} pointHorseAnimRef={pointHorseAnimRef} />
        </Suspense>
      </Canvas>
    </>
  );
};

export default CanvasPage;
