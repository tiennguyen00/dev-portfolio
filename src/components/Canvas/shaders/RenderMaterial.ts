/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import { vertexShader, fragmentShader } from "./index";
import * as THREE from "three";

const RenderMaterial = shaderMaterial(
  {
    time: new THREE.Uniform(0),
    uTexture: new THREE.Uniform(null),
    uProgress: new THREE.Uniform(0),
    uMorphProgress: new THREE.Uniform(0),
    uNormalizedProgress: new THREE.Uniform(0),
    uModelIndex: new THREE.Uniform(-1),
  },
  vertexShader,
  fragmentShader
);

extend({ RenderMaterial });
