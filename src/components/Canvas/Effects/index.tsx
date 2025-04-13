import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import StarField from "./StarField";

export const BLOOM_LAYER = 1;

const Effect = ({
  pointsRef,
  pointHorseAnimRef,
}: {
  pointsRef: React.RefObject<THREE.Points>;
  pointHorseAnimRef: React.RefObject<THREE.Points>;
}) => {
  const lightRef = useRef<THREE.PointLight>(null);
  const [points, setPoints] = useState<Array<THREE.Points>>([]);

  useEffect(() => {
    if (pointsRef.current && pointHorseAnimRef.current) {
      setPoints([pointsRef.current, pointHorseAnimRef.current]);
    }
  }, [pointsRef.current, pointHorseAnimRef.current]);

  useEffect(() => {
    console.log(points);
  }, [points]);
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
            luminanceThreshold={0.9}
            luminanceSmoothing={0.3}
            mipmapBlur
            selectionLayer={BLOOM_LAYER}
          />
        </EffectComposer>
      )}
      <StarField />
    </>
  );
};

export default Effect;
