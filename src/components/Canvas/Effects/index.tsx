import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export const BLOOM_LAYER = 1;

const Effect = ({
  pointsRef,
}: {
  pointsRef: React.RefObject<THREE.Points>;
}) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const [points, setPoints] = useState<Array<THREE.Points>>([]);

  useEffect(() => {
    if (pointsRef.current) {
      setPoints([pointsRef.current]);
    }
  }, [pointsRef.current]);
  return (
    <>
      <ambientLight ref={lightRef} intensity={0.5} />
      {points && points.length > 0 && lightRef.current && (
        <EffectComposer multisampling={0}>
          {/* <DepthOfField focusDistance={0} focalLength={0.25} bokehScale={1} /> */}
          <SelectiveBloom
            lights={[lightRef.current]}
            selection={points}
            intensity={1.46}
            luminanceThreshold={0.546}
            luminanceSmoothing={0.3}
            mipmapBlur
            selectionLayer={BLOOM_LAYER}
          />
        </EffectComposer>
      )}
    </>
  );
};

export default Effect;
