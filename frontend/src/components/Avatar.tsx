import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { useChat } from "@/hooks/useChat";
import type { GLTF } from "three-stdlib";
import type { AvatarProps } from "@/types";
import { animationsModel, avatarModel, facialExpressions, corresponding } from "@/constant";
import { GLTFResult } from "@/types/avatar";
import { LipsyncData } from "@/types/avatar";

let setupMode = false;

export function Avatar(props: AvatarProps) {
  const { nodes, materials, scene } = useGLTF(
      avatarModel
  ) as GLTFResult;

  const chatContext = useChat() as any;
  const { message, onMessagePlayed, sendMessage } = chatContext;

  const [lipsync, setLipsync] = useState<LipsyncData | undefined>();
  const [audio, setAudio] = useState<HTMLAudioElement | undefined>();

  // Animation states
  const [blink, setBlink] = useState<boolean>(false);
  const [winkLeft, setWinkLeft] = useState<boolean>(false);
  const [winkRight, setWinkRight] = useState<boolean>(false);
  const [facialExpression, setFacialExpression] = useState<string>("");

  // Animation setup
  const animationsGltf = useGLTF(animationsModel) as GLTF & {
    animations: THREE.AnimationClip[];
  };
  
  const { animations } = animationsGltf;
  const group = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, group);
  
  // Safe animation selection
  const getDefaultAnimation = (): string => {
    if (animations.length === 0) return "Idle";
    const idleAnimation = animations.find((a) => a.name === "Idle");
    return idleAnimation ? "Idle" : animations[0].name;
  };

  const [animation, setAnimation] = useState<string>(getDefaultAnimation());

  // Handle message changes
  useEffect(() => {
    if (!message) {
      setAnimation(getDefaultAnimation());
      return;
    }

    console.log('New message received:', message);
    
    // Set animation and facial expression
    if (message.animation && animations.find(a => a.name === message.animation)) {
      setAnimation(message.animation);
    }
    
    if (message.facialExpression) {
      setFacialExpression(message.facialExpression);
    }
    
    if (message.lipsync) {
      setLipsync(message.lipsync);
    }
    
    // Handle audio
    if (message.audio) {
      try {
        const audioElement = new Audio("data:audio/mp3;base64," + message.audio);
        audioElement.onloadeddata = () => {
          audioElement.play().catch(console.error);
        };
        audioElement.onended = onMessagePlayed;
        audioElement.onerror = (error) => {
          console.error('Audio playback error:', error);
          onMessagePlayed?.(); // Still call onMessagePlayed even if audio fails
        };
        setAudio(audioElement);
      } catch (error) {
        console.error('Audio creation error:', error);
        onMessagePlayed?.();
      }
    }
  }, [message, onMessagePlayed, animations]);

  // Handle animation changes with safety checks
  useEffect(() => {
    if (!actions || !animation || !actions[animation]) {
      return;
    }

    try {
      const action = actions[animation];
      action.reset().fadeIn(mixer.time > 0 ? 0.5 : 0).play();
      
      return () => {
        if (action && action.isRunning()) {
          action.fadeOut(0.5);
        }
      };
    } catch (error) {
      console.error('Animation error:', error);
    }
  }, [animation, actions, mixer]);

  // Improved morphTarget function with error handling
  const lerpMorphTarget = useCallback((target: string, value: number, speed = 0.1): void => {
    if (!scene) return;

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
  }, [scene]);

  // Main animation loop
  useFrame(() => {
    if (!nodes.EyeLeft?.morphTargetDictionary) return;

    // Apply facial expressions
    if (!setupMode) {
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // Handle separately
        }
        if (mapping && mapping[key] !== undefined) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });
    }

    // Handle blinking
    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // Handle lipsync
    if (setupMode || !message || !lipsync || !audio) {
      Object.values(corresponding).forEach((value) => {
        lerpMorphTarget(value, 0, 0.1);
      });
      return;
    }

    const appliedMorphTargets: string[] = [];
    const currentAudioTime = audio.currentTime;
    
    for (let i = 0; i < lipsync.mouthCues.length; i++) {
      const mouthCue = lipsync.mouthCues[i];
      if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
        const morphTarget = corresponding[mouthCue.value];
        if (morphTarget) {
          appliedMorphTargets.push(morphTarget);
          lerpMorphTarget(morphTarget, 1, 0.2);
        }
        break;
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (!appliedMorphTargets.includes(value)) {
        lerpMorphTarget(value, 0, 0.1);
      }
    });
  });

  // Development controls (only in development)
  const animationOptions = animations.length > 0 ? animations.map((a) => a.name) : ['Idle'];
  
  useControls("FacialExpressions", {
    testChat: button(() => {
      if (sendMessage) {
        sendMessage("Hello, this is a test message!");
      }
    }),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animationOptions,
      onChange: (value: string) => setAnimation(value),
    },
    facialExpression: {
      value: facialExpression,
      options: Object.keys(facialExpressions),
      onChange: (value: string) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
  });

  // Blinking effect
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    
    const nextBlink = (): void => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  return (
    <group {...props} dispose={null} ref={group}>
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

useGLTF.preload(avatarModel);
useGLTF.preload(animationsModel);
