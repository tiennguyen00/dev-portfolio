import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { wireframeVertexShader, wireframeFragmentShader } from ".";

const WireframeMaterial = shaderMaterial(
  {},
  wireframeVertexShader,
  wireframeFragmentShader
);
extend({ WireframeMaterial });

export default WireframeMaterial;

export { wireframeVertexShader, wireframeFragmentShader };
