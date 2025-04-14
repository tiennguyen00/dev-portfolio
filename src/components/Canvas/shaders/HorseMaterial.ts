/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
import { shaderMaterial } from "@react-three/drei";
import { extend } from "@react-three/fiber";
import horseVertexShader from "./horse/vertex.vert";
import horseFragmentShader from "./horse/fragment.frag";
import * as THREE from "three";

const HorseMaterial = shaderMaterial(
  {
    uSize: { value: 2 },
    uTime: { value: 0 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uScroll: { value: 0.75 },
    uRange: { value: 0.25 },
    uTotalModels: { value: 4 },
  },
  horseVertexShader,
  horseFragmentShader
);

extend({ HorseMaterial });
