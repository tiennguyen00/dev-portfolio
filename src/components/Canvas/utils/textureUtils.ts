import * as THREE from "three";

/**
 * Creates a position data texture from a Float32Array of positions
 * @param size The size of the texture (width/height)
 * @param positions The positions array
 * @returns THREE.DataTexture containing position data
 */
export function createPositionTexture(
  size: number,
  positions: Float32Array
): THREE.DataTexture {
  const data = new Float32Array(size * size * 4);

  for (let i = 0; i < size * size; i++) {
    data[i * 4] = positions[i * 3]; // R: x position
    data[i * 4 + 1] = positions[i * 3 + 1]; // G: y position
    data[i * 4 + 2] = positions[i * 3 + 2]; // B: z position
    data[i * 4 + 3] = 1.0; // A: set to 1 (full)
  }

  // Create the data texture
  const texture = new THREE.DataTexture(
    data,
    size,
    size,
    THREE.RGBAFormat,
    THREE.FloatType
  );

  texture.needsUpdate = true;
  return texture;
}

/**
 * Resamples position data to fit the target size
 * @param sourcePositions Original positions array
 * @param targetSize Size of the target grid
 * @returns Resampled positions as Float32Array
 */
export function resamplePositions(
  sourcePositions: number[],
  targetSize: number
): Float32Array {
  const sourceCount = sourcePositions.length / 3;
  const targetCount = targetSize * targetSize;

  // Create the output array
  const result = new Float32Array(targetCount * 3);

  // Handle case when we have more target points than source
  if (targetCount >= sourceCount) {
    // Copy all available positions
    for (let i = 0; i < sourceCount; i++) {
      result[i * 3] = sourcePositions[i * 3];
      result[i * 3 + 1] = sourcePositions[i * 3 + 1];
      result[i * 3 + 2] = sourcePositions[i * 3 + 2];
    }

    // For any extra points, duplicate last positions with small offsets
    for (let i = sourceCount; i < targetCount; i++) {
      const sourceIndex = i % sourceCount;
      result[i * 3] =
        sourcePositions[sourceIndex * 3] + (Math.random() - 0.5) * 0.1;
      result[i * 3 + 1] =
        sourcePositions[sourceIndex * 3 + 1] + (Math.random() - 0.5) * 0.1;
      result[i * 3 + 2] =
        sourcePositions[sourceIndex * 3 + 2] + (Math.random() - 0.5) * 0.1;
    }
  } else {
    // We have more source points than target, so sample them
    const stride = Math.floor(sourceCount / targetCount);
    for (let i = 0; i < targetCount; i++) {
      const sourceIndex = i * stride;
      if (sourceIndex < sourceCount) {
        result[i * 3] = sourcePositions[sourceIndex * 3];
        result[i * 3 + 1] = sourcePositions[sourceIndex * 3 + 1];
        result[i * 3 + 2] = sourcePositions[sourceIndex * 3 + 2];
      }
    }
  }

  return result;
}
