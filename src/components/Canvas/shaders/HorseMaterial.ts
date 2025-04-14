/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import horseVertexShader from "./horse/vertex.vert";
import horseFragmentShader from "./horse/fragment.frag";
import * as THREE from "three";

const HorseMaterial = shaderMaterial(
  {
    uSize: new THREE.Uniform(2),
    uTime: new THREE.Uniform(0),
    uPixelRatio: new THREE.Uniform(Math.min(window.devicePixelRatio, 2)),
    uScroll: new THREE.Uniform(0.75),
    uRange: new THREE.Uniform(0.25),
    uTotalModels: new THREE.Uniform(4),
  },
  horseVertexShader,
  horseFragmentShader
);

extend({ HorseMaterial });
