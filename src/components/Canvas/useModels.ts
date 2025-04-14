import { useAnimations, useGLTF } from "@react-three/drei";

const useModels = () => {
  const [
    { scene: totoroScene },
    { scene: horseScene, animations: horseAnimations },
    { scene: hatScene },
    { scene: e2Scene },
    { scene: birdScene, animations: birdAnimations },
  ] = useGLTF([
    "/models/totoro_1.glb",
    "/models/horses.glb",
    "/models/witch_hat.glb",
    "/models/e2.glb",
    "/models/brid.glb",
  ]);

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
