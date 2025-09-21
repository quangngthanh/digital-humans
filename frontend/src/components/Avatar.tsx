import { useGLTF } from "@react-three/drei";
import { button, useControls } from "leva";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useMorphTargets } from "@/hooks/useMorphTargets";
import { useBlinkSystem } from "@/hooks/useBlinkSystem";
import { useLoadAnimations } from "@/hooks/useLoadAnimations";
import { useChatContext } from "@/hooks/useChatContext";

// Types and constants
import type { AvatarProps } from "@/types";
import { avatarModel } from "@/constants";
import { GLTFResult } from "@/types/avatar";

import { useAvatar } from "@/hooks/useAvatar";

export function Avatar(props: AvatarProps) {
  const gltfData = useGLTF(avatarModel) as GLTFResult;   
  const { nodes, materials, scene } = gltfData;

  // Load animations
  const { animations } = useLoadAnimations();
    
  const group = useRef<THREE.Group>(null);
  
  const morphTargetControls = useMorphTargets(scene);
  const { animateBlink } = morphTargetControls;

  // Blink system (independent)
  useBlinkSystem(animateBlink);

  // Chat context (for testing)
  const { sendMessage, messages, onMessagePlayed } = useChatContext();

  const avatar = useAvatar(group, animations, morphTargetControls);

  useEffect(() => {
    console.log('🔧 Message handler:', messages.length, 'Avatar ready:', avatar.state.isInitialized);
    if (messages.length > 0 && avatar.state.isInitialized && !avatar.state.isSpeaking) {
      const message = messages[0];
      // Use real speech processing
      avatar.controls.speak(message).then((success) => {
        console.log('✅ Speech completed:', success);
        onMessagePlayed();
      }).catch((error) => {
        console.error('❌ Speech error:', error);
        onMessagePlayed();
      });
    } else if (messages.length > 0) {
      console.log('🔧 Skipping message - already speaking or not ready');
    }
  }, [messages, avatar.state.isInitialized, avatar.state.isSpeaking, onMessagePlayed, avatar.controls]);

  // ============================================================================
  // UI CONTROLS & DEBUGGING
  // ============================================================================
  
  const [avatarPosition] = useState<[number, number, number]>([0, -0.5, -2.4]);
  const [avatarScale] = useState<[number, number, number]>([1.5, 1.5, 1.5]);
  
  // Debug controls
  useControls("Avatar System (+ Animations)", {
    // Chat testing
    testChat: button(() => {
      console.log('🔧 test chat clicked');
      sendMessage('Hello, em có khỏe không ?');
    }),
    
    
    showStatus: button(() => {
      const metrics = avatar.controls.getPerformanceMetrics();
      console.log('🔧 Avatar Status:', metrics);
    }),
  });

  // ============================================================================
  // ANIMATION FRAME UPDATE
  // ============================================================================
  
  useFrame((_, delta) => {
    try {
      avatar.controls.updateMixer(delta);
    } catch (error) {
      console.error('Error in useFrame:', error);
    }
  });

  // ============================================================================
  // STATUS LOGGING
  // ============================================================================
  
  useEffect(() => {
    if (avatar.state.isInitialized) {
      console.log('✅ Avatar Ready:', {
        initialized: avatar.state.isInitialized,
        error: avatar.state.error
      });
    }
  }, [avatar.state]);

  // ============================================================================
  // RENDER AVATAR MODEL
  // ============================================================================

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
