import { useGLTF } from "@react-three/drei";
import { button, useControls } from "leva";
import { useRef, useState } from "react";
import * as THREE from "three";

import { useAnimations } from "@/hooks/useAnimations";
import { useMorphTargets } from "@/hooks/useMorphTargets";
import { useBlinkSystem } from "@/hooks/useBlinkSystem";
import { useLoadAnimations } from "@/hooks/useLoadAnimations";

import type { AvatarProps } from "@/types";
import { avatarModel } from "@/constants";
import { GLTFResult } from "@/types/avatar";
import { useFrame } from "@react-three/fiber";

export function Avatar(props: AvatarProps) {
  const gltfData = useGLTF(avatarModel) as GLTFResult;   
  const { nodes, materials, scene } = gltfData;
  
  const { 
    animations, 
  } = useLoadAnimations();
    
  const group = useRef<THREE.Group>(null);
  
  
  const animationControls = useAnimations({ 
    animations, 
    group 
  });
  
  const morphTargetControls = useMorphTargets(scene);
  const { animateBlink } = morphTargetControls;
  
  useBlinkSystem(animateBlink);
  
  const [avatarPosition] = useState<[number, number, number]>([0, -0.5, -2.4]);
  const [avatarScale] = useState<[number, number, number]>([1.5, 1.5, 1.5]);
  
  useControls("Available Animations", () => {
    const controls: Record<string, any> = {};
    
    animations.forEach(anim => {
      controls[anim.name] = button(() => {
        animationControls.playAnimation(anim.name);
      });
    });
    
    return controls;
  });


  useControls("Facial Controls", {
    blink: button(() => {
      morphTargetControls.animateBlink();
    }),
    winkLeft: button(() => {
      morphTargetControls.animateWink('left');
    }),
    winkRight: button(() => {
      morphTargetControls.animateWink('right');
    }),
    resetFace: button(() => {
      morphTargetControls.resetAllMorphTargets();
    }),
  });
  
  // Animation frame update
  useFrame((_, delta) => {
    try {
      // Update animation mixer
      if (animationControls.updateMixer) {
        animationControls.updateMixer(delta);
      }
    } catch (error) {
      console.error('Error in useFrame:', error);
    }
  });

  return (
    <group 
      {...props} 
      dispose={null} 
      ref={group} 
      position={avatarPosition} 
      scale={avatarScale}
    >
      <primitive object={nodes.Hips} />
      
      <skinnedMesh
        name="Wolf3D_Body"
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      
      <skinnedMesh
        name="Wolf3D_Outfit_Bottom"
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      
      <skinnedMesh
        name="Wolf3D_Outfit_Footwear"
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      
      <skinnedMesh
        name="Wolf3D_Outfit_Top"
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      
      <skinnedMesh
        name="Wolf3D_Hair"
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

// Preload models
useGLTF.preload(avatarModel);

  // Individual GLB animations are preloaded in useLoadAnimations hook
