import { EffectComposer, SelectiveBloom } from "@react-three/postprocessing";
import { useRef } from "react";
import * as THREE from "three";

const Effect = ({
  pointsRef,
}: {
  pointsRef: React.RefObject<THREE.Points>;
}) => {
  const lightRef = useRef<THREE.PointLight>(new THREE.PointLight());
  const boxRef = useRef<THREE.Mesh>(new THREE.Mesh());

  return (
    <>
      <pointLight ref={lightRef} position={[10, 10, 10]} intensity={1} />
      {pointsRef.current && (
        <EffectComposer>
          <SelectiveBloom
            key={pointsRef.current.uuid}
            lights={[lightRef.current]}
            selection={[boxRef.current, pointsRef.current]}
            selectionLayer={1}
            intensity={1.5}
            luminanceThreshold={0.546}
            luminanceSmoothing={0.3}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
};

export default Effect;
