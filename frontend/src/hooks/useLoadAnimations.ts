import { useGLTF } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";

// Function to get all GLB files from animations directory
function getAllGlbFiles(): string[] {
  // List of all GLB files in the animations directory
  // This should be updated when new animation files are added
  return [
    '/animations/Laughing.glb',
    '/animations/Looking.glb',
    '/animations/Talking_0.glb',
    '/animations/Talking_1.glb',
    '/animations/Talking_2.glb',
    '/animations/Thankful.glb',
    '/animations/Thinking.glb',
    '/animations/Walking.glb',
    '/animations/BreathingIdle.glb',
    '/animations/Standing.glb',
  ];
}

export interface LoadedAnimation {
  name: string;
  clip: THREE.AnimationClip;
  source: string;
}

export interface LoadAnimationsData {
  animations: THREE.AnimationClip[];
  loadedAnimations: LoadedAnimation[];
  isLoading: boolean;
  loadedCount: number;
  totalCount: number;
}

export function useLoadAnimations(): LoadAnimationsData {
  // Dynamically get all GLB files from the animations directory
  const glbFiles = getAllGlbFiles();
  
  // Use useGLTF for each file
  const loadedGLTFs = glbFiles.map(filePath => {
    try {
      return {
        path: filePath,
        data: useGLTF(filePath),
        error: null
      };
    } catch (error) {
      console.warn(`Failed to load GLB: ${filePath}`, error);
      return {
        path: filePath,
        data: null,
        error
      };
    }
  });

  // Process loaded animations - use a more stable dependency
  const processedAnimations = useMemo(() => {
    const animations: THREE.AnimationClip[] = [];
    const loadedAnimations: LoadedAnimation[] = [];
    
    loadedGLTFs.forEach(({ path, data, error }) => {
      if (error || !data) {
        console.warn(`Skipping failed GLB: ${path}`);
        return;
      }
      const fileName = path.split('/').pop()?.replace('.glb', '') || 'Unknown';
      if (data.animations && data.animations.length > 0) {
        const clip = data.animations[0];
        
        const clonedClip = clip.clone();
        clonedClip.name = fileName;
        
        animations.push(clonedClip);
        loadedAnimations.push({
          name: fileName,
          clip: clonedClip,
          source: path
        });
      }
    });

    return { animations, loadedAnimations };
  }, [loadedGLTFs.map(g => g.path).join(',')]); // Use path string as dependency instead of full object

  // Calculate loading stats
  const loadedCount = loadedGLTFs.filter(({ data, error }) => data && !error).length;
  const totalCount = glbFiles.length;
  const isLoading = loadedCount < totalCount;


  return {
    animations: processedAnimations.animations,
    loadedAnimations: processedAnimations.loadedAnimations,
    isLoading,
    loadedCount,
    totalCount
  };
}

// Preload all individual GLB files from animations directory
const allGlbFiles =getAllGlbFiles();

allGlbFiles.forEach(filePath => {
  useGLTF.preload(filePath);
});
