import { useAnimations, useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import { useMediaQuery } from "react-responsive";

const MODEL_PATHS = [
  "/models/totoro_1.glb",
  "/models/horses.glb",
  "/models/witch_hat.glb",
  "/models/e2.glb",
  "/models/brid.glb",
];

const useModels = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 560px)" });

  useEffect(() => {
    console.log("isMobile: ", isMobile);
    if (!isMobile) {
      MODEL_PATHS.forEach((path) => useGLTF.preload(path));
    }
  }, [isMobile]);

  const [
    { scene: totoroScene },
    { scene: horseScene, animations: horseAnimations },
    { scene: hatScene },
    { scene: e2Scene },
    { scene: birdScene, animations: birdAnimations },
  ] = useGLTF(MODEL_PATHS);

  const { clips, mixer } = useAnimations(birdAnimations, birdScene);
  const { clips: horseClips, mixer: horseMixer } = useAnimations(
    horseAnimations,
    horseScene
  );

  return {
    totoroScene,
    horseScene,
    hatScene,
    e2Scene,
    birdScene,
    birdAnimations,
    horseAnimations,
    clips,
    mixer,
    horseClips,
    horseMixer,
  };
};

export default useModels;
