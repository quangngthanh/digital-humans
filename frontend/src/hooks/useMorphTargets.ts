import { useCallback } from 'react';
import * as THREE from 'three';

export interface MorphTargetControls {
  lerpMorphTarget: (target: string, value: number, speed?: number) => void;
  setMorphTarget: (target: string, value: number) => void;
  resetAllMorphTargets: () => void;
  animateBlink: (duration?: number) => void;
  animateWink: (eye: 'left' | 'right', duration?: number) => void;
}

export function useMorphTargets(scene: THREE.Object3D | null): MorphTargetControls {
  
  // Smoothly interpolate morph target value
  const lerpMorphTarget = useCallback((target: string, value: number, speed = 0.1): void => {
    if (!scene) return;
    
    try {
      scene.traverse((child) => {
        const mesh = child as unknown as THREE.SkinnedMesh;
        if (mesh.isSkinnedMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const index = mesh.morphTargetDictionary[target];
          if (index !== undefined && mesh.morphTargetInfluences[index] !== undefined) {
            mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
              mesh.morphTargetInfluences[index],
              value,
              speed
            );
          }
        }
      });
    } catch (error) {
      console.error('Error in lerpMorphTarget:', error);
    }
  }, [scene]);

  // Directly set morph target value
  const setMorphTarget = useCallback((target: string, value: number): void => {
    if (!scene) return;
    
    try {
      scene.traverse((child) => {
        const mesh = child as unknown as THREE.SkinnedMesh;
        if (mesh.isSkinnedMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
          const index = mesh.morphTargetDictionary[target];
          if (index !== undefined && mesh.morphTargetInfluences[index] !== undefined) {
            mesh.morphTargetInfluences[index] = value;
          }
        }
      });
    } catch (error) {
      console.error('Error in setMorphTarget:', error);
    }
  }, [scene]);

  // Reset all morph targets to 0
  const resetAllMorphTargets = useCallback((): void => {
    if (!scene) return;
    
    try {
      scene.traverse((child) => {
        const mesh = child as unknown as THREE.SkinnedMesh;
        if (mesh.isSkinnedMesh && mesh.morphTargetInfluences) {
          for (let i = 0; i < mesh.morphTargetInfluences.length; i++) {
            mesh.morphTargetInfluences[i] = 0;
          }
        }
      });
    } catch (error) {
      console.error('Error in resetAllMorphTargets:', error);
    }
  }, [scene]);

  // Animate blink (both eyes)
  const animateBlink = useCallback((duration = 200): void => {
    lerpMorphTarget("eyeBlinkLeft", 1, 1);
    lerpMorphTarget("eyeBlinkRight", 1, 1);
    
    setTimeout(() => {
      lerpMorphTarget("eyeBlinkLeft", 0, 1);
      lerpMorphTarget("eyeBlinkRight", 0, 1);
    }, duration);
  }, [lerpMorphTarget]);

  // Animate wink (single eye)
  const animateWink = useCallback((eye: 'left' | 'right', duration = 300): void => {
    const target = eye === 'left' ? "eyeBlinkLeft" : "eyeBlinkRight";
    lerpMorphTarget(target, 1, 1);
    
    setTimeout(() => {
      lerpMorphTarget(target, 0, 1);
    }, duration);
  }, [lerpMorphTarget]);

  return {
    lerpMorphTarget,
    setMorphTarget,
    resetAllMorphTargets,
    animateBlink,
    animateWink,
  };
}
